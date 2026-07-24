import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";
import styles from "./../Styles/EditarFormStyles.module.css";
import type { BebederoCreateRequest } from "../../../types/ApiContracts";
import type { Establecimiento } from "../../../types/Establecimiento";
import type { AdminUserResponse } from "../../../types/AdminUser";
import { getApiErrorDetails } from "../../../utils/apiError";

interface ClienteOption {
  cliente_id: number;
  razon_social: string;
  usuario: { email: string };
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

interface Props {
  onClose: () => void;
  establecimientos: Establecimiento[];
}

export default function NuevoBebederoForm({ onClose, establecimientos }: Props) {
  const { apiFetch } = useApi();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [clienteSearch, setClienteSearch] = useState("");
  const [clientes, setClientes] = useState<ClienteOption[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<ClienteOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeOptionIndex, setActiveOptionIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    clienteId: "",
    establecimiento: "",
    nombre: "",
    ubicacion: "",
    ipAddress: "",
    puerto: "",
    largoBebedero: "",
    anchoBebedero: "",
    profundidadBebedero: "",
    coberturaMinima: "",
    tiempoDosis: "",
    capacidadTolva: "",
    estado: true,
  });

  const updateField = (field: string, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateDropdownPosition = useCallback(() => {
    const input = searchInputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    setDropdownPosition({ top: rect.bottom + 6, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (clienteSearch.trim().length < 2 || selectedCliente) return;

    let active = true;
    const fetchClientes = async () => {
      try {
        const response = await apiFetch("/api/v1/admin/usuarios");
        if (!response?.ok) return;

        const usuarios = (await response.json()) as AdminUserResponse[];
        const normalizedSearch = clienteSearch.trim().toLowerCase();
        const filteredClientes = usuarios
          .filter((usuario) => usuario.rol === "cliente" && usuario.cliente != null)
          .map<ClienteOption>((usuario) => ({
            cliente_id: usuario.cliente!.cliente_id,
            razon_social: usuario.cliente!.razon_social,
            usuario: { email: usuario.email },
          }))
          .filter(
            (cliente) =>
              cliente.razon_social.toLowerCase().includes(normalizedSearch) ||
              cliente.usuario.email.toLowerCase().includes(normalizedSearch),
          )
          .slice(0, 10);

        if (active) {
          setClientes(filteredClientes);
          setActiveOptionIndex(-1);
          updateDropdownPosition();
          setShowDropdown(true);
        }
      } catch (fetchError) {
        console.error("Error buscando clientes", fetchError);
      }
    };

    const timeoutId = window.setTimeout(() => void fetchClientes(), 250);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [apiFetch, clienteSearch, selectedCliente, updateDropdownPosition]);

  useEffect(() => {
    if (!showDropdown) return;
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [showDropdown, updateDropdownPosition]);

  const establecimientosCliente = establecimientos.filter(
    (establecimiento) => establecimiento.cliente_id === Number(form.clienteId),
  );

  function selectCliente(cliente: ClienteOption) {
    setSelectedCliente(cliente);
    setClienteSearch(cliente.razon_social);
    setForm((current) => ({
      ...current,
      clienteId: String(cliente.cliente_id),
      establecimiento: "",
    }));
    setShowDropdown(false);
    setActiveOptionIndex(-1);
  }

  function handleClienteKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setShowDropdown(false);
      setActiveOptionIndex(-1);
      return;
    }

    if (clientes.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setShowDropdown(true);
      setActiveOptionIndex((current) => (current + 1) % clientes.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setShowDropdown(true);
      setActiveOptionIndex((current) =>
        current <= 0 ? clientes.length - 1 : current - 1
      );
    } else if (event.key === "Enter" && showDropdown && activeOptionIndex >= 0) {
      event.preventDefault();
      selectCliente(clientes[activeOptionIndex]);
    }
  }

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setError(null);
    setFieldErrors({});

    if (!selectedCliente || !form.clienteId) {
      setError("Seleccioná un cliente de la lista.");
      return;
    }

    setLoading(true);

    try {
      const payload: BebederoCreateRequest = {
        establecimiento_id: Number(form.establecimiento),
        nombre: form.nombre,
        ubicacion: form.ubicacion.trim() || null,
        ip_address: form.ipAddress.trim() || null,
        puerto: form.puerto ? Number(form.puerto) : null,
        largo: Number(form.largoBebedero),
        ancho: Number(form.anchoBebedero),
        profundidad: form.profundidadBebedero
          ? Number(form.profundidadBebedero)
          : null,
        cobertura_objetivo: Number(form.coberturaMinima),
        tiempo_dosis: Number(form.tiempoDosis),
        capacidad_tolva: Number(form.capacidadTolva),
        estado: form.estado,
      };
      const response = await apiFetch("/api/v1/admin/bebederos", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response || !response.ok) {
        if (!response) throw new Error("No se recibió respuesta del servidor.");
        const details = await getApiErrorDetails(response, "No se pudo crear el dispositivo.");
        setFieldErrors(details.fieldErrors);
        throw new Error(details.message);
      }

      toast.success(`Bebedero "${form.nombre}" creado correctamente.`);
      onClose();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No se pudo crear el dispositivo.");
      console.error(submitError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Nuevo Dispositivo</h2>
        <p className={styles.subtitle}>
          Completá los datos para registrar un nuevo dispositivo.
        </p>

        <div className={styles.group}>
          <label className={styles.label}>Cliente</label>
          <input
            ref={searchInputRef}
            type="text"
            className={styles.input}
            value={clienteSearch}
            required
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="clientes-bebedero-autocomplete"
            aria-activedescendant={
              showDropdown && activeOptionIndex >= 0
                ? `bebedero-cliente-option-${clientes[activeOptionIndex].cliente_id}`
                : undefined
            }
            onKeyDown={handleClienteKeyDown}
            onChange={(event) => {
              setClienteSearch(event.target.value);
              setSelectedCliente(null);
              setForm((current) => ({ ...current, clienteId: "", establecimiento: "" }));
              if (event.target.value.trim().length < 2) {
                setShowDropdown(false);
                setClientes([]);
                setActiveOptionIndex(-1);
              }
            }}
            onFocus={() => {
              if (!selectedCliente && clientes.length > 0) {
                updateDropdownPosition();
                setShowDropdown(true);
              }
            }}
            onBlur={() => window.setTimeout(() => {
              setShowDropdown(false);
              setActiveOptionIndex(-1);
            }, 100)}
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
            id="clientes-bebedero-autocomplete"
            className={styles.dropdownPortal}
            role="listbox"
            style={dropdownPosition}
            onMouseDown={(event) => event.preventDefault()}
          >
            {clientes.length > 0 ? clientes.map((cliente, index) => (
              <button
                key={cliente.cliente_id}
                id={`bebedero-cliente-option-${cliente.cliente_id}`}
                type="button"
                role="option"
                aria-selected={index === activeOptionIndex}
                className={styles.dropdownItem}
                onMouseEnter={() => setActiveOptionIndex(index)}
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

        <div className={styles.group}>
          <label className={styles.label}>Establecimiento</label>
          <select
            className={styles.input}
            required
            disabled={!selectedCliente}
            value={form.establecimiento}
            onChange={(e) => updateField("establecimiento", e.target.value)}
          >
            <option value="">Seleccioná un establecimiento</option>
            {establecimientosCliente.map((establecimiento) => (
              <option key={establecimiento.id} value={establecimiento.id}>
                {establecimiento.nombre}
              </option>
            ))}
          </select>
        </div>
        
        {/* Nombre */}
        <div className={styles.group}>
          <label className={styles.label}>Nombre</label>
          <input
            className={styles.input}
            type="text"
            required
            value={form.nombre}
            onChange={(e) => updateField("nombre", e.target.value)}
          />
        </div>

        {/* Ubicación */}
        <div className={styles.group}>
          <label className={styles.label}>Ubicación</label>
          <input
            className={styles.input}
            type="text"
            value={form.ubicacion}
            onChange={(e) => updateField("ubicacion", e.target.value)}
            placeholder="Ej: Sector norte"
          />
        </div>

        {/* Dirección IP / Puerto */}
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Dirección IP</label>
            <input
              className={styles.input}
              type="text"
              maxLength={45}
              value={form.ipAddress}
              onChange={(e) => updateField("ipAddress", e.target.value)}
              placeholder="Ej: 192.168.1.10"
            />
          </div>
          <div className={styles.group}>
            <label className={styles.label}>Puerto</label>
            <input
              className={styles.input}
              type="number"
              min="1"
              max="65535"
              step="1"
              value={form.puerto}
              onChange={(e) => updateField("puerto", e.target.value)}
              placeholder="Ej: 8000"
            />
          </div>
        </div>

        {/* Largo / Ancho / Profundidad */}
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Largo (cm)</label>
            <input
              className={styles.input}
              type="number"
              min="0.000001"
              step="any"
              required
              value={form.largoBebedero}
              onChange={(e) => updateField("largoBebedero", e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Ancho (cm)</label>
            <input
              className={styles.input}
              type="number"
              min="0.000001"
              step="any"
              required
              value={form.anchoBebedero}
              onChange={(e) => updateField("anchoBebedero", e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Profundidad (cm)</label>
            <input
              className={styles.input}
              type="number"
              min="0.000001"
              step="any"
              value={form.profundidadBebedero}
              onChange={(e) => updateField("profundidadBebedero", e.target.value)}
            />
          </div>
        </div>

        {/* Cobertura / Tiempo / Tolva */}
        <div className={styles.row}>
          <div className={styles.group}>
            <label className={styles.label}>Cobertura mín (%)</label>
            <input
              className={styles.input}
              type="number"
              step="any"
              min="0"
              max="100"
              required
              value={form.coberturaMinima}
              onChange={(e) => updateField("coberturaMinima", e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Tiempo dosis (hs)</label>
            <input
              className={styles.input}
              type="number"
              min="0.000001"
              step="any"
              required
              value={form.tiempoDosis}
              onChange={(e) => updateField("tiempoDosis", e.target.value)}
            />
          </div>

          <div className={styles.group}>
            <label className={styles.label}>Capacidad tolva (kg)</label>
            <input
              className={styles.input}
              type="number"
              min="0.000001"
              step="any"
              required
              value={form.capacidadTolva}
              onChange={(e) => updateField("capacidadTolva", e.target.value)}
            />
          </div>
        </div>

        {/* Checkbox */}
        <div className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={form.estado}
            onChange={(e) => updateField("estado", e.target.checked)}
          />
          <span>Bebedero activo</span>
        </div>

        {Object.entries(fieldErrors).map(([field, message]) => (
          <p className={styles.error} key={field}><strong>{field}:</strong> {message}</p>
        ))}
        {error && Object.keys(fieldErrors).length === 0 && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button
            label="Cancelar"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          />
          <Button
            label={loading ? "Guardando..." : "Guardar"}
            type="submit"
            disabled={loading}
            ariaBusy={loading}
          />
        </div>
      </form>
    </div>
  );
}
