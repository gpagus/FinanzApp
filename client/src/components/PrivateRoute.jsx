import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingOverlay from "./ui/LoadingOverlay";

export function PrivateRoute() {
    const { user, loading } = useAuth();

    if (loading) return <LoadingOverlay />;

    // Si no hay usuario autenticado, redirige al inicio
    if (!user) return <Navigate to="/" />;

    return <Outlet />;
}

export function AdminRoute() {
  const { user, loading } = useAuth();

  console.log("Rol del usuario en AdminRoute:", user?.rol);

  // Esperar a que termine la carga antes de decidir redireccionar
  if (loading) return <LoadingOverlay />;

  // Verifica si el usuario es admin
  if (!user || user.rol !== "admin") {
    console.log("Acceso denegado: no es administrador");
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}