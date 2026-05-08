import { Navigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useIsDesktop";

export default function SmartHomeRedirect() {
  const isDesktop = useIsDesktop();

  return isDesktop
    ? <Navigate to="/home-desktop" replace />
    : <Navigate to="/home-mobile" replace />;
}
