export interface Establecimiento {
  id: number;
  nombre: string;
  ubicacion?: string;     // opcional porque puede venir null
  cliente_id: number;
}
