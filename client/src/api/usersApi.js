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
        console.error("Error al obtener los usuarios:", error);
        throw error;
    }
}

export const getUserByEmail = async (userEmail) => {
    try {
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/admin/usuarios/${userEmail}`);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al obtener el usuario');
        }

        return await res.json();
    } catch (error) {
        console.error("Error al obtener usuario:", error);
        throw error;
    }
}

export const getUserAccountsByEmail = async (userEmail) => {
    if (!userEmail) throw new Error('Email no proporcionado');

    try {
        const encodedEmail = encodeURIComponent(userEmail);
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/admin/usuarios/${encodedEmail}/cuentas`);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al obtener las cuentas del usuario');
        }

        return await res.json();
    } catch (error) {
        console.error("Error al obtener las cuentas del usuario:", error);
        throw error;
    }
};

export const getUserBudgetsByEmail = async (userEmail) => {
    if (!userEmail) throw new Error('Email no proporcionado');

    try {
        const encodedEmail = encodeURIComponent(userEmail);
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/admin/usuarios/${encodedEmail}/presupuestos`);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al obtener los presupuestos del usuario');
        }

        return await res.json();
    } catch (error) {
        console.error("Error al obtener los presupuestos del usuario:", error);
        throw error;
    }
};

export const updateUserStatus = async (userId, isActive) => {
    try {
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/admin/usuarios/status/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({estado: isActive}),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al actualizar el estado del usuario');
        }

        return await res.json();
    } catch (error) {
        console.error("Error al actualizar el estado del usuario:", error);
        throw error;
    }
};

export async function getUserLogsByEmail(email) {
    try {
        const res = await fetchWithAuth(`${import.meta.env.VITE_API_URL}/api/admin/usuarios/${email}/logs`);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || 'Error al obtener logs del usuario');
        }

        return await res.json();
    } catch (error) {
        console.error('Error en getUserLogsByEmail:', error);
        throw error;
    }
}
