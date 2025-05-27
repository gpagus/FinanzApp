import { useAuth } from "../../context/AuthContext";
import { useStats } from "../../hooks/useStats";
import { useRecentActivity } from "../../hooks/useRecentActivity";
import WelcomeHeader from "../../components/ui/WelcomeHeader";
import InfoTooltip from "../../components/ui/InfoToolTip";
import {
  Activity,
  Users,
  CreditCard,
  Loader,
  Clock,
  User,
  RefreshCw,
} from "lucide-react";
import Boton from "../../components/ui/Boton";

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === "admin";
  const { data: stats, isLoading, error } = useStats();
  const { data: recentActivity, isLoading: isLoadingActivity, error: errorActivity, refetch: refetchActivity } = useRecentActivity(15);

  const handleRefreshActivity = () => {
    refetchActivity();
  };

  const formatearCambio = (cambio, tipo) => {
    if (tipo === 'nuevo') {
      return `${cambio} nuevas`;
    } else if (tipo === 'sin_cambio') {
      return "Sin cambios";
    } else {
      if (cambio === 0) return "0%";
      const signo = cambio > 0 ? "+" : "";
      return `${signo}${cambio.toFixed(1)}%`;
    }
  };

  const getColorCambio = (cambio, tipo) => {
    if (tipo === 'nuevo') return "text-info";
    if (tipo === 'sin_cambio') return "text-neutral-500";
    if (cambio > 0) return "text-success";
    if (cambio < 0) return "text-error";
    return "text-neutral-500";
  };

  const formatearFechaHora = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccionColor = (accion) => {
    switch (accion) {
      case 'login':
        return 'text-success bg-success-100';
      case 'logout':
        return 'text-neutral-600 bg-neutral-100';
      case 'crear_cuenta':
      case 'crear_transaccion':
      case 'crear_presupuesto':
      case 'transaccion_importante':
        return 'text-info bg-info-100';
      case 'eliminar_cuenta':
      case 'eliminar_transaccion':
      case 'eliminar_presupuesto':
        return 'text-error bg-error-100';
      case 'actualizar_perfil':
      case 'actualizar_cuenta':
      case 'actualizar_transaccion':
      case 'actualizar_presupuesto':
      case 'cambiar_contrasena':
        return 'text-warning bg-warning-100';
      default:
        return 'text-neutral-600 bg-neutral-100';
    }
  };

  const quickStats = [
    {
      title: "Usuarios Activos",
      titleTooltip: "Usuarios que han iniciado sesión en los últimos 30 días",
      value: isLoading ? "..." : (stats?.usuariosActivos || 0).toLocaleString(),
      icon: <Users size={24} className="text-aguazul" />,
      change: isLoading ? "..." : formatearCambio(stats?.cambioUsuariosActivos || 0, stats?.tipoCambioUsuarios || 'porcentaje'),
      changeColor: isLoading ? "text-neutral-500" : getColorCambio(stats?.cambioUsuariosActivos || 0, stats?.tipoCambioUsuarios || 'porcentaje'),
      color: "bg-info-100",
    },
    {
      title: "Total Usuarios",
      value: isLoading ? "..." : (stats?.totalUsuarios || 0).toLocaleString(),
      icon: <Users size={24} className="text-success" />,
      change: null,
      color: "bg-success-100",
    },
    {
      title: "Transacciones del Mes",
      value: isLoading ? "..." : (stats?.transaccionesMes || 0).toLocaleString(),
      icon: <Activity size={24} className="text-warning" />,
      change: isLoading ? "..." : formatearCambio(stats?.cambioTransacciones || 0, stats?.tipoCambioTransacciones || 'porcentaje'),
      changeColor: isLoading ? "text-neutral-500" : getColorCambio(stats?.cambioTransacciones || 0, stats?.tipoCambioTransacciones || 'porcentaje'),
      color: "bg-warning-100",
    },
    {
      title: "Cuentas Totales",
      value: isLoading ? "..." : (stats?.totalCuentas || 0).toLocaleString(),
      icon: <CreditCard size={24} className="text-dollar-500" />,
      change: null,
      color: "bg-dollar-100",
    },
  ];

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem-2.5rem)] items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-error mb-2">
            Error al cargar estadísticas
          </h2>
          <p className="text-neutral-600">Inténtalo de nuevo más tarde</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem-2.5rem)]">
      {/* Main Content */}
      <div className="flex-1 p-4 overflow-y-auto bg-neutral-100">
        {/* Bienvenida usando WelcomeHeader */}
        <WelcomeHeader />

        {/* Estadísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickStats.map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-sm bg-white border-l-4 border-aguazul`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-1">
                    <p className="text-sm text-neutral-600">
                      {stat.title}
                    </p>
                    {stat.titleTooltip && (
                      <div className="ml-2">
                        <InfoTooltip
                          tooltipText={stat.titleTooltip}
                          detailTitle="Usuarios Activos"
                          position="top"
                          moreInfo={false}
                        />
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    {isLoading ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      stat.value
                    )}
                  </h3>
                </div>
                <div className={`p-2.5 rounded-full ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
              {stat.change && (
                <p className={`text-xs font-medium mt-2 ${stat.changeColor || "text-success"}`}>
                  {stat.change} vs mes anterior
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Actividad Reciente */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-neutral-200">
            <div>
              <h3 className="text-lg font-semibold text-aguazul">
                Actividad Reciente
              </h3>
              <p className="text-sm text-neutral-600">
                Últimas acciones realizadas por los usuarios
              </p>
            </div>
            <Boton
              tipo="texto"
              onClick={handleRefreshActivity}
              disabled={isLoadingActivity}
              className="flex items-center gap-1.5 text-aguazul disabled:opacity-50 disabled:cursor-not-allowed"
              title="Actualizar actividad"
            >
              <RefreshCw 
                size={16} 
                className={`mr-1 ${isLoadingActivity ? 'animate-spin' : ''}`} 
              />
              Actualizar
            </Boton>
          </div>
          
          <div className="p-4">
            {isLoadingActivity ? (
              <div className="flex justify-center items-center py-6">
                <Loader size={24} className="animate-spin text-aguazul" />
              </div>
            ) : errorActivity ? (
              <div className="p-3 text-center text-error">
                Error al cargar la actividad reciente
              </div>
            ) : recentActivity?.length === 0 ? (
              <div className="p-3 text-center text-neutral-600">
                No hay actividad reciente
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {recentActivity?.map((log) => (
                  <div key={log.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors gap-2 sm:gap-0">
                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-200 flex-shrink-0">
                        <User size={14} className="text-neutral-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                          <span className="font-medium text-neutral-900 text-sm break-words">
                            {log.usuarios.nombre} {log.usuarios.apellidos}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${getAccionColor(log.accion)}`}>
                            {log.accion}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600 mt-1 break-words">
                          {log.descripcion}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-500 sm:whitespace-nowrap sm:ml-4 self-start sm:self-auto">
                      {formatearFechaHora(log.fecha)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
