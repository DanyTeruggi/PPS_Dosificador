import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginForm from "../components/LoginForm/LoginForm";
import Button from "../components/Button/Button";
//import { useIsDesktop } from "../hooks/useIsDesktop";
import { useAuth } from "../context/AuthContext";

import styles from "./HomePageDesktop.module.css";


export default function HomePageDesktop() {
 //const isDesktop = useIsDesktop();
  const { token, login, logout } = useAuth();
  const navigate = useNavigate();

  const [showContent, setShowContent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Animación inicial
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);
  console.log("HomePageDesktop montado, token:", token);
  console.log("HomePageDesktop montado DESDE RUTA /");



  return ( 
    <main className={styles.page}>
      <section className={styles.section}>

        {/* TÍTULO */}
        <div className={`${styles.titleWrapper} ${styles.fadeIn} ${showContent ? styles.visible : ""}`}>
          <h1 className={styles.title}>Centro de Control Bacteriológico</h1>
        </div>

        <div className={styles.spacer}></div>

        {/* BOTÓN INGRESAR */}
        {!showForm && (
          <div className={`${styles.fadeIn} ${showContent ? styles.visible : ""}`}>
            <Button
              label="INGRESAR"
              variant="hero"
              fullWidth={false}
              onClick={() => setShowForm(true)}
            />
          </div>
        )}

        {/* FORMULARIO EMERGENTE */}
        {showForm && (
          <article className={`${styles.form} ${styles.fadeIn} ${styles.visible}`}>
            <LoginForm
              onLogin={async (email, password) => {
                const ok = await login(email, password);

                if (!ok) {
                  throw new Error("AUTH_FAILED");
                }

                const user = JSON.parse(localStorage.getItem("user") || "{}");
                console.log("rol del usuario:", user.role);
                if (user.role === "admin") {
                  navigate("/dashboard");
                  return;
                }

                // Barrera extra para escritorio: solo admin puede continuar.
                logout();
                throw new Error("UNAUTHORIZED_PROFILE");
              }}
            />
          </article>
        )}

      </section>
     
    </main>
  );
}
