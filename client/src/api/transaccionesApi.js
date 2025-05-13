import {fetchWithAuth} from "./fetchWithAuth";

const API_URL = import.meta.env.VITE_API_URL;
const TRANSACCIONES_ENDPOINT = `${API_URL}/api/transacciones`;

export async function getTransacciones({cuentaId, limit = 15, offset = 0, fecha_desde, fecha_hasta}) {
    try {
        const url = new URL(TRANSACCIONES_ENDPOINT);
        url.searchParams.append('cuenta_id', cuentaId);
        url.searchParams.append('limit', limit);
        url.searchParams.append('offset', offset);

        // Añadir filtros de fecha si existen
        if (fecha_desde) url.searchParams.append('fecha_desde', fecha_desde);
        if (fecha_hasta) url.searchParams.append('fecha_hasta', fecha_hasta);

        const res = await fetchWithAuth(url.toString());

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al obtener las transacciones');
        }

        return await res.json();
    } catch (error) {
        console.error("Error al obtener las transacciones:", error);
        throw error;
    }
}

export async function addTransaccion(nuevaTransaccion) {
    try {
        const res = await fetchWithAuth(TRANSACCIONES_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevaTransaccion),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al crear la transaccion');
        }

        return await res.json();
    } catch (error) {
        console.error("Error en addTransaccion:", error);
        throw error;
    }
}

export async function updateTransaccion(id, datosActualizados) {
    try {
        const res = await fetchWithAuth(`${TRANSACCIONES_ENDPOINT}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosActualizados),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al actualizar la transaccion');
        }

        return await res.json();
    } catch (error) {
        console.error("Error en updateTransaccion:", error);
        throw error;
    }
}

export async function deleteTransaccion(id) {
    try {
        const res = await fetchWithAuth(`${TRANSACCIONES_ENDPOINT}/${id}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al eliminar la transaccion');
        }

        return res.ok; // Devuelve true si la eliminación fue exitosa
    } catch (error) {
        console.error("Error en deleteTransaccion:", error);
        throw error;
    }
}

export async function getAllTransacciones({limit = 15, offset = 0, ...filtros} = {}) {
    try {
        const queryParams = new URLSearchParams();

        // Agregar parámetros de paginación
        queryParams.append('limit', limit);
        queryParams.append('offset', offset);

        // Agregar filtros a la URL
        Object.entries(filtros).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const res = await fetchWithAuth(`${TRANSACCIONES_ENDPOINT}/all?${queryParams}`);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al obtener todas las transacciones');
        }

        return await res.json();
    } catch (error) {
        console.error("Error al obtener todas las transacciones:", error);
        throw error;
    }
}