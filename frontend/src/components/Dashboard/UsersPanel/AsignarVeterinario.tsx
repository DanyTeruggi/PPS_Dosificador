import { useEffect, useState } from "react";
import styles from "./../Style/EditarFormStyles.module.css";
import Button from "../../Button/Button";
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <form className={styles.form}>
        <h2 className={styles.title}>Asignar Veterinario</h2>
        <p className={styles.subtitle}>Cargando datos del cliente…</p>
      </form>
    );
  }

  return (
    <form className={styles.form}>
      <h2 className={styles.title}>Asignar Veterinario</h2>
      <p className={styles.subtitle}>Modificá el veterinario asignado a este cliente.</p>

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

      {veterinarios.length > 0 && (
        <div className={styles.group}>
          {veterinarios.map((v) => (
            <div
              key={v.veterinario_id}
              className={styles.input}
              style={{ cursor: "pointer", padding: "12px" }}
              onClick={() => {
                setNuevoVetId(v.veterinario_id);
                setVeterinarioSeleccionado(v);
                setSearchVet("");
                setVeterinarios([]);
              }}
            >
              <strong>{v.usuario.nombre}</strong> — {v.usuario.email}
              <br />
              <small>Especialidad: {v.especialidad}</small>
            </div>
          ))}
        </div>
      )}

      {veterinarioSeleccionado && (
        <div className={styles.group}>
          <div className={styles.input} style={{ padding: "12px" }}>
            <strong>{veterinarioSeleccionado.usuario.nombre}</strong> — {veterinarioSeleccionado.usuario.email}
            <br />
            <small>Especialidad: {veterinarioSeleccionado.especialidad}</small>
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <Button
          label="Cancelar"
          variant="secondary"
          type="button"
          onClick={onClose}
        />
        <Button
          label={loading ? "Guardando…" : "Guardar cambios"}
          variant="primary"
          type="button"
          onClick={handleGuardar}
        />
      </div>
    </form>
  );
}
