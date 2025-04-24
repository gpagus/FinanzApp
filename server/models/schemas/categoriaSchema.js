const { z } = require('zod');

const CategoriaSchema = z.object({
  nombre: z.string().min(1, { message: 'El nombre es obligatorio' }),
  icono: z.string().min(1, { message: 'El icono es obligatorio' }),
  tipo: z.enum(['ingreso', 'gasto'], { message: 'Tipo debe ser ingreso o gasto' })
});

module.exports = CategoriaSchema;
