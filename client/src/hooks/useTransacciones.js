// useTransacciones.jsx
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTransacciones, addTransaccion, updateTransaccion, deleteTransaccion } from '../api/transaccionesApi';
import toast from 'react-hot-toast';

export default function useTransacciones({ cuentaId, filtroFecha = 'todo', limit = 15 }) {
    const qc = useQueryClient();

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
        queryKey: ['transacciones', cuentaId, filtroFecha],
        queryFn: ({ pageParam = 0 }) =>
            getTransacciones({ cuentaId, limit, offset: pageParam }),
        getNextPageParam: (lastPage, allPages) =>
            lastPage.length === limit ? allPages.length * limit : undefined,
        enabled: !!cuentaId,
        staleTime: 5 * 60 * 1000,
        onError: (e) => toast.error(`Error cargando transacciones: ${e.message}`),
    });

    // aplanamos páginas
    const transacciones = data?.pages.flat() ?? [];

    /* ---------- mutaciones ---------- */
    // 1. añadir
    const addMutation = useMutation({
        mutationFn: addTransaccion,
        onSuccess: (nueva) => {
            qc.setQueryData(['transacciones', cuentaId, filtroFecha], (old) => {
                if (!old) return { pages: [[nueva]], pageParams: [0] };
                const firstPage = old.pages[0] ?? [];
                return {
                    ...old,
                    pages: [[nueva, ...firstPage], ...old.pages.slice(1)],
                };
            });
            actualizarSaldoCuenta(cuentaId, nueva.monto);
            toast.success('Transacción creada');
        },
    });

    // 2. actualizar
    const updateMutation = useMutation({
        mutationFn: ({ id, datos }) => updateTransaccion(id, datos),
        onSuccess: (act, variables) => {
            const { id, datos, montoAnterior } = variables;
            qc.setQueryData(['transacciones', cuentaId, filtroFecha], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) =>
                        page.map((t) => (t.id === id ? act : t))
                    ),
                };
            });
            actualizarSaldoCuenta(cuentaId, datos.monto - montoAnterior);
            toast.success('Transacción actualizada');
        },
    });

    // 3. eliminar
    const deleteMutation = useMutation({
        mutationFn: ({ id }) => deleteTransaccion(id),
        onSuccess: (_, { id, montoEliminado }) => {
            qc.setQueryData(['transacciones', cuentaId, filtroFecha], (old) => {
                if (!old) return old;
                return {
                    ...old,
                    pages: old.pages.map((page) => page.filter((t) => t.id !== id)),
                };
            });
            actualizarSaldoCuenta(cuentaId, -montoEliminado);
            toast.success('Transacción eliminada');
        },
    });

    /* ---------- helpers ---------- */
    const actualizarSaldoCuenta = (cuentaId, diff) => {
        qc.setQueryData(['cuentas'], (cuentas = []) =>
            cuentas.map((c) =>
                c.id === cuentaId ? { ...c, balance: c.balance + diff } : c
            )
        );
    };

    return {
        transacciones,
        cargandoTransacciones: isLoading,
        cargandoMas: isFetchingNextPage,
        hayMasTransacciones: hasNextPage,
        errorTransacciones: error,
        refetchTransacciones: refetch,
        cargarMasTransacciones: fetchNextPage,
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
