
import type { Bebedero } from "../../types/Role";
import styles from "./BebederoCard.module.css";


interface BebederoCardProps {
  bebedero: Bebedero;
}

export default function BebederoCard({ bebedero }: BebederoCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.imagePlaceholder}>
        <img src={bebedero.imagen} alt={bebedero.numeroBebedero} />
      </div>

      <h3 className={styles.title}>{bebedero.numeroBebedero}</h3>

      <p><strong>Ubicación:</strong> {bebedero.ubicacion}</p>
      <p><strong>Medición:</strong> {bebedero.fechaMedicion} {bebedero.horaMedicion}</p>
      <p><strong>Cobertura:</strong> {bebedero.cobertura}</p>
    </div>
  );
}
