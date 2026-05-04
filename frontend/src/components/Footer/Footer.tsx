import { BsHouse, BsPeopleFill, BsXCircle, BsDash } from "react-icons/bs";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer-nav">
      <div className="footer-item">
        <BsHouse size={22} />
        <span>Home</span>
      </div>

      <div className="footer-item">
        <BsPeopleFill size={22} />
        <span>Soporte Técnico</span>
      </div>

      <div className="footer-item">
        <BsXCircle size={22} />
        <span>Cerrar</span>
      </div>

      <div className="footer-item">
        <BsDash size={22} />
        <span>Minimizar</span>
      </div>
    </footer>
  );
}
