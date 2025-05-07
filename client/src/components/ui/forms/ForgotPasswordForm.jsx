import React from "react";
import {useAuth} from "../../../context/AuthContext.jsx";
import Boton from "../Boton.jsx";
import FormField from "../FormField.jsx";
import useForm from "../../useForm.jsx";
import {validarRecuperarContrasena} from "../../../utils/validaciones.js";
import {X} from "lucide-react";

const ForgotPasswordForm = ({onClose}) => {
    const {recuperarContrasena} = useAuth();

    const handleRecuperarContrasena = async () => {
        try {
            await recuperarContrasena(values.email);
        } catch (error) {
            console.error("Error al enviar el correo de recuperación:", error);
        }
    }

    // Configuración inicial para useForm
    const {values, errors, handleChange, handleSubmit, handleBlur} = useForm(
        {email: ""},
        validarRecuperarContrasena,
        handleRecuperarContrasena
    );

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
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors?.email}
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
