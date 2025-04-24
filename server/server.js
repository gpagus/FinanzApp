const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const transaccionesRoutes = require('./routes/transaccionesRoutes');
const cuentasRoutes = require('./routes/cuentasRoutes');
const categoriasRoutes = require('./routes/categoriasRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/cuentas', cuentasRoutes);
app.use('/api/categorias', categoriasRoutes);

// Servidor
const PORT = 3000;
console.log("inicio del servidor!");
app.listen(PORT, () => {
});
