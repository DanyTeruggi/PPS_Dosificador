import { useCallback, useState, useEffect } from "react";
import styles from "./../Styles/PanelStyles.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/useAuth";

import ReportsGraficos from "./ReportsGraficos";

type AdminSummary = {
  total_usuarios: number;
  total_usuarios_activos: number;
  total_usuarios_inactivos: number;
  total_admins: number;
  total_veterinarios: number;
  total_clientes: number;
};

type BebederoResumen = {
  total: number;
  activos: number;
  inactivos: number;
};

type BebederoAdmin = {
  estado: boolean;
};

export default function ReportsPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [bebederos, setBebederos] = useState<BebederoResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      const [summaryRes, bebederosRes] = await Promise.all([
        apiFetch("/api/v1/admin/summary"),
        apiFetch("/api/v1/admin/bebederos"),
      ]);

      if (!summaryRes?.ok || !bebederosRes?.ok) {
        setError("No se pudo cargar el reporte.");
        return;
      }

      const summaryData = (await summaryRes.json()) as AdminSummary;
      const bebederosData = (await bebederosRes.json()) as BebederoAdmin[];
      const activos = bebederosData.filter((bebedero) => bebedero.estado).length;

      setSummary(summaryData);
      setBebederos({
        total: bebederosData.length,
        activos,
        inactivos: bebederosData.length - activos,
      });

    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    const timeoutId = window.setTimeout(() => { void loadSummary(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadSummary, user?.role]);

  if (loading) return <div className={styles.loading}>Cargando reportes…</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!summary || !bebederos) return <div className={styles.error}>No hay datos disponibles.</div>;

  return (
    <div className={styles.container}>

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

        {/* Dispositivos */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.icon}>📊</span>
            <h3>Dispositivos</h3>
          </div>

          <div className={styles.metrics}>
            <div className={styles.metricRow}>
              <span>Total</span>
              <strong>{bebederos.total}</strong>
            </div>
            <div className={styles.metricRow}>
              <span>Activos</span>
              <strong className={styles.green}>{bebederos.activos}</strong>
            </div>
            <div className={styles.metricRow}>
              <span>Inactivos</span>
              <strong className={styles.red}>{bebederos.inactivos}</strong>
            </div>
          </div>
        </div>

      </div>
      <ReportsGraficos />
    </div>
  );
}
