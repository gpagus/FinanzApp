const cron = require('node-cron');
const supabase = require('../config/supabaseClient');

// Cron job que se ejecuta cada día a las 00:00
cron.schedule('0 0 * * *', async () => {
    console.log('⏳ Comprobando presupuestos expirados...');

    try {
        // Consulta para obtener presupuestos que ya pasaron de fecha
        const { data: presupuestos, error } = await supabase
            .from('presupuestos')
            .select('id, fecha_fin')
            .eq('estado', true);

        if (error) throw error;

        // Filtrar los que ya pasaron la fecha
        const hoy = new Date();
        const expirados = presupuestos.filter(p => new Date(p.fecha_fin) < hoy);

        if (expirados.length > 0) {
            // Actualizar el estado a 'false'
            const ids = expirados.map(p => p.id);
            const { error: updateError } = await supabase
                .from('presupuestos')
                .update({ estado: false })
                .in('id', ids);

            if (updateError) throw updateError;

            console.log(`✅ ${ids.length} presupuestos actualizados a estado "expirado".`);
        } else {
            console.log('🟢 No hay presupuestos expirados.');
        }
    } catch (err) {
        console.error('❌ Error al actualizar los presupuestos:', err.message);
    }
});
