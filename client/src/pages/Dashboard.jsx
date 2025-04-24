import React from "react";
import Sidebar from "../components/ui/Sidebar.jsx";
import {useAuth} from "../context/AuthContext";

const Dashboard = () => {
    const {user} = useAuth();

    return (
        <div className="flex min-h-[calc(100vh-4rem)] bg-gray-100">

            <Sidebar/>

            {/* Main Content */}
            <main className="flex-1 p-6">
                <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                    Bienvenido, {user?.nombre || "Usuario"}
                </h1>
            </main>
        </div>
    );
};

export default Dashboard;