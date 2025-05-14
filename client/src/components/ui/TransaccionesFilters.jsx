import { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import Boton from './Boton';
import { CATEGORIAS } from '../../utils/constants';
import Drawer from './Drawer';

const TransaccionesFilters = ({
                                  filtros = {},
                                  onFilterChange,
                                  onReset,
                                  cuentas = [],
                                  className = "mx-auto max-w-3xl bg-white rounded-lg shadow-sm mb-6 p-4",
                                  vistaDetalleCuenta = false
                              }) => {
    const [mostrarDrawer, setMostrarDrawer] = useState(false);

    // Determinar si hay filtros activos (incluir tipo y categoría para la vista detalle)
    const hayFiltrosActivos = !vistaDetalleCuenta ?
        (filtros.busqueda || filtros.categoria_id || filtros.tipo || filtros.cuenta_id || filtros.fecha_desde || filtros.fecha_hasta) :
        (filtros.fecha_desde || filtros.fecha_hasta || filtros.busqueda || filtros.tipo || filtros.categoria_id);

    const cerrarDrawer = () => {
        setMostrarDrawer(false);
    };

    return (
        <div className={className}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-aguazul mb-3 sm:mb-0">Movimientos</h2>

                <div className="flex flex-wrap gap-2">
                    <Boton
                        tipo="secundario"
                        className={`flex items-center text-sm ${mostrarDrawer ? 'bg-aguazul text-white' : ''}`}
                        onClick={() => setMostrarDrawer(true)}
                    >
                        <Filter size={16} className="mr-1" />
                        Filtros
                    </Boton>

                    {hayFiltrosActivos && (
                        <Boton
                            tipo="texto"
                            className="flex items-center text-sm text-error"
                            onClick={onReset}
                        >
                            <X size={16} className="mr-1" />
                            Limpiar
                        </Boton>
                    )}
                </div>
            </div>

            {/* Drawer para filtros */}
            <Drawer
                isOpen={mostrarDrawer}
                onClose={cerrarDrawer}
                title="Filtrar movimientos"
                position="right"
            >
                <div className="space-y-6">
                    {/* Fechas personalizadas */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-neutral-800">Período</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha desde</label>
                                <input
                                    type="date"
                                    className="w-full border border-neutral-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-aguazul-100"
                                    value={filtros.fecha_desde || ''}
                                    onChange={(e) => onFilterChange({...filtros, fecha_desde: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha hasta</label>
                                <input
                                    type="date"
                                    className="w-full border border-neutral-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-aguazul-100"
                                    value={filtros.fecha_hasta || ''}
                                    onChange={(e) => onFilterChange({...filtros, fecha_hasta: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Buscar por descripción */}
                    <div>
                        <h3 className="font-medium text-neutral-800 mb-2">Buscar</h3>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar en descripción..."
                                className="w-full border border-neutral-200 rounded-lg p-2 pl-9 focus:outline-none focus:ring-2 focus:ring-aguazul-100"
                                value={filtros.busqueda || ''}
                                onChange={(e) => onFilterChange({...filtros, busqueda: e.target.value})}
                            />
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
                        </div>
                    </div>

                    {/* Tipo de transacción */}
                    <div>
                        <h3 className="font-medium text-neutral-800 mb-2">Tipo</h3>
                        <select
                            className="w-full border border-neutral-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-aguazul-100"
                            value={filtros.tipo || ''}
                            onChange={(e) => onFilterChange({...filtros, tipo: e.target.value})}
                        >
                            <option value="">Todos</option>
                            <option value="ingreso">Ingresos</option>
                            <option value="gasto">Gastos</option>
                        </select>
                    </div>

                    {/* Categoría */}
                    <div>
                        <h3 className="font-medium text-neutral-800 mb-2">Categoría</h3>
                        <select
                            className="w-full border border-neutral-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-aguazul-100"
                            value={filtros.categoria_id || ''}
                            onChange={(e) => onFilterChange({...filtros, categoria_id: e.target.value})}
                        >
                            <option value="">Todas las categorías</option>
                            {CATEGORIAS.map(categoria => (
                                <option key={categoria.value} value={categoria.value}>
                                    {categoria.icono} {categoria.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de cuenta solo para vista general */}
                    {!vistaDetalleCuenta && (
                        <div>
                            <h3 className="font-medium text-neutral-800 mb-2">Cuenta</h3>
                            <select
                                className="w-full border border-neutral-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-aguazul-100"
                                value={filtros.cuenta_id || ''}
                                onChange={(e) => onFilterChange({...filtros, cuenta_id: e.target.value})}
                            >
                                <option value="">Todas las cuentas</option>
                                {cuentas.map(cuenta => (
                                    <option key={cuenta.id} value={cuenta.id}>{cuenta.nombre}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex flex-col gap-3 pt-4 mt-6 border-t border-neutral-200">
                        <Boton
                            tipo="primario"
                            onClick={cerrarDrawer}
                            fullWidth
                        >
                            Aplicar filtros
                        </Boton>

                        {hayFiltrosActivos && (
                            <Boton
                                tipo="secundario"
                                onClick={() => {
                                    onReset();
                                    cerrarDrawer();
                                }}
                                fullWidth
                            >
                                Limpiar filtros
                            </Boton>
                        )}
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default TransaccionesFilters;