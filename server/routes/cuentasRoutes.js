const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { obtenerCuentas, crearCuenta, actualizarCuenta, eliminarCuenta } = require('../controllers/cuentasController');

router.use(authMiddleware);

router.get('/', obtenerCuentas);
router.post('/', crearCuenta);
router.put('/:id', actualizarCuenta);
router.delete('/:id', eliminarCuenta);

module.exports = router;
