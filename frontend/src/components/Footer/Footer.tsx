import { BsHouse, BsPeopleFill, BsXCircle } from "react-icons/bs";
import styles from "./Footer.module.css";

import { useAuth } from "../../context/AuthContext";
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
        <BsHouse size={22} />
        <span className={styles.label}>Home</span>
      </div>

      {/* SOPORTE TÉCNICO */}
      <div className={styles.item}>
        <BsPeopleFill size={22} />
        <span className={styles.label}>Soporte Técnico</span>
      </div>

      {/* LOGOUT */}
      <div className={styles.item} onClick={handleLogout}>
        <BsXCircle size={22} />
        <span className={styles.label}>Cerrar</span>
      </div>

    </footer>
  );
}
