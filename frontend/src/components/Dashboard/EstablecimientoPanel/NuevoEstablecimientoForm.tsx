import { useState } from "react";
import styles from "./NuevoEstablecimientoForm.module.css";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";

interface Props {
  onClose: () => void;
}

export default function NuevoEstablecimientoForm({ onClose }: Props) {
  const { apiFetch } = useApi();

  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    cliente_id: "",
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
      const res = await apiFetch(`/api/v1/admin/establecimientos`, {
        method: "POST",
        body: JSON.stringify({
          nombre: form.nombre,
          ubicacion: form.ubicacion,
          cliente_id: Number(form.cliente_id),
        }),
      });

      if (!res || !res.ok) {
        throw new Error("No se pudo crear el establecimiento");
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el establecimiento. Revisá los datos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Nuevo Establecimiento</h2>
        <p className={styles.subtitle}>
          Completá los datos para registrar un nuevo establecimiento.
        </p>

        {/* Nombre */}
        <div className={styles.group}>
          <label className={styles.label}>Nombre</label>
          <input
            type="text"
            className={styles.input}
            required
            value={form.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
            placeholder="Ej: Campo La Esperanza"
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
            placeholder="Ej: Ruta 226 km 145"
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
            placeholder="Ej: 12"
          />
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
