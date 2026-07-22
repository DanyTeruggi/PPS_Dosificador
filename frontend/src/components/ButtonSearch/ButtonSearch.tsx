import type { ButtonHTMLAttributes } from "react";
import styles from "./ButtonSearch.module.css";

type ButtonSearchVariant = "clear" | "filter" | "primary" | "secondary";

type ButtonSearchProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: ButtonSearchVariant;
  active?: boolean;
};

export default function ButtonSearch({
  variant,
  active = false,
  className = "",
  type = "button",
  ...props
}: ButtonSearchProps) {
  const classes = [styles.button, styles[variant], active ? styles.active : "", className]
    .filter(Boolean)
    .join(" ");

  return <button {...props} type={type} className={classes} />;
}
