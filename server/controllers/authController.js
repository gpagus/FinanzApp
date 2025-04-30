const supabase = require('../config/supabaseClient');
const supabaseAdmin = require('../config/supabaseAdmin');
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

        // 1. Verificar si ya existe perfil
        const {data: perfilExistente} = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', userId)
            .single();

        if (perfilExistente) {

            // 5. Actualizar último acceso
            const {error: updateError} = await supabase
                .from('usuarios')
                .update({lastAccess: new Date()})
                .eq('id', userId);

            if (updateError) {
                console.warn('Error actualizando lastAccess:', updateError.message);
            }
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

        // 3. Eliminar datos temporales
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

module.exports = {
    register, login, obtenerPerfil, confirmarRegistro, recuperarContrasena, restablecerContrasena, refreshToken
};
