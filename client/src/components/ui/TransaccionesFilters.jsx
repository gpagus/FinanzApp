import { useState } from 'react';
import { Filter, CalendarRange, Search, X } from 'lucide-react';
import Boton from './Boton';
import { CATEGORIAS } from '../../utils/constants';

const TransaccionesFilters = ({
                                  filtroFecha,
                                  setFiltroFecha,
                                  filtros = {},
                                  onFilterChange,
                                  onReset,
                                  cuentas = [],
                                  className = "mx-auto max-w-3xl bg-white rounded-lg shadow-sm mb-6 p-4",
                                  vistaDetalleCuenta = false
                              }) => {
    const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);
    const [fechasPersonalizadas, setFechasPersonalizadas] = useState({
        desde: filtros.fecha_desde || '',
        hasta: filtros.fecha_hasta || ''
    });

    // Determinar si hay filtros activos
    const hayFiltrosActivos = !vistaDetalleCuenta ?
        (filtros.busqueda || filtros.categoria_id || filtros.tipo || filtros.cuenta_id || filtros.fecha_desde || filtros.fecha_hasta) :
        (filtroFecha !== 'ultimos30');

    const handleChangeFiltroFecha = (valor) => {
        // Para vista detalle de cuenta, solo actualizamos el filtro local
        if (vistaDetalleCuenta) {
            setFiltroFecha(valor);
            return;
        }

        // Para vista general, actualizamos el estado de filtros con fechas
        let nuevosFiltros = { ...filtros };

        // Configurar fechas según la opción seleccionada
        switch (valor) {
            case 'ultimos30':
                const hace30Dias = new Date();
                hace30Dias.setDate(hace30Dias.getDate() - 30);
                nuevosFiltros.fecha_desde = hace30Dias.toISOString().split('T')[0];
                nuevosFiltros.fecha_hasta = new Date().toISOString().split('T')[0];
                break;
            case 'ultimos90':
                const hace90Dias = new Date();
                hace90Dias.setDate(hace90Dias.getDate() - 90);
                nuevosFiltros.fecha_desde = hace90Dias.toISOString().split('T')[0];
                nuevosFiltros.fecha_hasta = new Date().toISOString().split('T')[0];
                break;
            case 'año':
                const inicioAño = new Date(new Date().getFullYear(), 0, 1);
                nuevosFiltros.fecha_desde = inicioAño.toISOString().split('T')[0];
                nuevosFiltros.fecha_hasta = new Date().toISOString().split('T')[0];
                break;
            case 'personalizado':
                // No hacemos nada, se manejará en el panel de fechas personalizadas
                break;
            default:
                // Si es "todo", eliminamos los filtros de fecha
                delete nuevosFiltros.fecha_desde;
                delete nuevosFiltros.fecha_hasta;
        }

        onFilterChange(nuevosFiltros);
    };

    const aplicarFechasPersonalizadas = () => {
        if (vistaDetalleCuenta) {
            // Para vista detalle, usaremos estos valores al hacer la consulta
            setFiltroFecha('personalizado');
        } else {
            onFilterChange({
                ...filtros,
                fecha_desde: fechasPersonalizadas.desde,
                fecha_hasta: fechasPersonalizadas.hasta
            });
        }
    };

    return (
        <div className={className}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-aguazul mb-3 sm:mb-0">Movimientos</h2>

                <div className="flex flex-wrap gap-2">
                    <div className="relative">
                        <select
                            className="bg-neutral-100 border border-neutral-200 rounded-lg py-2 pl-9 pr-3 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-aguazul-100"
                            value={vistaDetalleCuenta ? filtroFecha : (filtros.fecha_desde ? 'personalizado' : 'todo')}
                            onChange={(e) => handleChangeFiltroFecha(e.target.value)}
                        >
                            <option value="todo">Todo</option>
                            <option value="ultimos30">Últimos 30 días</option>
                            <option value="ultimos90">Últimos 90 días</option>
                            <option value="año">Este año</option>
                            <option value="personalizado">Personalizado</option>
                        </select>
                        <CalendarRange size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-600" />
                    </div>

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
                            tipo="secundario"
                            className="flex items-center text-sm text-error"
                            onClick={vistaDetalleCuenta ? () => setFiltroFecha('todo') : onReset}
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
                    {(vistaDetalleCuenta ? filtroFecha === 'personalizado' : true) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha desde</label>
                                <input
                                    type="date"
                                    className="w-full border border-neutral-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-aguazul-100"
                                    value={fechasPersonalizadas.desde}
                                    onChange={(e) => setFechasPersonalizadas({...fechasPersonalizadas, desde: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Fecha hasta</label>
                                <input
                                    type="date"
                                    className="w-full border border-neutral-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-aguazul-100"
                                    value={fechasPersonalizadas.hasta}
                                    onChange={(e) => setFechasPersonalizadas({...fechasPersonalizadas, hasta: e.target.value})}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Boton
                                    tipo="primario"
                                    className="text-sm"
                                    onClick={aplicarFechasPersonalizadas}
                                    disabled={!fechasPersonalizadas.desde || !fechasPersonalizadas.hasta}
                                >
                                    Aplicar fechas
                                </Boton>
                            </div>
                        </div>
                    )}

                    {/* Filtros adicionales para vista general */}
                    {!vistaDetalleCuenta && (
                        <div className="space-y-4">
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

                            {/* Selección de cuenta */}
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
                    )}
                </div>
            )}
        </div>
    );
};

export default TransaccionesFilters;