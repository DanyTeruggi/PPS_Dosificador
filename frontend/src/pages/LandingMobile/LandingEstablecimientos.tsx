import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import EmptyState from "../../components/EmptyState/EmptyState";
import { useAuth } from "../../context/AuthContext";
import { useApi } from "../../utils/apiFetch";
import LandingHeader from "./LandingHeader";
import LandingMobileLayout from "./LandingMobileLayout";
import LandingPageStatus from "./LandingPageStatus";
import styles from "./LandingSelection.module.css";

type Establecimiento = { id: number; nombre: string };
type Cliente = { id: number; razon_social: string };
type ClienteResponse = { establecimientos: Establecimiento[] };
type VeterinarioResponse = { clientes: Cliente[] };

/** Nueva pagina para seleccionar un establecimiento. */
export default function LandingEstablecimientos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { apiFetch } = useApi();
  const { user } = useAuth();
  const role = user?.role ?? user?.rol;
  const clienteId = searchParams.get("clienteId");

  const [title, setTitle] = useState("Seleccione un establecimiento");
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEstablecimientos() {
      try {
        setLoading(true);
        setError(null);

        if (role === "veterinario") {
          if (!clienteId) {
            setError("Selecciona un cliente para ver sus establecimientos.");
            return;
          }

          const veterinarioResponse = await apiFetch("/api/v1/veterinarios/me");
          if (!veterinarioResponse?.ok) throw new Error("No se pudo validar el cliente");

          const veterinario: VeterinarioResponse = await veterinarioResponse.json();
          const cliente = veterinario.clientes.find((item) => item.id === Number(clienteId));
          if (!cliente) throw new Error("El cliente no esta asignado al veterinario");

          const response = await apiFetch(`/api/v1/veterinarios/clientes/${cliente.id}/establecimientos`);
          if (!response?.ok) throw new Error("No se pudieron obtener los establecimientos");

          setTitle(cliente.razon_social);
          setEstablecimientos(await response.json());
          return;
        }

        const response = await apiFetch("/api/v1/clientes/me");
        if (!response) {
          setError("Sesion expirada. Volve a iniciar sesion.");
          return;
        }
        if (!response.ok) throw new Error("No se pudo obtener el perfil del cliente");

        const cliente: ClienteResponse = await response.json();
        setEstablecimientos(cliente.establecimientos ?? []);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Error al cargar los establecimientos.");
      } finally {
        setLoading(false);
      }
    }

    fetchEstablecimientos();
  }, [apiFetch, clienteId, role]);

  return (
    <LandingMobileLayout>
      <LandingHeader
        title={title}
        onBack={role === "veterinario" ? () => navigate("/veterinarios/clientes") : undefined}
      />
      <LandingPageStatus loading={loading} error={error} loadingMessage="Cargando establecimientos..." />

      {!loading && !error && establecimientos.length === 0 && (
        <EmptyState
          message={role === "veterinario"
            ? "Este cliente no tiene establecimientos asociados."
            : "No tenes establecimientos asociados."}
        />
      )}

      {!loading && !error && establecimientos.length > 0 && (
        <ul className={styles.list}>
          {establecimientos.map((establecimiento) => (
            <li key={establecimiento.id}>
              <button
                className={styles.item}
                type="button"
                onClick={() => navigate(`/establecimiento/${establecimiento.id}/bebederos`)}
              >
                {establecimiento.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}
    </LandingMobileLayout>
  );
}

