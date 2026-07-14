import { useEffect, useState } from "react";
import styles from "./AsignarVeterinario.module.css";
import { useApi } from "../../../utils/apiFetch";

interface Props {
  usuarioId: number;
  onClose: () => void;
}

export default function AsignarVeterinario({ usuarioId, onClose }: Props) {
  const { apiFetch } = useApi();

  const [cliente, setCliente] = useState<any | null>(null);
  const [veterinarioActual, setVeterinarioActual] = useState<any | null>(null);
  const [veterinarios, setVeterinarios] = useState<any[]>([]);
  const [searchVet, setSearchVet] = useState("");
  const [nuevoVetId, setNuevoVetId] = useState<number | null>(null);
  const [veterinarioSeleccionado, setVeterinarioSeleccionado] = useState<any | null>(null);
  const [mostrarBuscador, setMostrarBuscador] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar cliente
  useEffect(() => {
    async function loadCliente() {
      const res = await apiFetch("/api/v1/admin/clientes");
      if (!res || !res.ok) return;

      const lista = await res.json();
      const encontrado = lista.find((c: any) => c.usuario.id === usuarioId);

      setCliente(encontrado);
      if (encontrado) setVeterinarioActual(encontrado.veterinario);
    }

    loadCliente();
  }, [usuarioId]);

  // Cargar veterinarios filtrados
  useEffect(() => {
    async function loadVets() {
      const res = await apiFetch("/api/v1/admin/veterinarios");
      if (!res || !res.ok) return;

      const lista = await res.json();
      const filtrados = lista.filter((v: any) =>
        v.usuario.nombre.toLowerCase().includes(searchVet.toLowerCase()) ||
        v.usuario.email.toLowerCase().includes(searchVet.toLowerCase())
      );

      setVeterinarios(filtrados);
    }

    if (searchVet.length > 1) {
      loadVets();
    } else {
      setVeterinarios([]);
    }
  }, [searchVet]);

  async function handleGuardar() {
    if (!cliente || !nuevoVetId) {
      setError("Seleccioná un veterinario.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: implementar PATCH real en el backend
      console.log("TODO PATCH → cliente_id:", cliente.cliente_id, "nuevo veterinario:", nuevoVetId);
      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el veterinario.");
    } finally {
      setLoading(false);
    }
  }

  if (!cliente) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <p>Cargando datos del cliente…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* FORMULARIO IGUAL AL USERFORM */}
        <div className={styles.wrapper}>
          <form className={styles.form}>

            <h2 className={styles.title}>Asignar Veterinario</h2>
            <p className={styles.subtitle}>Modificá el veterinario asignado a este cliente.</p>

            {/* Datos del cliente */}
            <div className={styles.group}>
              <p><strong>Cliente:</strong> {cliente.usuario.nombre}</p>
              <p><strong>Email:</strong> {cliente.usuario.email}</p>
              <p><strong>Razón social:</strong> {cliente.razon_social}</p>

              {veterinarioActual && (
                <p>
                  <strong>Veterinario actual:</strong>{" "}
                  {veterinarioActual.usuario.nombre} ({veterinarioActual.usuario.email})
                </p>
              )}
            </div>

            {/* Buscador */}
            {mostrarBuscador && (
              <div className={styles.group}>
                <label className={styles.label}>Buscar veterinario</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Buscar veterinario…"
                  value={searchVet}
                  onChange={(e) => setSearchVet(e.target.value)}
                />
              </div>
            )}

            {/* Lista de veterinarios */}
            {veterinarios.length > 0 && (
              <div className={styles.vetList}>
                {veterinarios.map((v) => (
                  <div
                    key={v.veterinario_id}
                    className={styles.vetItem}
                    onClick={() => {
                      setNuevoVetId(v.veterinario_id);
                      setVeterinarioSeleccionado(v);
                      setSearchVet("");
                      setVeterinarios([]);
                      setMostrarBuscador(false);
                    }}
                  >
                    <strong>{v.usuario.nombre}</strong> — {v.usuario.email}
                    <br />
                    <small>Especialidad: {v.especialidad}</small>
                  </div>
                ))}
              </div>
            )}

            {/* Veterinario seleccionado */}
            {veterinarioSeleccionado && (
              <div className={styles.vetItemSelected}>
                <strong>{veterinarioSeleccionado.usuario.nombre}</strong> — {veterinarioSeleccionado.usuario.email}
                <br />
                <small>Especialidad: {veterinarioSeleccionado.especialidad}</small>
              </div>
            )}

            {error && <p className={styles.error}>{error}</p>}

            {/* Botones */}
            <div className={styles.actions}>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancelar
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={handleGuardar}
                disabled={loading}
              >
                {loading ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
