export interface UsuarioResumen {
  id: number;
  nombre: string;
  email: string;
  rol?: string;
  role?: string;
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
