import { useState, useEffect } from "react";
import styles from "./EstablecimientoPanel.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";

import Button from "../../Button/Button";
import NuevoEstablecimientoForm from "./NuevoEstablecimientoForm";
import EditarEstablecimientoForm from "./EditarEstablecimientoForm";

import type { Establecimiento } from "../../../types/Establecimiento";

export default function EstablecimientoPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  // Lista de establecimientos
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
 

  // Buscador
  const [search, setSearch] = useState("");

  // ID seleccionado por radio button
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editEstablecimiento, setEditEstablecimiento] = useState<Establecimiento | null>(null);

  /**
   * Cargar establecimientos según el rol del usuario
   */
  async function loadEstablecimientos() {
    let all: Establecimiento[] = [];
     console.log("ESTABLECIMIENTOS:", establecimientos);

    // CLIENTE
    if (user?.role === "cliente") {
      const res = await apiFetch("/api/v1/clientes/mis-establecimientos");
        console.log("FETCH 1:", res);
        console.log("FETCH 1 JSON:", await res?.json);
      if (!res) return;
      all = await res.json();
    }

    // VETERINARIO
    if (user?.role === "veterinario") {
      const res = await apiFetch("/api/v1/veterinarios/me");
      if (!res) return;

      const veterinario = await res.json();
      const clientes = veterinario?.clientes ?? [];

      for (const cliente of clientes) {
        const r2 = await apiFetch(
          `/api/v1/veterinarios/clientes/${cliente.id}/establecimientos`
        );
        if (!r2) continue;

        const ests: Establecimiento[] = await r2.json();
        all = [...all, ...ests];
      }
    }

    // ADMIN
    if (user?.role === "admin") {
      console.warn("Admin: falta endpoint directo para establecimientos.");
    }
    
    
    setEstablecimientos(all);
  }

  useEffect(() => {
    loadEstablecimientos();
  }, [user]);

  /**
   * Filtro por nombre o ID
   */
  const filtrados = establecimientos.filter((e) => {
    if (search === "") return true;
    return (
      e.nombre.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toString().includes(search)
    );
  });

  /**
   * Botón global "Editar"
   * - Verifica que haya un establecimiento seleccionado
   * - Pide los datos al backend
   * - Abre el modal con el formulario cargado
   */
  async function handleEditClick() {
    if (!selectedId) {
      alert("Seleccioná un establecimiento para editar.");
      return;
    }

    const res = await apiFetch(`/api/v1/establecimientos/${selectedId}`);
    if (!res || !res.ok) {
      alert("No se pudo cargar el establecimiento.");
      return;
    }

    const data = await res.json();
    setEditEstablecimiento(data);
  }

  /**
   * Guardar cambios del formulario de edición
   */
  async function guardarCambios(estActualizado: Establecimiento) {
    const nuevos = establecimientos.map((e) =>
      e.id === estActualizado.id ? estActualizado : e
    );
    setEstablecimientos(nuevos);

    await apiFetch(`/api/v1/establecimientos/${estActualizado.id}`, {
      method: "PUT",
      body: JSON.stringify(estActualizado),
    });

    setEditEstablecimiento(null);
  }


  return (
    
    <div className={styles.container}>

      {/* HEADER: buscador + botones */}
      <div className={styles.headerRow}>
        
        {/* Buscador */}
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="Buscar por nombre o ID…"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Botones */}
        <div className={styles.actionsRow}>
          <Button
            label="Editar"
            variant="secondary"
            fullWidth={false}
            onClick={handleEditClick}
          />

          <Button
            label="+ Nuevo establecimiento"
            variant="tertiary"
            fullWidth={false}
            onClick={() => setShowCreateModal(true)}
          />
        </div>
      </div>

      {/* TABLA */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Cliente</th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map((e) => (
            <tr
              key={e.id}
              className={selectedId === e.id ? styles.selectedRow : ""}
            >
              <td>
                <input
                  type="radio"
                  name="establecimientoSeleccionado"
                  checked={selectedId === e.id}
                  onChange={() => setSelectedId(e.id)}
                />
              </td>

              <td>{e.id}</td>
              <td>{e.nombre}</td>
              <td>{e.ubicacion}</td>
              <td>{e.cliente_id}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL EDITAR */}
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

      {/* MODAL CREAR */}
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
