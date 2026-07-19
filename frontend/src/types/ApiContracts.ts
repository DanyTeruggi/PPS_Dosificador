export type SelfRegisterRole = "veterinario" | "cliente";
export type AdminCreatableRole = SelfRegisterRole | "admin";

interface UserCreateBase {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  clave_fiscal: string;
}

export interface VeterinarioCreateRequest extends UserCreateBase {
  especialidad?: string | null;
  ubicacion?: string | null;
}

export interface ClienteCreateRequest extends UserCreateBase {
  razon_social: string;
  veterinario_id: number;
}

export interface VeterinarioRegisterRequest
  extends VeterinarioCreateRequest {
  rol: "veterinario";
}

export interface ClienteRegisterRequest extends ClienteCreateRequest {
  rol: "cliente";
}

export type SelfRegisterRequest =
  | VeterinarioRegisterRequest
  | ClienteRegisterRequest;

export interface AdminCreateRequest {
  nombre: string;
  email: string;
  password: string;
}

export interface UsuarioPerfilUpdate {
  especialidad?: string | null;
  ubicacion?: string | null;
  razon_social?: string;
  contacto_principal?: string | null;
}

export interface UsuarioUpdateRequest {
  nombre?: string;
  email?: string;
  telefono?: string;
  clave_fiscal?: string;
  perfil?: UsuarioPerfilUpdate;
}

export interface BebederoCreateRequest {
  establecimiento_id: number;
  nombre: string;
  ubicacion?: string | null;
  ip_address?: string | null;
  puerto?: number;
  largo: number;
  ancho: number;
  profundidad?: number | null;
  tiempo_dosis: number;
  capacidad_tolva: number;
  cobertura_objetivo?: number;
  estado?: boolean;
}

export type BebederoUpdateRequest = Partial<{
  establecimiento_id: number | null;
  nombre: string | null;
  ubicacion: string | null;
  ip_address: string | null;
  puerto: number | null;
  cobertura_objetivo: number | null;
  largo: number | null;
  ancho: number | null;
  profundidad: number | null;
  tiempo_dosis: number | null;
  capacidad_tolva: number | null;
  estado: boolean | null;
}>;

export interface BebederoResponse {
  id: number;
  nombre: string;
  establecimiento_id: number;
  largo: number;
  ancho: number;
  profundidad: number | null;
  tiempo_dosis: number;
  capacidad_tolva: number;
  cobertura_objetivo: number;
  estado: boolean;
  ubicacion?: string | null;
  ip_address?: string | null;
  puerto: number;
  ultima_medicion?: string | null;
  fecha_creacion: string;
}
