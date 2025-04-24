import React from "react";
import {useAuth} from "../../context/AuthContext";
import Boton from "./Boton";
import {CircleDollarSign, UserRound, Eye, EyeClosed, Settings, DoorOpen} from "lucide-react";

const Header = () => {
    const {user, logout} = useAuth();
    const baseUrl = import.meta.env.VITE_SUPABASE_AVATAR_BASE_URL;
    const avatarFullUrl = user ? `${baseUrl}${user.avatar}` : null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm w-full h-16">
            <div className="mx-auto grid md:grid-cols-3 grid-cols-2 h-full px-4 sm:px-6">

                {/* Left section - User Avatar */}
                <div className="flex items-center justify-start space-x-2">
                    {user && !avatarFullUrl.includes("null") ? (
                        <img
                            src={avatarFullUrl}
                            alt="User Avatar"
                            className="h-10 w-10 rounded-full border-2 border-neutral-300"
                        />
                    ) : (
                        <div
                            className="h-10 w-10 rounded-full border-2 border-neutral-300 flex items-center justify-center bg-neutral-100">
                            <UserRound className="text-neutral-600"/>
                        </div>
                    )}
                    <span className="font-display font-bold text-lg text-aguazul ml-2">
                        {user?.nombre || "Usuario"}
                    </span>

                    <span className="text-sm text-neutral-500">
                        {user?.lastAccess ? `Último acceso: ${new Date(user.lastAccess).toLocaleString()}` : ""}
                    </span>
                </div>

                {/* Center section - Logo */}
                <div className="hidden md:flex items-center justify-center">
                    <div className="flex items-center bg-white rounded-full p-1">
                        <CircleDollarSign className="text-dollar-500"/>
                    </div>
                    <span className="font-display font-bold text-xl text-aguazul ml-2">
        FinanzApp
    </span>
                </div>

                {/* Right section - Action Buttons */}
                <div className="flex items-center justify-end space-x-2">

                    <Boton tipo="icono" aria-label="show numbers">
                        <Eye className="text-neutral-600"/>
                    </Boton>

                    <Boton tipo="icono" aria-label="Settings">
                        <Settings className="text-neutral-600"/>
                    </Boton>

                    <Boton tipo="icono" aria-label="Logout" onClick={logout}>
                        <DoorOpen className="text-neutral-600"/>
                    </Boton>
                </div>
            </div>
        </nav>
    );
};

export default Header;

