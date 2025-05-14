import { useState } from 'react';
import {
    PlusCircle,
    Calendar,
    Loader,
    PieChart
} from 'lucide-react';
import Boton from '../../components/ui/Boton';
import { useNavigate } from "react-router-dom";
import { useSaldos } from "../../context/SaldosContext";
import { formatearFecha, formatearMoneda } from "../../utils/formatters";
import PresupuestoForm from "../../components/ui/forms/PresupuestoForm";
import { usePresupuestos } from '../../hooks/usePresupuestos';
import ProgressBar from '../../components/ui/ProgressBar';
import { CATEGORIAS } from '../../utils/constants'; // Importa la constante CATEGORIAS

const PresupuestosListPage = () => {
    const {
        presupuestos,
        isLoading,
        isError,
        error,
        agregarPresupuesto,
        isAdding,
    } = usePresupuestos();

    const navigate = useNavigate();
    const { mostrarSaldos } = useSaldos();

    // Ordenar presupuestos por fecha de fin (más cercanos primero)
    const presupuestosOrdenados = [...presupuestos || []].sort(
        (a, b) => new Date(a.fecha_fin) - new Date(b.fecha_fin)
    );

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const handleCreatePresupuesto = async (data) => {
        try {
            await agregarPresupuesto(data);
            setMostrarFormulario(false);
        } catch (error) {
            console.error("Error al crear el presupuesto:", error.message);
        }
    };

    const calcularDiasRestantes = (fechaFin) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const diferencia = fin - hoy;
        return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)));
    };

    const getEstadoPresupuesto = (presupuesto) => {
        const porcentaje = (presupuesto.progreso / presupuesto.limite) * 100;

        if (porcentaje < 70) return { clase: 'text-success', estado: 'Controlado' };
        if (porcentaje < 90) return { clase: 'text-warning', estado: 'Limitado' };
        return { clase: 'text-error', estado: 'Excedido' };
    };

    const obtenerCategoria = (categoriaId) => {
        const categoria = CATEGORIAS.find(cat => cat.value === categoriaId);
        return categoria ? categoria.label : "Sin categoría";
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
                <h1 className="text-2xl font-bold text-aguazul">Mis Presupuestos</h1>
                <p className="text-neutral-600">Gestiona tus límites de gastos por categoría</p>
            </div>

            {/* Resumen de presupuestos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <h3 className="text-sm text-neutral-600 mb-1">Presupuestos activos</h3>
                    <p className="text-2xl font-bold text-aguazul">
                        {presupuestos?.filter(p => new Date(p.fecha_fin) >= new Date()).length || 0}
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

            {/* Botón de añadir */}
            <div className="flex justify-end mb-4">
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
                            Nuevo presupuesto
                        </>
                    )}
                </Boton>
            </div>

            {/* Lista de presupuestos */}
            {(!presupuestos || presupuestos.length === 0) ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <PieChart size={48} className="mx-auto mb-4 text-neutral-300" />
                    <p className="text-neutral-600 mb-4">No tienes presupuestos configurados</p>
                    <Boton
                        tipo="texto"
                        onClick={() => setMostrarFormulario(true)}
                        disabled={isAdding}
                    >
                        Crea tu primer presupuesto
                    </Boton>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {presupuestosOrdenados.map((presupuesto) => {
                        const diasRestantes = calcularDiasRestantes(presupuesto.fecha_fin);
                        const porcentajeProgreso = Math.min(100, (presupuesto.progreso / presupuesto.limite) * 100);
                        const estadoInfo = getEstadoPresupuesto(presupuesto);

                        return (
                            <div
                                key={presupuesto.id}
                                className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow cursor-pointer"
                                onClick={() => navigate(`/presupuestos/${presupuesto.id}`)}
                            >
                                <div className="p-4 border-b border-neutral-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-neutral-900 text-lg">
                                            {obtenerCategoria(presupuesto.categoria_id)}
                                        </h3>
                                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${estadoInfo.clase === 'text-success' ? 'bg-success-100 text-success' : estadoInfo.clase === 'text-warning' ? 'bg-warning-100 text-warning' : 'bg-error-100 text-error'}`}>
                                            {estadoInfo.estado}
                                        </span>
                                    </div>

                                    <div className="flex items-center text-neutral-600 text-sm mb-4">
                                        <Calendar size={16} className="mr-1" />
                                        <span>
                                            {formatearFecha(presupuesto.fecha_inicio)} - {formatearFecha(presupuesto.fecha_fin)}
                                            {diasRestantes > 0 && ` (${diasRestantes} días restantes)`}
                                        </span>
                                    </div>

                                    <div className="mb-2">
                                        <ProgressBar
                                            porcentaje={porcentajeProgreso}
                                            className={porcentajeProgreso < 70 ? 'bg-success' : porcentajeProgreso < 90 ? 'bg-warning' : 'bg-error'}
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

            {/* Formulario de creación de presupuesto */}
            <PresupuestoForm
                mostrar={mostrarFormulario}
                presupuestoSeleccionado={null}
                onSubmitPresupuesto={handleCreatePresupuesto}
                onClose={() => setMostrarFormulario(false)}
            />
        </div>
    );
}

export default PresupuestosListPage;