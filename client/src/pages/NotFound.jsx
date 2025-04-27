import React from "react";
import Boton from "../components/ui/Boton";
import {Frown} from "lucide-react";

const NotFound = () => {
    return (
        <div className="flex flex-col items-center text-center justify-center min-h-[calc(100vh-4rem-2.5rem)]">
            <div className="relative w-full max-w-md mx-auto mb-8">
                <div
                    className="absolute -top-4 -left-4 w-full h-full bg-dollar-500 opacity-10 rounded-xl transform rotate-3"></div>
                <div className="relative bg-white p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center">
                    <Frown className="w-16 h-16 text-dollar-500 mb-4"/>
                    <h1 className="font-bold text-6xl text-neutral-900 mb-2">
                        404
                    </h1>
                    <div className="h-1 w-16 bg-dollar-500 rounded-full my-4"></div>
                    <p className="text-xl text-neutral-600 mb-2">
                        Página no encontrada
                    </p>
                    <p className="text-neutral-600 mb-6">
                        Lo sentimos, la página que estás buscando no existe o ha sido
                        movida.
                    </p>
                </div>
            </div>

            <Boton to="/" tipo="primario">
                Volver al inicio
            </Boton>
        </div>
    );
};

export default NotFound;
