import { BsHouse, BsPeopleFill, BsXCircle, BsDash } from "react-icons/bs";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>

      <div className={styles.item}>
        <BsHouse size={22} />
        <span className={styles.label}>Home</span>
      </div>

      <div className={styles.item}>
        <BsPeopleFill size={22} />
        <span className={styles.label}>Soporte Técnico</span>
      </div>

      <div className={styles.item}>
        <BsXCircle size={22} />
        <span className={styles.label}>Cerrar</span>
      </div>

      <div className={styles.item}>
        <BsDash size={22} />
        <span className={styles.label}>Minimizar</span>
      </div>

    </footer>
  );
}
