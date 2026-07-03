import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./LandingPageEstablecimiento.module.css";
import BebederoCard from "../components/BebederoCard/BebederoCard";
import Footer from "../components/Footer/Footer";

import { useApi } from "../utils/apiFetch";
import type { Establecimiento, Bebedero } from "../types/Role";

export default function LandingPageEstablecimiento() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { apiFetch } = useApi();

  // Usuario logueado
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Estado del establecimiento seleccionado
  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [loadingEst, setLoadingEst] = useState(true);
  const [errorEst, setErrorEst] = useState<string | null>(null);

  // Cargar establecimiento por ID
  useEffect(() => {
    async function fetchEstablecimiento() {
      try {
        setLoadingEst(true);
        setErrorEst(null);

        const response = await apiFetch(`/api/v1/establecimientos/${id}`);

        if (!response) {
          setErrorEst("Sesión expirada. Volvé a iniciar sesión.");
          setLoadingEst(false);
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudo obtener el establecimiento");
        }

        const json: Establecimiento = await response.json();
        setEstablecimiento(json);

      } catch (err) {
        setErrorEst("Error al cargar el establecimiento");
      } finally {
        setLoadingEst(false);
      }
    }

    fetchEstablecimiento();
  }, [id]);

  // Agrupación de bebederos (solo si cargó bien)
  const bebederosAgrupados: Record<number, Bebedero[]> = {};
  if (establecimiento) {
    establecimiento.bebederos.forEach((item) => {
      if (!bebederosAgrupados[item.idBebedero]) {
        bebederosAgrupados[item.idBebedero] = [];
      }
      bebederosAgrupados[item.idBebedero].push(item);
    });
  }

  return (
    <div className={styles.container}>

      {/* ------------------------------ */}
      {/* SALUDO + LISTA DE ESTABLECIMIENTOS */}
      {/* ------------------------------ */}

      <h1 className={styles.saludo}>Hola {user.nombre}</h1>

      <h2 className={styles.sectionTitle}>Establecimientos</h2>

      {/* Lista de establecimientos del usuario */}
      <div className={styles.establecimientosList}>
        {user.establecimientos?.length === 0 && (
          <p>No tenés establecimientos asociados.</p>
        )}

        {user.establecimientos?.map((est: any) => (
          <button
            key={est.id}
            className={styles.establecimientoItem}
            onClick={() => navigate(`/establecimiento/${est.id}/bebederos`)}
          >
            {est.nombre}
          </button>
        ))}
      </div>

      {/* ------------------------------ */}
      {/* DETALLE DEL ESTABLECIMIENTO SELECCIONADO */}
      {/* ------------------------------ */}

      {loadingEst && <p>Cargando establecimiento...</p>}
      {errorEst && <p className={styles.error}>{errorEst}</p>}

      {establecimiento && (
        <>
          <header className={styles.header}>
            <button
              type="button"
              className={styles.backButton}
              onClick={() => navigate("/role-landing")}
            >
              &lt;
            </button>
            <h1 className={styles.title}>{establecimiento.nombre}</h1>
          </header>

          <div className={styles.listContainer}>
            {Object.values(bebederosAgrupados).map((mediciones, index) => (
              <BebederoCard key={index} bebedero={mediciones} />
            ))}
          </div>
        </>
      )}
      < Footer />
    </div>
    
  );
}
