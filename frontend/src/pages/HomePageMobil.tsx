import "./HomePageMobil.css";

import logoCIVETAN from "../assets/CIVETAN.png";
import logoVEWTERINARIA from "../assets/facVeterinaria.jpeg";
import logoEXACTAS from "../assets/facExactas.png";

export default function HomePage() {
  return (
    <>
      <div className="home-container">
  {/* Títulos */}
  <h1 className="fw-bold mb-1">Bienvenido</h1>
  <h2 className="mb-4">Control Bacteriológico</h2>

  {/* Logo principal */}
  <img
    src={logoVEWTERINARIA}
    alt="Logo Facultad"
    className="logo-principal"
  />

  {/* Barra de logos institucionales */}
  <div className="logos-bar">
    <img src={logoCIVETAN} alt="CIVETAN" className="logo-institucion" />
    <img src={logoEXACTAS} alt="Facultad de Exactas" className="logo-institucion" />
  </div>
</div>

    </>
  );
}
