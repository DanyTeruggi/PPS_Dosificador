import { Outlet, useLocation } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import FooterDesktop from "../components/Footer/FooterDesktop";
import { useIsDesktop } from "../hooks/useIsDesktop";

export default function PublicLayout() {
  const isDesktop = useIsDesktop();
  const { pathname } = useLocation();

  // En mobile, Welcome y Login usan toda la pantalla. Desktop conserva su Footer.
  const hideFooter = pathname === "/login"
    || (!isDesktop && (pathname === "/" || pathname === "/home-mobile"));

  return (
    <div className="public-layout">
      <Outlet />

      {!hideFooter && (isDesktop ? <FooterDesktop /> : <Footer />)}
    </div>
  );
}

