import { useForm } from "react-hook-form";
import type { User } from "../../types/User";
import Button from "../Button/Button";
import styles from "./UserForm.module.css";


interface UserFormProps {
  onClose?: () => void;
}

export default function UserForm({ onClose }: UserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>();

  const onSubmit = async (data: User) => {
    try {
      const response = await fetch("/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Respuesta del backend:", result);
        alert("Usuario registrado con éxito");
        // Aquí podrías redirigir al usuario o limpiar el formulario
        if (onClose) onClose();

      } else {
        // Manejar respuestas de error del servidor
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        alert(`Error al registrar el usuario: ${errorData.message || "Intente de nuevo"}`);
      }
    } catch (error) {
      // Manejar errores de red
      console.error("Error de red:", error);
      alert("Error de red, no se pudo conectar con el servidor.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>

        <h2 className={styles.title}>Registro de Usuario</h2>

        {/* Nombre */}
        <div className={styles.group}>
          <label className={styles.label}>Nombre</label>
          <input
            className={`${styles.input} ${errors.nombre ? styles.invalid : ""}`}
            {...register("nombre", { required: "El nombre es obligatorio" })}
          />
          {errors.nombre && <p className={styles.error}>{errors.nombre.message}</p>}
        </div>

        {/* Apellido */}
        <div className={styles.group}>
          <label className={styles.label}>Apellido</label>
          <input
            className={`${styles.input} ${errors.apellido ? styles.invalid : ""}`}
            {...register("apellido", { required: "El apellido es obligatorio" })}
          />
          {errors.apellido && <p className={styles.error}>{errors.apellido.message}</p>}
        </div>

        {/* Email */}
        <div className={styles.group}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={`${styles.input} ${errors.email ? styles.invalid : ""}`}
            {...register("email", {
              required: "El email es obligatorio",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Formato de email inválido",
              },
            })}
          />
          {errors.email && <p className={styles.error}>{errors.email.message}</p>}
        </div>

        {/* Celular */}
        <div className={styles.group}>
          <label className={styles.label}>Número de celular</label>
          <input
            className={`${styles.input} ${errors.celular ? styles.invalid : ""}`}
            {...register("celular", { required: "El celular es obligatorio" })}
          />
          {errors.celular && <p className={styles.error}>{errors.celular.message}</p>}
        </div>

        {/* Razón Social */}
        <div className={styles.group}>
          <label className={styles.label}>Razón Social</label>
          <input
            className={styles.input}
            {...register("razonSocial")}
          />
        </div>

        {/* CUIT */}
        <div className={styles.group}>
          <label className={styles.label}>CUIT</label>
          <input
            className={`${styles.input} ${errors.cuit ? styles.invalid : ""}`}
            {...register("cuit", { required: "El CUIT es obligatorio" })}
          />
          {errors.cuit && <p className={styles.error}>{errors.cuit.message}</p>}
        </div>

        {/* Username */}
        <div className={styles.group}>
          <label className={styles.label}>Nombre de usuario</label>
          <input
            className={`${styles.input} ${errors.userName ? styles.invalid : ""}`}
            {...register("userName", {
              required: "El nombre de usuario es obligatorio",
              minLength: {
                value: 4,
                message: "Debe tener al menos 4 caracteres",
              },
            })}
          />
          {errors.userName && <p className={styles.error}>{errors.userName.message}</p>}
        </div>

        {/* Establecimientos */}
        <div className={styles.group}>
          <label className={styles.label}>Establecimientos</label>
          <textarea
            className={`${styles.input} ${errors.establecimientos ? styles.invalid : ""}`}
            {...register("establecimientos", { required: "La lista de establecimientos es obligatoria" })}
            placeholder="Ingrese los establecimientos separados por comas"
          />
          {errors.establecimientos && <p className={styles.error}>{errors.establecimientos.message}</p>}
        </div>

        <Button label="Enviar" type="submit" fullWidth={true} />

      </form>
    </div>
  );
}
