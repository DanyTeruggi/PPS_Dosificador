import { useState } from "react";
import styles from "./../Style/EditarFormStyles.module.css";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";

import type { Establecimiento } from "../../../types/Establecimiento";

interface Props {
  establecimiento: Establecimiento;
  onClose: () => void;
  onSave: (updated: Establecimiento) => void | Promise<void>;
}

/**
 * Formulario para editar un establecimiento existente.
 * Se usa dentro del modal del EstablecimientoPanel.
 */
export default function EditarEstablecimientoForm({ establecimiento, onClose, onSave }: Props) {
  const { apiFetch } = useApi();

  const [form, setForm] = useState({
    id: establecimiento.id,
    nombre: establecimiento.nombre,
    ubicacion: establecimiento.ubicacion || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch(
        `/api/v1/admin/establecimientos/${form.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          nombre: form.nombre,
          ubicacion: form.ubicacion,
        }),
      });

      if (!res || !res.ok) {
        throw new Error("No se pudo actualizar el establecimiento");
      }

      const updated: Establecimiento = await res.json();
      await onSave(updated);
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el establecimiento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>Editar Establecimiento</h2>

      {/* Nombre */}
      <div className={styles.group}>
        <label className={styles.label}>Nombre</label>
        <input
          type="text"
          className={styles.input}
          required
          value={form.nombre}
          onChange={(e) => updateField("nombre", e.target.value)}
        />
      </div>

      {/* Ubicación */}
      <div className={styles.group}>
        <label className={styles.label}>Ubicación</label>
        <input
          type="text"
          className={styles.input}
          value={form.ubicacion}
          onChange={(e) => updateField("ubicacion", e.target.value)}
        />
      </div>


      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <Button label="Cancelar" variant="secondary" onClick={onClose} />
        <Button label={loading ? "Guardando..." : "Guardar cambios"} type="submit" />
      </div>
    </form>
  );
}
