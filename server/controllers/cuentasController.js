const supabase = require('../config/supabaseClient');
const Cuenta = require('../models/cuenta');

const CuentaSchema = require('../models/schemas/cuentaSchema');

const obtenerCuentas = async (req, res) => {
    const userId = req.user.id;

    const { data, error } = await supabase
        .from('cuentas')
        .select('*')
        .eq('user_id', userId);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
};

const crearCuenta = async (req, res) => {
    const userId = req.user.id;

    try {
        const datosValidados = CuentaSchema.parse(req.body);
        const nuevaCuenta = new Cuenta({ user_id: userId, ...datosValidados });

        const { data, error } = await supabase
            .from('cuentas')
            .insert([nuevaCuenta])
            .select();

        if (error) return res.status(500).json({ error: error.message });
        res.status(201).json(data[0]);

    } catch (err) {
        return res.status(400).json({ error: err.errors?.[0]?.message || 'Datos inválidos' });
    }
};

const actualizarCuenta = async (req, res) => {
    const userId = req.user.id;
    const cuentaId = req.params.id;

    try {
        const datosValidados = CuentaSchema.parse(req.body);
        const { data, error } = await supabase
            .from('cuentas')
            .update({ ...datosValidados })
            .eq('id', cuentaId)
            .eq('user_id', userId)
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Cuenta no encontrada o no autorizada' });
        }

        res.json(data[0]);
    } catch (err) {
        return res.status(400).json({
            error: err.errors?.[0]?.message || 'Datos inválidos'
        });
    }
};

const eliminarCuenta = async (req, res) => {
    const userId = req.user.id;
    const cuentaId = req.params.id;

    const { data, error } = await supabase
        .from('cuentas')
        .delete()
        .eq('id', cuentaId)
        .eq('user_id', userId);

    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) {
        return res.status(404).json({ error: 'Cuenta no encontrada o no autorizada' });
    }

    res.json({ mensaje: 'Cuenta eliminada correctamente' });
};

module.exports = {
    obtenerCuentas,
    crearCuenta,
    actualizarCuenta,
    eliminarCuenta
};
