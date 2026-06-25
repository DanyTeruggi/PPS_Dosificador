import { useState, useEffect } from "react";
import styles from "./ReportsPanel.module.css";
import { Chart } from "react-chartjs-2";

import bebederosMock from "../../../../public/mock/bebderos.json";
import usuariosMock from "../../../../public/mock/usuarios.json";


import type { Bebedero } from "../../../types/Bebedero";
import type { User } from "../../../types/User";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  TimeScale
} from "chart.js";

import "chartjs-adapter-date-fns";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, TimeScale);

export default function ReportsPanel() {
  const [filter, setFilter] = useState("inactivos");

  const [bebederos, setBebederos] = useState<Bebedero[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);

  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: []
  });

  useEffect(() => {
    setBebederos(bebederosMock as Bebedero[]);
    setUsuarios(usuariosMock as User[]);
  }, []);

  useEffect(() => {
    /* ────────────────────────────────────────────────
       REPORTE 1: BEBEDEROS INACTIVOS (PERÍODOS)
    ───────────────────────────────────────────────── */
    if (filter === "inactivos") {
      const data = bebederos.flatMap(b =>
        b.inactividad.map(rango => ({
          x: [
            new Date(rango.desde).getTime(),
            new Date(rango.hasta).getTime()
          ],
          y: `Bebedero ${b.id}`
        }))
      );

      const labels = [...new Set(data.map(d => d.y))];

      setChartData({
        labels,
        datasets: [
          {
            label: "Períodos de inactividad",
            data,
            backgroundColor: "#d9534f"
          }
        ]
      });

      return;
    }

    /* ────────────────────────────────────────────────
       REPORTE 2: REAPROVISIONAR
    ───────────────────────────────────────────────── */
    if (filter === "reaprovisionar") {
      const pendientes = bebederos.filter(
        b => b.watertank < b.coberturaMinima
      ).length;

      setChartData({
        labels: ["Pendientes de Reaprovisionar"],
        datasets: [
          {
            label: "Cantidad",
            data: [pendientes],
            backgroundColor: "#ff8c42"
          }
        ]
      });

      return;
    }

    /* ────────────────────────────────────────────────
       REPORTE 3: STOCK DE BACTERIAS
    ───────────────────────────────────────────────── */
    if (filter === "stockUsuarios") {
      const labels = usuarios.map(u => u.nombre);
      const stock = usuarios.map(u => u.stockBacterias ?? 0);

      setChartData({
        labels,
        datasets: [
          {
            label: "Stock de bacterias",
            data: stock,
            backgroundColor: "#4fa3a1"
          }
        ]
      });

      return;
    }
  }, [filter, bebederos, usuarios]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Reportes</h2>

      <div className={styles.filterBar}>
        <select
          className={styles.select}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="inactivos">Bebederos inactivos (por períodos)</option>
          <option value="reaprovisionar">Pendientes de reaprovisionar</option>
          <option value="stockUsuarios">Stock de bacterias por usuario</option>
        </select>
      </div>

      <div className={styles.chartContainer}>
        <Chart
          type="bar"
          data={chartData}
          options={{
            indexAxis: filter === "inactivos" ? "y" : "x",
            parsing: false,
            responsive: true,
            scales: {
              x: filter === "inactivos"
                ? {
                    type: "time",
                    time: { unit: "day" },
                    title: {
                      display: true,
                      text: "Fechas de inactividad"
                    }
                  }
                : { beginAtZero: true },
              y: {
                title: {
                  display: filter === "inactivos",
                  text: filter === "inactivos" ? "Bebederos" : ""
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
}
