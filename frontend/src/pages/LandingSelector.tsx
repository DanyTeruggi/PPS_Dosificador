import { useIsDesktop } from "../hooks/useIsDesktop";
import HomePageDesktop from "../pages/HomePageDesktop";
import HomePageMobile from "../pages/HomePageMobil";
import { useAuth } from "../context/AuthContext";
import SmartHomeRedirect from "../components/SmartHomeRedirect";

export default function LandingSelector() {
  const isDesktop = useIsDesktop();
  const { token } = useAuth();


  // Si NO hay token → mostrar la home pública, no el login directo
  if (!token) {
    return isDesktop ? <HomePageDesktop /> : <HomePageMobile />;
  }

  // Si hay token → redirigir según rol
  return <SmartHomeRedirect />;
}
