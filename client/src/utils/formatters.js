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

export const obtenerFechaHoraActual = () => {
    const fechaActual = new Date();
    const anio = fechaActual.getFullYear();
    const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaActual.getDate()).padStart(2, '0');
    const hora = String(fechaActual.getHours()).padStart(2, '0');
    const minutos = String(fechaActual.getMinutes()).padStart(2, '0');

    return `${anio}-${mes}-${dia}T${hora}:${minutos}`;
};