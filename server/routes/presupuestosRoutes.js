const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { obtenerPresupuestos } = require('../controllers/presupuestosController');

router.use(authMiddleware);

router.get('/', obtenerPresupuestos);


module.exports = router;
