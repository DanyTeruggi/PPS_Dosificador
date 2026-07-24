import LandingPageStatus from "../pages/LandingMobile/LandingPageStatus";
import styles from "../pages/LandingMobile/LandingMobile.module.css";

export default function SessionLoadingScreen() {
  return (
    <div className={styles.page}>
      <main className={`${styles.content} ${styles.sessionLoadingContent}`}>
        <LandingPageStatus
          loading
          error={null}
          loadingMessage="Validando sesión…"
        />
      </main>
    </div>
  );
}
