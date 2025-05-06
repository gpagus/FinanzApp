import React, { useState, useRef, useEffect } from 'react';

function DropdownMenu({ triggerIcon, actions = [] }) {
    const [abierto, setAbierto] = useState(false);
    const menuRef = useRef(null);

    // Cierra el menú si se hace clic fuera de él
    useEffect(() => {
        function manejarClickFuera(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setAbierto(false);
            }
        }
        document.addEventListener('mousedown', manejarClickFuera);
        return () => {
            document.removeEventListener('mousedown', manejarClickFuera);
        };
    }, []);

    return (
        <div className="relative inline-block text-left" ref={menuRef}>
            <button
                onClick={() => setAbierto(!abierto)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Opciones"
            >
                {triggerIcon}
            </button>

            {abierto && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    {actions.map(({ label, onClick, className = '' }, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                onClick();
                                setAbierto(false);
                            }}
                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${className}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default DropdownMenu;
