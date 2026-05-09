import { useLocation } from "react-router-dom";
import type { Establecimiento } from "../types/Role";
import BebederoCard from "../components/BebederoCard/BebederoCard";
import Footer from "../components/Footer/Footer";
import styles from "./LandingPageEstablecimiento.module.css";
import type { Bebedero } from "../types/Role";


export default function LandingPageEstablecimiento() {
  const { state } = useLocation();
  const establecimiento = state?.establecimiento as Establecimiento;

  if (!establecimiento) {
    return <p>Error: no se encontró el establecimiento</p>;
  }

  // AGRUPAR POR idBebedero
const bebederosAgrupados: Record<number, Bebedero[]> = {};

establecimiento.bebederos.forEach((item) => {
  if (!bebederosAgrupados[item.idBebedero]) {
    bebederosAgrupados[item.idBebedero] = [];
  }
  bebederosAgrupados[item.idBebedero].push(item);
});


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{establecimiento.nombre}</h1>

      <div className={styles.listContainer}>
        
        {Object.values(bebederosAgrupados).map((mediciones, index) => (
        <BebederoCard key={index} bebedero={mediciones} />
      ))}
      </div>

      <Footer />
    </div>
  );
}
