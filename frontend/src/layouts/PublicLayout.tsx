import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer/Footer"; 
import FooterDesktop from "../components/Footer/FooterDesktop";
import { useIsDesktop } from "../hooks/useIsDesktop";

export default function PublicLayout() {
  const isDesktop = useIsDesktop();
  const { pathname } = useLocation();

  // Welcome mobile y Login usan toda la pantalla y no necesitan navegacion inferior.
  const hideFooter = pathname === "/login"
    || (!isDesktop && (pathname === "/" || pathname === "/home-mobile"));

  return (
    <div className="public-layout">
      <Outlet />

      {!hideFooter && (isDesktop ? <FooterDesktop /> : <Footer />)}
    </div>
  );
}

