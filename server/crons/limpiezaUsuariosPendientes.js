const cron = require('node-cron');
const supabaseAdmin = require('../config/supabaseAdmin');

// Cron job que se ejecuta cada día a las 03:00 (para no coincidir con presupuestos)
cron.schedule('0 3 * * *', async () => {
    console.log('🧹 Iniciando limpieza de usuarios pendientes...');

    try {
        // Borrar usuarios pendientes más antiguos de 24 horas
        const fechaLimite = new Date();
        fechaLimite.setHours(fechaLimite.getHours() - 24);

        // Primero obtener los usuarios que se van a eliminar para borrar sus avatares
        const { data: usuariosAEliminar, error: errorConsulta } = await supabaseAdmin
            .from('usuarios_pendientes')
            .select('email, avatar')
            .lt('created_at', fechaLimite.toISOString());

        if (errorConsulta) {
            console.error('❌ Error al consultar usuarios pendientes:', errorConsulta.message);
            return;
        }

        if (!usuariosAEliminar || usuariosAEliminar.length === 0) {
            console.log('🟢 No hay usuarios pendientes que eliminar.');
            return;
        }

        console.log(`🎯 Usuarios a eliminar: ${usuariosAEliminar.length}`);

        // Eliminar avatares del storage
        const avataresToDelete = [];
        for (const usuario of usuariosAEliminar) {
            if (usuario.avatar) {
                avataresToDelete.push(usuario.avatar);
            }
            // También intentar eliminar toda la carpeta del usuario
            avataresToDelete.push(`user_${usuario.email}/`);
        }

        if (avataresToDelete.length > 0) {
            console.log(`🗂️ Eliminando ${avataresToDelete.length} avatares/carpetas...`);
            
            const { error: deleteStorageError } = await supabaseAdmin.storage
                .from('avatars')
                .remove(avataresToDelete);

            if (deleteStorageError) {
                console.error('⚠️ Error al eliminar algunos avatares:', deleteStorageError.message);
                // Continuamos aunque falle la eliminación de avatares
            } else {
                console.log('✅ Avatares eliminados correctamente');
            }
        }

        // Ahora eliminar los usuarios de la base de datos
        const { data, error } = await supabaseAdmin
            .from('usuarios_pendientes')
            .delete()
            .lt('created_at', fechaLimite.toISOString())
            .select();

        if (error) {
            console.error('❌ Error al limpiar usuarios pendientes:', error.message);
            return;
        }

        if (data && data.length > 0) {
            console.log(`✅ Limpieza completada. Usuarios eliminados: ${data.length}`);
            console.log(`📧 Emails eliminados: ${data.map(u => u.email).join(', ')}`);
        } else {
            console.log('🟢 No hay usuarios pendientes que eliminar.');
        }
        
    } catch (error) {
        console.error('❌ Error en el job de limpieza:', error.message);
    }
});

console.log('🧹 Cron de limpieza de usuarios pendientes iniciado (ejecuta diariamente a las 03:00)');

module.exports = cron;