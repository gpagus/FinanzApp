const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

/*
const corsOptions = {
    origin: [
        'https://finanz-app.es',
        process.env.FRONTEND_URL
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}
*/

// 🔎 === IMPORTACIÓN DEL CRON ===
require('./crons/updatePresupuestos');

// 🔎 === IMPORTACIÓN DE RUTAS ===
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const transaccionesRoutes = require('./routes/transaccionesRoutes');
const cuentasRoutes = require('./routes/cuentasRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');
const presupuestosRoutes = require('./routes/presupuestosRoutes');

const app = express();
app.use(cors(/*corsOptions*/));
app.use(morgan('dev'));
app.use(express.json());

// 🔎 === REGISTRO DE RUTAS ===
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/presupuestos', presupuestosRoutes);

// 🔎 === SERVIDOR INICIADO ===
const PORT = process.env.PORT || 3000; // ✅ Descomenta process.env.PORT
console.log(`🚀 Servidor iniciando en puerto ${PORT}...`);
app.listen(PORT, '0.0.0.0', () => { // ✅ Añadir '0.0.0.0' para Railway
    console.log(`✅ Servidor escuchando en puerto ${PORT}`);
});

// ✅ Agregar logging de rutas para debug
console.log('📋 Rutas registradas:');
console.log('  GET /api/admin/usuarios');
console.log('  GET /api/admin/stats');
console.log('  GET /api/admin/activity');
console.log('  GET /api/admin/health');

// ✅ Ruta de prueba específica
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        routes: {
            stats: '/api/admin/stats',
            activity: '/api/admin/activity',
            users: '/api/admin/usuarios'
        }
    });
});

// ✅ Manejo de rutas no encontradas
app.use('*', (req, res) => {
    console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        availableRoutes: [
            '/api/admin/usuarios',
            '/api/admin/stats', 
            '/api/admin/activity',
            '/api/admin/health'
        ]
    });
});
