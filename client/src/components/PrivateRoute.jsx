// Modifica tu PrivateRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute() {
    const { user, loading } = useAuth();

    if (loading) return <p>Cargando...</p>;

    // Si no hay usuario autenticado, redirige al inicio
    if (!user) return <Navigate to="/" />;

    return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();

  console.log("Rol del usuario en AdminRoute:", user?.rol);

  // Esperar a que termine la carga antes de decidir redireccionar
  if (loading) return <p>Cargando...</p>;

  // Verifica si el usuario es admin
  if (!user || user.rol !== "admin") {
    console.log("Acceso denegado: no es administrador");
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}