import { useState, useEffect } from "react";
import styles from "./BebederosPanel.module.css";

import { useApi } from "../../../utils/apiFetch";
import { useAuth } from "../../../context/AuthContext";

import BebederoForm from "./BebederoForm";
import NuevoBebederoForm from "./NuevoBebederoForm";

import type { Bebedero } from "../../../types/Bebedero";
import type { Establecimiento } from "../../../types/Establecimiento";

type BebederoRow = Bebedero & {
  establecimientoNombre: string;
};

type ClienteProfileResponse = {
  establecimientos?: Establecimiento[];
};

type VeterinarioProfileResponse = {
  veterinario_id: number;
};

type VeterinarioCliente = {
  cliente_id: number;
};

type VeterinarioClientesResponse = {
  clientes?: VeterinarioCliente[];
};

function normalizeEstablecimientos(payload: unknown): Establecimiento[] {
  if (Array.isArray(payload)) {
    return payload as Establecimiento[];
  }

  if (payload && typeof payload === "object" && "establecimientos" in payload) {
    const establecimientos = (payload as { establecimientos?: unknown }).establecimientos;
    return Array.isArray(establecimientos) ? (establecimientos as Establecimiento[]) : [];
  }

  return [];
}

function normalizeBebederos(payload: unknown): Bebedero[] {
  if (Array.isArray(payload)) {
    return payload as Bebedero[];
  }

  if (payload && typeof payload === "object" && "bebederos" in payload) {
    const bebederos = (payload as { bebederos?: unknown }).bebederos;
    return Array.isArray(bebederos) ? (bebederos as Bebedero[]) : [];
  }

  return [];
}

export default function BebederosPanel() {
  const { apiFetch } = useApi();
  const { user } = useAuth();

  const [bebederos, setBebederos] = useState<BebederoRow[]>([]);
  const [search, setSearch] = useState("");
  const [editBebedero, setEditBebedero] = useState<Bebedero | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  async function loadBebederos() {
    const role = user?.role ?? user?.rol;

    if (!role) {
      setBebederos([]);
      return;
    }

    if (role === "cliente") {
      const profileRes = await apiFetch("/api/v1/clientes/me");
      if (!profileRes || !profileRes.ok) return;

      const profile: ClienteProfileResponse = await profileRes.json();
      let establecimientos = normalizeEstablecimientos(profile.establecimientos);

      if (establecimientos.length === 0) {
        const establecimientosRes = await apiFetch("/api/v1/clientes/mis-establecimientos");
        if (!establecimientosRes || !establecimientosRes.ok) return;

        const payload = await establecimientosRes.json();
        establecimientos = normalizeEstablecimientos(payload);
      }

      const rows = await Promise.all(
        establecimientos.map(async (establecimiento) => {
          const bebederosRes = await apiFetch(`/api/v1/establecimientos/${establecimiento.id}/bebederos`);
          if (!bebederosRes || !bebederosRes.ok) {
            return [] as BebederoRow[];
          }

          const payload = await bebederosRes.json();
          const bebederosEstablecimiento = normalizeBebederos(payload);

          return bebederosEstablecimiento.map((bebedero) => ({
            ...bebedero,
            establecimientoNombre: establecimiento.nombre,
          }));
        })
      );

      setBebederos(rows.flat());
      return;
    }

    if (role === "veterinario") {
      const [profileRes, clientesRes] = await Promise.all([
        apiFetch("/api/v1/veterinarios/me"),
        apiFetch("/api/v1/veterinarios/clientes"),
      ]);

      if (!profileRes || !profileRes.ok || !clientesRes || !clientesRes.ok) return;

      const profile: VeterinarioProfileResponse = await profileRes.json();
      const clientesPayload: VeterinarioClientesResponse = await clientesRes.json();
      const clientes = clientesPayload.clientes ?? [];

      const rows = await Promise.all(
        clientes.map(async (cliente) => {
          const establecimientosRes = await apiFetch(
            `/api/v1/veterinarios/${profile.veterinario_id}/clientes/${cliente.cliente_id}/establecimientos`
          );

          if (!establecimientosRes || !establecimientosRes.ok) {
            return [] as BebederoRow[];
          }

          const establecimientosPayload = await establecimientosRes.json();
          const establecimientos = normalizeEstablecimientos(establecimientosPayload);

          const bebederosPorEstablecimiento = await Promise.all(
            establecimientos.map(async (establecimiento) => {
              const bebederosRes = await apiFetch(`/api/v1/establecimientos/${establecimiento.id}/bebederos`);
              if (!bebederosRes || !bebederosRes.ok) {
                return [] as BebederoRow[];
              }

              const payload = await bebederosRes.json();
              const bebederosEstablecimiento = normalizeBebederos(payload);

              return bebederosEstablecimiento.map((bebedero) => ({
                ...bebedero,
                establecimientoNombre: establecimiento.nombre,
              }));
            })
          );

          return bebederosPorEstablecimiento.flat();
        })
      );

      setBebederos(rows.flat());
      return;
    }

    setBebederos([]);
  }

  useEffect(() => {
    loadBebederos();
  }, [user]);

  const filtrados = bebederos.filter((b) => {
    if (search === "") return true;

    const searchValue = search.toLowerCase();
    return (
      b.id.toString().includes(search) ||
      b.nombre.toLowerCase().includes(searchValue) ||
      b.establecimientoNombre.toLowerCase().includes(searchValue)
    );
  });

  async function toggleEstadoBebedero(id: number) {
    const nuevos = bebederos.map((b) =>
      b.id === id ? { ...b, estado: !b.estado } : b
    );
    setBebederos(nuevos);

    const res = await apiFetch(`/api/v1/admin/bebederos/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({
        estado: nuevos.find((b) => b.id === id)?.estado,
      }),
    });

    if (!res || !res.ok) {
      setBebederos(bebederos);
      alert("No se pudo cambiar el estado del bebedero.");
    }
  }

  async function guardarCambios(bebederoActualizado: Bebedero) {
    const nuevos = bebederos.map((b) =>
      b.id === bebederoActualizado.id
        ? { ...b, ...bebederoActualizado }
        : b
    );
    setBebederos(nuevos);

    await apiFetch(`/api/v1/bebederos/${bebederoActualizado.id}`, {
      method: "PUT",
      body: JSON.stringify(bebederoActualizado),
    });

    setEditBebedero(null);
  }

  async function handleEditClick(id: number) {
    const res = await apiFetch(`/api/v1/bebederos/${id}`);
    if (!res || !res.ok) {
      alert("No se pudo cargar el bebedero.");
      return;
    }

    const data = await res.json();
    setEditBebedero(data);
  }

  function clearFilters() {
    setSearch("");
  }

  return (
    <div className={styles.container}>

      <div className={styles.searchRow}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Buscar por ID, nombre o establecimiento…"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className={styles.clearBtn} onClick={clearFilters}>
            Clear
          </button>
        </div>

        <div className={styles.filters}>
          <button className={styles.newUserBtn} onClick={() => setShowCreateModal(true)}>
            + Nuevo dispositivo
          </button>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Establecimiento</th>
            <th>Estado</th>
            <th>Tiempo de Dosis</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtrados.map((b) => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.nombre}</td>
              <td>{b.establecimientoNombre}</td>

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
              <td>
                <button className={styles.editBtn} onClick={() => handleEditClick(b.id)}>
                  Editar
                </button>
              </td>
            </tr>
          ))}

          {filtrados.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.emptyCell}>
                No hay bebederos para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
