const supabase = require('../config/supabaseClient');

async function adminMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        // Verifica el token
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return res.status(401).json({ error: 'Invalid token' });

        // Comprobar si se es admin
        const { data, error: dbError } = await supabase
            .from('usuarios')
            .select('rol')
            .eq('email', user.email)
            .single();

        if (dbError || !data || data.rol !== "admin") {
            return res.status(403).json({ error: 'Access denied' });
        }

        // El usuario es admin, sigue
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}

module.exports = adminMiddleware;
