import { Outlet } from "react-router-dom";
import Footer from "../components/Footer/Footer"; 
import FooterDesktop from "../components/Footer/FooterDesktop";
import { useIsDesktop } from "../hooks/useIsDesktop";

export default function PublicLayout() {
  const isDesktop = useIsDesktop();

  return (
    <div className="public-layout">
      <Outlet />

      {isDesktop ? <FooterDesktop /> : <Footer />}
    </div>
  );
}

