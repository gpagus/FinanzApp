export const fetchWithAuth = async (url, options = {}) => {
    let accessToken = localStorage.getItem('access_token');
    let refreshToken = localStorage.getItem('refresh_token');

    let response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.status === 401) {
        // Renovar sesión
        const refreshRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh-token`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({refresh_token: refreshToken}),
        });

        if (!refreshRes.ok) {
            // Si tienes un logout global, podrías llamarlo aquí
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            throw new Error("Sesión expirada");
        }

        const data = await refreshRes.json();
        accessToken = data.access_token;
        refreshToken = data.refresh_token;

        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Reintenta la petición original con nuevos tokens
        response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
                Authorization: `Bearer ${accessToken}`,
            },
        });
    }

    return response;
};