const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  obtenerCategorias
} = require('../controllers/categoriasController');

router.use(authMiddleware);

router.get('/', obtenerCategorias);

module.exports = router;
