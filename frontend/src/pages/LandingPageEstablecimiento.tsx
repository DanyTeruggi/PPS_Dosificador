import { useLocation, useNavigate } from "react-router-dom";
import type { Establecimiento } from "../types/Role";
import BebederoCard from "../components/BebederoCard/BebederoCard";
import styles from "./LandingPageEstablecimiento.module.css";
import type { Bebedero } from "../types/Role";

export default function LandingPageEstablecimiento() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const establecimiento = state?.establecimiento as Establecimiento;

  if (!establecimiento) {
    return <p>Error: no se encontró el establecimiento</p>;
  }

  const bebederosAgrupados: Record<number, Bebedero[]> = {};
  establecimiento.bebederos.forEach((item) => {
    if (!bebederosAgrupados[item.idBebedero]) {
      bebederosAgrupados[item.idBebedero] = [];
    }
    bebederosAgrupados[item.idBebedero].push(item);
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/role-landing")}
        >
          &lt;
        </button>
        <h1 className={styles.title}>{establecimiento.nombre}</h1>
      </header>

      <div className={styles.listContainer}>
        {Object.values(bebederosAgrupados).map((mediciones, index) => (
          <BebederoCard key={index} bebedero={mediciones} />
        ))}
      </div>

    </div>
  );
}
