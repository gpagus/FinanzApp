const supabase = require('../config/supabaseClient');

const crearCategoria = async (req, res) => {
  try {
    const datosValidados = CategoriaSchema.parse(req.body);
    const nuevaCategoria = new Categoria(datosValidados);

    const { data, error } = await supabase
      .from('categorias')
      .insert([nuevaCategoria])
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
      }
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json(data[0]);

  } catch (err) {
    return res.status(400).json({
      error: err.errors?.[0]?.message || 'Datos inválidos'
    });
  }
};

const obtenerCategorias = async (req, res) => {
  const { data, error } = await supabase
    .from('categorias')
    .select('*');

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};

module.exports = {
  crearCategoria,
  obtenerCategorias
};
