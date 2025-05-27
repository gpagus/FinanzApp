const supabase = require('../config/supabaseClient');
const logService = require('../services/logService');

const obtenerTransacciones = async (req, res) => {
    const {
        cuenta_id,
        limit = 15,
        offset = 0,
        fecha_desde,
        fecha_hasta,
        busqueda,
        tipo,
        categoria_id
    } = req.query;

    let query = supabase
        .from('transacciones')
        .select('*')
        .eq('cuenta_id', cuenta_id)
        .order('fecha', {ascending: false})
        .range(Number(offset), Number(offset) + Number(limit) - 1);

    // Aplicar filtros de fecha si existen
    if (fecha_desde) query = query.gte('fecha', fecha_desde);
    if (fecha_hasta) {
        // Modificar la fecha hasta para incluir todo el día
        const fechaHastaCompleta = new Date(fecha_hasta);
        fechaHastaCompleta.setHours(23, 59, 59, 999);
        query = query.lte('fecha', fechaHastaCompleta.toISOString());
    }

    // Filtro de búsqueda en descripción
    if (busqueda) query = query.ilike('descripcion', `%${busqueda}%`);

    // Filtro por tipo (usar columna 'tipo' directamente)
    if (tipo) query = query.eq('tipo', tipo);

    // Filtro por categoría
    if (categoria_id) query = query.eq('categoria_id', categoria_id);

    const {data, error} = await query;

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

        // Validación de parámetros
        const limitNum = Number.isInteger(Number(limit)) ? Number(limit) : 50;
        const offsetNum = Number.isInteger(Number(offset)) ? Number(offset) : 0;

        if ((fecha_desde && isNaN(Date.parse(fecha_desde))) || (fecha_hasta && isNaN(Date.parse(fecha_hasta)))) {
            return res.status(400).json({error: "Formato de fecha inválido"});
        }

        let query = supabase
            .from('transacciones')
            .select('*, cuentas!transacciones_cuenta_id_fkey(nombre)')
            .eq('user_id', userId)
            // Usamos el ordenamiento estándar por fecha descendente
            .order('fecha', {ascending: false});

        // Aplicar filtros de manera más clara y ordenada
        if (fecha_desde) query.gte('fecha', fecha_desde);
        if (fecha_hasta) {
            // Modificar la fecha hasta para incluir todo el día
            const fechaHastaCompleta = new Date(fecha_hasta);
            fechaHastaCompleta.setHours(23, 59, 59, 999);
            query.lte('fecha', fechaHastaCompleta.toISOString());
        }

        if (cuenta_id) query.eq('cuenta_id', cuenta_id);

        if (tipo) query.eq('tipo', tipo);

        if (categoria_id) query.eq('categoria_id', categoria_id);
        if (busqueda) query.ilike('descripcion', `%${busqueda}%`);

        // Paginación
        query.range(offsetNum, offsetNum + limitNum - 1);

        const {data, error, count} = await query;

        if (error) {
            console.error("Error en Supabase:", error.message);
            return res.status(500).json({error: "Error al obtener transacciones."});
        }

        // Respuesta con datos y paginación
        return res.status(200).json({
            data: data || [],
            total: count || 0,
            limit: limitNum,
            offset: offsetNum
        });
    } catch (err) {
        console.error("Error en obtenerTodasLasTransacciones:", err.message);
        return res.status(500).json({error: 'Error al obtener todas las transacciones'});
    }
};

