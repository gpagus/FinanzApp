import {Navigate, Outlet} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function PrivateRoute() {
  const { user } = useAuth();

  return user ? <Outlet/> : <Navigate to="/" />;
}

function AdminRoute() {
  const { user } = useAuth();

  return user && user.rol === "admin" ? <Outlet/> : <Navigate to="/dashboard" />;
}

export { PrivateRoute, AdminRoute };
