import React from "react";
import {z} from "zod";
import {useAuth} from "../../../context/AuthContext";
import Boton from "../Boton";
import FormField from "../FormField";
import {X} from "lucide-react";
import useCustomForm from "../../../hooks/useCustomForm";


const emailSchema = z.object({
        email: z.string().email('Email no válido'),
    }
);

const ForgotPasswordForm = ({onClose}) => {
    const {recuperarContrasena} = useAuth();

    const {register, handleSubmit, errors} = useCustomForm({
        schema: emailSchema,
        onSubmit: (data) => {
            recuperarContrasena(data.email);
        },
        defaultValues: {
            email: '',
        },
    });


    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md relative">
                <Boton
                    tipo="icono"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-900"
                >
                    <X size={20} className="text-neutral-600"/>
                </Boton>

                <h2 className="text-2xl font-semibold mb-6 text-center text-neutral-900">
                    Recuperar Contraseña
                </h2>

                <p className="text-sm text-center text-neutral-600 mb-4">
                    Ingresa tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu
                    contraseña.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        register={register}
                        error={errors?.email?.message}
                        placeholder="ejemplo@correo.com"
                    />

                    <Boton
                        type="submit"
                        fullWidth
                    >
                        Enviar
                    </Boton>
                </form>

            </div>
        </div>
    );
};

export default ForgotPasswordForm;
