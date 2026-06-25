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

  // 1) Si NO hay token → ir al login
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  // 2) Si hay token pero NO es admin → ir a HomeMobile
  useEffect(() => {
    if (token && user?.rol !== "admin") {
      navigate("/home-mobile", { replace: true });
    }
  }, [token, user, navigate]);

  // 3) Si NO es desktop y el rol es admin → PERMITIR acceso
  //    (NO redirigimos a /home-mobile)
  useEffect(() => {
    if (!isDesktop && user?.rol === "admin") {
      return; // Admin en móvil → permitir HomePageDesktop
    }

    // 4) Si NO es desktop y NO es admin → ir a HomeMobile
    if (!isDesktop && user?.rol !== "admin") {
      navigate("/home-mobile", { replace: true });
    }
  }, [isDesktop, user, navigate]);

  // Animación
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 55);
    return () => clearTimeout(timer);
  }, []);

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

        {/* FORMULARIO */}
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
