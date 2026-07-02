import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm/LoginForm";
import Button from "../components/Button/Button";

import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();

  // Si ya está logueado → ir al redirect por rol
  useEffect(() => {
    if (token) {
      navigate("/home", { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (email: string, password: string) => {
    const ok = await login(email, password);
    if (!ok) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.role === "admin") {
      navigate("/dashboard", { replace: true });
    } else if (user.role === "veterinario") {
      navigate("/veterinarios/dashboard", { replace: true });
    } else {
      navigate("/clientes/dashboard", { replace: true });
    }
  };

  const handleNuevoUsuario = () => {
    navigate("/nuevo-usuario");
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Centro de Control Bacteriológico</h1>

      <LoginForm onLogin={handleLogin} />

      <div className={styles.actions}>
        <Button
          label="Nuevo Usuario"
          variant="hero"
          fullWidth={true}
          onClick={handleNuevoUsuario}
        />
      </div>
    </main>
  );
}
