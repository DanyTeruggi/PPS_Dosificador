import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./LandingPageEstablecimiento.module.css";
import Footer from "../components/Footer/Footer";

import { useAuth } from "../context/AuthContext";
import { useApi } from "../utils/apiFetch";

type EstablecimientoResumen = {
  id: number;
  nombre: string;
  ubicacion?: string | null;
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

type ClienteVeterinario = {
  id: number;
  razon_social: string;
};

type VeterinarioMe = {
  id: number;
  clientes: ClienteVeterinario[];
};

export default function LandingPageEstablecimiento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { apiFetch } = useApi();
  const role = user?.role ?? user?.rol;
  const clienteIdParam = searchParams.get("clienteId");

  const [cliente, setCliente] = useState<ClienteMe | null>(null);
  const [nombreClienteVeterinario, setNombreClienteVeterinario] = useState<string | null>(null);
  const [establecimientosVet, setEstablecimientosVet] = useState<EstablecimientoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        if (role === "veterinario") {
          if (!clienteIdParam) {
            setError("Seleccioná un cliente para ver sus establecimientos.");
            return;
          }

          const clientesRes = await apiFetch("/api/v1/veterinarios/me");
          if (!clientesRes || !clientesRes.ok) {
            throw new Error("No se pudo obtener los clientes del veterinario");
          }

          const veterinario: VeterinarioMe = await clientesRes.json();
          const clientes = veterinario.clientes ?? [];
          const clienteSeleccionado = clientes.find((c) => c.id === Number(clienteIdParam));

          if (!clienteSeleccionado) {
            setError("El cliente seleccionado no está asignado al veterinario.");
            return;
          }

          const estRes = await apiFetch(
            `/api/v1/veterinarios/clientes/${clienteSeleccionado.id}/establecimientos`
          );

          if (!estRes || !estRes.ok) {
            throw new Error("No se pudo obtener los establecimientos del cliente");
          }

          const establecimientos: EstablecimientoResumen[] = await estRes.json();
          setNombreClienteVeterinario(clienteSeleccionado.razon_social);
          setEstablecimientosVet(establecimientos);
          return;
        }

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

    fetchData();
  }, [apiFetch, role, clienteIdParam]);

  const nombreUsuario = role === "veterinario"
    ? user?.nombre ?? "usuario"
    : cliente?.usuario.nombre ?? user?.nombre ?? "usuario";
  const establecimientos = role === "veterinario"
    ? establecimientosVet
    : cliente?.establecimientos ?? [];
  const subtitle = role === "veterinario"
    ? `Cliente: ${nombreClienteVeterinario ?? ""}`
    : "Seleccioná un establecimiento para ver sus bebederos.";

  return (
    <div className={styles.container}>

      <header className={styles.header}>
  
        <div>
          <h1 className={styles.title}>Hola {nombreUsuario}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </header>

      <section className={styles.section}>
        {/* <h2 className={styles.sectionTitle}>Establecimientos asociados</h2> */}

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
