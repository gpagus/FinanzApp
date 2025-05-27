const cron = require('node-cron');
const supabase = require('../config/supabaseClient');

// Se ejecuta cada domingo a las 04:00
cron.schedule('0 4 * * 0', async () => {
    console.log('🧹 Limpiando logs antiguos...');

    try {
        // Eliminar logs más antiguos de 3 meses
        const fechaLimite = new Date();
        fechaLimite.setMonth(fechaLimite.getMonth() - 3);

        const { data, error } = await supabase
            .from('logs')
            .delete()
            .lt('fecha', fechaLimite.toISOString())
            .select();

        if (error) {
            console.error('❌ Error limpiando logs:', error.message);
            return;
        }

        console.log(`✅ Logs limpiados: ${data?.length || 0} registros eliminados`);
        
    } catch (error) {
        console.error('❌ Error en limpieza de logs:', error.message);
    }
});

console.log('🧹 Cron de limpieza de logs iniciado (domingos 04:00)');
module.exports = cron;