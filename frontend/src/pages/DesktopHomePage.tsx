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
        className="text-center d-flex flex-column align-items-center"
        style={{
          width: "100%",
          backgroundImage: `url(${ImgBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          padding: "60px 0",
         
        }}
      >
        {/* TÍTULO con animación */}
        <h1
          className={`fw-bold mb-4 fade-in ${showContent ? "visible" : ""}`}
          style={{ fontSize: "42px",
            paddingBottom: "20px",
           }}
        >
          Centro de Monitoreo Bacteriológico
        </h1>

        {/* FORM con animación */}
        <article
          className={`fade-in ${showContent ? "visible" : ""}`}
          style={{
            width: "100%",
            maxWidth: "420px",
            padding: "20px",
            borderRadius: "12px",
           
          }}
        >
          <LoginForm />
        </article>
      </section>

      <FooterDesktop />
    </main>
  );
}
