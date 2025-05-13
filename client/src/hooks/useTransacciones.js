import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {getTransacciones, addTransaccion, updateTransaccion, deleteTransaccion} from '../api/transaccionesApi';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function useTransacciones({cuentaId, limit = 15}) {
    const qc = useQueryClient();
    const [filtroFecha, setFiltroFecha] = useState('ultimos30');
    const [fechasPersonalizadas, setFechasPersonalizadas] = useState({
        desde: '',
        hasta: ''
    });

    // Calcular fechas basadas en el filtro
    const obtenerFechasParaFiltro = () => {
        const hoy = new Date();
        switch(filtroFecha) {
            case 'ultimos30':
                { const hace30Dias = new Date(hoy);
                hace30Dias.setDate(hoy.getDate() - 30);
                return {
                    desde: hace30Dias.toISOString().split('T')[0],
                    hasta: hoy.toISOString().split('T')[0]
                }; }
            case 'ultimos90':
                { const hace90Dias = new Date(hoy);
                hace90Dias.setDate(hoy.getDate() - 90);
                return {
                    desde: hace90Dias.toISOString().split('T')[0],
                    hasta: hoy.toISOString().split('T')[0]
                }; }
            case 'año':
                { const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
                return {
                    desde: inicioAnio.toISOString().split('T')[0],
                    hasta: hoy.toISOString().split('T')[0]
                }; }
            case 'personalizado':
                return fechasPersonalizadas;
            case 'todo':
            default:
                return { desde: '', hasta: '' };
        }
    };

    const fechasFiltro = obtenerFechasParaFiltro();

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
        queryKey: ['transacciones', cuentaId, filtroFecha, fechasPersonalizadas],
        queryFn: ({pageParam = 0}) =>
            getTransacciones({
                cuentaId,
                limit,
                offset: pageParam,
                fecha_desde: fechasFiltro.desde,
                fecha_hasta: fechasFiltro.hasta
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
    // 1. añadir
    const addMutation = useMutation({
        mutationFn: addTransaccion,
        onSuccess: (nueva) => {
            // Actualizar transacciones de cuenta origen
            qc.setQueryData(['transacciones', cuentaId, filtroFecha], (old) => {
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
                qc.setQueryData(['transacciones', nueva.cuenta_destino_id, filtroFecha], (old) => {
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
            toast.success('Movimiento registrado');
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

            qc.invalidateQueries(['todas-transacciones']);
            toast.success('Transacción actualizada');
        },
    });

    // 3. eliminar
    const deleteMutation = useMutation({
        mutationFn: ({id}) => deleteTransaccion(id),
        onSuccess: (_, {id, montoEliminado}) => {
            qc.setQueryData(['transacciones', cuentaId, filtroFecha], (old) => {
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

    return {
        transacciones,
        cargandoTransacciones: isLoading,
        cargandoMas: isFetchingNextPage,
        hayMasTransacciones: hasNextPage,
        errorTransacciones: error,
        refetchTransacciones: refetch,
        cargarMasTransacciones: fetchNextPage,
        filtroFecha,
        setFiltroFecha,
        fechasPersonalizadas,
        setFechasPersonalizadas,
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
