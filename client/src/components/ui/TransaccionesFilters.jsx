import { useState } from 'react';
            import { Filter, Search, X } from 'lucide-react';
            import Boton from './Boton';
            import { CATEGORIAS } from '../../utils/constants';

            const TransaccionesFilters = ({
                filtros = {},
                onFilterChange,
                onReset,
                cuentas = [],
                className = "mx-auto max-w-3xl bg-white rounded-lg shadow-sm mb-6 p-4",
                vistaDetalleCuenta = false
            }) => {
                const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

                // Determinar si hay filtros activos (incluir tipo y categoría para la vista detalle)
                const hayFiltrosActivos = !vistaDetalleCuenta ?
                    (filtros.busqueda || filtros.categoria_id || filtros.tipo || filtros.cuenta_id || filtros.fecha_desde || filtros.fecha_hasta) :
                    (filtros.fecha_desde || filtros.fecha_hasta || filtros.busqueda || filtros.tipo || filtros.categoria_id);

                return (
                    <div className={className}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold text-aguazul mb-3 sm:mb-0">Movimientos</h2>

                            <div className="flex flex-wrap gap-2">
                                <Boton
                                    tipo="secundario"
                                    className={`flex items-center text-sm ${mostrarFiltrosAvanzados ? 'bg-aguazul text-white' : ''}`}
                                    onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
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

                        {/* Panel de filtros avanzados */}
                        {mostrarFiltrosAvanzados && (
                            <div className="bg-neutral-100 p-4 rounded-lg mt-2 space-y-4">
                                {/* Fechas personalizadas */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                                {/* Buscar por descripción */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Buscar</label>
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

                                {/* Filtros comunes para ambas vistas */}
                                <div className="space-y-4">
                                    {/* Tipo de transacción */}
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
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
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Categoría</label>
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
                                </div>

                                {/* Filtro de cuenta solo para vista general */}
                                {!vistaDetalleCuenta && (
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-1">Cuenta</label>
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
                            </div>
                        )}
                    </div>
                );
            };

            export default TransaccionesFilters;