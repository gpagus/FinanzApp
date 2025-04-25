import {createContext, useContext, useState, useEffect} from "react";
import toast from "react-hot-toast";

const AuthContext = createContext({});

// Hook personalizado para usar el contexto
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// Proveedor
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null); // Info del usuario
    const [token, setToken] = useState(null); // JWT
    const [loading, setLoading] = useState(true); // Si está validando sesión
    const [error, setError] = useState(null); // Para mostrar errores

    const handleError = (error) => {
        const errorMessage = error.message || String(error);
        setError(errorMessage);
        toast.error(errorMessage);
        return errorMessage;
    }

    // Restaurar sesión al cargar la app
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const fetchPerfil = async (accessToken) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/perfil`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const perfil = await res.json();
        if (!res.ok) throw new Error(perfil.error || "Error al obtener perfil");

        setUser(perfil);
        localStorage.setItem("user", JSON.stringify(perfil));
    };

    const login = async ({email, password}) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({email, password}),
                }
            );
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error);
            }

            setToken(data.session.access_token);
            await fetchPerfil(data.session.access_token);
            localStorage.setItem("token", data.session.access_token);
            toast.success("Sesión iniciada");
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
            setError(null);
        }
    };

    const register = async (values) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("email", values.email);
            formData.append("password", values.password);
            formData.append("nombre", values.nombre);
            formData.append("apellidos", values.apellidos);

            if (values.avatar) {
                formData.append("avatar", values.avatar);
            }

            const res = await fetch(
                `${import.meta.env.VITE_API_URL}/api/auth/register`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(data.message);
        } catch (err) {
            handleError(err);
        } finally {
            setLoading(false);
            setError(null);
        }
    };

    const confirmarRegistro = async (accessToken) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/confirmar-registro`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token: accessToken})
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            await fetchPerfil(accessToken);
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
            setError(null);
        }
    }

    const recuperarContrasena = async (email) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/recuperar-contrasena`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({email})
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(data.message, {duration: 6000});
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
            setError(null);
        }
    }

    const restablecerContrasena = async (token, newPassword) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/restablecer-contrasena`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token, password: newPassword})
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            return true;
        } catch (err) {
            handleError(err)
        } finally {
            setLoading(false);
            setError(null);
        }
    }


    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.success("Sesión cerrada, ¡hasta pronto!👋");
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                login,
                register,
                logout,
                fetchPerfil,
                confirmarRegistro,
                recuperarContrasena,
                restablecerContrasena,
                setToken,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
