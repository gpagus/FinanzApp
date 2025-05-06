
import {useState} from 'react';
import {
    PlusCircle,
    CreditCard,
    Wallet,
    PiggyBank,
    TrendingUp,
    BarChart2,
    Loader
} from 'lucide-react';
import Boton from '../../components/ui/Boton';
import {validarCuenta} from "../../utils/validaciones";
import {useCuentas} from '../../hooks/useCuentas';
import {useNavigate} from "react-router-dom";
import {useSaldos} from "../../context/SaldosContext";
import {formatearMoneda, formatearFecha} from "../../utils/formatters";
import CuentaForm from "../../components/ui/CuentaForm";
import {TIPOS_CUENTA} from "../../utils/constants";


const tiposCuenta = [
    {id: 'corriente', nombre: 'Cuenta Corriente', icono: <CreditCard size={20}/>},
    {id: 'ahorro', nombre: 'Cuenta de Ahorro', icono: <PiggyBank size={20}/>},
    {id: 'credito', nombre: 'Tarjeta de Crédito', icono: <CreditCard size={20}/>},
    {id: 'efectivo', nombre: 'Efectivo', icono: <Wallet size={20}/>},
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

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
    const [nuevaCuenta, setNuevaCuenta] = useState({
        nombre: '',
        tipo: 'corriente',
        balance: 0
    });
    const [errores, setErrores] = useState({});

    const abrirFormulario = () => {
        setCuentaSeleccionada(null);
        setNuevaCuenta({
            nombre: '',
            tipo: 'corriente',
            balance: 0
        });
        setErrores({});
        setMostrarFormulario(true);
    };

    const cerrarFormulario = () => {
        setMostrarFormulario(false);
        setCuentaSeleccionada(null);
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNuevaCuenta({
            ...nuevaCuenta,
            [name]: name === 'balance' ? parseFloat(value) || 0 : value
        });
        if (errores[name]) {
            setErrores({
                ...errores,
                [name]: undefined
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nuevosErrores = validarCuenta(nuevaCuenta);
        if (Object.keys(nuevosErrores).length > 0) {
            setErrores(nuevosErrores);
            return;
        }
        agregarCuenta(nuevaCuenta);
        cerrarFormulario();
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
        <div className="px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-4rem-2.5rem)]">
            {/* Cabecera */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-aguazul">Mis Cuentas</h1>
            </div>

            {/* Panel de resumen */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-aguazul flex items-center">
                        <BarChart2 size={20} className="mr-2"/>
                        Resumen financiero
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-neutral-100 rounded-lg">
                        <p className="text-neutral-600 text-sm mb-1">Balance total</p>
                        <p className={`text-xl font-bold ${balanceTotal >= 0 ? 'text-success' : 'text-error'}`}>
                            {mostrarSaldos ? formatearMoneda(balanceTotal) : '••••••'}
                        </p>
                    </div>
                    <div className="p-4 bg-neutral-100 rounded-lg">
                        <p className="text-neutral-600 text-sm mb-1">Activos</p>
                        <p className="text-xl font-bold text-success">
                            {mostrarSaldos ? formatearMoneda(balancePositivo) : '••••••'}
                        </p>
                    </div>
                    <div className="p-4 bg-neutral-100 rounded-lg">
                        <p className="text-neutral-600 text-sm mb-1">Pasivos</p>
                        <p className="text-xl font-bold text-error">
                            {mostrarSaldos ? formatearMoneda(balanceNegativo) : '••••••'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista de cuentas */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 flex justify-between items-center border-b border-neutral-200">
                    <h2 className="text-lg font-semibold text-aguazul">Mis cuentas</h2>
                    <Boton
                        tipo="primario"
                        onClick={() => abrirFormulario()}
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
                            tipo="primario"
                            onClick={() => abrirFormulario()}
                            disabled={isAdding}
                        >
                            Añade tu primera cuenta
                        </Boton>
                    </div>
                ) : (
                    <ul className="divide-y divide-neutral-200">
                        {cuentas.map((cuenta) => {
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
                                                        Actualizado: {formatearFecha(cuenta.lastUpdate)}
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
                cuentaSeleccionada={cuentaSeleccionada}
                nuevaCuenta={nuevaCuenta}
                errores={errores}
                opcionesTiposCuenta={TIPOS_CUENTA}
                onInputChange={handleInputChange}
                onSubmit={handleSubmit}
                onClose={() => setMostrarFormulario(false)}
            />
        </div>
    );
}

export default CuentasList;