const supabase = require('../config/supabaseClient');
const supabaseAdmin = require('../config/supabaseAdmin');
const logService = require('../services/logService');
const path = require('path');
const fs = require('fs');

const register = async (req, res) => {
    const {email, password, nombre, apellidos} = req.body;

    const avatarFile = req.file || null;
    let sanitizedFileName = null;
    let avatarPath = null;

    try {
        const {data, error} = await supabase.auth.signUp({email, password});

        // Verificar si el correo ya está pendiente de confirmación
        const {data: existingUser} = await supabaseAdmin
            .from('usuarios_pendientes')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({
                error: "Ya has iniciado el registro. Revisa tu correo y confirma tu cuenta para continuar.",
            });
        }

        if (data?.user && !data?.user?.identities?.length && !error) {
            // Usuario ya existe y está confirmado → se devuelve sin identities
            return res.status(400).json({
                error: "Este correo ya fue confirmado. Inicia sesión directamente.",
            });

        } else if (error) {
            return res.status(400).json({error: error.message});
        }

        if (avatarFile) {

            const extension = path.extname(avatarFile.originalname);
            sanitizedFileName = `avatar${extension}`;
            const fileBuffer = fs.readFileSync(avatarFile.path);
            avatarPath = `user_${email}/${sanitizedFileName}`;

            const {error: uploadError} = await supabaseAdmin.storage
                .from('avatars')
                .upload(`user_${email}/${sanitizedFileName}`, fileBuffer, {
                    contentType: avatarFile.mimetype,
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                return res.status(500).json({error: uploadError.message});
            }

            // Eliminar el archivo temporal
            fs.unlink(avatarFile.path, (err) => {
                if (err) {
                    console.error('Error al eliminar el archivo temporal:', err);
                }
            });

        }

        // Guardar datos temporales
        const {error: tempError} = await supabaseAdmin
            .from('usuarios_pendientes')
            .upsert({email, nombre, apellidos, avatar: avatarPath});

        if (tempError) {
            return res.status(500).json({error: 'No se pudieron guardar los datos temporales.'});
        }

        return res.status(200).json({
            message: 'Registro exitoso. Confirma tu correo antes de iniciar sesión.',
        });

    } catch (err) {
        console.error('Error en el registro:', err);
        return res.status(500).json({error: 'Error interno del servidor.'});
    }
};

const login = async (req, res) => {
    const {email, password} = req.body;

    try {
        const {data, error} = await supabase.auth.signInWithPassword({email, password});

        if (error) {
            if (error.message.includes("Invalid login credentials")) {
                return res.status(401).json({error: 'Credenciales inválidas. Inténtalo de nuevo.'});
            }
            if (error.message.includes("Email not confirmed")) {
                return res.status(401).json({error: 'Debes confirmar tu correo antes de iniciar sesión.'});
            }
            return res.status(400).json({error: error.message});
        }

        const user = data.user;
        const userId = user.id;

        //  Verificar si ya existe perfil
        const {data: perfilExistente} = await supabase
            .from('usuarios')
            .select('id, estado')
            .eq('id', userId)
            .single();

        if (perfilExistente) {
            if (!perfilExistente.estado) {
                // Registrar intento de login con cuenta desactivada
                await logService.registrarOperacion({
                    usuario_id: userId,
                    accion: 'login_rechazado',
                    descripcion: `Intento de inicio de sesión con cuenta desactivada.`,
                    detalles: {
                        fecha: new Date().toISOString(),
                        motivo: 'cuenta_desactivada'
                    }
                });
                
                return res.status(403).json({error: 'Su cuenta se ecuentra desactivada por el administrador.'});
            }

            // Actualizar último acceso
            const {error: updateError} = await supabase
                .from('usuarios')
                .update({lastAccess: new Date()})
                .eq('id', userId);

            if (updateError) {
                console.warn('Error actualizando lastAccess:', updateError.message);
            }

            // Registrar operación de inicio de sesión
            await logService.registrarOperacion({
                usuario_id: userId,
                accion: 'login',
                descripcion: `Inicio de sesión exitoso.`,
                detalles: {
                    fecha: new Date().toISOString()
                }
            });
        }

        return res.json(data);
    } catch (err) {
        console.error('Error interno en login:', err);
        return res.status(500).json({error: 'Error interno del servidor.'});
    }
};

