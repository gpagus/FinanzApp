import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useSaldos} from '../../context/SaldosContext';
import {useAuth} from "../../context/AuthContext";
import {formatearMoneda, formatearFecha} from '../../utils/formatters';
import {TIPOS_CUENTA} from '../../utils/constants';
import {
    ArrowLeft,
    Download,
    Share2,
    Loader,
    EllipsisVertical,
    PlusCircle,
} from 'lucide-react';

import Boton from '../../components/ui/Boton';
import {useCuentas} from '../../hooks/useCuentas';
import useTransacciones from '../../hooks/useTransacciones';
import TransaccionesList from '../../components/ui/TransaccionesList';
import TransaccionesFilters from '../../components/ui/TransaccionesFilters';
import DropdownMenu from '../../components/ui/DropdownMenu';
import ConfirmModal from '../../components/ui/ConfirmModal';
import CuentaForm from '../../components/ui/forms/CuentaForm';
import NewOperationModal from "../../components/ui/NewOperationModal";

const CuentaDetail = () => {
    const {id} = useParams();
    const navigate = useNavigate();
    const {user} = useAuth();

    /* ---------------------- cuentas ---------------------- */
    const {
        cuentas,
        isLoading,
        isUpdating,
        isError,
        error,
        eliminarCuenta,
        actualizarCuenta,
    } = useCuentas();

    const [cuenta, setCuenta] = useState(null);
    const [nuevaCuenta, setNuevaCuenta] = useState({
        nombre: '',
        tipo: '',
        balance: 0,
    });
    const [openOperacion, setOpenOperacion] = useState(false);

    const {mostrarSaldos} = useSaldos();

    /* ---------------------- transacciones ---------------------- */

    const {
        transacciones,
        hayMasTransacciones,
        cargandoTransacciones,
        cargandoMas,
        filtros,
        actualizarFiltros,
        resetearFiltros,
        cargarMasTransacciones,
    } = useTransacciones({cuentaId: id});


    /* ---------------------- localizar cuenta ---------------------- */
    useEffect(() => {
        if (!isLoading && cuentas.length > 0) {
            const cuentaEncontrada = cuentas.find((c) => c.id === id);
            if (cuentaEncontrada) {
                setCuenta(cuentaEncontrada);
            }
        }
    }, [id, cuentas, isLoading, navigate]);

    /* ---------------------- modal / formulario ---------------------- */
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [errores, setErrores] = useState({});

    /* ---------------------- helpers ---------------------- */

    /* Pre‑rellenamos el formulario cuando abrimos el modal */
    useEffect(() => {
        if (mostrarFormulario && cuenta) {
            setNuevaCuenta({
                nombre: cuenta.nombre,
                tipo: cuenta.tipo,
                balance: cuenta.balance,
            });
        }
    }, [mostrarFormulario, cuenta]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setNuevaCuenta((prev) => ({
            ...prev,
            [name]: name === 'balance' ? parseFloat(value) || 0 : value,
        }));
        if (errores[name]) {
            setErrores((prev) => ({...prev, [name]: undefined}));
        }
    };

    const validarFormulario = () => {
        const nuevosErrores = {};
        if (!nuevaCuenta.nombre.trim()) nuevosErrores.nombre = 'El nombre es obligatorio';
        if (!nuevaCuenta.tipo.trim()) nuevosErrores.tipo = 'El tipo es obligatorio';
        if (Number.isNaN(nuevaCuenta.balance)) nuevosErrores.balance = 'Saldo inválido';

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    const handleEditar = (e) => {
        e.preventDefault();
        if (!validarFormulario()) return;

        actualizarCuenta(cuenta.id, nuevaCuenta);
        setMostrarFormulario(false);
    };

    /* ---------------------- eliminar cuenta ---------------------- */
    const handleEliminarCuenta = () => {
        setMostrarConfirmacion(false);
        eliminarCuenta(cuenta.id);
        navigate('/cuentas');
    };

    /* ---------------------- acciones dropdown ---------------------- */
    const acciones = [
        {
            label: 'Editar cuenta',
            onClick: () => setMostrarFormulario(true),
        },
        {
            label: 'Eliminar cuenta',
            onClick: () => setMostrarConfirmacion(true),
            className: 'text-red-600',
        },
    ];
    /* ---------------------- estados de carga / error ---------------------- */
    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="flex flex-col items-center">
                    <Loader size={48} className="text-aguazul animate-spin mb-4"/>
                    <p className="text-neutral-600">Cargando información de la cuenta...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="text-center p-6 bg-error-100 rounded-lg max-w-md">
                    <h2 className="text-xl font-bold text-error mb-2">Error al cargar la cuenta</h2>
                    <p className="text-neutral-700 mb-4">{error?.message || 'Ha ocurrido un error inesperado.'}</p>
                    <Boton tipo="primario" onClick={() => navigate('/')}>
                        Volver al inicio
                    </Boton>
                </div>
            </div>
        );
    }

    if (!cuenta) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="text-center p-6 bg-neutral-100 rounded-lg max-w-md">
                    <h2 className="text-xl font-bold text-aguazul mb-2">Cuenta no encontrada</h2>
                    <p className="text-neutral-700 mb-4">La cuenta que buscas no existe o no tienes acceso a ella.</p>
                    <Boton tipo="primario" onClick={() => navigate('/')}>
                        Volver al inicio
                    </Boton>
                </div>
            </div>
        );
    }

    /* ---------------------- render principal ---------------------- */
    const tipoInfo = TIPOS_CUENTA.find((t) => t.id === cuenta.tipo) || TIPOS_CUENTA[0];
    const tipoCuenta = TIPOS_CUENTA.find(tipo => tipo.id === cuenta.tipo) || TIPOS_CUENTA[0];
    const IconoTipo = tipoCuenta.Icono;

    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem-2.5rem)]">
            {/* Botón volver y cabecera */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div className="flex items-center mb-3 sm:mb-0">
                        <Boton
                            tipo="icono"
                            onClick={() => navigate('/cuentas')}
                            className="mr-3"
                            aria-label="Volver a cuentas"
                        >
                            <ArrowLeft size={20}/>
                        </Boton>
                        <div
                            className={`p-2 rounded-full mr-3 ${cuenta.balance >= 0 ? 'bg-success-100' : 'bg-error-100'}`}
                        >
                            <IconoTipo size={20}/>
                        </div>
                        <h1 className="text-2xl font-bold text-aguazul">{cuenta.nombre}</h1>

                        <DropdownMenu
                            triggerIcon={<EllipsisVertical className="text-neutral-400"/>}
                            actions={acciones}
                        />
                    </div>

                    <Boton tipo="secundario" className="flex items-center" aria-label="Exportar">
                        <Download size={18} className="mr-1"/>
                        <span className="hidden sm:inline">Exportar</span>
                    </Boton>
                </div>
            </div>

            {/* Tarjeta de información de la cuenta */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-neutral-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                        <div>
                            <p className="text-neutral-600 mb-1">{tipoInfo.nombre}</p>
                            <div className="flex items-center">
                                <h2
                                    className={`text-2xl font-bold ${cuenta.balance >= 0 ? 'text-success' : 'text-error'} mr-2`}
                                >
                                    {mostrarSaldos ? formatearMoneda(cuenta.balance) : '••••••'}
                                </h2>
                            </div>
                        </div>

                        <div className="mt-4 sm:mt-0">
                            <Boton tipo="primario" className="flex items-center" onClick={() => setOpenOperacion(true)}
                                   disabled={isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <Loader size={18} className="animate-spin mr-2"/>
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle size={18} className="mr-2"/>
                                        Nueva operación
                                    </>
                                )}
                            </Boton>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-neutral-100 rounded-lg">
                            <p className="text-neutral-600 text-sm mb-1">Tipo de cuenta</p>
                            <p className="font-medium text-neutral-900">{cuenta.tipo}</p>
                        </div>
                        <div className="p-3 bg-neutral-100 rounded-lg">
                            <p className="text-neutral-600 text-sm mb-1">Titular</p>
                            <p className="font-medium text-neutral-900">{user.nombre} {user.apellidos}</p>
                        </div>
                        <div className="p-3 bg-neutral-100 rounded-lg">
                            <p className="text-neutral-600 text-sm mb-1">Fecha de creación</p>
                            <p className="font-medium text-neutral-900">{formatearFecha(cuenta.created_at)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros de transacciones */}
            <TransaccionesFilters
                filtros={filtros}
                onFilterChange={actualizarFiltros}
                onReset={resetearFiltros}
                vistaDetalleCuenta={true}
            />

            {/* Lista de transacciones */}
            <TransaccionesList
                transacciones={transacciones}
                cargando={cargandoTransacciones}
                cargandoMas={cargandoMas}
                hayMasTransacciones={hayMasTransacciones}
                cargarMas={cargarMasTransacciones}
            />


            {/* Modal para confirmar la eliminación de la cuenta */}
            <ConfirmModal
                isOpen={mostrarConfirmacion}
                onClose={() => setMostrarConfirmacion(false)}
                onConfirm={handleEliminarCuenta}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar esta cuenta? Se borrarán en conjunto todas las transacciones relacionadas."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
            />

            {/* Formulario de edición de cuenta */}
            <CuentaForm
                mostrar={mostrarFormulario}
                cuentaSeleccionada={cuenta}
                nuevaCuenta={nuevaCuenta}
                errores={errores}
                opcionesTiposCuenta={TIPOS_CUENTA}
                onInputChange={handleInputChange}
                onSubmit={handleEditar}
                onClose={() => setMostrarFormulario(false)}
            />

            <NewOperationModal
                open={openOperacion}
                onOpenChange={setOpenOperacion}
                cuentaId={cuenta.id}
            />

        </div>
    );
};

export default CuentaDetail;
