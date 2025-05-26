import React, {useState} from 'react';
import {
    ArrowLeft,
    User,
    Mail,
    Calendar,
    CreditCard,
    PiggyBank,
    TrendingUp,
    CheckCircle,
    XCircle,
    Loader,
    PieChart,
    Wallet,
} from 'lucide-react';
import {useNavigate, useParams} from "react-router-dom";
import {useQuery} from '@tanstack/react-query';
import {Grid} from "gridjs-react"

import Boton from '../../components/ui/Boton';
import ProgressBar from "../../components/ui/ProgressBar";
import {CATEGORIAS} from "../../utils/constants";
import {formatearFecha, formatearFechaHora, formatearMoneda} from '../../utils/formatters';
import ResumenFinanciero from "../../components/ui/stats/ResumenFinanciero";
import {useSaldos} from "../../context/SaldosContext";
import LoadingScreen from '../../components/ui/LoadingScreen';
import ErrorScreen from '../../components/ui/ErrorScreen';

import {getUserAccountsByEmail, getUserBudgetsByEmail, getUserByEmail, getUserLogsByEmail} from "../../api/usersApi";
import {useUsers} from "../../hooks/useUsers.js";
import ConfirmModal from "../../components/ui/ConfirmModal";

const tiposCuenta = {
    corriente: {nombre: 'Cuenta Corriente', icono: <CreditCard size={20}/>},
    ahorro: {nombre: 'Cuenta de Ahorro', icono: <PiggyBank size={20}/>},
    credito: {nombre: 'Tarjeta de Crédito', icono: <CreditCard size={20}/>},
    inversion: {nombre: 'Inversión', icono: <TrendingUp size={20}/>}
};

