import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPageEstablecimiento.module.css";
import Footer from "../components/Footer/Footer";

import { useAuth } from "../context/AuthContext";
import { useApi } from "../utils/apiFetch";

type EstablecimientoResumen = {
  id: number;
  nombre: string;
};

type ClienteMe = {
  id: number;
  razon_social: string;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
  };
  establecimientos: EstablecimientoResumen[];
};

export default function LandingPageEstablecimiento() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { apiFetch } = useApi();

  const [cliente, setCliente] = useState<ClienteMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCliente() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch("/api/v1/clientes/me");

        if (!response) {
          setError("Sesión expirada. Volvé a iniciar sesión.");
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudo obtener el perfil del cliente");
        }

        const json: ClienteMe = await response.json();
        setCliente(json);

      } catch (err) {
        setError("Error al cargar los establecimientos del usuario");
      } finally {
        setLoading(false);
      }
    }

    fetchCliente();
  }, [apiFetch]);

  const nombreUsuario = cliente?.usuario.nombre ?? user?.nombre ?? "usuario";
  const establecimientos = cliente?.establecimientos ?? [];

  return (
    <div className={styles.container}>

      <header className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/home")}
          aria-label="Volver"
        >
          &lt;
        </button>
        <div>
          <h1 className={styles.title}>Hola {nombreUsuario}</h1>
          <p className={styles.subtitle}>Seleccioná un establecimiento para ver sus bebederos.</p>
        </div>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Establecimientos asociados</h2>

        {loading && <p className={styles.message}>Cargando establecimientos...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && establecimientos.length === 0 && (
          <p className={styles.message}>No tenés establecimientos asociados.</p>
        )}

        <ul className={styles.establecimientosList}>
          {establecimientos.map((est) => (
            <li
              key={est.id}
            >
              <button
                type="button"
                className={styles.establecimientoItem}
                onClick={() => navigate(`/establecimiento/${est.id}/bebederos`)}
              >
                {est.nombre}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Footer />
    </div>
  );
}
