import { useState, useEffect, useCallback } from "react";
import styles from "./../Styles/PanelStyles.module.css";
import stylesDelete from "./../Styles/EditarFormStyles.module.css";
import toast from "react-hot-toast";
import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/useAuth";
import NuevoBebederoForm from "./NuevoBebederoForm";
import Button from "../../Button/Button";
import ButtonX from "../../ButtonX/ButtonX";
import ButtonSearch from "../../ButtonSearch/ButtonSearch";
import ButtonTable from "../../ButtonTable/ButtonTable";
import type { Bebedero } from "../../../types/Bebedero";
import type { Establecimiento } from "../../../types/Establecimiento";
import EditarBebederoForm from "./EditaBebederoForm";
import CargaImagen from "./CargaImagen";


type BebederoRow = Bebedero & {
  establecimientoNombre: string;
  razonSocial: string;
};

type ClienteAdmin = {
  cliente_id: number;
  razon_social?: string;
};

/* ---------------------------------------------------------
 * Normalizadores 
 * --------------------------------------------------------- */
function normalizeBebederos(payload: unknown): Bebedero[] {
  // Caso A: ya es un array, lo devolvemos tal cual
  if (Array.isArray(payload)) 
    return payload as Bebedero[];
  // Caso B: es un objeto que contiene "bebederos"
  if (payload && typeof payload === "object" && "bebederos" in payload) {
    const maybe = (payload as { bebederos?: unknown }).bebederos;
    if (Array.isArray(maybe)) 
      return maybe as Bebedero[];
  }
  return [];
}

function normalizeEstablecimientos(payload: unknown): Establecimiento[] {
  if (Array.isArray(payload)) 
    return payload as Establecimiento[];
  if (payload && typeof payload === "object" && "establecimientos" in payload) {
    const establecimientos = (payload as { establecimientos?: unknown }).establecimientos;
    return Array.isArray(establecimientos) ? (establecimientos as Establecimiento[]) : [];
  }
  return [];
}


