import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import EmptyState from "../../components/EmptyState/EmptyState";
import { useApi } from "../../utils/apiFetch";
import LandingHeader from "./LandingHeader";
import LandingMobileLayout from "./LandingMobileLayout";
import LandingPageStatus from "./LandingPageStatus";
import styles from "./LandingSelection.module.css";

type ClienteAsignado = {
  id: number;
  razon_social: string;
};

type VeterinarioResponse = {
  clientes: ClienteAsignado[];
};

/** Nueva pagina para que el veterinario seleccione un cliente. */
export default function LandingClientes() {
  const navigate = useNavigate();
  const { apiFetch } = useApi();
  const [clientes, setClientes] = useState<ClienteAsignado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientes() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch("/api/v1/veterinarios/me");
        if (!response) {
          setError("Sesion expirada. Volve a iniciar sesion.");
          return;
        }
        if (!response.ok) throw new Error("No se pudieron obtener los clientes");

        const data: VeterinarioResponse = await response.json();
        setClientes(data.clientes ?? []);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Error al cargar los clientes.");
      } finally {
        setLoading(false);
      }
    }

    fetchClientes();
  }, [apiFetch]);

  function handleSelect(clienteId: number) {
    // El identificador permite recargar la pagina sin perder la seleccion.
    navigate(`/cliente/establecimientos?clienteId=${clienteId}`);
  }

  return (
    <LandingMobileLayout>
      <LandingHeader title="Seleccione un cliente" />
      <LandingPageStatus loading={loading} error={error} loadingMessage="Cargando clientes..." />

      {!loading && !error && clientes.length === 0 && (
        <EmptyState message="No tenes clientes asociados." />
      )}

      {!loading && !error && clientes.length > 0 && (
        <ul className={styles.list}>
          {clientes.map((cliente) => (
            <li key={cliente.id}>
              <button className={styles.item} type="button" onClick={() => handleSelect(cliente.id)}>
                {cliente.razon_social}
              </button>
            </li>
          ))}
        </ul>
      )}
    </LandingMobileLayout>
  );
}

