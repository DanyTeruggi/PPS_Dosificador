import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";
import styles from "./../Styles/EditarFormStyles.module.css";
import {
  getClienteVeterinarioId,
  getVeterinarioId,
  reasignarCliente,
} from "./assignmentUtils";
import type { ClienteAdmin, VeterinarioOption } from "../../../types/ClientAssignment";

interface Props {
  usuarioId: number;
  onClose: () => void;
}

const DEFAULT_VETERINARIO_ID = 1;

export default function ClientesAsociados({ usuarioId, onClose }: Props) {
  const { apiFetch } = useApi();
  const [veterinario, setVeterinario] = useState<VeterinarioOption | null>(null);
  const [veterinarios, setVeterinarios] = useState<VeterinarioOption[]>([]);
  const [clientes, setClientes] = useState<ClienteAdmin[]>([]);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientesRes, veterinariosRes] = await Promise.all([
        apiFetch("/api/v1/admin/clientes"),
        apiFetch("/api/v1/admin/veterinarios"),
      ]);
      if (!clientesRes?.ok || !veterinariosRes?.ok) {
        throw new Error("No se pudieron cargar los clientes asociados.");
      }
      const clientesData = (await clientesRes.json()) as ClienteAdmin[];
      const veterinariosData = (await veterinariosRes.json()) as VeterinarioOption[];
      const veterinarioActual = veterinariosData.find((item) => item.usuario.id === usuarioId) ?? null;

      setClientes(clientesData.filter((cliente) => {
        const role = cliente.usuario.role ?? cliente.usuario.rol;
        return role == null || role === "cliente";
      }));
      setVeterinarios(veterinariosData);
      setVeterinario(veterinarioActual);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, [apiFetch, usuarioId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { void loadData(); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const asociados = useMemo(
    () => clientes.filter((cliente) =>
      veterinario != null &&
      getClienteVeterinarioId(cliente) === getVeterinarioId(veterinario)
    ),
    [clientes, veterinario],
  );
  const disponibles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length < 2) return [];
    return clientes.filter((cliente) =>
      (veterinario == null || getClienteVeterinarioId(cliente) !== getVeterinarioId(veterinario)) &&
      [cliente.usuario.nombre, cliente.usuario.email, cliente.razon_social]
        .some((value) => value.toLowerCase().includes(term)),
    ).slice(0, 10);
  }, [clientes, search, veterinario]);

  async function moveCliente(cliente: ClienteAdmin, nuevoVeterinarioId: number) {
    const nuevoVeterinario = veterinarios.find((item) => getVeterinarioId(item) === nuevoVeterinarioId);
    if (!nuevoVeterinario) return;
    const actual = veterinarios.find(
      (item) => getVeterinarioId(item) === getClienteVeterinarioId(cliente),
    )?.usuario.nombre;
    const message = actual
      ? `El cliente ${cliente.usuario.nombre} pasará de ${actual} a ${nuevoVeterinario.usuario.nombre}. ¿Continuar?`
      : `¿Asignar ${cliente.usuario.nombre} a ${nuevoVeterinario.usuario.nombre}?`;
    if (!window.confirm(message)) return;

    setSavingId(cliente.cliente_id);
    try {
      await reasignarCliente(apiFetch, cliente.cliente_id, nuevoVeterinarioId);
      setClientes((actuales) =>
        actuales.map((item) =>
          item.cliente_id === cliente.cliente_id
            ? {
              ...item,
              veterinario_id: nuevoVeterinarioId,
              veterinario: nuevoVeterinario,
            }
            : item,
        ),
      );
      toast.success("Cliente reasignado correctamente.");
      setSearch("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo reasignar el cliente.");
    } finally {
      setSavingId(null);
    }
  }

  async function removeCliente(cliente: ClienteAdmin) {
    if (!window.confirm(`¿Quitar a ${cliente.usuario.nombre} de este veterinario y asignarlo al veterinario predeterminado?`))
      return;

    setSavingId(cliente.cliente_id);
    try {
      await reasignarCliente(apiFetch, cliente.cliente_id, DEFAULT_VETERINARIO_ID);
      const veterinarioPredeterminado = veterinarios.find(
        (item) => getVeterinarioId(item) === DEFAULT_VETERINARIO_ID,
      ) ?? null;
      setClientes((actuales) =>
        actuales.map((item) =>
          item.cliente_id === cliente.cliente_id
            ? {
              ...item,
              veterinario_id: DEFAULT_VETERINARIO_ID,
              veterinario: veterinarioPredeterminado,
            }
            : item,
        ),
      );
      toast.success("Cliente asignado al veterinario predeterminado.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo desasociar el cliente.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className={`${styles.form} ${styles.assignmentForm}`}>
      <h2 className={styles.title}>Clientes asociados</h2>
      <p className={styles.subtitle}>
        {veterinario ? `${veterinario.usuario.nombre} · ${veterinario.usuario.email}` : "Cargando veterinario…"}
      </p>

      {loading && <p className={styles.statusMessage}>Cargando clientes…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          <div className={styles.clientList}>
            {asociados.length === 0 && <p className={styles.statusMessage}>Este veterinario no tiene clientes asociados.</p>}
            {asociados.map((cliente) => (
              <div className={styles.clientCard} key={cliente.cliente_id}>
                <div>
                  <strong>{cliente.usuario.nombre}</strong>
                  <span>{cliente.razon_social}</span>
                  <span>{cliente.usuario.email}</span>
                </div>
                {veterinario && getVeterinarioId(veterinario) !== DEFAULT_VETERINARIO_ID && (
                  <button
                    className={styles.inlineAction}
                    type="button"
                    disabled={savingId === cliente.cliente_id}
                    onClick={() => void removeCliente(cliente)}
                  >
                    {savingId === cliente.cliente_id ? "Quitando…" : "Quitar"}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Buscar cliente para asociar</label>
            <input
              className={styles.input}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nombre, email o razón social"
            />

            {search.trim().length > 0 && search.trim().length < 2 && <span className={styles.hint}>Ingresá al menos 2 caracteres.</span>}
            {search.trim().length >= 2 && (
              <div className={styles.searchResults}>
                {disponibles.length === 0 && <p className={styles.dropdownEmpty}>No se encontraron otros clientes.</p>}
                {disponibles.map((cliente) => (
                  <button
                    key={cliente.cliente_id}
                    type="button"
                    className={styles.dropdownItem}
                    disabled={savingId === cliente.cliente_id}
                    onClick={() => veterinario && void moveCliente(cliente, getVeterinarioId(veterinario))}
                  >

                    <strong>{cliente.usuario.nombre}</strong>
                    <span>{cliente.razon_social} · {cliente.usuario.email}</span>
                    <span>
                      Veterinario actual:{" "}
                      {veterinarios.find((item) => getVeterinarioId(item) === getClienteVeterinarioId(cliente))?.usuario.nombre ?? "Sin datos"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className={styles.actions}>
        <Button 
          label="Cerrar" 
          variant="secondary" 
          type="button" 
          onClick={onClose} 
        />
        </div>
    </div>
  );
}
