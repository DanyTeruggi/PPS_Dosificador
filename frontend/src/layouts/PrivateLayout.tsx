import { Outlet, Navigate } from "react-router-dom";


export default function PrivateLayout() {
  const isLogged = true; // luego lo reemplazamos con auth real

  if (!isLogged) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="private-layout">
      {/* Header futuro */}
      <Outlet />
    </div>
  );
}
