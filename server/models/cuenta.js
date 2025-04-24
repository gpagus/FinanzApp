class Cuenta {
    constructor({ user_id, nombre, tipo, balance }) {
      this.user_id = user_id;
      this.nombre = nombre;
      this.tipo = tipo;
      this.balance = balance;
      this.created_at = new Date();
    }
  }

  module.exports = Cuenta;
