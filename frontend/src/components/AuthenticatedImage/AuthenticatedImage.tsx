import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useApi } from "../../utils/apiFetch";
import styles from "./AuthenticatedImage.module.css";

type AuthenticatedImageProps = {
  imageUrl: string;
  alt: string;
};

type ImageStatus = "loading" | "loaded" | "error";

export default function AuthenticatedImage({ imageUrl, alt }: AuthenticatedImageProps) {
  const { apiFetch } = useApi();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<ImageStatus>("loading");
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let createdObjectUrl: string | null = null;

    async function loadImage() {
      setStatus("loading");
      setObjectUrl(null);

      try {
        const response = await apiFetch(imageUrl, { signal: controller.signal });
        if (!response?.ok) throw new Error("No se pudo cargar la imagen.");

        const contentType = response.headers.get("Content-Type")?.toLowerCase() ?? "";
        if (!contentType.startsWith("image/")) {
          throw new Error("El archivo recibido no es una imagen compatible.");
        }

        const blob = await response.blob();
        if (controller.signal.aborted) return;

        createdObjectUrl = URL.createObjectURL(blob);
        setObjectUrl(createdObjectUrl);
        setStatus("loaded");
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setStatus("error");
      }
    }

    void loadImage();

    return () => {
      controller.abort();
      if (createdObjectUrl) URL.revokeObjectURL(createdObjectUrl);
    };
  }, [apiFetch, imageUrl]);

  useEffect(() => {
    if (!expanded) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [expanded]);

  if (status === "loading") {
    return <div className={styles.placeholder}>Cargando imagen…</div>;
  }

  if (status === "error" || !objectUrl) {
    return <div className={styles.placeholder}>No se pudo cargar</div>;
  }

  return (
    <>
      <button
        aria-label={`Ampliar ${alt}`}
        className={styles.previewButton}
        type="button"
        onClick={() => setExpanded(true)}
      >
        <img className={styles.previewImage} src={objectUrl} alt={alt} />
      </button>

      {expanded && createPortal(
        <div className={styles.overlay} role="presentation" onClick={() => setExpanded(false)}>
          <div
            aria-label={`Vista ampliada: ${alt}`}
            aria-modal="true"
            className={styles.expandedDialog}
            role="dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Cerrar imagen ampliada"
              className={styles.closeButton}
              type="button"
              onClick={() => setExpanded(false)}
            >
              ×
            </button>
            <img className={styles.expandedImage} src={objectUrl} alt={alt} />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
