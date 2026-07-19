import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

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
