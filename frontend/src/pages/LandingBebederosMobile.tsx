import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./LandingBebederosMobile.module.css";

import BebederoCard from "../components/BebederoCard/BebederoCard";
import Button from "../components/Button/Button";
import { useApi } from "../utils/apiFetch";
import Footer from "../components/Footer/Footer";
import { useAuth } from "../context/AuthContext";


type EstablecimientoDetalleResponse = {
  id: number;
  cliente_id: number;
  cliente_razon_social: string;
  nombre: string;
  ubicacion?: string | null;
  fecha_creacion: string;
  bebederos: Array<{
    id: number;
    nombre: string;
  }>;
};

type BebederoDetalle = {
  id: number;
  nombre: string;
  ubicacion?: string | null;
  cobertura_objetivo: number;
  ultima_medicion?: string | null;
  monitoreos: Array<{
    imagenes: Array<{
      image_url?: string | null;
    }>;
  }>;
};

export default function LandingBebederosMobile() {
  const { id } = useParams();
  const navigate = useNavigate();
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
          setError("Sesión expirada. Volvé a iniciar sesión.");
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudo obtener el establecimiento");
        }

        const json: EstablecimientoDetalleResponse = await response.json();
        setEstablecimientoNombre(json.nombre);

        const bebederosConDetalle = await Promise.all(
          json.bebederos.map(async (bebederoResumen: { id: number; nombre: string }) => {
            const detalleResponse = await apiFetch(`/api/v1/bebederos/${bebederoResumen.id}`);

            if (!detalleResponse || !detalleResponse.ok) {
              throw new Error(`No se pudo obtener el detalle del bebedero ${bebederoResumen.id}`);
            }

            return detalleResponse.json() as Promise<BebederoDetalle>;
          })
        );

        setBebederos(bebederosConDetalle);

      } catch (err) {
        setError("Error al cargar el establecimiento");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

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

        
          
       

        {/* LOADING */}
        {loading && (
          <p className={styles.loading}>Cargando...</p>
        )}

        {/* ERROR */}
        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {/* CONTENIDO PRINCIPAL */}
        {!loading && !error && establecimientoNombre && (
          <>
          <section className={styles.sectionHeader}>
          
              <Button variant="back" onClick={handleBackClick} label="" />
              
              <h1 className={styles.title}>{establecimientoNombre}</h1>
          
              <Button
                variant="dashboard"
                fullWidth={false}
                label=""
                onClick={() => navigate(`/establecimiento/${id}/resumen`)}
              />

          </section>

            <div className={styles.bebederosList}>
              {bebederos.map((bebedero) => (
                <div key={bebedero.id} className={styles.cardWrapper}>
                  <BebederoCard bebedero={bebedero} />
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
