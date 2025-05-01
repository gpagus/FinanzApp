// Core
const express = require('express');
const router = express.Router();

// Controller
const {
    obtenerUsuarios
} = require('../controllers/adminController');

// Middleware
const adminMiddleware = require('../middlewares/adminMiddleware');

// 🧪 routes
router.get('/usuarios', adminMiddleware, obtenerUsuarios);


module.exports = router;
