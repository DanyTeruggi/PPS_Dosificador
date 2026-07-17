import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./HomePageMobile.module.css";

import logoCIVETAN from "../assets/CIVETAN.png";
import logoVEWTERINARIA from "../assets/facVeterinaria.jpeg";
import logoEXACTAS from "../assets/facExactas.png";

export default function HomePageMobile() {
  const [fadeOut, setFadeOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      console.log("fadeOut activado");
      setFadeOut(true);
    }, 2000);

    const loginTimer = setTimeout(() => {
      navigate("/login", { replace: true });
    }, 2600);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(loginTimer);
    };
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
