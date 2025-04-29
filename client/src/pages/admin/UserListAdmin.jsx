import React from "react";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";
import { useUsers } from "../../hooks/useUsers";
function UserListAdmin() {
    const { data: users, isLoading, error } = useUsers();

    if (isLoading) return <div>Cargando usuarios...</div>;
    if (error) return <div>Error: {error.message}</div>;

    // Transformar los datos para la tabla
    const data = users.map(user => [
        user.nombre,
        user.apellidos,
        user.email,
        
    ]);

    return (
        <div className="flex min-h-[calc(100vh-4rem-2.5rem)]">
            <div className="flex-1 p-6 overflow-y-auto">
                <Grid
                    data={data}
                    columns={["Nombre", "Apellidos", "Correo electrónico"]}
                    search={true}
                    pagination={{
                        enabled: true,
                        limit: 10,
                    }}
                    sort={true}
                    language={{
                        search: {
                            placeholder: "🔍 Buscar...",
                        },
                        pagination: {
                            previous: "Anterior",
                            next: "Siguiente",
                            showing: "Mostrando",
                            results: () => "registros",
                        },
                    }}
                />
            </div>
        </div>
    );
}

export default UserListAdmin;
