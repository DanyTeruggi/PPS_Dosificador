import "./Button.css";

interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

export default function Button({
  label,
  onClick,
  type = "button",
  variant = "primary",
  fullWidth = true, // por defecto ocupa todo el ancho
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`custom-btn ${variant} ${fullWidth ? "full" : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
