export type AdminUserRole = "admin" | "veterinario" | "cliente";

export interface VeterinarioAdminProfile {
  veterinario_id: number;
  especialidad?: string | null;
  telefono?: string | null;
  ubicacion?: string | null;
}

export interface ClienteAdminProfile {
  cliente_id: number;
  razon_social: string;
  telefono?: string | null;
  contacto_principal?: string | null;
  veterinario_id?: number | null;
}

export interface AdminUserResponse {
  id: number;
  email: string;
  nombre: string;
  telefono?: string | null;
  clave_fiscal?: string | null;
  rol: AdminUserRole;
  activo: boolean;
  veterinario?: VeterinarioAdminProfile | null;
  cliente?: ClienteAdminProfile | null;
}

export interface AdminUserRow extends AdminUserResponse {
  telefono: string;
}
