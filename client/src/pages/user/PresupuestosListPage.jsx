import {useState} from 'react';
import {
    PlusCircle,
    Calendar,
    Loader,
    PieChart,
    Clock, EllipsisVertical
} from 'lucide-react';
import InfoTooltip from "../../components/ui/InfoToolTip";
import Boton from '../../components/ui/Boton';
import {useSaldos} from "../../context/SaldosContext";
import {formatearFecha, formatearMoneda} from "../../utils/formatters";
import PresupuestoForm from "../../components/ui/forms/PresupuestoForm";
import {usePresupuestos} from '../../hooks/usePresupuestos';
import ProgressBar from '../../components/ui/ProgressBar';
import {CATEGORIAS} from '../../utils/constants';
import DropdownMenu from "../../components/ui/DropdownMenu";
import ConfirmModal from "../../components/ui/ConfirmModal";

const PresupuestosListPage = () => {
    const {
        presupuestos,
        isLoading,
        isError,
        error,
        agregarPresupuesto,
        actualizarPresupuesto,
        eliminarPresupuesto,
        isAdding,
    } = usePresupuestos();

    const {mostrarSaldos} = useSaldos();
    const [tipoVistaActual, setTipoVistaActual] = useState('activos'); // 'activos' o 'expirados'
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

    // Filtrar presupuestos según su estado
    const presupuestosActivos = presupuestos?.filter(p => p.estado) || [];
    const presupuestosExpirados = presupuestos?.filter(p => !p.estado) || [];

    // Ordenar presupuestos por fecha de fin (más cercanos primero)
    const presupuestosActivosOrdenados = [...presupuestosActivos].sort(
        (a, b) => new Date(a.fecha_fin) - new Date(b.fecha_fin)
    );

    // Ordenar presupuestos expirados por fecha de fin (más recientes primero)
    const presupuestosExpiradosOrdenados = [...presupuestosExpirados].sort(
        (a, b) => new Date(b.fecha_fin) - new Date(a.fecha_fin)
    );

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleSubmitPresupuesto = async (data) => {
        try {
            if (presupuestoSeleccionado) {
                await actualizarPresupuesto({
                    id: presupuestoSeleccionado.id,
                    datos: data
                });
            } else {
                await agregarPresupuesto(data);
            }
            setMostrarFormulario(false);
            setPresupuestoSeleccionado(null);
        } catch (error) {
            console.error("Error al gestionar el presupuesto:", error.message);
        }
    };

    const calcularDiasRestantes = (fechaFin) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const diferencia = fin - hoy;
        return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)));
    };

    const calcularDiasExpirado = (fechaFin) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const diferencia = hoy - fin;
        return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    };

    const getEstadoPresupuesto = (presupuesto) => {
        const porcentaje = (presupuesto.progreso / presupuesto.limite) * 100;

        if (porcentaje < 70) return {clase: 'text-success', estado: 'Controlado'}; // Verde
        if (porcentaje < 99) return {clase: 'text-warning', estado: 'Limitado'}; // Amarillo
        return {clase: 'text-error', estado: 'Excedido'}; // Rojo
    };

    const obtenerCategoria = (categoriaId) => {
        const categoria = CATEGORIAS.find(cat => cat.value === categoriaId);
        return categoria ? categoria.label : "Sin categoría";
    };

    const handleNuevoPresupuesto = () => {
        setPresupuestoSeleccionado(null);
        setMostrarFormulario(true);
    };


    /* ---------------------- acciones dropdown ---------------------- */
    const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState(null);

    const acciones = (presupuesto) => {
        return [
            {
                label: 'Editar',
                onClick: () => handleEditarPresupuesto(presupuesto),
                hidden: presupuesto.estado === false
            },
            {
                label: 'Eliminar',
                onClick: () => {
                    setPresupuestoSeleccionado(presupuesto);
                    setMostrarModalEliminacion(true);
                },
                className: 'text-red-600',
            },
        ].filter(action => !action.hidden);
    };

    /* ---------------------- eliminar presupuesto ---------------------- */
    const handleEliminarPresupuesto = () => {
        setMostrarModalEliminacion(false);
        eliminarPresupuesto(presupuestoSeleccionado.id)
            .then(() => {
                console.log("Presupuesto eliminado");
            })
            .catch((error) => {
                console.error("Error al eliminar el presupuesto:", error.message);
            });
    };

    /* ---------------------- editar presupuesto ---------------------- */
    const handleEditarPresupuesto = (presupuesto) => {
        setPresupuestoSeleccionado(presupuesto);
        setMostrarFormulario(true);
    };


    if (isLoading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="flex flex-col items-center">
                    <Loader size={48} className="text-aguazul animate-spin mb-4"/>
                    <p className="text-neutral-600">Cargando tus presupuestos...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="text-center p-6 bg-error-100 rounded-lg max-w-md">
                    <h2 className="text-xl font-bold text-error mb-2">Error al cargar los presupuestos</h2>
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
            <div className="mb-8">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-aguazul">Mis Presupuestos</h1>
                    <span className="ml-2">
                        <InfoTooltip
                            tooltipText="Los presupuestos te ayudan a controlar tus gastos por categoría"
                            detailTitle="Cómo funcionan los presupuestos"
                            detailContent={[
                                {
                                    title: "Crea objetivos financieros",
                                    description: "Establece límites de gasto para diferentes categorías como transporte, alimentación o entretenimiento."
                                },
                                {
                                    title: "Define períodos",
                                    description: "Cada presupuesto tiene una fecha de inicio y fin. Puedes crear presupuestos semanales, mensuales o personalizados."
                                },
                                {
                                    title: "Seguimiento automático",
                                    description: "Tus gastos se asignan automáticamente al presupuesto correspondiente para que puedas ver tu progreso."
                                }
                            ]}
                        />
                    </span>
                </div>
            </div>

            {/* Resumen de presupuestos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm text-neutral-600 mb-1">Presupuestos activos</h3>
                    <p className="text-2xl font-bold text-aguazul">
                        {presupuestosActivos.length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm text-neutral-600 mb-1">Total presupuestado</h3>
                    <p className="text-2xl font-bold text-aguazul">
                        {mostrarSaldos ? formatearMoneda(
                            presupuestos?.reduce((acc, p) => acc + parseFloat(p.limite), 0) || 0
                        ) : '••••••'}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm text-neutral-600 mb-1">Total gastado</h3>
                    <p className="text-2xl font-bold text-aguazul">
                        {mostrarSaldos ? formatearMoneda(
                            presupuestos?.reduce((acc, p) => acc + parseFloat(p.progreso), 0) || 0
                        ) : '••••••'}
                    </p>
                </div>
            </div>

            {/* Botones de navegación entre vistas */}
            <div className="flex mb-6">
                <div className="rounded-lg inline-flex">
                    <Boton
                        tipo="texto"
                        className={`px-4 py-2 rounded-l-lg font-medium ${tipoVistaActual === 'activos' ? 'bg-aguazul text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                        onClick={() => setTipoVistaActual('activos')}
                    >
                        Presupuestos Activos ({presupuestosActivos.length})
                    </Boton>
                    <Boton
                        tipo="texto"
                        className={`px-4 py-2 rounded-r-lg font-medium ${tipoVistaActual === 'expirados' ? 'bg-aguazul text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                        onClick={() => setTipoVistaActual('expirados')}
                    >
                        Presupuestos Expirados ({presupuestosExpirados.length})
                    </Boton>
                </div>
            </div>

            {/* Botón de añadir */}
            <div className="flex justify-end mb-4">
                <Boton
                    tipo="primario"
                    onClick={handleNuevoPresupuesto}
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
                            Nuevo presupuesto
                        </>
                    )}
                </Boton>
            </div>

            {/* Lista de presupuestos activos */}
            {tipoVistaActual === 'activos' && (
                <>
                    {presupuestosActivos.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <PieChart size={48} className="mx-auto mb-4 text-neutral-300"/>
                            <p className="text-neutral-600 mb-4">No tienes presupuestos activos</p>
                            <Boton
                                tipo="texto"
                                onClick={handleNuevoPresupuesto}
                                disabled={isAdding}
                            >
                                Crea un nuevo presupuesto
                            </Boton>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {presupuestosActivosOrdenados.map((presupuesto) => {
                                const diasRestantes = calcularDiasRestantes(presupuesto.fecha_fin);
                                const porcentajeProgreso = Math.min(100, (presupuesto.progreso / presupuesto.limite) * 100);
                                const estadoInfo = getEstadoPresupuesto(presupuesto);

                                return (
                                    <div
                                        key={presupuesto.id}
                                        className="bg-white rounded-lg shadow-sm"
                                    >
                                        <div className="p-4 border-b border-neutral-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center">
                                                    <h3 className="font-semibold text-neutral-900 text-lg">
                                                        {obtenerCategoria(presupuesto.categoria_id)}
                                                    </h3>
                                                    <DropdownMenu
                                                        triggerIcon={<EllipsisVertical size={20}
                                                                                       className="text-neutral-400"/>}
                                                        actions={acciones(presupuesto)}
                                                    />
                                                </div>

                                                <span
                                                    className={`text-sm font-medium px-2 py-1 rounded-full ${estadoInfo.clase === 'text-success' ? 'bg-success-100 text-success' : estadoInfo.clase === 'text-warning' ? 'bg-warning-100 text-warning' : 'bg-error-100 text-error'}`}>
                                                    {estadoInfo.estado}
                                                </span>
                                            </div>

                                            <div className="flex items-center text-neutral-600 text-sm mb-4">
                                                <Calendar size={16} className="mr-1"/>
                                                <span>
                                                    {formatearFecha(presupuesto.fecha_inicio)} - {formatearFecha(presupuesto.fecha_fin)}
                                                    {diasRestantes > 0 &&
                                                        <span className="ml-1 text-success-700">
                                                            ({diasRestantes} días restantes)
                                                        </span>
                                                    }
                                                </span>
                                            </div>

                                            <div className="mb-2">
                                                <ProgressBar
                                                    porcentaje={porcentajeProgreso}
                                                    className={
                                                        porcentajeProgreso < 70
                                                            ? 'bg-success'
                                                            : porcentajeProgreso < 99
                                                                ? 'bg-warning'
                                                                : 'bg-error'
                                                    }
                                                />
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-neutral-600">Gastado</p>
                                                    <p className="font-medium text-neutral-900">
                                                        {mostrarSaldos ? formatearMoneda(presupuesto.progreso) : '••••••'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-neutral-600">Límite</p>
                                                    <p className="font-medium text-neutral-900">
                                                        {mostrarSaldos ? formatearMoneda(presupuesto.limite) : '••••••'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Lista de presupuestos expirados */}
            {tipoVistaActual === 'expirados' && (
                <>
                    {presupuestosExpirados.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                            <Clock size={48} className="mx-auto mb-4 text-neutral-300"/>
                            <p className="text-neutral-600">No tienes presupuestos expirados</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {presupuestosExpiradosOrdenados.map((presupuesto) => {
                                const diasExpirado = calcularDiasExpirado(presupuesto.fecha_fin);
                                const porcentajeProgreso = Math.min(100, (presupuesto.progreso / presupuesto.limite) * 100);

                                return (
                                    <div
                                        key={presupuesto.id}
                                        className="bg-neutral-50 rounded-lg shadow-sm hover:shadow transition-shadow cursor-pointer"
                                    >
                                        <div className="p-4 border-b border-neutral-200">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center">
                                                    <h3 className="font-semibold text-neutral-700 text-lg">
                                                        {obtenerCategoria(presupuesto.categoria_id)}
                                                    </h3>
                                                    <DropdownMenu
                                                        triggerIcon={<EllipsisVertical size={20}
                                                                                       className="text-neutral-400"/>}
                                                        actions={acciones(presupuesto)}
                                                    />
                                                </div>
                                                <span
                                                    className="text-sm font-medium px-2 py-1 rounded-full bg-neutral-200 text-neutral-700">
                                                    Expirado
                                                </span>
                                            </div>

                                            <div className="flex items-center text-neutral-600 text-sm mb-4">
                                                <Calendar size={16} className="mr-1"/>
                                                <span>
                                                    {formatearFecha(presupuesto.fecha_inicio)} - {formatearFecha(presupuesto.fecha_fin)}
                                                    <span className="ml-1 text-neutral-500">
                                                        (Hace {diasExpirado} días)
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="mb-2">
                                                <ProgressBar
                                                    porcentaje={porcentajeProgreso}
                                                    className={
                                                        porcentajeProgreso < 70
                                                            ? 'bg-success opacity-60'
                                                            : porcentajeProgreso < 99
                                                                ? 'bg-warning opacity-60'
                                                                : 'bg-error opacity-60'
                                                    }
                                                />
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm text-neutral-500">Gastado</p>
                                                    <p className="font-medium text-neutral-700">
                                                        {mostrarSaldos ? formatearMoneda(presupuesto.progreso) : '••••••'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-neutral-500">Límite</p>
                                                    <p className="font-medium text-neutral-700">
                                                        {mostrarSaldos ? formatearMoneda(presupuesto.limite) : '••••••'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {/* Formulario de creación de presupuesto */}
            <PresupuestoForm
                mostrar={mostrarFormulario}
                presupuestoSeleccionado={presupuestoSeleccionado}
                onSubmitPresupuesto={handleSubmitPresupuesto}
                onClose={() => {
                    setMostrarFormulario(false);
                    setPresupuestoSeleccionado(null);
                }}
            />

            {/* Modal de confirmación de eliminación */}
            <ConfirmModal
                isOpen={mostrarModalEliminacion}
                onClose={() => setMostrarModalEliminacion(false)}
                onConfirm={handleEliminarPresupuesto}
                title="Confirmar eliminación"
                message="¿Estás seguro de que deseas eliminar esta presupuesto?."
                confirmLabel="Eliminar"
                cancelLabel="Cancelar"
            />

        </div>
    );
}

export default PresupuestosListPage;