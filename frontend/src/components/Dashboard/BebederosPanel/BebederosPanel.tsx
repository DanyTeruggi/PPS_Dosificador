import { useState, useEffect } from "react";
import styles from "./BebederosPanel.module.css";
import BebederoForm from "./BebederoForm";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";

import type { Bebedero } from "../../../types/Bebedero";
import type { Establecimiento } from "../../../types/Role";

export default function BebederosPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [bebederos, setBebederos] = useState<Bebedero[]>([]);
  const [searchId, setSearchId] = useState("");
  const [editBebedero, setEditBebedero] = useState<Bebedero | null>(null);

  /**
   * Carga los bebederos según el rol del usuario.
   * 
   * cliente → sus establecimientos → bebederos
   * veterinario → clientes → establecimientos → bebederos
   * admin → (por ahora) no tiene endpoint directo, pedimos manualmente
   */
  useEffect(() => {
    async function loadBebederos() {
      let all: Bebedero[] = [];

      // ============================
      // CLIENTE
      // ============================
      if (user?.rol === "cliente") {
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

      // ============================
      // VETERINARIO
      // ============================
      if (user?.rol === "veterinario") {
        const res = await apiFetch("/api/v1/veterinarios/clientes");
        if (!res) return;

        const clientes = await res.json();

        for (const cliente of clientes) {
          const r2 = await apiFetch(
            `/api/v1/veterinarios/${cliente.veterinario_id}/clientes/${cliente.id}/establecimientos`
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

      // ============================
      // ADMIN
      // ============================
      if (user?.rol === "admin") {
        // Si querés, después hacemos un endpoint especial para admin
        console.warn("Admin: falta endpoint directo para bebederos.");
      }

      setBebederos(all);
    }

    loadBebederos();
  }, [user, apiFetch]);

  // FILTRO POR ID
  const filtrados = bebederos.filter((b) =>
    searchId === "" ? true : b.id.toString().includes(searchId)
  );

  // TOGGLE ESTADO
  async function toggleEstado(id: number) {
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

  // GUARDAR CAMBIOS DEL MODAL
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

  return (
    <div className={styles.container}>

      {/* BUSCADOR */}
      <div className={styles.searchRow}>
        <input
          type="text"
          placeholder="Buscar por ID…"
          className={styles.searchInput}
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
        />
      </div>

      {/* TABLA */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Ubicación</th>
            <th>Establecimiento</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.nombre}</td>
              <td>{b.ubicacion}</td>
              <td>{b.establecimiento}</td>

              <td>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={b.estado}
                    onChange={() => toggleEstado(b.id)}
                  />
                  <span className={styles.slider}></span>
                </label>
              </td>

              <td>
                <button
                  className={styles.editBtn}
                  onClick={() => setEditBebedero(b)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
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
    </div>
  );
}
