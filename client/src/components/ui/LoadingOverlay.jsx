import React from "react";

const LoadingOverlay = () => {
  return (
    <div className="fixed inset-0 z-[999] bg-black/40 flex flex-col items-center justify-center">
      <div className="relative">
        {/* Spinner exterior */}
        <div className="w-16 h-16 border-4 border-dollar-500 border-t-transparent rounded-full animate-spin"></div>

        {/* Spinner interior */}
        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
             style={{animationDuration: '0.6s'}}></div>
      </div>

      {/* Texto de carga */}
      <p className="mt-4 text-white font-medium">Cargando...</p>
    </div>
  );
};

export default LoadingOverlay;