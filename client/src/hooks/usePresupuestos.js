import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getPresupuestos, addPresupuesto, updatePresupuesto, deletePresupuesto } from '../api/presupuestosApi';

export const usePresupuestos = () => {
    const queryClient = useQueryClient();

    // Consulta para obtener presupuestos
    const { data: presupuestos = [], isLoading, isError, error, refetch } = useQuery({
        queryKey: ['presupuestos'],
        queryFn: getPresupuestos,
        onError: (error) => {
            console.error('Error al cargar presupuestos:', error);
            toast.error('No se pudieron cargar los presupuestos');
        }
    });

    // Mutación para crear presupuesto
    const addMutation = useMutation({
        mutationFn: (nuevoPresupuesto) => {
            console.log("Enviando presupuesto al backend:", nuevoPresupuesto); // Debug
            return addPresupuesto(nuevoPresupuesto);
        },
        onSuccess: (nuevoPresupuesto) => {
            queryClient.setQueryData(['presupuestos'], (old = []) => [...old, nuevoPresupuesto]);
            toast.success('Presupuesto creado');
        },
        onError: (error) => {
            console.error("Error al crear presupuesto:", error);
            toast.error(`${error.message}`);
        }
    });

    // Mutación para actualizar presupuesto
    const updateMutation = useMutation({
        mutationFn: ({id, datos}) => updatePresupuesto(id, datos),
        onSuccess: (presupuestoActualizado) => {
            queryClient.setQueryData(['presupuestos'], (old = []) =>
                old.map(presupuesto => presupuesto.id === presupuestoActualizado.id ? presupuestoActualizado : presupuesto)
            );
            toast.success('Presupuesto actualizado');
        },
        onError: (error) => toast.error(`Error al actualizar presupuesto: ${error.message}`)
    });

    // Mutación para eliminar presupuesto
    const deleteMutation = useMutation({
        mutationFn: (id) => deletePresupuesto(id),
        onSuccess: (_, id) => {
            queryClient.setQueryData(['presupuestos'], (old = []) =>
                old.filter(presupuesto => presupuesto.id !== id)
            );
            toast.success('Presupuesto eliminado');
        },
        onError: (error) => toast.error(`Error al eliminar presupuesto: ${error.message}`)
    });

    // Cálculos de totales presupuestarios (si fueran necesarios)
    const limiteTotal = presupuestos.reduce((sum, presupuesto) => sum + parseFloat(presupuesto.limite || 0), 0);
    const progresoTotal = presupuestos.reduce((sum, presupuesto) => sum + parseFloat(presupuesto.progreso || 0), 0);

    return {
        presupuestos,
        isLoading,
        isError,
        error,
        refetch,
        limiteTotal,
        progresoTotal,
        agregarPresupuesto: addMutation.mutate,
        actualizarPresupuesto: updateMutation.mutate,
        eliminarPresupuesto: deleteMutation.mutate,
        isAdding: addMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};