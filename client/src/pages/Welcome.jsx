import React, {useState, useEffect, Suspense} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import Footer from "../components/Footer";
import Boton from "../components/ui/Boton";
import LoginForm from "../components/LoginForm.jsx";
import {
    TrendingUp,
    ShoppingCart,
    Receipt,
    PiggyBank,
    BarChart2,
    ClipboardList,
    Target
} from "lucide-react";

const Welcome = () => {
    const {isAuthenticated, loading} = useAuth();
    const navigate = useNavigate()

    const [showLoginModal, setShowLoginModal] = useState(false);

    // Función para abrir el modal
    const handleOpenModal = () => {
        setShowLoginModal(true);
    };

    // Función que se pasa como onClose al modal
    const handleCloseModal = () => {
        setShowLoginModal(false);
    };

    useEffect(() => {
        if (!loading && isAuthenticated) {
            navigate("/dashboard", {replace: true});
        }
    }, [isAuthenticated, loading, navigate]);

    if (!loading && isAuthenticated) {
        return null; // No renderizar nada si ya está autenticado
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-neutral-100 overflow-x-hidden">
            {/* Contenido principal */}
            <main className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 sm:p-6">
                {/* Columna izquierda - Texto */}
                <div className="md:w-1/2 flex flex-col justify-center md:pr-8 lg:pr-12 md:mt-0">
                    <h1 className="font-display font-bold text-3xl sm:text-4xl md:text-5xl text-neutral-900 leading-tight">
                        Simplifica tus finanzas, maximiza tu tranquilidad
                    </h1>
                    <p className="mt-4 sm:mt-6 text-base sm:text-lg text-aguazul leading-relaxed">
                        FinanzApp te ayuda a tomar el control de tu dinero con una gestión
                        financiera personal sencilla e intuitiva. Visualiza tus gastos,
                        establece presupuestos y alcanza tus metas financieras sin
                        complicaciones.
                    </p>
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <Boton tipo="primario" to="/registro">
                            Comenzar Ahora
                        </Boton>
                        <Boton tipo="secundario" onClick={handleOpenModal}>
                            Iniciar Sesión
                        </Boton>
                    </div>
                </div>

                {/* Columna derecha - Ilustración */}
                <div className="md:w-1/2 mt-10 flex items-center justify-center">
                    <div className="relative w-full max-w-md">
                        <div
                            className="absolute -top-4 -left-4 w-full h-full bg-dollar-500 opacity-10 rounded-xl transform rotate-3"></div>
                        <div className="relative bg-white p-4 sm:p-8 rounded-xl shadow-lg">
                            <div className="flex justify-between items-center mb-6 sm:mb-8">
                                <div>
                                    <h2 className="font-display font-bold text-lg text-neutral-900">
                                        Balance
                                    </h2>
                                    <p className="font-display font-bold text-2xl sm:text-3xl text-dollar-500">
                                        $4,250.00
                                    </p>
                                </div>
                                <div className="bg-dollar-500 bg-opacity-10 p-3 rounded-full">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="space-y-3 sm:space-y-4">
                                <div className="p-3 sm:p-4 bg-neutral-100 rounded-lg flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="bg-dollar-500 bg-opacity-10 p-2 rounded-lg mr-3">
                                            <ShoppingCart className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">
                                                Supermercado
                                            </p>
                                            <p className="text-sm text-aguazul">Ayer</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-neutral-900">-$125.00</p>
                                </div>
                                <div className="p-3 sm:p-4 bg-neutral-100 rounded-lg flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="bg-dollar-500 bg-opacity-10 p-2 rounded-lg mr-3">
                                            <Receipt className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">Salario</p>
                                            <p className="text-sm text-aguazul">15/03/2025</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-success">+$2,500.00</p>
                                </div>
                                <div className="p-3 sm:p-4 bg-neutral-100 rounded-lg flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="bg-dollar-500 bg-opacity-10 p-2 rounded-lg mr-3">
                                            <PiggyBank className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-neutral-900">Ahorro</p>
                                            <p className="text-sm text-aguazul">10/03/2025</p>
                                        </div>
                                    </div>
                                    <p className="font-medium text-neutral-900">-$300.00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Características */}
            <section className="bg-white py-12 sm:py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-center text-neutral-900 mb-8 sm:mb-12">
                        Todo lo que necesitas para gestionar tu dinero
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        <div className="bg-neutral-100 p-6 rounded-xl">
                            <div className="bg-dollar-500 bg-opacity-10 p-4 inline-flex rounded-full mb-4">
                                <BarChart2 className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">
                                Visualiza tus finanzas
                            </h3>
                            <p className="text-aguazul">
                                Obtén informes claros y gráficos detallados que te permiten
                                entender en qué gastas tu dinero.
                            </p>
                        </div>
                        <div className="bg-neutral-100 p-6 rounded-xl">
                            <div className="bg-dollar-500 bg-opacity-10 p-4 inline-flex rounded-full mb-4">
                                <ClipboardList className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">
                                Organiza tus gastos
                            </h3>
                            <p className="text-aguazul">
                                Clasifica automáticamente tus transacciones y crea categorías
                                personalizadas para mantener todo en orden.
                            </p>
                        </div>
                        <div className="bg-neutral-100 p-6 rounded-xl">
                            <div className="bg-dollar-500 bg-opacity-10 p-4 inline-flex rounded-full mb-4">
                                <Target className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">
                                Establece objetivos
                            </h3>
                            <p className="text-aguazul">
                                Crea presupuestos realistas y metas de ahorro para alcanzar la
                                estabilidad financiera que deseas.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
            <Footer/>

            {/* Modal de inicio de sesión */}
            {showLoginModal && (
                <LoginForm onClose={handleCloseModal}/>
            )}
        </div>
    );
};

export default Welcome;