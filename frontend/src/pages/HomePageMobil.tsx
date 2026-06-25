import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./HomePageMobile.module.css";

import logoCIVETAN from "../assets/CIVETAN.png";
import logoVEWTERINARIA from "../assets/facVeterinaria.jpeg";
import logoEXACTAS from "../assets/facExactas.png";

export default function HomePageMobile() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);

      setTimeout(() => {
        // Si NO hay token → ir al login
        if (!token) {
          navigate("/login", { replace: true });
          return;
        }

        // Si hay token:
        // ADMIN → NO puede estar en HomeMobile → ir a dashboard
        if (user?.rol === "admin") {
          navigate("/dashboard", { replace: true });
          return;
        }

        // CLIENTE o VETERINARIO → se quedan en HomeMobile
        // (NO redirigimos a dashboard)
      }, 600);

    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate, token, user]);

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
