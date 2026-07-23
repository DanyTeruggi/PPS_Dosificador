import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

// se usa para proteger rutas privadas, si no hay token redirige a la pagina de login
export default function PrivateLayout() {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="private-layout">
      <Outlet />
    </div>
  );
}
