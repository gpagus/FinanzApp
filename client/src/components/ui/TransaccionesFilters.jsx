import { Filter, CalendarRange } from 'lucide-react';
import Boton from '../ui/Boton';

const TransaccionesFilters = ({
                                  filtroFecha,
                                  setFiltroFecha,
                                  onOpenFilters = () => {},
                                  className = "mx-auto max-w-3xl bg-white rounded-lg shadow-sm mb-6 p-4"
                              }) => {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between ${className}`}>
            <h2 className="text-lg font-semibold text-aguazul mb-3 sm:mb-0">Movimientos</h2>

            <div className="flex flex-wrap gap-2">
                <div className="relative">
                    <select
                        className="bg-neutral-100 border border-neutral-200 rounded-lg py-2 pl-9 pr-3 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-aguazul-100"
                        value={filtroFecha}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                    >
                        <option value="ultimos30">Últimos 30 días</option>
                        <option value="ultimos90">Últimos 90 días</option>
                        <option value="año">Este año</option>
                        <option value="personalizado">Personalizado</option>
                    </select>
                    <CalendarRange size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
                </div>

                <Boton
                    tipo="secundario"
                    className="flex items-center text-sm"
                    onClick={onOpenFilters}
                >
                    <Filter size={16} className="mr-1" />
                    Filtros
                </Boton>
            </div>
        </div>
    );
};

export default TransaccionesFilters;