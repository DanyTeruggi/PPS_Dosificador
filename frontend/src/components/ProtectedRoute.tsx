import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface Props {
  children: React.ReactNode;
  roles?: string[]; // opcional: ["admin"], ["cliente"], ["veterinario"]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { token, user } = useAuth();

  // 1) Si NO hay token → home pública
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // 2) Si hay token pero NO hay user → home pública (caso raro)
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3) Si la ruta requiere roles específicos
  if (roles && !roles.includes(user.role)) {
    // Redirección inteligente según rol
    if (user.role === "admin") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/home-mobile" replace />;
  }

  // 4) Si todo está OK → renderizar
  return <>{children}</>;
}
