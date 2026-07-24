import { useIsDesktop } from "../hooks/useIsDesktop";
import DesktopLoginPage from "./LandingDesktop/DesktopLoginPage";
import WelcomePage from "./LandingMobile/WelcomePage";
import { useAuth } from "../context/useAuth";
import SmartHomeRedirect from "../components/SmartHomeRedirect";
import SessionLoadingScreen from "../components/SessionLoadingScreen";

export default function LandingSelector() {
  const isDesktop = useIsDesktop();
  const { token, isInitializing } = useAuth();

  if (isInitializing) return <SessionLoadingScreen />;

  // Si NO hay token → mostrar la home pública, no el login directo
  if (!token) {
    return isDesktop ? <DesktopLoginPage /> : <WelcomePage />;
  }

  // Si hay token → redirigir según rol
  return <SmartHomeRedirect />;
}
