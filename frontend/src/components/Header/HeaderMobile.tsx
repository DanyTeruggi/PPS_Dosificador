import styles from "./HeaderMobile.module.css";
import logoHeader from "../../assets/CIVETAN.png";

export default function HeaderMobile() {
  return (
    <header className={styles.headerMobile}>
      <img
        src={logoHeader}
        alt="Logo"
        className={styles.logo}
      />
    </header>
  );
}
