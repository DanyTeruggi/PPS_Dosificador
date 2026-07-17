import { useIsDesktop } from "../hooks/useIsDesktop";
import HomePageDesktop from "../pages/HomePageDesktop";
// import LegacyHomePageMobile from "../pages/HomePageMobil";
import WelcomePage from "./LandingMobile/WelcomePage";
import { useAuth } from "../context/AuthContext";
import SmartHomeRedirect from "../components/SmartHomeRedirect";

export default function LandingSelector() {
  const isDesktop = useIsDesktop();
  const { token } = useAuth();


  // Si NO hay token → mostrar la home pública, no el login directo
  if (!token) {
    return isDesktop ? <HomePageDesktop /> : <WelcomePage />;
  }

  // Si hay token → redirigir según rol
  return <SmartHomeRedirect />;
}
