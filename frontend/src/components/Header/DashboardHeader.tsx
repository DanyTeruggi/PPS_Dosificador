import styles from "./DashboardHeader.module.css";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import { getInitials } from "../../utils/getInitials";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Genera iniciales a partir del nombre del usuario.
   * Ejemplos:
   * - "Ana Gómez" → "AG"
   * - "Daniel" → "D"
   * - "María del Carmen" → "MC"
   */
  /**
   * Traducción del rol para mostrarlo más amigable.
   */
  const getRolLabel = (rol: string | undefined) => {
    switch (rol) {
      case "admin":
        return "Administrador";
      case "veterinario":
        return "Veterinario";
      case "cliente":
        return "Productor";
      default:
        return "Usuario";
    }
  };

  /**
   * Cierra la sesión:
   * - Limpia token y usuario del contexto
   * - Limpia la sesión almacenada
   * - Redirige al landing
   */
  const handleLogout = () => {
    navigate("/", { replace: true });
    logout();
  };

  return (
    <header className={styles.header}>
      {/* Información del usuario */}
      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          {getInitials(user?.nombre)}
        </div>

        <p className={styles.role}>
          {getRolLabel(user?.role)}
        </p>
      </div>

      {/* Título del panel */}
      <p className={styles.title}>Centro de Monitoreo</p>

      {/* Botón de logout reutilizando el componente Button */}
      <Button
        label="Cerrar sesión"
        variant="primary"
        fullWidth={false}
        onClick={handleLogout}
      />
    </header>
  );
}
