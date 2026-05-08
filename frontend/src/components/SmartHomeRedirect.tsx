import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useIsDesktop";

export default function SmartHomeRedirect() {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDesktop) {
      navigate("/home-desktop", { replace: true });
    } else {
      navigate("/home-mobile", { replace: true });
    }
  }, [isDesktop, navigate]);

  return null; // no renderiza nada
}
