const supabase = require('../config/supabaseClient');

const logService = {
    /**
     * Registra una operación realizada por un usuario
     * @param {Object} params - Parámetros del log
     * @param {string} params.usuario_id - ID del usuario que realizó la acción
     * @param {string} params.accion - Tipo de acción realizada
     * @param {string} params.descripcion - Descripción de la acción
     * @param {Object} [params.detalles] - Información adicional en formato JSON
     */
    registrarOperacion: async ({ usuario_id, accion, descripcion, detalles = {} }) => {
        try {
            const { data, error } = await supabase
                .from('logs')
                .insert({
                    usuario_id,
                    accion,
                    descripcion,
                    detalles
                    // fecha_hora se genera automáticamente
                });

            if (error) {
                console.error('Error al registrar log:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error en logService:', error);
            // No lanzamos el error para evitar interrumpir flujos principales
            return null;
        }
    }
};

module.exports = logService;