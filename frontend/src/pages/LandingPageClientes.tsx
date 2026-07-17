import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPageEstablecimiento.module.css";
import Footer from "../components/Footer/Footer";
import HeaderMobile from "../components/Header/HeaderMobile";


import { useApi } from "../utils/apiFetch";
import Button from "../components/Button/Button";

type ClienteAsignado = {
  id: number;
  razon_social: string;
};

type VeterinarioMe = {
  id: number;
  nombre: string;
  clientes: ClienteAsignado[];
};

export default function LandingPageClientes() {
  const navigate = useNavigate();
  const { apiFetch } = useApi();

  const [clientes, setClientes] = useState<ClienteAsignado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientesVeterinario() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch("/api/v1/veterinarios/me");

        if (!response) {
          setError("Sesión expirada. Volvé a iniciar sesión.");
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudo obtener los clientes del veterinario");
        }

        const json: VeterinarioMe = await response.json();
        setClientes(json.clientes ?? []);

      } catch (err) {
        setError("Error al cargar los clientes del usuario");
      } finally {
        setLoading(false);
      }
    }

    fetchClientesVeterinario();
  }, [apiFetch]);

  

        const handleBackClick = () => {
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
              <h1 className={styles.title}>Seleccione un cliente</h1>
                <Button
                label=""
                variant="back"
                fullWidth={false}
                onClick={handleBackClick}
              />
            </section>



      <section className={styles.section}>
      
        {loading && <p className={styles.message}>Cargando clientes...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && clientes.length === 0 && (
          <p className={styles.message}>No tenés clientes asociados.</p>
        )}

        <ul className={styles.establecimientosList}>
          {clientes.map((cliente) => (
            <li
              key={cliente.id}
            >
              <button
                type="button"
                className={styles.establecimientoItem}
                // onClick={() => navigate(`/cliente/establecimientos?clienteId=${cliente.id}`)}
                onClick={() => navigate(`/cliente/establecimientos`, 
                  { state: { clienteId: cliente.id } }
                )}
              >
                {cliente.razon_social}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Footer />
    </div>
  );
}
