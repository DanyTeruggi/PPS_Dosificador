import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { getApiErrorMessage } from "../../../utils/apiError";
import { useApi } from "../../../utils/apiFetch";
import type { Bebedero } from "../../../types/Bebedero";
import styles from "./../Styles/EditarFormStyles.module.css";
import simulatorStyles from "./CargaImagen.module.css";

type Props = {
  bebederos: Bebedero[];
  onClose: () => void;
  onCompleted?: () => void;
};

type StepStatus = "idle" | "loading" | "success" | "error";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const separator = result.indexOf(",");
      if (separator < 0) {
        reject(new Error("No se pudo convertir la imagen a Base64."));
        return;
      }
      resolve(result.slice(separator + 1));
    };
    reader.readAsDataURL(file);
  });
}

export default function CargaImagen({ bebederos, onClose, onCompleted }: Props) {
  const { apiFetch } = useApi();
  const [bebederoId, setBebederoId] = useState("");
  // La clave se genera desde la raíz del backend con el mismo ID seleccionado:
  // .\venv\Scripts\python.exe -m app.cli.device_api_key 25
  // El comando imprime la X-API-Key. No guardar la clave en el frontend ni en localStorage.
  const [apiKey, setApiKey] = useState("");
  const [cobertura, setCobertura] = useState("");
  const [nivelAgua, setNivelAgua] = useState("");
  const [distanciaSensor, setDistanciaSensor] = useState("");
  const [sensorUltrasound, setSensorUltrasound] = useState(true);
  const [cameraActiva, setCameraActiva] = useState(true);
  const [analyzerActivo, setAnalyzerActivo] = useState(true);
  const [configOk, setConfigOk] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [fechaMedicion, setFechaMedicion] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [image, setImage] = useState<File | null>(null);
  const [monitoringStatus, setMonitoringStatus] = useState<StepStatus>("idle");
  const [imageStatus, setImageStatus] = useState<StepStatus>("idle");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const loading = monitoringStatus === "loading" || imageStatus === "loading";

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function updatePreview(file: File | null) {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = file ? URL.createObjectURL(file) : null;
    setPreviewUrl(previewUrlRef.current);
  }

  function selectImage(file: File | null) {
    setError(null);
    if (!file) {
      setImage(null);
      updatePreview(null);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError("Seleccioná una imagen JPEG, PNG o WebP.");
      setImage(null);
      updatePreview(null);
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError("La imagen no puede superar los 5 MB.");
      setImage(null);
      updatePreview(null);
      return;
    }
    setImage(file);
    updatePreview(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !image) return;

    setError(null);
    setResult(null);
    setMonitoringStatus("loading");
    setImageStatus("idle");

    const measurementDate = new Date(fechaMedicion);
    const headers = { "X-API-Key": apiKey.trim() };

    try {
      const monitoringResponse = await apiFetch(`/api/v1/bebederos/${bebederoId}/monitoreo`, {
        method: "POST",
        headers,
        skipAuth: true,
        skipUnauthorizedLogout: true,
        body: JSON.stringify({
          fecha: measurementDate.toISOString().slice(0, 10),
          timestamp: measurementDate.toISOString(),
          nivel_agua_cm: nivelAgua === "" ? null : Number(nivelAgua),
          distancia_sensor_cm: distanciaSensor === "" ? null : Number(distanciaSensor),
          cobertura_capsulas_porciento: Number(cobertura),
          sensor_ultrasound: sensorUltrasound,
          camera_activa: cameraActiva,
          analyzer_activo: analyzerActivo,
          config_ok: configOk,
          error_message: errorMessage.trim() || null,
        }),
      });

      if (!monitoringResponse?.ok) {
        setMonitoringStatus("error");
        const monitoringError = monitoringResponse?.status === 401
          ? "La API key no es válida para el dispositivo seleccionado."
          : monitoringResponse
            ? await getApiErrorMessage(monitoringResponse, "No se pudo crear el monitoreo.")
            : "No se recibió respuesta al crear el monitoreo.";
        throw new Error(
          monitoringError,
        );
      }

      setMonitoringStatus("success");
      setImageStatus("loading");

      const contenidoBase64 = await fileToBase64(image);
      const uniqueName = `${bebederoId}-${Date.now()}-${image.name}`;
      const imageResponse = await apiFetch(`/api/v1/bebederos/${bebederoId}/imagenes`, {
        method: "POST",
        headers,
        skipAuth: true,
        skipUnauthorizedLogout: true,
        body: JSON.stringify({
          nombre_archivo: uniqueName,
          contenido_base64: contenidoBase64,
          fecha_captura: measurementDate.toISOString(),
        }),
      });

      if (!imageResponse?.ok) {
        setImageStatus("error");
        const imageError = imageResponse?.status === 401
          ? "El monitoreo se creó, pero la API key fue rechazada al subir la imagen."
          : imageResponse
            ? await getApiErrorMessage(imageResponse, "El monitoreo se creó, pero no se pudo subir la imagen.")
            : "El monitoreo se creó, pero no hubo respuesta al subir la imagen.";
        throw new Error(
          imageError,
        );
      }

      const payload = await imageResponse.json() as Record<string, unknown>;
      setResult(payload);
      setImageStatus("success");
      setApiKey("");
      toast.success("Lectura e imagen enviadas correctamente.");
      onCompleted?.();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "No se pudo completar la simulación.";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div className={`${styles.form} ${simulatorStyles.form}`}>
      <h2 className={styles.title}>Simulador de hardware</h2>
      <p className={styles.subtitle}>
        Herramienta de desarrollo. Esta operación crea una medición y una imagen reales.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.group}>
          <label className={styles.label}>Dispositivo</label>
          <select className={styles.input} required value={bebederoId} onChange={(event) => setBebederoId(event.target.value)}>
            <option value="">Seleccioná un dispositivo</option>
            {bebederos.map((bebedero) => (
              <option key={bebedero.id} value={bebedero.id}>{bebedero.nombre} · ID {bebedero.id}</option>
            ))}
          </select>
        </div>

        <div className={styles.group}>
          <label className={styles.label}>API key del dispositivo</label>
          <input className={styles.input} required type="password" autoComplete="off" value={apiKey} onChange={(event) => setApiKey(event.target.value)} />
        </div>

        <div className={simulatorStyles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Cobertura medida (%)</label>
            <input className={styles.input} required type="number" min="0" max="100" step="any" value={cobertura} onChange={(event) => setCobertura(event.target.value)} />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Fecha y hora</label>
            <input className={styles.input} required type="datetime-local" value={fechaMedicion} onChange={(event) => setFechaMedicion(event.target.value)} />
          </div>
        </div>

        <div className={simulatorStyles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Nivel de agua (cm)</label>
            <input className={styles.input} type="number" step="any" value={nivelAgua} onChange={(event) => setNivelAgua(event.target.value)} />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Distancia del sensor (cm)</label>
            <input className={styles.input} type="number" step="any" value={distanciaSensor} onChange={(event) => setDistanciaSensor(event.target.value)} />
          </div>
        </div>

        <fieldset className={simulatorStyles.deviceStatus}>
          <legend>Estado del dispositivo</legend>
          <label><input type="checkbox" checked={sensorUltrasound} onChange={(event) => setSensorUltrasound(event.target.checked)} /> Sensor ultrasónico</label>
          <label><input type="checkbox" checked={cameraActiva} onChange={(event) => setCameraActiva(event.target.checked)} /> Cámara activa</label>
          <label><input type="checkbox" checked={analyzerActivo} onChange={(event) => setAnalyzerActivo(event.target.checked)} /> Analizador activo</label>
          <label><input type="checkbox" checked={configOk} onChange={(event) => setConfigOk(event.target.checked)} /> Configuración correcta</label>
        </fieldset>

        <div className={styles.group}>
          <label className={styles.label}>Mensaje de error</label>
          <input className={styles.input} type="text" value={errorMessage} onChange={(event) => setErrorMessage(event.target.value)} placeholder="Opcional" />
        </div>

        <div className={styles.group}>
          <label className={styles.label}>Imagen de la lectura</label>
          <input className={styles.input} required type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => selectImage(event.target.files?.[0] ?? null)} />
        </div>

        {previewUrl && <img className={simulatorStyles.preview} src={previewUrl} alt="Vista previa de la lectura" />}

        <div className={simulatorStyles.steps} aria-live="polite">
          <span data-status={monitoringStatus}>1. Medición: {monitoringStatus}</span>
          <span data-status={imageStatus}>2. Imagen: {imageStatus}</span>
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}
        {result && (
          <p className={simulatorStyles.result}>
            Flujo completo · imagen ID {String(result.id ?? "s/n")} · monitoreo ID {String(result.monitoreo_id ?? "s/n")}
          </p>
        )}

        <div className={styles.actions}>
          <button className={simulatorStyles.cancelButton} disabled={loading} type="button" onClick={onClose}>Cerrar</button>
          <button className={simulatorStyles.submitButton} disabled={loading || !image} type="submit">
            {loading ? "Enviando…" : "Enviar lectura e imagen"}
          </button>
        </div>
      </form>
    </div>
  );
}
