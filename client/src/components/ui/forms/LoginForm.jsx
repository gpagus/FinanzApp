import React, {useState} from "react";
import {useAuth} from "../../../context/AuthContext";
import Boton from "../Boton";
import FormField from "../FormField";
import ForgotPasswordForm from "./ForgotPasswordForm";
import {X} from "lucide-react";
import useCustomForm from "../../../hooks/useCustomForm";
import loginSchema from "../../../schemas/loginSchema";


const LoginForm = ({onClose}) => {
    const {login} = useAuth();
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const {register, handleSubmit, errors} = useCustomForm({
        schema: loginSchema,
        onSubmit: async (data) => {
            await login(data.email, data.password);
        },
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // Función para mostrar el modal de recuperación
    const handleShowForgotPassword = () => {
        setShowForgotPassword(true);
    };

    // Función para cerrar el modal de recuperación
    const handleCloseForgotPassword = () => {
        setShowForgotPassword(false);
    };


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
                    Iniciar sesión
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <FormField
                        label="Email"
                        name="email"
                        register={register}
                        error={errors?.email?.message}
                    />

                    <FormField
                        label="Contraseña"
                        name="password"
                        type="password"
                        register={register}
                        error={errors?.password?.message}
                    />

                    <Boton
                        type="submit"
                        className="bg-ocean-500 hover:bg-ocean-600"
                        fullWidth
                    >
                        Entrar
                    </Boton>
                </form>

                <div className="flex items-center justify-center pt-2">
                    <Boton
                        tipo="texto"
                        onClick={handleShowForgotPassword}
                        className="text-sm text-center"
                    >
                        ¿Olvidó su contraseña?
                    </Boton>
                </div>

                {showForgotPassword && (
                    <ForgotPasswordForm onClose={handleCloseForgotPassword}/>
                )}

                <div className="flex justify-center items-center mt-4 gap-2 text-sm text-neutral-600">
                    ¿No tienes una cuenta?
                    <Boton to="/registro" tipo="texto">
                        Regístrate
                    </Boton>
                </div>
            </div>

        </div>
    );
};

export default LoginForm;
