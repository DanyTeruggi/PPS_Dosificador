import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

//decide a qué página inicial enviar al usuario según su rol y si está logueado o no.
export default function SmartHomeRedirect() {
  const { user, token, isInitializing } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? user?.rol;

  useEffect(() => {
    if (isInitializing) return;
  

    // Si NO hay token => volver a la landing
    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    // Si hay token pero NO hay user => volver a la landing
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    // ADMIN => escritorio (dashboard)
    if (role === "admin") {
      navigate("/dashboard", { replace: true });
      return;
    }

    // VETERINARIO => comienza en la lista de clientes.
    if (role === "veterinario") {
      navigate("/veterinarios/clientes", { replace: true });
      return;
    }

    navigate("/cliente/establecimientos", { replace: true });

  }, [isInitializing, token, user, role, navigate]);

  return null;
}

