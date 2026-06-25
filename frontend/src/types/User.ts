export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  razonSocial?: string;
  cuit: string;
  userName: string;
  establecimientos: string;
  activo: boolean;
  password: string;
  rol: string;
  stockBacterias: number;
}
