import React from 'react';

const Footer = ({isOnPublic}) => (
    <footer className={`${isOnPublic ? 'block' : 'hidden'} sm:block fixed bottom-0 left-0 w-full bg-white border-t border-neutral-200 py-4 sm:py-2.5 px-4 text-sm z-20`}>
        <div className="container mx-auto">
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:items-center">
                <div className="text-neutral-700 text-center sm:text-left">
                    FinanzApp © {new Date().getFullYear()} Todos los derechos reservados
                </div>

                <div className="flex justify-center sm:justify-end space-x-4 text-aguazul">
                    <a href="#" className="hover:text-green-500">Privacidad</a>
                    <a href="#" className="hover:text-green-500">Legal</a>
                    <a href="#" className="hover:text-green-500">Contacto</a>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;