import { useState, useEffect } from "react";
import styles from "./UsersPanel.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";

import UserForm from "../../UserForm/UserForm";
import type { UsuarioPanel } from "../../../types/UsuarioPanel";

type UsuarioApi = {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
};

type PerfilApi = {
  usuario: UsuarioApi;
};

export default function UsersPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioPanel[]>([]);
  const [showModal, setShowModal] = useState(false);
 

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
      const role = user?.role ?? user?.rol;
      if (role !== "admin") return;

      // TODO: Reemplazar estas dos consultas por GET /api/v1/admin/usuarios
      // cuando el backend implemente el endpoint para listar todos los usuarios.
      const [veterinariosRes, clientesRes] = await Promise.all([
        apiFetch("/api/v1/admin/veterinarios"),
        apiFetch("/api/v1/admin/clientes"),
      ]);

      if (!veterinariosRes?.ok || !clientesRes?.ok) {
        setUsuarios([]);
      
        return;
      }

      const veterinarios: PerfilApi[] = await veterinariosRes.json();
      const clientes: PerfilApi[] = await clientesRes.json();

      const perfiles = [...veterinarios, ...clientes];

      const todosLosUsuarios: UsuarioPanel[] = perfiles.map(
        ({ usuario }) => ({
          id: usuario.id,
          userName: usuario.email,
          nombre: usuario.nombre,
          rol: usuario.rol,
          activo: usuario.activo,
        })
      );

      // Conserva un solo registro por usuario aunque aparezca en ambos endpoints.
      const usuariosSinDuplicados = Array.from(
        new Map(
          todosLosUsuarios.map((usuario) => [
            usuario.id,
            usuario,
          ])
        ).values()
      );

      setUsuarios(usuariosSinDuplicados);
      
    }

    loadUsuarios();
  }, [user]);

  // CLEAR
  function clearFilters() {
    setSearch("");
    setRolFilter("todos");
    setEstadoFilter("todos");
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
           Limpiar filtros
            
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
