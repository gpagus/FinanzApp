import { z } from "zod";

const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres, una letra y un número")
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, "La contraseña debe tener al menos 6 caracteres, una letra y un número"),

    confirmPassword: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres, una letra y un número")
        .regex(/^(?=.*[A-Za-z])(?=.*\d).{6,}$/, "La contraseña debe tener al menos 6 caracteres, una letra y un número")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"] // Esto asigna el error al campo confirmPassword
});

export default resetPasswordSchema;