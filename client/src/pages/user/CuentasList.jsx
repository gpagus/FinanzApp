import { useState } from 'react';
import {
    PlusCircle,
    CreditCard,
    Wallet,
    PiggyBank,
    TrendingUp,
    Euro,
    Eye,
    EyeOff,
    Edit,
    Trash2,
    BarChart2,
    Loader
} from 'lucide-react';
import Boton from '../../components/ui/Boton';
import FormField from '../../components/ui/FormField';
import ConfirmModal from '../../components/ui/ConfirmModal'; // Importa el nuevo componente
import { useCuentas } from '../../hooks/useCuentas';

const tiposCuenta = [
    { id: 'corriente', nombre: 'Cuenta Corriente', icono: <CreditCard size={20} /> },
    { id: 'ahorro', nombre: 'Cuenta de Ahorro', icono: <PiggyBank size={20} /> },
    { id: 'credito', nombre: 'Tarjeta de Crédito', icono: <CreditCard size={20} /> },
    { id: 'efectivo', nombre: 'Efectivo', icono: <Wallet size={20} /> },
    { id: 'inversion', nombre: 'Inversión', icono: <TrendingUp size={20} /> }
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
        actualizarCuenta,
        eliminarCuenta,
        isAdding,
        isUpdating,
        isDeleting
    } = useCuentas();

    const [mostrarSaldos, setMostrarSaldos] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState(null);
    const [nuevaCuenta, setNuevaCuenta] = useState({
        nombre: '',
        tipo: 'corriente',
        balance: 0
    });
    const [errores, setErrores] = useState({});
    // Estado para el modal de confirmación
    const [mostrarConfirmModal, setMostrarConfirmModal] = useState(false);
    const [cuentaAEliminar, setCuentaAEliminar] = useState(null);

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
        setErrores({});
        setMostrarFormulario(true);
    };

    const cerrarFormulario = () => {
        setMostrarFormulario(false);
        setCuentaSeleccionada(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
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

    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validación del nombre
        if (!nuevaCuenta.nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio";
        } else if (nuevaCuenta.nombre.length < 3) {
            nuevosErrores.nombre = "El nombre debe tener al menos 3 caracteres";
        } else if (nuevaCuenta.nombre.length > 28) {
            nuevosErrores.nombre = "El nombre no puede exceder los 28 caracteres";
        }

        // Validación balance
        if (nuevaCuenta.balance > 9999999999 || nuevaCuenta.balance < -9999999999) {
            nuevosErrores.balance = "El saldo no puede ser mayor a 10 dígitos";
        }
        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        if (cuentaSeleccionada) {
            actualizarCuenta(cuentaSeleccionada.id, nuevaCuenta);
        } else {
            agregarCuenta(nuevaCuenta);
        }

        cerrarFormulario();
    };

    const abrirConfirmModal = (cuenta) => {
        setCuentaAEliminar(cuenta);
        setMostrarConfirmModal(true);
    };

    const cerrarConfirmModal = () => {
        setMostrarConfirmModal(false);
        setCuentaAEliminar(null);
    };

    const handleEliminarCuenta = () => {
        if (cuentaAEliminar) {
            eliminarCuenta(cuentaAEliminar.id);
            cerrarConfirmModal();
        }
    };

    const getIconoTipo = (tipo) => {
        const tipoEncontrado = tiposCuenta.find(t => t.id === tipo);
        return tipoEncontrado ? tipoEncontrado.icono : <CreditCard size={20} />;
    };

    const formatearMoneda = (cantidad) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(cantidad);
    };

    const formatearFecha = (fechaISO) => {
        return new Date(fechaISO).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const opcionesTiposCuenta = tiposCuenta.map(tipo => ({
        value: tipo.id,
        label: tipo.nombre
    }));

    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="flex flex-col items-center">
                    <Loader size={48} className="text-aguazul animate-spin mb-4" />
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
                        disabled={isAdding}
                    >
                        {isAdding ? (
                            <>
                                <Loader size={18} className="animate-spin mr-2" />
                                Añadiendo...
                            </>
                        ) : (
                            <>
                                <PlusCircle size={18} className="mr-2" />
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
                            const estaActualizando = isUpdating && cuentaSeleccionada?.id === cuenta.id;
                            const estaEliminando = isDeleting && cuentaAEliminar?.id === cuenta.id;

                            return (
                                <li key={cuenta.id} className={`hover:bg-neutral-100 ${(estaActualizando || estaEliminando) ? 'opacity-70' : ''}`}>
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
                                            <div className="flex space-x-2">
                                                <Boton
                                                    tipo="icono"
                                                    onClick={() => abrirFormulario(cuenta)}
                                                    aria-label="Editar cuenta"
                                                    disabled={estaActualizando || estaEliminando}
                                                >
                                                    {estaActualizando ? (
                                                        <Loader size={18} className="animate-spin text-aguazul" />
                                                    ) : (
                                                        <Edit size={18} className="text-aguazul" />
                                                    )}
                                                </Boton>
                                                <Boton
                                                    tipo="icono"
                                                    onClick={() => abrirConfirmModal(cuenta)}
                                                    aria-label="Eliminar cuenta"
                                                    disabled={estaActualizando || estaEliminando}
                                                >
                                                    {estaEliminando ? (
                                                        <Loader size={18} className="animate-spin text-error" />
                                                    ) : (
                                                        <Trash2 size={18} className="text-error" />
                                                    )}
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
                        <div className="p-4 border-b border-neutral-200">
                            <h2 className="text-lg font-semibold text-aguazul">
                                {cuentaSeleccionada ? 'Editar cuenta' : 'Añadir nueva cuenta'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <FormField
                                label="Nombre de la cuenta"
                                name="nombre"
                                type="text"
                                value={nuevaCuenta.nombre}
                                onChange={handleInputChange}
                                error={errores.nombre}
                                placeholder="Ej: Cuenta Nómina"
                                disabled={isAdding || isUpdating}
                            />

                            <FormField
                                label="Tipo de cuenta"
                                name="tipo"
                                type="select"
                                value={nuevaCuenta.tipo}
                                onChange={handleInputChange}
                                error={errores.tipo}
                                options={opcionesTiposCuenta}
                                disabled={isAdding || isUpdating}
                            />

                            <FormField
                                label="Saldo inicial"
                                name="balance"
                                type="number"
                                value={nuevaCuenta.balance}
                                onChange={handleInputChange}
                                error={errores.balance}
                                placeholder="0.00"
                                step="0.01"
                                prefix={<Euro size={16} className="text-neutral-600" />}
                                hint="Use valores negativos para deudas o tarjetas de crédito"
                                disabled={isAdding || isUpdating}
                            />

                            <div className="flex justify-end space-x-3">
                                <Boton
                                    tipo="texto"
                                    onClick={cerrarFormulario}
                                    disabled={isAdding || isUpdating}
                                >
                                    Cancelar
                                </Boton>
                                <Boton
                                    tipo="primario"
                                    type="submit"
                                    disabled={isAdding || isUpdating}
                                >
                                    {(isAdding || isUpdating) ? (
                                        <>
                                            <Loader size={16} className="animate-spin mr-2" />
                                            {cuentaSeleccionada ? 'Guardando...' : 'Añadiendo...'}
                                        </>
                                    ) : (
                                        cuentaSeleccionada ? 'Guardar cambios' : 'Añadir cuenta'
                                    )}
                                </Boton>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de confirmación para eliminar cuenta */}
            <ConfirmModal
                isOpen={mostrarConfirmModal}
                onClose={cerrarConfirmModal}
                onConfirm={handleEliminarCuenta}
                title="Confirmar eliminación"
                message={`¿Estás seguro de que deseas eliminar la cuenta "${cuentaAEliminar?.nombre}"? Se borrarán en conjunto todas las transacciones relacionadas.`}
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
                isLoading={isDeleting && cuentaAEliminar?.id === cuentaAEliminar?.id}
            />
        </div>
    );
}

export default CuentasList;