const { z } = require('zod');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
const nombreRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,25}$/;
const apellidosRegex = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]{2,50}$/;

const UsuarioSchema = z.object({
    nombre: z.string()
        .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
        .max(25, { message: "El nombre no puede superar los 25 caracteres" })
        .regex(nombreRegex, { message: "El nombre no puede contener números u otros caracteres" }),

    apellidos: z.string()
        .min(2, { message: "Los apellidos deben tener al menos 2 caracteres" })
        .max(50, { message: "Los apellidos no pueden superar los 50 caracteres" })
        .regex(apellidosRegex, { message: "Los apellidos no pueden contener números u otros caracteres" }),

    email: z.string()
        .email({ message: "El email no es válido" })
        .regex(emailRegex, { message: "El email no es válido" }),

    password: z.string()
        .regex(passwordRegex, {
            message: "La contraseña debe tener al menos 6 caracteres, una letra y un número"
        }),

    avatar: z
        .union([
            z.string().url().startsWith('data:image/'),
            z.undefined(),
            z.null()
        ])
        .optional()
});

module.exports = UsuarioSchema;
