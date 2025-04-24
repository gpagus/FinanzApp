class Categoria {
    constructor({ nombre, icono, tipo }) {
      this.nombre = nombre;
      this.icono = icono;
      this.tipo = tipo;
      this.created_at = new Date();
    }
  }

  module.exports = Categoria;
