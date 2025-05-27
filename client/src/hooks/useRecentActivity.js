import { useQuery } from '@tanstack/react-query';
import { getRecentActivity } from '../api/statsApi';

export const useRecentActivity = (limit = 10) => {
    return useQuery({
        queryKey: ['recent-activity', limit],
        queryFn: () => getRecentActivity(limit),
        staleTime: 1000 * 60 * 2, // 2 minutos
        refetchOnWindowFocus: false,
    });
};