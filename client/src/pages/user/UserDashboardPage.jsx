import React from "react";
import {
    PlusCircle,
    LineChart as LineChartIcon,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Calendar
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
        .sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate))
        .slice(0, 3);


    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem-2.5rem)]">
            {/* Cabecera con saludo */}

            <h1 className="text-2xl mb-6 font-bold text-aguazul">
                Bienvenido, {user?.nombre || "Usuario"}
            </h1>

            {/* Panel de resumen financiero */}
            <ResumenFinanciero
                balanceTotal={balanceTotal}
                balancePositivo={balancePositivo}
                balanceNegativo={balanceNegativo}
                mostrarSaldos={mostrarSaldos}
                className="mb-6"
            />

            {/* Sección de acciones rápidas */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold text-aguazul mb-4">Acciones rápidas</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Boton
                        tipo="primario"
                        onClick={() => navigate("/operaciones/nueva")}
                        className="flex items-center justify-center py-4"
                    >
                        <PlusCircle size={20} className="mr-2"/>
                        Nueva operación
                    </Boton>
                    <Boton
                        tipo="secundario"
                        onClick={() => navigate("/cuentas")}
                        className="flex items-center justify-center py-4"
                    >
                        <CreditCard size={20} className="mr-2"/>
                        Ver cuentas
                    </Boton>
                    <Boton
                        tipo="secundario"
                        onClick={() => navigate("/operaciones")}
                        className="flex items-center justify-center py-4"
                    >
                        <Calendar size={20} className="mr-2"/>
                        Historial
                    </Boton>
                    <Boton
                        tipo="secundario"
                        onClick={() => navigate("/presupuestos")}
                        className="flex items-center justify-center py-4"
                    >
                        <Wallet size={20} className="mr-2"/>
                        Presupuestos
                    </Boton>
                </div>
            </div>

            {/* Sección de gráfica */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-aguazul">Flujo de ingresos y gastos (último mes)</h2>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-2 flex flex-col items-center justify-center"
                     style={{height: "300px"}}>
                    <GraficaIngresosGastos/>
                </div>
            </div>

            {/* Cuentas recientes */}
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
                    {cuentasRecientes.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-neutral-600 mb-4">No tienes cuentas configuradas</p>
                            <Boton
                                tipo="texto"
                                onClick={() => navigate("/cuentas")}
                            >
                                Añade tu primera cuenta
                            </Boton>
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}

export default UserDashboardPage;