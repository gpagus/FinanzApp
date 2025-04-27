import React, { useState, useEffect } from 'react';
import Boton from './Boton.jsx';
import { Home, Wallet, TrendingUp, PiggyBank, BarChart2 } from 'lucide-react';

const Sidebar = () => {
    const [activeItem, setActiveItem] = useState('Inicio');
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

    const menuItems = [
        { name: 'Inicio', icon: Home, path: '/' },
        { name: 'Cuentas', icon: Wallet, path: '/cuentas' },
        { name: 'Movimientos', icon: TrendingUp, path: '/movimientos' },
        { name: 'Huchas', icon: PiggyBank, path: '/huchas' },
        { name: 'Estadísticas', icon: BarChart2, path: '/estadisticas' },
    ];

    const handleItemClick = (itemName) => {
        setActiveItem(itemName);
    };

    // Barra de navegación móvil
    if (isMobile) {
        return (
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around py-2 px-1 shadow-lg z-10">
                {menuItems.map((item) => (
                    <Boton
                        key={item.name}
                        to={item.path}
                        tipo="texto"
                        className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition-colors duration-200 ${
                            activeItem === item.name
                                ? 'text-aguazul font-medium'
                                : 'text-neutral-600'
                        }`}
                        onClick={() => handleItemClick(item.name)}
                    >
                        <item.icon size={20} />
                        <span className="text-xs mt-1">{item.name}</span>
                    </Boton>
                ))}
            </nav>
        );
    }

    // Barra de navegación de escritorio
    return (
        <nav className="h-full p-4 flex flex-col w-56">
            <div className="flex items-center justify-center mb-8">
                <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center">
                    <Home className="text-neutral-600" size={24} />
                </div>
            </div>

            <div className="flex flex-col space-y-4 flex-1">
                {menuItems.map((item) => (
                    <Boton
                        key={item.name}
                        to={item.path}
                        tipo="texto"
                        className={`flex items-center text-left py-3 px-4 rounded-lg transition-colors duration-200 ${
                            activeItem === item.name
                                ? 'bg-dollar-300 text-aguazul font-medium'
                                : 'text-neutral-600 hover:bg-neutral-200'
                        }`}
                        onClick={() => handleItemClick(item.name)}
                    >
                        <div className="flex items-center">
                            <item.icon size={20} className="mr-3" />
                            <span className="font-medium">{item.name}</span>
                        </div>
                    </Boton>
                ))}
            </div>
        </nav>
    );
};

export default Sidebar;