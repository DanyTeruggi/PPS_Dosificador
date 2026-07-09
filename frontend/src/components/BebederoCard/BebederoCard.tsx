import styles from "./BebederoCard.module.css";

interface ImagenDetalle {
  image_url?: string | null;
}

interface MonitoreoDetalle {
  fecha?: string;
  timestamp?: string;
  cobertura_capsulas_porciento?: number | null;
  imagenes: ImagenDetalle[];
}

interface BebederoDetalle {
  id: number;
  nombre: string;
  ubicacion?: string | null;
  cobertura_objetivo: number;
  ultima_medicion?: string | null;
  monitoreos: MonitoreoDetalle[];
}

interface BebederoCardProps {
  bebedero: BebederoDetalle;
}

function formatMedicion(raw?: string | null): string {
  if (!raw) {
    return "s/n";
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }

  return `${parsed.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} Hs`;
}

export default function BebederoCard({ bebedero }: BebederoCardProps) {
  const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? ""; 

  const buildImageSrc = (imageUrl?: string | null) => { 
    if (!imageUrl) {
      return null;
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    
    return `${apiBase}${imageUrl}`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.horizontalScroll}>
        {bebedero.monitoreos.length > 0 ? (
          bebedero.monitoreos.map((monitoreo, index) => {
            const latestImage = monitoreo.imagenes[0];
            const imageSrc = buildImageSrc(latestImage?.image_url);
            
            return (
              <div key={`${bebedero.id}-${index}`} className={styles.block}>
                <div className={styles.imageWrapper}>
                  {imageSrc ? (
                    <img src={imageSrc} alt={bebedero.nombre} />
                  ) : (
                    <div className={styles.imagePlaceholder}>Sin imagen</div>
                  )}
                </div>

                <div className={styles.header}>
                  <h3 className={styles.title}>{bebedero.nombre}</h3>
                </div>
                <p>
                  <strong>Ubicación:</strong> {bebedero.ubicacion}
                </p>
                <p>
                  <strong>Medición:</strong> {formatMedicion(monitoreo.timestamp ?? monitoreo.fecha ?? bebedero.ultima_medicion ?? null)}
                </p>
                <p>
                  <strong>Target:</strong> {bebedero.cobertura_objetivo}%
                </p>
                <p>
                  <strong>Cobertura:</strong> {monitoreo.cobertura_capsulas_porciento ?? "s/n"}%
                </p>
              </div>
            );
          })
        ) : (
          <div className={styles.block}>
            <div className={styles.imageWrapper}>
              <div className={styles.imagePlaceholder}>Sin monitoreos</div>
            </div>

            <div className={styles.header}>
              <h3 className={styles.title}>{bebedero.nombre}</h3>
            </div>
            <p>
              <strong>Ubicación:</strong> {bebedero.ubicacion}
            </p>
            <p>
              <strong>Cobertura:</strong> {bebedero.cobertura_objetivo}%
            </p>
            <p>
              <strong>Medición:</strong> {formatMedicion(bebedero.ultima_medicion ?? null)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
