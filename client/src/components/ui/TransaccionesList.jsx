import {useSaldos} from "../../context/SaldosContext";
import {Loader} from 'lucide-react';
import Boton from '../ui/Boton';
import {formatearMoneda, formatearFecha} from "../../utils/formatters";

const TransaccionesList = ({
                               transacciones,
                               cargando,
                               cargandoMas,
                               hayMasTransacciones,
                               cargarMas,
                               mostrarCuenta = false
                           }) => {

    const {mostrarSaldos} = useSaldos();

    // Agrupar transacciones por fecha
    const transaccionesPorFecha = {};
    transacciones.forEach(transaccion => {
        const fecha = formatearFecha(transaccion.created_at);
        if (!transaccionesPorFecha[fecha]) {
            transaccionesPorFecha[fecha] = [];
        }
        transaccionesPorFecha[fecha].push(transaccion);
    });

    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mx-auto max-w-3xl mb-6 p-4">
            {cargando ? (
                <div className="p-10 flex justify-center items-center">
                    <Loader size={32} className="text-aguazul animate-spin"/>
                </div>
            ) : transacciones.length === 0 ? (
                <div className="p-8 text-center">
                    <p className="text-neutral-600 mb-2">No hay transacciones para mostrar</p>
                    <p className="text-sm text-neutral-600">Prueba a cambiar los filtros o a añadir nuevas
                        operaciones</p>
                </div>
            ) : (
                <>
                    
                    {Object.entries(transaccionesPorFecha).map(([fecha, transaccionesDia]) => (
                        <div key={fecha} className="border-b border-neutral-200 last:border-0">
                            <div className="px-4 py-2 bg-neutral-100">
                                <p className="font-medium text-sm text-neutral-600">{fecha}</p>
                            </div>
                            <ul>
                                {transaccionesDia.map((transaccion) => (
                                    <li
                                        key={transaccion.id}
                                        className="border-b border-neutral-200 last:border-0 hover:bg-neutral-100 cursor-pointer transition-colors"
                                    >
                                        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between">
                                            <div className="flex items-center mb-2 sm:mb-0">
                                                <div className="mr-3 text-xl" aria-hidden="true">
                                                    {transaccion.icono}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-neutral-900">{transaccion.descripcion}</p>
                                                    <div className="flex flex-col xs:flex-row xs:gap-2">
                                                        <p className="text-sm text-neutral-600">
                                                            {new Date(new Date(transaccion.created_at).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString('es-ES', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        {mostrarCuenta && transaccion.cuenta && (
                                                            <p className="text-sm text-aguazul">
                                                                {transaccion.cuenta.nombre}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className={`font-semibold ${transaccion.monto >= 0 ? 'text-success' : 'text-error'}`}>
                                                {mostrarSaldos ? formatearMoneda(transaccion.monto) : '••••••'}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Botón "Ver más movimientos" */}
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
                                        <Loader size={20} className="animate-spin mr-2"/>
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
        </div>
    );
};

export default TransaccionesList;