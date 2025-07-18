import Boton from "./Boton.jsx";

export default function HeaderMinimal() {
    return (
        <nav className="fixed top-0 left-0 right-0 h-16 flex items-center px-6 bg-white shadow z-50 w-full">
            {/* Logo sin underline */}
            <Boton tipo="texto" to="/dashboard" className="bg-transparent flex items-center">
                <img
                    src="/logo.webp"
                    alt="FinanzApp Logo"
                    className="h-12 w-12 object-contain contrast-125 saturate-150 brightness-110"
                />
                <span className="font-bold text-xl text-aguazul">
                    FinanzApp
                </span>
            </Boton>
        </nav>
    );
}