import { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm/LoginForm";
import Button from "../components/Button/Button"; 
import "./HomePageDesktop.css";

export default function HomePageDesktop() {
  const [showContent, setShowContent] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 55);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="desktop-homepage">

      {/* SECTION con imagen de fondo */}
      <section className="home-section">

        {/* TÍTULO con blur + animación */}
        <div className={`home-title-wrapper fade-in ${showContent ? "visible" : ""}`}>
          <h1 className="home-title fw-bold mb-4">
            Centro de Control Bacteriológico
          </h1>
        </div>
        
        <div className="spacer"></div>

        {/* BOTÓN INGRESAR (solo si el form está oculto) */}
        {!showForm && (
          <div className={`fade-in ${showContent ? "visible" : ""}`}>
            <Button
              label="INGRESAR"
              variant="hero"     
              fullWidth={false}  // ← centrado y tamaño natural
              onClick={() => setShowForm(true)}
            />
          </div>
        )}

        {/* FORMULARIO (aparece con animación) */}
        {showForm && (
          <article className={`home-form fade-in visible`}>
            <LoginForm />
          </article>
        )}

      </section>

     

    </main>
  );
}
