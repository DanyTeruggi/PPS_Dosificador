export interface Bebedero {
  id: number;
  nombre: string;
  establecimiento?: {
    id: number;
    nombre: string;
  };
  largoBebedero: number;
  anchoBebedero: number;
  profundidadBebedero: number;
  coberturaMinima: number;
  tiempoDosis: number;
  capacidadTolva: number;
  estado: boolean;
  establecimiento_id: number; 
}
