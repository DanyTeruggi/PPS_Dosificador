import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { HiOutlineUserPlus } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";

import hidePasswordIcon from "../../assets/esconder.png";
import showPasswordIcon from "../../assets/mostrar.png";
import { useAuth } from "../../context/useAuth";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import { getHomeByRole } from "../../utils/roleHome";
import styles from "./LoginPage.module.css";


export default function LoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const isDesktop = useIsDesktop();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");

  useEffect(() => {
    if (!showRecoveryModal) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowRecoveryModal(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showRecoveryModal]);

  function openRecoveryModal() {
    setRecoveryEmail(email.trim());
    setShowRecoveryModal(true);
  }

  function handleRecoverySubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowRecoveryModal(false);
    toast("La recuperación de contraseña estará disponible próximamente.");
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setFieldErrors({});

      const result = await login(email.trim(), password);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setErrorMessage(result.message ?? "No se pudo iniciar sesión.");
        return;
      }

      const user = JSON.parse(sessionStorage.getItem("user") ?? "{}");
      if (user.role === "admin") {
        if (isDesktop) {
          navigate(getHomeByRole(user.role), { replace: true });
          return;
        }

        logout();
        setErrorMessage(
          "El panel de administración está disponible únicamente en la versión de escritorio.",
        );
        return;
      }

      navigate(getHomeByRole(user.role), { replace: true });
    } catch (loginError) {
      console.error(loginError);
      setErrorMessage("Ocurrió un problema de comunicación. Intentá nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 id="login-title" className={styles.title}>Iniciá sesión para continuar</h1>
          <div className={styles.introDivider} aria-hidden="true">
            <span />
            <i />
            <span />
          </div>
        </header>

        <section className={styles.card} aria-labelledby="login-title">
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
              {fieldErrors.email && <p className={styles.error}>{fieldErrors.email}</p>}
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
              {fieldErrors.password && <p className={styles.error}>{fieldErrors.password}</p>}
            </div>

            {errorMessage && (
              <p className={styles.error} role="alert">{errorMessage}</p>
            )}

            <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className={styles.optionDivider} aria-hidden="true">
            <span />
            <b>o</b>
            <span />
          </div>

          <button className={styles.forgotButton} type="button" onClick={openRecoveryModal}>
            ¿Olvidaste tu contraseña?
          </button>
        </section>

        <div className={styles.register}>
          <p className={styles.registerText}>¿No tenés una cuenta?</p>
          <button className={styles.registerButton} type="button" onClick={() => navigate("/nuevo-usuario")}>
            <HiOutlineUserPlus className={styles.registerIcon} aria-hidden="true" />
            Crear cuenta
          </button>
        </div>
      </div>

      {showRecoveryModal && (
        <div className={styles.modalOverlay} role="presentation" onClick={() => setShowRecoveryModal(false)}>
          <section
            aria-labelledby="recovery-title"
            aria-modal="true"
            className={styles.modal}
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="recovery-title">Recuperar contraseña</h2>
            <p>Ingresá el correo asociado a tu cuenta.</p>

            <form className={styles.recoveryForm} onSubmit={handleRecoverySubmit}>
              <label className={styles.label} htmlFor="recovery-email">Correo electrónico</label>
              <input
                className={styles.input}
                id="recovery-email"
                name="recovery-email"
                type="email"
                autoComplete="email"
                placeholder="nombre@ejemplo.com"
                value={recoveryEmail}
                onChange={(event) => setRecoveryEmail(event.target.value)}
                required
                autoFocus
              />

              <div className={styles.modalActions}>
                <button
                  className={styles.registerButtonCancel}
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                >
                  Cancelar
                </button>
                <button className={styles.submitButton} type="submit">Continuar</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
