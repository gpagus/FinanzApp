const supabase = require('../config/supabaseClient');

class PresupuestosService {
    
    /**
     * Actualiza el progreso de presupuestos cuando se crea/modifica una transacción
     */
    static async actualizarProgresoPresupuestos(transaccion, esRectificacion = false) {
        try {
            // Solo procesar gastos (excepto transferencias que son categoría 6)
            if (transaccion.tipo !== 'gasto' || transaccion.categoria_id === 6) {
                return;
            }

            // Buscar presupuestos activos para esta categoría y usuario
            const { data: presupuestos, error } = await supabase
                .from('presupuestos')
                .select('id, fecha_inicio, fecha_fin, categoria_id, progreso')
                .eq('categoria_id', transaccion.categoria_id)
                .eq('user_id', transaccion.user_id)
                .eq('estado', true);

            if (error) {
                console.error('Error al buscar presupuestos:', error);
                return;
            }

            // Procesar cada presupuesto que coincida
            for (const presupuesto of presupuestos) {
                // Verificar que la transacción esté en el rango de fechas del presupuesto
                const fechaTransaccion = new Date(transaccion.fecha);
                const fechaInicio = new Date(presupuesto.fecha_inicio);
                const fechaFin = new Date(presupuesto.fecha_fin);
                
                // Ajustar fecha_fin para incluir todo el día
                fechaFin.setHours(23, 59, 59, 999);

                if (fechaTransaccion >= fechaInicio && fechaTransaccion <= fechaFin) {
                    await this.recalcularProgresoPresupuesto(presupuesto.id);
                }
            }

        } catch (error) {
            console.error('Error en actualizarProgresoPresupuestos:', error);
        }
    }

    /**
     * Recalcula el progreso total de un presupuesto específico
     */
    static async recalcularProgresoPresupuesto(presupuestoId) {
        try {
            // Obtener datos del presupuesto
            const { data: presupuesto, error: errorPresupuesto } = await supabase
                .from('presupuestos')
                .select('categoria_id, user_id, fecha_inicio, fecha_fin')
                .eq('id', presupuestoId)
                .eq('estado', true)
                .single();

            if (errorPresupuesto || !presupuesto) {
                console.error('Presupuesto no encontrado:', errorPresupuesto);
                return;
            }

            // Calcular la suma total de gastos en esta categoría y rango de fechas
            // Excluir transacciones rectificadas y rectificativas
            const fechaInicio = new Date(presupuesto.fecha_inicio).toISOString();
            const fechaFin = new Date(presupuesto.fecha_fin);
            fechaFin.setHours(23, 59, 59, 999);
            const fechaFinISO = fechaFin.toISOString();

            const { data: transacciones, error: errorTransacciones } = await supabase
                .from('transacciones')
                .select('monto')
                .eq('categoria_id', presupuesto.categoria_id)
                .eq('user_id', presupuesto.user_id)
                .eq('tipo', 'gasto')
                .gte('fecha', fechaInicio)
                .lte('fecha', fechaFinISO)
                .is('transaccion_original_id', null) // Excluir rectificativas
                .is('transaccion_rectificativa_id', null); // Excluir rectificadas

            if (errorTransacciones) {
                console.error('Error al obtener transacciones:', errorTransacciones);
                return;
            }

            // Calcular progreso total
            const progresoTotal = transacciones.reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);

            // Actualizar el presupuesto
            const { error: errorActualizar } = await supabase
                .from('presupuestos')
                .update({ progreso: progresoTotal })
                .eq('id', presupuestoId);

            if (errorActualizar) {
                console.error('Error al actualizar progreso:', errorActualizar);
            } else {
                console.log(`Presupuesto ${presupuestoId} actualizado. Progreso: ${progresoTotal}`);
            }

        } catch (error) {
            console.error('Error en recalcularProgresoPresupuesto:', error);
        }
    }

    /**
     * Verifica si una transacción está vinculada a un presupuesto activo
     */
    static async transaccionVinculadaAPresupuesto(transaccionId, userId) {
        try {
            const { data: transaccion, error: errorTransaccion } = await supabase
                .from('transacciones')
                .select('categoria_id, fecha, tipo')
                .eq('id', transaccionId)
                .eq('user_id', userId)
                .single();

            if (errorTransaccion || !transaccion || transaccion.tipo !== 'gasto') {
                return false;
            }

            const { data: presupuestos, error: errorPresupuestos } = await supabase
                .from('presupuestos')
                .select('fecha_inicio, fecha_fin')
                .eq('categoria_id', transaccion.categoria_id)
                .eq('user_id', userId)
                .eq('estado', true);

            if (errorPresupuestos || !presupuestos.length) {
                return false;
            }

            // Verificar si la transacción está en el rango de algún presupuesto
            const fechaTransaccion = new Date(transaccion.fecha);
            
            for (const presupuesto of presupuestos) {
                const fechaInicio = new Date(presupuesto.fecha_inicio);
                const fechaFin = new Date(presupuesto.fecha_fin);
                fechaFin.setHours(23, 59, 59, 999);

                if (fechaTransaccion >= fechaInicio && fechaTransaccion <= fechaFin) {
                    return true;
                }
            }

            return false;

        } catch (error) {
            console.error('Error en transaccionVinculadaAPresupuesto:', error);
            return false;
        }
    }

    /**
     * Recalcula todos los presupuestos activos de un usuario
     */
    static async recalcularTodosLosPresupuestos(userId) {
        try {
            const { data: presupuestos, error } = await supabase
                .from('presupuestos')
                .select('id')
                .eq('user_id', userId)
                .eq('estado', true);

            if (error) {
                console.error('Error al obtener presupuestos:', error);
                return;
            }

            for (const presupuesto of presupuestos) {
                await this.recalcularProgresoPresupuesto(presupuesto.id);
            }

            console.log(`Recalculados ${presupuestos.length} presupuestos para usuario ${userId}`);

        } catch (error) {
            console.error('Error en recalcularTodosLosPresupuestos:', error);
        }
    }
}

module.exports = PresupuestosService;