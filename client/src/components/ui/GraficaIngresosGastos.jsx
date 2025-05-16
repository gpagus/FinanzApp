import React, {useEffect, useState} from "react";
            import {useQuery} from "@tanstack/react-query";
            import {getAllTransacciones} from "../../api/transaccionesApi";
            import {Loader} from "lucide-react";
            import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from "recharts";
            import dayjs from "dayjs";

            const GraficaIngresosGastos = () => {
                const [data, setData] = useState([]);

                // Fechas del último mes
                const fecha_hasta = dayjs().format("YYYY-MM-DD");
                const fecha_desde = dayjs().subtract(30, "days").format("YYYY-MM-DD");

                // Consulta de transacciones
                const { data: transacciones, isLoading } = useQuery({
                    queryKey: ["transacciones", { fecha_desde, fecha_hasta }],
                    queryFn: () => getAllTransacciones({ limit: 1000, fecha_desde, fecha_hasta }),
                    select: (data) => data.data,
                });

                // Procesar datos para la gráfica
                useEffect(() => {
                    if (transacciones && transacciones.length > 0) {
                        const agrupados = transacciones.reduce((acc, transaccion) => {
                            const fecha = dayjs(transaccion.fecha).format("DD/MM");
                            if (!acc[fecha]) {
                                acc[fecha] = {fecha, ingresos: 0, gastos: 0};
                            }
                            if (transaccion.tipo === "ingreso") {
                                acc[fecha].ingresos += transaccion.monto;
                            } else if (transaccion.tipo === "gasto") {
                                acc[fecha].gastos += transaccion.monto;
                            }
                            return acc;
                        }, {});

                        setData(Object.values(agrupados));
                    }
                }, [transacciones]);

                if (isLoading) {
                    return (
                        <div className="flex items-center justify-center h-full">
                            <Loader className="animate-spin text-aguazul" size={24}/>
                            <span className="ml-2 text-neutral-500">Cargando...</span>
                        </div>
                    );
                }

                if (!transacciones || transacciones.length === 0) {
                    return (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-neutral-500">No se encontraron transacciones para el período seleccionado.</p>
                        </div>
                    );
                }

                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="fecha" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="ingresos" fill="#4caf50" />
                            <Bar dataKey="gastos" fill="#f44336" />
                        </BarChart>
                    </ResponsiveContainer>
                );
            };

            export default GraficaIngresosGastos;