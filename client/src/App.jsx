import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
// Contexto
import {useAuth} from "./context/AuthContext";
// Páginas
import Welcome from "./pages/Welcome";
import EmailConfirmed from "./pages/EmailConfirmed.jsx";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";
import Redireccionador from "./pages/Redireccionador";
// Componentes
import PrivateRoute from "./components/PrivateRoute";
import LoadingOverlay from "./components/ui/LoadingOverlay";
import Layout from "./components/ui/Layout";

export default function App() {
    const {loading} = useAuth();

    return (<>
            {loading && <LoadingOverlay/>}
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Welcome/>}/>
                        <Route path="/confirmacion-email" element={<EmailConfirmed/>}/>
                        <Route path="/registro" element={<Register/>}/>
                        <Route
                            path="/dashboard"
                            element={<PrivateRoute>
                                <Dashboard/>
                            </PrivateRoute>}
                        />
                        <Route path="/restablecer-contrasena" element={<ResetPassword/>}/>
                        <Route path="/redireccionador" element={<Redireccionador/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Routes>
                </Layout>
            </Router>
        </>);
}
