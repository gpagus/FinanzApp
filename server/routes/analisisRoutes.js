const express = require('express');
const { obtenerAnalisisGastos } = require('../controllers/analisisController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/gastos', authMiddleware, obtenerAnalisisGastos);

module.exports = router;