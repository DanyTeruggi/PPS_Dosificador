import Button from "../Button/Button";
import "./LoginForm.css";

export default function LoginForm() {
  return (
    <form
      className="login-form-container p-4 rounded shadow-sm"
    >
      {/* Usuario */}
      <div className="mb-3">
        <label className="form-label">Usuario</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ingrese su usuario"
        />
      </div>

      {/* Password */}
      <div className="mb-3">
        <label className="form-label">Contraseña</label>
        <input
          type="password"
          className="form-control"
          placeholder="Ingrese su contraseña"
        />
      </div>

       {<Button 
                label="Ingresar" 
                type="submit" 
                fullWidth={false}
                />}
    </form>
  );
}
