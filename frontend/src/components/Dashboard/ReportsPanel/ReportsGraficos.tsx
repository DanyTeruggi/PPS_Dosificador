import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useApi } from "../../../utils/apiFetch";

type Monitoreo = {
  id: number;
  bebedero_id: number;
  fecha: string;
  nivel_agua_cm: number;
  distancia_sensor_cm: number;
  cobertura_capsulas_porcentaje: number;
};

type Bebedero = {
  id: number;
  nombre: string;
  establecimiento_id: number;
};

type Establecimiento = {
  id: number;
  nombre: string;
};

export default function BebederosReport() {
  const { apiFetch } = useApi();

  const [monitoreo, setMonitoreo] = useState<Monitoreo[]>([]);
  const [bebederos, setBebederos] = useState<Bebedero[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [establecimientoId, setEstablecimientoId] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const [monRes, bebRes, estRes] = await Promise.all([
        apiFetch("/api/v1/admin/monitoreo"),
        apiFetch("/api/v1/admin/bebederos"),
        apiFetch("/api/v1/admin/establecimientos"),
      ]);

      if (!monRes?.ok || !bebRes?.ok || !estRes?.ok) {
        console.error("Error cargando datos del reporte");
        return;
      }

      const monData = await monRes.json();
      const bebData = await bebRes.json();
      const estData = await estRes.json();

      setMonitoreo(monData);
      setBebederos(bebData);
      setEstablecimientos(estData);

console.log("MONITOREO RAW:", await monRes.clone().json());
console.log("BEBEDEROS RAW:", await bebRes.clone().json());
console.log("ESTABLECIMIENTOS RAW:", await estRes.clone().json());

    }

    loadData();
  }, []);

  // Filtrar bebederos por establecimiento
  const bebederosFiltrados = establecimientoId
    ? bebederos.filter((b) => b.establecimiento_id === establecimientoId)
    : bebederos;

  // Agrupar monitoreo por bebedero
  const monitoreoPorBebedero = bebederosFiltrados.map((b) => ({
    bebedero: b,
    data: monitoreo
      .filter((m) => m.bebedero_id === b.id)
      .map((m) => ({
        ...m,
        fecha: new Date(m.fecha).toLocaleDateString("es-AR"),
      })),
  }));

  return (
    <div style={{ padding: "20px" }}>
      <h2>Reporte de Bebederos</h2>

      {/* Filtro por establecimiento */}
      <div style={{ marginBottom: "20px" }}>
        <label>Filtrar por establecimiento: </label>
        <select
          value={establecimientoId ?? ""}
          onChange={(e) =>
            setEstablecimientoId(
              e.target.value === "" ? null : Number(e.target.value)
            )
          }
        >
          <option value="">Todos</option>
          {establecimientos.map((est) => (
            <option key={est.id} value={est.id}>
              {est.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Gráficos por bebedero */}
      {monitoreoPorBebedero.map(({ bebedero, data }) => (
        <div key={bebedero.id} style={{ marginBottom: "40px" }}>
          <h3>{bebedero.nombre}</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Line
                type="monotone"
                dataKey="cobertura_capsulas_porcentaje"
                stroke="#ff7300"
                name="Cobertura (%)"
              />

              <Line
                type="monotone"
                dataKey="nivel_agua_cm"
                stroke="#007bff"
                name="Nivel Agua (cm)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
