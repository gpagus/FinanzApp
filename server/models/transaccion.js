class Transaccion {
    constructor({ categoria_id, cuenta_id, monto, descripcion, fecha }) {
      this.categoria_id = categoria_id;
      this.cuenta_id = cuenta_id;
      this.monto = monto;
      this.descripcion = descripcion;
      this.fecha = fecha;
      this.created_at = new Date();
    }
  }

  module.exports = Transaccion;
