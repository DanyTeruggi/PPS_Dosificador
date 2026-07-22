import styles from "./Button.module.css";
import { HiOutlineArrowLeft, HiOutlineChartBarSquare } from "react-icons/hi2";

// Importá tus imágenes
import addIcon from "../../assets/add.png";
interface ButtonProps {
  label: string;
  ariaLabel?: string;
  //onClick?: () => void;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "tertiary" |
            "hero" | "back" | "dashboard" | "selected"  | "selectedActive" | 
            "danger" | "add";
  fullWidth?: boolean;
}

// Mapa de variantes → íconos
const vectorIconMap = {
  back: HiOutlineArrowLeft,
  dashboard: HiOutlineChartBarSquare,
} as const;

const imageIconMap: Record<string, string> = {
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
  const VectorIcon = variant === "back" || variant === "dashboard"
    ? vectorIconMap[variant]
    : null;
  const iconSrc = imageIconMap[variant];
  const hasIcon = Boolean(VectorIcon || iconSrc);

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel ?? (hasIcon ? label : undefined)}
      className={`
    ${styles.button}
    ${styles[variant]}
    ${hasIcon ? styles.iconButton : ""}
    ${fullWidth ? styles.full : ""}
  `}
    >
      {VectorIcon ? (
        <VectorIcon aria-hidden="true" className={styles.vectorIcon} />
      ) : iconSrc ? (
        <img src={iconSrc} alt={variant} className={styles.icon} />
      ) : (
        label
      )}
    </button>

  );
}
