const supabase = require('../config/supabaseClient');

const obtenerPresupuestos = async (req, res) => {
    const userId = req.user.id;

    const {data, error} = await supabase
        .from('presupuestos')
        .select('*')
        .eq('user_id', userId);

    if (error) return res.status(500).json({error: error.message});
    res.json(data);
};

const crearPresupuesto = async (req, res) => {
    const userId = req.user.id;

    try {
        const nuevoPresupuesto = {
            ...req.body,
            user_id: userId,
        };

        const {data, error} = await supabase
            .from('presupuestos')
            .insert([nuevoPresupuesto])
            .select();

        if (error) return res.status(500).json({error: error.message});

        res.status(201).json(data[0]);
    } catch (err) {
        console.error("Error en crearPresupuesto:", err.message);
        return res.status(400).json({error: err.message || 'Datos inválidos'});
    }
}

const eliminarPresupuesto = async (req, res) => {
    const userId = req.user.id;
    const presupuestoId = req.params.id;

    const {error} = await supabase
        .from('presupuestos')
        .delete()
        .eq('id', presupuestoId)
        .eq('user_id', userId);

    if (error) return res.status(500).json({error: error.message});

    res.json({mensaje: 'Presupuesto eliminado'});
}

const actualizarPresupuesto = async (req, res) => {
    const userId = req.user.id;
    const presupuestoId = req.params.id;

    try {
        // Solo permitir actualizar límite y fecha_fin
        const { limite, fecha_fin } = req.body;
        const datosActualizados = {
            ...(limite !== undefined && { limite }),
            ...(fecha_fin !== undefined && { fecha_fin })
        };

        if (Object.keys(datosActualizados).length === 0) {
            return res.status(400).json({error: 'No hay datos válidos para actualizar'});
        }

        const {data, error} = await supabase
            .from('presupuestos')
            .update(datosActualizados)
            .eq('id', presupuestoId)
            .eq('user_id', userId)
            .select();

        if (error) return res.status(500).json({error: error.message});
        if (!data || data.length === 0) {
            return res.status(404).json({error: 'Presupuesto no encontrado'});
        }

        res.json(data[0]);
    } catch (err) {
        console.error("Error en actualizarPresupuesto:", err.message);
        return res.status(400).json({error: err.message || 'Datos inválidos'});
    }
}

module.exports = {
    obtenerPresupuestos,
    crearPresupuesto,
    eliminarPresupuesto,
    actualizarPresupuesto,
};