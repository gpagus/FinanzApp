const { z } = require('zod');

const TransaccionSchema = z.object({
  categoria_id: z.string().uuid({ message: 'ID de categoría inválido' }),
  cuenta_id: z.string().uuid({ message: 'ID de cuenta inválido' }),
  monto: z.number({ invalid_type_error: 'El monto debe ser un número' })
           .positive({ message: 'El monto debe ser mayor que 0' }),
  descripcion: z.string().min(1, { message: 'La descripción es obligatoria' }),
  fecha: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: 'La fecha no es válida'
  })
});

module.exports = TransaccionSchema;