import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = import.meta.env.VITE_API_URL;

export const getStats = async () => {
    try {
        const res = await fetchWithAuth(`${API_URL}/api/admin/stats`);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al obtener estadísticas');
        }

        return await res.json();
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        throw error;
    }
};

export const getRecentActivity = async (limit = 10) => {
    try {
        const res = await fetchWithAuth(`${API_URL}/api/admin/activity?limit=${limit}`);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al obtener actividad reciente');
        }

        return await res.json();
    } catch (error) {
        console.error('Error al obtener actividad reciente:', error);
        throw error;
    }
};