import { useState } from "react";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";
import styles from "./../Style/EditarFormStyles.module.css";
import type { BebederoCreateRequest } from "../../../types/ApiContracts";
import type { Establecimiento } from "../../../types/Establecimiento";

interface Props {
  onClose: () => void;
  establecimientos: Establecimiento[];
}

export default function NuevoBebederoForm({ onClose, establecimientos }: Props) {
  const { apiFetch } = useApi();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    establecimiento: "",
    nombre: "",
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
      const payload: BebederoCreateRequest = {
        establecimiento_id: Number(form.establecimiento),
        nombre: form.nombre,
        largo: Number(form.largoBebedero),
        ancho: Number(form.anchoBebedero),
        profundidad: form.profundidadBebedero
          ? Number(form.profundidadBebedero)
          : null,
        cobertura_objetivo: Number(form.coberturaMinima),
        tiempo_dosis: Number(form.tiempoDosis),
        capacidad_tolva: Number(form.capacidadTolva),
        estado: form.estado,
      };
      const response = await apiFetch("/api/v1/admin/bebederos", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response || !response.ok) {
        throw new Error("No se pudo crear el dispositivo.");
      }

      onClose();
    } catch (submitError) {
      setError("No se pudo crear el dispositivo. Revisá los datos e intentá de nuevo.");
      console.error(submitError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Nuevo Dispositivo</h2>
        <p className={styles.subtitle}>
          Completá los datos para registrar un nuevo dispositivo.
        </p>

        <div className={styles.group}>
          <label className={styles.label}>Establecimiento</label>
          <select
            className={styles.input}
            required
            value={form.establecimiento}
            onChange={(e) => updateField("establecimiento", e.target.value)}
          >
            <option value="">Seleccioná un establecimiento</option>
            {establecimientos.map((establecimiento) => (
              <option key={establecimiento.id} value={establecimiento.id}>
                {establecimiento.nombre}
              </option>
            ))}
          </select>
        </div>
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
              min="0.000001"
              step="any"
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
              min="0.000001"
              step="any"
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
              min="0.000001"
              step="any"
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
              step="any"
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
              min="0.000001"
              step="any"
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
              min="0.000001"
              step="any"
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
