import { useCallback, useState, useEffect } from "react";
import styles from "./../Styles/PanelStyles.module.css";
import stylesDelete from "./../Styles/EditarFormStyles.module.css";
import toast from "react-hot-toast";


import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/useAuth";

import NuevoEstablecimientoForm from "./NuevoEstablecimientoForm";
import EditarEstablecimientoForm from "./EditarEstablecimientoForm";

import type { Establecimiento } from "../../../types/Establecimiento";
import Button from "../../Button/Button";
import ButtonX from "../../ButtonX/ButtonX";
import ButtonSearch from "../../ButtonSearch/ButtonSearch";
import ButtonTable from "../../ButtonTable/ButtonTable";

type EstablecimientoRow = Establecimiento & {
  clienteNombre: string;
  usuarioNombre: string;
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
 
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editEstablecimiento, setEditEstablecimiento] = useState<Establecimiento | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: number;
    nombre: string;
  } | null>(null);



  const loadEstablecimientos = useCallback(async () => {
    const role = user?.role ?? user?.rol;

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
      const usuarioNombre = profile.usuario?.nombre || user?.nombre || "-";
      setEstablecimientos(
        establecimientosCliente.map((establecimiento) => ({
          ...establecimiento,
          clienteNombre,
          usuarioNombre,
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
            usuarioNombre: cliente.usuario?.nombre || "-",
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
            usuarioNombre: cliente?.usuario?.nombre || "-",
          };
        })
      );

      return;
    }

    setEstablecimientos([]);
  }, [apiFetch, user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadEstablecimientos();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadEstablecimientos]);

  // FILTROS COMBINADOS
  const filtrados = establecimientos.filter((e) => {
    if (search === "") return true;

    const searchValue = search.toLowerCase();
    return (
      e.nombre.toLowerCase().includes(searchValue) ||
      e.id.toString().includes(search) ||
      e.usuarioNombre.toLowerCase().includes(searchValue)
    );
  });

  // HANDLE ROW CLICK
  function handleRowClick(id: number) {
    setSelectedRowId(id);
  }



  async function handleEditClick(id: number) {
    const res = await apiFetch(`/api/v1/establecimientos/${id}`);
    if (!res || !res.ok) {
      toast.error("No se pudo cargar el establecimiento.");
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

      //  Caso de éxito
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
      {/* BUSCADOR + CLEAR + FILTROS */}
      <div className={styles.searchRow}>

         {/* Grupo: buscador + clear */}
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Buscar por establecimiento o cliente…"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <ButtonSearch
            variant="clear"
            onClick={clearFilters}
            disabled={search === ""}
          >
            Limpiar filtros
          </ButtonSearch>
        </div>

        <div className={styles.filters}>
          <ButtonSearch variant="primary" onClick={() => setShowCreateModal(true)}>
            Nuevo establecimiento
          </ButtonSearch>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Establecimiento</th>
            <th>Ubicación</th>
            <th>Cliente</th>
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
              <td>{e.nombre}</td>
              <td>{e.ubicacion || "-"}</td>
              <td>{e.usuarioNombre}</td>
              <td>{e.clienteNombre}</td>
              <td className={styles.actionsCell}>
                <ButtonTable variant="edit" onClick={() => handleEditClick(e.id)}>
                  Editar
                </ButtonTable>
                <ButtonTable
                  variant="delete"
                  onClick={() => handleDeleteClick(e.id, e.nombre)}
                >
                  Borrar
                </ButtonTable>
              </td>
            </tr>
          ))}

          {filtrados.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.emptyCell}>
                No hay establecimientos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>



      {editEstablecimiento && (
        <div className={styles.modalOverlay} onClick={() => setEditEstablecimiento(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <ButtonX className={styles.closeModalBtn} onClick={() => setEditEstablecimiento(null)} />

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
            <ButtonX className={styles.closeModalBtn} onClick={() => setShowCreateModal(false)} />

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
      
      <ButtonX className={styles.closeModalBtn} onClick={() => setDeleteConfirm(null)} />

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
