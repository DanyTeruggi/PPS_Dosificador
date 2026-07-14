import { useForm } from "react-hook-form";
import { useApi } from "../../utils/apiFetch";
import { useAuth } from "../../context/AuthContext";
import Button from "../Button/Button";
import styles from "./UserForm.module.css";

interface UserFormProps {
  onClose?: () => void;
}

interface FormData {
  nombre: string;
  email: string;
  password: string;
  role: "admin" | "veterinario" | "cliente";

  // Cliente
  /**
   *Al momento de crear un cliente, debe estar activo el veterinario al que se lo asocia.
   * por deafault, se asocia al primer veterinario con id=1.
   */
  razonSocial?: string;
  telefonoCliente?: string;
  contactoPrincipal?: string;

  // Veterinario
  especialidad?: string;
  telefonoVet?: string;
  ubicacionVet?: string;
  fotoPerfil?: FileList;
}

export default function UserForm({ onClose }: UserFormProps) {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const selectedRole = watch("role");
  const isAdmin = user?.role === "admin";

  const onSubmit = async (data: FormData) => {
    try {
      // Veterinario
      if (data.role === "veterinario") {
        
        const resVet = await apiFetch("/admin/veterinarios", {
          method: "POST",
          body: JSON.stringify({
            nombre: data.nombre,
            email: data.email,
            password: data.password,
            especialidad: data.especialidad ?? null,
            telefono: data.telefonoVet ?? null,
            ubicacion: data.ubicacionVet ?? null,
            //fotoPerfil: data.fotoPerfil ?? null,
          }),
        });

        if (!resVet || !resVet.ok) {
          alert("Error creando veterinario");
          return;
        }

        alert("Veterinario creado con éxito");
        onClose?.();
        return;
      }

      // Cliente
      if (data.role === "cliente") {
        const resCliente = await apiFetch("/admin/clientes", {
          method: "POST",
          body: JSON.stringify({
            nombre: data.nombre,
            email: data.email,
            password: data.password,
            razon_social: data.razonSocial ?? "Sin razón social",
            telefono: data.telefonoCliente ?? null,
            contacto_principal: data.contactoPrincipal ?? null,
            veterinario_id: 1,
          }),
        });

        if (!resCliente || !resCliente.ok) {
          alert("Error creando cliente");
          return;
        }

        alert("Cliente creado con éxito");
        onClose?.();
        return;
      }

      // Admin 
      if (data.role === "admin") {
        const resAdmin = await apiFetch("/admin/usuarios", {
          method: "POST",
          body: JSON.stringify({
            nombre: data.nombre,
            email: data.email,
            password: data.password,
            role: "admin",
          }),
        });

        if (!resAdmin || !resAdmin.ok) {
          alert("Error creando administrador");
          return;
        }

        alert("Administrador creado con éxito");
        onClose?.();
        return;
      }

    } catch (error) {
      console.error(error);
      alert("Error de red");
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>

        {/* Email */}
        <div className={styles.group}>
          <label className={styles.label}>Email</label>
          <input type="email" className={styles.input} {...register("email", { required: true })} />
        </div>

        {/* Password */}
        <div className={styles.group}>
          <label className={styles.label}>Contraseña</label>

          <input
            type="password"
            className={styles.input}
            {...register("password", {
              required: "La contraseña es obligatoria",
              minLength: {
                value: 8,
                message: "La contraseña debe tener al menos 8 caracteres",
              },
            })}
            placeholder="Mínimo 8 caracteres"
          />

          {errors.password && (
            <p className={styles.error}>{errors.password.message}</p>
          )}
        </div>


        {/* Nombre */}
        <div className={styles.group}>
          <label className={styles.label}>Nombre</label>
          <input className={styles.input} {...register("nombre", { required: true })} />
        </div>

        {/* Rol dinámico */}
        <div className={styles.group}>
          <label className={styles.label}>Rol</label>
          <select className={styles.input} {...register("role")}>
            <option value="cliente">Productor</option>
            <option value="veterinario">Veterinario</option>
            {isAdmin && <option value="admin">Administrador</option>}
          </select>
        </div>

        {/* Campos de CLIENTE */}
        {selectedRole === "cliente" && (
          <>
            <div className={styles.group}>
              <label className={styles.label}>Razón Social</label>
              <input className={styles.input} {...register("razonSocial")} />
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Teléfono</label>
              <input className={styles.input} {...register("telefonoCliente")} />
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Contacto Principal</label>
              <input className={styles.input} {...register("contactoPrincipal")} />
            </div>
          </>
        )}

        {/* Campos de VETERINARIO */}
        {selectedRole === "veterinario" && (
          <>
            <div className={styles.group}>
              <label className={styles.label}>Especialidad</label>
              <input className={styles.input} {...register("especialidad")} />
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Teléfono</label>
              <input className={styles.input} {...register("telefonoVet")} />
            </div>

            <div className={styles.group}>
              <label className={styles.label}>Ubicación</label>
              <input className={styles.input} {...register("ubicacionVet")} placeholder="Ciudad, Provincia"/>
            </div>

            {/* Pero tu backend no está preparado para recibir archivos, así que por ahora no lo subimos 
                falta implementar POST /api/v1/veterinarios/{id}/foto-perfil
C               ontent-Type: multipart/form-data

             <div className={styles.group}>
              <label className={styles.label}>Subir Foto Perfil</label>
              <input className={styles.input} type="file" {...register("fotoPerfil")} />
            </div> */}
          </>
        )}

        <Button label="Enviar" type="submit" fullWidth={true} />
      </form>
    </div>
  );
}
