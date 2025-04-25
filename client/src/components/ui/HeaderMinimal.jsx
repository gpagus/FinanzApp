import {CircleDollarSign} from "lucide-react";
import Boton from "./Boton.jsx";

export default function HeaderMinimal() {
    return (
        <nav className="fixed top-0 left-0 right-0 h-16 flex items-center px-6 bg-white shadow z-50">
            {/* Logo sin underline */}
            <Boton tipo="texto" to="/dashboard" className="bg-transparent flex items-center space-x-2">
                <CircleDollarSign className="text-dollar-500"/>
                <span className="font-bold text-xl text-aguazul">
                    FinanzApp
                </span>
            </Boton>
        </nav>
    );
}
