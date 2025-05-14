const supabase = require('../config/supabaseClient');

const obtenerPresupuestos = async (req, res) => {
    const userId = req.user.id;

    const {data, error} = await supabase
        .from('presupuestos')
        .select('*')
        .eq('user_id', userId);

    if (error) return res.status(500).json({error: error.message});
    res.json(data);
};

module.exports = {
    obtenerPresupuestos
};