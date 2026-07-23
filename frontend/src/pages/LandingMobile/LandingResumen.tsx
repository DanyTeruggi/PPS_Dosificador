import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { HiOutlineCalendarDays, HiOutlineMapPin } from "react-icons/hi2";

import EmptyState from "../../components/EmptyState/EmptyState";
import useEstablecimientoBebederos from "../../hooks/useEstablecimientoBebederos";
import type { BebederoDetalle, MonitoreoDetalle } from "../../types/landingTypes";
import LandingHeader from "./LandingHeader";
import LandingMobileLayout from "./LandingMobileLayout";
import LandingPageStatus from "./LandingPageStatus";
import styles from "./LandingResumen.module.css";

type EstadoMedicion = "ok" | "desvio" | "sin-dato";

type FilaHistorial = {
  key: string;
  fecha: string;
  hora: string;
  cobertura: string;
  estado: EstadoMedicion;
};

type HistorialBebedero = {
  id: number;
  titulo: string;
  filas: FilaHistorial[];
};

function getFecha(monitoreo: MonitoreoDetalle) {
  return monitoreo.timestamp ?? monitoreo.fecha;
}

function getCobertura(monitoreo: MonitoreoDetalle) {
  return monitoreo.cobertura_capsulas_porciento
    ?? monitoreo.coberturaCapsulasPorciento
    ?? null;
}

function formatFecha(raw?: string) {
  if (!raw) return { fecha: "s/n", hora: "" };

  const fecha = new Date(raw);
  if (Number.isNaN(fecha.getTime())) return { fecha: raw, hora: "" };

  return {
    fecha: fecha.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    hora: `${fecha.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })} Hs`,
  };
}

/** Convierte los datos de un bebedero en filas listas para mostrar. */
function createHistorial(bebedero: BebederoDetalle): HistorialBebedero {
  const monitoreos = [...bebedero.monitoreos]
    .sort((a, b) => {
      const fechaA = new Date(getFecha(a) ?? 0).getTime();
      const fechaB = new Date(getFecha(b) ?? 0).getTime();
      return fechaB - fechaA;
    })
    .slice(0, 8);

  const titulo = `${bebedero.nombre} - ${bebedero.ubicacion?.trim() || "s/n"}`;

  if (monitoreos.length === 0) {
    return {
      id: bebedero.id,
      titulo,
      filas: [{ key: `${bebedero.id}-sin-dato`, fecha: "s/n", hora: "", cobertura: "s/n", estado: "sin-dato" }],
    };
  }

  return {
    id: bebedero.id,
    titulo,
    filas: monitoreos.map((monitoreo, index) => {
      const cobertura = getCobertura(monitoreo);
      const estado: EstadoMedicion = cobertura == null
        ? "sin-dato"
        : cobertura >= bebedero.cobertura_objetivo
          ? "ok"
          : "desvio";

      const fechaFormateada = formatFecha(
        getFecha(monitoreo) ?? bebedero.ultima_medicion ?? undefined,
      );

      return {
        key: `${bebedero.id}-${index}`,
        fecha: fechaFormateada.fecha,
        hora: fechaFormateada.hora,
        cobertura: cobertura == null ? "s/n" : `${cobertura}%`,
        estado,
      };
    }),
  };
}

export default function LandingResumen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { establecimientoNombre, bebederos, loading, error } =
    useEstablecimientoBebederos(id);

  const historiales = useMemo(
    () => bebederos.map(createHistorial),
    [bebederos],
  );

  function handleBack() {
    navigate(`/establecimiento/${id}/bebederos`);
  }

  return (
    <LandingMobileLayout>
      <LandingPageStatus
        loading={loading}
        error={error}
        loadingMessage="Cargando resumen..."
      />

      {!loading && !error && establecimientoNombre && (
        <>
          <LandingHeader
            title={establecimientoNombre}
            subtitle="Panel de Resumen"
            onBack={handleBack}
            rightAction={null}
          />

          <section className={styles.historyList}>
            {bebederos.length === 0 && (
              <EmptyState message="Este establecimiento no tiene bebederos asociados." />
            )}

            {bebederos.length > 0 && historiales.every((historial) =>
              historial.filas.every((fila) => fila.estado === "sin-dato")) && (
                <EmptyState message="Todavia no hay mediciones registradas para este establecimiento." />
              )}

            {historiales.map((historial) => (
              <article key={historial.id} className={styles.bebederoBlock}>
                <h2 className={styles.bebederoTitle}>
                  <HiOutlineMapPin className={styles.titlePin} aria-hidden="true" />
                  <span>{historial.titulo}</span>
                </h2>

                <div className={styles.tableCard}>
                  <div className={styles.columnsHeader}>
                    <span className={styles.measurementsHeader}>Mediciones</span>
                    <span className={styles.coverageHeader}>Cobertura</span>
                    <span aria-hidden="true" />
                  </div>

                  <div className={styles.rowsWrapper}>
                    {historial.filas.map((fila) => (
                      <div key={fila.key} className={styles.rowCard}>
                        <span className={styles.calendarBox} aria-hidden="true">
                          <HiOutlineCalendarDays />
                        </span>
                        <span className={styles.dateCell}>
                          <span>{fila.fecha}</span>
                          {fila.hora && <small>{fila.hora}</small>}
                        </span>
                        <span className={`${styles.cell} ${styles.coverageCell}`}>
                          {fila.cobertura}
                        </span>
                        <span className={styles.statusCell}>
                          {fila.estado === "ok" && (
                            <span
                              aria-label="Dentro de rango"
                              className={`${styles.statusIndicator} ${styles.statusOk}`}
                              role="img"
                            />
                          )}
                          {fila.estado === "desvio" && (
                            <span
                              aria-label="Fuera de rango"
                              className={`${styles.statusIndicator} ${styles.statusError}`}
                              role="img"
                            />
                          )}
                          {fila.estado === "sin-dato" && (
                            <span className={styles.noData} aria-label="Sin dato">s/n</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </section>

        </>
      )}
    </LandingMobileLayout>
  );
}
