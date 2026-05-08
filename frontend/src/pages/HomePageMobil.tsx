import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useIsDesktop";
import "./HomePageMobil.css";

import logoCIVETAN from "../assets/CIVETAN.png";
import logoVEWTERINARIA from "../assets/facVeterinaria.jpeg";
import logoEXACTAS from "../assets/facExactas.png";

export default function HomePageMobile() {

  const isDesktop = useIsDesktop();
  const navigate = useNavigate();

  const [fadeOut, setFadeOut] = useState(false);

  // Redirección automática si cambia el tamaño
  useEffect(() => {
    if (isDesktop) {
      navigate("/home-desktop", { replace: true });
    }
  }, [isDesktop, navigate]);

  // Fade-out + navegación
  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);

      // esperar a que termine la animación (600ms)
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 600);

    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`home-container ${fadeOut ? "fade-out" : ""}`}>

      <h1 className="fw-bold mb-1">Bienvenido</h1>
      <h2 className="mb-4">Control Bacteriológico</h2>

      <img
        src={logoVEWTERINARIA}
        alt="Logo Facultad"
        className="logo-principal"
      />

      <div className="logos-bar">
        <img src={logoCIVETAN} alt="CIVETAN" className="logo-institucion" />
        <img src={logoEXACTAS} alt="Facultad de Exactas" className="logo-institucion" />
      </div>

    </div>
  );
}
