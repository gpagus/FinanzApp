import {useEffect} from "react";
import Boton from "../components/ui/Boton";
import {useAuth} from "../context/AuthContext";
import {BadgeCheck} from "lucide-react";

const EmailConfirmed = () => {
    const {setToken, confirmarRegistro} = useAuth(); // Asegúrate de exponer `setToken`

    useEffect(() => {
        debugger;
        const hashParams = new URLSearchParams(window.location.hash.slice(1));

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
            localStorage.setItem("token", accessToken);
            setToken(accessToken);
            confirmarRegistro(accessToken);
        }
    }, []);

    return (
        <div
            className="font-display min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-neutral-100 px-4 text-center">
            <BadgeCheck className="w-24 h-24 text-aguazul mb-4 animate-bounce"/>
            <h1 className="text-3xl font-bold text-neutral-800 mb-4">¡Correo confirmado!</h1>
            <p className="text-aguazul mb-6">
                Tu cuenta ha sido verificada correctamente. Ya puedes empezar a gestionar tus finanzas.
            </p>
            <Boton tipo="primario" to="/dashboard">
                Dashboard
            </Boton>
        </div>
    );
};

export default EmailConfirmed;
