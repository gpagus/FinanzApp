const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  obtenerTransacciones,
  obtenerTodasLasTransacciones,
  crearTransaccion,
  actualizarTransaccion,
  eliminarTransaccion
} = require('../controllers/transaccionesController');

router.use(authMiddleware);

router.get('/', obtenerTransacciones);
router.get('/all', obtenerTodasLasTransacciones);
router.post('/', crearTransaccion);
router.put('/:id', actualizarTransaccion);
router.delete('/:id', eliminarTransaccion);

module.exports = router;
