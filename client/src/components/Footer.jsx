import React from 'react';

const Footer = ({ isOnPublic }) => (
  <footer className={`${isOnPublic ? 'block' : 'hidden'} sm:block fixed bottom-0 left-0 w-full bg-white border-t border-neutral-200 py-4 sm:py-2.5 px-4 text-sm z-20`}>
    <div className="container mx-auto">
      <div className="flex flex-col space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 sm:items-center">
        <div className="text-neutral-700 text-center sm:text-left">
          Hecho con ❤️ por Gpagus - {new Date().getFullYear()}
          <span className="hidden sm:inline text-neutral-500 ml-2 text-xs">
            | TFG Desarrollo de Aplicaciones Web
          </span>
        </div>

        <div className="flex justify-center sm:justify-end space-x-4 text-aguazul">
          <a href="https://github.com/gpagus" className="hover:text-green-500">GitHub</a>
          <a href="https://gpagus-portfolio.vercel.app/" className="hover:text-green-500">Portfolio</a>
          <a href="mailto:agp0004@gmail.com" className="hover:text-green-500">Email</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;