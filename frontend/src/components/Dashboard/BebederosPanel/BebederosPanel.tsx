import { useState, useEffect } from "react";
import styles from "./../Style/PanelStyles.module.css";
import stylesDelete from "./../Style/EditarFormStyles.module.css";
import toast from "react-hot-toast";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";


import NuevoBebederoForm from "./NuevoBebederoForm";
import Button from "../../Button/Button";

import type { Bebedero } from "../../../types/Bebedero";
import type { Establecimiento } from "../../../types/Establecimiento";
import EditarBebederoForm from "./EditaBebederoForm";


type BebederoRow = Bebedero & {
  establecimientoNombre: string;
};

/* ---------------------------------------------------------
 * Normalizadores 
 * --------------------------------------------------------- */
function normalizeBebederos(payload: unknown): Bebedero[] {
  // Caso A: ya es un array, lo devolvemos tal cual
  if (Array.isArray(payload)) return payload as Bebedero[];
  // Caso B: es un objeto que contiene "bebederos"
  if (payload && typeof payload === "object") {
    const maybe = (payload as any).bebederos;
  
    if (Array.isArray(maybe)) return maybe as Bebedero[];
  }

  return [];
}

function normalizeEstablecimientos(payload: unknown): Establecimiento[] {
  if (Array.isArray(payload)) return payload as Establecimiento[];

  if (payload && typeof payload === "object" && "establecimientos" in payload) {
    const establecimientos = (payload as { establecimientos?: unknown }).establecimientos;
    return Array.isArray(establecimientos) ? (establecimientos as Establecimiento[]) : [];
  }

  return [];
}

/* ---------------------------------------------------------
 * Panel
 * --------------------------------------------------------- */
export default function BebederosPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [bebederos, setBebederos] = useState<BebederoRow[]>([]);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editBebedero, setEditBebedero] = useState<Bebedero | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: number;
    nombre: string;
  } | null>(null);


  /* ---------------------------------------------------------
   * Carga inicial de datos   * 
   * --------------------------------------------------------- */
  async function loadBebederos() {
    const role = user?.role ?? user?.rol;
 

    if (role !== "admin") {
      setBebederos([]);
      return;
    }

    const [bebRes, estRes] = await Promise.all([
      apiFetch("/api/v1/admin/bebederos"),
      apiFetch("/api/v1/admin/establecimientos"),
    ]);
    
     
      
    if (!bebRes?.ok || !estRes?.ok) {
      setBebederos([]);
      return;
    }

    const bebederosAdmin = normalizeBebederos(await bebRes.json());
    const establecimientosAdmin = normalizeEstablecimientos(await estRes.json());
    

    setBebederos(
      bebederosAdmin.map((b) => {
        const est = establecimientosAdmin.find((e) => e.id === b.establecimiento_id);
        return {
          ...b, 
          establecimientoNombre: est?.nombre ?? "—",
          coberturaObjetivo: b.cobertura_objetivo,
          tiempoDosis: b.tiempoDosis,
          ubicacion: b.ubicacion,
        };
      })
    );
  }

  useEffect(() => {
    loadBebederos();
  }, [user]);

  /* ---------------------------------------------------------
   * Filtros 
   * --------------------------------------------------------- */
  const filtrados = bebederos.filter((b) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      b.nombre.toLowerCase().includes(s) ||
      b.id.toString().includes(search) ||
      b.establecimientoNombre.toLowerCase().includes(s)
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
    if (!bebedero) return; // seguridad

    const updated = bebederos.map((b) =>
      b.id === id ? { ...b, estado: !b.estado } : b
    );

    setBebederos(updated);

    const res = await apiFetch(`/api/v1/admin/bebederos/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ estado: !bebedero.estado }),
    });

    if (!res?.ok) {
      alert("No se pudo actualizar el estado del bebedero.");
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
          // CASO DE ERROR: el bebedero tiene datos asociados y no se puede eliminar(falta implementar en el backend)
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

  /* ---------------------------------------------------------
   * Guardar cambios
   * --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
   * Render
   * --------------------------------------------------------- */
  return (
    <div className={styles.container}>

      <div className={styles.searchRow}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Buscar por nombre, ID o establecimiento…"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="button"
            className={styles.clearBtn}
            onClick={clearFilters}
            disabled={search === ""}
          >
            Limpiar filtros
          </button>
        </div>

        <button className={styles.newUserBtn} onClick={() => setShowCreateModal(true)}>
          + Nuevo dispositivo
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Establecimiento</th>
            <th>Ubicación</th>
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
              <td>{b.id}</td>
              <td>{b.nombre}</td>
              <td>{b.establecimientoNombre}</td>
              <td>{b.ubicacion ?? "-"}</td>

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

              
              <td style={{ paddingLeft: "40px" }}>{b.tiempoDosis ?? "-"}</td>
              <td style={{ paddingLeft: "40px" }}>
                {b.cobertura_objetivo !== null && b.cobertura_objetivo !== undefined
                  ? `${b.cobertura_objetivo} %`
                  : "-"}
              </td>



              <td className={styles.actionsCell}>
                <button 
                  className={styles.editBtn}
                  onClick={(e) => {
                    e.stopPropagation();   // evita seleccionar fila
                    setEditBebedero(b);    // abre el modal con el bebedero correcto
                  }}
                >
                  Editar
                </button>

                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteClick(b.id, b.nombre)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}

          {filtrados.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.emptyCell}>
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
            <button className={styles.closeModalBtn} onClick={() => setEditBebedero(null)}>
              ✕
            </button>

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
            <button className={styles.closeModalBtn} onClick={() => setShowCreateModal(false)}>
              ✕
            </button>

            <NuevoBebederoForm
              onClose={() => {
                setShowCreateModal(false);
                loadBebederos();
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL BORRAR */}
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
