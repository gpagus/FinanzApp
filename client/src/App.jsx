import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Welcome from "./pages/Welcome";
import EmailConfirmed from "./pages/EmailConfirmed";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import UserDashboardPage from "./pages/user/UserDashboardPage";
import CuentasList from "./pages/user/CuentasList";
import PresupuestosListPage from "./pages/user/PresupuestosListPage";
import CuentaDetail from "./pages/user/CuentaDetail";
import TransaccionesPage from "./pages/user/TransaccionesPage";
import SettingsPage from "./pages/user/SettingsPage";
import ResetPassword from "./pages/ResetPassword";
import Redireccionador from "./components/Redireccionador";
import UserListAdmin from "./pages/admin/UserListAdmin";
import UserDetailAdmin from "./pages/admin/UserDetailAdmin";
import {PrivateRoute, AdminRoute} from "./components/PrivateRoute";
import PublicLayout from "./components/ui/PublicLayout";
import PrivateLayout from "./components/ui/PrivateLayout";
import {useAuth} from "./context/AuthContext";
import LoadingOverlay from "./components/ui/LoadingOverlay";


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

                    {/* Rutas privadas para usuarios normales */}
                    <Route element={<PrivateRoute/>}>
                        <Route element={<PrivateLayout/>}>
                            <Route path="/dashboard" element={<UserDashboardPage/>}/>
                            <Route path="/cuentas" element={<CuentasList/>}/>
                            <Route path="/cuentas/:id" element={<CuentaDetail/>}/>
                            <Route path="movimientos" element={<TransaccionesPage/>}/>
                            <Route path="/presupuestos" element={<PresupuestosListPage/>}/>
                            <Route path="/ajustes" element={<SettingsPage/>}/>
                        </Route>
                    </Route>

                    {/* Rutas admin separadas completamente */}
                    <Route element={<AdminRoute/>}>
                        <Route element={<PrivateLayout/>}>
                            <Route path="/admin" element={<AdminDashboardPage/>}/>
                            <Route path="/admin-usuarios" element={<UserListAdmin/>}/>
                            <Route path="/admin-usuarios/:email" element={<UserDetailAdmin/>}/>
                        </Route>
                    </Route>
                </Routes>
            </Router>

        </>
    );
}
