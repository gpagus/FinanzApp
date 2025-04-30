import {useState} from 'react';
import {
    PlusCircle,
    CreditCard,
    Wallet,
    PiggyBank,
    TrendingUp,
    EuroIcon,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    BarChart2
} from 'lucide-react';
import Boton from "../../components/ui/Boton";

const tiposCuenta = [
    {id: 'corriente', nombre: 'Cuenta Corriente', icono: <CreditCard size={20}/>},
    {id: 'ahorro', nombre: 'Cuenta de Ahorro', icono: <PiggyBank size={20}/>},
    {id: 'credito', nombre: 'Tarjeta de Crédito', icono: <CreditCard size={20}/>},
    {id: 'efectivo', nombre: 'Efectivo', icono: <Wallet size={20}/>},
    {id: 'inversion', nombre: 'Inversión', icono: <TrendingUp size={20}/>}
];

// Datos de ejemplo para desarrollo
const cuentasEjemplo = [
    {
        id: '1',
        nombre: 'Nómina',
        tipo: 'corriente',
        balance: 1250.75,
        ultima_actualizacion: '2025-04-29T10:00:00'
    },
    {
        id: '2',
        nombre: 'Ahorros Vacaciones',
        tipo: 'ahorro',
        balance: 3500.00,
        ultima_actualizacion: '2025-04-28T14:30:00'
    },
    {
        id: '3',
        nombre: 'Tarjeta Visa',
        tipo: 'credito',
        balance: -450.25,
        ultima_actualizacion: '2025-04-29T18:15:00'
    },
    {
        id: '4',
        nombre: 'Monedero',
        tipo: 'efectivo',
        balance: 75.50,
        ultima_actualizacion: '2025-04-27T09:45:00'
    },
    {
        id: '5',
        nombre: 'Fondo Indexado',
        tipo: 'inversion',
        balance: 8750.33,
        ultima_actualizacion: '2025-04-26T11:20:00'
    },
    {
        id: '6',
        nombre: 'Ahorros Emergencia',
        tipo: 'ahorro',
        balance: 1500.00,
        ultima_actualizacion: '2025-04-25T16:10:00'
    },
    {
        id: '7',
        nombre: 'Tarjeta Mastercard',
        tipo: 'credito',
        balance: -1200.50,
        ultima_actualizacion: '2025-04-24T12:05:00'
    },
    {
        id: '8',
        nombre: 'Cuenta de Inversión',
        tipo: 'inversion',
        balance: 5000.00,
        ultima_actualizacion: '2025-04-23T08:30:00'
    }
];

