import React from "react";
import {
    LineChart as LineChartIcon,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";
import Boton from "../../components/ui/Boton";
import {useAuth} from "../../context/AuthContext";
import {useSaldos} from "../../context/SaldosContext";
import {formatearMoneda} from "../../utils/formatters";
import {useCuentas} from "../../hooks/useCuentas";
import {useNavigate} from "react-router-dom";
import ResumenFinanciero from "../../components/ui/ResumenFinanciero";
import GraficaIngresosGastos from "../../components/ui/GraficaIngresosGastos";

const UserDashboardPage = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const {mostrarSaldos} = useSaldos();
    const {
        cuentas,
        isLoading,
        balanceTotal,
        balancePositivo,
        balanceNegativo
    } = useCuentas();

    // Obtener las últimas 3 cuentas (para el acceso rápido)
    const cuentasRecientes = [...cuentas]
        .sort((a, b) => new Date(b.last_update) - new Date(a.last_update))
        .slice(0, 3);


    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem-2.5rem)]">
            {/* Cabecera con saludo */}
            <h1 className="text-2xl mb-6 font-bold text-aguazul">
                Bienvenido, {user?.nombre || "Usuario"} 👋
            </h1>

            {/* Panel de resumen financiero */}
            <ResumenFinanciero
                balanceTotal={balanceTotal}
                balancePositivo={balancePositivo}
                balanceNegativo={balanceNegativo}
                mostrarSaldos={mostrarSaldos}
                className="mb-6"
            />

            {/* Sección de gráfica */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-aguazul">Flujo de ingresos y gastos</h2>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4 h-80">
                    <GraficaIngresosGastos/>
                </div>
            </div>

            {/* Cuentas recientes */}
            {cuentasRecientes.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-aguazul">Cuentas recientes</h2>
                        <Boton
                            tipo="texto"
                            onClick={() => navigate("/cuentas")}
                            className="text-aguazul"
                        >
                            Ver todas
                        </Boton>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <ul className="divide-y divide-neutral-200">
                            {cuentasRecientes.map((cuenta) => (
                                <li key={cuenta.id}>
                                    <Boton
                                        tipo="icono"
                                        onClick={() => navigate(`/cuentas/${cuenta.id}`)}
                                        className="w-full text-left hover:bg-neutral-100 no-underline"
                                    >
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div
                                                    className={`p-2 rounded-full mr-3 ${cuenta.balance >= 0 ? 'bg-success-100' : 'bg-error-100'}`}>
                                                    <CreditCard size={20}/>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-neutral-900">{cuenta.nombre}</h3>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <p className={`font-semibold ${cuenta.balance >= 0 ? 'text-success' : 'text-error'}`}>
                                                    {mostrarSaldos ? formatearMoneda(cuenta.balance) : '••••••'}
                                                </p>
                                                {cuenta.balance >= 0 ? (
                                                    <ArrowUpRight size={18} className="ml-2 text-success"/>
                                                ) : (
                                                    <ArrowDownRight size={18} className="ml-2 text-error"/>
                                                )}
                                            </div>
                                        </div>
                                    </Boton>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Botón para ver todas las cuentas */}
        </div>
    );
}

export default UserDashboardPage;