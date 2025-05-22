import React from 'react';
import { useNavigate } from 'react-router-dom';
import Boton from './Boton';

const ErrorScreen = ({
                         titulo = "Error al cargar datos",
                         mensaje = "Ha ocurrido un error inesperado",
                         botonTexto = "Volver al inicio",
                         rutaBoton = "/",
                         tipoError = "general" // general, notFound u otro para diferentes estilos
                     }) => {
    const navigate = useNavigate();

    let bgColor = "bg-neutral-100";
    let textColor = "text-aguazul";

    if (tipoError === "error") {
        bgColor = "bg-error-100";
        textColor = "text-error";
    } else if (tipoError === "notFound") {
        bgColor = "bg-neutral-100";
        textColor = "text-aguazul";
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem-2.5rem)] justify-center items-center">
            <div className={`text-center p-6 ${bgColor} rounded-lg max-w-md`}>
                <h2 className={`text-xl font-bold ${textColor} mb-2`}>{titulo}</h2>
                <p className="text-neutral-700 mb-4">{mensaje}</p>
                <Boton tipo="primario" onClick={() => navigate(rutaBoton)}>
                    {botonTexto}
                </Boton>
            </div>
        </div>
    );
};

export default ErrorScreen;