import React, { useRef, useEffect } from "react";
import { Grid } from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";
import { useUsers } from "../../hooks/useUsers";

function UserListAdmin() {
    const { data: users, isLoading, error } = useUsers();
    const gridRef = useRef();

    useEffect(() => {
        if (gridRef.current) {
            const gridInstance = gridRef.current.getInstance();
            gridInstance.on("rowClick", (event, row) => {
                // Accede a los datos de la fila clicada
                const rowData = row.cells.map(cell => cell.data);
                console.log("Fila clicada:", rowData);
                // Aquí puedes realizar acciones como navegar a otra página o abrir un modal
            });
        }
    }, []);

    if (isLoading) return <div>Cargando usuarios...</div>;
    if (error) return <div>Error: {error.message}</div>;

    // Transformar los datos para la tabla
    const data = users.map(user => [
        user.nombre,
        user.apellidos,
        user.email,
        new Date(user.lastAccess).toLocaleString(), // Formatear timestamp
        user.estado ? "Activo" : "Inactivo" // Formatear boolean
    ]);

    return (
        <div className="flex min-h-[calc(100vh-4rem-2.5rem)]">
            <div className="flex-1 p-6 overflow-x-auto overflow-y-auto">
                <Grid
                    ref={gridRef}
                    data={data}
                    columns={["Nombre", "Apellidos", "Correo electrónico", "Último acceso", "Estado"]}
                    search={true}
                    pagination={{
                        limit: 10,
                    }}
                    sort={true}
                    language={{
                        search: {
                            placeholder: "🔍 Buscar...",
                        },
                        pagination: {
                            previous: "⬅️",
                            next: "➡️",
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