const UserDetailAdmin = () => {
    const {mostrarSaldos} = useSaldos();
    const navigate = useNavigate();
    const {email: encodedEmail} = useParams();
    const userEmail = decodeURIComponent(encodedEmail);

    // Obtener datos del usuario por email
    const {
        data: usuario,
        isLoading: cargandoUsuario,
        isError: errorUsuario,
        error: errorUsuarioData
    } = useQuery({
        queryKey: ['usuario', userEmail],
        queryFn: () => getUserByEmail(userEmail),
        staleTime: 1000 * 60 * 5 // 5 minutos de caché
    });

    // Obtener cuentas del usuario
    const {
        data: cuentas = [],
        isLoading: cargandoCuentas,
        isError: errorCuentas
    } = useQuery({
        queryKey: ['cuentas-usuario', userEmail],
        queryFn: () => getUserAccountsByEmail(userEmail),
        staleTime: 1000 * 60 * 5,
        enabled: !!usuario // Solo se ejecuta si tenemos el usuario
    });

    // Obtener presupuestos del usuario
    const {
        data: presupuestos = [],
        isLoading: cargandoPresupuestos,
        isError: errorPresupuestos
    } = useQuery({
        queryKey: ['presupuestos-usuario', userEmail],
        queryFn: () => getUserBudgetsByEmail(userEmail),
        staleTime: 1000 * 60 * 5,
        enabled: !!usuario // Solo se ejecuta si tenemos el usuario
    });

    // Obtener logs del usuario
    const {
        data: logs = [],
        isLoading: cargandoLogs,
        isError: errorLogs
    } = useQuery({
        queryKey: ['logs-usuario', userEmail],
        queryFn: () => getUserLogsByEmail(userEmail),
        staleTime: 1000 * 60 * 5,
        enabled: !!usuario
    });


    // Calcular estadísticas
    const balanceTotal = cuentas.reduce((sum, cuenta) => sum + cuenta.balance, 0);
    const balancePositivo = cuentas
        .filter(cuenta => cuenta.balance > 0)
        .reduce((sum, cuenta) => sum + cuenta.balance, 0);
    const balanceNegativo = cuentas
        .filter(cuenta => cuenta.balance < 0)
        .reduce((sum, cuenta) => sum + cuenta.balance, 0);


    const getIconoTipo = (tipo) => {
        return tiposCuenta[tipo]?.icono || <CreditCard size={20}/>;
    };

    const getNombreTipo = (tipo) => {
        return tiposCuenta[tipo]?.nombre || 'Cuenta';
    };

    const calcularDiasRestantes = (fechaFin) => {
        const hoy = new Date();
        const fin = new Date(fechaFin);
        const diferencia = fin - hoy;
        return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)));
    };

    const getEstadoPresupuesto = (presupuesto) => {
        const porcentaje = (presupuesto.progreso / presupuesto.limite) * 100;

        if (porcentaje < 70) return {clase: 'text-success bg-success-100', estado: 'Controlado'};
        if (porcentaje < 99) return {clase: 'text-warning bg-warning-100', estado: 'Limitado'};
        return {clase: 'text-error bg-error-100', estado: 'Excedido'};
    };

    const obtenerCategoria = (categoriaId) => {
        const categoria = CATEGORIAS.find(cat => cat.value === categoriaId);
        return categoria ? categoria.label : "Sin categoría";
    };

    const baseUrl = import.meta.env.VITE_SUPABASE_AVATAR_BASE_URL;
    const avatarFullUrl = usuario ? `${baseUrl}${usuario.avatar}` : null;

    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const {
        updateUserStatus,
        isUpdatingStatus,
    } = useUsers();

    // Añade esta función dentro del componente
    const handleStatusChange = () => {
        updateUserStatus({
            userId: usuario.id,
            isActive: !usuario.estado
        });
        setMostrarConfirmacion(false);
    };

    // Estados de carga
    if (cargandoUsuario) {
        return <LoadingScreen mensaje="Cargando información del usuario..."/>;
    }

    // Estado de error al cargar el usuario
    if (errorUsuario) {
        return (
            <ErrorScreen
                titulo="Error al cargar el usuario"
                mensaje={errorUsuarioData?.message || 'Ha ocurrido un error inesperado.'}
                tipoError="error"
            />
        );
    }

    // Usuario no encontrado
    if (!usuario) {
        return (
            <ErrorScreen
                titulo="Usuario no encontrado"
                mensaje="El usuario que buscas no existe o no tienes acceso a él."
                tipoError="notFound"
            />
        );
    }

    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem-2.5rem)]">
            {/* Header */}
            <div className="flex items-center mb-6">
                <Boton
                    tipo="icono"
                    onClick={() => navigate("/admin-usuarios")}
                    className="mr-3 hover:bg-neutral-200"
                >
                    <ArrowLeft size={20} className="text-aguazul"/>
                </Boton>
                <h1 className="text-2xl font-bold text-aguazul">
                    Detalle de Usuario
                </h1>
            </div>

            {/* Información Personal */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                        <div
                            className="h-16 w-16 rounded-full border-2 border-neutral-300 flex items-center justify-center bg-neutral-100 mr-4">
                            {usuario.avatar ? (
                                <img
                                    src={avatarFullUrl}
                                    alt={`${usuario.nombre}`}
                                    className="h-full w-full object-cover rounded-full"
                                />
                            ) : (
                                <User size={32} className="text-neutral-600"/>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-neutral-900">
                                {usuario.nombre} {usuario.apellidos}
                            </h2>
                            <div className="flex items-center mt-1 text-neutral-600">
                                <Mail size={16} className="mr-2"/>
                                <span>{usuario.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {/* Botón para activar/desactivar un usuario */}
                        <Boton
                            tipo="texto"
                            className={`${usuario.estado ? 'text-error' : 'text-success'} rounded-full px-4 py-2`}
                            onClick={() => {
                                setMostrarConfirmacion(true);
                            }}
                        >
                            {usuario.estado ? 'Desactivar' : 'Activar'}
                        </Boton>
                        {usuario.estado ? (
                            <div className="flex items-center text-success bg-success-100 px-3 py-1 ml-2 rounded-full">
                                <CheckCircle size={16} className="mr-2"/>
                                <span className="text-sm font-medium">Activo</span>
                            </div>
                        ) : (
                            <div className="flex items-center text-error bg-error-100 px-3 py-1 rounded-full">
                                <XCircle size={16} className="mr-2"/>
                                <span className="text-sm font-medium">Inactivo</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center text-neutral-600">
                    <Calendar size={16} className="mr-2"/>
                    <span className="text-sm">
                        Último acceso: {formatearFechaHora(usuario.lastAccess)}
                    </span>
                </div>
            </div>

            <ResumenFinanciero
                balanceTotal={balanceTotal}
                balancePositivo={balancePositivo}
                balanceNegativo={balanceNegativo}
                mostrarSaldos={mostrarSaldos}
                className="mb-6"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lista de Cuentas */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-neutral-200">
                        <h3 className="text-lg font-semibold text-aguazul">Cuentas del Usuario</h3>
                        <p className="text-sm text-neutral-600">
                            {cargandoCuentas ? (
                                <span className="flex items-center">
                                    <Loader size={14} className="animate-spin mr-2"/> Cargando cuentas...
                                </span>
                            ) : (
                                `${cuentas.length} cuentas configuradas`
                            )}
                            {errorCuentas && (
                                <span className="ml-2 text-error">Error al cargar las cuentas</span>
                            )}
                        </p>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {cargandoCuentas ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader size={24} className="animate-spin text-aguazul"/>
                            </div>
                        ) : errorCuentas ? (
                            <div className="p-4 text-center text-error">
                                Error al cargar las cuentas
                            </div>
                        ) : cuentas.length === 0 ? (
                            <div className="p-4 text-center text-neutral-600">
                                Este usuario no tiene cuentas configuradas
                                <Wallet size={32} className="mx-auto mt-2 text-neutral-300"/>
                            </div>
                        ) : (
                            <ul className="divide-y divide-neutral-200">
                                {cuentas.map((cuenta) => (
                                    <li key={cuenta.id} className="p-4 hover:bg-neutral-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div
                                                    className={`p-2 rounded-full mr-3 ${cuenta.balance >= 0 ? 'bg-success-100' : 'bg-error-100'}`}>
                                                    {getIconoTipo(cuenta.tipo)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-neutral-900">{cuenta.nombre}</h4>
                                                    <p className="text-sm text-neutral-600">
                                                        {getNombreTipo(cuenta.tipo)} •
                                                        Actualizado: {formatearFecha(cuenta.last_update || cuenta.updated_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className={`font-semibold ${cuenta.balance >= 0 ? 'text-success' : 'text-error'}`}>
                                                {mostrarSaldos ? formatearMoneda(cuenta.balance) : '••••••'}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Categorías Presupuestarias */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-neutral-200">
                        <h3 className="text-lg font-semibold text-aguazul">Categorías Presupuestarias</h3>
                        <p className="text-sm text-neutral-600">
                            {cargandoPresupuestos ? (
                                <span className="flex items-center">
                    <Loader size={14} className="animate-spin mr-2"/> Cargando categorías...
                </span>
                            ) : (
                                `${presupuestos.filter(p => p.estado).length} de ${presupuestos.length} categorías activas`
                            )}
                            {errorPresupuestos && (
                                <span className="ml-2 text-error">Error al cargar las categorías</span>
                            )}
                        </p>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {cargandoPresupuestos ? (
                            <div className="flex justify-center items-center py-8">
                                <Loader size={24} className="animate-spin text-aguazul"/>
                            </div>
                        ) : errorPresupuestos ? (
                            <div className="p-4 text-center text-error">
                                Error al cargar las categorías
                            </div>
                        ) : presupuestos.length === 0 ? (
                            <div className="p-4 text-center text-neutral-600">
                                Este usuario no tiene categorías presupuestarias configuradas
                                <PieChart size={32} className="mx-auto mt-2 text-neutral-300"/>
                            </div>
                        ) : (
                            <ul className="divide-y divide-neutral-200">
                                {presupuestos.map((presupuesto) => {
                                    const porcentajeProgreso = Math.min(100, (presupuesto.progreso / presupuesto.limite) * 100);
                                    const estadoInfo = getEstadoPresupuesto(presupuesto);
                                    const esActivo = presupuesto.estado;
                                    const diasRestantes = esActivo ? calcularDiasRestantes(presupuesto.fecha_fin) : 0;

                                    return (
                                        <li key={presupuesto.id} className="p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium text-neutral-900">
                                                    {obtenerCategoria(presupuesto.categoria_id)}
                                                </h4>
                                                <div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${esActivo ? estadoInfo.clase : 'bg-neutral-200 text-neutral-700'}`}>
                                        {esActivo ? estadoInfo.estado : 'Expirado'}
                                    </span>
                                                    {esActivo && diasRestantes > 0 && (
                                                        <span className="ml-2 text-xs text-neutral-500">
                                            {diasRestantes} días restantes
                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <ProgressBar
                                                    porcentaje={porcentajeProgreso}
                                                    className={
                                                        esActivo
                                                            ? porcentajeProgreso < 70
                                                                ? 'bg-success'
                                                                : porcentajeProgreso < 99
                                                                    ? 'bg-warning'
                                                                    : 'bg-error'
                                                            : 'bg-neutral-400'
                                                    }
                                                />
                                            </div>

                                            <div className="flex justify-between items-center text-sm">
                                                <div>
                                                    <p className="text-neutral-600">Gastado</p>
                                                    <p className="font-medium">
                                                        {mostrarSaldos ? formatearMoneda(presupuesto.progreso) : '••••••'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-neutral-600">Límite</p>
                                                    <p className="font-medium">
                                                        {mostrarSaldos ? formatearMoneda(presupuesto.limite) : '••••••'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-2 text-xs text-neutral-500">
                                                {formatearFecha(presupuesto.fecha_inicio)} - {formatearFecha(presupuesto.fecha_fin)}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-neutral-200">
                    <h3 className="text-lg font-semibold text-aguazul">Historial de Actividad</h3>
                    <p className="text-sm text-neutral-600">
                        {cargandoLogs ? (
                            <span className="flex items-center">
                    <Loader size={14} className="animate-spin mr-2"/> Cargando actividad...
                </span>
                        ) : (
                            `${logs.length} registros de actividad`
                        )}
                    </p>
                </div>

                <div className="p-4">
                    {cargandoLogs ? (
                        <div className="flex justify-center items-center py-8">
                            <Loader size={24} className="animate-spin text-aguazul"/>
                        </div>
                    ) : errorLogs ? (
                        <div className="p-4 text-center text-error">
                            Error al cargar los registros de actividad
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="p-4 text-center text-neutral-600">
                            No hay registros de actividad para este usuario
                        </div>
                    ) : (
                        <Grid
                            data={logs.map(log => [
                                formatearFechaHora(log.fecha),
                                log.accion,
                                log.descripcion,
                            ])}
                            columns={['Fecha', 'Acción', 'Descripción']}
                            search={true}
                            pagination={{
                                limit: 10,
                            }}
                            sort={true}
                            language={{
                                search: {
                                    placeholder: "🔍 Buscar...",
                                },
                                pagination: {
                                    previous: "⬅️",
                                    next: "➡️",
                                    showing: "Mostrando",
                                    results: () => "registros",
                                },
                            }}
                        />
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={mostrarConfirmacion}
                onClose={() => setMostrarConfirmacion(false)}
                onConfirm={() => handleStatusChange(usuario.id, usuario.estado)}
                title="Confirmación"
                message={`¿Estás seguro de que deseas ${usuario.estado ? 'desactivar' : 'activar'} a ${usuario.nombre} ${usuario.apellidos}?`}
                confirmLabel="Aceptar"
                cancelLabel="Cancelar"
            />

        </div>
    );
};

export default UserDetailAdmin;