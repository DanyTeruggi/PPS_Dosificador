import styles from "./Button.module.css";

// Importá tus imágenes
import backIcon from "../../assets/back.png";
import dashboardIcon from "../../assets/dashboard.png";
import addIcon from "../../assets/add.png";
interface ButtonProps {
  label: string;
  ariaLabel?: string;
  //onClick?: () => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "tertiary" |
            "hero" | "back" | "dashboard" | "selected"  | "selectedActive" | 
            "danger" | "add" | "close";
  fullWidth?: boolean;
}

// Mapa de variantes → íconos
const iconMap: Record<string, string> = {
  back: backIcon,
  dashboard: dashboardIcon,
  add: addIcon, 
};

export default function Button({
  label,
  ariaLabel,
  onClick,
  type = "button",
  variant = "primary",
  fullWidth = true,
}: ButtonProps) {
  const iconSrc = iconMap[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`
    ${styles.button}
    ${styles[variant]}
    ${iconSrc ? styles.iconButton : ""}
    ${fullWidth ? styles.full : ""}
  `}
    >
      {iconSrc ? (
        <img src={iconSrc} alt={variant} className={styles.icon} />
      ) : (
        label
      )}
    </button>

  );
}
