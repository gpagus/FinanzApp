import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "react-hot-toast";

export default function Redireccionador() {
    const navigate = useNavigate();

    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const type = hashParams.get("type");

        if (type === "signup") {
            navigate("/confirmacion-email" + window.location.hash);
        } else if (type === "recovery") {
            navigate("/restablecer-contrasena" + window.location.hash);
        } else {
            navigate("/dashboard");
            toast.error("Token inválido o no proporcionado. Por favor, verifica el enlace que has recibido.", {duration: 5000});
        }
    }, []);

    return <p className="text-center mt-20 text-neutral-600">Redirigiendo...</p>;
}
