import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getHomeByRole } from "../utils/roleHome";
import SessionLoadingScreen from "./SessionLoadingScreen";

//decide a qué página inicial enviar al usuario según su rol y si está logueado o no.
export default function SmartHomeRedirect() {
  const { user, token, isInitializing } = useAuth();
  const navigate = useNavigate();

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
    navigate(getHomeByRole(user.role), { replace: true });

  }, [isInitializing, token, user, navigate]);

  return <SessionLoadingScreen />;
}

