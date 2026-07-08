import { useState, useEffect } from "react";
import styles from "./ReportsPanel.module.css";


import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";




type AdminSummary = {
  total_usuarios: number;
  total_usuarios_activos: number;
  total_usuarios_inactivos: number;
  total_admins: number;
  total_veterinarios: number;
  total_clientes: number;
  total_establecimientos: number;
  total_bebederos: number;
  total_bebederos_activos: number;
  total_monitoreos: number;
  total_imagenes: number;
  total_eventos: number;
  total_eventos_pendientes: number;
};

export default function ReportsPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

async function loadSummary() {
  try {
    const res = await apiFetch("/api/v1/admin/summary");
  
    if (!res) {
      setError("No se pudo conectar con el servidor.");
      return;
    }

    if (!res.ok) {
      setError("No se pudo cargar el reporte.");
      return;
    }

    const data = await res.json(); console.log("Resumen de reportes:", data);
    setSummary(data);

  } catch (err) {
    setError("Error de conexión con el servidor.");
  } finally {
    setLoading(false);   
  }
}



  useEffect(() => { 
    if (user?.role === "admin") {
      loadSummary();
      
    }
  }, [user]);

  if (loading) {
    return <div className={styles.loading}>Cargando reportes…</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!summary) {
    return <div className={styles.error}>No hay datos disponibles.</div>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Panel de Reportes</h2>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Usuarios</h3>
          <p>Total: {summary.total_usuarios}</p>
          <p>Activos: {summary.total_usuarios_activos}</p>
          <p>Inactivos: {summary.total_usuarios_inactivos}</p>
          <p>Admins: {summary.total_admins}</p>
        </div>

        <div className={styles.card}>
          <h3>Veterinarios</h3>
          <p>Total: {summary.total_veterinarios}</p>
        </div>

        <div className={styles.card}>
          <h3>Clientes</h3>
          <p>Total: {summary.total_clientes}</p>
        </div>

        <div className={styles.card}>
          <h3>Establecimientos</h3>
          <p>Total: {summary.total_establecimientos}</p>
        </div>

        <div className={styles.card}>
          <h3>Bebederos</h3>
          <p>Total: {summary.total_bebederos}</p>
          <p>Activos: {summary.total_bebederos_activos}</p>
        </div>

        <div className={styles.card}>
          <h3>Monitoreos</h3>
          <p>Total: {summary.total_monitoreos}</p>
        </div>

        <div className={styles.card}>
          <h3>Imágenes</h3>
          <p>Total: {summary.total_imagenes}</p>
        </div>

        <div className={styles.card}>
          <h3>Eventos</h3>
          <p>Total: {summary.total_eventos}</p>
          <p>Pendientes: {summary.total_eventos_pendientes}</p>
        </div>
      </div>
    </div>
  );
}
