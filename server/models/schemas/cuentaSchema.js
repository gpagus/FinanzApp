const { z } = require('zod');

const CuentaSchema = z.object({
  nombre: z.string().min(1, { message: 'El nombre es obligatorio' }),
  tipo: z.enum(['Banco', 'Efectivo', 'Tarjeta'], { message: 'Tipo de cuenta inválido' }),
  balance: z.number().nonnegative({ message: 'El balance no puede ser negativo' })
});

module.exports = CuentaSchema;
