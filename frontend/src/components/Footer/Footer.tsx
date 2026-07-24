import { useState } from "react";
import { BsHeadset, BsBoxArrowRight } from "react-icons/bs";
import { HiHome } from "react-icons/hi2";
import styles from "./Footer.module.css";

import { useAuth } from "../../context/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
import { getHomeByRole } from "../../utils/roleHome";
import SupportWhatsAppModal from "../SupportWhatsAppModal/SupportWhatsAppModal";

export default function Footer() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSupport, setShowSupport] = useState(false);

  // Evita la ruta intermedia /home y su pantalla vacía para los roles mobile.
  const handleHome = () => {
    const homePath = user ? getHomeByRole(user.role) : null;

    if (!homePath || (location.pathname === homePath && !location.search)) return;
    navigate(homePath, { replace: true });
  };

  // Logout real: borra token + redirige al login
  const handleLogout = () => {
    navigate("/", { replace: true });
    logout();
  };

  return (
    <footer className={styles.footer}>

      {/* HOME */}
      <button className={styles.item} type="button" onClick={handleHome}>
        <HiHome aria-hidden="true" size={22} />
        <span className={styles.label}>Inicio</span>
      </button>

      {/* SOPORTE TÉCNICO */}
      <button className={styles.item} type="button" onClick={() => setShowSupport(true)}>
        <BsHeadset aria-hidden="true" size={22} />
        <span className={styles.label}>Soporte Técnico</span>
      </button>

      {/* LOGOUT */}
      <button
        aria-label="Cerrar sesión"
        className={styles.item}
        type="button"
        onClick={handleLogout}
      >
        <BsBoxArrowRight aria-hidden="true" size={22} />
        <span className={styles.label}>Salir</span>
      </button>

      {showSupport && (
        <SupportWhatsAppModal user={user} onClose={() => setShowSupport(false)} />
      )}

    </footer>
  );
}
