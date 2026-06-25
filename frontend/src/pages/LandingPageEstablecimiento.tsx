import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./LandingPageEstablecimiento.module.css";
import BebederoCard from "../components/BebederoCard/BebederoCard";

import { useApi } from "../utils/apiFetch";
import type { Establecimiento, Bebedero } from "../types/Role";

export default function LandingPageEstablecimiento() {
  const navigate = useNavigate();
  const { id } = useParams(); // <-- obtenemos el ID desde la URL
  const { apiFetch } = useApi();

  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga los datos del establecimiento desde el backend.
   * 
   * Endpoint real:
   * GET /api/v1/establecimientos/{id}
   * 
   * apiFetch:
   * - agrega token automáticamente
   * - detecta expiración del token
   * - hace logout automático si expira
   */
  useEffect(() => {
    async function fetchEstablecimiento() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch(`/api/v1/establecimientos/${id}`);

        // Si apiFetch detectó token expirado → response será undefined
        if (!response) return;

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

    fetchEstablecimiento();
  }, [id, apiFetch]);

  if (loading) return <p>Cargando...</p>;
  if (error || !establecimiento) return <p>{error ?? "Sin datos"}</p>;

  /**
   * Agrupamos los bebederos por idBebedero
   * Esto mantiene tu diseño original.
   */
  const bebederosAgrupados: Record<number, Bebedero[]> = {};
  establecimiento.bebederos.forEach((item) => {
    if (!bebederosAgrupados[item.idBebedero]) {
      bebederosAgrupados[item.idBebedero] = [];
    }
    bebederosAgrupados[item.idBebedero].push(item);
  });

  return (
    <div className={styles.container}>
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
    </div>
  );
}
