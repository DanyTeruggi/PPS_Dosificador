import { getApiErrorMessage } from "../../../utils/apiError";

export interface UsuarioResumen {
  id: number;
  nombre: string;
  email: string;
}

export interface VeterinarioOption {
  id?: number;
  veterinario_id?: number;
  especialidad?: string | null;
  usuario: UsuarioResumen;
}

export interface ClienteAdmin {
  cliente_id: number;
  razon_social: string;
  usuario: UsuarioResumen;
  veterinario_id?: number | null;
  veterinario?: VeterinarioOption | number | null;
}

export function getClienteVeterinarioId(cliente: ClienteAdmin) {
  const id = cliente.veterinario_id ??
    (typeof cliente.veterinario === "number"
      ? cliente.veterinario
      : cliente.veterinario?.veterinario_id ?? cliente.veterinario?.id);
  return id == null ? null : Number(id);
}

export function getVeterinarioId(veterinario: VeterinarioOption) {
  return Number(veterinario.veterinario_id ?? veterinario.id);
}

type ApiFetch = (path: string, options?: RequestInit) => Promise<Response | undefined>;

export async function reasignarCliente(
  apiFetch: ApiFetch,
  clienteId: number,
  veterinarioId: number,
) {
  const response = await apiFetch(`/api/v1/admin/clientes/${clienteId}/veterinario`, {
    method: "PATCH",
    body: JSON.stringify({ veterinario_id: veterinarioId }),
  });

  if (!response?.ok) {
    throw new Error(
      response
        ? await getApiErrorMessage(response, "No se pudo reasignar el cliente.")
        : "No se recibió respuesta del servidor.",
    );
  }
}
