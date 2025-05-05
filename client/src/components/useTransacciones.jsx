import { useState, useEffect } from 'react';

// Constantes
const ITEMS_INICIALES = 10;
const ITEMS_INCREMENTO = 5;

/**
 * Hook para gestionar las transacciones con paginación y filtrado
 * @param {Object} options Opciones de configuración
 * @param {string} [options.cuentaId] ID de la cuenta (opcional, si solo se quieren transacciones de una cuenta)
 * @param {Array} [options.cuentas] Lista de todas las cuentas (para añadir info de cuenta a cada transacción)
 * @returns {Object} Estado y funciones para gestionar transacciones
 */
export const useTransacciones = ({ cuentaId, cuentas = [] }) => {
    const [transacciones, setTransacciones] = useState([]);
    const [transaccionesFiltradas, setTransaccionesFiltradas] = useState([]);
    const [transaccionesMostradas, setTransaccionesMostradas] = useState(ITEMS_INICIALES);
    const [filtroFecha, setFiltroFecha] = useState('ultimos30');
    const [cargandoTransacciones, setCargandoTransacciones] = useState(true);
    const [cargandoMas, setCargandoMas] = useState(false);

    // Generar transacciones simuladas
    useEffect(() => {
        setCargandoTransacciones(true);

        // Simulamos un retardo para mostrar el estado de carga
        setTimeout(() => {
            // Generamos transacciones aleatorias para demostración
            const fechaActual = new Date();
            let transaccionesGeneradas = Array.from({ length: 50 }, (_, i) => {
                const fecha = new Date(fechaActual);
                fecha.setDate(fechaActual.getDate() - Math.floor(Math.random() * 60)); // Últimos 60 días aleatoriamente

                const esIngreso = Math.random() > 0.6;
                const monto = (Math.random() * 500 + 10).toFixed(2);

                // Crear iconos aleatorios para las transacciones
                const iconos = ['🍎', '🥗', '🍺', '🚗', '🏠', '💻', '🛒', '💳', '💰', '📱'];
                const icono = iconos[Math.floor(Math.random() * iconos.length)];

                // Asignar una cuenta aleatoria o la cuenta específica
                let cuentaAsignada;
                if (cuentaId) {
                    cuentaAsignada = { id: cuentaId };
                } else if (cuentas.length > 0) {
                    cuentaAsignada = cuentas[Math.floor(Math.random() * cuentas.length)];
                }

                return {
                    id: `tr-${i}`,
                    fecha: fecha.toISOString(),
                    concepto: esIngreso
                        ? ['Nómina', 'Ingreso', 'Transferencia recibida', 'Devolución', 'Abono'][Math.floor(Math.random() * 5)]
                        : ['Compra', 'Recibo', 'Transferencia', 'Suscripción', 'Domiciliación'][Math.floor(Math.random() * 5)],
                    cantidad: esIngreso ? parseFloat(monto) : -parseFloat(monto),
                    categoriaId: Math.floor(Math.random() * 10) + 1,
                    icono: icono,
                    cuenta: cuentaAsignada
                };
            });

            // Si hay cuentaId, filtrar por esa cuenta
            if (cuentaId) {
                transaccionesGeneradas = transaccionesGeneradas.filter(t =>
                    t.cuenta && t.cuenta.id === cuentaId
                );
            }

            // Añadir información de cuenta completa si tenemos el array de cuentas
            if (cuentas.length > 0) {
                transaccionesGeneradas = transaccionesGeneradas.map(t => {
                    if (t.cuenta) {
                        const cuentaCompleta = cuentas.find(c => c.id === t.cuenta.id);
                        return {
                            ...t,
                            cuenta: cuentaCompleta || t.cuenta
                        };
                    }
                    return t;
                });
            }

            // Ordenar por fecha (más reciente primero)
            transaccionesGeneradas.sort((a, b) =>
                new Date(b.fecha) - new Date(a.fecha)
            );

            setTransacciones(transaccionesGeneradas);
            setCargandoTransacciones(false);
        }, 800);
    }, [cuentaId, cuentas]);

    // Aplicar filtros cuando cambian las transacciones o los filtros
    useEffect(() => {
        // Aplicar filtro de fecha
        let filtradas = [...transacciones];

        const fechaActual = new Date();
        let fechaLimite;

        switch(filtroFecha) {
            case 'ultimos30':
                fechaLimite = new Date(fechaActual);
                fechaLimite.setDate(fechaActual.getDate() - 30);
                filtradas = filtradas.filter(t => new Date(t.fecha) >= fechaLimite);
                break;
            case 'ultimos90':
                fechaLimite = new Date(fechaActual);
                fechaLimite.setDate(fechaActual.getDate() - 90);
                filtradas = filtradas.filter(t => new Date(t.fecha) >= fechaLimite);
                break;
            case 'año':
                fechaLimite = new Date(fechaActual.getFullYear(), 0, 1);
                filtradas = filtradas.filter(t => new Date(t.fecha) >= fechaLimite);
                break;
            case 'personalizado':
                // Aquí se implementaría la lógica para un rango personalizado
                break;
            default:
                break;
        }

        setTransaccionesFiltradas(filtradas);
        // Resetear el número de transacciones mostradas cuando cambian los filtros
        setTransaccionesMostradas(ITEMS_INICIALES);
    }, [transacciones, filtroFecha]);

    // Función para cargar más transacciones
    const cargarMasTransacciones = () => {
        setCargandoMas(true);
        // Simular una carga con delay
        setTimeout(() => {
            setTransaccionesMostradas(prev =>
                Math.min(prev + ITEMS_INCREMENTO, transaccionesFiltradas.length)
            );
            setCargandoMas(false);
        }, 500);
    };

    // Transacciones actualmente visibles
    const transaccionesMostrandose = transaccionesFiltradas.slice(0, transaccionesMostradas);
    const hayMasTransacciones = transaccionesMostradas < transaccionesFiltradas.length;

    return {
        transacciones: transaccionesMostrandose,
        hayMasTransacciones,
        cargandoTransacciones,
        cargandoMas,
        filtroFecha,
        setFiltroFecha,
        cargarMasTransacciones
    };
};

export default useTransacciones;