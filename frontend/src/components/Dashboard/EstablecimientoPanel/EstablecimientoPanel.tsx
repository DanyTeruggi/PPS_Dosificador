import { useState, useEffect } from "react";
import styles from "./EstablecimientoPanel.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";

import NuevoEstablecimientoForm from "./NuevoEstablecimientoForm";
import EditarEstablecimientoForm from "./EditarEstablecimientoForm";

import type { Establecimiento } from "../../../types/Establecimiento";

type EstablecimientoRow = Establecimiento & {
  clienteNombre: string;
};

type ClienteProfileResponse = {
  cliente_id: number;
  usuario?: {
    nombre?: string;
  };
  establecimientos?: Establecimiento[];
};

type VeterinarioProfileResponse = {
  veterinario_id: number;
};

type VeterinarioCliente = {
  cliente_id: number;
  razon_social?: string;
  usuario?: {
    nombre?: string;
  };
};

type VeterinarioClientesResponse = {
  clientes?: VeterinarioCliente[];
};

function normalizeEstablecimientos(payload: unknown): Establecimiento[] {
  if (Array.isArray(payload)) {
    return payload as Establecimiento[];
  }

  if (payload && typeof payload === "object" && "establecimientos" in payload) {
    const establecimientos = (payload as { establecimientos?: unknown }).establecimientos;
    return Array.isArray(establecimientos) ? (establecimientos as Establecimiento[]) : [];
  }

  return [];
}

function getClienteLabel(cliente: VeterinarioCliente): string {
  return cliente.razon_social || cliente.usuario?.nombre || `Cliente ${cliente.cliente_id}`;
}

