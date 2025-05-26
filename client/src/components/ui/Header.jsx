import React from "react";
import {useAuth} from "../../context/AuthContext";
import {useSaldos} from "../../context/SaldosContext";
import {useNavigate} from "react-router-dom";
import Boton from "./Boton";
import {CircleDollarSign, UserRound, Eye, EyeClosed, DoorOpen, Settings} from "lucide-react";

const Header = () => {
    const {user, logout} = useAuth();
    const baseUrl = import.meta.env.VITE_SUPABASE_AVATAR_BASE_URL;
    const avatarFullUrl = user ? `${baseUrl}${user.avatar}` : null;
    const {toggleMostrarSaldos, mostrarSaldos} = useSaldos();
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm w-full h-16">
            <div className="mx-auto grid lg:grid-cols-3 grid-cols-2 h-full px-4 sm:px-6">

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
                    <span className="font-bold text-lg text-aguazul ml-2 truncate min-w-0 max-w-[120px] sm:max-w-[200px]" title={user?.nombre}>
                        {user?.nombre || "Usuario"}
                    </span>

                    <span className="text-sm text-neutral-500 hidden md:block">
                        {user?.lastAccess && (
                            <>Último acceso:&nbsp;
                                {new Intl.DateTimeFormat('es-ES', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                    timeZone: 'Europe/Madrid',
                                }).format(new Date(new Date(user.lastAccess).getTime() + 2 * 60 * 60 * 1000))}
                            </>
                        )}
                    </span>
                </div>
                {/* Center section - Logo */}
                <div className="hidden lg:flex items-center justify-center">
                    <div className="flex items-center bg-white rounded-full p-1">
                        <CircleDollarSign className="text-dollar-500"/>
                    </div>
                    <span className="font-bold text-xl text-aguazul ml-2">
                        FinanzApp
                    </span>
                </div>

                {/* Right section - Action Buttons */}
                <div className="flex items-center justify-end space-x-2">

                    <Boton tipo="icono" aria-label="show numbers" onClick={toggleMostrarSaldos}>
                        {mostrarSaldos ? (
                            <Eye className="text-neutral-600"/>
                        ) : (
                            <EyeClosed className="text-neutral-600"/>
                        )}
                    </Boton>

                    <Boton tipo="icono" aria-label="Settings" onClick={() => {
                        navigate("/ajustes");
                    }}>
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

