import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import logoCivetan from "../../assets/CIVETAN.png";
import logoExactas from "../../assets/facExactas.png";
import logoPetri from "../../assets/fondoApp.png";
import logoVeterinaria from "../../assets/logo-facu-veterinaria.png";
import logoUnicen from "../../assets/UNICEN2.png";
import styles from "./WelcomePage.module.css";

/** Nueva pantalla de bienvenida para dispositivos moviles. */
export default function WelcomePage() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);



  function handleEnter() {
    // El boton permite continuar sin esperar la redireccion automatica.
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    if (navigationTimer.current) clearTimeout(navigationTimer.current);

    setLeaving(true);
    navigationTimer.current = setTimeout(() => navigate("/login", { replace: true }), 600);
  }

  return (
    <main className={`${styles.page} ${leaving ? styles.fadeOut : ""}`}>
      <div className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.title}>Bienvenido</h1>
        </div>

        <div className={styles.projectIdentity}>
          <p className={styles.subtitle}>Monitoreo Bacteriológico</p>
          <img
            className={styles.mainLogo}
            src={logoPetri}
            alt="Ganado en el campo junto a una cadena de ADN y bacterias"
          />
        </div>

        <div className={styles.actions}>
          <button className={styles.enterButton} type="button" onClick={handleEnter}>
            Ingresar
          </button>

          <div className={styles.logosBar} aria-label="Instituciones participantes">
            <img className={styles.institutionLogo} src={logoCivetan} alt="CIVETAN" />
            <img
              className={`${styles.institutionLogo} ${styles.institutionLogoExpanded}`}
              src={logoExactas}
              alt="Facultad de Ciencias Exactas"
            />
            <img
              className={`${styles.institutionLogo} ${styles.institutionLogoExpanded}`}
              src={logoVeterinaria}
              alt="Facultad de Veterinaria"
            />
          </div>
          
          <div className={styles.institutionNames} aria-label="Nombres de las instituciones participantes">
            <img className={styles.institutionUnicen} src={logoUnicen} alt="UNICEN" />
          </div>  
        </div>
      </div>
    </main>
  );
}
