import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import type { Rol, RoleData } from "../../types/Role";
import { useNavigate } from "react-router-dom";
import styles from "./RoleLanding.module.css";
import Footer from "../Footer/Footer";

export default function RoleLanding() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const nombre = state?.nombre ?? "Usuario";
  const rol: Rol = state?.rol ?? "Productor";

  const [data, setData] = useState<RoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRoleData() {
      try {
        setLoading(true);
        setError(null);

         // MOCK mientras no hay backend
        const response = await fetch(`/mock/${rol.toLowerCase()}.json`);

        //reemplazar por backend real
        //const response = await fetch("/api/login", { method: "POST", body: ... });

        if (!response.ok) {
          throw new Error("No se pudo obtener la información");
        }

        const json: RoleData = await response.json();
        setData(json);

      } catch (err) {
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    }

    fetchRoleData();
  }, [rol]);

  if (loading) return <p>Cargando...</p>;
  if (error || !data) return <p>{error ?? "Sin datos"}</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Hola {nombre} !!!</h1>
      <h2 className={styles.subtitle}>{data.titulo}:</h2>

      <div className={styles.list}>
        {data.items.map((item, index) => {
          const isEstablecimiento = "nombre" in item;
          const isCliente = "cliente" in item;


          return (
            <div key={index}
            className={styles.item}
            onClick={() => {
              if (isEstablecimiento) {
            navigate("/establecimiento", { state: { establecimiento: item } });
          }
        }}
        >
              <span className={styles.star}>✦</span>

              {isEstablecimiento && item.nombre}
              {isCliente && item.cliente}
            </div>
          );
        })}
      </div>


      <Footer />
    </div>
  );
}
