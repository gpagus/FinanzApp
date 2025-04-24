import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-white py-5 sm:py-7 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-6 md:mb-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-dollar-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-display font-bold text-xl">FinanzApp</span>
          </div>
          <p className="text-neutral-300 text-sm text-center md:text-right">
            © {new Date().getFullYear()} FinanzApp. Todos los derechos reservados.<br />
            Simplifica tus finanzas, maximiza tu tranquilidad.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;