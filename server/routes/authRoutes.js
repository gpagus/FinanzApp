// Core
const express = require('express');
const router = express.Router();

// File uploads
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Controllers
const {
    login,
    register,
    obtenerPerfil,
    confirmarRegistro,
    recuperarContrasena,
    restablecerContrasena,
} = require('../controllers/authController');

// Middlewares
const auth = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');

// Schemas
const UsuarioSchema = require('../models/schemas/usuarioSchema');

// 🧪 Auth routes
router.post('/login', validate(UsuarioSchema.pick({ email: true, password: true })), login);
router.post('/register', upload.single('avatar'), validate(UsuarioSchema.omit({ avatar: true })), register);
router.get('/perfil', auth, obtenerPerfil);

// 📧 Email-based
router.post('/confirmar-registro', confirmarRegistro);
router.post('/recuperar-contrasena', recuperarContrasena);
router.post('/restablecer-contrasena', validate(UsuarioSchema.pick({ password: true })), restablecerContrasena);

module.exports = router;
