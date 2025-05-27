const supabase = require('../config/supabaseClient');
const logService = require('../services/logService');

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

        // Comprobar si el presupuesto con la categoría ya existe
        const {data: presupuestoExistente, error: errorPresupuesto} = await supabase
            .from('presupuestos')
            .select('id')
            .eq('categoria_id', nuevoPresupuesto.categoria_id)
            .eq('user_id', userId)
            .eq('estado', true)
            .limit(1);

        if (errorPresupuesto) return res.status(500).json({error: errorPresupuesto.message});

        if (presupuestoExistente.length > 0) {
            return res.status(400).json({
                error: 'Ya existe un presupuesto activo para esta categoría. No puedes crear otro.'
            });
        }

        const {data, error} = await supabase
            .from('presupuestos')
            .insert([nuevoPresupuesto])
            .select();

        if (error) return res.status(500).json({error: error.message});

        // 📝 Log para creación de presupuesto
        await logService.registrarOperacion({
            usuario_id: userId,
            accion: 'crear_presupuesto',
            descripcion: `Presupuesto creado con límite de €${nuevoPresupuesto.limite}`,
            detalles: {
                presupuesto_id: data[0].id,
                categoria_id: nuevoPresupuesto.categoria_id,
                limite: nuevoPresupuesto.limite,
                fecha_fin: nuevoPresupuesto.fecha_fin,
                fecha: new Date().toISOString()
            }
        });

        res.status(201).json(data[0]);
    } catch (err) {
        console.error("Error en crearPresupuesto:", err.message);
        return res.status(400).json({error: err.message || 'Datos inválidos'});
    }
}

const eliminarPresupuesto = async (req, res) => {
    const userId = req.user.id;
    const presupuestoId = req.params.id;

    try {
        // Obtener datos del presupuesto antes de eliminarlo (para el log)
        const {data: presupuestoData, error: fetchError} = await supabase
            .from('presupuestos')
            .select('limite, categoria_id')
            .eq('id', presupuestoId)
            .eq('user_id', userId)
            .single();

        if (fetchError) return res.status(500).json({error: fetchError.message});

        const {error} = await supabase
            .from('presupuestos')
            .delete()
            .eq('id', presupuestoId)
            .eq('user_id', userId);

        if (error) return res.status(500).json({error: error.message});

        // 📝 Log para eliminación de presupuesto
        await logService.registrarOperacion({
            usuario_id: userId,
            accion: 'eliminar_presupuesto',
            descripcion: `Presupuesto eliminado (límite: €${presupuestoData.limite})`,
            detalles: {
                presupuesto_id: presupuestoId,
                categoria_id: presupuestoData.categoria_id,
                limite_anterior: presupuestoData.limite,
                fecha: new Date().toISOString()
            }
        });

        res.json({mensaje: 'Presupuesto eliminado'});
    } catch (err) {
        console.error("Error en eliminarPresupuesto:", err.message);
        return res.status(500).json({error: 'Error interno del servidor'});
    }
}

const actualizarPresupuesto = async (req, res) => {
    const userId = req.user.id;
    const presupuestoId = req.params.id;

    try {
        // Obtener datos actuales del presupuesto (para el log)
        const {data: presupuestoActual, error: fetchError} = await supabase
            .from('presupuestos')
            .select('limite, fecha_fin, categoria_id')
            .eq('id', presupuestoId)
            .eq('user_id', userId)
            .single();

        if (fetchError) return res.status(500).json({error: fetchError.message});

        // Solo permitir actualizar límite y fecha_fin
        const {limite, fecha_fin} = req.body;
        const datosActualizados = {
            ...(limite !== undefined && {limite}),
            ...(fecha_fin !== undefined && {fecha_fin})
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

        // 📝 Log para actualización de presupuesto
        const cambios = [];
        if (limite !== undefined && limite !== presupuestoActual.limite) {
            cambios.push(`límite: €${presupuestoActual.limite} → €${limite}`);
        }
        if (fecha_fin !== undefined && fecha_fin !== presupuestoActual.fecha_fin) {
            cambios.push(`fecha fin: ${presupuestoActual.fecha_fin} → ${fecha_fin}`);
        }

        if (cambios.length > 0) {
            await logService.registrarOperacion({
                usuario_id: userId,
                accion: 'actualizar_presupuesto',
                descripcion: `Presupuesto actualizado: ${cambios.join(', ')}`,
                detalles: {
                    presupuesto_id: presupuestoId,
                    categoria_id: presupuestoActual.categoria_id,
                    cambios: {
                        limite_anterior: presupuestoActual.limite,
                        limite_nuevo: limite,
                        fecha_fin_anterior: presupuestoActual.fecha_fin,
                        fecha_fin_nueva: fecha_fin
                    },
                    fecha: new Date().toISOString()
                }
            });
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