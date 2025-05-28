const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { obtenerPresupuestos, crearPresupuesto, eliminarPresupuesto, actualizarPresupuesto, recalcularPresupuestos } = require('../controllers/presupuestosController');

router.use(authMiddleware);

router.get('/', obtenerPresupuestos);
router.post('/', crearPresupuesto);
router.put('/:id', actualizarPresupuesto);
router.delete('/:id', eliminarPresupuesto);
router.post('/recalcular', recalcularPresupuestos);

module.exports = router;
