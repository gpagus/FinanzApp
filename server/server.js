const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

/*
const corsOptions = {
    origin: [
        'https://finanziapp.vercel.app',
        process.env.FRONTEND_URL
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
}
*/

const authRoutes = require('./routes/authRoutes');
const transaccionesRoutes = require('./routes/transaccionesRoutes');
const cuentasRoutes = require('./routes/cuentasRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');

const app = express();
app.use(cors(/*corsOptions*/));
app.use(morgan('dev'));
app.use(express.json());


// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/categorias', categoriasRoutes);

// Servidor
const PORT = /*process.env.PORT ||*/ 3000;
console.log(`Servidor iniciado en puerto ${PORT}!`);
app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
});
