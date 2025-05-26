import { useState } from "react";
import { useSaldos } from "../../context/SaldosContext";
import { Loader } from "lucide-react";
import Boton from "../ui/Boton";
import { formatearMoneda, formatearFecha, formatearHoraLocal } from "../../utils/formatters";
import { CATEGORIAS } from "../../utils/constants";
import TransaccionDetailModal from "./TransaccionDetailModal";

const TransaccionesList = ({
                             transacciones = [],
                             cargando,
                             cargandoMas,
                             hayMasTransacciones,
                             cargarMas,
                             mostrarCuenta = false,
                             cuentaId = null,
                           }) => {
  const { mostrarSaldos } = useSaldos();
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);

  // Verificar que transacciones sea un array válido
  const transaccionesArray = Array.isArray(transacciones) ? transacciones : [];

  // Agrupar transacciones por fecha Y ordenar dentro de cada fecha
  const transaccionesPorFecha = {};
  transaccionesArray.forEach((transaccion) => {
    const fecha = formatearFecha(transaccion.fecha);
    if (!transaccionesPorFecha[fecha]) {
      transaccionesPorFecha[fecha] = [];
    }
    transaccionesPorFecha[fecha].push(transaccion);
  });

  // Ordenar cada grupo por timestamp (de más reciente a más antiguo)
  Object.keys(transaccionesPorFecha).forEach((fecha) => {
    transaccionesPorFecha[fecha].sort((a, b) => {
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });
  });

  // Ordenar las fechas de más reciente a más antigua (nuevo código)
  const fechasOrdenadas = Object.keys(transaccionesPorFecha).sort((a, b) => {
    // Tomamos la primera transacción de cada fecha para comparar
    const fechaA = new Date(transaccionesPorFecha[a][0].fecha).getTime();
    const fechaB = new Date(transaccionesPorFecha[b][0].fecha).getTime();
    return fechaB - fechaA; // Orden descendente (más reciente primero)
  });

  return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mx-auto max-w-3xl mb-6 p-4">
        {cargando ? (
            <div className="p-10 flex justify-center items-center">
              <Loader size={32} className="text-aguazul animate-spin" />
            </div>
        ) : transaccionesArray.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-neutral-600 mb-2">
                No hay transacciones para mostrar
              </p>
              <p className="text-sm text-neutral-600">
                Prueba a cambiar los filtros o a añadir nuevas operaciones
              </p>
            </div>
        ) : (
            <>
              {/* Usar fechasOrdenadas en lugar de Object.entries */}
              {fechasOrdenadas.map((fecha) => (
                  <div
                      key={fecha}
                      className="border-b border-neutral-200 last:border-0"
                  >
                    <div className="px-4 py-2 bg-neutral-100">
                      <p className="font-medium text-sm text-neutral-600">{fecha}</p>
                    </div>
                    <ul>
                      {transaccionesPorFecha[fecha].map((transaccion) => {
                        const categoria = CATEGORIAS.find(
                            (cat) => cat.value === transaccion.categoria_id
                        );
                        
                        // Determinar el estado de la transacción
                        const esRectificada = transaccion.transaccion_rectificativa_id;
                        const esRectificativa = transaccion.transaccion_original_id;
                        
                        return (
                            <li
                                key={transaccion.id}
                                className={`border-b border-neutral-200 last:border-0 hover:bg-neutral-200 cursor-pointer transition-colors ${
                                  esRectificada ? 'bg-neutral-50' : esRectificativa ? 'bg-sky-50' : ''
                                }`}
                                onClick={() => setTransaccionSeleccionada(transaccion)}
                            >
                              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between">
                                <div className="flex items-center mb-2 sm:mb-0">
                                  <div className="mr-3 text-xl" aria-hidden="true">
                                    {categoria?.icono || "❓"}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-neutral-900">
                                        {transaccion.descripcion}
                                      </p>
                                      {/* Indicadores de estado */}
                                      {esRectificada && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                                          🔄 Rectificada
                                        </span>
                                      )}
                                      {esRectificativa && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                                          📝 Rectificativa
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-col xs:flex-row xs:gap-2">
                                      <p className="text-sm text-neutral-600">
                                        {formatearHoraLocal(transaccion.fecha)}
                                      </p>
                                      {mostrarCuenta && transaccion.cuenta && (
                                          <p className="text-sm text-aguazul">
                                            {transaccion.cuenta.nombre}
                                          </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <p
                                    className={`font-semibold ${
                                        transaccion.tipo === "gasto"
                                            ? "text-error"
                                            : "text-success"
                                    } ${esRectificada ? 'opacity-60' : ''}`}
                                >
                                  {mostrarSaldos
                                      ? formatearMoneda(
                                          transaccion.tipo === "gasto"
                                              ? -transaccion.monto
                                              : transaccion.monto
                                      )
                                      : "••••••"}
                                </p>
                              </div>
                            </li>
                        );
                      })}
                    </ul>
                  </div>
              ))}

              {hayMasTransacciones && (
                  <div className="p-2">
                    <Boton
                        tipo="primario"
                        fullWidth
                        onClick={cargarMas}
                        disabled={cargandoMas}
                    >
                      {cargandoMas ? (
                          <span className="flex items-center justify-center">
                    <Loader size={20} className="animate-spin mr-2" />
                    Cargando...
                  </span>
                      ) : (
                          "Ver más movimientos"
                      )}
                    </Boton>
                  </div>
              )}
            </>
        )}

        {/* Modal de detalles de transacción */}
        {transaccionSeleccionada && (
            <TransaccionDetailModal
                transaccion={transaccionSeleccionada}
                onClose={() => setTransaccionSeleccionada(null)}
                cuentaId={cuentaId}
            />
        )}
      </div>
  );
};

export default TransaccionesList;