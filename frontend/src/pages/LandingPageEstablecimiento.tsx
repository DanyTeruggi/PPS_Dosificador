import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./LandingPageEstablecimiento.module.css";
import Footer from "../components/Footer/Footer";
import  HeaderMobile  from "../components/Header/HeaderMobile";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../utils/apiFetch";
import Button from "../components/Button/Button";

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
  // const clienteIdParam = searchParams.get("clienteId");
  const location = useLocation();
  const clienteIdState = location.state?.clienteId;
  const clienteIdParam = clienteIdState ?? searchParams.get("clienteId");


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
            setError("Seleccione un cliente para ver sus establecimientos.");
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


  const establecimientos = role === "veterinario"
    ? establecimientosVet
    : cliente?.establecimientos ?? [];

  const title = role === "veterinario"
    ? `${nombreClienteVeterinario ?? ""}`
    : "Seleccione un establecimiento";

      const handleBackClick = () => {
    if (role === "cliente") {
      window.location.assign("/cliente/establecimientos");
      return;
    }

    window.location.assign("/veterinarios/clientes");
  };

  return (
    <div className={styles.container}>
      <HeaderMobile />
      <section className={styles.sectionHeader}>
              
              <Button
                label=""
                variant="back"
                fullWidth={false}
                onClick={handleBackClick}
              />
              <h1 className={styles.title}>{title}</h1>
                <Button
                label=""
                variant="back"
                fullWidth={false}
                onClick={handleBackClick}
              />
            </section>
    

      <section className={styles.section}>
        
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
