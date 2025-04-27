import {useLocation} from "react-router-dom";
import Header from "./Header";
import HeaderMinimal from "./HeaderMinimal";
import Footer from "../Footer";

export default function Layout({children}) {
    const location = useLocation();
    const rutasConHeader = ["/dashboard"];
    const MostrarHeader = rutasConHeader.includes(location.pathname)
        ? Header
        : HeaderMinimal;

    return (
        <>
            <MostrarHeader/>
            <main className="pt-16 pb-10">
                    {children}
            </main>
            <Footer/>
        </>
    );
}
