import React from 'react';

const Footer = () => (
    <footer className="hidden sm:block sm:fixed sm:bottom-0 sm:left-0 sm:w-full sm:bg-white sm:border-t sm:border-neutral-200 sm:py-2.5 sm:px-4 sm:text-sm sm:z-20">
        <div className="container mx-auto">
            <div className="grid grid-cols-2 items-center">
                <div className="text-neutral-700">
                    FinanzApp © {new Date().getFullYear()} Todos los derechos reservados
                </div>

                <div className="flex space-x-4 justify-end text-aguazul">
                    <a href="#" className="hover:text-green-500">Privacidad</a>
                    <a href="#" className="hover:text-green-500">Legal</a>
                    <a href="#" className="hover:text-green-500">Contacto</a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
