const supabase = require('../config/supabaseClient');
const logService = require('../services/logService');
const PresupuestosService = require('../services/presupuestosService'); // ✅ Nuevo import

// Helper para obtener el offset de zona horaria española
const obtenerOffsetEspañol = (fecha) => {
    // Determinar si estamos en horario de verano (último domingo de marzo al último domingo de octubre)
    const año = fecha.getFullYear();
    
    // Último domingo de marzo
    const inicioVerano = new Date(año, 2, 31); // 31 de marzo
    inicioVerano.setDate(31 - inicioVerano.getDay()); // Retroceder al domingo
    
    // Último domingo de octubre  
    const finVerano = new Date(año, 9, 31); // 31 de octubre
    finVerano.setDate(31 - finVerano.getDay()); // Retroceder al domingo
    
    // Si estamos entre estas fechas, es horario de verano (+2), sino es invierno (+1)
    return (fecha >= inicioVerano && fecha < finVerano) ? 2 : 1;
};

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

    // Aplicar filtros de fecha si existen - CORREGIDO para zona horaria española
    if (fecha_desde) {
        const fechaDesdeLocal = new Date(fecha_desde + 'T00:00:00');
        const offset = obtenerOffsetEspañol(fechaDesdeLocal);
        fechaDesdeLocal.setHours(fechaDesdeLocal.getHours() - offset);
        query = query.gte('fecha', fechaDesdeLocal.toISOString());
    }
    
    if (fecha_hasta) {
        // Modificar la fecha hasta para incluir todo el día en zona horaria española
        const fechaHastaUTC = new Date(fecha_hasta + 'T23:59:59');
        fechaHastaUTC.setHours(fechaHastaUTC.getHours() - 2); // Restar 2 horas para convertir a UTC
        query = query.lte('fecha', fechaHastaUTC.toISOString());
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
            .order('fecha', {ascending: false});

        // Aplicar filtros de fecha - CORREGIDO para zona horaria española
        if (fecha_desde) {
            const fechaDesdeLocal = new Date(fecha_desde + 'T00:00:00');
            const offset = obtenerOffsetEspañol(fechaDesdeLocal);
            fechaDesdeLocal.setHours(fechaDesdeLocal.getHours() - offset);
            query = query.gte('fecha', fechaDesdeLocal.toISOString());
        }
        
        if (fecha_hasta) {
            const fechaHastaUTC = new Date(fecha_hasta + 'T23:59:59');
            fechaHastaUTC.setHours(fechaHastaUTC.getHours() - 2);
            query = query.lte('fecha', fechaHastaUTC.toISOString());
        }

        if (cuenta_id) query = query.eq('cuenta_id', cuenta_id);
        if (tipo) query = query.eq('tipo', tipo);
        if (categoria_id) query = query.eq('categoria_id', categoria_id);
        if (busqueda) query = query.ilike('descripcion', `%${busqueda}%`);

        // Paginación
        query = query.range(offsetNum, offsetNum + limitNum - 1);

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

        // ✅ ACTUALIZAR PRESUPUESTOS
        const transaccionCreada = data[0];
        await PresupuestosService.actualizarProgresoPresupuestos(transaccionCreada);

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

        // ✅ VERIFICAR RESTRICCIONES DE PRESUPUESTO MEJORADAS
        if (cambios.categoria_id) {
            // Obtener la transacción actual completa
            const {data: transaccionActual, error: errorTransaccion} = await supabase
                .from('transacciones')
                .select('categoria_id, fecha, tipo')
                .eq('id', transaccionId)
                .eq('user_id', userId)
                .single();

            if (errorTransaccion) return res.status(500).json({error: errorTransaccion.message});

            // Solo verificar si realmente se está cambiando la categoría
            if (cambios.categoria_id !== transaccionActual.categoria_id) {
                // Verificar si la transacción actual está vinculada a un presupuesto
                const estaVinculada = await PresupuestosService.transaccionVinculadaAPresupuesto(
                    transaccionId, 
                    userId
                );

                if (estaVinculada) {
                    return res.status(403).json({
                        error: 'Esta transacción está vinculada a un presupuesto activo. No puedes cambiar la categoría.'
                    });
                }
            }
        }

        // Obtener datos antes de actualizar para recalcular presupuestos
        const {data: transaccionAnterior, error: errorAnterior} = await supabase
            .from('transacciones')
            .select('*')
            .eq('id', transaccionId)
            .eq('user_id', userId)
            .single();

        if (errorAnterior) return res.status(500).json({error: errorAnterior.message});

        // Si no hay conflictos, procedemos a actualizar
        const {data, error} = await supabase
            .from('transacciones')
            .update(cambios)
            .eq('id', transaccionId)
            .eq('user_id', userId)
            .select();

        if (error) return res.status(500).json({error: error.message});
        if (data.length === 0) return res.status(404).json({error: 'Transacción no encontrada o no autorizada'});

        // ✅ ACTUALIZAR PRESUPUESTOS DESPUÉS DE LA MODIFICACIÓN
        const transaccionActualizada = data[0];
        
        // Recalcular presupuestos de la categoría anterior (si cambió)
        if (cambios.categoria_id && cambios.categoria_id !== transaccionAnterior.categoria_id) {
            await PresupuestosService.actualizarProgresoPresupuestos(transaccionAnterior);
        }
        
        // Recalcular presupuestos de la nueva categoría
        await PresupuestosService.actualizarProgresoPresupuestos(transaccionActualizada);

        res.json(data[0]);
    } catch (err) {
        return res.status(400).json({error: err.message || 'Datos inválidos'});
    }
};

const eliminarTransaccion = async (req, res) => {
    const userId = req.user.id;
    const transaccionId = req.params.id;

    try {
        // ✅ OBTENER DATOS ANTES DE ELIMINAR PARA ACTUALIZAR PRESUPUESTOS
        const {data: transaccionAEliminar, error: errorObtener} = await supabase
            .from('transacciones')
            .select('*')
            .eq('id', transaccionId)
            .eq('user_id', userId)
            .single();

        if (errorObtener) return res.status(500).json({error: errorObtener.message});
        if (!transaccionAEliminar) return res.status(404).json({error: 'Transacción no encontrada'});

        const {data, error} = await supabase
            .from('transacciones')
            .delete()
            .eq('id', transaccionId)
            .eq('user_id', userId);

        if (error) return res.status(500).json({error: error.message});

        // ✅ ACTUALIZAR PRESUPUESTOS DESPUÉS DE ELIMINAR
        await PresupuestosService.actualizarProgresoPresupuestos(transaccionAEliminar);

        res.json({mensaje: 'Transacción eliminada'});
    } catch (err) {
        console.error("Error en eliminarTransaccion:", err.message);
        return res.status(500).json({error: err.message || 'Error interno del servidor'});
    }
};

module.exports = {
    obtenerTransacciones,
    obtenerTodasLasTransacciones,
    crearTransaccion,
    actualizarTransaccion,
    eliminarTransaccion
};