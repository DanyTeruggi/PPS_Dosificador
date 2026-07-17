import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import errorIcon from "../../assets/CRUZ.png";
import okIcon from "../../assets/OK.png";
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
  if (!raw) return "s/n";

  const fecha = new Date(raw);
  if (Number.isNaN(fecha.getTime())) return raw;

  return `${fecha.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })} Hs`;
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
      filas: [{ key: `${bebedero.id}-sin-dato`, fecha: "s/n", cobertura: "s/n", estado: "sin-dato" }],
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

      return {
        key: `${bebedero.id}-${index}`,
        fecha: formatFecha(getFecha(monitoreo) ?? bebedero.ultima_medicion ?? undefined),
        cobertura: cobertura == null ? "s/n" : `${cobertura}%`,
        estado,
      };
    }),
  };
}

/** Nueva pagina de resumen. Todavia no esta conectada al enrutado. */
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
                <h2 className={styles.bebederoTitle}>{historial.titulo}</h2>

                <div className={styles.tableCard}>
                  <div className={styles.columnsHeader}>
                    <span>Mediciones</span>
                    <span>Cobertura</span>
                    <span aria-hidden="true" />
                  </div>

                  <div className={styles.rowsWrapper}>
                    {historial.filas.map((fila) => (
                      <div key={fila.key} className={styles.rowCard}>
                        <span className={styles.cell}>{fila.fecha}</span>
                        <span className={styles.cell}>{fila.cobertura}</span>
                        <span className={styles.statusCell}>
                          {fila.estado === "ok" && (
                            <img className={styles.statusIcon} src={okIcon} alt="Dentro de rango" />
                          )}
                          {fila.estado === "desvio" && (
                            <img className={styles.statusIcon} src={errorIcon} alt="Debajo del objetivo" />
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
