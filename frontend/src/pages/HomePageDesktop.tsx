import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginForm from "../components/LoginForm/LoginForm";
import Button from "../components/Button/Button";
import { useIsDesktop } from "../hooks/useIsDesktop";
import { useAuth } from "../context/AuthContext";

import styles from "./HomePageDesktop.module.css";

export default function HomePageDesktop() {
  const isDesktop = useIsDesktop();
  const { user, token, login } = useAuth();
  const navigate = useNavigate();

  const [showContent, setShowContent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Animación inicial
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  // Si hay token y NO es admin → redirigir
  useEffect(() => {
    if (token && user?.rol !== "admin") {
      navigate("/home-mobile", { replace: true });
    }
  }, [token, user, navigate]);

  // Si NO es desktop y el rol es admin → permitir acceso
  useEffect(() => {
    if (!isDesktop && user?.rol === "admin") {
      return; // Admin en móvil → permitir HomePageDesktop
    }

    // Si NO es desktop y NO es admin → ir a HomeMobile
    if (!isDesktop && user?.rol !== "admin") {
      navigate("/home-mobile", { replace: true });
    }
  }, [isDesktop, user, navigate]);

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
                  alert("Usuario o contraseña incorrectos");
                  return;
                }

                const user = JSON.parse(localStorage.getItem("user") || "{}");

                if (user.rol === "admin") {
                  navigate("/dashboard");
                } else {
                  navigate("/home-mobile");
                }
              }}
            />
          </article>
        )}

      </section>
    </main>
  );
}
