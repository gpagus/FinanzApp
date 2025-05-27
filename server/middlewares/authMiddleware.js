const supabase = require('../config/supabaseClient');

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({error: 'No token provided'});

    // Verifica el token
    const {data, error} = await supabase.auth.getUser(token);
    if (error || !data?.user) {
        return res.status(401).json({error: 'Token inválido o expirado'});
    }

    // Verificar estado del usuario en base de datos
    const {data: usuario, error: userError} = await supabase
        .from('usuarios')
        .select('estado, rol, nombre')
        .eq('email', data.user.email)
        .single();

    if (userError || !usuario) {
        return res.status(401).json({error: 'Usuario no encontrado'});
    }

    if (!usuario.estado) {
        return res.status(403).json({error: 'Su cuenta se encuentra desactivada por el administrador.'});
    }


    req.user = data.user; // Guarda el usuario autenticado para usarlo después
    next();
};

module.exports = authMiddleware;
