import { useState } from "react";
import styles from "./LoginForm.module.css";
import Button from "../Button/Button";

// 1) Definimos el tipo del prop que recibimos desde LoginPage
interface LoginFormProps {
  onLogin: (userName: string, password: string) => Promise<void>;
}

// 2) Agregamos el prop al componente
export default function LoginForm({ onLogin }: LoginFormProps) {

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // 3) Este handleSubmit ahora NO navega ni valida mocks
  //    Solo llama a onLogin() que viene desde LoginPage
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Llamamos al backend a través de LoginPage
      await onLogin(userName, password);

      // Si onLogin falla, cae al catch
    } catch (error) {
      const errorCode = error instanceof Error ? error.message : "AUTH_FAILED";

      if (errorCode === "UNAUTHORIZED_PROFILE") {
        setErrorMsg("Perfil no autorizado");
        return;
      }

      setErrorMsg("Usuario o contraseña incorrectos");
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>

      {/* Usuario */}
      <div className={styles.group}>
        <label className={styles.label}>Usuario</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Ingrese su usuario"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>

      {/* Password */}
      <div className={styles.group}>
        <label className={styles.label}>Contraseña</label>
        <input
          type="password"
          className={styles.input}
          placeholder="Ingrese su contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Error */}
      {errorMsg && <p className={styles.error}>{errorMsg}</p>}

      <Button 
        label="Ingresar" 
        type="submit" 
        fullWidth={false}
      />
    </form>
  );
}
