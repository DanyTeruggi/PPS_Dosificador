import styles from "./LoginPage.module.css";
import LoginForm from "../components/LoginForm/LoginForm";

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Ingresar Credenciales</h2>
      <LoginForm />
    </div>
  );
}
