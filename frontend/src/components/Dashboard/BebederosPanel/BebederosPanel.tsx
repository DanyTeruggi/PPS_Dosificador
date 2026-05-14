import { useState, useEffect } from "react";
import styles from "./BebederosPanel.module.css";
import BebederoForm from "./BebederoForm";
import type { Bebedero } from "../../../types/Bebedero";

// IMPORTAMOS EL MOCK
import bebederosMock from "../../../../public/mock/bebderos.json";

export default function BebederosPanel() {
  const [bebederos, setBebederos] = useState<Bebedero[]>([]);
  const [searchId, setSearchId] = useState("");
  const [editBebedero, setEditBebedero] = useState<Bebedero | null>(null);

  // GET inicial (USANDO MOCK)
  useEffect(() => {
    setBebederos(bebederosMock);

    /*
    // GET REAL A LA API
    fetch("http://localhost:3000/api/bebederos")
      .then((res) => res.json())
      .then((data) => setBebederos(data));
    */
  }, []);

  // FILTRO POR ID
  const filtrados = bebederos.filter((b) =>
    searchId === "" ? true : b.id.toString().includes(searchId)
  );

  // TOGGLE ESTADO (solo local por ahora)
  function toggleEstado(id: number) {
    const nuevos = bebederos.map((b) =>
      b.id === id ? { ...b, estado: !b.estado } : b
    );
    setBebederos(nuevos);

    /*
    // PATCH REAL A LA API
    await fetch(`http://localhost:3000/api/bebederos/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevos.find((b) => b.id === id)?.estado }),
    });
    */
  }

  // GUARDAR CAMBIOS DEL MODAL
  function guardarCambios(bebederoActualizado: Bebedero) {
    const nuevos = bebederos.map((b) =>
      b.id === bebederoActualizado.id ? bebederoActualizado : b
    );
    setBebederos(nuevos);

    /*
    // PUT REAL A LA API
    await fetch(`http://localhost:3000/api/bebederos/${bebederoActualizado.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bebederoActualizado),
    });
    */

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
            <th>Veterinario</th>
            <th>Productor</th>
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
              <td>{b.veterinario}</td>
              <td>{b.productor}</td>

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
