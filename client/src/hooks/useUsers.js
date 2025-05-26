import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {getUsers, updateUserStatus} from '../api/usersApi';
import toast from 'react-hot-toast';

export function useUsers() {
    const queryClient = useQueryClient();

    const usersQuery = useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        staleTime: 1000 * 60 * 5, // 5 minutos de caché
    });

    // En useUsers.js, dentro de la función updateStatusMutation
    const updateStatusMutation = useMutation({
        mutationFn: ({userId, isActive}) => updateUserStatus(userId, isActive),
        onSuccess: (data) => {
            // Actualizar la caché de usuarios
            queryClient.setQueryData(['users'], (oldData) => {
                return oldData ? oldData.map(user =>
                    user.id === data.id ? {...user, estado: data.estado} : user
                ) : oldData;
            });

            // Actualizar la caché del usuario específico por ID
            queryClient.setQueryData(['user', data.id], (oldData) => {
                if (!oldData) return oldData;
                return {...oldData, estado: data.estado};
            });

            // Invalidar la consulta del usuario por email
            queryClient.invalidateQueries({queryKey: ['usuario', data.email]});

            toast.success(`Usuario ${data.estado ? 'activado' : 'desactivado'}`);
        },
        onError: (error) => {
            toast.error(`Error: ${error.message}`);
        }
    });

    return {
        ...usersQuery,
        updateUserStatus: updateStatusMutation.mutate,
        isUpdatingStatus: updateStatusMutation.isPending
    };
}