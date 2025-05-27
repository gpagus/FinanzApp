import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import { fetchWithAuth } from "../../api/fetchWithAuth";

const WelcomeHeader = () => {
    const { user } = useAuth();
    const userName = user?.nombre || "Usuario";
    const isAdmin = user?.rol === "admin";
    const [sistemaActivo, setSistemaActivo] = useState(null); // null = checking, true = active, false = error

    useEffect(() => {
        if (isAdmin) {
            verificarEstadoSistema();
        }
    }, [isAdmin]);

    const verificarEstadoSistema = async () => {
        try {
            const response = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/admin/health`);
            
            if (response.ok) {
                setSistemaActivo(true);
            } else {
                setSistemaActivo(false);
            }
        } catch (error) {
            console.error('Error verificando estado del sistema:', error);
            setSistemaActivo(false);
        }
    };

    const getSaludo = () => {
        const hora = new Date().getHours();
    
        if (hora >= 6 && hora < 12) {
            return "Buenos días";
        } else if (hora >= 12 && hora < 20) {
            return "Buenas tardes";
        } else if (hora >= 20 || hora < 6) {
            return "Buenas noches";
        } else {
            return "Hola";
        }
    };

    const getFechaActual = () => {
        return new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        });
    };

    const getTextoResumen = () => {
        if (isAdmin) {
            return "Panel de administración de FinanzApp";
        }
        return "Aquí está tu resumen financiero.";
    };

    const getEmoji = () => {
        return isAdmin ? "⚙️" : "👋";
    };

    const getEstadoSistema = () => {
        if (sistemaActivo === null) {
            return {
                color: "bg-warning",
                texto: "Verificando...",
                icono: "🔄"
            };
        } else if (sistemaActivo === true) {
            return {
                color: "bg-success",
                texto: "Sistema activo",
                icono: "✅"
            };
        } else {
            return {
                color: "bg-error",
                texto: "Sistema con errores",
                icono: "❌"
            };
        }
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-2">
                        <div className={`${isAdmin ? 'bg-aguazul' : 'bg-aguazul-100'} p-2 rounded-full mr-4`}>
                            <span className="text-2xl">{getEmoji()}</span>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                                {getSaludo()}, {userName}
                                {isAdmin && <span className="text-aguazul ml-2">(Admin)</span>}
                            </h1>
                            <p className="text-neutral-600 mt-1">
                                {getTextoResumen()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-end">
                    <div className="text-neutral-500 text-sm">
                        {getFechaActual()}
                    </div>
                    {isAdmin && (
                        <div className="flex items-center mt-2">
                            <div className={`w-2 h-2 rounded-full ${getEstadoSistema().color} mr-2 ${sistemaActivo === null ? 'animate-pulse' : ''}`}></div>
                            <span className="text-xs text-neutral-500">
                                {getEstadoSistema().texto}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WelcomeHeader;