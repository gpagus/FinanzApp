import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCuentas, addCuenta, updateCuenta, deleteCuenta } from '../api/cuentasApi';
import toast from 'react-hot-toast';

export const useCuentas = () => {
    const queryClient = useQueryClient();

    // Query para obtener cuentas
    const {
        data: cuentas = [],
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['cuentas'],
        queryFn: getCuentas,
        staleTime: 5 * 60 * 1000, // 5 minutos
        onError: (e) => toast.error(`Error al cargar las cuentas: ${e.message}`)
    });

    // Mutación para agregar cuenta
    const addMutation = useMutation({
        mutationFn: (nuevaCuenta) => {
            console.log("Enviando cuenta al backend:", nuevaCuenta); // Debug
            return addCuenta(nuevaCuenta);
        },
        onSuccess: (nuevaCuenta) => {
            queryClient.setQueryData(['cuentas'], (old = []) => [...old, nuevaCuenta]);
            toast.success('Cuenta creada');
        },
        onError: (error) => {
            console.error("Error al crear cuenta:", error);
            toast.error(`${error.message}`);
        }
    });

    // Mutación para actualizar cuenta
    const updateMutation = useMutation({
        mutationFn: ({ id, datos }) => updateCuenta(id, datos),
        onSuccess: (cuentaActualizada) => {
            queryClient.setQueryData(['cuentas'], (old = []) =>
                old.map(cuenta => cuenta.id === cuentaActualizada.id ? cuentaActualizada : cuenta)
            );
            toast.success('Cuenta actualizada');
        },
        onError: (error) => toast.error(`Error al actualizar cuenta: ${error.message}`)
    });

    // Mutación para eliminar cuenta
    const deleteMutation = useMutation({
        mutationFn: (id) => deleteCuenta(id),
        onSuccess: (_, id) => {
            queryClient.setQueryData(['cuentas'], (old = []) =>
                old.filter(cuenta => cuenta.id !== id)
            );
            toast.success('Cuenta eliminada');
        },
        onError: (error) => toast.error(`Error al eliminar cuenta: ${error.message}`)
    });

    // Cálculos de balance
    const balanceTotal = cuentas.reduce((sum, cuenta) => sum + cuenta.balance, 0);
    const balancePositivo = cuentas
        .filter(cuenta => cuenta.balance > 0)
        .reduce((sum, cuenta) => sum + cuenta.balance, 0);
    const balanceNegativo = cuentas
        .filter(cuenta => cuenta.balance < 0)
        .reduce((sum, cuenta) => sum + cuenta.balance, 0);

    return {
        cuentas,
        isLoading,
        isError,
        error,
        refetch,
        balanceTotal,
        balancePositivo,
        balanceNegativo,
        agregarCuenta: addMutation.mutate,
        actualizarCuenta: updateMutation.mutate,
        eliminarCuenta: deleteMutation.mutate,
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};