export default function BebederosPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();
  const [bebederos, setBebederos] = useState<BebederoRow[]>([]);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [editBebedero, setEditBebedero] = useState<Bebedero | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: number;
    nombre: string;
  } | null>(null);


  /* ---------------------------------------------------------
   * Carga inicial de datos   * 
   * --------------------------------------------------------- */
  const loadBebederos = useCallback(async () => {
    const role = user?.role ?? user?.rol;

    if (role !== "admin") {
      setBebederos([]);
      setEstablecimientos([]);
      return;
    }

    const [bebRes, estRes, clientesRes] = await Promise.all([
      apiFetch("/api/v1/admin/bebederos"),
      apiFetch("/api/v1/admin/establecimientos"),
      apiFetch("/api/v1/admin/clientes"),
    ]);

    if (!bebRes?.ok || !estRes?.ok || !clientesRes?.ok) {
      setBebederos([]);
      setEstablecimientos([]);
      return;
    }

    const bebederosAdmin = normalizeBebederos(await bebRes.json());
    const establecimientosAdmin = normalizeEstablecimientos(await estRes.json());
    const clientes: ClienteAdmin[] = await clientesRes.json();
    setEstablecimientos(establecimientosAdmin);

    setBebederos(
      bebederosAdmin.map((b) => {
        const est = establecimientosAdmin.find((e) => e.id === b.establecimiento_id);
        const cliente = clientes.find((c) => c.cliente_id === est?.cliente_id);
        return {
          ...b,
          establecimientoNombre: est?.nombre ?? "—",
          razonSocial: cliente?.razon_social ?? "—",
        };
      })
    );
  }, [apiFetch, user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadBebederos();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadBebederos]);

  /* ---------------------------------------------------------
   * Filtros 
   * --------------------------------------------------------- */
  const filtrados = bebederos.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      b.nombre.toLowerCase().includes(s) ||
      b.id.toString().includes(search) ||
      b.establecimientoNombre.toLowerCase().includes(s) ||
      b.razonSocial.toLowerCase().includes(s)
    );
  });

  /* ---------------------------------------------------------
    * Toggle row selection 
    * --------------------------------------------------------- */
  function handleRowClick(id: number) {
    setSelectedRowId(id);
  }

  /* ---------------------------------------------------------
   * Toggle Estado 
   * --------------------------------------------------------- */
  async function toggleEstadoBebedero(id: number) {
    const bebedero = bebederos.find((b) => b.id === id);
    if (!bebedero) 
      return; // seguridad para evitar errores si el bebedero no se encuentra

    const updated = bebederos.map((b) =>
      b.id === id ? { ...b, estado: !b.estado } : b
    );

    setBebederos(updated);

    const res = await apiFetch(`/api/v1/admin/bebederos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ estado: !bebedero.estado }),
    });

    if (!res?.ok) {
      toast.error("No se pudo actualizar el estado del bebedero.");
      setBebederos(bebederos); // revertir
    }
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
      const res = await apiFetch(`/api/v1/admin/bebederos/${id}`, {
        method: "DELETE",
      });

      if (!res) {
        toast.error("No se recibió respuesta del servidor.");
        return;
      }

      if (!res.ok) {
        if (res.status === 400 || res.status === 409) {
          toast.error("No se puede eliminar el bebedero porque tiene datos asociados.");
        } else {
          toast.error("No se pudo eliminar el bebedero.");
        }
        return;
      }

      // CASO DE ÉXITO
      toast.success(`El bebedero "${nombre}" fue eliminado correctamente.`);

      await loadBebederos();
      setBebederos((actuales) => actuales.filter((b) => b.id !== id));
      setDeleteConfirm(null);

    } catch (err) {
      toast.error("Error de conexión con el servidor.");
      console.error(err);
    }
  }




  function clearFilters() {
    setSearch("");
  }
 

  async function guardarCambios(bebActualizado: Bebedero) {
    setBebederos((actuales) =>
      actuales.map((b) =>
        Number(b.id) === Number(bebActualizado.id)
          ? { ...b, ...bebActualizado }
          : b
      )
    );

    setEditBebedero(null);
    await loadBebederos();
  }

  return (
    <div className={styles.container}>

      <div className={styles.searchRow}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Razón soc., establecimiento o dispositivo…"
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

        <div className={styles.headerActions}>
          {import.meta.env.DEV && (
            <ButtonSearch 
              variant="secondary" 
              onClick={() => setShowSimulatorModal(true)}
            >
              Simular lectura
            </ButtonSearch>
          )}

          <ButtonSearch 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
          >
            Nuevo dispositivo
          </ButtonSearch>

        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Razón social</th>
            <th>Establecimiento</th>
            <th>Ubicación</th>
            <th>Dispositivo</th>
            <th>
              <div className={styles.estadoHeader}>
                <span>Estado</span>
              </div>
            </th>
            <th>Tiempo de Dosis</th>
            <th>Cobertura min</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map((b) => (
            <tr key={b.id}
              onClick={() => handleRowClick(b.id)}
              className={`${styles.rowClickable} ${selectedRowId === b.id ? styles.rowSelected : ""}`}>
              <td>{b.razonSocial}</td>
              <td>{b.establecimientoNombre}</td>
              <td>{b.ubicacion ?? "-"}</td>
              <td>{b.nombre}</td>

              {/* ESTADO  */}
              <td>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={b.estado}
                    onChange={() => toggleEstadoBebedero(b.id)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </td>
              <td style={{ paddingLeft: "40px" }}>{b.tiempo_dosis ?? "-"}</td>
              <td style={{ paddingLeft: "40px" }}>
                {b.cobertura_objetivo !== null && b.cobertura_objetivo !== undefined
                  ? `${b.cobertura_objetivo} %`
                  : "-"}
              </td>
              <td className={styles.actionsCell}>

                <ButtonTable
                  variant="edit"
                  onClick={(e) => {
                    e.stopPropagation();   // evita seleccionar fila
                    setEditBebedero(b);    // abre el modal con el bebedero correcto
                  }}
                >
                  Editar
                </ButtonTable>

                <ButtonTable
                  variant="delete"
                  onClick={() => handleDeleteClick(b.id, b.nombre)}
                >
                  Borrar
                </ButtonTable>

              </td>
            </tr>
          ))}

          {filtrados.length === 0 && (
            <tr>
              <td colSpan={8} className={styles.emptyCell}>
                No hay bebederos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* MODAL EDITAR */}
      {editBebedero && (
        <div className={styles.modalOverlay} onClick={() => setEditBebedero(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <ButtonX 
              className={styles.closeModalBtn} 
              onClick={() => setEditBebedero(null)} 
            />

            <EditarBebederoForm
              bebedero={editBebedero}
              onSave={guardarCambios}
              onClose={() => setEditBebedero(null)}
            />
          </div>
        </div>
      )}

      {/* MODAL CREAR */}
      {showCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <ButtonX 
              className={styles.closeModalBtn} 
              onClick={() => setShowCreateModal(false)} 
            />

            <NuevoBebederoForm
              establecimientos={establecimientos}
              onClose={() => {
                setShowCreateModal(false);
                loadBebederos();
              }}
            />
          </div>
        </div>
      )}

      {/* SIMULADOR DE CARGA DE IMAGEN: disponible solo durante desarrollo. */}
      {import.meta.env.DEV && showSimulatorModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSimulatorModal(false)}>
          <div className={styles.modalContent} onClick={(event) => event.stopPropagation()}>
            <ButtonX className={styles.closeModalBtn} onClick={() => setShowSimulatorModal(false)} />
            <CargaImagen
              bebederos={bebederos}
              onClose={() => setShowSimulatorModal(false)}
            />
          </div>
        </div>
      )}

      {/* MODAL BORRAR */}
      {deleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>

            <ButtonX 
              className={styles.closeModalBtn} 
              onClick={() => setDeleteConfirm(null)} 
            />

            <h2 className={stylesDelete.title}>
              Eliminar "{deleteConfirm.nombre}"
            </h2>

            <p className={stylesDelete.subtitle}>
              ¿Seguro que deseas eliminarlo?
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
