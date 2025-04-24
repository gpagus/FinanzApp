const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  obtenerTransacciones,
  crearTransaccion,
  actualizarTransaccion,
  eliminarTransaccion
} = require('../controllers/transaccionesController');

router.use(authMiddleware); // proteger las rutas con el middleware de autenticación

router.get('/', obtenerTransacciones);
router.post('/', crearTransaccion);
router.put('/:id', actualizarTransaccion);
router.delete('/:id', eliminarTransaccion);

module.exports = router;
