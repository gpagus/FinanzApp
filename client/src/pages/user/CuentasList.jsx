import {useState} from 'react';
import {
    PlusCircle,
    CreditCard,
    PiggyBank,
    TrendingUp,
    Loader
} from 'lucide-react';
import Boton from '../../components/ui/Boton';
import {useCuentas} from '../../hooks/useCuentas';
import {useNavigate} from "react-router-dom";
import {useSaldos} from "../../context/SaldosContext";
import {formatearFecha, formatearMoneda} from "../../utils/formatters";
import CuentaForm from "../../components/ui/forms/CuentaForm.jsx";
import {TIPOS_CUENTA} from "../../utils/constants";
import ResumenFinanciero from "../../components/ui/stats/ResumenFinanciero.jsx";

const tiposCuenta = [
    {id: 'corriente', nombre: 'Cuenta Corriente', icono: <CreditCard size={20}/>},
    {id: 'ahorro', nombre: 'Cuenta de Ahorro', icono: <PiggyBank size={20}/>},
    {id: 'credito', nombre: 'Tarjeta de Crédito', icono: <CreditCard size={20}/>},
    {id: 'inversion', nombre: 'Inversión', icono: <TrendingUp size={20}/>}
];

const CuentasList = () => {
    const {
        cuentas,
        isLoading,
        isError,
        error,
        balanceTotal,
        balancePositivo,
        balanceNegativo,
        agregarCuenta,
        isAdding,
    } = useCuentas();

    const navigate = useNavigate();
    const {mostrarSaldos} = useSaldos();

    // Ordenar cuentas por balance descendente
    const cuentasOrdenadas = [...cuentas].sort((a, b) => b.balance - a.balance);


    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleCreateCuenta = async (data) => {
        try {
            await agregarCuenta(data);
            setMostrarFormulario(false);
        } catch (error) {
            console.error("Error al crear la cuenta:", error.message);
        }
    };


    const getIconoTipo = (tipo) => {
        const tipoEncontrado = tiposCuenta.find(t => t.id === tipo);
        return tipoEncontrado ? tipoEncontrado.icono : <CreditCard size={20}/>;
    };
    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="flex flex-col items-center">
                    <Loader size={48} className="text-aguazul animate-spin mb-4"/>
                    <p className="text-neutral-600">Cargando tus cuentas...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="text-center p-6 bg-error-100 rounded-lg max-w-md">
                    <h2 className="text-xl font-bold text-error mb-2">Error al cargar las cuentas</h2>
                    <p className="text-neutral-700 mb-4">{error?.message || 'Ha ocurrido un error inesperado.'}</p>
                    <Boton
                        tipo="primario"
                        onClick={() => window.location.reload()}
                    >
                        Intentar de nuevo
                    </Boton>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem-2.5rem)]">

            {/* Cabecera */}
            <h1 className="text-2xl mb-6 font-bold text-aguazul">Mis Cuentas</h1>

            {/* Panel de resumen financiero (ahora usando el componente) */}
            <ResumenFinanciero
                balanceTotal={balanceTotal}
                balancePositivo={balancePositivo}
                balanceNegativo={balanceNegativo}
                mostrarSaldos={mostrarSaldos}
                className="mb-6"
            />

            {/* Lista de cuentas */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-aguazul">Mis cuentas</h2>
                    <Boton
                        tipo="primario"
                        onClick={() => setMostrarFormulario(true)}
                        className="flex items-center"
                        disabled={isAdding}
                    >
                        {isAdding ? (
                            <>
                                <Loader size={18} className="animate-spin mr-2"/>
                                Añadiendo...
                            </>
                        ) : (
                            <>
                                <PlusCircle size={18} className="mr-2"/>
                                Añadir cuenta
                            </>
                        )}
                    </Boton>
                </div>

                {cuentas.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-neutral-600 mb-4">No tienes cuentas configuradas</p>
                        <Boton
                            tipo="texto"
                            onClick={() => setMostrarFormulario(true)}
                            disabled={isAdding}
                        >
                            Añade tu primera cuenta
                        </Boton>
                    </div>
                ) : (
                    <ul className="divide-y divide-neutral-200">
                        {cuentasOrdenadas.map((cuenta) => {
                            const IconoTipo = () => getIconoTipo(cuenta.tipo);
                            const tipoInfo = tiposCuenta.find(t => t.id === cuenta.tipo);
                            return (
                                <li key={cuenta.id}>
                                    <Boton
                                        tipo="icono"
                                        onClick={() => navigate(`/cuentas/${cuenta.id}`)}
                                        className={`w-full text-left hover:bg-neutral-100 no-underline`}
                                    >
                                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between">
                                            <div className="flex items-center mb-2 sm:mb-0">
                                                <div
                                                    className={`p-2 rounded-full mr-3 ${cuenta.balance >= 0 ? 'bg-success-100' : 'bg-error-100'}`}>
                                                    <IconoTipo/>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-neutral-900">{cuenta.nombre}</h3>
                                                    <p className="text-sm text-neutral-600">
                                                        {tipoInfo?.nombre} •
                                                        Actualizado: {formatearFecha(cuenta.last_update)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end">
                                                <p className={`font-semibold text-right ${cuenta.balance >= 0 ? 'text-success' : 'text-error'} mr-4`}>
                                                    {mostrarSaldos ? formatearMoneda(cuenta.balance) : '••••••'}
                                                </p>
                                            </div>
                                        </div>
                                    </Boton>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Formulario de edición de cuenta */}
            <CuentaForm
                mostrar={mostrarFormulario}
                cuentaSeleccionada={null}
                onSubmitCuenta={handleCreateCuenta}
                onClose={() => setMostrarFormulario(false)}
                opcionesTiposCuenta={TIPOS_CUENTA}
            />
        </div>
    );
}

export default CuentasList;