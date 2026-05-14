import { useState } from "react";
import styles from "./UsersPanel.module.css";
import usuariosData from "../../../../public/mock/usuarios.json";
import UserForm from "../../UserForm/UserForm";
import type { UsuarioPanel } from "../../../types/UsuarioPanel";

export default function UsersPanel() {
  // LISTA DE USUARIOS
  const [usuarios, setUsuarios] = useState<UsuarioPanel[]>(usuariosData);

  // MODAL
  const [showModal, setShowModal] = useState(false);

  // FILTROS
  const [search, setSearch] = useState("");
  const [rolFilter, setRolFilter] = useState<"todos" | "veterinario" | "productor">("todos");
  const [estadoFilter, setEstadoFilter] = useState<"todos" | "activo" | "inactivo">("todos");

  // EDICIÓN
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [tempRol, setTempRol] = useState("");

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

  // GUARDAR CAMBIOS
  async function guardarCambios(index: number) {
    const usuario = usuarios[index];

    const payload = { ...usuario, rol: tempRol };

    try {
      const response = await fetch("http://localhost:3000/api/usuarios/" + usuario.id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Error al actualizar usuario");

      const nuevos = [...usuarios];
      nuevos[index].rol = tempRol;
      setUsuarios(nuevos);
      setEditIndex(null);
    } catch (error) {
      console.error("Error guardando cambios:", error);
      alert("No se pudo guardar el cambio");
    }
  }

  // TOGGLE INDIVIDUAL
  function toggleEstadoUsuario(index: number) {
    const nuevos = [...usuarios];
    nuevos[index].activo = !nuevos[index].activo;
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
            className={`${styles.filterBtn} ${rolFilter === "productor" ? styles.activeFilter : ""}`}
            onClick={() => setRolFilter("productor")}
          >
            Productores
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
                      <option value="Productor">Productor</option>
                      <option value="Veterinario">Veterinario</option>
                      <option value="Admin">Admin</option>
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
