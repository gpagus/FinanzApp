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

const obtenerTodasLasTransacciones = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            fecha_desde,
            fecha_hasta,
            cuenta_id,
            tipo,
            categoria_id,
            busqueda,
            limit = 50,
            offset = 0
        } = req.query;

        let query = supabase
            .from('transacciones')
            .select('*, cuentas!transacciones_cuenta_id_fkey(nombre)') // Especificar la relación exacta
            .eq('user_id', userId)
            .order('fecha', { ascending: false });

        // Aplicar filtros si existen
        if (fecha_desde) query = query.gte('fecha', fecha_desde);
        if (fecha_hasta) query = query.lte('fecha', fecha_hasta);
        if (cuenta_id) query = query.eq('cuenta_id', cuenta_id);
        if (tipo === 'ingreso') query = query.gt('monto', 0);
        if (tipo === 'gasto') query = query.lt('monto', 0);
        if (categoria_id) query = query.eq('categoria_id', categoria_id);
        if (busqueda) query = query.ilike('descripcion', `%${busqueda}%`);

        // Paginación
        const limitNum = Number(limit) || 50;
        const offsetNum = Number(offset) || 0;
        query = query.range(offsetNum, offsetNum + limitNum - 1);

        const { data, error } = await query;

        if (error) {
            console.error("Error en Supabase:", error);
            return res.status(500).json({ error: error.message });
        }

        return res.json(data || []);
    } catch (err) {
        console.error("Error en obtenerTodasLasTransacciones:", err);
        return res.status(500).json({ error: 'Error al obtener todas las transacciones' });
    }
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

        if (error?.message === 'numeric field overflow') {
            return res.status(400).json({ error: 'El balance de la cuenta no puede exceder de los 10 dígitos' });
        }

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

        const cambios = req.body;

        const { data, error } = await supabase
            .from('transacciones')
            .update(cambios)
            .eq('id', transaccionId)
            .eq('user_id', userId) // Solo permite modificar si es del usuario
            .select();

        if (error) return res.status(500).json({ error: error.message });
        if (data.length === 0) return res.status(404).json({ error: 'Transacción no encontrada o no autorizada' });

        res.json(data[0]);
    } catch (err) {
        return res.status(400).json({ error: err.message || 'Datos inválidos' });
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

    res.json({mensaje: 'Transacción eliminada'});
};

module.exports = {
    obtenerTransacciones,
    obtenerTodasLasTransacciones,
    crearTransaccion,
    actualizarTransaccion,
    eliminarTransaccion
};