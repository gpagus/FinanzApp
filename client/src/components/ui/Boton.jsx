import { Link } from 'react-router-dom';
import clsx from 'clsx';

const Boton = ({
  children,
  tipo = 'primario',    // "primario" | "secundario" | "texto" | "icono"
  to,                   // Para navegación interna (Link)
  href,                 // Para navegación externa
  onClick,
  fullWidth = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const baseStyle = 'rounded-lg font-display font-medium transition-all duration-300 focus:outline-none focus:ring-ocean-500';

  const tipoStyle = {
    primario: 'px-6 py-2 bg-dollar-500 text-aguazul text-center hover:bg-dollar-700 disabled:bg-dollar-300 disabled:text-neutral-600 focus:ring-2',
    secundario: 'px-6 py-2 border-2 border-aguazul text-aguazul text-center hover:bg-aguazul hover:text-white disabled:border-neutral-300 disabled:text-neutral-300 focus:ring-1',
    texto: 'px-2 py-1 text-aguazul hover:underline disabled:text-neutral-300 focus:ring-1',
    icono: 'p-1 rounded-full hover:bg-neutral-100 disabled:bg-neutral-300 focus:ring-1'
  };


  const clases = clsx(
    baseStyle,
    tipoStyle[tipo],
    {
      'w-full text-center': fullWidth,
      'cursor-pointer': !disabled && !to && !href
    },
    className
  );

  if (to) {
    return (
      <Link to={to} className={clases} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={clases} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={clases}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Boton;