import { useState } from "react";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";
import styles from "./../Style/EditarFormStyles.module.css";

import type { Bebedero } from "../../../types/Bebedero";

interface Props {
  bebedero: Bebedero;
  onClose: () => void;
  onSave: (updated: Bebedero) => void | Promise<void>;
}

export default function EditarBebederoForm({ bebedero, onClose, onSave }: Props) {
  const { apiFetch } = useApi();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nombre: bebedero.nombre || "",
    largoBebedero: bebedero.largoBebedero || "",
    anchoBebedero: bebedero.anchoBebedero || "",
    profundidadBebedero: bebedero.profundidadBebedero || "",
    coberturaMinima: bebedero.coberturaMinima || "",
    tiempoDosis: bebedero.tiempoDosis || "",
    capacidadTolva: bebedero.capacidadTolva || "",
  });

  const updateField = (field: string, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiFetch(`/api/v1/admin/bebederos/${bebedero.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          nombre: form.nombre,
          largoBebedero: Number(form.largoBebedero),
          anchoBebedero: Number(form.anchoBebedero),
          profundidadBebedero: Number(form.profundidadBebedero),
          coberturaMinima: Number(form.coberturaMinima),
          tiempoDosis: Number(form.tiempoDosis),
          capacidadTolva: Number(form.capacidadTolva),
        }),
      });

      if (!response || !response.ok) {
        throw new Error("No se pudo actualizar el dispositivo.");
      }

      const updated = await response.json();
      await onSave(updated);
      onClose();

    } catch (submitError) {
      setError("No se pudo actualizar el dispositivo. Revisá los datos e intentá de nuevo.");
      console.error(submitError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Editar Dispositivo</h2>
        <p className={styles.subtitle}>Modificá los datos del dispositivo seleccionado.</p>

        {/* Nombre */}
        <div className={styles.group}>
          <label className={styles.label}>Nombre</label>
          <input
            className={styles.input}
            type="text"
            required
            value={form.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
          />
        </div>

        {/* Largo / Ancho / Profundidad */}
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Largo (m)</label>
            <input
              className={styles.input}
              type="number"
              required
              value={form.largoBebedero}
              onChange={(e) => updateField("largoBebedero", e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Ancho (m)</label>
            <input
              className={styles.input}
              type="number"
              required
              value={form.anchoBebedero}
              onChange={(e) => updateField("anchoBebedero", e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Profundidad (m)</label>
            <input
              className={styles.input}
              type="number"
              required
              value={form.profundidadBebedero}
              onChange={(e) => updateField("profundidadBebedero", e.target.value)}
            />
          </div>
        </div>

        {/* Cobertura / Tiempo / Tolva */}
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Cobertura mín (%)</label>
            <input
              className={styles.input}
              type="number"
              min="0"
              max="100"
              required
              value={form.coberturaMinima}
              onChange={(e) => updateField("coberturaMinima", e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Tiempo dosis (seg)</label>
            <input
              className={styles.input}
              type="number"
              required
              value={form.tiempoDosis}
              onChange={(e) => updateField("tiempoDosis", e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Capacidad tolva (kg)</label>
            <input
              className={styles.input}
              type="number"
              required
              value={form.capacidadTolva}
              onChange={(e) => updateField("capacidadTolva", e.target.value)}
            />
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label={loading ? "Guardando..." : "Guardar"} type="submit" />
        </div>
      </form>
    </div>
  );
}
