import {BarChart2} from 'lucide-react';
import {formatearMoneda} from "../../../utils/formatters";
import InfoTooltip from "../InfoToolTip";

const ResumenMovimientos = ({
                                titulo = "Resumen de movimientos",
                                ingresosTotales = 0,
                                gastosTotales = 0,
                                ahorroNeto = 0,
                                totalTransacciones = 0,
                                mostrarSaldos = true,
                                className = ""
                            }) => {
    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-aguazul flex items-center">
                    <BarChart2 size={20} className="mr-2"/>
                    {titulo}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-neutral-100 rounded-lg">
                    <p className="text-neutral-600 text-sm mb-1">Ingresos totales</p>
                    <p className="text-xl font-bold text-success">
                        {mostrarSaldos ? formatearMoneda(ingresosTotales) : '••••••'}
                    </p>
                </div>
                <div className="p-4 bg-neutral-100 rounded-lg">
                    <p className="text-neutral-600 text-sm mb-1">Gastos totales</p>
                    <p className="text-xl font-bold text-error">
                        {mostrarSaldos ? formatearMoneda(gastosTotales) : '••••••'}
                    </p>
                </div>
                <div className="p-4 bg-neutral-100 rounded-lg">
                    <p className="text-neutral-600 text-sm mb-1">Ahorro neto</p>
                    <p className={`text-xl font-bold ${ahorroNeto >= 0 ? 'text-success' : 'text-error'}`}>
                        {mostrarSaldos ? formatearMoneda(ahorroNeto) : '••••••'}
                    </p>
                </div>
                <div className="p-4 bg-neutral-100 rounded-lg">
                    <div className="flex items-center">
                        <p className="text-neutral-600 text-sm mb-1 mr-2">Total de movimientos</p>
                        <InfoTooltip
                            tooltipText="Número total de transacciones (ingresos y gastos) registrados"
                            position='top'
                            moreInfo={false}
                        />
                    </div>
                    <p className="text-xl font-bold text-aguazul">
                        {totalTransacciones}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResumenMovimientos;