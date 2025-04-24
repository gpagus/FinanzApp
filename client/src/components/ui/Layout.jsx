import { useLocation } from "react-router-dom";
import Header from "./Header.jsx";
import HeaderMinimal from "./HeaderMinimal.jsx";

const Layout = ({ children }) => {
  const location = useLocation();

  // Solo mostramos el header completo en estas rutas
  const rutasConHeader = ["/dashboard"];
  const mostrarHeaderCompleto = rutasConHeader.includes(location.pathname);

  return (
    <>
      {mostrarHeaderCompleto ? <Header /> : <HeaderMinimal />}
      <main className="pt-16">{children}</main>
    </>
  );
};

export default Layout;
