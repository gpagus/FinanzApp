import {createContext, useContext, useState, useEffect} from "react";
import {useToast} from "./ToastContext.jsx";

const AuthContext = createContext({});

// Hook personalizado para usar el contexto
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

// Proveedor
export const AuthProvider = ({children}) => {
    const {addToast} = useToast();

    const [user, setUser] = useState(null); // Info del usuario
    const [token, setToken] = useState(null); // JWT
    const [loading, setLoading] = useState(true); // Si está validando sesión
    const [error, setError] = useState(null); // Para mostrar errores

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
                let mensajePersonalizado = data.error || "Error al iniciar sesión";

                if (data.error === "Invalid login credentials") {
                    mensajePersonalizado = "Correo o contraseña incorrectos";
                }

                if (data.error?.includes("confirmar tu correo")) {
                    mensajePersonalizado = data.error;
                }

                throw new Error(mensajePersonalizado);
            }


            setToken(data.session.access_token);
            await fetchPerfil(data.session.access_token);
            localStorage.setItem("token", data.session.access_token);
        } catch (err) {
            setError(err.message);
            addToast(err.message, "error", 3000);
            throw err;
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
            if (!res.ok) throw new Error(data.error || "Error al registrarse");

            addToast(data.message || "Registro exitoso. Revisa tu correo.", "success", 4000);

            // Opcional: podrías redirigir al login o limpiar el form desde el componente

        } catch (err) {
            setError(err.message);
            addToast(err.message, "error", 3000);
            throw err;
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

            if (!res.ok) {
                throw new Error(data.error || "Error al confirmar el registro");
            }

            addToast(data.message || "Registro confirmado exitosamente", "success", 4000);
            await fetchPerfil(accessToken);

        } catch (err) {
            setError(err.message);
            addToast(err.message, "error", 3000);
            throw err;
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

            if (!res.ok) {
                throw new Error(data.error || "Error al enviar el correo");
            }

            addToast(data.message, "success", 4000);

        } catch (err) {
            setError(err.message);
            addToast(err.message, "error", 3000);
            throw err;
        } finally {
            setLoading(false);
            setError(null);
        }
    }

    const restablecerContrasena = async (token, newPassword) => {
        debugger;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/restablecer-contrasena`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({token, password: newPassword})
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Error al restablecer la contraseña");
            }

            addToast(data.message || "Contraseña actualizada correctamente", "success", 4000);
            return true;

        } catch (err) {
            setError(err.message);
            addToast(err.message, "error", 3000);
            throw err;
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
        addToast("Sesión cerrada", "info", 3000);
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
