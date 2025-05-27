import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSaldos } from '../../context/SaldosContext';
import { useAuth } from "../../context/AuthContext";
import { formatearMoneda, formatearFecha } from '../../utils/formatters';
import { TIPOS_CUENTA } from '../../utils/constants';
import {
    ArrowLeft,
    Download,
    Share2,
    Loader,
    EllipsisVertical,
    PlusCircle,
} from 'lucide-react';

import Boton from '../../components/ui/Boton';
import { useCuentas } from '../../hooks/useCuentas';
import useTransacciones from '../../hooks/useTransacciones';
import TransaccionesList from '../../components/ui/TransaccionesList';
import TransaccionesFilters from '../../components/ui/TransaccionesFilters';
import DropdownMenu from '../../components/ui/DropdownMenu';
import ConfirmModal from '../../components/ui/ConfirmModal';
import CuentaForm from '../../components/ui/forms/CuentaForm';
import NewOperationModal from "../../components/ui/NewOperationModal";
import LoadingScreen from "../../components/ui/LoadingScreen";
import ErrorScreen from "../../components/ui/ErrorScreen";
import { exportarTransaccionesCuenta } from '../../api/cuentasApi';
import { exportarTransaccionesAExcel } from '../../utils/exportUtils';
import { toast } from 'react-hot-toast';
import InfoTooltip from '../../components/ui/InfoToolTip';

const CuentaDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

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
    const [openOperacion, setOpenOperacion] = useState(false);

    const { mostrarSaldos } = useSaldos();

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
    } = useTransacciones({ cuentaId: id });


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


    /* ---------------------- editar cuenta ---------------------- */
    const handleEditar = (data) => {
        actualizarCuenta({ id: cuenta.id, datos: data });
        setMostrarFormulario(false);
    };

    /* ---------------------- eliminar cuenta ---------------------- */
    const handleEliminarCuenta = () => {
        setMostrarConfirmacion(false);
        eliminarCuenta({ id: cuenta.id, nombre: cuenta.nombre });
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
            <LoadingScreen mensaje="Cargando cuenta..." />
        );
    }

    if (isError) {
        return (
            <ErrorScreen
                titulo="Error al cargar la cuenta"
                mensaje={error?.message || 'Ha ocurrido un error inesperado.'}
                tipoError="error"
            />
        );
    }

    if (!cuenta) {
        return (
            <ErrorScreen
                titulo="Cuenta no encontrada"
                mensaje="La cuenta que buscas no existe o no tienes acceso a ella."
                tipoError="notFound"
            />
        );
    }

    /* ---------------------- función de exportación ---------------------- */
    const handleExportar = async () => {
        // Verificar si hay transacciones
        if (!transacciones || transacciones.length === 0) {
            toast.error('No hay transacciones para exportar');
            return;
        }

        try {
            toast.loading('Obteniendo todas las transacciones...', { id: 'export-loading' });

            // Obtener todas las transacciones con los filtros aplicados
            const data = await exportarTransaccionesCuenta(cuenta.id, filtros);

            // Verificar si la respuesta contiene transacciones
            if (!data.transacciones || data.transacciones.length === 0) {
                toast.error('No hay transacciones para exportar con los filtros aplicados', { 
                    id: 'export-loading' 
                });
                return;
            }

            // Generar Excel en el frontend (ahora es async)
            const { totalRegistros } = await exportarTransaccionesAExcel(data, user);

            toast.success(`Archivo descargado (${totalRegistros} transacciones)`, {
                id: 'export-loading',
                duration: 4000
            });

        } catch (error) {
            console.error('Error al exportar:', error);
            toast.error('Error al obtener las transacciones para exportar', { id: 'export-loading' });
        }
    };

    /* ---------------------- render principal ---------------------- */
    const tipoInfo = TIPOS_CUENTA.find((t) => t.id === cuenta.tipo) || TIPOS_CUENTA[0];
    const tipoCuenta = TIPOS_CUENTA.find(tipo => tipo.id === cuenta.tipo) || TIPOS_CUENTA[0];
    const IconoTipo = tipoCuenta.Icono;

    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem-2.5rem)]">
            {/* Botón volver y cabecera */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center mb-0">
                        <Boton
                            tipo="icono"
                            onClick={() => navigate('/cuentas')}
                            className="mr-3 hover:bg-neutral-200"
                            aria-label="Volver a cuentas"
                        >
                            <ArrowLeft size={20} className="text-aguazul" />
                        </Boton>
                        <div
                            className={`p-2 rounded-full mr-3 ${cuenta.balance >= 0 ? 'bg-success-100' : 'bg-error-100'}`}
                        >
                            <IconoTipo size={20} />
                        </div>
                        <h1 className="text-2xl font-bold text-aguazul">{cuenta.nombre}</h1>

                        <DropdownMenu
                            triggerIcon={<EllipsisVertical className="text-neutral-400" />}
                            actions={acciones}
                        />
                    </div>

                    <div className="flex gap-2.5">

                        <InfoTooltip
                            tooltipText={
                                transacciones.length === 0 
                                    ? "No hay transacciones para exportar. Agrega algunas operaciones primero."
                                    : "Exporta todas las transacciones de esta cuenta a un archivo Excel con formato profesional."
                            }
                            detailTitle="Información sobre la exportación"
                            detailContent={
                                transacciones.length === 0 
                                    ? [
                                        {
                                            title: "Sin transacciones",
                                            description: "Esta cuenta no tiene transacciones para exportar. Agrega algunas operaciones primero."
                                        }
                                    ]
                                    : [
                                        {
                                            title: "¿Qué se incluye?",
                                            description: "Todas las transacciones de la cuenta con los filtros aplicados, información de la cuenta y estadísticas."
                                        },
                                        {
                                            title: "Formato del archivo",
                                            description: "El archivo Excel incluye dos hojas: 'Resumen' con información general y 'Transacciones' con el detalle completo."
                                        },
                                        {
                                            title: "Filtros aplicados",
                                            description: "Solo se exportarán las transacciones que coincidan con los filtros actualmente aplicados."
                                        }
                                    ]
                            }
                            position="left"
                            moreInfo={true}
                        />

                        <Boton
                            tipo="secundario"
                            className="flex items-center justify-center w-full sm:w-auto"
                            aria-label="Exportar"
                            onClick={handleExportar}
                            disabled={cargandoTransacciones || transacciones.length === 0}
                        >
                            <Download size={18} className="mr-1" />
                            <span>Exportar a Excel</span>
                        </Boton>
                    </div>
                </div>
            </div>

            {/* Tarjeta de información de la cuenta */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-neutral-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                        <div>
                            <p className="text-neutral-600 mb-1">Saldo actual</p>
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
                                        <Loader size={18} className="animate-spin mr-2" />
                                        Actualizando...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle size={18} className="mr-2" />
                                        Nueva operación
                                    </>
                                )}
                            </Boton>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-neutral-100 rounded-lg">
                            <p className="text-neutral-600 text-sm mb-1">Tipo de cuenta</p>
                            <p className="font-medium text-neutral-900 capitalize">{cuenta.tipo}</p>
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
                onSubmitCuenta={handleEditar}
                onClose={() => setMostrarFormulario(false)}
                opcionesTiposCuenta={TIPOS_CUENTA}
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
