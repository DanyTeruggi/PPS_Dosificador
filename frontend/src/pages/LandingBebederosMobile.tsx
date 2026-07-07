import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./LandingBebederosMobile.module.css";

import BebederoCard from "../components/BebederoCard/BebederoCard";
import Button from "../components/Button/Button";
import { useApi } from "../utils/apiFetch";
import type { Establecimiento, Bebedero } from "../types/Role";
import Footer from "../components/Footer/Footer";

export default function LandingBebederosMobile() {
  const { id } = useParams();
  const { apiFetch } = useApi();

  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch(`/api/v1/establecimientos/${id}`);

        if (!response) {
          setError("Sesión expirada. Volvé a iniciar sesión.");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudo obtener el establecimiento");
        }

        const json: Establecimiento = await response.json();
        setEstablecimiento(json);

      } catch (err) {
        setError("Error al cargar el establecimiento");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Agrupar lecturas por bebedero usando MAP en vez de forEach
  const bebederosAgrupados: Record<number, Bebedero[]> = {};

  if (establecimiento) {
    establecimiento.bebederos.map((item) => {
      if (!bebederosAgrupados[item.idBebedero]) {
        bebederosAgrupados[item.idBebedero] = [];
      }
      bebederosAgrupados[item.idBebedero].push(item);
      return null; // para evitar warning de map sin return útil
    });
  }

  return (
    <>
      <div className={styles.container}>

        {!loading && !error && establecimiento && (
          <Button
            label="<"
            variant="tertiary"
            fullWidth={false}
            onClick={() => window.location.assign("/cliente/establecimientos")}
          />
        )}

        {/* LOADING */}
        {loading && (
          <p className={styles.loading}>Cargando...</p>
        )}

        {/* ERROR */}
        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {/* CONTENIDO PRINCIPAL */}
        {!loading && !error && establecimiento && (
          <>
            <h1 className={styles.title}>{establecimiento.nombre}</h1>

            <div className={styles.bebederosList}>
              {Object.values(bebederosAgrupados).map((lecturas, index) => (
                <div key={index} className={styles.cardWrapper}>
                  <BebederoCard bebedero={lecturas} />
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* FOOTER SIEMPRE VISIBLE */}
      <Footer />
    </>
  );
}
