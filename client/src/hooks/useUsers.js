import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/getUsers';

export function useUsers() {
    return useQuery({
        queryKey: ['users'],
        queryFn: getUsers,
        staleTime: 1000 * 60 * 5, // 5 minutos de caché
    });
}
