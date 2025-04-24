export const regex = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // x@x.x
    password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, // 6 caracteres, al menos una letra y un número
    nombre: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,25}$/, // 2 a 25 letras
    apellidos: /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/, // 2 a 50 letras
  };
