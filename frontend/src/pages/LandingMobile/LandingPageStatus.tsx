import petriImage from "../../assets/petri.png";
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
    return (
      <section className={styles.loadingState} role="status" aria-live="polite">
        <div className={styles.loadingVisual} aria-hidden="true">
          <div className={styles.petriFrame}>
            <img className={styles.petriImage} src={petriImage} alt="" />
          </div>
          <span className={styles.spinnerRing} />
        </div>

        <div className={styles.loadingCopy}>
          <p className={styles.loadingTitle}>{loadingMessage}</p>
          <p className={styles.loadingHint}>Esto puede tardar unos segundos</p>
        </div>
      </section>
    );
  }

  return null;
}
