import styles from "./LandingMobile.module.css";

type LandingPageStatusProps = {
  loading: boolean;
  error: string | null;
  loadingMessage?: string;
};

/**
 * Muestra un unico estado por vez: primero el error y luego la carga.
 * Si no existe ninguno, no agrega elementos a la pagina.
 */
export default function LandingPageStatus({
  loading,
  error,
  loadingMessage = "Cargando...",
}: LandingPageStatusProps) {
  if (error) {
    return <p className={`${styles.message} ${styles.error}`}>{error}</p>;
  }

  if (loading) {
    return <p className={styles.message}>{loadingMessage}</p>;
  }

  return null;
}
