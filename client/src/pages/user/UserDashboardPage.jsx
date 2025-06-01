import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSaldos } from "../../context/SaldosContext";
import { useNavigate } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import GraficaIngresosGastos from "../../components/ui/GraficaIngresosGastos";
import InfoTooltip from "../../components/ui/InfoToolTip";
import WelcomeHeader from "../../components/ui/WelcomeHeader";
import AnalisisGastos from '../../components/ui/AnalisisGastos';
import NewOperationModal from "../../components/ui/NewOperationModal";
import Boton from "../../components/ui/Boton";

const UserDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { mostrarSaldos } = useSaldos();
    const [openNewOperation, setOpenNewOperation] = useState(false);
    
    // Ref para el componente de análisis
    const analisisRef = useRef();

    const handleOperationSuccess = () => {
        // Refrescar el análisis cuando se complete una operación
        if (analisisRef.current) {
            analisisRef.current.refetch();
        }
    };

    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem-2.5rem)]">
            <WelcomeHeader />

            {/* Botón de acceso rápido para nueva operación */}
            <div className="mb-6">
                <div className="bg-gradient-to-r from-aguazul to-aguazul/50 rounded-lg p-4 text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                        <div className="mb-3 sm:mb-0">
                            <h3 className="text-lg font-semibold mb-1">Registra una nueva operación</h3>
                            <p className="text-blue-100 text-sm">
                                Añade ingresos, gastos o transferencias de forma rápida
                            </p>
                        </div>
                        <Boton
                            tipo="secundario"
                            onClick={() => setOpenNewOperation(true)}
                            className="flex items-center bg-white text-aguazul hover:bg-aguazul"
                        >
                            <PlusCircle size={18} className="mr-2" />
                            Nueva operación
                        </Boton>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <h2 className="text-lg font-semibold text-aguazul mr-2">Flujo de ingresos y gastos</h2>
                        <InfoTooltip
                            tooltipText="Visualización comparativa entre tus ingresos y gastos durante el período seleccionado. Excluye transacciones rectificativas y rectificadas para mostrar solo el flujo financiero real."
                            position='top'
                            moreInfo={false}
                        />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 h-80">
                    <GraficaIngresosGastos />
                </div>
            </div>

            <div className="mb-6">
                <AnalisisGastos ref={analisisRef} />
            </div>

            {/* Modal para nueva operación con callback */}
            <NewOperationModal
                open={openNewOperation}
                onOpenChange={setOpenNewOperation}
                onOperationSuccess={handleOperationSuccess}  // Nuevo prop
                cuentaId={null}
            />
        </div>
    );
}

export default UserDashboardPage;