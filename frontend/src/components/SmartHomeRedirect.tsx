import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function SmartHomeRedirect() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? user?.rol;

  useEffect(() => {
  

    // Si NO hay token → volver a la landing
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    // Si hay token pero NO hay user → volver a la landing
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    // ADMIN → escritorio (dashboard)
    if (role === "admin") {
      navigate("/dashboard", { replace: true });
      return;
    }

    // CLIENTE/VETERINARIO → dashboard compartido por rol
    if (role === "veterinario") {
      navigate("/veterinarios/clientes", { replace: true });
      return;
    }

    navigate("/cliente/establecimientos", { replace: true });

  }, [token, user, role, navigate]);

  return null;
}

