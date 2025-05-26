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

module.exports = {
    obtenerUsuarios
    , obtenerUsuarioPorEmail
    , obtenerCuentasPorEmail
    , obtenerPresupuestosPorEmail
    , cambiarEstadoUsuario
    , obtenerLogsPorEmail
}