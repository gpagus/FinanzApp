import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Boton from '../components/ui/Boton';
import FormField from "../components/ui/FormField";
import { useAuth } from '../context/AuthContext';
import { useToast } from "../context/ToastContext";
import useForm from '../components/useForm';
import { validarRestablecerContrasena } from "../utils/validaciones";

function ResetPassword() {
    const { addToast } = useToast();
    const { restablecerContrasena, loading } = useAuth();
    const navigate = useNavigate();

    const [token, setToken] = useState(null);
    const [tokenError, setTokenError] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const urlToken = hashParams.get("token");

        if (!urlToken) {
            setTokenError(true);
            addToast("Token no válido o expirado. Por favor, solicita un nuevo enlace de recuperación.", "error", 5000);
        } else {
            setToken(urlToken);
        }
    }, []);

    const handleResetPassword = async () => {
        try {
            const result = await restablecerContrasena(token, values.password);
            if (result) {
                setSuccess(true);
                addToast("Contraseña restablecida con éxito", "success", 3000);
                setTimeout(() => navigate('/'), 3000);
            }
        } catch (error) {
            console.error("Error al restablecer contraseña:", error);
        }
    };

    const { values, errors, handleChange, handleSubmit, handleBlur } = useForm(
        { password: "", confirmPassword: "" },
        validarRestablecerContrasena,
        handleResetPassword
    );

    if (tokenError) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-neutral-100 text-center font-display px-4">
                <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Token inválido</h1>
                    <p className="mb-6 text-neutral-700">El enlace de recuperación ha expirado o es inválido. Por favor, solicita uno nuevo.</p>
                    <Boton tipo="texto" to="/">Volver al inicio</Boton>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-neutral-100 text-center px-4">
                <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-aguazul mb-4">¡Contraseña actualizada!</h1>
                    <p className="text-neutral-700 mb-2">Tu contraseña ha sido restablecida correctamente.</p>
                    <p className="text-neutral-500">Serás redirigido en unos segundos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col font-display items-center justify-center bg-neutral-100 px-4 text-center">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-neutral-900">Restablecer Contraseña</h2>
                <form onSubmit={handleSubmit}>
                    <FormField
                        label="Nueva contraseña"
                        name="password"
                        type="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors?.password}
                    />
                    <FormField
                        label="Confirmar nueva contraseña"
                        name="confirmPassword"
                        type="password"
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors?.confirmPassword}
                    />
                    <Boton
                        type="submit"
                        fullWidth
                        disabled={loading}
                    >
                        {loading ? "Procesando..." : "Restablecer contraseña"}
                    </Boton>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
