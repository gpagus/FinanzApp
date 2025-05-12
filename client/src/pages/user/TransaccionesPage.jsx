import React, { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {Loader} from "lucide-react";
import { useCuentas } from '../../hooks/useCuentas';
import {getAllTransacciones} from "../../api/transaccionesApi";
import TransaccionesList from "../../components/ui/TransaccionesList";
import TransaccionesFilters from "../../components/ui/TransaccionesFilters";
import {formatearMoneda} from "../../utils/formatters";
import Boton from "../../components/ui/Boton.jsx";

// Hook personalizado para obtener todas las transacciones con paginación
const useAllTransacciones = (filtros = {}, limit = 15) => {
    return useInfiniteQuery({
        queryKey: ['allTransacciones', filtros],
        queryFn: ({ pageParam = 0 }) =>
            getAllTransacciones({ ...filtros, limit, offset: pageParam }),
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length === limit ? allPages.length * limit : undefined,
        staleTime: 5 * 60 * 1000,
        onError: (e) => toast.error(`Error cargando transacciones: ${e.message}`)
    });
};

const TransaccionesPage = () => {
    // Estado para los filtros
    const [filtros, setFiltros] = useState({
        fecha_desde: '',
        fecha_hasta: '',
        cuenta_id: '',
        tipo: '',
        categoria_id: '',
        busqueda: ''
    });

    // Obtener todas las cuentas
    const { cuentas, isLoading: cuentasLoading } = useCuentas();

    // Obtener transacciones con filtros aplicados y paginación
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error
    } = useAllTransacciones(filtros);

    // Aplanar los datos paginados
    const transacciones = data?.pages.flat() ?? [];

    // Actualizar filtros
    const handleFilterChange = (nuevosFiltros) => {
        setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
    };

    // Resetear filtros
    const handleResetFilters = () => {
        setFiltros({
            fecha_desde: '',
            fecha_hasta: '',
            cuenta_id: '',
            tipo: '',
            categoria_id: '',
            busqueda: ''
        });
    };

    // Calcular totales
    const totalIngresos = transacciones
        .filter(tx => tx.monto > 0)
        .reduce((sum, tx) => sum + tx.monto, 0);

    const totalEgresos = transacciones
        .filter(tx => tx.monto < 0)
        .reduce((sum, tx) => sum + Math.abs(tx.monto), 0);

    if (isLoading || cuentasLoading) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="flex flex-col items-center">
                    <Loader size={48} className="text-aguazul animate-spin mb-4"/>
                    <p className="text-neutral-600">Cargando todos los movimientos...</p>
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="text-center p-6 bg-error-100 rounded-lg max-w-md">
                    <h2 className="text-xl font-bold text-error mb-2">Error al cargar las cuentas</h2>
                    <p className="text-neutral-700 mb-4">{error?.message || 'Ha ocurrido un error inesperado.'}</p>
                    <Boton
                        tipo="primario"
                        onClick={() => window.location.reload()}
                    >
                        Intentar de nuevo
                    </Boton>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Todas las Transacciones</h1>
                <p className="text-gray-600">Visualiza y gestiona el historial de todas tus cuentas</p>
            </div>

            {/* Resumen financiero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-700">Ingresos</h3>
                    <p className="text-2xl font-bold text-green-600">{formatearMoneda(totalIngresos)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-700">Egresos</h3>
                    <p className="text-2xl font-bold text-red-600">{formatearMoneda(totalEgresos)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-medium text-gray-700">Balance</h3>
                    <p className={`text-2xl font-bold ${(totalIngresos - totalEgresos) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatearMoneda(totalIngresos - totalEgresos)}
                    </p>
                </div>
            </div>

            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <TransaccionesFilters
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                    cuentas={cuentas}
                    filtros={filtros}
                />
            </div>

            {/* Lista de transacciones */}
            {transacciones.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow text-center">
                    <p className="text-gray-600">No se encontraron transacciones con los filtros seleccionados.</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow">
                    <TransaccionesList
                        transacciones={transacciones}
                        cuentas={cuentas}
                        showCuentaInfo={true}
                    />

                    {/* Botón para cargar más */}
                    {hasNextPage && (
                        <div className="p-4 text-center">
                            <Boton
                                tipo="secundario"
                                onClick={() => fetchNextPage()}
                                disabled={isFetchingNextPage}
                            >
                                {isFetchingNextPage ? (
                                    <>
                                        <Loader size={16} className="animate-spin mr-2" />
                                        Cargando más...
                                    </>
                                ) : (
                                    'Cargar más transacciones'
                                )}
                            </Boton>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TransaccionesPage;