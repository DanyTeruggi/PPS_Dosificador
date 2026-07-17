import type { ReactNode } from "react";

import Button from "../../components/Button/Button";
import styles from "./LandingMobile.module.css";

type LandingHeaderProps = {
  title: string;
  onBack?: () => void;
  rightAction?: ReactNode;
};

/**
 * Encabezado reutilizable con boton para volver y titulo centrado.
 * rightAction es opcional: por ejemplo, puede recibir un boton de resumen.
 */
export default function LandingHeader({
  title,
  onBack,
  rightAction,
}: LandingHeaderProps) {
  return (
    <section className={styles.header}>
      <div className={styles.action}>
        {onBack && (
          <Button
            label="Volver"
            variant="back"
            fullWidth={false}
            onClick={onBack}
          />
        )}
      </div>

      <h1 className={styles.title} title={title}>
        {title}
      </h1>

      {/* Mantiene el titulo centrado aunque no haya una accion a la derecha. */}
      <div className={styles.action}>{rightAction ?? null}</div>
    </section>
  );
}
