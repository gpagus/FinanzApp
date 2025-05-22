import React, {useRef, useEffect} from "react";
import {Grid} from "gridjs-react";
import "gridjs/dist/theme/mermaid.css";
import {useUsers} from "../../hooks/useUsers";
import LoadingScreen from "../../components/ui/LoadingScreen";
import ErrorScreen from "../../components/ui/ErrorScreen";
import {useNavigate} from "react-router-dom";

function UserListAdmin() {
    const {data: users, isLoading, error} = useUsers();
    const gridRef = useRef();
    const navigate = useNavigate();


    useEffect(() => {
        if (gridRef.current) {
            const gridInstance = gridRef.current.getInstance();
            gridInstance.on("rowClick", (event, row) => {
                const email = row.cells[2].data;
                if (email) {
                    const encodedEmail = encodeURIComponent(email);
                    navigate(`/admin-usuarios/${encodedEmail}`);
                }
            });
        }
    }, [users, navigate]);

    if (isLoading) return <LoadingScreen mensaje="Cargando usuarios..."/>;

    if (error)
        return (
            <ErrorScreen
                titulo="Error al cargar usuarios"
                mensaje="No se han podido cargar los usuarios. Por favor, inténtalo de nuevo más tarde."
                botonTexto="Volver al inicio"
                tipoError="error"
                rutaBoton="/admin"
            />
        );

    const data = users.map(user => [
        user.nombre,
        user.apellidos,
        user.email,
        new Date(user.lastAccess).toLocaleString(),
        user.estado ? "Activo" : "Inactivo",
    ]);

    return (
        <div className="flex min-h-[calc(100vh-4rem-2.5rem)]">
            <div className="flex-1 p-6 overflow-x-auto overflow-y-auto">
                <Grid
                    ref={gridRef}
                    data={data}
                    columns={[
                        "Nombre",
                        "Apellidos",
                        "Correo electrónico",
                        "Último acceso",
                        "Estado",
                    ]}
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
