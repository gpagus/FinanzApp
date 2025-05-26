import { fetchWithAuth } from "./fetchWithAuth";

const API_URL = import.meta.env.VITE_API_URL;
const CUENTAS_ENDPOINT = `${API_URL}/api/cuentas`;

export async function getCuentas() {
    try {
        const res = await fetchWithAuth(CUENTAS_ENDPOINT);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al obtener las cuentas');
        }

        return await res.json();
    } catch (error) {
        console.error("Error al obtener las cuentas:", error);
        throw error;
    }
}

export async function addCuenta(nuevaCuenta) {
    try {
        const res = await fetchWithAuth(CUENTAS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(nuevaCuenta),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al crear la cuenta');
        }

        return await res.json();
    } catch (error) {
        console.error("Error en crearCuenta:", error);
        throw error;
    }
}

export async function updateCuenta(id, datosActualizados) {
    try {
        const res = await fetchWithAuth(`${CUENTAS_ENDPOINT}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosActualizados),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al actualizar la cuenta');
        }

        return await res.json();
    } catch (error) {
        console.error("Error en actualizarCuenta:", error);
        throw error;
    }
}

export async function deleteCuenta({id, nombre}) {
    try {
        const res = await fetchWithAuth(`${CUENTAS_ENDPOINT}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            // Enviamos el nombre en el cuerpo para que el backend pueda usarlo en el log
            body: JSON.stringify({nombre})
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al eliminar la cuenta');
        }

        return res.ok; // Devuelve true si la eliminación fue exitosa
    } catch (error) {
        console.error("Error en eliminarCuenta:", error);
        throw error;
    }
}

export async function exportarTransaccionesCuenta(cuentaId, filtros = {}) {
    try {
        const params = new URLSearchParams();
        
        if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
        if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
        if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id);
        if (filtros.tipo) params.append('tipo', filtros.tipo);
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);

        const url = `${CUENTAS_ENDPOINT}/${cuentaId}/export?${params}`;
        const res = await fetchWithAuth(url);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al exportar transacciones');
        }

        return await res.json();
    } catch (error) {
        console.error("Error al exportar transacciones:", error);
        throw error;
    }
}