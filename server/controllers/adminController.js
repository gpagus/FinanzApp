const supabaseAdmin = require('../config/supabaseAdmin');

const obtenerUsuarios = async (req, res) => {
    try {
        const {data, error} = await supabaseAdmin
            .from('usuarios')
            .select('*')
            .neq('rol', 'admin'); // Excluir Admin

        if (error) {
            return res.status(500).json({error: error.message});
        }

        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({error: err.message});
    }
}

module.exports = {
    obtenerUsuarios
}