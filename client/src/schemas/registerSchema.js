import {z} from "zod";

const registerSchema = z.object({
    nombre: z
        .string()
        .min(2, "El nombre debe tener entre 2 y 25 caracteres y no puede contener números")
        .max(25, "El nombre debe tener entre 2 y 25 caracteres y no puede contener números")
        .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, "El nombre debe tener entre 2 y 25 caracteres y no puede contener números"),

    apellidos: z
        .string()
        .min(2, "Los apellidos deben tener entre 2 y 50 caracteres y no pueden contener números")
        .max(50, "Los apellidos deben tener entre 2 y 50 caracteres y no pueden contener números")
        .regex(/^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/, "Los apellidos deben tener entre 2 y 50 caracteres y no pueden contener números"),

    email: z
        .string()
        .email("El email no es válido")
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "El email no es válido"),

    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres, una letra y un número")
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, "La contraseña debe tener al menos 6 caracteres, una letra y un número"),
    avatar: z.any().optional(),
});

export default registerSchema;