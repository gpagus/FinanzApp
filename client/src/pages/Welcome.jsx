import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import Boton from "../components/ui/Boton";
import LoginForm from "../components/ui/forms/LoginForm.jsx";
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
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Función para abrir el modal
    const handleOpenModal = () => {
        setShowLoginModal(true);
    };

    // Función que se pasa como onClose al modal
    const handleCloseModal = () => {
        setShowLoginModal(false);
    };

    const navigate = useNavigate();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return; // Espera a que termine la carga

        if (user) {
            if (user.rol === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        }
    }, [user, loading, navigate]);

    return (
        <div className="flex flex-col bg-neutral-100 overflow-x-hidden">
            {/* Contenido principal */}
            <main className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 sm:p-6">
                {/* Columna izquierda - Texto */}
                <div className="md:w-1/2 flex flex-col justify-center md:pr-8 lg:pr-12 md:mt-0">
                    <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl text-neutral-900 leading-tight">
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
                        <div className="absolute -top-4 -left-4 w-full h-full bg-dollar-500 opacity-10 rounded-xl transform rotate-3"></div>
                        <div className="relative bg-white rounded-lg shadow-lg overflow-hidden">
                            {/* Header del balance */}
                            <div className="p-4 sm:p-6 border-b border-neutral-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="font-bold text-lg text-neutral-900">Balance</h2>
                                        <p className="font-bold text-2xl sm:text-3xl text-dollar-500">4.250,00€</p>
                                    </div>
                                    <div className="bg-dollar-500 bg-opacity-10 p-3 rounded-full">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Lista de transacciones simulada */}
                            <div>
                                {/* Fecha */}
                                <div className="px-4 py-2 bg-neutral-100">
                                    <p className="font-medium text-sm text-neutral-600">Hoy</p>
                                </div>
                                
                                {/* Transacciones */}
                                <div className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="mr-3 text-xl">🛒</div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Supermercado</p>
                                                <p className="text-sm text-neutral-600">14:30</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-error">-125,00€</p>
                                    </div>
                                </div>

                                <div className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="mr-3 text-xl">☕</div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Café</p>
                                                <p className="text-sm text-neutral-600">09:15</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-error">-4,50€</p>
                                    </div>
                                </div>

                                {/* Fecha anterior */}
                                <div className="px-4 py-2 bg-neutral-100">
                                    <p className="font-medium text-sm text-neutral-600">Ayer</p>
                                </div>

                                <div className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="mr-3 text-xl">💰</div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Salario</p>
                                                <p className="text-sm text-neutral-600">08:00</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-success">+2.500,00€</p>
                                    </div>
                                </div>

                                <div className="hover:bg-neutral-50 transition-colors">
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="mr-3 text-xl">🏦</div>
                                            <div>
                                                <p className="font-medium text-neutral-900">Ahorro mensual</p>
                                                <p className="text-sm text-neutral-600">07:30</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-error">-300,00€</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Características */}
            <section className="bg-white py-12 sm:py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="font-bold text-2xl sm:text-3xl text-center text-neutral-900 mb-8 sm:mb-12">
                        Todo lo que necesitas para gestionar tu dinero
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
                        <div className="bg-neutral-100 p-6 rounded-xl">
                            <div className="bg-dollar-500 bg-opacity-10 p-4 inline-flex rounded-full mb-4">
                                <BarChart2 className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="font-bold text-xl text-neutral-900 mb-2">
                                Visualiza tus finanzas
                            </h3>
                            <p className="text-aguazul">
                                Obtén gráficas claras de ingresos y gastos que te permiten
                                entender tus patrones de consumo de forma sencilla.
                            </p>
                        </div>
                        <div className="bg-neutral-100 p-6 rounded-xl">
                            <div className="bg-dollar-500 bg-opacity-10 p-4 inline-flex rounded-full mb-4">
                                <ClipboardList className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="font-bold text-xl text-neutral-900 mb-2">
                                Organiza tus gastos
                            </h3>
                            <p className="text-aguazul">
                                Clasifica tus transacciones por categorías predefinidas
                                para mantener un control ordenado de tus finanzas.
                            </p>
                        </div>
                        <div className="bg-neutral-100 p-6 rounded-xl">
                            <div className="bg-dollar-500 bg-opacity-10 p-4 inline-flex rounded-full mb-4">
                                <Target className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="font-bold text-xl text-neutral-900 mb-2">
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
            {/* Modal de inicio de sesión */}
            {showLoginModal && (
                <LoginForm onClose={handleCloseModal}/>
            )}
        </div>
    );
};

export default Welcome;