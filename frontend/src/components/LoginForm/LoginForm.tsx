import styles from "./LoginForm.module.css";
import Button from "../Button/Button";

export default function LoginForm() {
  return (
    <form className={styles.form}>

      {/* Usuario */}
      <div className={styles.group}>
        <label className={styles.label}>Usuario</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Ingrese su usuario"
        />
      </div>

      {/* Password */}
      <div className={styles.group}>
        <label className={styles.label}>Contraseña</label>
        <input
          type="password"
          className={styles.input}
          placeholder="Ingrese su contraseña"
        />
      </div>

      <Button 
        label="Ingresar" 
        type="submit" 
        fullWidth={false}
      />
    </form>
  );
}
