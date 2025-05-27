const supabase = require('../config/supabaseClient');

const obtenerAnalisisGastos = async (req, res) => {
    try {
        const userId = req.user.id;

        const fechaInicio = new Date();
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);

        const { data: transacciones, error } = await supabase
            .from('transacciones')
            .select('monto, descripcion, categorias(nombre)')
            .eq('user_id', userId)
            .eq('tipo', 'gasto')
            .gte('fecha', fechaInicio.toISOString().split('T')[0])
            .is('transaccion_original_id', null)
            .is('transaccion_rectificativa_id', null);

        if (error) {
            throw error;
        }

        const gastosPorCategoria = {};
        let totalGastos = 0;

        transacciones?.forEach(t => {
            const categoria = t.categorias?.nombre || 'Sin categoría';
            const monto = Math.abs(t.monto);
            gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + monto;
            totalGastos += monto;
        });

        const insights = [];
        
        if (Object.keys(gastosPorCategoria).length > 0) {
            const categoriaMayorGasto = Object.keys(gastosPorCategoria)
                .reduce((a, b) => gastosPorCategoria[a] > gastosPorCategoria[b] ? a : b);

            const porcentajeMayorCategoria = (gastosPorCategoria[categoriaMayorGasto] / totalGastos) * 100;

            if (porcentajeMayorCategoria > 40) {
                insights.push({
                    tipo: 'warning',
                    mensaje: `El ${porcentajeMayorCategoria.toFixed(1)}% de tus gastos van a ${categoriaMayorGasto}. ¿Podrías reducirlos?`,
                    icono: '⚠️'
                });
            }

            if (porcentajeMayorCategoria < 20) {
                insights.push({
                    tipo: 'success',
                    mensaje: `¡Buen trabajo! Tienes gastos bien distribuidos entre categorías.`,
                    icono: '✅'
                });
            }
        }

        const promedioGastosDiarios = totalGastos / 30;
        
        if (promedioGastosDiarios > 50) {
            insights.push({
                tipo: 'info',
                mensaje: `Gastas en promedio ${promedioGastosDiarios.toFixed(2)}€ al día`,
                icono: '📊'
            });
        }

        if (transacciones?.length > 20) {
            insights.push({
                tipo: 'info',
                mensaje: `Has registrado ${transacciones.length} gastos este mes. ¡Muy activo!`,
                icono: '🎯'
            });
        }

        res.json({
            gastosPorCategoria,
            totalGastos: totalGastos.toFixed(2),
            promedioGastosDiarios: promedioGastosDiarios.toFixed(2),
            numeroTransacciones: transacciones?.length || 0,
            insights,
            periodo: 'Último mes'
        });

    } catch (error) {
        console.error('Error en análisis de gastos:', error.message);
        res.status(500).json({ error: 'Error al generar análisis de gastos' });
    }
};

module.exports = { obtenerAnalisisGastos };