import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  message: string;
};

/** Informa que la consulta fue correcta, pero no hay datos asociados. */
export default function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className={styles.emptyState} role="status">
      {message}
    </div>
  );
}

