import HeaderMinimal from "./HeaderMinimal";
import Footer from "../Footer";
import {Outlet} from "react-router-dom";

export default function PublicLayout() {

    return (
        <>
            <HeaderMinimal/>
            <main className="pt-16 pb-10 bg-neutral-100">
                <Outlet/>
            </main>
            <Footer isOnPublic={true}/>
        </>
    );
}
