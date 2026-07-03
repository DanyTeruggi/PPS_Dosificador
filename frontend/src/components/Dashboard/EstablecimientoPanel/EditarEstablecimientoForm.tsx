import { useState } from "react";
import styles from "./EditarEstablecimientoForm.module.css";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";

import type { Establecimiento } from "../../../types/Establecimiento";

interface Props {
  establecimiento: Establecimiento;
  onSave: (updated: Establecimiento) => void;
}

/**
 * Formulario para editar un establecimiento existente.
 * Se usa dentro del modal del EstablecimientoPanel.
 */
export default function EditarEstablecimientoForm({ establecimiento, onSave }: Props) {
  const { apiFetch } = useApi();

  const [form, setForm] = useState({
    id: establecimiento.id,
    nombre: establecimiento.nombre,
    ubicacion: establecimiento.ubicacion || "",
    cliente_id: establecimiento.cliente_id,
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
      const res = await apiFetch(`/api/v1/establecimientos/${form.id}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre: form.nombre,
          ubicacion: form.ubicacion,
          cliente_id: Number(form.cliente_id),
        }),
      });

      if (!res || !res.ok) {
        throw new Error("No se pudo actualizar el establecimiento");
      }

      onSave({
        id: form.id,
        nombre: form.nombre,
        ubicacion: form.ubicacion,
        cliente_id: Number(form.cliente_id),
      });
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

      {/* Cliente ID */}
      <div className={styles.group}>
        <label className={styles.label}>ID Cliente</label>
        <input
          type="number"
          className={styles.input}
          required
          value={form.cliente_id}
          onChange={(e) => updateField("cliente_id", e.target.value)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <Button label={loading ? "Guardando..." : "Guardar cambios"} type="submit" />
      </div>
    </form>
  );
}
