// Core
const express = require('express');
const router = express.Router();

// Controller
const {
    obtenerUsuarios,
    obtenerUsuarioPorEmail,
    obtenerCuentasPorEmail,
    obtenerPresupuestosPorEmail

} = require('../controllers/adminController');

// Middleware
const adminMiddleware = require('../middlewares/adminMiddleware');

// 🧪 routes
router.get('/usuarios', adminMiddleware, obtenerUsuarios);
router.get('/usuarios/:email', adminMiddleware, obtenerUsuarioPorEmail);
router.get('/usuarios/:email/cuentas', adminMiddleware, obtenerCuentasPorEmail);
router.get('/usuarios/:email/presupuestos', adminMiddleware, obtenerPresupuestosPorEmail);


module.exports = router;
