import { fetchWithAuth } from './fetchWithAuth';

const API_URL = import.meta.env.VITE_API_URL;

export async function getAnalisisGastos() {
    const response = await fetchWithAuth(`${API_URL}/api/analisis/gastos`, {
        method: 'GET'
    });

    if (!response.ok) {
        throw new Error('Error al obtener análisis');
    }

    return response.json();
}