import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import type { AuthUser } from "../../context/authContextDefinition";
import ButtonX from "../ButtonX/ButtonX";
import styles from "./SupportWhatsAppModal.module.css";

interface Props {
  user: AuthUser | null;
  onClose: () => void;
}

const problemTypes = [
  "Dispositivo no responde",
  "Lecturas incorrectas",
  "Problemas de conexión",
  "Error en la aplicación",
  "Acceso o contraseña",
  "Otro",
] as const;

export default function SupportWhatsAppModal({ user, onClose }: Props) {
  const [problemType, setProblemType] = useState<string>(problemTypes[0]);
  const [description, setDescription] = useState("");
  const supportNumber = String(import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const detail = description.trim();
    if (!detail || !supportNumber) return;

    const message = [
      "Hola, necesito soporte técnico.",
      "",
      `Tipo de problema: ${problemType}`,
      `Descripción: ${detail}`,
      "",
      `Usuario: ${user?.nombre || "Sin especificar"}`,
      `Correo: ${user?.email || "Sin especificar"}`,
      `Rol: ${user?.role ?? user?.rol ?? "Sin especificar"}`,
      `Fecha: ${new Date().toLocaleString("es-AR")}`,
    ].join("\n");

    const opened = window.open(`https://wa.me/${supportNumber}?text=${encodeURIComponent(message)}`, "_blank");
    if (!opened) {
      toast.error("El navegador bloqueó la apertura de WhatsApp.");
      return;
    }
    opened.opener = null;
    toast.success("WhatsApp se abrió con el mensaje preparado.");
    onClose();
  }

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <section aria-labelledby="support-title" aria-modal="true" className={styles.dialog} role="dialog" onMouseDown={(event) => event.stopPropagation()}>
        <ButtonX className={styles.closeButton} onClick={onClose} />
        <h2 id="support-title">Soporte técnico</h2>
        <p className={styles.subtitle}>Contanos qué sucede y continuá la conversación por WhatsApp.</p>

        <form onSubmit={handleSubmit}>
          <label className={styles.group}>
            <span>Tipo de problema</span>
            <select value={problemType} onChange={(event) => setProblemType(event.target.value)}>
              {problemTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>

          <label className={styles.group}>
            <span>Descripción</span>
            <textarea autoFocus maxLength={600} placeholder="Describí brevemente el inconveniente…" required rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
            <small>{description.length}/600</small>
          </label>

          {!supportNumber && <p className={styles.configurationError} role="alert">El número de soporte todavía no está configurado.</p>}

          <div className={styles.actions}>
            <button className={styles.cancelButton} type="button" onClick={onClose}>Cancelar</button>
            <button className={styles.whatsAppButton} disabled={!description.trim() || !supportNumber} type="submit">Enviar WhatsApp</button>
          </div>
        </form>
      </section>
    </div>
  );
}
