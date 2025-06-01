const cron = require('node-cron');
const supabase = require('../config/supabaseClient');

// Cron job que se ejecuta cada día a las 00:00
cron.schedule('0 0 * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`⏳ [${timestamp}] Comprobando presupuestos expirados...`);

    try {
        // Consulta para obtener presupuestos que ya pasaron de fecha
        const { data: presupuestos, error } = await supabase
            .from('presupuestos')
            .select('id, fecha_fin')
            .eq('estado', true);

        if (error) throw error;

        console.log(`📋 Presupuestos activos encontrados: ${presupuestos?.length || 0}`);

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const expirados = presupuestos?.filter(p => {
            const fechaFin = new Date(p.fecha_fin);
            fechaFin.setHours(0, 0, 0, 0); // Inicio del día de la fecha fin
            
            // Si hoy >= fecha_fin, entonces ya expiró
            return hoy >= fechaFin;
        }) || [];

        if (expirados.length > 0) {
            // Actualizar el estado a 'false'
            const ids = expirados.map(p => p.id);
            const { error: updateError } = await supabase
                .from('presupuestos')
                .update({ estado: false })
                .in('id', ids);

            if (updateError) throw updateError;

            console.log(`✅ ${ids.length} presupuestos actualizados a estado "expirado".`);
            console.log(`📋 IDs expirados: ${ids.join(', ')}`);
        } else {
            console.log('🟢 No hay presupuestos expirados.');
        }
    } catch (err) {
        console.error(`❌ [${timestamp}] Error al actualizar los presupuestos:`, err.message);
    }
});

console.log('🧹 Cron de actualización de presupuestos iniciado (diariamente a las 00:00)');

module.exports = cron;
