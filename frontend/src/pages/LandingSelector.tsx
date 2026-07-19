import { useIsDesktop } from "../hooks/useIsDesktop";
import DesktopLoginPage from "./LandingDesktop/DesktopLoginPage";
import WelcomePage from "./LandingMobile/WelcomePage";
import { useAuth } from "../context/useAuth";
import SmartHomeRedirect from "../components/SmartHomeRedirect";

export default function LandingSelector() {
  const isDesktop = useIsDesktop();
  const { token } = useAuth();


  // Si NO hay token → mostrar la home pública, no el login directo
  if (!token) {
    return isDesktop ? <DesktopLoginPage /> : <WelcomePage />;
  }

  // Si hay token → redirigir según rol
  return <SmartHomeRedirect />;
}
