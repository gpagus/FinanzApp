import { useState, useEffect } from "react";
import { getAnalisisGastos } from "../../api/analisisApi";
import {
  PieChart,
  Target,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader,
} from "lucide-react";
import InfoTooltip from "./InfoToolTip";
import ProgressBar from "./ProgressBar";
import { useSaldos } from "../../context/SaldosContext";

const AnalisisGastos = () => {
  const [analisis, setAnalisis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { mostrarSaldos } = useSaldos();

  useEffect(() => {
    const cargarAnalisis = async () => {
      try {
        setError(null);
        const data = await getAnalisisGastos();
        setAnalisis(data);
      } catch (error) {
        console.error("Error cargando análisis:", error);
        setError("No se pudo cargar el análisis");
      } finally {
        setIsLoading(false);
      }
    };

    cargarAnalisis();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-neutral-600">
          <Loader className="animate-spin mr-2" />
          <div className="animate-pulse">Cargando análisis...</div>
        </div>
      </div>
    );
  }

  if (error || !analisis) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-neutral-600">
          <TrendingDown size={48} className="mx-auto mb-4 text-neutral-300" />
          <p>{error || "No se pudo cargar el análisis"}</p>
        </div>
      </div>
    );
  }

  const getInsightIcon = (tipo) => {
    switch (tipo) {
      case "warning":
        return <AlertTriangle size={16} />;
      case "success":
        return <CheckCircle size={16} />;
      default:
        return <Info size={16} className="text-info" />;
    }
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-aguazul mr-1.5">
            Análisis de gastos del último mes
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm text-neutral-600 mb-1">Total gastado</h3>
            <p className="text-2xl font-bold text-error">
              {mostrarSaldos ? `${analisis.totalGastos}€` : '••••••'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm text-neutral-600 mb-1">Gasto promedio diario</h3>
            <p className="text-2xl font-bold text-aguazul">
              {mostrarSaldos ? `${analisis.promedioGastosDiarios}€` : '••••••'}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-sm text-neutral-600 mb-1">Número de gastos</h3>
            <p className="text-2xl font-bold text-aguazul">
              {mostrarSaldos ? analisis.numeroTransacciones : '••••••'}
            </p>
          </div>
        </div>

        {/* Insights */}
        {analisis.insights?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <Target className="mr-2 text-aguazul" size={20} />
              <h3 className="text-md font-semibold text-neutral-900">
                Análisis inteligentes
              </h3>
            </div>
            <div className="space-y-3">
              {analisis.insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    insight.tipo === "warning"
                      ? "bg-warning-100 border-warning"
                      : insight.tipo === "success"
                      ? "bg-success-100 border-success"
                      : "bg-info-100 border-info"
                  }`}
                >
                  <div className="flex items-start">
                    <span className="mr-3 mt-0.5">
                      {getInsightIcon(insight.tipo)}
                    </span>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {insight.mensaje}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gastos por categoría */}
        <div>
          <div className="flex items-center mb-3">
            <PieChart className="mr-2 text-aguazul" size={20} />
            <h3 className="text-md font-semibold text-neutral-900">
              Distribución por categoría
            </h3>
            <span className="ml-2 text-sm text-neutral-500">
              ({analisis.periodo})
            </span>
          </div>

          {Object.keys(analisis.gastosPorCategoria).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analisis.gastosPorCategoria)
                .sort(([, a], [, b]) => b - a)
                .map(([categoria, monto]) => {
                  const porcentaje =
                    (monto / parseFloat(analisis.totalGastos)) * 100;
                  return (
                    <div
                      key={categoria}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-neutral-600">
                            {categoria}
                          </span>
                        </div>
                        <ProgressBar
                          porcentaje={mostrarSaldos ? porcentaje : 0}
                          className="bg-aguazul"
                        />
                      </div>
                      <div className="ml-4 text-right">
                        <span className="text-sm font-semibold text-neutral-900">
                          {mostrarSaldos ? `${monto.toFixed(2)}€` : '••••••'}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-500">
              <PieChart size={48} className="mx-auto mb-3 text-neutral-300" />
              <p>No hay gastos categorizados este mes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalisisGastos;
