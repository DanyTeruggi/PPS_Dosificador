import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useIsDesktop";

import styles from "./HomePageMobile.module.css";

import logoCIVETAN from "../assets/CIVETAN.png";
import logoVEWTERINARIA from "../assets/facVeterinaria.jpeg";
import logoEXACTAS from "../assets/facExactas.png";

export default function HomePageMobile() {

  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const [fadeOut, setFadeOut] = useState(false);

  // Redirección automática si cambia el tamaño
  useEffect(() => {
    if (isDesktop) {
      navigate("/home-desktop", { replace: true });
    }
  }, [isDesktop, navigate]);

  // Fade-out + navegación
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 600);

    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`${styles.container} ${fadeOut ? styles.fadeOut : ""}`}>

      <h1>Bienvenido</h1>
      <h2>Control Bacteriológico</h2>

      <img
        src={logoVEWTERINARIA}
        alt="Logo Facultad"
        className={styles.mainLogo}
      />

      <div className={styles.logosBar}>
        <img src={logoCIVETAN} alt="CIVETAN" className={styles.institutionLogo} />
        <img src={logoEXACTAS} alt="Facultad de Exactas" className={styles.institutionLogo} />
      </div>

    </div>
  );
}
