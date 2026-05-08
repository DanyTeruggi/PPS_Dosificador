import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import LoginForm from "../components/LoginForm/LoginForm";
import Button from "../components/Button/Button";
import { useIsDesktop } from "../hooks/useIsDesktop";

import styles from "./HomePageDesktop.module.css";

export default function HomePageDesktop() {

  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isDesktop) {
      navigate("/home-mobile", { replace: true });
    }
  }, [isDesktop, navigate]);

  const [showContent, setShowContent] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
            <LoginForm />
          </article>
        )}

      </section>

    </main>
  );
}
