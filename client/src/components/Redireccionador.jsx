import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "react-hot-toast";
import {useAuth} from "../context/AuthContext";

export default function Redireccionador() {
    const navigate = useNavigate();
    const {user, loading} = useAuth();

    useEffect(() => {
        if (loading) return;

        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const type = hashParams.get("type");

        if (type === "signup") {
            navigate("/confirmacion-email" + window.location.hash);
        } else if (type === "recovery") {
            navigate("/restablecer-contrasena" + window.location.hash);
        } else if (user) {
            if (user.rol === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } else if (!type) {
            toast.error("Token inválido o no proporcionado. Por favor, verifica el enlace que has recibido.", {duration: 5000});
            navigate("/");
        }
    }, [user, navigate, loading]);

    return <p className="text-center mt-20 text-neutral-600">Redirigiendo...</p>;
}