import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {getTransacciones, addTransaccion, updateTransaccion, deleteTransaccion} from '../api/transaccionesApi';
import toast from 'react-hot-toast';
import {useState} from 'react';

export default function useTransacciones({cuentaId, limit = 15}) {
    const qc = useQueryClient();
    const [filtros, setFiltros] = useState({
        fecha_desde: '',
        fecha_hasta: '',
        busqueda: ''
    });

    /* ---------- lectura (scroll infinito) ---------- */
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ['transacciones', cuentaId, filtros],
        queryFn: ({pageParam = 0}) =>
            getTransacciones({
                cuentaId,
                limit,
                offset: pageParam,
                fecha_desde: filtros.fecha_desde,
                fecha_hasta: filtros.fecha_hasta,
                busqueda: filtros.busqueda,
                tipo: filtros.tipo,
                categoria_id: filtros.categoria_id
            }),
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length === limit ? allPages.length * limit : undefined,
        enabled: !!cuentaId,
        staleTime: 5 * 60 * 1000,
        onError: (e) => toast.error(`Error cargando transacciones: ${e.message}`),
    });
    // aplanamos páginas
    const transacciones = data?.pages.flat() ?? [];

    /* ---------- mutaciones ---------- */
    const addMutation = useMutation({
        mutationFn: addTransaccion,
        onSuccess: (nueva, { esRectificacion } = {}) => {
            // Actualizar transacciones de cuenta origen
            qc.setQueryData(['transacciones', cuentaId, filtros], (old) => {
                if (!old) return {pages: [[nueva]], pageParams: [0]};
                const firstPage = old.pages[0] ?? [];
                return {
                    ...old,
                    pages: [[nueva, ...firstPage], ...old.pages.slice(1)],
                };
            });

            // Actualizar saldo de cuenta origen
            actualizarSaldoCuenta(cuentaId, nueva.monto, nueva.tipo);

            // Si es una transferencia, actualizar también la cuenta destino
            if (nueva.cuenta_destino_id && nueva.categoria_id === 6) {
                // Actualizar transacciones de cuenta destino (añadir la entrada espejo)
                qc.setQueryData(['transacciones', nueva.cuenta_destino_id, filtros], (old) => {
                    // Si no hay datos, crear una nueva estructura
                    if (!old) return {pages: [[]], pageParams: [0]};

                    // Crear transacción espejo (ingreso en cuenta destino)
                    const transaccionEspejo = {
                        ...nueva,
                        id: `temp-${nueva.id || Date.now()}`, // ID temporal hasta refresco
                        cuenta_id: nueva.cuenta_destino_id,
                        cuenta_origen_id: nueva.cuenta_id,
                        tipo: 'ingreso',
                        categoria_id: 5, // Categoría de transferencia recibida
                        descripcion: `Transferencia: ${nueva.descripcion || 'recibida'}`
                    };

                    const firstPage = old.pages[0] ?? [];
                    return {
                        ...old,
                        pages: [[transaccionEspejo, ...firstPage], ...old.pages.slice(1)],
                    };
                });

                // Actualizar saldo de cuenta destino (como ingreso)
                actualizarSaldoCuenta(nueva.cuenta_destino_id, nueva.monto, 'ingreso');
            }

            qc.invalidateQueries(['todas-transacciones']);

            // No mostramos el mensaje si es rectificación, ya que se mostrará en el componente
            if (!esRectificacion) {
                toast.success('Movimiento registrado');
            }
        },
        onError: (e) => {
            toast.error(`${e.message}`);
        },
    });

    // 2. actualizar
    const updateMutation = useMutation({
        mutationFn: ({id, datos}) => updateTransaccion(id, datos),
        onSuccess: (act, variables) => {
            const {id, datos, montoAnterior} = variables;
            qc.setQueryData(['transacciones', cuentaId, filtros], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) =>
                        page.map((t) => (t.id === id ? act : t))
                    ),
                };
            });
            actualizarSaldoCuenta(cuentaId, datos.monto - montoAnterior);

            qc.invalidateQueries(['todas-transacciones']);
            toast.success('Transacción actualizada');
        },
    });

    // 3. eliminar
    const deleteMutation = useMutation({
        mutationFn: ({id}) => deleteTransaccion(id),
        onSuccess: (_, {id, montoEliminado}) => {
            qc.setQueryData(['transacciones', cuentaId, filtros], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => page.filter((t) => t.id !== id)),
                };
            });
            actualizarSaldoCuenta(cuentaId, -montoEliminado);

            qc.invalidateQueries(['todas-transacciones']);
            toast.success('Transacción eliminada');
        },
    });

    /* ---------- helpers ---------- */
    const actualizarSaldoCuenta = (cuentaId, diff, tipo) => {
        qc.setQueryData(['cuentas'], (cuentas = []) => {

            const cuentasActualizadas = cuentas.map((c) => {
                if (c.id === cuentaId) {
                    const nuevoBalance = c.balance + (tipo === 'gasto' ? -diff : diff);
                    return {...c, balance: nuevoBalance};
                }
                return c;
            });

            return cuentasActualizadas;
        });
    };

    // Función para actualizar los filtros
    const actualizarFiltros = (nuevosFiltros) => {
        setFiltros(prev => ({...prev, ...nuevosFiltros}));
    };

// Función para resetear los filtros
    const resetearFiltros = () => {
        setFiltros({
            fecha_desde: '',
            fecha_hasta: '',
            busqueda: '',
            tipo: '',
            categoria_id: ''
        });
    };

    return {
        transacciones,
        cargandoTransacciones: isLoading,
        cargandoMas: isFetchingNextPage,
        hayMasTransacciones: hasNextPage,
        errorTransacciones: error,
        refetchTransacciones: refetch,
        cargarMasTransacciones: fetchNextPage,
        filtros,
        actualizarFiltros,
        resetearFiltros,
        // acciones
        agregarTransaccion: addMutation.mutate,
        actualizarTransaccion: updateMutation.mutate,
        eliminarTransaccion: deleteMutation.mutate,
        // estados
        isAddingTransaccion: addMutation.isPending,
        isUpdatingTransaccion: updateMutation.isPending,
        isDeletingTransaccion: deleteMutation.isPending,
    };
}
