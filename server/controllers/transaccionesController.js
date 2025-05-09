const supabase = require('../config/supabaseClient');


const obtenerTransacciones = async (req, res) => {
    const {cuenta_id, limit = 15, offset = 0} = req.query;

    const {data, error} = await supabase
        .from('transacciones')
        .select('*')
        .eq('cuenta_id', cuenta_id)
        .order('fecha', {ascending: false})
        .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) return res.status(500).json({error: error.message});
    res.json(data);
};

const crearTransaccion = async (req, res) => {
    const userId = req.user.id;

    try {
        const nuevaTransaccion = {
            ...req.body,
            user_id: userId
        };

        // Insertar la nueva transacción
        const { data, error } = await supabase
            .from('transacciones')
            .insert([nuevaTransaccion])
            .select();

        if (error) return res.status(500).json({ error: error.message });

        res.status(201).json(data[0]);

    } catch (err) {
        console.error("Error en crearTransaccion:", err.message);
        return res.status(400).json({ error: err.message || 'Datos inválidos' });
    }
    };


const actualizarTransaccion = async (req, res) => {
    const userId = req.user.id;
    const transaccionId = req.params.id;

    try {
        const datosValidados = TransaccionSchema.parse(req.body);

        const {data, error} = await supabase
            .from('transacciones')
            .update({...datosValidados})
            .eq('id', transaccionId)
            .eq('user_id', userId) // solo permite modificar si es suya
            .select();

        if (error) return res.status(500).json({error: error.message});
        if (data.length === 0) return res.status(404).json({error: 'Transacción no encontrada o no autorizada'});

        res.json(data[0]);

    } catch (err) {
        return res.status(400).json({error: err.errors?.[0]?.message || 'Datos inválidos'});
    }
};

const eliminarTransaccion = async (req, res) => {
    const userId = req.user.id;
    const transaccionId = req.params.id;

    const {data, error} = await supabase
        .from('transacciones')
        .delete()
        .eq('id', transaccionId)
        .eq('user_id', userId); // solo permite eliminar si es suya

    if (error) return res.status(500).json({error: error.message});
    if (data.length === 0) return res.status(404).json({error: 'Transacción no encontrada o no autorizada'});

    res.json({mensaje: 'Transacción eliminada correctamente'});
};

module.exports = {
    obtenerTransacciones,
    crearTransaccion,
    actualizarTransaccion,
    eliminarTransaccion
};