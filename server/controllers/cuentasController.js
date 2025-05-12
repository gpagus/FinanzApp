const supabase = require('../config/supabaseClient');

const obtenerCuentas = async (req, res) => {
    const userId = req.user.id;

    const {data, error} = await supabase
        .from('cuentas')
        .select('*')
        .eq('user_id', userId);

    if (error) return res.status(500).json({error: error.message});
    res.json(data);
};

const crearCuenta = async (req, res) => {
    const userId = req.user.id;
    const LIMITE_CUENTAS = 10; // Límite máximo de cuentas por usuario

    try {
        // Verificar el número de cuentas existentes del usuario
        const { count, error: countError } = await supabase
            .from('cuentas')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (countError) return res.status(500).json({ error: countError.message });

        if (count >= LIMITE_CUENTAS) {
            return res.status(400).json({ error: `No puedes tener más de ${LIMITE_CUENTAS} cuentas.` });
        }

        // Crear la nueva cuenta
        const nuevaCuenta = {
            ...req.body,
            user_id: userId,
        };

        const { data, error } = await supabase
            .from('cuentas')
            .insert([nuevaCuenta])
            .select();

        if (error) return res.status(500).json({ error: error.message });

        res.status(201).json(data[0]);
    } catch (err) {
        console.error("Error en crearCuenta:", err.message);
        return res.status(400).json({ error: err.message || 'Datos inválidos' });
    }
};

const actualizarCuenta = async (req, res) => {
    const userId = req.user.id;
    const cuentaId = req.params.id;

    try {
        const {data, error} = await supabase
            .from('cuentas')
            .update(req.body)
            .eq('id', cuentaId)
            .eq('user_id', userId)
            .select();

        if (error) return res.status(500).json({error: error.message});
        if (!data || data.length === 0) {
            return res.status(404).json({error: 'Cuenta no encontrada o no autorizada'});
        }

        res.json(data[0]);
    } catch (err) {
        return res.status(400).json({error: err.errors?.[0]?.message || 'Datos inválidos'});
    }
};

const eliminarCuenta = async (req, res) => {
    const userId = req.user.id;
    const cuentaId = req.params.id;

    const {data, error} = await supabase
        .from('cuentas')
        .delete()
        .eq('id', cuentaId)
        .eq('user_id', userId);

    if (error) return res.status(500).json({error: error.message});

    res.json({mensaje: 'Cuenta eliminada'});
};

module.exports = {
    obtenerCuentas,
    crearCuenta,
    actualizarCuenta,
    eliminarCuenta
};
