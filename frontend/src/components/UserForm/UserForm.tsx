import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { useApi } from "../../utils/apiFetch";
import { getApiErrorMessage } from "../../utils/apiError";
import type {
  AdminCreateRequest,
  ClienteCreateRequest,
  ClienteRegisterRequest,
  VeterinarioCreateRequest,
  VeterinarioRegisterRequest,
} from "../../types/ApiContracts";

import Button from "../Button/Button";
import desktopStyles from "./UserFormDesktop.module.css";
import mobileStyles from "./UserFormMobile.module.css";

interface UserFormProps {
  onClose?: () => void;
  onCreated?: () => void;
  variant?: "desktop" | "mobile";
  mode: "self-register" | "admin-create";
}

interface FormData {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  clave_fiscal: string;
  role: "admin" | "veterinario" | "cliente";

  // Cliente
  /**
   *Al momento de crear un cliente, debe estar activo el veterinario al que se lo asocia.
   * por deafault, se asocia al primer veterinario con id=1.
   */
  razon_social: string;

  // Veterinario
  especialidad?: string;
  ubicacionVet?: string;
  fotoPerfil?: FileList;
}

export default function UserForm({
  onClose,
  onCreated,
  variant = "desktop",
  mode,
}: UserFormProps) {
  const { apiFetch } = useApi();
  // La logica es compartida; solo cambia el modulo de estilos segun el contexto.
  const styles = variant === "mobile" ? mobileStyles : desktopStyles;
  //const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { role: "cliente" },
    shouldUnregister: true,
  });

  const selectedRole = useWatch({ control, name: "role" });

  const handleCreationResponse = async (
    response: Response | undefined,
    successMessage: string,
    fallbackError: string,
  ) => {
    if (!response?.ok) {
      const message = response
        ? await getApiErrorMessage(response, fallbackError)
        : "No se recibió respuesta del servidor.";
      toast.error(message);
      return false;
    }

    toast.success(successMessage);
    onClose?.();
    onCreated?.();
    return true;
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (data.role === "admin" && mode === "admin-create") {
        const payload: AdminCreateRequest = {
          nombre: data.nombre,
          email: data.email,
          password: data.password,
        };
        const response = await apiFetch("/admin/administradores", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        await handleCreationResponse(
          response,
          "Administrador creado con éxito.",
          "No se pudo crear el administrador.",
        );
        return;
      }

      if (data.role === "veterinario") {
        const basePayload: VeterinarioCreateRequest = {
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          clave_fiscal: data.clave_fiscal,
          especialidad: data.especialidad || null,
          telefono: data.telefono,
          ubicacion: data.ubicacionVet || null,
        };
        const payload: VeterinarioCreateRequest | VeterinarioRegisterRequest =
          mode === "self-register"
            ? { ...basePayload, rol: "veterinario" }
            : basePayload;
        const endpoint =
          mode === "self-register" ? "/auth/register" : "/admin/veterinarios";
        const resVet = await apiFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        await handleCreationResponse(
          resVet,
          "Veterinario creado con éxito.",
          "No se pudo crear el veterinario.",
        );
        return;
      }

      if (data.role === "cliente") {
        const basePayload: ClienteCreateRequest = {
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          clave_fiscal: data.clave_fiscal,
          telefono: data.telefono,
          razon_social: data.razon_social,
          veterinario_id: 1,
        };
        const payload: ClienteCreateRequest | ClienteRegisterRequest =
          mode === "self-register"
            ? { ...basePayload, rol: "cliente" }
            : basePayload;
        const endpoint =
          mode === "self-register" ? "/auth/register" : "/admin/clientes";
        const resCliente = await apiFetch(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        await handleCreationResponse(
          resCliente,
          "Cliente creado con éxito.",
          "No se pudo crear el cliente.",
        );
        return;
      }


    } catch (error) {
      console.error(error);
      toast.error("Error de conexión con el servidor.");
    }
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <h2 className={styles.title}>
          {mode === "self-register" ? "Crear cuenta" : "Nuevo Usuario"}
        </h2>
        <p className={styles.subtitle}>
          {mode === "self-register"
            ? "Completá tus datos para registrarte."
            : "Completá los datos para registrar un nuevo usuario."}
        </p>

        {/* Rol dinámico */}
        <div className={styles.group}>
          <label className={styles.label}>Rol</label>
          <select className={styles.input} {...register("role")}>
            <option value="cliente">Productor</option>
            <option value="veterinario">Veterinario</option>
            {mode === "admin-create" && <option value="admin">Administrador</option>}
          </select>
        </div>

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


        {/* Apellido y Nombre */}
        <div className={styles.group}>
          <label className={styles.label}>Apellido y Nombre</label>
          <input className={styles.input} placeholder="Apellido, Nombre" {...register("nombre", { required: true })} />
        </div>

        {selectedRole !== "admin" && <div className={styles.group}>
          <label className={styles.label}>Clave Fiscal</label>
          <input
            className={styles.input}
            type="text"
            inputMode="numeric"
            placeholder="Ingresá la clave fiscal sin guiones"
            {...register("clave_fiscal", {
              required: "La clave fiscal es obligatoria",
            })}
          />
          {errors.clave_fiscal && (
            <p className={styles.error}>{errors.clave_fiscal.message}</p>
          )}
        </div>}

        {selectedRole !== "admin" && <div className={styles.group}>
          <label className={styles.label}>Teléfono</label>
          <input
            className={styles.input}
            type="tel"
            {...register("telefono", {
              required: "El teléfono es obligatorio",
            })}
          />
          {errors.telefono && (
            <p className={styles.error}>{errors.telefono.message}</p>
          )}
        </div>}



        {/* Campos de CLIENTE */}
        {selectedRole === "cliente" && (
          <>
            <div className={styles.group}>
              <label className={styles.label}>Razón social</label>
              <input
                className={styles.input}
                {...register("razon_social", {
                  required: "La razón social es obligatoria",
                })}
              />
              {errors.razon_social && (
                <p className={styles.error}>{errors.razon_social.message}</p>
              )}
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
              <label className={styles.label}>Ubicación</label>
              <input className={styles.input} {...register("ubicacionVet")} placeholder="Ciudad, Provincia"/>
            </div>

          </>
        )}

        <Button
          label="Enviar"
          type="submit"
          variant={variant === "mobile" ? "tertiary" : "primary"}
          fullWidth={true}
        />
      </form>
    </div>
  );
}
