import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { UserRole } from "../context/authContextDefinition";
import { getHomeByRole } from "../utils/roleHome";
import SessionLoadingScreen from "./SessionLoadingScreen";

interface Props {
  children: React.ReactNode;
  roles?: UserRole[];
}

// controla si el usuario puede entrar a una ruta
export default function ProtectedRoute({ children, roles }: Props) {
  const { token, user, isInitializing } = useAuth();

  if (isInitializing) {
    return <SessionLoadingScreen />;
  }

  // 1) Si NO hay token → home pública
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2) Si hay token pero NO hay user → home pública 
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3) Si la ruta requiere roles específicos
  if (roles && !roles.includes(user.role)) {
    // Redirección inteligente según rol
    return <Navigate to={getHomeByRole(user.role)} replace />;
  }

  // 4) Si todo está OK => renderizar
  return <>{children}</>;
}
