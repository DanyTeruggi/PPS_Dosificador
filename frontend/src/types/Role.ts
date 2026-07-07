export type Rol = "Productor" | "Veterinario" | "Admin";

export interface Bebedero {
  idBebedero: number;
  numeroBebedero: string;
  ubicacion: string;
  fechaMedicion?: string;
  horaMedicion?: string;
  cobertura?: string;
  coberturaMinima?: number | string;
  cobertura_objetivo?: number | string;
  cobertura_capsulas_porciento?: number | string;
  ultima_medicion?: string;
  timestamp?: string;
  imagen: string;
}

export interface Establecimiento {
  id: number;
  nombre: string;
  bebederos: Bebedero[];
}

export interface ProductorItem {
  nombre: string;
  establecimientos: Establecimiento[];
}

export interface ClienteItem {
  cliente: string;
  productores: ProductorItem[];
}

export interface RoleData {
  titulo: string;
  items: (Establecimiento | ClienteItem)[];
}