const confirmarRegistro = async (req, res) => {
    const {token} = req.body;

    if (!token) {
        return res.status(400).json({error: 'Falta el token de acceso.'});
    }

    try {
        // Verificamos el token y obtenemos al usuario
        const {data: {user}, error: userError} = await supabase.auth.getUser(token);

        if (userError || !user) {
            return res.status(401).json({error: 'Token inválido o expirado.'});
        }

        const userId = user.id;
        const userEmail = user.email;

        // Buscamos si ya tiene un perfil en la tabla final
        const {data: perfilExistente} = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', userId)
            .single();

        if (perfilExistente) {
            return res.status(400).json({error: 'Este usuario ya tiene perfil creado.'});
        }

        // 1. Obtener datos temporales
        const {data: tempData, error: tempFetchError} = await supabaseAdmin
            .from('usuarios_pendientes')
            .select('nombre, apellidos, avatar')
            .eq('email', userEmail)
            .single();

        if (tempFetchError || !tempData) {
            return res.status(500).json({error: 'Faltan datos temporales del registro.'});
        }

        const {nombre, apellidos, avatar} = tempData;

        // 2. Insertar en la tabla definitiva
        const {error: insertError} = await supabaseAdmin.from('usuarios').insert({
            id: userId,
            email: userEmail,
            nombre,
            apellidos,
            avatar,
            rol: 'usuario',
            estado: true,
            created_at: new Date(),
            lastAccess: new Date(),
        });

        if (insertError) {
            console.error('Error insertando perfil:', insertError.message);
            return res.status(500).json({error: 'No se pudo crear el perfil del usuario.'});
        }

        // 3. Registrar la operación en logs
        await logService.registrarOperacion({
            usuario_id: userId,
            accion: 'registro_confirmado',
            descripcion: `Usuario ${nombre} ${apellidos} completó su registro`,
            detalles: {
                email: userEmail,
                fecha: new Date().toISOString()
            }
        });

        // 4. Eliminar datos temporales
        await supabaseAdmin
            .from('usuarios_pendientes')
            .delete()
            .eq('email', userEmail);

        return res.status(200).json({message: 'Cuenta confirmada y perfil creado correctamente.'});

    } catch (err) {
        console.error('Error en la confirmación:', err);
        return res.status(500).json({error: 'Error interno del servidor.'});
    }
};


const obtenerPerfil = async (req, res) => {
    const userId = req.user.id;

    const {data, error} = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return res.status(500).json({error: error.message});

    res.json(data);
};

