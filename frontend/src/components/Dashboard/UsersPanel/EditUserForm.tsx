import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";
import { getApiErrorMessage } from "../../../utils/apiError";
import type { AdminUserRow } from "../../../types/AdminUser";
import type { UsuarioUpdateRequest } from "../../../types/ApiContracts";
import styles from "./../Styles/EditarFormStyles.module.css";

interface Props {
  usuario: AdminUserRow;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

export default function EditUserForm({ usuario, onClose, onSaved }: Props) {
  const { apiFetch } = useApi();
  const [loading, setLoading] = useState(false);
  const [editClaveFiscal, setEditClaveFiscal] = useState(false);
  const [form, setForm] = useState({
    nombre: usuario.nombre,
    email: usuario.email,
    telefono: usuario.telefono,
    clave_fiscal: "",
    razon_social: usuario.cliente?.razon_social ?? "",
    contacto_principal: usuario.cliente?.contacto_principal ?? "",
    especialidad: usuario.veterinario?.especialidad ?? "",
    ubicacion: usuario.veterinario?.ubicacion ?? "",
  });
  const roleLabel =
    usuario.rol === "admin"
      ? "Administrador"
      : usuario.rol === "veterinario"
        ? "Veterinario"
        : "Cliente";

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (editClaveFiscal && !form.clave_fiscal.trim()) {
      toast.error("Ingresá la nueva clave fiscal.");
      return;
    }

    const payload: UsuarioUpdateRequest = {};
    if (form.nombre !== usuario.nombre) payload.nombre = form.nombre;
    if (form.email !== usuario.email) payload.email = form.email;
    if (usuario.rol !== "admin" && form.telefono !== usuario.telefono) {
      payload.telefono = form.telefono;
    }
    if (
      editClaveFiscal &&
      form.clave_fiscal !== (usuario.clave_fiscal ?? "")
    ) {
      payload.clave_fiscal = form.clave_fiscal;
    }

    if (usuario.rol === "cliente") {
      const perfil: NonNullable<UsuarioUpdateRequest["perfil"]> = {};
      if (form.razon_social !== usuario.cliente?.razon_social) {
        perfil.razon_social = form.razon_social;
      }
      if (form.contacto_principal !== (usuario.cliente?.contacto_principal ?? "")) {
        perfil.contacto_principal = form.contacto_principal || null;
      }
      if (Object.keys(perfil).length > 0) payload.perfil = perfil;
    }

    if (usuario.rol === "veterinario") {
      const perfil: NonNullable<UsuarioUpdateRequest["perfil"]> = {};
      if (form.especialidad !== (usuario.veterinario?.especialidad ?? "")) {
        perfil.especialidad = form.especialidad || null;
      }
      if (form.ubicacion !== (usuario.veterinario?.ubicacion ?? "")) {
        perfil.ubicacion = form.ubicacion || null;
      }
      if (Object.keys(perfil).length > 0) payload.perfil = perfil;
    }

    if (Object.keys(payload).length === 0) {
      toast("No hay cambios para guardar.");
      return;
    }

    setLoading(true);
    try {
      const response = await apiFetch(`/api/v1/admin/usuarios/${usuario.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      if (!response?.ok) {
        const message = response
          ? await getApiErrorMessage(response, "No se pudo actualizar el usuario.")
          : "No se recibió respuesta del servidor.";
        toast.error(message);
        return;
      }

      toast.success("Usuario actualizado correctamente.");
      await onSaved();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Editar Usuario</h2>
      <p className={styles.subtitle}>
        Editando datos de{" "}
        <span className={styles.roleHighlight}>{roleLabel}</span>.
        El rol no puede modificarse.
      </p>

      <div className={styles.group}>
        <label className={styles.label}>Apellido y Nombre</label>
        <input className={styles.input} required value={form.nombre} onChange={(e) => updateField("nombre", e.target.value)} />
      </div>

      <div className={styles.group}>
        <label className={styles.label}>Email</label>
        <input className={styles.input} type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)} />
      </div>

      {usuario.rol !== "admin" && (
        <>
          <div className={styles.group}>
            <label className={styles.label}>Teléfono</label>
            <input className={styles.input} type="tel" required value={form.telefono} onChange={(e) => updateField("telefono", e.target.value)} />
          </div>

          <div className={styles.group}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={editClaveFiscal}
                onChange={(e) => {
                  setEditClaveFiscal(e.target.checked);
                  updateField(
                    "clave_fiscal",
                    e.target.checked ? (usuario.clave_fiscal ?? "") : "",
                  );
                }}
              />
              Editar clave fiscal
            </label>
            <input
              className={styles.input}
              type="text"
              inputMode="numeric"
              disabled={!editClaveFiscal}
              required={editClaveFiscal}
              value={form.clave_fiscal}
              onChange={(e) => updateField("clave_fiscal", e.target.value)}
              placeholder={
                editClaveFiscal ? "Ingresá la nueva clave fiscal" : "*****"
              }
            />
          </div>
        </>
      )}

      {usuario.rol === "cliente" && (
        <>
          <div className={styles.group}>
            <label className={styles.label}>Razón social</label>
            <input className={styles.input} required value={form.razon_social} onChange={(e) => updateField("razon_social", e.target.value)} />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Contacto principal</label>
            <input className={styles.input} value={form.contacto_principal} onChange={(e) => updateField("contacto_principal", e.target.value)} />
          </div>
        </>
      )}

      {usuario.rol === "veterinario" && (
        <>
          <div className={styles.group}>
            <label className={styles.label}>Especialidad</label>
            <input className={styles.input} value={form.especialidad} onChange={(e) => updateField("especialidad", e.target.value)} />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Ubicación</label>
            <input className={styles.input} value={form.ubicacion} onChange={(e) => updateField("ubicacion", e.target.value)} />
          </div>
        </>
      )}

      <div className={styles.actions}>
        <Button label="Cancelar" variant="secondary" onClick={onClose} />
        <Button label={loading ? "Guardando…" : "Guardar cambios"} type="submit" />
      </div>
    </form>
  );
}