const CuentasList = () => {
    const [cuentas, setCuentas] = useState(cuentasEjemplo);
    const [mostrarSaldos, setMostrarSaldos] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
    const [nuevaCuenta, setNuevaCuenta] = useState({
        nombre: '',
        tipo: 'corriente',
        balance: 0
    });

    // Calcular balances totales
    const balanceTotal = cuentas.reduce((total, cuenta) => total + cuenta.balance, 0);
    const balancePositivo = cuentas
        .filter(cuenta => cuenta.balance > 0)
        .reduce((total, cuenta) => total + cuenta.balance, 0);
    const balanceNegativo = cuentas
        .filter(cuenta => cuenta.balance < 0)
        .reduce((total, cuenta) => total + cuenta.balance, 0);

    // Manejadores de eventos
    const toggleMostrarSaldos = () => {
        setMostrarSaldos(!mostrarSaldos);
    };

    const abrirFormulario = (cuenta = null) => {
        if (cuenta) {
            setCuentaSeleccionada(cuenta);
            setNuevaCuenta({
                nombre: cuenta.nombre,
                tipo: cuenta.tipo,
                balance: cuenta.balance
            });
        } else {
            setCuentaSeleccionada(null);
            setNuevaCuenta({
                nombre: '',
                tipo: 'corriente',
                balance: 0
            });
        }
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
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (cuentaSeleccionada) {
            // Actualizar cuenta existente
            setCuentas(cuentas.map(c =>
                c.id === cuentaSeleccionada.id ?
                    {...c, ...nuevaCuenta, ultima_actualizacion: new Date().toISOString()} :
                    c
            ));
        } else {
            // Crear nueva cuenta
            const nuevaCuentaCompleta = {
                ...nuevaCuenta,
                id: Date.now().toString(),
                ultima_actualizacion: new Date().toISOString()
            };
            setCuentas([...cuentas, nuevaCuentaCompleta]);
        }

        cerrarFormulario();
    };

    const eliminarCuenta = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) {
            setCuentas(cuentas.filter(c => c.id !== id));
        }
    };

    // Obtener icono según tipo de cuenta
    const getIconoTipo = (tipo) => {
        const tipoEncontrado = tiposCuenta.find(t => t.id === tipo);
        return tipoEncontrado ? tipoEncontrado.icono : <CreditCard size={20}/>;
    };

    // Formatear cantidad como moneda
    const formatearMoneda = (cantidad) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(cantidad);
    };

    // Formatear fecha
    const formatearFecha = (fechaISO) => {
        return new Date(fechaISO).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="px-4 sm:px-6 lg:px-8 py-6">
            {/* Cabecera */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-aguazul">Mis Cuentas</h1>
                <p className="text-neutral-600 mt-1">Gestiona todas tus cuentas financieras en un solo lugar</p>
            </div>

            {/* Panel de resumen */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-aguazul flex items-center">
                            <BarChart2 size={20} className="mr-2"/>
                            Resumen financiero
                        </h2>
                    </div>
                    <div className="mt-2 sm:mt-0">
                        <Boton
                            tipo="icono"
                            onClick={toggleMostrarSaldos}
                            className="flex items-center"
                            aria-label={mostrarSaldos ? "Ocultar saldos" : "Mostrar saldos"}
                        >
                            {mostrarSaldos ? <EyeOff size={20}/> : <Eye size={20}/>}
                        </Boton>
                    </div>
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
                    >
                        <PlusCircle size={18} className="mr-2"/>
                        Añadir cuenta
                    </Boton>
                </div>

                {cuentas.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-neutral-600 mb-4">No tienes cuentas configuradas</p>
                        <Boton tipo="primario" onClick={() => abrirFormulario()}>
                            Añade tu primera cuenta
                        </Boton>
                    </div>
                ) : (
                    <ul className="divide-y divide-neutral-200">
                        {cuentas.map((cuenta) => {
                            const IconoTipo = () => getIconoTipo(cuenta.tipo);
                            const tipoInfo = tiposCuenta.find(t => t.id === cuenta.tipo);

                            return (
                                <li key={cuenta.id} className="hover:bg-neutral-100">
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
                                                    Actualizado: {formatearFecha(cuenta.ultima_actualizacion)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end">
                                            <p className={`font-semibold text-right ${cuenta.balance >= 0 ? 'text-success' : 'text-error'} mr-4`}>
                                                {mostrarSaldos ? formatearMoneda(cuenta.balance) : '••••••'}
                                            </p>
                                            <div className="flex space-x-2">
                                                <Boton
                                                    tipo="icono"
                                                    onClick={() => abrirFormulario(cuenta)}
                                                    aria-label="Editar cuenta"
                                                >
                                                    <Edit size={18} className="text-aguazul"/>
                                                </Boton>
                                                <Boton
                                                    tipo="icono"
                                                    onClick={() => eliminarCuenta(cuenta.id)}
                                                    aria-label="Eliminar cuenta"
                                                >
                                                    <Trash2 size={18} className="text-error"/>
                                                </Boton>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Modal/Formulario para añadir/editar cuenta */}
            {mostrarFormulario && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="p-4 border-b border-neutral-200">
                            <h2 className="text-lg font-semibold text-aguazul">
                                {cuentaSeleccionada ? 'Editar cuenta' : 'Añadir nueva cuenta'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label htmlFor="nombre" className="block text-sm font-medium text-neutral-600 mb-1">
                                    Nombre de la cuenta
                                </label>
                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre"
                                    value={nuevaCuenta.nombre}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dollar-500"
                                    placeholder="Ej: Cuenta Nómina"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label htmlFor="tipo" className="block text-sm font-medium text-neutral-600 mb-1">
                                    Tipo de cuenta
                                </label>
                                <select
                                    id="tipo"
                                    name="tipo"
                                    value={nuevaCuenta.tipo}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dollar-500"
                                    required
                                >
                                    {tiposCuenta.map(tipo => (
                                        <option key={tipo.id} value={tipo.id}>
                                            {tipo.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-6">
                                <label htmlFor="balance" className="block text-sm font-medium text-neutral-600 mb-1">
                                    Saldo inicial
                                </label>
                                <div className="relative">
                                    <div
                                        className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <EuroIcon size={16} className="text-neutral-600"/>
                                    </div>
                                    <input
                                        type="number"
                                        id="balance"
                                        name="balance"
                                        value={nuevaCuenta.balance}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-dollar-500"
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-neutral-600 mt-1">
                                    Use valores negativos para deudas o tarjetas de crédito
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Boton
                                    tipo="texto"
                                    onClick={cerrarFormulario}
                                >
                                    Cancelar
                                </Boton>
                                <Boton
                                    tipo="primario"
                                    onClick={handleSubmit}
                                >
                                    {cuentaSeleccionada ? 'Guardar cambios' : 'Añadir cuenta'}
                                </Boton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CuentasList;