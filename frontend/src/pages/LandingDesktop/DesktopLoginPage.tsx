import { useState } from "react";
import { useNavigate } from "react-router-dom";
import hidePasswordIcon from "../../assets/esconder.png";
import showPasswordIcon from "../../assets/mostrar.png";
import Button from "../../components/Button/Button";
import ButtonX from "../../components/ButtonX/ButtonX";
import { useAuth } from "../../context/useAuth";
import styles from "./DesktopLoginPage.module.css";


export default function DesktopLoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setFieldErrors({});

      const result = await login(email.trim(), password);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setErrorMessage(result.message ?? "Correo o contraseña incorrectos.");
        return;
      }

      const user = JSON.parse(sessionStorage.getItem("user") ?? "{}");
      if (user.role !== "admin") {
        // Evita dejar abierta una sesion sin acceso al panel administrativo.
        logout();
        setErrorMessage("Este acceso está disponible únicamente para administradores.");
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (loginError) {
      console.error(loginError);
      setErrorMessage("Ocurrió un problema de comunicación. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="desktop-login-title">
        <div className={styles.titleWrapper}>
          <h1 id="desktop-login-title" className={styles.title}>Monitoreo Bacteriológico</h1>
        </div>

        <Button
          label="INGRESAR"
          variant="hero"
          fullWidth={false}
          onClick={() => setShowLogin(true)}
        />
      </section>

      {showLogin && (
        <div className={styles.overlay} onClick={() => setShowLogin(false)}>
          <section
            className={styles.card}
            aria-labelledby="admin-access-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.closeAction}>
              <ButtonX
                ariaLabel="Cerrar formulario"
                onClick={() => setShowLogin(false)}
              />
            </div>

            <h2 id="admin-access-title" className={styles.formTitle}>Acceso administrativo</h2>
            <p className={styles.formDescription}>Ingresá tus credenciales para continuar.</p>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="desktop-email">Correo electrónico</label>
                <input
                  className={styles.input}
                  id="desktop-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isSubmitting}
                  required
                />
                {fieldErrors.email && <p className={styles.error}>{fieldErrors.email}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="desktop-password">Contraseña</label>
                <div className={styles.passwordWrapper}>
                  <input
                    className={styles.passwordInput}
                    id="desktop-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    className={styles.passwordButton}
                    type="button"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={showPassword}
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
                {fieldErrors.password && <p className={styles.error}>{fieldErrors.password}</p>}
              </div>

              {errorMessage && <p className={styles.error} role="alert">{errorMessage}</p>}

              <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
