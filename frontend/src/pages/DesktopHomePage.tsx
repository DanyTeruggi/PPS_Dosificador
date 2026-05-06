import { useEffect, useState } from "react";
import LoginForm from "../components/LoginForm/LoginForm";
import FooterDesktop from "../components/Footer/FooterDesktop";
import ImgBackground from "../assets/ovejasPastando.jpg";

export default function DesktopHomePage() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 55);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main
      className="d-flex flex-column justify-content-between"
      style={{
        minHeight: "100vh",
        background: "var(--background-gradient)",
        padding: "40px 20px",
      }}
    >
     

      {/* SECTION con imagen de fondo */}
      <section
        className="home-section text-center d-flex flex-column align-items-center"
      >
        {/* TÍTULO con animación */}
        <h1
          className={`home-title fw-bold mb-4 fade-in ${showContent ? "visible" : ""}`}
        >
          Centro de Monitoreo Bacteriológico
        </h1>

        {/* FORM con animación */}
        <article
          className={`home-form fade-in ${showContent ? "visible" : ""}`}
        >
          <LoginForm />
        </article>
      </section>

      <FooterDesktop />
    </main>
  );
}
