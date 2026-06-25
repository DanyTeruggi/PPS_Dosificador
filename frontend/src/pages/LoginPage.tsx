import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm/LoginForm";

import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { token, login } = useAuth();
  const navigate = useNavigate();

  // Si ya está logueado → ir a SmartHomeRedirect
  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  const handleLogin = async (email: string, password: string) => {
    const ok = await login(email, password);

    if (!ok) return; // LoginForm ya muestra error

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.rol === "admin") {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/home-mobile", { replace: true });
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Centro de Control Bacteriológico</h1>

      <LoginForm onLogin={handleLogin} />
    </main>
  );
}
