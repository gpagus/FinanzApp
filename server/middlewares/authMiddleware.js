const supabase = require('../config/supabaseClient');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }

  req.user = data.user; // Guarda el usuario autenticado para usarlo después
  next();
};

module.exports = authMiddleware;
