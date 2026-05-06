import Footer from "../components/Footer/Footer";
import LoginForm from "../components/LoginForm/LoginForm";

export default function LoginPage() {
  return (
    <>
      <div
        className="d-flex flex-column justify-content-center align-items-center text-center"
        style={{ minHeight: "100vh", paddingBottom: "80px" }}
      >
        <h2 className="fw-bold mb-4">Ingresar Credenciales</h2>

        <LoginForm />
      </div>

      <Footer />
    </>
  );
}
