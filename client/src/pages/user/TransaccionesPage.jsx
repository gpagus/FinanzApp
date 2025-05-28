import {useState} from 'react';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import {useCuentas} from '../../hooks/useCuentas';
import TransaccionesList from "../../components/ui/TransaccionesList";
import TransaccionesFilters from "../../components/ui/TransaccionesFilters";
import Boton from "../../components/ui/Boton";
import {getAllTransacciones} from '../../api/transaccionesApi';

const TransaccionesPage = () => {
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
            
            {/* Encabezado mejorado */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-aguazul mb-2">Mis movimientos</h1>
                <p className="text-neutral-600 text-sm">
                    Consulta los movimientos de todas tus cuentas
                </p>
            </div>

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