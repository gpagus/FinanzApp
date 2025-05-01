import {fetchWithAuth} from "./fetchWithAuth";

export async function getUsers() {
    try {
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/admin/usuarios`);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Error al obtener usuarios');
        }

        return await res.json();
    } catch (error) {
        console.error("Error en getUsers:", error);
        throw error;
    }
}