const supabase = require('../config/supabaseClient');
const logService = require('../services/logService');

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
        const {count, error: countError} = await supabase
            .from('cuentas')
            .select('*', {count: 'exact', head: true})
            .eq('user_id', userId);

        if (countError) return res.status(500).json({error: countError.message});

        if (count >= LIMITE_CUENTAS) {
            return res.status(400).json({error: `No puedes tener más de ${LIMITE_CUENTAS} cuentas.`});
        }

        // Crear la nueva cuenta
        const nuevaCuenta = {
            ...req.body,
            user_id: userId,
        };

        const {data, error} = await supabase
            .from('cuentas')
            .insert([nuevaCuenta])
            .select();

        if (error) return res.status(500).json({error: error.message});

        // Registrar la operación en el log
        await logService.registrarOperacion({
            usuario_id: userId,
            accion: 'crear_cuenta',
            descripcion: `Cuenta creada: ${data[0].nombre}`,
            detalles: {
                cuenta: data[0]
            }
        });

        res.status(201).json(data[0]);
    } catch (err) {
        console.error("Error en crearCuenta:", err.message);
        return res.status(400).json({error: err.message || 'Datos inválidos'});
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

        // Registrar la operación en el log
        await logService.registrarOperacion({
            usuario_id: userId,
            accion: 'actualizar_cuenta',
            descripcion: `Cuenta actualizada: ${data[0].nombre}`,
            detalles: {
                cambios: req.body
            }
        });

        res.json(data[0]);
    } catch (err) {
        return res.status(400).json({error: err.errors?.[0]?.message || 'Datos inválidos'});
    }
};

const eliminarCuenta = async (req, res) => {
    const userId = req.user.id;
    const cuentaId = req.params.id;
    const { nombre } = req.body;

    const {error} = await supabase
        .from('cuentas')
        .delete()
        .eq('id', cuentaId)
        .eq('user_id', userId);

    if (error) return res.status(500).json({error: error.message});

    // Registrar la operación en el log usando el nombre de la cuenta
    await logService.registrarOperacion({
        usuario_id: userId,
        accion: 'eliminar_cuenta',
        descripcion: `Cuenta eliminada: ${nombre || 'Sin nombre'}`,
        detalles: {
            cuenta_id: cuentaId,
            nombre_cuenta: nombre
        }
    });

    res.json({mensaje: 'Cuenta eliminada'});
};

const exportarTransaccionesCuenta = async (req, res) => {
    const userId = req.user.id;
    const { cuentaId } = req.params;
    
    try {
        const { 
            fecha_desde, 
            fecha_hasta, 
            categoria_id, 
            tipo, 
            busqueda 
        } = req.query;

        // Verificar que la cuenta pertenece al usuario
        const { data: cuenta, error: cuentaError } = await supabase
            .from('cuentas')
            .select('*')
            .eq('id', cuentaId)
            .eq('user_id', userId)
            .single();

        if (cuentaError || !cuenta) {
            return res.status(404).json({ error: 'Cuenta no encontrada' });
        }

        // Helper para obtener el offset de zona horaria española
        const obtenerOffsetEspañol = (fecha) => {
            const año = fecha.getFullYear();
            const inicioVerano = new Date(año, 2, 31);
            inicioVerano.setDate(31 - inicioVerano.getDay());
            const finVerano = new Date(año, 9, 31);
            finVerano.setDate(31 - finVerano.getDay());
            return (fecha >= inicioVerano && fecha < finVerano) ? 2 : 1;
        };

        // Construir query para obtener todas las transacciones
        let query = supabase
            .from('transacciones')
            .select(`
               *,
                cuenta:cuentas!transacciones_cuenta_id_fkey(*),
                 cuenta_destino:cuentas!transacciones_cuenta_destino_id_fkey(*)
            `)
            .eq('cuenta_id', cuentaId)
            .order('fecha', { ascending: false });

        // Aplicar filtros de fecha
        if (fecha_desde) {
            const fechaDesdeLocal = new Date(fecha_desde + 'T00:00:00');
            const offset = obtenerOffsetEspañol(fechaDesdeLocal);
            fechaDesdeLocal.setHours(fechaDesdeLocal.getHours() - offset);
            query = query.gte('fecha', fechaDesdeLocal.toISOString());
        }
        
        if (fecha_hasta) {
            const fechaHastaLocal = new Date(fecha_hasta + 'T23:59:59');
            const offset = obtenerOffsetEspañol(fechaHastaLocal);
            fechaHastaLocal.setHours(fechaHastaLocal.getHours() - offset);
            query = query.lte('fecha', fechaHastaLocal.toISOString());
        }

        // Aplicar otros filtros
        if (categoria_id) query = query.eq('categoria_id', categoria_id);
        if (tipo) query = query.eq('tipo', tipo);
        if (busqueda) query = query.ilike('descripcion', `%${busqueda}%`);

        const { data: transacciones, error } = await query;

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // Registrar la exportación en el log
        await logService.registrarOperacion({
            usuario_id: userId,
            accion: 'exportar_transacciones',
            descripcion: `Transacciones exportadas de cuenta: ${cuenta.nombre} (${transacciones.length} registros)`,
            detalles: {
                cuenta_id: cuentaId,
                filtros: { fecha_desde, fecha_hasta, categoria_id, tipo, busqueda },
                total_registros: transacciones.length
            }
        });

        res.json({
            cuenta,
            transacciones,
            total: transacciones.length
        });

    } catch (error) {
        console.error('Error en exportarTransaccionesCuenta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    obtenerCuentas,
    crearCuenta,
    actualizarCuenta,
    eliminarCuenta,
    exportarTransaccionesCuenta
};
