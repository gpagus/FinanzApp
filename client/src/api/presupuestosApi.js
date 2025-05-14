// client/src/api/presupuestosApi.js
import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = import.meta.env.VITE_API_URL;
const PRESUPUESTOS_ENDPOINT = `${API_URL}/api/presupuestos`;

export async function getPresupuestos() {
    try {
        const res = await fetchWithAuth(PRESUPUESTOS_ENDPOINT);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al obtener los presupuestos');
        }

        return await res.json();
    } catch (error) {
        console.error("Error al obtener los presupuestos:", error);
        throw error;
    }
}

export async function addPresupuesto(nuevoPresupuesto) {
    try {
        const res = await fetchWithAuth(PRESUPUESTOS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevoPresupuesto),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al crear el presupuesto');
        }

        return await res.json();
    } catch (error) {
        console.error("Error en crearPresupuesto:", error);
        throw error;
    }
}

export async function updatePresupuesto(id, datosActualizados) {
    try {
        const res = await fetchWithAuth(`${PRESUPUESTOS_ENDPOINT}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosActualizados),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al actualizar el presupuesto');
        }

        return await res.json();
    } catch (error) {
        console.error("Error en actualizarPresupuesto:", error);
        throw error;
    }
}

export async function deletePresupuesto(id) {
    try {
        const res = await fetchWithAuth(`${PRESUPUESTOS_ENDPOINT}/${id}`, {
            method: 'DELETE',
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al eliminar el presupuesto');
        }

        return res.ok; // Devuelve true si la eliminación fue exitosa
    } catch (error) {
        console.error("Error en eliminarPresupuesto:", error);
        throw error;
    }
}