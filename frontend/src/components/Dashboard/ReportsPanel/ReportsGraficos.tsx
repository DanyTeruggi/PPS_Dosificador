import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Bar,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useApi } from "../../../utils/apiFetch";
import styles from "./ReportsGraficos.module.css";

type EntityType = "cliente" | "establecimiento" | "bebedero";
type Period = "7" | "15" | "30" | "all";
type SeriesMode = "real" | "promedio" | "minimo" | "maximo";
type ChartType = "lineas" | "barras";

interface UsuarioResumen { id: number; nombre: string; email: string }
interface Cliente { cliente_id: number; razon_social: string; usuario: UsuarioResumen }
interface Establecimiento { id: number; nombre: string; cliente_id: number }
interface Bebedero {
  id: number;
  nombre: string;
  establecimiento_id: number;
  cobertura_objetivo: number | null;
}
interface Monitoreo {
  id: number;
  bebedero_id: number;
  fecha: string;
  fecha_medicion: string;
  cobertura_capsulas_porcentaje: number | null;
}
interface Selection { type: EntityType; id: number; label: string }

const COLORS = ["#1565c0", "#2e7d32", "#7b1fa2", "#ef6c00", "#00838f", "#ad1457", "#5d4037", "#455a64"];
const modeLabels: Record<SeriesMode, string> = {
  real: "Mediciones reales",
  promedio: "Promedio diario",
  minimo: "Mínimo diario",
  maximo: "Máximo diario",
};

function fechaLocal(fecha: string) {
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function fechaMedicionLocal(fechaMedicion: string) {
  const [datePart, timePart = "00:00:00"] = fechaMedicion.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, second || 0);
}

function seriesKey(bebederoId: number, mode: SeriesMode) {
  return `b${bebederoId}_${mode}`;
}

interface DateTimeTickProps {
  x?: number;
  y?: number;
  payload?: { value: number };
}

function DateTimeTick({ x = 0, y = 0, payload }: DateTimeTickProps) {
  if (!payload) return null;
  const date = new Date(Number(payload.value));
  return (
    <g transform={`translate(${x},${y})`}>
      <text textAnchor="middle" fill="#4b5563" fontSize={12}>
        <tspan x="0" dy="16">{date.toLocaleDateString("es-AR")}</tspan>
        <tspan x="0" dy="17" fontWeight="600">{date.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}</tspan>
      </text>
    </g>
  );
}

