import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email('Email no válido'),
    password: z.string()
        .min(6, 'La contraseña debe tener al menos 6 caracteres, una letra y un número')
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, 'La contraseña debe tener al menos 6 caracteres, una letra y un número'),
});

export default loginSchema;