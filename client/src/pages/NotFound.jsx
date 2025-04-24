import React from "react";
import Footer from "../components/Footer";
import Boton from "../components/ui/Boton";

const NotFound = () => {
  return (
    <div className="bg-gray-100 flex flex-col min-h-[calc(100vh-4rem)]">
      <main className="flex-grow flex flex-col items-center justify-center max-w-7xl mx-auto w-full p-4 sm:p-6">
        <div className="text-center">
          {/* Ilustración de error */}
          <div className="relative w-full max-w-md mx-auto mb-8">
            <div className="absolute -top-4 -left-4 w-full h-full bg-[#00C853] opacity-10 rounded-xl transform rotate-3"></div>
            <div className="relative bg-white p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-24 w-24 text-[#00C853] mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M12 14a2 2 0 100-4 2 2 0 000 4M12 2a10 10 0 100 20 10 10 0 000-20z"
                />
              </svg>
              <h1 className="font-display font-bold text-6xl text-neutral-900 mb-2">
                404
              </h1>
              <div className="h-1 w-16 bg-[#00C853] rounded-full my-4"></div>
              <p className="font-display text-xl text-neutral-600 mb-2">
                Página no encontrada
              </p>
              <p className="text-neutral-600 mb-6">
                Lo sentimos, la página que estás buscando no existe o ha sido
                movida.
              </p>
            </div>
          </div>

          {/* Botón para volver al inicio */}
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Boton to="/" tipo="primario">
              Volver al inicio
            </Boton>
          </div>
        </div>
      </main>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotFound;
