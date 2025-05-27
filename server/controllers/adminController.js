const supabaseAdmin = require('../config/supabaseAdmin');
const logService = require('../services/logService');

const obtenerUsuarios = async (req, res) => {
    try {
        const {data, error} = await supabaseAdmin
            .from('usuarios')
            .select('*')
            .neq('rol', 'admin'); // Excluir Admin

        if (error) {
            return res.status(500).json({error: error.message});
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
}

const obtenerUsuarioPorEmail = async (req, res) => {
    const {email} = req.params;

    try {
        const {data, error} = await supabaseAdmin
            .from('usuarios')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            return res.status(500).json({error: error.message});
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
}

const obtenerCuentasPorEmail = async (req, res) => {
    const userEmail = req.params.email;

    try {
        // Primero obtenemos el usuario por email
        const {data: usuario, error: errorUsuario} = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .eq('email', userEmail)
            .single();

        if (errorUsuario) return res.status(404).json({error: 'Usuario no encontrado'});

        // Luego buscamos sus cuentas
        const {data: cuentas, error} = await supabaseAdmin
            .from('cuentas')
            .select('*')
            .eq('user_id', usuario.id);

        if (error) return res.status(500).json({error: error.message});

        res.json(cuentas);
    } catch (err) {
        console.error("Error al obtener cuentas:", err);
        res.status(500).json({error: 'Error al procesar la solicitud'});
    }
};

const obtenerPresupuestosPorEmail = async (req, res) => {
    const userEmail = req.params.email;

    try {
        // Primero obtenemos el usuario por email
        const {data: usuario, error: errorUsuario} = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .eq('email', userEmail)
            .single();

        if (errorUsuario) return res.status(404).json({error: 'Usuario no encontrado'});

        // Luego buscamos sus presupuestos
        const {data: presupuestos, error} = await supabaseAdmin
            .from('presupuestos')
            .select('*')
            .eq('user_id', usuario.id);

        if (error) return res.status(500).json({error: error.message});

        res.json(presupuestos);
    } catch (err) {
        console.error("Error al obtener presupuestos:", err);
        res.status(500).json({error: 'Error al procesar la solicitud'});
    }
};

const cambiarEstadoUsuario = async (req, res) => {
    const {id} = req.params;
    const {estado} = req.body;

    if (estado === undefined) {
        return res.status(400).json({error: 'El estado del usuario es requerido'});
    }

    try {
        // Actualizar el estado del usuario en la base de datos
        const {data, error} = await supabaseAdmin
            .from('usuarios')
            .update({estado})
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(500).json({error: error.message});
        }

        if (!data) {
            return res.status(404).json({error: 'Usuario no encontrado'});
        }

        // Registrar la operación en el log
        await logService.registrarOperacion({
            usuario_id: id,
            accion: 'cambiar_estado_usuario',
            descripcion: `Estado del usuario cambiado a ${estado}`,
            detalles: {
                estado
            }
        });


        return res.status(200).json(data);
    } catch (err) {
        console.error("Error al cambiar estado del usuario:", err);
        return res.status(500).json({error: err.message});
    }
};

const obtenerLogsPorEmail = async (req, res) => {
    const userEmail = req.params.email;

    try {
        // Primero obtenemos el usuario por email
        const {data: usuario, error: errorUsuario} = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .eq('email', userEmail)
            .single();

        if (errorUsuario) return res.status(404).json({error: 'Usuario no encontrado'});

        // Luego buscamos sus logs
        const {data: logs, error} = await supabaseAdmin
            .from('logs')
            .select('*')
            .eq('usuario_id', usuario.id)
            .order('fecha', {ascending: false});

        if (error) return res.status(500).json({error: error.message});

        res.json(logs);
    } catch (err) {
        console.error("Error al obtener logs:", err);
        res.status(500).json({error: 'Error al procesar la solicitud'});
    }
};

const obtenerEstadisticas = async (req, res) => {
    try {
        // Usuarios activos (último acceso en los últimos 30 días)
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);
        
        const { data: usuariosActivos, error: errorActivos } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .neq('rol', 'admin')
            .gte('lastAccess', fechaLimite.toISOString());

        if (errorActivos) throw errorActivos;

        // Usuarios activos del mes pasado (acceso entre 30-60 días atrás)
        const fechaLimiteMesPasado = new Date();
        fechaLimiteMesPasado.setDate(fechaLimiteMesPasado.getDate() - 60);
        
        const fechaFinMesPasado = new Date();
        fechaFinMesPasado.setDate(fechaFinMesPasado.getDate() - 30);

        const { data: usuariosActivosMesPasado, error: errorActivosPasado } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .neq('rol', 'admin')
            .gte('lastAccess', fechaLimiteMesPasado.toISOString())
            .lt('lastAccess', fechaFinMesPasado.toISOString());

        if (errorActivosPasado) throw errorActivosPasado;

        // Total de usuarios
        const { data: totalUsuarios, error: errorTotal } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .neq('rol', 'admin');

        if (errorTotal) throw errorTotal;

        // Transacciones del mes actual
        const inicioMes = new Date();
        inicioMes.setDate(1);
        inicioMes.setHours(0, 0, 0, 0);

        const finMes = new Date();
        finMes.setMonth(finMes.getMonth() + 1);
        finMes.setDate(0);
        finMes.setHours(23, 59, 59, 999);

        const { data: transaccionesMes, error: errorTransacciones } = await supabaseAdmin
            .from('transacciones')
            .select('id')
            .gte('fecha', inicioMes.toISOString())
            .lte('fecha', finMes.toISOString());

        if (errorTransacciones) throw errorTransacciones;

        // Transacciones del mes pasado
        const inicioMesPasado = new Date();
        inicioMesPasado.setMonth(inicioMesPasado.getMonth() - 1);
        inicioMesPasado.setDate(1);
        inicioMesPasado.setHours(0, 0, 0, 0);

        const finMesPasado = new Date();
        finMesPasado.setDate(0);
        finMesPasado.setHours(23, 59, 59, 999);

        const { data: transaccionesMesPasado, error: errorTransaccionesPasado } = await supabaseAdmin
            .from('transacciones')
            .select('id')
            .gte('fecha', inicioMesPasado.toISOString())
            .lte('fecha', finMesPasado.toISOString());

        if (errorTransaccionesPasado) throw errorTransaccionesPasado;

        // Total de cuentas
        const { data: totalCuentas, error: errorCuentas } = await supabaseAdmin
            .from('cuentas')
            .select('id');

        if (errorCuentas) throw errorCuentas;

        // Calcular porcentaje de cambio en usuarios activos
        const usuariosActivosActual = usuariosActivos?.length || 0;
        const usuariosActivosAnterior = usuariosActivosMesPasado?.length || 0;
        
        let cambioUsuariosActivos = null;
        let tipoCambioUsuarios = 'porcentaje';
        
        if (usuariosActivosAnterior > 0) {
            cambioUsuariosActivos = ((usuariosActivosActual - usuariosActivosAnterior) / usuariosActivosAnterior) * 100;
            tipoCambioUsuarios = 'porcentaje';
        } else if (usuariosActivosActual > 0) {
            cambioUsuariosActivos = usuariosActivosActual;
            tipoCambioUsuarios = 'nuevo';
        } else {
            cambioUsuariosActivos = 0;
            tipoCambioUsuarios = 'sin_cambio';
        }

        // Calcular porcentaje de cambio en transacciones
        const transaccionesMesActual = transaccionesMes?.length || 0;
        const transaccionesMesAnterior = transaccionesMesPasado?.length || 0;
        
        let cambioTransacciones = null;
        let tipoCambioTransacciones = 'porcentaje';
        
        if (transaccionesMesAnterior > 0) {
            cambioTransacciones = ((transaccionesMesActual - transaccionesMesAnterior) / transaccionesMesAnterior) * 100;
            tipoCambioTransacciones = 'porcentaje';
        } else if (transaccionesMesActual > 0) {
            cambioTransacciones = transaccionesMesActual;
            tipoCambioTransacciones = 'nuevo';
        } else {
            cambioTransacciones = 0;
            tipoCambioTransacciones = 'sin_cambio';
        }

        const estadisticas = {
            usuariosActivos: usuariosActivosActual,
            usuariosActivosMesPasado: usuariosActivosAnterior,
            cambioUsuariosActivos: cambioUsuariosActivos ? Math.round(cambioUsuariosActivos * 100) / 100 : 0,
            tipoCambioUsuarios: tipoCambioUsuarios,
            totalUsuarios: totalUsuarios?.length || 0,
            transaccionesMes: transaccionesMesActual,
            transaccionesMesPasado: transaccionesMesAnterior,
            cambioTransacciones: cambioTransacciones ? Math.round(cambioTransacciones * 100) / 100 : 0,
            tipoCambioTransacciones: tipoCambioTransacciones,
            totalCuentas: totalCuentas?.length || 0
        };

        res.json(estadisticas);
    } catch (err) {
        console.error("Error al obtener estadísticas:", err);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
};

const healthCheck = async (req, res) => {
    try {
        // Verificar conexión a la base de datos
        const { data, error } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .limit(1);

        if (error) {
            throw error;
        }

        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
            uptime: process.uptime()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
};

const obtenerActividadReciente = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Obtener los últimos logs con información del usuario
        const { data: logs, error } = await supabaseAdmin
            .from('logs')
            .select(`
                *,
                usuarios!inner(
                    id,
                    nombre,
                    apellidos,
                    email
                )
            `)
            .neq('usuarios.rol', 'admin')
            .order('fecha', { ascending: false })
            .limit(parseInt(limit));

        if (error) throw error;

        res.json(logs);
    } catch (err) {
        console.error("Error al obtener actividad reciente:", err);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorEmail,
    obtenerCuentasPorEmail,
    obtenerPresupuestosPorEmail,
    cambiarEstadoUsuario,
    obtenerLogsPorEmail,
    obtenerEstadisticas,
    healthCheck,
    obtenerActividadReciente  // Añadimos el nuevo método
}