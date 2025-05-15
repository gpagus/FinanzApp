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
const PORT = /*process.env.PORT ||*/ 3000;
console.log(`Servidor iniciado en puerto ${PORT}!`);
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
