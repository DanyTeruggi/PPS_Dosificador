import { HiXMark } from "react-icons/hi2";
import styles from "./ButtonX.module.css";

interface ButtonXProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function ButtonX({
  onClick,
  className,
  ariaLabel = "Cerrar",
  disabled = false,
}: ButtonXProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${className ?? ""}`}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      <HiXMark className={styles.icon} aria-hidden="true" focusable="false" />
    </button>
  );
}
