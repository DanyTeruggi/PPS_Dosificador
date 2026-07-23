import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  message: string;
};

/**
 * Muestra un mensaje cuando la consulta finalizó correctamente,
 * pero no encontró elementos y devolvió una colección vacía (`[]`).
 */

export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className={styles.emptyState} role="status">
      {message}
    </div>
  );
}

