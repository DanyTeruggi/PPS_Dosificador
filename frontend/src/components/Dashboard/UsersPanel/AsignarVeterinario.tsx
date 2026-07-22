import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./../Styles/EditarFormStyles.module.css";
import Button from "../../Button/Button";
import { useApi } from "../../../utils/apiFetch";
import toast from "react-hot-toast";
import {
  getClienteVeterinarioId,
  getVeterinarioId,
  reasignarCliente,
} from "./assignmentUtils";
import type { ClienteAdmin, VeterinarioOption } from "../../../types/ClientAssignment";

interface Props {
  usuarioId: number;
  onClose: () => void;
}

interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

export default function AsignarVeterinario({ usuarioId, onClose }: Props) {
  const { apiFetch } = useApi();

  const [cliente, setCliente] = useState<ClienteAdmin | null>(null);
  const [veterinarioActual, setVeterinarioActual] = useState<VeterinarioOption | null>(null);
  const [veterinarios, setVeterinarios] = useState<VeterinarioOption[]>([]);
  const [searchVet, setSearchVet] = useState("");
  const [nuevoVetId, setNuevoVetId] = useState<number | null>(null);
  const [veterinarioSeleccionado, setVeterinarioSeleccionado] = useState<VeterinarioOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCliente() {
      const [clientesRes, veterinariosRes] = await Promise.all([
        apiFetch("/api/v1/admin/clientes"),
        apiFetch("/api/v1/admin/veterinarios"),
      ]);
      if (!clientesRes?.ok || !veterinariosRes?.ok) return;

      const lista = (await clientesRes.json()) as ClienteAdmin[];
      const listaVeterinarios = (await veterinariosRes.json()) as VeterinarioOption[];
      const encontrado = lista.find((item) => item.usuario.id === usuarioId) ?? null;
      const veterinarioId = encontrado ? getClienteVeterinarioId(encontrado) : null;
      const veterinarioAnidado = typeof encontrado?.veterinario === "object"
        ? encontrado.veterinario
        : null;
      const actual = veterinarioAnidado ??
        listaVeterinarios.find((item) => getVeterinarioId(item) === veterinarioId) ??
        null;

      setCliente(encontrado);
      setVeterinarioActual(actual);
      setVeterinarios(listaVeterinarios);
    }

    void loadCliente();
  }, [apiFetch, usuarioId]);

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

  useEffect(() => {
    if (searchVet.trim().length < 2 || veterinarioSeleccionado) return;

    let active = true;
    async function loadVets() {
      const res = await apiFetch("/api/v1/admin/veterinarios");
      if (!res || !res.ok) return;

      const lista = (await res.json()) as VeterinarioOption[];
      const normalizedSearch = searchVet.trim().toLowerCase();
      const filtrados = lista
        .filter((veterinario) =>
          veterinario.usuario.nombre.toLowerCase().includes(normalizedSearch) ||
          veterinario.usuario.email.toLowerCase().includes(normalizedSearch)
        )
        .slice(0, 10);

      if (active) {
        setVeterinarios(filtrados);
        updateDropdownPosition();
        setShowDropdown(true);
      }
    }

    const timeoutId = window.setTimeout(() => {
      void loadVets();
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [apiFetch, searchVet, veterinarioSeleccionado, updateDropdownPosition]);

  useEffect(() => {
    if (!showDropdown) return;

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [showDropdown, updateDropdownPosition]);

  function selectVeterinario(veterinario: VeterinarioOption) {
    setNuevoVetId(getVeterinarioId(veterinario));
    setVeterinarioSeleccionado(veterinario);
    setSearchVet(veterinario.usuario.nombre);
    setShowDropdown(false);
    setError(null);
  }

  function changeVeterinario() {
    setNuevoVetId(null);
    setVeterinarioSeleccionado(null);
    setSearchVet("");
    setVeterinarios([]);
  }

  async function handleGuardar() {
    if (!cliente || !nuevoVetId) {
      setError("Seleccioná un veterinario.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await reasignarCliente(apiFetch, cliente.cliente_id, nuevoVetId);
      toast.success("Veterinario asignado correctamente.");
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "No se pudo actualizar el veterinario.");
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

        <p>
          <strong>Veterinario:</strong>{" "}
          {veterinarioActual
            ? `${veterinarioActual.usuario.nombre} (${veterinarioActual.usuario.email})`
            : "Sin veterinario asignado"}
        </p>
      </div>

      {!veterinarioSeleccionado && (
        <div className={styles.group}>
          <label className={styles.label}>Buscar veterinario</label>
          <input
            ref={searchInputRef}
            type="text"
            className={styles.input}
            placeholder="Buscar por nombre o email"
            value={searchVet}
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="veterinarios-autocomplete"
            onChange={(event) => {
              setSearchVet(event.target.value);
              if (event.target.value.trim().length < 2) {
                setShowDropdown(false);
                setVeterinarios([]);
              }
            }}
            onFocus={() => {
              if (veterinarios.length > 0) {
                updateDropdownPosition();
                setShowDropdown(true);
              }}}
            onBlur={() => {
              window.setTimeout(() => setShowDropdown(false), 100);
            }}
          />
        </div>
      )}

      {veterinarioSeleccionado && (
        <div className={styles.group}>
          <div className={styles.selectedClient}>
            <div className={styles.selectedClientHeader}>
              <strong>{veterinarioSeleccionado.usuario.nombre}</strong>
              <button type="button" onClick={changeVeterinario}>Cambiar</button>
            </div>
            <span>{veterinarioSeleccionado.usuario.email}</span>
            <span>Especialidad: {veterinarioSeleccionado.especialidad || "Sin especificar"}</span>
          </div>
        </div>
      )}

      {showDropdown && dropdownPosition && createPortal(
        <div
          id="veterinarios-autocomplete"
          className={styles.dropdownPortal}
          role="listbox"
          style={dropdownPosition}
          onMouseDown={(event) => event.preventDefault()}
        >
          {veterinarios.length > 0 ? veterinarios.map((veterinario) => (
            <button
              key={getVeterinarioId(veterinario)}
              type="button"
              role="option"
              aria-selected="false"
              className={styles.dropdownItem}
              onClick={() => selectVeterinario(veterinario)}
            >
              <strong>{veterinario.usuario.nombre}</strong>
              <span>{veterinario.usuario.email}</span>
              <span>Especialidad: {veterinario.especialidad || "Sin especificar"}</span>
            </button>
          )) : (
            <p className={styles.dropdownEmpty}>No se encontraron veterinarios.</p>
          )}
        </div>,
        document.body,
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
