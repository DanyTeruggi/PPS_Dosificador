import { useState, useEffect } from "react";
import styles from "./NuevoEstablecimientoForm.module.css";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";

interface Props {
  onClose: () => void;
}

export default function NuevoEstablecimientoForm({ onClose }: Props) {
  const { apiFetch } = useApi();

  // Estado principal del formulario
  const [form, setForm] = useState({
    nombre: "",
    ubicacion: "",
    cliente_id: "",
  });

  // Estados de carga y error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autocomplete: inicializado correctamente para evitar errores TS
  const [search, setSearch] = useState("");
  const [clientes, setClientes] = useState<any[]>([]); // ← FIX
  const [showDropdown, setShowDropdown] = useState(false);

  // Actualiza un campo del formulario
  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Busca clientes cuando el usuario escribe
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const res = await apiFetch("/api/v1/admin/clientes");

        if (!res) return; // ← FIX para TypeScript

        const data = await res.json();

        const filtrados = data.filter((c: any) =>
          c.razon_social.toLowerCase().includes(search.toLowerCase()) ||
          c.usuario.email.toLowerCase().includes(search.toLowerCase())
        );

        setClientes(filtrados);
        setShowDropdown(true);
      } catch (err) {
        console.error("Error buscando clientes", err);
      }
    };

    if (search.length > 1) {
      fetchClientes();
    } else {
      setClientes([]);
      setShowDropdown(false);
    }
  }, [search]);

  // Envía el formulario al backend
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiFetch(`/api/v1/admin/establecimientos`, {
        method: "POST",
        body: JSON.stringify({
          nombre: form.nombre,
          ubicacion: form.ubicacion,
          cliente_id: Number(form.cliente_id),
        }),
      });

      if (!res || !res.ok) { // ← FIX para TypeScript
        throw new Error("No se pudo crear el establecimiento");
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError("No se pudo crear el establecimiento. Revisá los datos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Nuevo Establecimiento</h2>
        <p className={styles.subtitle}>
          Completá los datos para registrar un nuevo establecimiento.
        </p>

        {/* Nombre */}
        <div className={styles.group}>
          <label className={styles.label}>Nombre</label>
          <input
            type="text"
            className={styles.input}
            required
            value={form.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
            placeholder="Ej: Campo La Esperanza"
          />
        </div>

        {/* Ubicación */}
        <div className={styles.group}>
          <label className={styles.label}>Ubicación</label>
          <input
            type="text"
            className={styles.input}
            value={form.ubicacion}
            onChange={(e) => updateField("ubicacion", e.target.value)}
            placeholder="Ej: Ruta 226 km 145"
          />
        </div>

        {/* Buscador de Cliente */}
        <div className={styles.group}>
          <label className={styles.label}>Cliente</label>

          <input
            type="text"
            className={styles.input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por razón social o email"
          />

          {showDropdown && clientes.length > 0 && (
            <div className={styles.dropdown}>
              {clientes.map((c) => (
                <div
                  key={c.cliente_id}
                  className={styles.dropdownItem}
                  onClick={() => {
                    updateField("cliente_id", String(c.cliente_id));
                    setSearch(`${c.razon_social} (${c.usuario.email})`);
                    setShowDropdown(false);
                  }}
                >
                  {c.razon_social} — {c.usuario.email}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label={loading ? "Guardando..." : "Guardar"} type="submit" />
        </div>
      </form>
    </div>
  );
}
