import styles from "./DashboardHeader.module.css";
import { useAuth } from "../../../context/AuthContext";

export default function DashboardHeader() {
  const { user } = useAuth();

  /**
   * Genera iniciales a partir del nombre del usuario.
   * Ejemplos:
   * - "Ana Gómez" → "AG"
   * - "Daniel" → "D"
   * - "María del Carmen" → "MC"
   */
  const getInitials = (nombre: string | undefined) => {
    if (!nombre) return "?";

    const partes = nombre.trim().split(" ");
    if (partes.length === 1) return partes[0][0].toUpperCase();

    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  };

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

  return (
    <header className={styles.header}>
      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          {getInitials(user?.nombre)}
        </div>

        <p className={styles.role}>
          {getRolLabel(user?.rol)}
        </p>
      </div>

      <p className={styles.title}>Panel de Control</p>
    </header>
  );
}
