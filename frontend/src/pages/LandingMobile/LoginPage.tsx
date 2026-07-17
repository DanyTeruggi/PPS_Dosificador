import { useState } from "react";
import { useNavigate } from "react-router-dom";

import hidePasswordIcon from "../../assets/esconder.png";
import showPasswordIcon from "../../assets/mostrar.png";
import { useAuth } from "../../context/AuthContext";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import styles from "./LoginPage.module.css";

/** Nueva pagina de ingreso optimizada para celular. */
export default function LoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const isDesktop = useIsDesktop();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const authenticated = await login(email.trim(), password);
      if (!authenticated) {
        setErrorMessage("No se pudo iniciar sesion. Revisa tus datos y tu conexion.");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") ?? "{}");
      if (user.role === "admin") {
        if (isDesktop) {
          navigate("/dashboard", { replace: true });
          return;
        }

        // El dashboard no esta preparado para celulares. Cerramos la sesion
        // para evitar que una recarga redirija al administrador al panel.
        logout();
        setErrorMessage(
          "El panel de administración está disponible únicamente en la versión de escritorio. Ingresá a www.",
        );
        return;
      }

      if (user.role === "veterinario") {
        navigate("/veterinarios/clientes", { replace: true });
        return;
      }

      navigate("/cliente/establecimientos", { replace: true });
    } catch (loginError) {
      console.error(loginError);
      setErrorMessage("Ocurrio un problema de comunicacion. Intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <header className={styles.header}>
          <h1 id="login-title" className={styles.title}>Ingresa a tu cuenta</h1>
          <p className={styles.subtitle}>Completa tus datos para continuar.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-email">Correo electrónico</label>
            <input
              className={styles.input}
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="nombre@ejemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="login-password">Contraseña</label>
            <div className={styles.passwordWrapper}>
              <input
                className={styles.passwordInput}
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                required
              />
              <button
                className={styles.showPassword}
                type="button"
                aria-pressed={showPassword}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                onClick={() => setShowPassword((current) => !current)}
              >
                <img
                  className={styles.passwordIcon}
                  src={showPassword ? hidePasswordIcon : showPasswordIcon}
                  alt=""
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className={styles.error} role="alert">{errorMessage}</p>
          )}

          <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className={styles.register}>
          <p className={styles.registerText}>¿No tenés una cuenta?</p>
          <button className={styles.registerButton} type="button" onClick={() => navigate("/nuevo-usuario")}>
            Crear cuenta
          </button>
        </div>

        {/* Pendiente: centralizar la redireccion por rol al conectar esta pagina. */}
      </section>
    </main>
  );
}
