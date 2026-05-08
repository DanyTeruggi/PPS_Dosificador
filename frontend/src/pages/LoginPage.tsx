import LoginForm from "../components/LoginForm/LoginForm";
import "./LoginPage.css";

export default function LoginPage() {
  return (
    <>
      <div className="loginpage-container d-flex flex-column justify-content-center align-items-center text-center">
        <h2 className="fw-bold mb-4">Ingresar Credenciales</h2>

        <LoginForm />
      </div>
    </>
  );
}
