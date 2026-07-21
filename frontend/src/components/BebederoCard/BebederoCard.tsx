import {
  HiOutlineCalendarDays,
  HiOutlineMapPin,
  HiOutlineShieldCheck,
  HiOutlineViewfinderCircle,
} from "react-icons/hi2";

import type { BebederoDetalle, MonitoreoDetalle } from "../../types/landingTypes";
import AuthenticatedImage from "../AuthenticatedImage/AuthenticatedImage";
import styles from "./BebederoCard.module.css";

interface BebederoCardProps {
  bebedero: BebederoDetalle;
}

interface MeasurementCardProps {
  bebedero: BebederoDetalle;
  monitoreo?: MonitoreoDetalle;
}

function formatMedicion(raw?: string | null): { date: string; time: string } {
  if (!raw) return { date: "s/n", time: "" };

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return { date: raw, time: "" };

  return {
    date: parsed.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    time: `${parsed.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} Hs`,
  };
}

function formatPercentage(value?: number | null): string {
  return value == null ? "s/n" : `${value}%`;
}

function MeasurementCard({ bebedero, monitoreo }: MeasurementCardProps) {
  const imageUrl = monitoreo?.imagenes?.[0]?.image_url;
  const coverage = monitoreo?.cobertura_capsulas_porciento
    ?? monitoreo?.coberturaCapsulasPorciento;
  const measurementDate = monitoreo?.timestamp
    ?? monitoreo?.fecha
    ?? bebedero.ultima_medicion;
  const formattedMeasurement = formatMedicion(measurementDate);

  return (
    <article className={styles.block}>
      <header className={styles.cardHeader}>
        <span className={styles.bebederoIcon} aria-hidden="true">
          <HiOutlineViewfinderCircle />
        </span>
        <h3 className={styles.title}>{bebedero.nombre}</h3>
      </header>

      <div className={styles.cardBody}>
        <div className={styles.imageWrapper}>
          {imageUrl ? (
            <AuthenticatedImage
              imageUrl={imageUrl}
              alt={`Medición de ${bebedero.nombre}`}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              {monitoreo ? "Sin imagen" : "Sin monitoreos"}
            </div>
          )}
        </div>

        <div className={styles.details}>
          <dl className={styles.dataList}>
          <div className={styles.dataRow}>
            <HiOutlineMapPin className={styles.dataIcon} aria-hidden="true" />
            <dt>Ubicación</dt>
            <dd>{bebedero.ubicacion?.trim() || "s/n"}</dd>
          </div>

          <div className={styles.dataRow}>
            <HiOutlineCalendarDays className={styles.dataIcon} aria-hidden="true" />
            <dt>Medición</dt>
            <dd className={styles.measurementValue}>
              <span>{formattedMeasurement.date}</span>
              {formattedMeasurement.time && <small>{formattedMeasurement.time}</small>}
            </dd>
          </div>

          <div className={styles.dataRow}>
            <HiOutlineViewfinderCircle className={styles.dataIcon} aria-hidden="true" />
            <dt>Target</dt>
            <dd>{formatPercentage(bebedero.cobertura_objetivo)}</dd>
          </div>

          <div className={styles.dataRow}>
            <HiOutlineShieldCheck className={styles.dataIcon} aria-hidden="true" />
            <dt>Cobertura</dt>
            <dd>{formatPercentage(coverage)}</dd>
          </div>
          </dl>
        </div>
      </div>
    </article>
  );
}

export default function BebederoCard({ bebedero }: BebederoCardProps) {
  const hasMultipleMeasurements = bebedero.monitoreos.length > 1;

  return (
    <div className={`${styles.card} ${hasMultipleMeasurements ? styles.scrollable : ""}`}>
      <div
        className={styles.horizontalScroll}
        aria-label={`Monitoreos de ${bebedero.nombre}`}
      >
        {bebedero.monitoreos.length > 0 ? (
          bebedero.monitoreos.map((monitoreo, index) => (
            <MeasurementCard
              key={`${bebedero.id}-${index}`}
              bebedero={bebedero}
              monitoreo={monitoreo}
            />
          ))
        ) : (
          <MeasurementCard bebedero={bebedero} />
        )}
      </div>
    </div>
  );
}
