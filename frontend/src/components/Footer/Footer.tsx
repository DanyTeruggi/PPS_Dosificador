import { useState } from "react";
import { BsHouseDoorFill,
  BsHeadset,
  BsBoxArrowRight } from "react-icons/bs";
import styles from "./Footer.module.css";

import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";
import SupportWhatsAppModal from "../SupportWhatsAppModal/SupportWhatsAppModal";

export default function Footer() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [showSupport, setShowSupport] = useState(false);

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
      <button className={styles.item} type="button" onClick={() => setShowSupport(true)}>
        <BsHeadset size={22} />
        <span className={styles.label}>Soporte Técnico</span>
      </button>

      {/* LOGOUT */}
      <div className={styles.item} onClick={handleLogout}>
        <BsBoxArrowRight size={22} />
        <span className={styles.label}>Salir</span>
      </div>

      {showSupport && (
        <SupportWhatsAppModal user={user} onClose={() => setShowSupport(false)} />
      )}

    </footer>
  );
}