export default function EstablecimientoPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [establecimientos, setEstablecimientos] = useState<EstablecimientoRow[]>([]);
  const [adminEndpointUnavailable, setAdminEndpointUnavailable] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editEstablecimiento, setEditEstablecimiento] = useState<Establecimiento | null>(null);

  async function loadEstablecimientos() {
    const role = user?.role ?? user?.rol;
    setAdminEndpointUnavailable(false);

    if (!role) {
      setEstablecimientos([]);
      return;
    }

    if (role === "cliente") {
      const profileRes = await apiFetch("/api/v1/clientes/me");
      if (!profileRes || !profileRes.ok) return;

      const profile: ClienteProfileResponse = await profileRes.json();
      let establecimientosCliente = normalizeEstablecimientos(profile.establecimientos);

      if (establecimientosCliente.length === 0) {
        const establecimientosRes = await apiFetch("/api/v1/clientes/mis-establecimientos");
        if (!establecimientosRes || !establecimientosRes.ok) return;

        const payload = await establecimientosRes.json();
        establecimientosCliente = normalizeEstablecimientos(payload);
      }

      const clienteNombre = profile.usuario?.nombre || user?.nombre || "Cliente";
      setEstablecimientos(
        establecimientosCliente.map((establecimiento) => ({
          ...establecimiento,
          clienteNombre,
        }))
      );
      return;
    }

    if (role === "veterinario") {
      const [profileRes, clientesRes] = await Promise.all([
        apiFetch("/api/v1/veterinarios/me"),
        apiFetch("/api/v1/veterinarios/clientes"),
      ]);

      if (!profileRes || !profileRes.ok || !clientesRes || !clientesRes.ok) return;

      const profile: VeterinarioProfileResponse = await profileRes.json();
      const clientesPayload: VeterinarioClientesResponse = await clientesRes.json();
      const clientes = clientesPayload.clientes ?? [];

      const rows = await Promise.all(
        clientes.map(async (cliente) => {
          const establecimientosRes = await apiFetch(
            `/api/v1/veterinarios/${profile.veterinario_id}/clientes/${cliente.cliente_id}/establecimientos`
          );

          if (!establecimientosRes || !establecimientosRes.ok) {
            return [] as EstablecimientoRow[];
          }

          const payload = await establecimientosRes.json();
          const establecimientosCliente = normalizeEstablecimientos(payload);
          const clienteNombre = getClienteLabel(cliente);

          return establecimientosCliente.map((establecimiento) => ({
            ...establecimiento,
            clienteNombre,
          }));
        })
      );

      setEstablecimientos(rows.flat());
      return;
    }

    if (role === "admin") {
      // Endpoint objetivo para listar todos los establecimientos desde admin.
      // Si todavía no existe en backend (404), mostramos un aviso amigable en la UI.
      const adminRes = await apiFetch("/api/v1/admin/establecimientos");
      if (!adminRes) return;

      if (adminRes.status === 404) {
        setEstablecimientos([]);
        setAdminEndpointUnavailable(true);
        return;
      }

      if (!adminRes.ok) {
        setEstablecimientos([]);
        return;
      }

      const payload = await adminRes.json();
      const establecimientosAdmin = normalizeEstablecimientos(payload);

      setEstablecimientos(
        establecimientosAdmin.map((establecimiento) => ({
          ...establecimiento,
          clienteNombre: `Cliente ${establecimiento.cliente_id}`,
        }))
      );
      return;
    }

    setEstablecimientos([]);
  }

  useEffect(() => {
    loadEstablecimientos();
  }, [user]);

  const filtrados = establecimientos.filter((e) => {
    if (search === "") return true;

    const searchValue = search.toLowerCase();
    return (
      e.nombre.toLowerCase().includes(searchValue) ||
      e.id.toString().includes(search) ||
      e.clienteNombre.toLowerCase().includes(searchValue)
    );
  });

  async function handleEditClick(id: number) {
    const res = await apiFetch(`/api/v1/establecimientos/${id}`);
    if (!res || !res.ok) {
      alert("No se pudo cargar el establecimiento.");
      return;
    }

    const data = await res.json();
    setEditEstablecimiento(data);
  }

  function clearFilters() {
    setSearch("");
  }

  function guardarCambios(estActualizado: Establecimiento) {
    const nuevos = establecimientos.map((e) =>
      e.id === estActualizado.id
        ? { ...e, ...estActualizado }
        : e
    );

    setEstablecimientos(nuevos);
    setEditEstablecimiento(null);
  }

  return (
    <div className={styles.container}>

      <div className={styles.searchRow}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Buscar por nombre, ID o cliente…"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className={styles.clearBtn} onClick={clearFilters}>
            Clear
          </button>
        </div>

        <div className={styles.filters}>
          <button className={styles.newUserBtn} onClick={() => setShowCreateModal(true)}>
            + Nuevo establecimiento
          </button>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Cliente</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map((e) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.nombre}</td>
              <td>{e.ubicacion || "-"}</td>
              <td>{e.clienteNombre}</td>
              <td>
                <button className={styles.editBtn} onClick={() => handleEditClick(e.id)}>
                  Editar
                </button>
              </td>
            </tr>
          ))}

          {filtrados.length === 0 && (
            <tr>
              <td colSpan={5} className={styles.emptyCell}>
                No hay establecimientos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {adminEndpointUnavailable && (user?.role ?? user?.rol) === "admin" && (
        <p className={styles.infoMessage}>
          El endpoint de admin para listar establecimientos todavia no esta disponible.
          Cuando backend implemente GET /api/v1/admin/establecimientos, este panel mostrara el listado completo.
        </p>
      )}

      {editEstablecimiento && (
        <div className={styles.modalOverlay} onClick={() => setEditEstablecimiento(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setEditEstablecimiento(null)}>
              ✕
            </button>

            <EditarEstablecimientoForm
              establecimiento={editEstablecimiento}
              onSave={guardarCambios}
            />
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setShowCreateModal(false)}>
              ✕
            </button>

            <NuevoEstablecimientoForm
              onClose={() => {
                setShowCreateModal(false);
                loadEstablecimientos(); // refresca la tabla
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
