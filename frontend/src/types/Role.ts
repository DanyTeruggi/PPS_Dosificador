export type Rol = "Productor" | "Veterinario" | "Admin";

export interface Bebedero {
  idBebedero: number;
  numeroBebedero: string;
  ubicacion: string;
  fechaMedicion: string;
  horaMedicion: string;
  cobertura: string;
  imagen: string;
}

export interface Establecimiento {
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
