import React from "react";
import {useAuth} from "../context/AuthContext";
import { Activity, Users, FileText, PieChart, TrendingUp, DollarSign, Calendar, Bell } from "lucide-react";

const Dashboard = () => {
    const {user} = useAuth();
    const isAdmin = user?.rol === "admin";

    if (isAdmin) {

        const quickStats = [
            { title: "Usuarios Activos", value: "2,345", icon: <Users size={24} className="text-aguazul" />, change: "+12%", color: "bg-info-100" },
            { title: "Ingresos", value: "$15,478", icon: <DollarSign size={24} className="text-dollar-500" />, change: "+8%", color: "bg-dollar-300" },
            { title: "Transacciones", value: "8,527", icon: <Activity size={24} className="text-warning" />, change: "+5%", color: "bg-warning-100" },
            { title: "Informes", value: "32", icon: <FileText size={24} className="text-success" />, change: "+3", color: "bg-success-100" }
        ];


        return (
            <div className="flex min-h-[calc(100vh-4rem-2.5rem)]">
                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto bg-neutral-100">
                    {/* Bienvenida Destacada */}
                    <div className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            <div className="p-8 md:w-3/5">
                                <h1 className="text-3xl font-bold text-aguazul mb-2">
                                    Bienvenido, {user?.nombre || "Administrador"}
                                </h1>
                                <p className="text-neutral-600 mb-6">Panel de administración de FinanzApp</p>

                                <div className="mb-6">
                                    <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
                                        <p className="text-sm text-neutral-600">Sistema funcionando correctamente</p>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 rounded-full bg-dollar-500 mr-2"></div>
                                        <p className="text-sm text-neutral-600">Datos actualizados hoy a las 12:23</p>
                                    </div>
                                </div>

                                <div className="flex space-x-4">
                                    <button className="px-5 py-2 bg-aguazul-100 text-white rounded-md flex items-center">
                                        <Activity size={18} className="mr-2" />
                                        Ver actividad
                                    </button>
                                    <button className="px-5 py-2 bg-neutral-200 text-neutral-900 rounded-md flex items-center">
                                        <FileText size={18} className="mr-2" />
                                        Generar reporte
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-aguazul to-aguazul-100 p-8 text-white md:w-2/5 flex flex-col justify-center">
                                <div className="mb-4">
                                    <div className="flex items-center mb-2">
                                        <Calendar size={20} className="mr-2" />
                                        <p className="text-sm opacity-90">29/04/2025</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Bell size={20} className="mr-2" />
                                        <p className="text-sm opacity-90">3 notificaciones pendientes</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-white bg-opacity-10 rounded-lg">
                                    <p className="text-sm font-medium mb-2">Resumen</p>
                                    <div className="flex items-center">
                                        <TrendingUp size={36} />
                                        <div className="ml-3">
                                            <p className="text-2xl font-bold">85%</p>
                                            <p className="text-xs opacity-80">Objetivos mensuales</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Estadísticas Rápidas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {quickStats.map((stat, index) => (
                            <div key={index} className={`p-6 rounded-lg shadow-sm bg-white border-l-4 border-${stat.color.split('-')[1]}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                                        <h3 className="text-2xl font-bold text-neutral-900">{stat.value}</h3>
                                    </div>
                                    <div className={`p-3 rounded-full ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <p className="text-xs font-medium text-success mt-2">{stat.change} este mes</p>
                            </div>
                        ))}
                    </div>

                    {/* Accesos Rápidos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <Users size={24} className="text-aguazul mr-3" />
                                <h3 className="text-lg font-semibold text-neutral-900">Gestión de Usuarios</h3>
                            </div>
                            <p className="text-sm text-neutral-600 mb-4">Administra usuarios, roles y permisos en un solo lugar.</p>
                            <a href="#" className="text-sm font-medium text-aguazul hover:underline">Ir a usuarios →</a>
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <PieChart size={24} className="text-aguazul mr-3" />
                                <h3 className="text-lg font-semibold text-neutral-900">Estadísticas</h3>
                            </div>
                            <p className="text-sm text-neutral-600 mb-4">Visualiza datos importantes y métricas de rendimiento.</p>
                            <a href="#" className="text-sm font-medium text-aguazul hover:underline">Ver estadísticas →</a>
                        </div>

                        <div className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center mb-4">
                                <FileText size={24} className="text-aguazul mr-3" />
                                <h3 className="text-lg font-semibold text-neutral-900">Reportes</h3>
                            </div>
                            <p className="text-sm text-neutral-600 mb-4">Genera y descarga informes personalizados.</p>
                            <a href="#" className="text-sm font-medium text-aguazul hover:underline">Crear reporte →</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem-2.5rem)]">
            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                    Bienvenido, {user?.nombre || "Usuario"}
                </h1>
            </div>
        </div>
    );
};

export default Dashboard;