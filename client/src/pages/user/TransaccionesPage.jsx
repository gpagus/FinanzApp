import React, {useState, useMemo} from 'react';
import {useInfiniteQuery, useQuery, useQueryClient} from '@tanstack/react-query';
import {useSaldos} from "../../context/SaldosContext";
import {useCuentas} from '../../hooks/useCuentas';
import TransaccionesList from "../../components/ui/TransaccionesList";
import TransaccionesFilters from "../../components/ui/TransaccionesFilters";
import Boton from "../../components/ui/Boton";
import {getAllTransacciones} from '../../api/transaccionesApi';
import ResumenMovimientos from "../../components/ui/stats/ResumenMovimientos";
import {CATEGORIAS} from "../../utils/constants";

const TransaccionesPage = () => {
    const {mostrarSaldos} = useSaldos();
    const queryClient = useQueryClient();

    const {
        cuentas,
        isLoading: cuentasLoading
    } = useCuentas();

    // Estado para los filtros
    const [filtros, setFiltros] = useState({
        fecha_desde: '',
        fecha_hasta: '',
        cuenta_id: '',
        tipo: '',
        categoria_id: '',
        busqueda: ''
    });

    // Consulta separada para obtener TODAS las transacciones para estadísticas
    const {data: todasTransacciones = [], isLoading: _isLoadingEstadisticas} = useQuery({
        queryKey: ['estadisticas-transacciones'],
        queryFn: () => getAllTransacciones({limit: 1000}).then(res => res.data),
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    // Consulta infinita con React Query para el listado filtrado
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch
    } = useInfiniteQuery({
        queryKey: ['todas-transacciones', filtros],
        queryFn: ({pageParam = 0}) =>
            getAllTransacciones({
                ...filtros,
                limit: 15,
                offset: pageParam
            }),
        getNextPageParam: (lastPage) => {
            // Si la última página tiene 15 elementos, hay más páginas
            return lastPage.data.length === 15 ?
                lastPage.offset + lastPage.data.length :
                undefined;
        },
        select: (data) => ({
            pages: data.pages.map(page => page.data),
            pageParams: data.pageParams,
        }),
        staleTime: 5 * 60 * 1000, // 5 minutos
    });

    // Aplanar las páginas de transacciones para el listado
    const transacciones = data?.pages.flat() || [];

// Calcular estadísticas de movimientos con TODAS las transacciones
    // Calcular estadísticas de movimientos con TODAS las transacciones
    const estadisticasMovimientos = useMemo(() => {
        if (!todasTransacciones.length) {
            return {
                ingresosTotales: 0,
                gastosTotales: 0,
                ahorroNeto: 0,
                totalTransacciones: 0
            };
        }

        // Calcular ingresos y gastos totales
        let ingresosTotales = 0;
        let gastosTotales = 0;

        todasTransacciones.forEach(transaccion => {
            const monto = Math.abs(transaccion.monto);

            if (transaccion.tipo === 'ingreso') {
                ingresosTotales += monto;
            } else if (transaccion.tipo === 'gasto') {
                // Verificar si es un gasto real comprobando el tipo de la categoría
                if (transaccion.categoria_id) {
                    const categoriaEncontrada = CATEGORIAS.find(cat => cat.value === transaccion.categoria_id);
                    if (categoriaEncontrada && categoriaEncontrada.tipo === 'gasto') {
                        // Solo sumar a los gastos totales si es un gasto real
                        gastosTotales += monto;
                    }
                }
            }
        });

        return {
            ingresosTotales,
            gastosTotales,
            ahorroNeto: ingresosTotales - gastosTotales,
            totalTransacciones: todasTransacciones.length
        };
    }, [todasTransacciones]);

    // Actualizar filtros
    const handleFilterChange = (nuevosFiltros) => {
        setFiltros(prev => ({...prev, ...nuevosFiltros}));
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

    // Función para forzar actualización de datos
    const forceRefresh = () => {
        queryClient.invalidateQueries(['todas-transacciones']);
        queryClient.invalidateQueries(['estadisticas-transacciones']);
    };

    if (error) {
        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
                <div className="text-center p-6 bg-error-100 rounded-lg max-w-md">
                    <h2 className="text-xl font-bold text-error mb-2">Error al cargar las transacciones</h2>
                    <p className="text-neutral-700 mb-4">{error?.message || 'Ha ocurrido un error inesperado.'}</p>
                    <Boton
                        tipo="primario"
                        onClick={() => refetch()}
                    >
                        Intentar de nuevo
                    </Boton>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-4rem-2.5rem)]">

            <h1 className="text-2xl mb-6 font-bold text-aguazul">Mis movimientos</h1>

           {/* Resumen de movimientos */}
            <ResumenMovimientos
                className="mb-6"
                ingresosTotales={estadisticasMovimientos.ingresosTotales}
                gastosTotales={estadisticasMovimientos.gastosTotales}
                ahorroNeto={estadisticasMovimientos.ahorroNeto}
                totalTransacciones={estadisticasMovimientos.totalTransacciones}
                mostrarSaldos={mostrarSaldos}
            />

            {/* Filtros */}
            <TransaccionesFilters
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                cuentas={cuentas}
                filtros={filtros}
            />

            {/* Lista de transacciones */}
            <TransaccionesList
                transacciones={transacciones}
                cargando={isLoading || cuentasLoading}
                cargandoMas={isFetchingNextPage}
                hayMasTransacciones={hasNextPage}
                cargarMas={fetchNextPage}
                mostrarCuenta={true}
                onTransaccionUpdated={forceRefresh}
            />
        </div>
    );
};

export default TransaccionesPage;