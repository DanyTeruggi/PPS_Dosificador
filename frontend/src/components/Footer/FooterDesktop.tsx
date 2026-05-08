import styles from "./FooterDesktop.module.css";

import logoFCV from "../../assets/facVeterinaria.jpeg";
import logoCivetan from "../../assets/CIVETAN.png";
import logoEXACTAS from "../../assets/facExactas.png";

export default function FooterDesktop() {
  return (
    <footer className={styles.footer}>
      
      <div className={styles.logos}>
        <img src={logoFCV} alt="FCV" className={styles.logo} />
        <img src={logoCivetan} alt="CIVETAN" className={styles.logo} />
        <img src={logoEXACTAS} alt="Facultad de Exactas" className={styles.logo} />
      </div>

      <div className={styles.contact}>
        <p>Facultad de Ciencias Veterinarias - UNCPBA</p>
        <p>CIVETAN - Centro de Investigaciones Veterinarias Tandil</p>
        <p>Email: contacto@civetan.edu.ar</p>
        <p>Tel: +54 249 442-1234</p>
      </div>

    </footer>
  );
}
