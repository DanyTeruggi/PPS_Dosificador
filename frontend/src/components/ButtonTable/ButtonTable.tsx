import type { ButtonHTMLAttributes } from "react";
import styles from "./ButtonTable.module.css";

type ButtonTableVariant = "edit" | "delete";

type ButtonTableProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonTableVariant;
};

export default function ButtonTable({ variant, className = "", type = "button", ...props }: ButtonTableProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");
  return <button {...props} type={type} className={classes} />;
}
