import { useState, useEffect } from "react";
import styles from "./../Style/PanelStyles.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";

import UserForm from "../../UserForm/UserForm";
import AsignarVeterinarioModal from "./AsignarVeterinario";



type UsuarioApi = {
  id: number;
  email?: string | null;
  nombre?: string | null;
  telefono?: string | null;
  rol?: string | null;
  activo: boolean;
};

type UsuarioRow = {
  id: number;
  email: string;
  nombre: string;
  telefono: string;
  rol: string;
  activo: boolean;
};

type PerfilApi = {
  usuario: UsuarioApi;
};

export default function UsersPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [showModalNuevoUsuario, setShowModalNuevoUsuario] = useState(false);

  // Modal para asignar veterinario
  const [showAsignarVetModal, setShowAsignarVetModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserRol, setSelectedUserRol] = useState<string>("");

  // FILTROS
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState<"todos" | "veterinario" | "cliente">("todos");
  const [estadoFilter, setEstadoFilter] = useState<"todos" | "activo" | "inactivo">("todos");

  // EDICIÓN
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [tempRol, setTempRol] = useState("");

  /**
   * 🔥 FUNCIÓN GLOBAL PARA RECARGAR USUARIOS
   */
  async function loadUsuarios() {
    const role = user?.role ?? user?.rol;
    if (role !== "admin") return;

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

    // Normaliza los campos opcionales para que la tabla siempre reciba textos.
    const todosLosUsuarios: UsuarioRow[] = perfiles.map(
      ({ usuario }) => ({
        id: usuario.id,
        email: usuario.email ?? "",
        nombre: usuario.nombre ?? "",
        telefono: usuario.telefono ?? "",
        rol: usuario.rol ?? "",
        activo: usuario.activo,
      })
    );

    const usuariosSinDuplicados = Array.from(
      new Map(todosLosUsuarios.map((u) => [u.id, u])).values()
    );

    setUsuarios(usuariosSinDuplicados);
  }

  /**
   * Carga inicial
   */
  useEffect(() => {
    loadUsuarios();
  }, [user]);

  // CLEAR
  function clearFilters() {
    setSearch("");
    setRolFilter("todos");
    setEstadoFilter("todos");
  }

  const hasActiveFilters =
    search !== "" || rolFilter !== "todos" || estadoFilter !== "todos";

  // FILTROS COMBINADOS
  const usuariosFiltrados = usuarios
    .filter((u) => {
      const texto = search.trim().toLowerCase();

      // String evita errores si la API devuelve null, undefined o un numero.
      const nombre = String(u.nombre ?? "").toLowerCase();
      const email = String(u.email ?? "").toLowerCase();
      const telefono = String(u.telefono ?? "").toLowerCase();

      return (
        nombre.includes(texto) ||
        email.includes(texto) ||
        telefono.includes(texto)
      );
    })
    .filter((u) => {
      if (rolFilter === "todos") return true;
      return String(u.rol ?? "").toLowerCase() === rolFilter;
    })
    .filter((u) => {
      if (estadoFilter === "todos") return true;
      return estadoFilter === "activo" ? u.activo : !u.activo;
    });

  /**
   * Guardar cambios de rol
   */
  async function guardarCambios(usuarioId: number) {
    const usuario = usuarios.find((item) => item.id === usuarioId);
    if (!usuario) return;

    const res = await apiFetch(`/api/v1/admin/usuarios/${usuario.id}/rol`, {
      method: "PUT",
      body: JSON.stringify({ rol: tempRol }),
    });

    if (!res || !res.ok) {
      alert("No se pudo actualizar el rol");
      return;
    }

    // Actualiza por ID para no depender de la posicion de la lista filtrada.
    setUsuarios((actuales) =>
      actuales.map((item) =>
        item.id === usuarioId ? { ...item, rol: tempRol } : item
      )
    );
    setEditingUserId(null);
  }

  /**
   * Activar / desactivar usuario
   */
  async function toggleEstadoUsuario(usuarioId: number) {
    const usuario = usuarios.find((item) => item.id === usuarioId);
    if (!usuario) return;

    const nuevoEstado = !usuario.activo;

    const res = await apiFetch(`/api/v1/admin/usuarios/${usuario.id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ activo: nuevoEstado }),
    });

    if (!res || !res.ok) {
      alert("No se pudo cambiar el estado");
      return;
    }

    // Actualiza por ID porque el indice cambia cuando se aplica un filtro.
    setUsuarios((actuales) =>
      actuales.map((item) =>
        item.id === usuarioId ? { ...item, activo: nuevoEstado } : item
      )
    );
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

          <button
            type="button"
            className={styles.clearBtn}
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
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

          {/* NUEVO USUARIO */}
          <button className={styles.newUserBtn} onClick={() => setShowModalNuevoUsuario(true)}>
            + Nuevo usuario
          </button>

          {/* ASIGNAR VETERINARIO */}
          {selectedUserRol === "cliente" && (
            <button
              className={styles.newUserBtn}
              onClick={() => setShowAsignarVetModal(true)}
            >
              + Asignar Veterinario
            </button>
          )}
        </div>
      </div>

      {/* TABLA */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo Electronico</th>
            <th>Telefono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {usuariosFiltrados.map((u) => {
            const isEditing = editingUserId === u.id;

            return (
              <tr
                key={u.id}
                onClick={() => {
                  setSelectedUserId(u.id);
                  setSelectedUserRol(u.rol);
                }}
                className={`${styles.rowClickable} ${selectedUserId === u.id ? styles.rowSelected : ""}`}
              >
                <td><strong>{u.nombre}</strong></td>
                <td>{u.email}</td>
                <td>{u.telefono}</td>
                
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
                      onChange={() => toggleEstadoUsuario(u.id)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>

                <td>
                  {isEditing ? (
                    <button className={styles.saveBtn} onClick={() => guardarCambios(u.id)}>
                      Guardar
                    </button>
                  ) : (
                    <button
                      className={styles.editBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingUserId(u.id);
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

      {/* MODAL: NUEVO USUARIO */}
      {showModalNuevoUsuario && (
        <div className={styles.modalOverlay} onClick={() => setShowModalNuevoUsuario(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setShowModalNuevoUsuario(false)}>
              ✕
            </button>

            <UserForm
              onClose={() => setShowModalNuevoUsuario(false)}
              onCreated={() => loadUsuarios()}   
            />
          </div>
        </div>
      )}

      {/* MODAL: ASIGNAR VETERINARIO */}
      {showAsignarVetModal && selectedUserId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAsignarVetModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeModalBtn}
              onClick={() => setShowAsignarVetModal(false)}
            >
              ✕
            </button>

            <AsignarVeterinarioModal
              usuarioId={selectedUserId}
              onClose={() => {
                setShowAsignarVetModal(false);
                loadUsuarios();   {/* 🔥 refresca la tabla */}
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
