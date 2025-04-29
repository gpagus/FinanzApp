export async function getUsers() {
    const storedToken = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/usuarios`, {
        headers: {
            Authorization: `Bearer ${storedToken}`,
        },
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al obtener usuarios');
    }
    debugger;
    return await res.json();
}