export default function ReportsGraficos() {
  const { apiFetch } = useApi();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [bebederos, setBebederos] = useState<Bebedero[]>([]);
  const [monitoreos, setMonitoreos] = useState<Monitoreo[]>([]);
  const [focus, setFocus] = useState<Selection | null>(null);
  const [selectedBebederoIds, setSelectedBebederoIds] = useState<number[]>([]);
  const [period, setPeriod] = useState<Period>("7");
  const [modes, setModes] = useState<SeriesMode[]>(["real"]);
  const [chartType, setChartType] = useState<ChartType>("barras");
  const [search, setSearch] = useState("");
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingMeasurements, setLoadingMeasurements] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [measurementError, setMeasurementError] = useState<string | null>(null);

  const loadCatalogs = useCallback(async () => {
    setLoadingCatalogs(true);
    setCatalogError(null);
    try {
      const [clientesRes, establecimientosRes, bebederosRes] = await Promise.all([
        apiFetch("/api/v1/admin/clientes"),
        apiFetch("/api/v1/admin/establecimientos"),
        apiFetch("/api/v1/admin/bebederos"),
      ]);
      if (!clientesRes?.ok || !establecimientosRes?.ok || !bebederosRes?.ok) {
        throw new Error("No se pudieron cargar los datos para construir el gráfico.");
      }
      setClientes((await clientesRes.json()) as Cliente[]);
      setEstablecimientos((await establecimientosRes.json()) as Establecimiento[]);
      setBebederos((await bebederosRes.json()) as Bebedero[]);
    } catch (error) {
      setCatalogError(error instanceof Error ? error.message : "No se pudieron cargar los datos.");
    } finally {
      setLoadingCatalogs(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void loadCatalogs(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadCatalogs]);

  const loadMeasurements = useCallback(async (ids: number[], selectedPeriod: Period) => {
    if (ids.length === 0) {
      setMonitoreos([]);
      setMeasurementError(null);
      return;
    }
    setLoadingMeasurements(true);
    setMeasurementError(null);
    try {
      const params = new URLSearchParams({ bebedero_ids: ids.join(",") });
      if (selectedPeriod !== "all") {
        const desde = new Date();
        desde.setDate(desde.getDate() - Number(selectedPeriod));
        params.set("desde", desde.toISOString());
        params.set("hasta", new Date().toISOString());
      }
      const response = await apiFetch(`/api/v1/admin/monitoreos?${params.toString()}`);
      if (!response?.ok) throw new Error("El endpoint de monitoreos todavía no está disponible.");
      setMonitoreos((await response.json()) as Monitoreo[]);
    } catch (error) {
      setMonitoreos([]);
      setMeasurementError(error instanceof Error ? error.message : "No se pudieron cargar las mediciones.");
    } finally {
      setLoadingMeasurements(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void loadMeasurements(selectedBebederoIds, period); }, 200);
    return () => window.clearTimeout(timeoutId);
  }, [loadMeasurements, period, selectedBebederoIds]);

  const options = useMemo(() => [
    ...clientes.map((item) => ({ type: "cliente" as const, id: item.cliente_id, label: item.razon_social || item.usuario.nombre, detail: item.usuario.email })),
    ...establecimientos.map((item) => ({ type: "establecimiento" as const, id: item.id, label: item.nombre, detail: clientes.find((cliente) => cliente.cliente_id === item.cliente_id)?.razon_social ?? "" })),
    ...bebederos.map((item) => ({ type: "bebedero" as const, id: item.id, label: item.nombre, detail: establecimientos.find((establecimiento) => establecimiento.id === item.establecimiento_id)?.nombre ?? "" })),
  ], [bebederos, clientes, establecimientos]);

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length < 2) return [];
    return options.filter((item) => `${item.label} ${item.detail}`.toLowerCase().includes(term)).slice(0, 12);
  }, [options, search]);

  const scopedData = useMemo(() => {
    if (!focus) return { clientes: [] as Cliente[], establecimientos: [] as Establecimiento[], bebederos: [] as Bebedero[] };
    let scopedEstablecimientos: Establecimiento[];
    let scopedBebederos: Bebedero[];
    let clienteIds: number[];

    if (focus.type === "cliente") {
      clienteIds = [focus.id];
      scopedEstablecimientos = establecimientos.filter((item) => item.cliente_id === focus.id);
      const ids = new Set(scopedEstablecimientos.map((item) => item.id));
      scopedBebederos = bebederos.filter((item) => ids.has(item.establecimiento_id));
    } else if (focus.type === "establecimiento") {
      scopedEstablecimientos = establecimientos.filter((item) => item.id === focus.id);
      clienteIds = scopedEstablecimientos.map((item) => item.cliente_id);
      scopedBebederos = bebederos.filter((item) => item.establecimiento_id === focus.id);
    } else {
      scopedBebederos = bebederos.filter((item) => item.id === focus.id);
      const establecimientoIds = new Set(scopedBebederos.map((item) => item.establecimiento_id));
      scopedEstablecimientos = establecimientos.filter((item) => establecimientoIds.has(item.id));
      clienteIds = scopedEstablecimientos.map((item) => item.cliente_id);
    }

    return {
      clientes: clientes.filter((item) => clienteIds.includes(item.cliente_id)),
      establecimientos: scopedEstablecimientos,
      bebederos: scopedBebederos,
    };
  }, [bebederos, clientes, establecimientos, focus]);

  function deviceIdsForEstablecimiento(id: number) {
    return scopedData.bebederos.filter((item) => item.establecimiento_id === id).map((item) => item.id);
  }

  function deviceIdsForCliente(id: number) {
    const ids = new Set(scopedData.establecimientos.filter((item) => item.cliente_id === id).map((item) => item.id));
    return scopedData.bebederos.filter((item) => ids.has(item.establecimiento_id)).map((item) => item.id);
  }

  function allSelected(ids: number[]) {
    return ids.length > 0 && ids.every((id) => selectedBebederoIds.includes(id));
  }

  function toggleDevices(ids: number[]) {
    setSelectedBebederoIds((current) => {
      const remove = ids.length > 0 && ids.every((id) => current.includes(id));
      return remove
        ? current.filter((id) => !ids.includes(id))
        : Array.from(new Set([...current, ...ids]));
    });
  }

  function selectFocus(selection: Selection) {
    setFocus(selection);
    setSelectedBebederoIds([]);
    setSearch("");
  }

  const chartData = useMemo(() => {
    const rows = new Map<number, Record<string, number | string>>();
    const selectedSet = new Set(selectedBebederoIds);
    const filtered = monitoreos.filter(
      (item): item is Monitoreo & { cobertura_capsulas_porcentaje: number } =>
        selectedSet.has(item.bebedero_id) && item.cobertura_capsulas_porcentaje !== null,
    );

    if (modes.includes("real")) {
      for (const item of filtered) {
        const measurementDate = fechaMedicionLocal(item.fecha_medicion);
        const timestamp = measurementDate.getTime();
        const row = rows.get(timestamp) ?? { timestamp, label: measurementDate.toLocaleString("es-AR") };
        row[seriesKey(item.bebedero_id, "real")] = item.cobertura_capsulas_porcentaje;
        rows.set(timestamp, row);
      }
    }

    if (modes.some((mode) => mode !== "real")) {
      const daily = new Map<string, Monitoreo[]>();
      for (const item of filtered) {
        const key = `${item.bebedero_id}_${item.fecha}`;
        daily.set(key, [...(daily.get(key) ?? []), item]);
      }
      for (const values of daily.values()) {
        const first = values[0];
        const date = fechaLocal(first.fecha);
        date.setHours(12, 0, 0, 0);
        const timestamp = date.getTime();
        const row = rows.get(timestamp) ?? { timestamp, label: date.toLocaleDateString("es-AR") };
        const numbers = values.map((item) => item.cobertura_capsulas_porcentaje).filter((value): value is number => value !== null);
        if (modes.includes("promedio")) row[seriesKey(first.bebedero_id, "promedio")] = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
        if (modes.includes("minimo")) row[seriesKey(first.bebedero_id, "minimo")] = Math.min(...numbers);
        if (modes.includes("maximo")) row[seriesKey(first.bebedero_id, "maximo")] = Math.max(...numbers);
        rows.set(timestamp, row);
      }
    }

    return Array.from(rows.values()).sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
  }, [modes, monitoreos, selectedBebederoIds]);

  function toggleMode(mode: SeriesMode) {
    setModes((current) => current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode]);
  }

  return (
    <section className={styles.report}>
      <h2>Gráfico de cobertura</h2>
      {catalogError && <p className={styles.error}>{catalogError}</p>}
      {loadingCatalogs ? <p>Cargando filtros…</p> : (
        <div className={styles.filterLayout}>
          <div className={styles.globalFilter}>
            <div className={styles.searchBox}>
              <label>Buscar cliente, establecimiento o dispositivo</label>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Ingresá al menos 2 caracteres" />
              {search.trim().length >= 2 && (
                <div className={styles.results}>
                  {searchResults.length === 0 && <p>No se encontraron resultados.</p>}
                  {searchResults.map((item) => (
                    <button key={`${item.type}-${item.id}`} type="button" onClick={() => selectFocus(item)}>
                      <small>{item.type === "bebedero" ? "Dispositivo" : item.type}</small>
                      <strong>{item.label}</strong>
                      <span>{item.detail}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {focus && <p className={styles.focusSummary}><strong>Resultado:</strong> {focus.label}</p>}
          </div>

          <div className={styles.cascadeCards}>
            <div className={styles.selectionCard}>
              <div className={styles.selectionHeader}><strong>Clientes</strong><span>{scopedData.clientes.length}</span></div>
              {scopedData.clientes.length === 0 ? <p>Elegí un resultado.</p> : scopedData.clientes.map((cliente) => {
                const ids = deviceIdsForCliente(cliente.cliente_id);
                return <label key={cliente.cliente_id}><input type="checkbox" disabled={ids.length === 0} checked={allSelected(ids)} onChange={() => toggleDevices(ids)} /><span>{cliente.razon_social || cliente.usuario.nombre}</span></label>;
              })}
            </div>
            <div className={styles.selectionCard}>
              <div className={styles.selectionHeader}>
                <strong>Establecimientos</strong><span>{scopedData.establecimientos.length}</span>
                {scopedData.establecimientos.length > 0 && <button type="button" onClick={() => toggleDevices(scopedData.establecimientos.flatMap((item) => deviceIdsForEstablecimiento(item.id)))}>{allSelected(scopedData.bebederos.map((item) => item.id)) ? "Limpiar" : "Todos"}</button>}
              </div>
              {scopedData.establecimientos.length === 0 ? <p>Sin establecimientos.</p> : scopedData.establecimientos.map((establecimiento) => {
                const ids = deviceIdsForEstablecimiento(establecimiento.id);
                return <label key={establecimiento.id}><input type="checkbox" disabled={ids.length === 0} checked={allSelected(ids)} onChange={() => toggleDevices(ids)} /><span>{establecimiento.nombre}</span></label>;
              })}
            </div>
            <div className={styles.selectionCard}>
              <div className={styles.selectionHeader}>
                <strong>Dispositivos</strong><span>{scopedData.bebederos.length}</span>
                {scopedData.bebederos.length > 0 && <button type="button" onClick={() => toggleDevices(scopedData.bebederos.map((item) => item.id))}>{allSelected(scopedData.bebederos.map((item) => item.id)) ? "Limpiar" : "Todos"}</button>}
              </div>
              {scopedData.bebederos.length === 0 ? <p>Sin dispositivos.</p> : scopedData.bebederos.map((bebedero) => <label key={bebedero.id}><input type="checkbox" checked={selectedBebederoIds.includes(bebedero.id)} onChange={() => toggleDevices([bebedero.id])} /><span>{bebedero.nombre}</span></label>)}
            </div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div><strong>Período</strong><div className={styles.buttonGroup}>{(["7", "15", "30", "all"] as Period[]).map((value) => <button className={period === value ? styles.active : ""} type="button" key={value} onClick={() => setPeriod(value)}>{value === "all" ? "Todas" : `${value} días`}</button>)}</div></div>
        <fieldset><legend>Visualización</legend>{(Object.keys(modeLabels) as SeriesMode[]).map((mode) => <label key={mode}><input type="checkbox" checked={modes.includes(mode)} onChange={() => toggleMode(mode)} />{modeLabels[mode]}</label>)}</fieldset>
        <fieldset>
          <legend>Tipo de gráfico</legend>
          <label><input type="radio" name="chart-type" checked={chartType === "lineas"} onChange={() => setChartType("lineas")} />Líneas</label>
          <label><input type="radio" name="chart-type" checked={chartType === "barras"} onChange={() => setChartType("barras")} />Barras</label>
        </fieldset>
      </div>

      {selectedBebederoIds.length > 0 && (
        <div className={styles.chartLegend} aria-label="Leyenda de dispositivos">
          {selectedBebederoIds.map((id, index) => {
            const name = bebederos.find((item) => item.id === id)?.nombre ?? `Bebedero ${id}`;
            const color = COLORS[index % COLORS.length];
            return (
              <div className={styles.legendGroup} key={id}>
                <strong>{name}</strong>
                <span className={styles.legendRow}>
                  <i className={styles.legendTarget} style={{ borderTopColor: color }} /> Cobertura mínima
                </span>
                {modes.map((mode) => (
                  <span className={styles.legendRow} key={mode}>
                    <i
                      className={chartType === "barras" ? styles.legendBar : styles.legendLine}
                      style={{ color, backgroundColor: chartType === "barras" ? color : undefined }}
                    />
                    {modeLabels[mode]}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.dropZone}>
        {selectedBebederoIds.length === 0 ? <p className={styles.empty}>Seleccioná uno o más dispositivos para graficar.</p> : loadingMeasurements ? <p className={styles.empty}>Cargando mediciones…</p> : measurementError ? <p className={styles.error}>{measurementError}</p> : chartData.length === 0 ? <p className={styles.empty}>No hay mediciones para el período seleccionado.</p> : (
          <ResponsiveContainer width="100%" height={500}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 5, bottom: 58 }} barGap={4} barCategoryGap="18%">
              <CartesianGrid strokeDasharray="3 3" />
              {chartType === "lineas" ? (
                <XAxis dataKey="timestamp" type="number" domain={["dataMin", "dataMax"]} scale="time" tick={<DateTimeTick />} height={52} label={{ value: "Fecha y hora", position: "insideBottom", offset: -12 }} />
              ) : (
                <XAxis dataKey="timestamp" type="category" allowDuplicatedCategory={false} tick={<DateTimeTick />} height={52} label={{ value: "Fecha y hora", position: "insideBottom", offset: -12 }} />
              )}
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip labelFormatter={(value) => new Date(Number(value)).toLocaleString("es-AR")} formatter={(value) => [`${Number(value).toFixed(2)} %`]} />
              {selectedBebederoIds.flatMap((id, index) => {
                const name = bebederos.find((item) => item.id === id)?.nombre ?? `Bebedero ${id}`;
                const color = COLORS[index % COLORS.length];
                const measurementSeries = modes.map((mode) => chartType === "lineas"
                  ? <Line key={`${id}-${mode}`} dataKey={seriesKey(id, mode)} name={`${name} · ${modeLabels[mode]}`} stroke={color} strokeWidth={mode === "real" ? 2.5 : 1.8} strokeDasharray={mode === "real" ? undefined : mode === "promedio" ? "10 4" : mode === "minimo" ? "3 4" : "10 3 2 3"} dot={mode === "real"} connectNulls />
                  : <Bar key={`${id}-${mode}`} dataKey={seriesKey(id, mode)} name={`${name} · ${modeLabels[mode]}`} fill={color} fillOpacity={mode === "real" ? 0.9 : 0.65} barSize={24} maxBarSize={40} radius={[3, 3, 0, 0]} />
                );
                const objetivo = bebederos.find((item) => item.id === id)?.cobertura_objetivo;
                if (objetivo != null) {
                  measurementSeries.push(<ReferenceLine key={`${id}-objetivo`} y={objetivo} stroke={color} strokeWidth={1.8} strokeDasharray="6 5" />);
                }
                return measurementSeries;
              })}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
