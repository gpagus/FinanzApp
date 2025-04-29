import Header from "./Header";
import Footer from "../Footer";
import Sidebar from "./Sidebar";
import {Outlet} from "react-router-dom";

export default function PrivateLayout() {
    return (
        <>
            <Header/>
            <div className="pt-16 flex bg-neutral-100">
                <Sidebar/>
                <main className="flex-1 pb-10 overflow-x-auto">
                    <Outlet/>
                </main>
            </div>

            <Footer isOnPublic={false}/>
        </>
    );
}
