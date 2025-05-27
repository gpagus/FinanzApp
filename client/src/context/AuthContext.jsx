import {createContext, useContext, useState, useEffect} from "react";
import {useQueryClient} from "@tanstack/react-query";
import toast from "react-hot-toast";
import {fetchWithAuth} from "../api/fetchWithAuth";

const AuthContext = createContext({});

// Hook personalizado para usar el contexto
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// Proveedor
export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null); // Info del usuario
    const [accessToken, setAccessToken] = useState(null); // Token de acceso
    const [loading, setLoading] = useState(true); // Estado de carga
    const [error, setError] = useState(null);  // Mensaje de error
    const queryClient = useQueryClient();

    const handleError = (error) => {
        const errorMessage = error.message || String(error);
        setError(errorMessage);
        toast.error(errorMessage, {duration: 3500});
        return errorMessage;
    }

    // Restaurar sesión al cargar la app
    useEffect(() => {
        const storedToken = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
            setAccessToken(storedToken);
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

    const login = async (email, password) => {
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

            setAccessToken(data.session.access_token);
            await fetchPerfil(data.session.access_token);
            localStorage.setItem("access_token", data.session.access_token);
            localStorage.setItem("refresh_token", data.session.refresh_token);

            // Notificar éxito
            toast.success("Sesión iniciada");

            // Retornar el usuario para que otros componentes puedan decidir la redirección
            return data.user;
        } catch (err) {
            handleError(err);
            return null;
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

            toast.success(data.message, {duration: 6000});
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
            return true;
        } catch (err) {
            handleError(err);
            return false;
        } finally {
            setLoading(false);
            setError(null);
        }
    };

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

    const cambiarContrasena = async (currentPassword, newPassword) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/auth/cambiar-contrasena`, {
                method: 'POST',
                body: JSON.stringify({currentPassword, newPassword})
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            // Actualiza los tokens con la nueva sesión
            if (data.session) {
                localStorage.setItem('access_token', data.session.access_token);
                localStorage.setItem('refresh_token', data.session.refresh_token);
                setAccessToken(data.session.access_token);
            }

            toast.success(data.message);
            return true;
        } catch (err) {
            handleError(err);
            return false;
        } finally {
            setLoading(false);
            setError(null);
        }
    };

    const actualizarPerfil = async (values) => {
        debugger;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("nombre", values.nombre);
            formData.append("apellidos", values.apellidos);

            // Indicar si se debe eliminar el avatar
            if (values.deleteAvatar) {
                formData.append("deleteAvatar", "true");
            } else if (values.avatar) {
                formData.append("avatar", values.avatar);
            }

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/actualizar-perfil`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
            toast.success(data.message);

            return data.user; // Retornar el usuario actualizado
        } catch (err) {
            handleError(err);
            return null; // Retornar null en caso de error
        } finally {
            setLoading(false);
            setError(null);
        }
    }


    const logout = () => {
        // Limpiar el estado de autenticación
        setUser(null);
        setAccessToken(null);

        // Limpiar localStorage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        // Limpiar toda la caché de React Query
        queryClient.clear();

        toast.success("Sesión cerrada, ¡hasta pronto!", {icon: "👋"});
    };


    const isAuthenticated = !!accessToken;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                setLoading,
                error,
                login,
                register,
                logout,
                fetchPerfil,
                confirmarRegistro,
                recuperarContrasena,
                restablecerContrasena,
                cambiarContrasena,
                actualizarPerfil,
                setAccessToken,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
