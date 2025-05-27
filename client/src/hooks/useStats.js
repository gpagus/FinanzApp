import { useQuery } from '@tanstack/react-query';
import { getStats } from '../api/statsApi';

export const useStats = () => {
    return useQuery({
        queryKey: ['admin-stats'],
        queryFn: getStats,
        staleTime: 1000 * 60 * 5, // 5 minutos
        refetchOnWindowFocus: false,
    });
};