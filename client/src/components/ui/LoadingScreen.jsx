import { Loader } from 'lucide-react';

const LoadingScreen = ({ mensaje = "Cargando...", size = 48, height = "100%" }) => {
    return (
        <div className={`flex min-h-[${height === "100%" ? "calc(100vh-4rem-2.5rem)" : height}] justify-center items-center`}>
            <div className="flex flex-col items-center">
                <Loader size={size} className="text-aguazul animate-spin mb-4" />
                <p className="text-neutral-600">{mensaje}</p>
            </div>
        </div>
    );
};

export default LoadingScreen;