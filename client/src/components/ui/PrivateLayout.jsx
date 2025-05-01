import Header from "./Header";
import Footer from "../Footer";
import Sidebar from "./Sidebar";
import {Outlet} from "react-router-dom";
import {useState, useEffect} from "react";

export default function PrivateLayout() {
    const [isMobile, setIsMobile] = useState(false);

    // Comprobar el tamaño de la pantalla
    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        // Comprobación inicial
        checkScreenSize();

        // Agregar el listener para el cambio de tamaño de la pantalla
        window.addEventListener('resize', checkScreenSize);

        // Limpiar el listener al desmontar el componente
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <>
            <Header/>
            <div className="pt-16 flex bg-neutral-100">
                <Sidebar/>
                <main className={`flex-1 pb-10 overflow-x-auto ${isMobile ? 'pb-14' : 'ml-56'}`}>
                    <Outlet/>
                </main>
            </div>

            <Footer isOnPublic={false}/>
        </>
    );
}