import { useState, useEffect } from "react";
import styles from "./UsersPanel.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";

import UserForm from "../../UserForm/UserForm";
import type { UsuarioPanel } from "../../../types/UsuarioPanel";

export default function UsersPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioPanel[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  // FILTROS
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState<"todos" | "veterinario" | "cliente">("todos");
  const [estadoFilter, setEstadoFilter] = useState<"todos" | "activo" | "inactivo">("todos");

  // EDICIÓN
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [tempRol, setTempRol] = useState("");

  /**
   * Carga inicial de usuarios desde el backend.
   * Solo el ADMIN puede acceder a este panel.
   */
  useEffect(() => {
    async function loadUsuarios() {
      if (user?.role !== "admin") return;

      // El backend actual no expone un listado de usuarios.
      // Evitamos llamar a un endpoint inexistente para no romper el dashboard.
      setUsuarios([]);
      setBackendUnavailable(true);
    }

    loadUsuarios();
  }, [user]);

  // CLEAR
  function clearFilters() {
    setSearch("");
    setRolFilter("todos");
    setEstadoFilter("todos");
  }

  // SWITCH GLOBAL
  function toggleEstadoGlobal() {
    setEstadoFilter((prev) => (prev === "activo" ? "inactivo" : "activo"));
  }

  // FILTROS COMBINADOS
  const usuariosFiltrados = usuarios
    .filter((u) => {
      const texto = search.toLowerCase();
      return (
        u.nombre.toLowerCase().includes(texto) ||
        u.userName.toLowerCase().includes(texto)
      );
    })
    .filter((u) => {
      if (rolFilter === "todos") return true;
      return u.rol.toLowerCase() === rolFilter;
    })
    .filter((u) => {
      if (estadoFilter === "todos") return true;
      return estadoFilter === "activo" ? u.activo : !u.activo;
    });

  /**
   * Guardar cambios de rol
   */
  async function guardarCambios(index: number) {
    const usuario = usuarios[index];

    const res = await apiFetch(`/api/v1/admin/usuarios/${usuario.id}/rol`, {
      method: "PUT",
      body: JSON.stringify({ rol: tempRol }),
    });

    if (!res || !res.ok) {
      alert("No se pudo actualizar el rol");
      return;
    }

    const nuevos = [...usuarios];
    nuevos[index].rol = tempRol;
    setUsuarios(nuevos);
    setEditIndex(null);
  }

  /**
   * Activar / desactivar usuario
   */
  async function toggleEstadoUsuario(index: number) {
    const usuario = usuarios[index];
    const nuevoEstado = !usuario.activo;

    const res = await apiFetch(`/api/v1/admin/usuarios/${usuario.id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ activo: nuevoEstado }),
    });

    if (!res || !res.ok) {
      alert("No se pudo cambiar el estado");
      return;
    }

    const nuevos = [...usuarios];
    nuevos[index].activo = nuevoEstado;
    setUsuarios(nuevos);
  }

  return (
    <div className={styles.container}>
      
      {/* BUSCADOR + CLEAR + FILTROS */}
      <div className={styles.searchRow}>

        {/* Grupo: buscador + clear */}
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Buscar por nombre o email…"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className={styles.clearBtn} onClick={clearFilters}>
            Clear
          </button>
        </div>

        {/* FILTROS POR ROL */}
        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${rolFilter === "veterinario" ? styles.activeFilter : ""}`}
            onClick={() => setRolFilter("veterinario")}
          >
            Veterinarios
          </button>

          <button
            className={`${styles.filterBtn} ${rolFilter === "cliente" ? styles.activeFilter : ""}`}
            onClick={() => setRolFilter("cliente")}
          >
            Clientes
          </button>

          <button className={styles.newUserBtn} onClick={() => setShowModal(true)}>
            + Nuevo usuario
          </button>
        </div>
      </div>

      {/* TABLA */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>UserName</th>
            <th>Rol</th>

            <th>
              <div className={styles.estadoHeader}>
                <span>Estado</span>
                <span className={styles.filterIcon}>⏷</span>

                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={estadoFilter === "activo"}
                    onChange={toggleEstadoGlobal}
                  />
                  <span className={styles.slider}></span>
                </label>
              </div>
            </th>

            <th></th>
          </tr>
        </thead>

        <tbody>
          {usuariosFiltrados.map((u, index) => {
            const isEditing = editIndex === index;

            return (
              <tr key={u.id}>
                <td><strong>{u.nombre}</strong></td>
                <td>{u.userName}</td>

                <td>
                  {isEditing ? (
                    <select
                      value={tempRol}
                      onChange={(e) => setTempRol(e.target.value)}
                      className={styles.selectRol}
                    >
                      <option value="cliente">Cliente</option>
                      <option value="veterinario">Veterinario</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    u.rol
                  )}
                </td>

                <td>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={u.activo}
                      onChange={() => toggleEstadoUsuario(index)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>

                <td>
                  {isEditing ? (
                    <button className={styles.saveBtn} onClick={() => guardarCambios(index)}>
                      Guardar
                    </button>
                  ) : (
                    <button
                      className={styles.editBtn}
                      onClick={() => {
                        setEditIndex(index);
                        setTempRol(u.rol);
                      }}
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {backendUnavailable && user?.role === "admin" && (
        <p style={{ marginTop: 12, opacity: 0.8 }}>
          El backend actual no expone un listado de usuarios. El panel queda disponible para altas, pero no para consultar ni editar usuarios existentes.
        </p>
      )}

      {/* MODAL */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>
              ✕
            </button>

            <UserForm onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}

    </div>
  );
}
