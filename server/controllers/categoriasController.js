const supabase = require('../config/supabaseClient');

const obtenerCategorias = async (req, res) => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

module.exports = {
  obtenerCategorias
};
