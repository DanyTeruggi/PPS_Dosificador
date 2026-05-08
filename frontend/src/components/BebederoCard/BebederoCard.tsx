import type { Bebedero } from "../../types/Role";
import styles from "./BebederoCard.module.css";

interface BebederoCardProps {
  bebedero: Bebedero[];
}

export default function BebederoCard({ bebedero }: BebederoCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.horizontalScroll}>
        {bebedero.map((medicion, index) => (
          <div key={index} className={styles.block}>
            <div className={styles.imageWrapper}>
              <img src={medicion.imagen} alt={medicion.numeroBebedero} />
            </div>

            <h3 className={styles.title}>{medicion.numeroBebedero}</h3>
            <p><strong>Ubicación:</strong> {medicion.ubicacion}</p>
            <p><strong>Medición:</strong> {medicion.fechaMedicion} {medicion.horaMedicion}</p>
            <p><strong>Cobertura:</strong> {medicion.cobertura}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
