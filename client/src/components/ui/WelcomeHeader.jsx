import { useAuth } from "../../context/AuthContext";

const WelcomeHeader = () => {

    const { user } = useAuth();
    const userName = user?.nombre || "Usuario";

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

    return (
        <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-2">
                        <div className="bg-aguazul-100 p-2 rounded-full mr-4">
                            <span className="text-2xl">👋</span>
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                                {getSaludo()}, {userName || "Usuario"}
                            </h1>
                            <p className="text-neutral-600 mt-1">
                                Aquí está tu resumen financiero.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center sm:items-end">
                    <div className="text-neutral-500 text-sm">
                        {getFechaActual()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeHeader;