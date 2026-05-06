import Button from "../Button/Button";
import "./LoginForm.css";

export default function LoginForm() {
  return (
    <form
      className="p-4 rounded shadow-sm"
      style={{ width: "90%",
              maxWidth: "380px",
              background: "var(--background-form)",
              borderRadius: "12px",
              }}
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
