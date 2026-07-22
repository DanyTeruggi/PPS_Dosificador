import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import styles from "./../Styles/EditarFormStyles.module.css";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";
import toast from "react-hot-toast";
import type { AdminUserResponse } from "../../../types/AdminUser";

interface Props {
  onClose: () => void;
  onCreated?: () => void;
}

interface ClienteOption {
  cliente_id: number;
  razon_social: string;
  usuario: {
    email: string;
  };
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
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

  // Autocomplete de clientes
  const [search, setSearch] = useState("");
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Actualiza un campo del formulario
  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const updateDropdownPosition = useCallback(() => {
    const input = searchInputRef.current;
    if (!input) return;

    const rect = input.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  // Busca clientes con una pequeña espera para no consultar en cada tecla.
  useEffect(() => {
    if (search.trim().length < 2 || selectedCliente) return;

    let active = true;
    const fetchClientes = async () => {
      try {
        const res = await apiFetch("/api/v1/admin/usuarios");

        if (!res?.ok) return;

        const usuarios = (await res.json()) as AdminUserResponse[];
        const normalizedSearch = search.trim().toLowerCase();

        const filtrados = usuarios
          .filter(
            (usuario) =>
              usuario.rol === "cliente" &&
              usuario.cliente != null
          )
          .map<ClienteOption>((usuario) => ({
            cliente_id: usuario.cliente!.cliente_id,
            razon_social: usuario.cliente!.razon_social,
            usuario: {
              email: usuario.email,
            },
          }))
          .filter((cliente) =>
            cliente.razon_social.toLowerCase().includes(normalizedSearch) ||
            cliente.usuario.email.toLowerCase().includes(normalizedSearch)
          )
          .slice(0, 10);

        if (active) {
          setClientes(filtrados);
          updateDropdownPosition();
          setShowDropdown(true);
        }
      } catch (err) {
        console.error("Error buscando clientes", err);
      }
    };

    const timeoutId = window.setTimeout(() => {
      void fetchClientes();
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [apiFetch, search, selectedCliente, updateDropdownPosition]);

  useEffect(() => {
    if (!showDropdown) return;

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [showDropdown, updateDropdownPosition]);

  function selectCliente(cliente: ClienteOption) {
    updateField("cliente_id", String(cliente.cliente_id));
    setSelectedCliente(cliente);
    setSearch(cliente.razon_social);
    setShowDropdown(false);
  }

  // Envía el formulario al backend
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.cliente_id) {
      const message = "Seleccioná un cliente de la lista.";
      setError(message);
      toast.error(message);
      return;
    }

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

      // Si no hay respuesta (CORS, red, etc.)
      if (!res) {
        toast.error("Error: no se recibió respuesta del servidor.");
        throw new Error("No se recibió respuesta del servidor.");
      }

      // Si el backend devuelve error
      if (!res.ok) {
        toast.error("No se pudo crear el establecimiento.");
        throw new Error("No se pudo crear el establecimiento.");
      }

      // ⭐ Caso de éxito
      const created = await res.json();
      toast.success(`Establecimiento "${created.nombre}" creado con éxito.`);

      onClose();

    } catch (err) {
      console.error(err);
      setError("No se pudo crear el establecimiento. Revisá los datos.");
      // El toast ya se mostró arriba
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
            ref={searchInputRef}
            type="text"
            className={styles.input}
            value={search}
            required
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="clientes-autocomplete"
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedCliente(null);
              updateField("cliente_id", "");
              if (e.target.value.trim().length < 2) {
                setShowDropdown(false);
                setClientes([]);
              }
            }}
            onFocus={() => {
              if (!selectedCliente && clientes.length > 0) {
                updateDropdownPosition();
                setShowDropdown(true);
              }
            }}
            onBlur={() => {
              window.setTimeout(() => setShowDropdown(false), 100);
            }}
            placeholder="Buscar por razón social o email"
          />

          {selectedCliente && (
            <div className={styles.selectedClient}>
              <strong>{selectedCliente.razon_social}</strong>
              <span>{selectedCliente.usuario.email}</span>
            </div>
          )}
        </div>

        {showDropdown && dropdownPosition && createPortal(
          <div
            id="clientes-autocomplete"
            className={styles.dropdownPortal}
            role="listbox"
            style={dropdownPosition}
            onMouseDown={(event) => event.preventDefault()}
          >
            {clientes.length > 0 ? clientes.map((cliente) => (
              <button
                key={cliente.cliente_id}
                type="button"
                role="option"
                aria-selected="false"
                className={styles.dropdownItem}
                onClick={() => selectCliente(cliente)}
              >
                <strong>{cliente.razon_social}</strong>
                <span>{cliente.usuario.email}</span>
              </button>
            )) : (
              <p className={styles.dropdownEmpty}>No se encontraron clientes.</p>
            )}
          </div>,
          document.body,
        )}

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button label="Cancelar" variant="secondary" onClick={onClose} />
          <Button label={loading ? "Guardando..." : "Guardar"} type="submit" />
        </div>
      </form>
    </div>
  );
}
