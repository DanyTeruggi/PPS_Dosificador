import { useState, useEffect } from "react";
import styles from "./../Style/PanelStyles.module.css";
import stylesDelete from "./../Style/EditarFormStyles.module.css";
import toast from "react-hot-toast";


import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";

import NuevoEstablecimientoForm from "./NuevoEstablecimientoForm";
import EditarEstablecimientoForm from "./EditarEstablecimientoForm";

import type { Establecimiento } from "../../../types/Establecimiento";
import Button from "../../Button/Button";

type EstablecimientoRow = Establecimiento & {
  clienteNombre: string;
};

type ClienteProfileResponse = {
  cliente_id: number;
  razon_social?: string;
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
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: number;
    nombre: string;
  } | null>(null);



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

      const clienteNombre = profile.razon_social || profile.usuario?.nombre || user?.nombre || "Cliente";
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
      const [establecimientosRes, clientesRes] = await Promise.all([
        apiFetch("/api/v1/admin/establecimientos"),
        apiFetch("/api/v1/admin/clientes"),
      ]);

      if (
        !establecimientosRes?.ok ||
        !clientesRes?.ok
      ) {
        setEstablecimientos([]);
        return;
      }

      const establecimientosAdmin = normalizeEstablecimientos(
        await establecimientosRes.json()
      );

      const clientes: VeterinarioCliente[] = await clientesRes.json();

      setEstablecimientos(
        establecimientosAdmin.map((establecimiento) => {
          const cliente = clientes.find(
            (cliente) => cliente.cliente_id === establecimiento.cliente_id
          );

          return {
            ...establecimiento,
            clienteNombre:
              cliente?.razon_social ||
              `Cliente ${establecimiento.cliente_id}`,
          };
        })
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

  // HANDLE ROW CLICK
  function handleRowClick(id: number) {
    setSelectedRowId(id);
  }



  async function handleEditClick(id: number) {
    const res = await apiFetch(`/api/v1/establecimientos/${id}`);
    if (!res || !res.ok) {
      alert("No se pudo cargar el establecimiento.");
      return;
    }

    const data = await res.json();
    setEditEstablecimiento(data);
  }

   /* ---------------------------------------------------------
   * Borrar
   * --------------------------------------------------------- */
  async function handleDeleteClick(id: number, nombre: string) {
    setDeleteConfirm({ id, nombre });
  }

  async function confirmDelete() {
    if (!deleteConfirm) return;

    const { id, nombre } = deleteConfirm;

    try {
      const res = await apiFetch(
        `/api/v1/admin/establecimientos/${id}`,
        { method: "DELETE" }
      );

      // Si la respuesta no existe (CORS, red, etc.)
      if (!res) {
        toast.error("Error: no se recibió respuesta del servidor.");
        return;
      }

      // Si el backend devuelve error
      if (!res.ok) {
        if (res.status === 400 || res.status === 409) {
          toast.error("No se puede eliminar el establecimiento porque tiene datos asociados.");
        } else {
          toast.error("No se pudo eliminar el establecimiento.");
        }
        return;
      }

      // ⭐ Caso de éxito
      toast.success(`El establecimiento "${nombre}" fue eliminado correctamente.`);

      // Refrescar lista
      await loadEstablecimientos();

      // Cerrar modal
      setDeleteConfirm(null);

      // Actualizar estado local
      setEstablecimientos((actuales) =>
        actuales.filter((establecimiento) => establecimiento.id !== id)
      );

    } catch (err) {
      toast.error("Error de conexión con el servidor.");
      console.error(err);
    }
  }


  function clearFilters() {
    setSearch("");
  }

  async function guardarCambios(estActualizado: Establecimiento) {
    setEstablecimientos((actuales) =>
      actuales.map((establecimiento) =>
        Number(establecimiento.id) === Number(estActualizado.id)
          ? { ...establecimiento, ...estActualizado }
          : establecimiento
      )
    );
    setEditEstablecimiento(null);
    await loadEstablecimientos();
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
            Limpiar filtros
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
            <th>Razon Social</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map((e) => (
            <tr 
              key={e.id}
              onClick={() => handleRowClick(e.id)}
              className={`${styles.rowClickable} ${selectedRowId === e.id ? styles.rowSelected : ""}`}
            >
                <td>{e.id}</td>
              <td>{e.nombre}</td>
              <td>{e.ubicacion || "-"}</td>
              <td>{e.clienteNombre}</td>
              <td className={styles.actionsCell}>
                <button className={styles.editBtn} onClick={() => handleEditClick(e.id)}>
                  Editar
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteClick(e.id, e.nombre)}
                >
                  Borrar
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
              onClose={() => {
                setEditEstablecimiento(null)
                loadEstablecimientos(); 
              }}
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
                loadEstablecimientos(); 
              }}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
  <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      
      <button
        className={styles.closeModalBtn}
        onClick={() => setDeleteConfirm(null)}
      >
        ✕
      </button>

      <h2 className={stylesDelete.title}>
        Eliminar "{deleteConfirm.nombre}"
      </h2>

      <p className={stylesDelete.subtitle}>
        ¿Seguro que deseas eliminar este Establecimiento?
      </p>

            <div className={stylesDelete.actions}>

              <Button
                label="Cancelar"
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
              />

              <Button
                label="Eliminar"
                variant="danger"
                onClick={confirmDelete}
              />
            </div>
          </div>
        </div>
      )}




    </div>
  );
}
