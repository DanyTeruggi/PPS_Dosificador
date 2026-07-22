import { useState } from "react";
import styles from "./../Styles/EditarFormStyles.module.css";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";
import toast from "react-hot-toast";

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
        }
      );

      // Si no hay respuesta (CORS, red, etc.)
      if (!res) {
        toast.error("Error: no se recibió respuesta del servidor.");
        throw new Error("No se recibió respuesta del servidor.");
      }

      // Si el backend devuelve error
      if (!res.ok) {
        toast.error("No se pudo actualizar el establecimiento.");
        throw new Error("No se pudo actualizar el establecimiento.");
      }

      // ⭐ Caso de éxito
      const updated: Establecimiento = await res.json();
      toast.success(`Establecimiento "${updated.nombre}" actualizado correctamente.`);

      await onSave(updated);
      onClose();

    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el establecimiento.");
      // Ya mostramos toast arriba, no repetimos aquí
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
