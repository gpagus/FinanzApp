// Core
const express = require('express');
const router = express.Router();

// Controller
const {
    obtenerUsuarios,
    obtenerUsuarioPorEmail,
    obtenerCuentasPorEmail,
    obtenerPresupuestosPorEmail,
    cambiarEstadoUsuario,
    obtenerLogsPorEmail,
} = require('../controllers/adminController');

// Middleware
const adminMiddleware = require('../middlewares/adminMiddleware');

// 🧪 gestion usuarios
router.get('/usuarios', adminMiddleware, obtenerUsuarios);
router.get('/usuarios/:email', adminMiddleware, obtenerUsuarioPorEmail);
router.get('/usuarios/:email/cuentas', adminMiddleware, obtenerCuentasPorEmail);
router.get('/usuarios/:email/presupuestos', adminMiddleware, obtenerPresupuestosPorEmail);
router.get('/usuarios/:email/logs', adminMiddleware, obtenerLogsPorEmail);
router.patch('/usuarios/status/:id', adminMiddleware, cambiarEstadoUsuario);

module.exports = router;
