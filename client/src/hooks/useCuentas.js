import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCuentas, addCuenta, updateCuenta, deleteCuenta } from '../api/cuentasApi';
import toast from 'react-hot-toast';

// Clave para identificar la query de cuentas en react-query
const CUENTAS_QUERY_KEY = 'cuentas';

export function useCuentas() {
    const queryClient = useQueryClient();

    // Query para obtener todas las cuentas
    const {
        data: cuentas = [],
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: [CUENTAS_QUERY_KEY],
        queryFn: getCuentas,
        staleTime: 5 * 60 * 1000, // Los datos se consideran actuales durante 5 minutos
        gcTime: 10 * 60 * 1000, // Los datos se mantienen en caché por 10 minutos (antes cacheTime)
        retry: 2, // Reintenta la petición hasta 2 veces en caso de error
        onError: (err) => {
            toast.error(`Error al cargar las cuentas: ${err.message}`);
        }
    });

    // Mutación para añadir una nueva cuenta
    const addMutation = useMutation({
        mutationFn: addCuenta,
        onSuccess: (nuevaCuenta) => {
            // Actualiza la caché de react-query añadiendo la nueva cuenta a los datos existentes
            queryClient.setQueryData([CUENTAS_QUERY_KEY], (old) => [...(old || []), nuevaCuenta]);
            toast.success('Cuenta añadida correctamente');
        },
        onError: (err) => {
            toast.error(`Error al añadir la cuenta: ${err.message}`);
        }
    });

    // Mutación para actualizar una cuenta existente
    const updateMutation = useMutation({
        mutationFn: ({ id, datos }) => updateCuenta(id, datos),
        onSuccess: (cuentaActualizada) => {
            // Actualiza la caché reemplazando la cuenta actualizada
            queryClient.setQueryData([CUENTAS_QUERY_KEY], (old) =>
                old?.map(cuenta =>
                    cuenta.id === cuentaActualizada.id ? cuentaActualizada : cuenta
                )
            );
            toast.success('Cuenta actualizada correctamente');
        },
        onError: (err) => {
            toast.error(`Error al actualizar la cuenta: ${err.message}`);
        }
    });

    // Mutación para eliminar una cuenta
    const deleteMutation = useMutation({
        mutationFn: deleteCuenta,
        onSuccess: (_, variables) => {
            // Actualiza la caché eliminando la cuenta
            queryClient.setQueryData([CUENTAS_QUERY_KEY], (old) =>
                old?.filter(cuenta => cuenta.id !== variables)
            );
            toast.success('Cuenta eliminada correctamente');
        },
        onError: (err) => {
            toast.error(`Error al eliminar la cuenta: ${err.message}`);
        }
    });

    // Calcular balances totales
    const balanceTotal = cuentas?.reduce((total, cuenta) => total + cuenta.balance, 0) || 0;
    const balancePositivo = cuentas
        ?.filter(cuenta => cuenta.balance > 0)
        .reduce((total, cuenta) => total + cuenta.balance, 0) || 0;
    const balanceNegativo = cuentas
        ?.filter(cuenta => cuenta.balance < 0)
        .reduce((total, cuenta) => total + cuenta.balance, 0) || 0;

    return {
        // Datos y estado
        cuentas,
        isLoading,
        isError,
        error,
        balanceTotal,
        balancePositivo,
        balanceNegativo,

        // Acciones
        refetch,
        agregarCuenta: (nuevaCuenta) => addMutation.mutate(nuevaCuenta),
        actualizarCuenta: (id, datos) => updateMutation.mutate({ id, datos }),
        eliminarCuenta: (id) => deleteMutation.mutate(id),

        // Estado de las mutaciones
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
}