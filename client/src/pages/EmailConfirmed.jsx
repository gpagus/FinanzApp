import {useEffect, useState} from "react";
import Boton from "../components/ui/Boton";
import {useAuth} from "../context/AuthContext";
import {useNavigate} from "react-router-dom";
import {BadgeCheck} from "lucide-react";

const EmailConfirmed = () => {
    const navigate = useNavigate();
    const {confirmarRegistro} = useAuth();
    const [tokenError, setTokenError] = useState(false);

    useEffect(() => {
        debugger;
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const urlToken = hashParams.get("access_token");

        if (!urlToken) {
            setTokenError(true);
        } else {
            (async () => {
                const result = await confirmarRegistro(urlToken);
                if (result) {
                    setTimeout(() => navigate('/'), 4000);
                } else {
                    setTokenError(true);
                }
            })();
        }
    }, []);

    if (tokenError) {
        return (
            <div
                className="min-h-[calc(100vh-4rem-2.5rem)] flex flex-col items-center justify-center bg-neutral-100 text-center px-4">
                <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Token inválido</h1>
                    <p className="mb-6 text-neutral-700">El enlace de recuperación ha expirado o es inválido. Por favor,
                        solicita uno nuevo.</p>
                    <Boton tipo="texto" to="/">Volver al inicio</Boton>
                </div>
            </div>
        );
    } else {
        return (
            <div
                className="flex flex-col min-h-[calc(100vh-4rem-2.5rem)] items-center justify-center bg-neutral-100 px-4 text-center">
                <BadgeCheck className="w-24 h-24 text-aguazul mb-4 animate-bounce"/>
                <h1 className="text-3xl font-bold text-neutral-800 mb-4">¡Correo confirmado!</h1>
                <p className="text-aguazul mb-6">
                    Tu cuenta ha sido verificada correctamente.
                </p>
                <p className="text-neutral-700 mb-6">
                    Serás redirigido al inicio en breves...
                </p>
                <Boton tipo="primario" to="/dashboard">
                    Dashboard
                </Boton>
            </div>
        );
    }
};

export default EmailConfirmed;
