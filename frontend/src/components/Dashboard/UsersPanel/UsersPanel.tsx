import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import styles from "./../Styles/PanelStyles.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/useAuth";

import UserForm from "../../UserForm/UserForm";
import AsignarVeterinarioModal from "./AsignarVeterinario";
import ClientesAsociadosModal from "./ClientesAsociados";
import EditUserForm from "./EditUserForm";
import type { AdminUserResponse, AdminUserRow } from "../../../types/AdminUser";
import ButtonX from "../../ButtonX/ButtonX";
import ButtonSearch from "../../ButtonSearch/ButtonSearch";
import ButtonTable from "../../ButtonTable/ButtonTable";
import { canChangeUserStatus } from "./userStatusUtils";

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

  // FUNCIÓN GLOBAL PARA RECARGAR USUARIOS
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

  // CARGA INICIAL DE USUARIOS
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

  // AACTIVAR/DESACTIVAR USUARIO
  async function toggleEstadoUsuario(usuarioId: number) {
    const usuario = usuarios.find((item) => item.id === usuarioId);
    if (!usuario) return;
    if (!canChangeUserStatus(usuario.rol)) {
      toast.error("Las cuentas administrativas no pueden desactivarse.");
      return;
    }

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

          <ButtonSearch
            variant="clear"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Limpiar filtros
          </ButtonSearch>
        </div>

        {/* FILTROS POR ROL */}
        <div className={styles.filters}>
          <ButtonSearch
            variant="filter"
            active={rolFilter === "veterinario"}
            onClick={() => selectRoleFilter("veterinario")}
          >
            Veterinarios
          </ButtonSearch>

          <ButtonSearch
            variant="filter"
            active={rolFilter === "cliente"}
            onClick={() => selectRoleFilter("cliente")}
          >
            Clientes
          </ButtonSearch>

          <ButtonSearch
            variant="filter"
            active={rolFilter === "admin"}
            onClick={() => selectRoleFilter("admin")}
          >
            Admin
          </ButtonSearch>

          {/* NUEVO USUARIO */}
          <ButtonSearch variant="primary" onClick={() => setShowModalNuevoUsuario(true)}>
            Nuevo usuario
          </ButtonSearch>

          {/* ASIGNAR VETERINARIO */}
          {selectedUserRol === "cliente" && (
            <ButtonSearch
              variant="primary"
              onClick={() => setShowAsignarVetModal(true)}
            >
              Asignar veterinario
            </ButtonSearch>
          )}
          {selectedUserRol === "veterinario" && (
            <ButtonSearch variant="primary" onClick={() => setShowClientesModal(true)}>
              Clientes asociados
            </ButtonSearch>
          )}
        </div>
      </div>

      {/* TABLA */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Razón social</th>
            <th>Correo Electronico</th>
            <th>Telefono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {usuariosFiltrados.map((u) => {
            const canChangeStatus = canChangeUserStatus(u.rol);
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
                <td>{u.cliente?.razon_social || "-"}</td>
                <td>{u.email}</td>
                <td>{u.telefono}</td>

                <td>{u.rol}</td>

                <td>
                  <label
                    className={`${styles.switch} ${!canChangeStatus ? styles.switchLocked : ""}`}
                    title={!canChangeStatus
                      ? "Las cuentas administrativas no pueden desactivarse"
                      : undefined}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!canChangeStatus) {
                        event.preventDefault();
                        toast("Las cuentas administrativas no pueden desactivarse.", {
                          icon: "🔒",
                        });
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={u.activo}
                      disabled={!canChangeStatus}
                      aria-label={canChangeStatus
                        ? `Cambiar estado de ${u.nombre}`
                        : `${u.nombre} es administrador y su estado está protegido`}
                      onChange={() => toggleEstadoUsuario(u.id)}
                    />
                    <span className={styles.slider}></span>
                  </label>
                </td>

                <td>
                  <ButtonTable
                    variant="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditUsuario(u);
                    }}
                  >
                    Editar
                  </ButtonTable>
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
            <ButtonX className={styles.closeModalBtn} onClick={() => setShowModalNuevoUsuario(false)} />
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
            <ButtonX className={styles.closeModalBtn} onClick={() => setEditUsuario(null)} />
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
            <ButtonX className={styles.closeModalBtn} onClick={() => setShowAsignarVetModal(false)} />

            <AsignarVeterinarioModal
              usuarioId={selectedUserId}
              onClose={() => {
                setShowAsignarVetModal(false);
                loadUsuarios(); {/* 🔥 refresca la tabla */ }
              }}
            />
          </div>
        </div>
      )}

      {showClientesModal && selectedUserId && (
        <div className={styles.modalOverlay} onClick={() => setShowClientesModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <ButtonX className={styles.closeModalBtn} onClick={() => setShowClientesModal(false)} />
            <ClientesAsociadosModal usuarioId={selectedUserId} onClose={() => { setShowClientesModal(false); void loadUsuarios(); }} />
          </div>
        </div>
      )}

    </div>
  );
}
