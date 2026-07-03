import { useState } from "react";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";
import styles from "./NuevoBebederoForm.module.css";

interface Props {
  onClose: () => void;
}

export default function NuevoBebederoForm({ onClose }: Props) {
  const { apiFetch } = useApi();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    establecimiento: "",
    nombre: "",
    latitud: "",
    longitud: "",
    largoBebedero: "",
    anchoBebedero: "",
    profundidadBebedero: "",
    coberturaMinima: "",
    tiempoDosis: "",
    capacidadTolva: "",
    estado: true,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const establecimientoId = Number(form.establecimiento);

      const response = await apiFetch(
        `/api/v1/establecimientos/${establecimientoId}/bebederos`,
        {
          method: "POST",
          body: JSON.stringify({
            nombre: form.nombre,
            latitud: Number(form.latitud),
            longitud: Number(form.longitud),
            establecimiento: establecimientoId,
            largoBebedero: Number(form.largoBebedero),
            anchoBebedero: Number(form.anchoBebedero),
            profundidadBebedero: Number(form.profundidadBebedero),
            coberturaMinima: Number(form.coberturaMinima),
            tiempoDosis: Number(form.tiempoDosis),
            capacidadTolva: Number(form.capacidadTolva),
            estado: form.estado,
          }),
        }
      );

      if (!response || !response.ok) {
        throw new Error("No se pudo crear el bebedero");
      }

      onClose();
    } catch (submitError) {
      setError("No se pudo crear el bebedero. Revisá los datos e intentá de nuevo.");
      console.error(submitError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Nuevo Bebedero</h2>
        <p className={styles.subtitle}>
          Completá los datos para registrar un nuevo bebedero.
        </p>

        {/* ID Establecimiento */}
        {/*
        <div className={styles.group}>
          <label className={styles.label}>ID Establecimiento</label>
          <input
            className={styles.input}
            type="number"
            min="1"
            required
            value={form.establecimiento}
            onChange={(e) => updateField("establecimiento", e.target.value)}
            placeholder="Ej: 1"
          />
        </div>
        */}
        {/* Nombre */}
        <div className={styles.group}>
          <label className={styles.label}>Nombre</label>
          <input
            className={styles.input}
            type="text"
            required
            value={form.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
            placeholder="Ej: Bebedero principal"
          />
        </div>

        {/* Latitud / Longitud */}
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Latitud</label>
            <input
              className={styles.input}
              type="number"
              step="0.000001"
              required
              value={form.latitud}
              onChange={(e) => updateField("latitud", e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Longitud</label>
            <input
              className={styles.input}
              type="number"
              step="0.000001"
              required
              value={form.longitud}
              onChange={(e) => updateField("longitud", e.target.value)}
            />
          </div>
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

        {/* Checkbox */}
        <div className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={form.estado}
            onChange={(e) => updateField("estado", e.target.checked)}
          />
          <span>Bebedero activo</span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button
            label="Cancelar"
            variant="secondary"
            onClick={onClose}
          />
          <Button
            label={loading ? "Guardando..." : "Guardar"}
            type="submit"
          />
        </div>
      </form>
    </div>
  );
}
