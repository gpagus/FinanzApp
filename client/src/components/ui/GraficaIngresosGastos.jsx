import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllTransacciones } from "../../api/transaccionesApi";
import { Loader, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

const GraficaIngresosGastos = () => {
    const [data, setData] = useState([]);
    const [rangoSeleccionado, setRangoSeleccionado] = useState("30dias");
    const [menuAbierto, setMenuAbierto] = useState(false);

    // Calcular fechas basadas en el rango seleccionado
    const calcularFechas = () => {
        const fecha_hasta = dayjs().format("YYYY-MM-DD");
        let fecha_desde;

        switch (rangoSeleccionado) {
            case "3meses":
                fecha_desde = dayjs().subtract(3, "month").format("YYYY-MM-DD");
                break;
            case "1año":
                fecha_desde = dayjs().subtract(1, "year").format("YYYY-MM-DD");
                break;
            case "30dias":
            default:
                fecha_desde = dayjs().subtract(30, "days").format("YYYY-MM-DD");
                break;
        }

        return { fecha_desde, fecha_hasta };
    };

    const { fecha_desde, fecha_hasta } = calcularFechas();

    // Consulta de transacciones
    const { data: transacciones, isLoading } = useQuery({
        queryKey: ["transacciones", { fecha_desde, fecha_hasta }],
        queryFn: () => getAllTransacciones({ limit: 1000, fecha_desde, fecha_hasta }),
        select: (data) => data.data,
    });

    // Procesar datos para la gráfica
    useEffect(() => {
        if (!transacciones || transacciones.length === 0) {
            setData([]);
            return;
        }

        // Filtrar transacciones rectificativas y rectificadas
        const transaccionesFiltradas = transacciones.filter(transaccion => 
            !transaccion.transaccion_original_id && // Excluir rectificativas
            !transaccion.transaccion_rectificativa_id // Excluir rectificadas
        );

        let agrupados = {};

        // Determinar agrupación según el rango seleccionado
        if (rangoSeleccionado === "30dias") {
            // Agrupar por día
            transaccionesFiltradas.forEach(transaccion => {
                const fecha = dayjs(transaccion.fecha);
                const clave = fecha.format("DD/MM");

                if (!agrupados[clave]) {
                    agrupados[clave] = { fecha: clave, ingresos: 0, gastos: 0 };
                }

                if (transaccion.tipo === "ingreso") {
                    agrupados[clave].ingresos += transaccion.monto;
                } else if (transaccion.tipo === "gasto") {
                    agrupados[clave].gastos += transaccion.monto;
                }
            });

            // Convertir a array y ordenar por fecha
            const resultado = Object.values(agrupados);
            resultado.sort((a, b) => {
                const [diaA, mesA] = a.fecha.split("/").map(Number);
                const [diaB, mesB] = b.fecha.split("/").map(Number);

                if (mesA !== mesB) return mesA - mesB;
                return diaA - diaB;
            });

            setData(resultado);

        } else if (rangoSeleccionado === "3meses") {
            // Agrupar por semana
            transaccionesFiltradas.forEach(transaccion => {
                const fecha = dayjs(transaccion.fecha);
                // Usar el día del mes y número de mes como identificador de semana
                // Agrupamos cada 7 días para formar una semana
                const dia = fecha.date();
                const mes = fecha.month() + 1;
                const semana = Math.ceil(dia / 7);
                const clave = `S${semana}/${mes < 10 ? '0' + mes : mes}`;

                if (!agrupados[clave]) {
                    agrupados[clave] = { fecha: clave, ingresos: 0, gastos: 0 };
                }

                if (transaccion.tipo === "ingreso") {
                    agrupados[clave].ingresos += transaccion.monto;
                } else if (transaccion.tipo === "gasto") {
                    agrupados[clave].gastos += transaccion.monto;
                }
            });

            // Convertir a array y ordenar por mes y semana
            const resultado = Object.values(agrupados);
            resultado.sort((a, b) => {
                const sA = a.fecha.substring(1).split("/");
                const sB = b.fecha.substring(1).split("/");
                const mesA = parseInt(sA[1], 10);
                const mesB = parseInt(sB[1], 10);

                if (mesA !== mesB) return mesA - mesB;

                const semanaA = parseInt(sA[0], 10);
                const semanaB = parseInt(sB[0], 10);
                return semanaA - semanaB;
            });

            setData(resultado);

        } else {
            // Agrupar por mes (para 1 año)
            transaccionesFiltradas.forEach(transaccion => {
                const fecha = dayjs(transaccion.fecha);
                const clave = fecha.format("MM/YYYY");

                if (!agrupados[clave]) {
                    agrupados[clave] = { fecha: clave, ingresos: 0, gastos: 0 };
                }

                if (transaccion.tipo === "ingreso") {
                    agrupados[clave].ingresos += transaccion.monto;
                } else if (transaccion.tipo === "gasto") {
                    agrupados[clave].gastos += transaccion.monto;
                }
            });

            // Convertir a array y ordenar por año y mes
            const resultado = Object.values(agrupados);
            resultado.sort((a, b) => {
                const [mesA, yearA] = a.fecha.split("/").map(Number);
                const [mesB, yearB] = b.fecha.split("/").map(Number);

                if (yearA !== yearB) return yearA - yearB;
                return mesA - mesB;
            });

            setData(resultado);
        }
    }, [transacciones, rangoSeleccionado]);

    // Nombres legibles de los rangos
    const nombresRangos = {
        "30dias": "Últimos 30 días",
        "3meses": "Últimos 3 meses",
        "1año": "Último año"
    };

    // Manejar cambio de rango
    const cambiarRango = (rango) => {
        setRangoSeleccionado(rango);
        setMenuAbierto(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader className="animate-spin text-aguazul" size={24} />
                <span className="ml-2 text-neutral-500">Cargando...</span>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            {/* Selector de rango */}
            <div className="relative mb-4 flex justify-end">
                <div className="relative">
                    <button
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className="px-4 py-2 border border-neutral-200 rounded-md bg-white flex items-center justify-between min-w-40"
                    >
                        <span>{nombresRangos[rangoSeleccionado]}</span>
                        <ChevronDown size={16} className="ml-2" />
                    </button>

                    {menuAbierto && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-md z-10 w-full">
                            {Object.keys(nombresRangos).map((rango) => (
                                <button
                                    key={rango}
                                    onClick={() => cambiarRango(rango)}
                                    className={`block w-full text-left px-4 py-2 hover:bg-neutral-100 ${
                                        rangoSeleccionado === rango ? "bg-neutral-100 font-medium" : ""
                                    }`}
                                >
                                    {nombresRangos[rango]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Contenido condicional según si hay datos o no */}
            {data.length === 0 ? (
                <div className="flex items-center justify-center h-48">
                    <p className="text-neutral-500">
                        No se encontraron transacciones para el período seleccionado.
                    </p>
                </div>
            ) : (
                /* Gráfica */
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis />
                        <Tooltip
                            formatter={(value) => new Intl.NumberFormat('es-ES', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(value)}
                        />
                        <Bar dataKey="ingresos" name="Ingresos" fill="#4caf50" />
                        <Bar dataKey="gastos" name="Gastos" fill="#f44336" />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default GraficaIngresosGastos;