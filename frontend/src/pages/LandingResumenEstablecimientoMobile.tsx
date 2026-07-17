import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Button from "../components/Button/Button";
import Footer from "../components/Footer/Footer";
import HeaderMobile from "../components/Header/HeaderMobile";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../utils/apiFetch";
import styles from "./LandingResumenEstablecimientoMobile.module.css";
import okIcon from "../assets/OK.png";
import cruzIcon from "../assets/CRUZ.png";

type MonitoreoDetalle = {
  fecha?: string;
  timestamp?: string;
  cobertura_capsulas_porciento?: number | null;
  coberturaCapsulasPorciento?: number | null;
};

type BebederoDetalle = {
  id: number;
  nombre: string;
  ubicacion?: string | null;
  cobertura_objetivo?: number | null;
  coberturaObjetivo?: number | null;
  cobertura_minima?: number | null;
  coberturaMinima?: number | null;
  ultima_medicion?: string | null;
  monitoreos: MonitoreoDetalle[];
};

type EstablecimientoDetalleResponse = {
  id: number;
  nombre: string;
  bebederos: Array<{
    id: number;
    nombre: string;
  }>;
};

type HistorialFila = {
  key: string;
  medicionTexto: string;
  coberturaTexto: string;
  estado: "ok" | "desvio" | "sin-dato";
};

type BebederoHistorial = {
  id: number;
  nombre: string;
  ubicacion?: string | null;
  filas: HistorialFila[];
};

function parseMonitoreoDate(monitoreo: MonitoreoDetalle): Date | null {
  const raw = monitoreo.timestamp ?? monitoreo.fecha;
  if (!raw) {
    return null;
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
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

function getCoberturaLectura(monitoreo: MonitoreoDetalle): number | null {
  const value = monitoreo.cobertura_capsulas_porciento ?? monitoreo.coberturaCapsulasPorciento ?? null;
  return typeof value === "number" ? value : null;
}

export default function LandingResumenEstablecimientoMobile() {
  const { id } = useParams();
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const role = user?.role ?? user?.rol;

  const [establecimientoNombre, setEstablecimientoNombre] = useState<string | null>(null);
  const [bebederos, setBebederos] = useState<BebederoDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch(`/api/v1/establecimientos/${id}`);

        if (!response) {
          setError("Sesion expirada. Volve a iniciar sesion.");
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudo obtener el establecimiento");
        }

        const establecimiento: EstablecimientoDetalleResponse = await response.json();
        setEstablecimientoNombre(establecimiento.nombre);

        const detalles = await Promise.all(
          establecimiento.bebederos.map(async (bebederoResumen) => {
            const detalleResponse = await apiFetch(`/api/v1/bebederos/${bebederoResumen.id}`);
        
            if (!detalleResponse || !detalleResponse.ok) {
              throw new Error(`No se pudo obtener el detalle del bebedero ${bebederoResumen.id}`);
            }

            return detalleResponse.json() as Promise<BebederoDetalle>;
          })
        );

        setBebederos(detalles);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Error al cargar el resumen del establecimiento");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [apiFetch, id]);

  const historialPorBebedero = useMemo<BebederoHistorial[]>(() => {
    return bebederos.map((bebedero) => {
      const ordenados = [...bebedero.monitoreos].sort((a, b) => {
        const da = parseMonitoreoDate(a)?.getTime() ?? 0;
        const db = parseMonitoreoDate(b)?.getTime() ?? 0;
        return db - da;
      });

      const monitoreosTop = ordenados.slice(0, 8);

      if (monitoreosTop.length === 0) {
        return {
          id: bebedero.id,
          nombre: bebedero.nombre,
          ubicacion: bebedero.ubicacion,
          filas: [
            {
              key: `${bebedero.id}-sin-dato`,
              medicionTexto: "s/n",
              coberturaTexto: "s/n",
              estado: "sin-dato",
            },
          ],
        };
      }

      return {
        id: bebedero.id,
        nombre: bebedero.nombre,
        ubicacion: bebedero.ubicacion,
        filas: monitoreosTop.map((monitoreo, index) => {
          const lectura = getCoberturaLectura(monitoreo);
          const estado: HistorialFila["estado"] =
          
            lectura == null || bebedero.cobertura_objetivo == null
              ? "sin-dato"
              : lectura >= bebedero.cobertura_objetivo
                ? "ok"
                : "desvio";
       
          return {
            key: `${bebedero.id}-${index}`,
            medicionTexto: formatMedicion(
              monitoreo.timestamp ?? monitoreo.fecha ?? bebedero.ultima_medicion ?? null
            ),
            coberturaTexto: lectura != null ? `${lectura}%` : "s/n",
            estado,
          };
        }),
      };
    });
  }, [bebederos]);

  const handleBackClick = () => {
    if (role === "cliente") {
      window.location.assign("/cliente/establecimientos");
      return;
    }

    window.location.assign("/veterinarios/clientes");
  };

  return (
    <>
      <div className={styles.container}>
        <HeaderMobile />
        {loading && <p className={styles.loading}>Cargando resumen...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && establecimientoNombre && (
          <>
            <section className={styles.sectionHeader}>
              
              <Button
                label=""
                variant="back"
                fullWidth={false}
                onClick={handleBackClick}
              />
              <h1 className={styles.title}>{establecimientoNombre}</h1>
                <Button
                label=""
                variant="back"
                fullWidth={false}
                onClick={handleBackClick}
              />
            </section>

            <section className={styles.historyList}>
              {historialPorBebedero.map((bloque) => (
                <article key={bloque.id} className={styles.bebederoBlock}>
                  <h2 className={styles.bebederoTitle}>
                    {bloque.nombre} - {bloque.ubicacion?.trim() || "s/n"}
                  </h2>

                  <div className={styles.tableCard}>
                    <div className={styles.columnsHeader}>
                      <span>Mediciones</span>
                      <span>Cobertura</span>
                      <span aria-hidden="true" className={styles.iconColumnTitle}></span>
                    </div>

                    <div className={styles.rowsWrapper}>
                      {bloque.filas.map((fila) => ( 
                        <div key={fila.key} className={styles.rowCard}>
                         
                          <span className={styles.cellMedicion}>{fila.medicionTexto}</span>
                          <span className={styles.cellCobertura}>{fila.coberturaTexto}</span>
                          <span className={styles.cellEstado}>
                            {fila.estado === "ok" && (
                              <img className={styles.iconOk} src={okIcon} alt="Dentro de rango" />
                            )}
                            {fila.estado === "desvio" && (
                              <img className={styles.iconDesvio} src={cruzIcon} alt="Debajo del minimo" />
                            )}
                            {fila.estado === "sin-dato" && (
                              <span className={styles.sinDatoTag} aria-label="Sin dato">s/n</span>
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
      </div>

      <Footer />
    </>
  );
}
