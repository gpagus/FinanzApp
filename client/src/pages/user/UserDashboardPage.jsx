import { useAuth } from "../../context/AuthContext";
import { useSaldos } from "../../context/SaldosContext";
import { useNavigate } from "react-router-dom";
import GraficaIngresosGastos from "../../components/ui/GraficaIngresosGastos";
import InfoTooltip from "../../components/ui/InfoToolTip";
import WelcomeHeader from "../../components/ui/WelcomeHeader";
import AnalisisGastos from '../../components/ui/AnalisisGastos';

const UserDashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { mostrarSaldos } = useSaldos();

    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem-2.5rem)]">
            <WelcomeHeader />

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
                <AnalisisGastos />
            </div>
        </div>
    );
}

export default UserDashboardPage;