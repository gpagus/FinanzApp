const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  obtenerCuentas,
  crearCuenta,
  actualizarCuenta,
  eliminarCuenta,
  exportarTransaccionesCuenta,
} = require("../controllers/cuentasController");

router.use(authMiddleware);
// CRUD routes
router.get("/", obtenerCuentas);
router.post("/", crearCuenta);
router.put("/:id", actualizarCuenta);
router.delete("/:id", eliminarCuenta);

// Export transactions for a specific account
router.get('/:cuentaId/export', exportarTransaccionesCuenta);

module.exports = router;
