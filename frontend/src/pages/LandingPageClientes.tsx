import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPageEstablecimiento.module.css";
import Footer from "../components/Footer/Footer";
import HeaderMobile from "../components/Header/HeaderMobile";

import { useAuth } from "../context/AuthContext";
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
  const { user } = useAuth();
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

  const nombreUsuario = user?.nombre ?? "usuario";

  return (
    <div className={styles.container}>
      <HeaderMobile />
      <header className={styles.header}>
       
        {/* <Button
          label="Volver"
          variant="back"
          onClick={() => navigate("/home")}
        >
        </Button> */}

        <div>
          {/* <h1 className={styles.title}>Hola {nombreUsuario}</h1> */}
          <h2 className={styles.title}>Seleccione un cliente.</h2>
        </div>
      </header>

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
