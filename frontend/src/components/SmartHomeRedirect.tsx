import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useAuth } from "../context/AuthContext";

export default function SmartHomeRedirect() {
  const isDesktop = useIsDesktop();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 1) Si NO hay token → login
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    // 2) Si hay token pero NO hay user (caso raro) → login
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // 3) ADMIN → SIEMPRE a HomeDesktop (móvil o escritorio)
    if (user.rol === "admin") {
      navigate("/home-desktop", { replace: true });
      return;
    }

    // 4) CLIENTE o VETERINARIO → SIEMPRE a HomeMobile
    navigate("/home-mobile", { replace: true });

  }, [token, user, isDesktop, navigate]);

  return null;
}