const crearTransaccion = async (req, res) => {
    const userId = req.user.id;

    try {
        // Copiar el cuerpo de la solicitud
        const transaccionData = {...req.body};

        // Guardar el cuenta_id para la actualización posterior
        const cuentaId = transaccionData.cuenta_id;

        if (!transaccionData.fecha) {
            transaccionData.fecha = new Date().toISOString();
        } else {
            // Si viene una fecha del usuario, asegurar que tenga timestamp completo
            const fechaUsuario = new Date(transaccionData.fecha);
            if (fechaUsuario.getSeconds() === 0 && fechaUsuario.getMilliseconds() === 0) {
                // Si los segundos están a 0, añadir timestamp actual para orden cronológico
                const ahora = new Date();
                fechaUsuario.setSeconds(ahora.getSeconds());
                fechaUsuario.setMilliseconds(ahora.getMilliseconds());
                transaccionData.fecha = fechaUsuario.toISOString();
            }
        }

        const nuevaTransaccion = {
            ...transaccionData,
            user_id: userId
        };

        // Insertar la nueva transacción
        const {data, error} = await supabase
            .from('transacciones')
            .insert([nuevaTransaccion])
            .select();

        if (error?.message === 'numeric field overflow') {
            return res.status(400).json({error: 'El balance de la cuenta no puede exceder de los 10 dígitos'});
        }

        if (error) return res.status(500).json({error: error.message});

        // Actualizar el campo last_update de la cuenta
        const fechaActual = new Date().toISOString();
        const {error: errorActualizarCuenta} = await supabase
            .from('cuentas')
            .update({last_update: fechaActual})
            .eq('id', cuentaId)
            .eq('user_id', userId);

        if (errorActualizarCuenta) {
            console.error("Error al actualizar last_update de la cuenta:", errorActualizarCuenta.message);
            // Seguimos adelante aunque falle la actualización de last_update
        }

        // Solo registrar transacciones "importantes" o "sospechosas"
        const montoLimite = 1000;
        const esTransaccionImportante = Math.abs(nuevaTransaccion.monto) >= montoLimite;
        const tipo = nuevaTransaccion.tipo || 'gasto';

        if (esTransaccionImportante) {
            await logService.registrarOperacion({
                usuario_id: userId,
                accion: 'transaccion_importante',
                descripcion: `Transacción ${tipo} de ${nuevaTransaccion.monto} en cuenta ${cuentaId}`,
                detalles: {
                    monto: nuevaTransaccion.monto,
                    cuenta_id: cuentaId,
                    fecha: new Date().toISOString()
                }
            });
        }

        res.status(201).json(data[0]);

    } catch (err) {
        console.error("Error en crearTransaccion:", err.message);
        return res.status(400).json({error: err.message || 'Datos inválidos'});
    }
};

const actualizarTransaccion = async (req, res) => {
    const userId = req.user.id;
    const transaccionId = req.params.id;

    try {
        const cambios = req.body;

        // Solo verificar restricciones de presupuesto si se está intentando cambiar la categoría
        if (cambios.categoria_id) {
            // Obtener la categoría actual de la transacción
            const {data: transaccionActual, error: errorTransaccion} = await supabase
                .from('transacciones')
                .select('categoria_id')
                .eq('id', transaccionId)
                .single();

            if (errorTransaccion) return res.status(500).json({error: errorTransaccion.message});

            // Solo verificar si realmente se está cambiando la categoría
            if (cambios.categoria_id !== transaccionActual.categoria_id) {
                // Comprobar si la categoría actual está vinculada a un presupuesto
                const {data: presupuestoActual, error: errorPresupuestoActual} = await supabase
                    .from('presupuestos')
                    .select('id')
                    .eq('categoria_id', transaccionActual.categoria_id)
                    .eq('estado', true)
                    .limit(1);

                if (errorPresupuestoActual) return res.status(500).json({error: errorPresupuestoActual.message});

                if (presupuestoActual.length > 0) {
                    return res.status(403).json({
                        error: 'Esta transacción está vinculada a un presupuesto activo. No puedes cambiar la categoría.'
                    });
                }

                // Comprobar si la nueva categoría está vinculada a un presupuesto
                const {data: presupuestoNuevo, error: errorPresupuestoNuevo} = await supabase
                    .from('presupuestos')
                    .select('id')
                    .eq('categoria_id', cambios.categoria_id)
                    .eq('estado', true)
                    .limit(1);

                if (errorPresupuestoNuevo) return res.status(500).json({error: errorPresupuestoNuevo.message});

                if (presupuestoNuevo.length > 0) {
                    return res.status(403).json({
                        error: 'La nueva categoría seleccionada pertenece a un presupuesto activo. No puedes asignarla.'
                    });
                }
            }
        }

        // Si no hay conflictos, procedemos a actualizar
        const {data, error} = await supabase
            .from('transacciones')
            .update(cambios)
            .eq('id', transaccionId)
            .eq('user_id', userId)
            .select();

        if (error) return res.status(500).json({error: error.message});
        if (data.length === 0) return res.status(404).json({error: 'Transacción no encontrada o no autorizada'});

        res.json(data[0]);
    } catch (err) {
        return res.status(400).json({error: err.message || 'Datos inválidos'});
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