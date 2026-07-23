import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineChevronRight, HiOutlineUserGroup } from "react-icons/hi2";
import EmptyState from "../../components/EmptyState/EmptyState";
import { useApi } from "../../utils/apiFetch";
import { formatBusinessName } from "../../utils/formatBusinessName";
import { getInitials } from "../../utils/getInitials";
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
      <LandingHeader title="Seleccione un Cliente" icon={<HiOutlineUserGroup />} />
      <LandingPageStatus loading={loading} error={error} loadingMessage="Cargando clientes..." />

      {!loading && !error && clientes.length === 0 && (
        <EmptyState message="No tenes clientes asociados." />
      )}

      {!loading && !error && clientes.length > 0 && (
        <ul className={styles.list}>
          {clientes.map((cliente) => {
            const displayName = formatBusinessName(cliente.razon_social);

            return (
              <li key={cliente.id}>
                <button className={styles.item} type="button" onClick={() => handleSelect(cliente.id)}>
                  <span className={styles.initials} aria-hidden="true">
                    {getInitials(displayName)}
                  </span>
                  <span className={styles.clientName}>{displayName}</span>
                  <HiOutlineChevronRight className={styles.itemArrow} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </LandingMobileLayout>
  );
}
