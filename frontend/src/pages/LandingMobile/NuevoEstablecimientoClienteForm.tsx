import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorDetails } from "../../utils/apiError";
import { useApi } from "../../utils/apiFetch";
import styles from "./NuevoEstablecimientoClienteForm.module.css";
import ButtonX from "../../components/ButtonX/ButtonX";

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function NuevoEstablecimientoClienteForm({ onClose, onCreated }: Props) {
  const { apiFetch } = useApi();
  const [nombre, setNombre] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose]);

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await apiFetch("/api/v1/clientes/me/establecimientos", {
        method: "POST",
        body: JSON.stringify({
          nombre: nombre.trim(),
          ubicacion: ubicacion.trim() || null,
        }),
      });

      if (!response) {
        throw new Error("No se recibió respuesta del servidor.");
      }

      if (!response.ok) {
        const details = await getApiErrorDetails(response, "No se pudo crear el establecimiento.");
        setFieldErrors(details.fieldErrors);
        throw new Error(details.message);
      }

      toast.success(`Establecimiento "${nombre.trim()}" creado con éxito.`);
      onCreated();
    } catch (submitError) {
      const message = submitError instanceof Error
        ? submitError.message
        : "No se pudo crear el establecimiento.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.overlay} onMouseDown={loading ? undefined : onClose}>
      <section
        aria-labelledby="nuevo-establecimiento-title"
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <div className={styles.header}>
            <h2 id="nuevo-establecimiento-title">Nuevo establecimiento</h2>
            <ButtonX
              className={styles.closeButton}
              disabled={loading}
              onClick={onClose}
            />
            {fieldErrors.nombre && <small className={styles.error}>{fieldErrors.nombre}</small>}
          </div>

          <p className={styles.subtitle}>Completá los datos de tu establecimiento.</p>

          <label className={styles.group}>
            <span>Nombre</span>
            <input
              autoFocus
              maxLength={120}
              required
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Ej: Campo La Esperanza"
            />
            {fieldErrors.ubicacion && <small className={styles.error}>{fieldErrors.ubicacion}</small>}
          </label>

          <label className={styles.group}>
            <span>Ubicación</span>
            <input
              maxLength={255}
              value={ubicacion}
              onChange={(event) => setUbicacion(event.target.value)}
              placeholder="Ej: Ruta 226 km 145"
            />
          </label>

          {error && <p className={styles.error} role="alert">{error}</p>}

          <div className={styles.actions}>
            <button className={styles.cancelButton} disabled={loading} type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className={styles.submitButton} disabled={loading || !nombre.trim()} type="submit">
              {loading ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
