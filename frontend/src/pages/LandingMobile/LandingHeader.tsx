import type { ReactNode } from "react";
import Button from "../../components/Button/Button";
import styles from "./LandingMobile.module.css";

type LandingHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onBack?: () => void;
  rightAction?: ReactNode;
};

/**
 * Encabezado reutilizable con boton para volver y titulo centrado.
 * rightAction es un opcional: por ejemplo, puede recibir un boton de resumen.
 */
export default function LandingHeader({
  title,
  subtitle,
  icon,
  onBack,
  rightAction,
}: LandingHeaderProps) {
  const hasSideActions = Boolean(onBack || rightAction);

  return (
    <section className={styles.header}>
      {hasSideActions && (
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
      )}

      <div className={`${styles.titleGroup} ${!hasSideActions ? styles.titleGroupFull : ""}`}>
        {icon && <span className={styles.headerIcon} aria-hidden="true">{icon}</span>}
        <div className={styles.titleContent}>
          <h1 className={styles.title} title={title}>
            {title}
          </h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      {/* Mantiene el titulo centrado aunque no haya una accion a la derecha. */}
      {hasSideActions && <div className={styles.action}>{rightAction ?? null}</div>}
    </section>
  );
}
