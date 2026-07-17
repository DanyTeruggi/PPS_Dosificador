import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/LoginForm/LoginForm";
import Button from "../components/Button/Button";

import styles from "./LoginPage.module.css";
import Footer from "../components/Footer/Footer";
import logoVet from "../assets/facVeterinaria.jpeg";


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
    if (!ok) throw new Error("AUTH_FAILED");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    

    if (user.role === "admin") { 
      navigate("/dashboard", { replace: true });
    } else if (user.role === "veterinario") {
      navigate("/veterinarios/clientes", { replace: true });
    } else {
      navigate("/cliente/establecimientos", { replace: true });
    }


  };

  const handleNuevoUsuario = () => {
    navigate("/nuevo-usuario");
  };

  return (
    <main className={styles.container}>
        <img
        src={logoVet}
        alt="Logo"
        className={styles.logo}
      />
      <h1 className={styles.title}>Ingresa tus credenciales</h1>

      <LoginForm onLogin={handleLogin} />
      
        <div className={styles.actions}>
          <p className={styles.title}>Registrarte aquí:</p>
          <Button
            label=""
            variant="add"
            fullWidth={true}
            onClick={handleNuevoUsuario}
          />
        </div>
      
      <Footer />
    </main>
  );
}
