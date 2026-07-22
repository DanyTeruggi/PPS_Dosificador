import { useState } from "react";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";
import styles from "./../Styles/EditarFormStyles.module.css";

import type { Bebedero } from "../../../types/Bebedero";
import type { BebederoUpdateRequest } from "../../../types/ApiContracts";

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
    ubicacion: bebedero.ubicacion || "",
    ipAddress: bebedero.ip_address || "",
    puerto: bebedero.puerto ?? "",
    largoBebedero: bebedero.largo || "",
    anchoBebedero: bebedero.ancho || "",
    profundidadBebedero: bebedero.profundidad ?? "",
    coberturaMinima: bebedero.cobertura_objetivo || "",
    tiempoDosis: bebedero.tiempo_dosis || "",
    capacidadTolva: bebedero.capacidad_tolva || "",
  });

  const updateField = (field: string, value: string | number) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: BebederoUpdateRequest = {
        nombre: form.nombre,
        ubicacion: form.ubicacion.trim() || null,
        ip_address: form.ipAddress.trim() || null,
        puerto: form.puerto === "" ? null : Number(form.puerto),
        largo: Number(form.largoBebedero),
        ancho: Number(form.anchoBebedero),
        profundidad: form.profundidadBebedero
          ? Number(form.profundidadBebedero)
          : null,
        cobertura_objetivo: Number(form.coberturaMinima),
        tiempo_dosis: Number(form.tiempoDosis),
        capacidad_tolva: Number(form.capacidadTolva),
      };
      const response = await apiFetch(`/api/v1/admin/bebederos/${bebedero.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
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

        {/* Ubicación */}
        <div className={styles.group}>
          <label className={styles.label}>Ubicación</label>
          <input
            className={styles.input}
            type="text"
            value={form.ubicacion}
            onChange={(e) => updateField("ubicacion", e.target.value)}
            placeholder="Ej: Sector norte"
          />
        </div>

        {/* Dirección IP / Puerto */}
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Dirección IP</label>
            <input
              className={styles.input}
              type="text"
              maxLength={45}
              value={form.ipAddress}
              onChange={(e) => updateField("ipAddress", e.target.value)}
              placeholder="Ej: 192.168.1.10"
            />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Puerto</label>
            <input
              className={styles.input}
              type="number"
              min="1"
              max="65535"
              step="1"
              value={form.puerto}
              onChange={(e) => updateField("puerto", e.target.value)}
              placeholder="Ej: 8000"
            />
          </div>
        </div>

        {/* Largo / Ancho / Profundidad */}
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Largo (cm)</label>
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
            <label className={styles.label}>Ancho (cm)</label>
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
            <label className={styles.label}>Profundidad (cm)</label>
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
            <label className={styles.label}>Tiempo dosis (hs)</label>
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

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label={loading ? "Guardando..." : "Guardar"} type="submit" />
        </div>
      </form>
    </div>
  );
}
