import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {useAuth} from "./context/AuthContext";
import Welcome from "./pages/Welcome";
import EmailConfirmed from "./pages/EmailConfirmed";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import UserDashboardPage from "./pages/user/UserDashboardPage";
import CuentasList from "./pages/user/CuentasList";
import PresupuestosListPage from "./pages/user/PresupuestosListPage";
import CuentaDetail from "./pages/user/CuentaDetail";
import TransaccionesPage from "./pages/user/TransaccionesPage";
import ResetPassword from "./pages/ResetPassword";
import Redireccionador from "./components/Redireccionador";
import UserListAdmin from "./pages/admin/UserListAdmin";
import {PrivateRoute, AdminRoute} from "./components/PrivateRoute";
import LoadingOverlay from "./components/ui/LoadingOverlay";

import PublicLayout from "./components/ui/PublicLayout";
import PrivateLayout from "./components/ui/PrivateLayout";


export default function App() {
    const {loading} = useAuth();

    return (<>
            {loading && <LoadingOverlay/>}
            <Router>
                <Routes>
                    {/* Rutas públicas */}
                    <Route element={<PublicLayout/>}>
                        <Route path="/" element={<Welcome/>}/>
                        <Route path="/confirmacion-email" element={<EmailConfirmed/>}/>
                        <Route path="/registro" element={<Register/>}/>
                        <Route path="/restablecer-contrasena" element={<ResetPassword/>}/>
                        <Route path="/redireccionador" element={<Redireccionador/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Route>

                    {/* Rutas privadas para usuarios logueados */}
                    <Route element={<PrivateRoute/>}>
                        <Route element={<PrivateLayout/>}>
                            <Route path="/dashboard" element={<UserDashboardPage/>}/>
                            <Route path="/cuentas" element={<CuentasList/>}/>
                            <Route path="/cuentas/:id" element={<CuentaDetail/>}/>
                            <Route path="movimientos" element={<TransaccionesPage/>}/>
                            <Route path="/presupuestos" element={<PresupuestosListPage/>}/>

                            {/* Rutas privadas solo para admin */}
                            <Route element={<AdminRoute/>}>
                                <Route path="/admin" element={<AdminDashboardPage/>}/>
                                <Route path="/admin-usuarios" element={<UserListAdmin/>}/>
                                <Route path="/admin-estadisticas" element={<h1>Estadísticas</h1>}/>
                                <Route path="/admin-reportes" element={<h1>Reportes</h1>}/>
                            </Route>
                        </Route>
                    </Route>
                </Routes>
            </Router>

        </>
    );
}
