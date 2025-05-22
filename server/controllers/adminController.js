const supabaseAdmin = require('../config/supabaseAdmin');

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
        const { data: usuario, error: errorUsuario } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .eq('email', userEmail)
            .single();

        if (errorUsuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Luego buscamos sus cuentas
        const { data: cuentas, error } = await supabaseAdmin
            .from('cuentas')
            .select('*')
            .eq('user_id', usuario.id);

        if (error) return res.status(500).json({ error: error.message });

        res.json(cuentas);
    } catch (err) {
        console.error("Error al obtener cuentas:", err);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
};

const obtenerPresupuestosPorEmail = async (req, res) => {
    const userEmail = req.params.email;

    try {
        // Primero obtenemos el usuario por email
        const { data: usuario, error: errorUsuario } = await supabaseAdmin
            .from('usuarios')
            .select('id')
            .eq('email', userEmail)
            .single();

        if (errorUsuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        // Luego buscamos sus presupuestos
        const { data: presupuestos, error } = await supabaseAdmin
            .from('presupuestos')
            .select('*')
            .eq('user_id', usuario.id);

        if (error) return res.status(500).json({ error: error.message });

        res.json(presupuestos);
    } catch (err) {
        console.error("Error al obtener presupuestos:", err);
        res.status(500).json({ error: 'Error al procesar la solicitud' });
    }
};

module.exports = {
    obtenerUsuarios
    , obtenerUsuarioPorEmail
    , obtenerCuentasPorEmail
    , obtenerPresupuestosPorEmail
}