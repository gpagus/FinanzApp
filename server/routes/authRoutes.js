// Core
const express = require('express');
const router = express.Router();

// File uploads
const multer = require('multer');
const upload = multer({dest: 'uploads/'});

// Controllers
const {
    login,
    register,
    obtenerPerfil,
    confirmarRegistro,
    recuperarContrasena,
    restablecerContrasena,
    cambiarContrasena,
    actualizarPerfil,
    refreshToken,
} = require('../controllers/authController');

// Middlewares
const auth = require('../middlewares/authMiddleware');

// 🧪 Auth routes
router.post('/login', login);
router.post('/register', upload.single('avatar'), register);
router.get('/perfil', auth, obtenerPerfil);
router.post('/refresh-token', refreshToken);
router.post('/cambiar-contrasena', auth, cambiarContrasena);
router.post('/actualizar-perfil', auth, upload.single('avatar'), actualizarPerfil);

// 📧 Email-based
router.post('/confirmar-registro', confirmarRegistro);
router.post('/recuperar-contrasena', recuperarContrasena);
router.post('/restablecer-contrasena', restablecerContrasena);

module.exports = router;
