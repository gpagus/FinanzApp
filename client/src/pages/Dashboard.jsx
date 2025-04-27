import React from "react";
import Sidebar from "../components/ui/Sidebar.jsx";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div className="flex min-h-[calc(100vh-4rem-2.5rem)] bg-neutral-100">
            <Sidebar />

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