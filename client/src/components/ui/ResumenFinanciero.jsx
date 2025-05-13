import { BarChart2 } from 'lucide-react';
import { formatearMoneda } from '../../utils/formatters';

const ResumenFinanciero = ({
                               titulo = "Resumen financiero",
                               balanceTotal = 0,
                               balancePositivo = 0,
                               balanceNegativo = 0,
                               mostrarSaldos = true,
                               className = ""
                           }) => {
    return (
        <div className={`bg-white p-4 rounded-lg shadow-sm ${className}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-aguazul flex items-center">
                    <BarChart2 size={20} className="mr-2" />
                    {titulo}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-neutral-100 rounded-lg">
                    <p className="text-neutral-600 text-sm mb-1">Balance total</p>
                    <p className={`text-xl font-bold ${balanceTotal >= 0 ? 'text-success' : 'text-error'}`}>
                        {mostrarSaldos ? formatearMoneda(balanceTotal) : '••••••'}
                    </p>
                </div>
                <div className="p-4 bg-neutral-100 rounded-lg">
                    <p className="text-neutral-600 text-sm mb-1">Activos</p>
                    <p className="text-xl font-bold text-success">
                        {mostrarSaldos ? formatearMoneda(balancePositivo) : '••••••'}
                    </p>
                </div>
                <div className="p-4 bg-neutral-100 rounded-lg">
                    <p className="text-neutral-600 text-sm mb-1">Pasivos</p>
                    <p className="text-xl font-bold text-error">
                        {mostrarSaldos ? formatearMoneda(balanceNegativo) : '••••••'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResumenFinanciero;