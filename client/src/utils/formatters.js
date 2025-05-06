export const formatearMoneda = (cantidad) =>
    new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(cantidad);

export const formatearFecha = (fechaISO) =>
    new Date(fechaISO).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
