const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  crearCategoria,
  obtenerCategorias
} = require('../controllers/categoriasController');

router.use(authMiddleware);

router.post('/', crearCategoria);
router.get('/', obtenerCategorias);

module.exports = router;
