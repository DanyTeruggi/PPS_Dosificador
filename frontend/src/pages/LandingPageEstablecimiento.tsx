

import { useLocation } from "react-router-dom";
import type { Establecimiento } from "../types/Role";
import BebederoCard from "../components/BebederoCard/BebederoCard"
import Footer from "../components/Footer/Footer";
import styles from "./LandingPageEstablecimiento.module.css";

const { state } = useLocation();
const establecimiento = state?.establecimiento as Establecimiento;


export default function LandingPageEstablecimiento() {
  const { state } = useLocation();
  const establecimiento = state?.establecimiento as Establecimiento;

  if (!establecimiento) return <p>Error: no se encontró el establecimiento</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{establecimiento.nombre}</h1>

      <div className={styles.scrollContainer}>
        {establecimiento.bebederos.map((b) => (
          <BebederoCard key={b.idBebedero} bebedero={b} />
        ))}
      </div>

      <Footer />
    </div>
  );
}
