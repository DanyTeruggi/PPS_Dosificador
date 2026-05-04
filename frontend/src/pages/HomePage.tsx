import Footer from "../components/Footer/Footer";


import logoCIVETAN from "../assets/CIVETAN.png";
import logoVEWTERINARIA from "../assets/facVeterinaria.jpeg";


export default function HomePage() {
  return (
    <>
       <div
        className="d-flex flex-column justify-content-center align-items-center text-center"
        style={{ minHeight: "100vh", paddingBottom: "80px" }}
      >
        {/* Títulos */}
        <h1 className="fw-bold mb-1">Bienvenido</h1>
        <h5 className="mb-4">Aplicación de Monitoreo Bacteriológico</h5>

        {/* Logo principal */}
        <img
          src={logoVEWTERINARIA}
          alt="Logo Facultad"
          style={{
            width: "180px",
            height: "180px",
            objectFit: "contain",
            marginBottom: "20px",
          }}
        />

        {/* Logos institucionales */}
        <div className="d-flex justify-content-center align-items-center gap-4 mb-2">
        <img
            src={logoCIVETAN}
            alt="CIVETAN"
            style={{ height: "60px", width: "auto" }}
            />
        </div>


      </div>
      <Footer />
    </>
  );
}
