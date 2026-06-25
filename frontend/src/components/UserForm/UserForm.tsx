import { useForm } from "react-hook-form";
import { useApi } from "../../utils/apiFetch";
import Button from "../Button/Button";
import styles from "./UserForm.module.css";

interface UserFormProps {
  onClose?: () => void;
}

interface FormData {
  nombre: string;
  email: string;
  password: string;
  rol: "admin" | "veterinario" | "cliente";
  razonSocial?: string;
  establecimientos?: string;
}

export default function UserForm({ onClose }: UserFormProps) {
  const { apiFetch } = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      // 1) Crear usuario base
      const resUser = await apiFetch("/api/v1/admin/usuarios", {
        method: "POST",
        body: JSON.stringify({
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          rol: data.rol
        })
      });

      if (!resUser || !resUser.ok) {
        alert("Error creando usuario");
        return;
      }

      const usuarioCreado = await resUser.json();
      const usuarioId = usuarioCreado.id;

      // 2) Si es veterinario → crear veterinario
      if (data.rol === "veterinario") {
        const resVet = await apiFetch("/api/v1/admin/veterinarios", {
          method: "POST",
          body: JSON.stringify({
            usuario_id: usuarioId
          })
        });

        if (!resVet || !resVet.ok) {
          alert("Error creando veterinario");
          return;
        }
      }

      // 3) Si es cliente → crear cliente + establecimientos
      if (data.rol === "cliente") {
        const resCliente = await apiFetch("/api/v1/admin/clientes", {
          method: "POST",
          body: JSON.stringify({
            usuario_id: usuarioId,
            razon_social: data.razonSocial ?? "Sin razón social",
            veterinario_id: 1 // TODO: seleccionar veterinario real
          })
        });

        if (!resCliente || !resCliente.ok) {
          alert("Error creando cliente");
          return;
        }

        const clienteCreado = await resCliente.json();
        const clienteId = clienteCreado.id;

        // Crear establecimientos separados por coma
        const lista = data.establecimientos?.split(",").map(e => e.trim()) ?? [];

        for (const nombre of lista) {
          const resEst = await apiFetch("/api/v1/admin/establecimientos", {
            method: "POST",
            body: JSON.stringify({
              cliente_id: clienteId,
              nombre
            })
          });

          if (!resEst || !resEst.ok) {
            alert(`Error creando establecimiento: ${nombre}`);
            return;
          }
        }
      }

      alert("Usuario creado con éxito");
      if (onClose) onClose();

    } catch (error) {
      console.error(error);
      alert("Error de red");
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
            className={styles.input}
            {...register("nombre", { required: "El nombre es obligatorio" })}
          />
          {errors.nombre && <p className={styles.error}>{errors.nombre.message}</p>}
        </div>

        {/* Email */}
        <div className={styles.group}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={styles.input}
            {...register("email", { required: "El email es obligatorio" })}
          />
        </div>

        {/* Password */}
        <div className={styles.group}>
          <label className={styles.label}>Contraseña</label>
          <input
            type="password"
            className={styles.input}
            {...register("password", { required: "La contraseña es obligatoria" })}
          />
        </div>

        {/* Rol */}
        <div className={styles.group}>
          <label className={styles.label}>Rol</label>
          <select className={styles.input} {...register("rol")}>
            <option value="cliente">Productor</option>
            <option value="veterinario">Veterinario</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Razón Social (solo cliente) */}
        <div className={styles.group}>
          <label className={styles.label}>Razón Social</label>
          <input className={styles.input} {...register("razonSocial")} />
        </div>

        {/* Establecimientos (solo cliente) */}
        <div className={styles.group}>
          <label className={styles.label}>Establecimientos</label>
          <textarea
            className={styles.input}
            {...register("establecimientos")}
            placeholder="Estancia 1, Estancia 2, ..."
          />
        </div>

        <Button label="Enviar" type="submit" fullWidth={true} />

      </form>
    </div>
  );
}
