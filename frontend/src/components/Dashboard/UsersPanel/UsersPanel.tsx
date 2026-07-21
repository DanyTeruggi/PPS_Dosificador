import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import styles from "./../Style/PanelStyles.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/useAuth";

import UserForm from "../../UserForm/UserForm";
import AsignarVeterinarioModal from "./AsignarVeterinario";
import ClientesAsociadosModal from "./ClientesAsociados";
import EditUserForm from "./EditUserForm";
import type { AdminUserResponse, AdminUserRow } from "../../../types/AdminUser";

export default function UsersPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [usuarios, setUsuarios] = useState<AdminUserRow[]>([]);
  const [showModalNuevoUsuario, setShowModalNuevoUsuario] = useState(false);
  const [editUsuario, setEditUsuario] = useState<AdminUserRow | null>(null);

  // Modal para asignar veterinario
  const [showAsignarVetModal, setShowAsignarVetModal] = useState(false);
  const [showClientesModal, setShowClientesModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserRol, setSelectedUserRol] = useState<string>("");

  // FILTROS
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState<
    "todos" | "veterinario" | "cliente" | "admin"
  >("todos");
  const [estadoFilter, setEstadoFilter] = useState<"todos" | "activo" | "inactivo">("todos");

  /**
   * 🔥 FUNCIÓN GLOBAL PARA RECARGAR USUARIOS
   */
  const loadUsuarios = useCallback(async () => {
    const role = user?.role ?? user?.rol;
    if (role !== "admin") return;

    const usuariosRes = await apiFetch("/api/v1/admin/usuarios");

    if (!usuariosRes?.ok) {
      setUsuarios([]);
      return;
    }

    const usuariosApi = (await usuariosRes.json()) as AdminUserResponse[];

    const todosLosUsuarios: AdminUserRow[] = usuariosApi.map(
      (usuario) => ({
        id: usuario.id,
        email: usuario.email ?? "",
        nombre: usuario.nombre ?? "",
        telefono:
          usuario.telefono ??
          usuario.veterinario?.telefono ??
          usuario.cliente?.telefono ??
          "",
        rol: usuario.rol ?? "",
        activo: usuario.activo,
        clave_fiscal: usuario.clave_fiscal,
        veterinario: usuario.veterinario,
        cliente: usuario.cliente,
      })
    );

    const usuariosSinDuplicados = Array.from(
      new Map(todosLosUsuarios.map((u) => [u.id, u])).values()
    );

    setUsuarios(usuariosSinDuplicados);
  }, [apiFetch, user]);

  /**
   * Carga inicial
   */
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsuarios();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadUsuarios]);

  // CLEAR
  function clearFilters() {
    setSearch("");
    setRolFilter("todos");
    setEstadoFilter("todos");
    setSelectedUserId(null);
    setSelectedUserRol("");
  }

  function selectRoleFilter(role: "veterinario" | "cliente" | "admin") {
    setRolFilter(role);
    setSelectedUserId(null);
    setSelectedUserRol("");
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
      toast.error("No se pudo cambiar el estado.");
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
            placeholder="Buscar por cliente o email…"
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
            onClick={() => selectRoleFilter("veterinario")}
          >
            Veterinarios
          </button>

          <button
            className={`${styles.filterBtn} ${rolFilter === "cliente" ? styles.activeFilter : ""}`}
            onClick={() => selectRoleFilter("cliente")}
          >
            Clientes
          </button>

          <button
            className={`${styles.filterBtn} ${rolFilter === "admin" ? styles.activeFilter : ""}`}
            onClick={() => selectRoleFilter("admin")}
          >
            Admin
          </button>

          {/* NUEVO USUARIO */}
          <button className={styles.newUserBtn} onClick={() => setShowModalNuevoUsuario(true)}>
            Nuevo usuario
          </button>

          {/* ASIGNAR VETERINARIO */}
          {selectedUserRol === "cliente" && (
            <button
              className={styles.newUserBtn}
              onClick={() => setShowAsignarVetModal(true)}
            >
              Asignar Veterinario
            </button>
          )}
          {selectedUserRol === "veterinario" && (
            <button className={styles.newUserBtn} onClick={() => setShowClientesModal(true)}>
              Clientes asociados
            </button>
          )}
        </div>
      </div>

      {/* TABLA */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Correo Electronico</th>
            <th>Telefono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {usuariosFiltrados.map((u) => {
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
                
                <td>{u.rol}</td>

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
                  <button
                    className={styles.editBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditUsuario(u);
                    }}
                  >
                    Editar
                  </button>
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
              mode="admin-create"
              onClose={() => setShowModalNuevoUsuario(false)}
              onCreated={() => loadUsuarios()}   
            />
          </div>
        </div>
      )}

      {/* MODAL: EDITAR USUARIO */}
      {editUsuario && (
        <div className={styles.modalOverlay} onClick={() => setEditUsuario(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setEditUsuario(null)}>
              ✕
            </button>
            <EditUserForm
              usuario={editUsuario}
              onClose={() => setEditUsuario(null)}
              onSaved={loadUsuarios}
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

      {showClientesModal && selectedUserId && (
        <div className={styles.modalOverlay} onClick={() => setShowClientesModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setShowClientesModal(false)}>✕</button>
            <ClientesAsociadosModal usuarioId={selectedUserId} onClose={() => { setShowClientesModal(false); void loadUsuarios(); }} />
          </div>
        </div>
      )}

    </div>
  );
}
