import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginForm.module.css";
import Button from "../Button/Button";

export default function LoginForm() {
  const navigate = useNavigate();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Traigo los usuarios del mock
      const response = await fetch("/mock/usuarios.json");
      const usuarios = await response.json();

      // Busco coincidencia
      const user = usuarios.find(
        (u: any) =>
          u.userName === userName.trim() &&
          u.password === password.trim()
      );

      if (!user) {
        setErrorMsg("Usuario o contraseña incorrectos");
        return;
      }

      // Navegamos a RoleLanding con datos reales
      navigate("/role-landing", {
        state: {
          nombre: user.nombre,
          rol: user.rol
        }
      });

    } catch (error) {
      setErrorMsg("Error al procesar el login");
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
