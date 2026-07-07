import { useState, useEffect } from "react";
import styles from "./BebederosPanel.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";

import BebederoForm from "./BebederoForm";
import NuevoBebederoForm from "./NuevoBebederoForm";
import Button from "../../Button/Button";

import type { Bebedero } from "../../../types/Bebedero";
import type { Establecimiento } from "../../../types/Role";

export default function BebederosPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [bebederos, setBebederos] = useState<Bebedero[]>([]);
  const [searchId, setSearchId] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null); // ✔ ID seleccionado por radio
  const [editBebedero, setEditBebedero] = useState<Bebedero | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  /**
   * Carga los bebederos según el rol del usuario
   */
  async function loadBebederos() {
    let all: Bebedero[] = [];

    // CLIENTE
    if (user?.role === "cliente") { console.log("USER:", user);
      const res = await apiFetch("/api/v1/clientes/mis-establecimientos");
      if (!res) return;

      const establecimientos: Establecimiento[] = await res.json();

      for (const est of establecimientos) {
        const r2 = await apiFetch(`/api/v1/establecimientos/${est.id}/bebederos`);
        if (!r2) continue;

        const beb: Bebedero[] = await r2.json();
        all = [...all, ...beb];
      }
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

        const establecimientos: Establecimiento[] = await r2.json();

        for (const est of establecimientos) {
          const r3 = await apiFetch(`/api/v1/establecimientos/${est.id}/bebederos`);
          if (!r3) continue;

          const beb: Bebedero[] = await r3.json();
          all = [...all, ...beb];
        }
      }
    }

    // ADMIN
    if (user?.role === "admin") {
      console.warn("Admin: falta endpoint directo para bebederos.");
    }

    setBebederos(all);
  }

  useEffect(() => {
    loadBebederos();
  }, [user]);

  /**
   * Filtro por ID
   */
  const filtrados = bebederos.filter((b) =>
    searchId === "" ? true : b.id.toString().includes(searchId)
  );

  /**
   * Toggle de estado (igual que UsersPanel)
   */
  async function toggleEstadoBebedero(id: number) {
    const nuevos = bebederos.map((b) =>
      b.id === id ? { ...b, estado: !b.estado } : b
    );
    setBebederos(nuevos);

    await apiFetch(`/api/v1/admin/bebederos/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({
        estado: nuevos.find((b) => b.id === id)?.estado,
      }),
    });
  }

  /**
   * Guardar cambios del formulario de edición
   */
  async function guardarCambios(bebederoActualizado: Bebedero) {
    const nuevos = bebederos.map((b) =>
      b.id === bebederoActualizado.id ? bebederoActualizado : b
    );
    setBebederos(nuevos);

    await apiFetch(`/api/v1/bebederos/${bebederoActualizado.id}`, {
      method: "PUT",
      body: JSON.stringify(bebederoActualizado),
    });

    setEditBebedero(null);
  }

  /**
   * Botón global "Editar"
   * - Verifica que haya un bebedero seleccionado
   * - Pide los datos al backend
   * - Abre el modal con el formulario cargado
   */
  async function handleEditClick() {
    if (!selectedId) {
      alert("Seleccioná un bebedero para editar.");
      return;
    }

    const res = await apiFetch(`/api/v1/bebederos/${selectedId}`);
    if (!res || !res.ok) {
      alert("No se pudo cargar el bebedero.");
      return;
    }

    const data = await res.json();
    setEditBebedero(data); // ✔ abre el modal con datos cargados
  }

  return (
    <div className={styles.container}>

      {/* HEADER: buscador + botones */}
      <div className={styles.headerRow}>
        
        {/* Buscador */}
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="Buscar por ID…"
            className={styles.searchInput}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>

        {/* Botones */}
        <div className={styles.actionsRow}>
          <Button
            label="+ Nuevo dispositivo"
            variant="tertiary"
            fullWidth={false}
            onClick={() => setShowCreateModal(true)}
          />
          
          <Button
            label="Editar"
            variant="tertiary"
            fullWidth={false}
            onClick={handleEditClick}
          />
        </div>
      </div>

      {/* TABLA */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th></th> {/* radio */}
            <th>ID</th>
            <th>Nombre</th>
            <th>Establecimiento</th>
            <th>Estado</th>
            <th>Tiempo de Dosis</th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map((b) => (
            <tr
              key={b.id}
              className={selectedId === b.id ? styles.selectedRow : ""}
            >
              {/* Radio button para seleccionar */}
              <td>
                <input
                  type="radio"
                  name="bebederoSeleccionado"
                  checked={selectedId === b.id}
                  onChange={() => setSelectedId(b.id)}
                />
              </td>

              <td>{b.id}</td>
              <td>{b.nombre}</td>
              <td>{b.establecimiento}</td>

              {/* Toggle estado */}
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

              <td>{b.tiempoDosis}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL EDITAR */}
      {editBebedero && (
        <div className={styles.modalOverlay} onClick={() => setEditBebedero(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setEditBebedero(null)}>
              ✕
            </button>

            <BebederoForm
              bebedero={editBebedero}
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

            <NuevoBebederoForm
              onClose={() => {
                setShowCreateModal(false);
                loadBebederos(); // ✔ refresca la tabla
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
