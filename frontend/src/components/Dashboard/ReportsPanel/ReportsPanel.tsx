import { useState, useEffect } from "react";
import styles from "./ReportsPanel.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";

import ReportsGraficos from "./ReportsGraficos";

type AdminSummary = {
  total_usuarios: number;
  total_usuarios_activos: number;
  total_usuarios_inactivos: number;
  total_admins: number;
  total_veterinarios: number;
  total_clientes: number;
  total_monitoreos: number;
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

      if (!res?.ok) {
        setError("No se pudo cargar el reporte.");
        return;
      }

      const data = await res.json();
      setSummary(data);

    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === "admin") loadSummary();
  }, [user]);

  if (loading) return <div className={styles.loading}>Cargando reportes…</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!summary) return <div className={styles.error}>No hay datos disponibles.</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Panel de Reportes</h2>

      <div className={styles.grid}>

        {/* Usuarios */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>👥</span>
            <h3>Usuarios</h3>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metricRow}>
              <span>Total</span>
              <strong>{summary.total_usuarios}</strong>
            </div>
            <div className={styles.metricRow}>
              <span>Activos</span>
              <strong className={styles.green}>{summary.total_usuarios_activos}</strong>
            </div>
            <div className={styles.metricRow}>
              <span>Inactivos</span>
              <strong className={styles.red}>{summary.total_usuarios_inactivos}</strong>
            </div>
            <div className={styles.metricRow}>
              <span>Admins</span>
              <strong>{summary.total_admins}</strong>
            </div>
          </div>
        </div>

        {/* Veterinarios */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>🐾</span>
            <h3>Veterinarios</h3>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metricRow}>
              <span>Total</span>
              <strong>{summary.total_veterinarios}</strong>
            </div>
          </div>
        </div>

        {/* Clientes */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>🧑‍💼</span>
            <h3>Clientes</h3>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metricRow}>
              <span>Total</span>
              <strong>{summary.total_clientes}</strong>
            </div>
          </div>
        </div>

        {/* Monitoreos */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>📊</span>
            <h3>Monitoreos</h3>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metricRow}>
              <span>Total</span>
              <strong>{summary.total_monitoreos}</strong>
            </div>
          </div>
        </div>

      </div>
      <ReportsGraficos />
    </div>
  );
}
