import { useForm } from "react-hook-form";
import type { User } from "../../types/User";
import Button from "../Button/Button";
import "./UserForm.css";

export default function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>();

  const onSubmit = (data: User) => {
    console.log("Datos enviados:", data);

    // Aquí luego vas a hacer:
    // fetch("http://localhost:3000/api/usuarios", { method: "POST", body: JSON.stringify(data) })
  };
  
return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">

          <form onSubmit={handleSubmit(onSubmit)} 
            className="p-3 border rounded shadow-sm"
            style={{ background: "var(--background-form)" }}
              >
            <h2 className="mb-4 text-center">Registro de Usuario</h2>

            {/* Nombre */}
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                {...register("nombre", { required: "El nombre es obligatorio" })}
              />
              {errors.nombre && <div className="invalid-feedback">{errors.nombre.message}</div>}
            </div>

            {/* Apellido */}
            <div className="mb-3">
              <label className="form-label">Apellido</label>
              <input
                className={`form-control ${errors.apellido ? "is-invalid" : ""}`}
                {...register("apellido", { required: "El apellido es obligatorio" })}
              />
              {errors.apellido && <div className="invalid-feedback">{errors.apellido.message}</div>}
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                {...register("email", {
                  required: "El email es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Formato de email inválido",
                  },
                })}
              />
              {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
            </div>

            {/* Celular */}
            <div className="mb-3">
              <label className="form-label">Número de celular</label>
              <input
                className={`form-control ${errors.celular ? "is-invalid" : ""}`}
                {...register("celular", { required: "El celular es obligatorio" })}
              />
              {errors.celular && <div className="invalid-feedback">{errors.celular.message}</div>}
            </div>

            {/* Razón Social */}
            <div className="mb-3">
              <label className="form-label">Razón Social</label>
              <input className="form-control" {...register("razonSocial")} />
            </div>

            {/* Username */}
            <div className="mb-3">
              <label className="form-label">Nombre de usuario</label>
              <input
                className={`form-control ${errors.userName ? "is-invalid" : ""}`}
                {...register("userName", {
                  required: "El nombre de usuario es obligatorio",
                  minLength: {
                    value: 4,
                    message: "Debe tener al menos 4 caracteres",
                  },
                })}
              />
              {errors.userName && <div className="invalid-feedback">{errors.userName.message}</div>}
            </div>

            {<Button 
            label="Registrar" 
            type="submit" 
            fullWidth={false}
            />}

          </form>

        </div>
      </div>
    </div>
  );


}