const recuperarContrasena = async (req, res) => {
    try {
        const {email} = req.body;

        // Verificar si el correo está pendiente de confirmación
        const {data: usuarioPendiente} = await supabaseAdmin
            .from('usuarios_pendientes')
            .select('email')
            .eq('email', email)
            .single();

        if (usuarioPendiente) {
            return res.status(400).json({
                error: "Primero debes confirmar tu registro. Revisa tu correo electrónico y confirma tu cuenta antes de poder recuperar la contraseña."
            });
        }

        // Verificar si el usuario existe en la tabla de usuarios confirmados
        const {data: usuarioExistente} = await supabaseAdmin
            .from('usuarios')
            .select('email')
            .eq('email', email)
            .single();

        if (!usuarioExistente) {
            return res.status(404).json({
                error: "No existe ninguna cuenta asociada a este correo electrónico."
            });
        }

        // Tratamos de enviar el email de recuperación
        const {error} = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.FRONTEND_URL}/restablecer-contrasena`,
        });

        if (error) {
            console.error("Error al enviar el correo de recuperación:", error);
            return res.status(400).json({error: error.message});
        }

        res.status(200).json({
            message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.',
        });

    } catch (error) {
        console.error("Error en recuperar contraseña:", error);
        res.status(400).json({error: error.message || "No se pudo procesar la solicitud"});
    }
};

const restablecerContrasena = async (req, res) => {
    try {
        const {token, password} = req.body;

        // Usar el token para actualizar la contraseña
        const {error} = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'recovery',
        });

        if (error) {
            if (error.message === "Email link is invalid or has expired") {
                return res.status(400).json({error: 'Token inválido o expirado.'});
            } else {
                console.error("Error al verificar el token:", error);
                return res.status(400).json({error: error.message});
            }
        }

        // Si la verificación fue exitosa, actualizar la contraseña
        const {error: updateError} = await supabase.auth.updateUser({
            password,
        });

        if (updateError) {
            if (updateError.message === "New password should be different from the old password.") {
                return res.status(400).json({error: 'La contraseña debe ser diferente a la anterior.'});
            } else return res.status(400).json({error: updateError.message});
        }

        // Si todo fue exitoso, enviar respuesta
        res.status(200).json({
            message: 'Contraseña actualizada correctamente, prueba ahora a iniciar sesión.',
        });

    } catch (error) {
        console.error("Error al restablecer contraseña:", error);
        res.status(400).json({error: error.message || "No se pudo restablecer la contraseña"});
    }
};

const refreshToken = async (req, res) => {
    const {refresh_token} = req.body;

    if (!refresh_token) {
        return res.status(400).json({error: 'No se proporcionó refresh token.'});
    }

    try {
        const {data, error} = await supabase.auth.refreshSession({refresh_token});

        if (error) {
            return res.status(401).json({error: 'No se pudo renovar la sesión.'});
        }

        const {session, user} = data;

        return res.status(200).json({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            user,
        });
    } catch (err) {
        console.error('Error al renovar la sesión:', err);
        return res.status(500).json({error: 'Error interno del servidor.'});
    }
};

const cambiarContrasena = async (req, res) => {
    const userId = req.user.id;
    const {currentPassword, newPassword} = req.body;

    try {
        // Verificar la contraseña actual
        const {data, error} = await supabase.auth.signInWithPassword({
            email: req.user.email,
            password: currentPassword
        });

        if (error) {
            return res.status(401).json({error: 'La contraseña actual es incorrecta'});
        }

        // Actualizar la contraseña
        const {data: updateData, error: updateError} = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            if (updateError.message === "New password should be different from the old password.") {
                return res.status(400).json({error: 'La nueva contraseña debe ser diferente a la anterior.'});
            } else return res.status(400).json({error: updateError.message});
        }

        // 📝 Log para cambio de contraseña
        await logService.registrarOperacion({
            usuario_id: userId,
            accion: 'cambiar_contrasena',
            descripcion: 'Contraseña actualizada correctamente',
            detalles: {
                fecha: new Date().toISOString()
            }
        });

        // Iniciar sesión de nuevo con la nueva contraseña para obtener nuevos tokens
        const {data: newSessionData, error: sessionError} = await supabase.auth.signInWithPassword({
            email: req.user.email,
            password: newPassword
        });

        if (sessionError) {
            return res.status(500).json({error: 'Error al generar nueva sesión'});
        }

        // Devolver la nueva sesión
        return res.status(200).json({
            message: 'Contraseña actualizada',
            session: newSessionData.session
        });
    } catch (err) {
        console.error('Error al cambiar contraseña:', err);
        return res.status(500).json({error: 'Error interno del servidor'});
    }
};

const actualizarPerfil = async (req, res) => {
    const userId = req.user.id;
    const {nombre, apellidos} = req.body;
    const deleteAvatar = req.body.deleteAvatar === "true";
    const avatarFile = req.file || null;
    let avatarPath = null;

    try {
        // Obtener el perfil actual para recuperar el email y avatar actual
        const {data: perfilActual, error: perfilError} = await supabase
            .from('usuarios')
            .select('email, avatar, nombre, apellidos')
            .eq('id', userId)
            .single();

        if (perfilError) {
            return res.status(400).json({error: perfilError.message});
        }

        const datosActualizar = {nombre, apellidos};
        const cambios = [];

        // Detectar cambios en nombre y apellidos
        if (nombre !== perfilActual.nombre) {
            cambios.push(`nombre: "${perfilActual.nombre}" → "${nombre}"`);
        }
        if (apellidos !== perfilActual.apellidos) {
            cambios.push(`apellidos: "${perfilActual.apellidos}" → "${apellidos}"`);
        }

        if (deleteAvatar && perfilActual.avatar) {
            // Eliminar archivo del bucket
            const {error: deleteError} = await supabaseAdmin.storage
                .from('avatars')
                .remove([perfilActual.avatar]);

            if (deleteError) {
                console.error('Error al eliminar avatar:', deleteError);
                // Continuamos aunque haya error al eliminar
            }

            // Establecer el avatar como null en la base de datos
            datosActualizar.avatar = null;
            cambios.push('avatar eliminado');
        } else if (avatarFile) {
            const extension = path.extname(avatarFile.originalname);
            const sanitizedFileName = `avatar${extension}`;
            const fileBuffer = fs.readFileSync(avatarFile.path);
            avatarPath = `user_${perfilActual.email}/${sanitizedFileName}`;

            // Si existe un avatar anterior, lo eliminamos
            if (perfilActual.avatar) {
                // Eliminar archivo anterior del bucket
                const {error: deleteError} = await supabaseAdmin.storage
                    .from('avatars')
                    .remove([perfilActual.avatar]);

                if (deleteError) {
                    console.error('Error al eliminar avatar anterior:', deleteError);
                    // Continuamos aunque haya error al eliminar
                }
            }

            // Subir archivo a Supabase Storage
            const {error: uploadError} = await supabaseAdmin.storage
                .from('avatars')
                .upload(avatarPath, fileBuffer, {
                    contentType: avatarFile.mimetype,
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) {
                return res.status(500).json({error: uploadError.message});
            }

            // Eliminar el archivo temporal
            fs.unlink(avatarFile.path, (err) => {
                if (err) {
                    console.error('Error al eliminar el archivo temporal:', err);
                }
            });

            // Añadir la ruta del avatar a los datos a actualizar
            datosActualizar.avatar = `${avatarPath}?t=${Date.now()}`;
            cambios.push(perfilActual.avatar ? 'avatar actualizado' : 'avatar añadido');
        }

        // Actualizar el perfil con los datos
        const {error} = await supabase
            .from('usuarios')
            .update(datosActualizar)
            .eq('id', userId);

        if (error) {
            return res.status(400).json({error: error.message});
        }

        // 📝 Log para actualización de perfil (solo si hay cambios)
        if (cambios.length > 0) {
            await logService.registrarOperacion({
                usuario_id: userId,
                accion: 'actualizar_perfil',
                descripcion: `Perfil actualizado: ${cambios.join(', ')}`,
                detalles: {
                    cambios: {
                        nombre_anterior: perfilActual.nombre,
                        apellidos_anterior: perfilActual.apellidos,
                        nombre_nuevo: nombre,
                        apellidos_nuevo: apellidos,
                        avatar_cambio: deleteAvatar ? 'eliminado' : (avatarFile ? 'actualizado' : 'sin_cambio')
                    },
                    fecha: new Date().toISOString()
                }
            });
        }

        // Obtener el perfil actualizado para devolver al cliente
        const {data: userActualizado, error: fetchError} = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError) {
            return res.status(400).json({error: fetchError.message});
        }

        return res.status(200).json({
            message: 'Perfil actualizado',
            user: userActualizado
        });
    } catch (err) {
        console.error('Error al actualizar perfil:', err);
        return res.status(500).json({error: 'Error interno del servidor'});
    }
};
module.exports = {
    register,
    login,
    obtenerPerfil,
    confirmarRegistro,
    recuperarContrasena,
    restablecerContrasena,
    cambiarContrasena,
    actualizarPerfil,
    refreshToken
};
