export interface User {
  id: number;
  nombre: string;
  apellido: string;
  userName: string;
  email: string;
  password: string;
  telefono: string;
  razonSocial?: string;
  cuit: string;
  establecimientos: string;
  activo: boolean;
  rol: string;
  
}
