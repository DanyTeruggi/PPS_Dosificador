import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm/LoginForm";
import Button from "../components/Button/Button";

import styles from "./LoginPage.module.css";
import Footer from "../components/Footer/Footer";

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
    console.log("USER-id:", user.id);

    if (user.role === "admin") { console.log("USER:", user);
      navigate("/dashboard", { replace: true });
    } else if (user.role === "veterinario") {
      navigate("/veterinarios/dashboard", { replace: true });
    } else {
      navigate("/cliente/establecimientos", { replace: true });
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
          label="Registrarme"
          variant="hero"
          fullWidth={true}
          onClick={handleNuevoUsuario}
        />
      </div>
      <Footer />
    </main>
  );
}
