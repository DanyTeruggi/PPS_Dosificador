import { BsHouseDoorFill,
  BsHeadset,
  BsBoxArrowRight } from "react-icons/bs";
import styles from "./Footer.module.css";

import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Redirige al home (SmartHomeRedirect decide desktop o mobile)
  const handleHome = () => {
    navigate("/home");
  };

  // Logout real: borra token + redirige al login
  const handleLogout = () => {
    navigate("/", { replace: true });
    logout();
  };

  return (
    <footer className={styles.footer}>

      {/* HOME */}
      <div className={styles.item} onClick={handleHome}>
        <BsHouseDoorFill size={22} />
        <span className={styles.label}>Inicio</span>
      </div>

      {/* SOPORTE TÉCNICO */}
      <div className={styles.item}>
        <BsHeadset size={22} />
        <span className={styles.label}>Soporte Técnico</span>
      </div>

      {/* LOGOUT */}
      <div className={styles.item} onClick={handleLogout}>
        <BsBoxArrowRight size={22} />
        <span className={styles.label}>Salir</span>
      </div>

    </footer>
  );
}
