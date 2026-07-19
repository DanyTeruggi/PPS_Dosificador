import type { BebederoResponse } from "./ApiContracts";

export interface Bebedero extends BebederoResponse {
  establecimiento?: {
    id: number;
    nombre: string;
  };
  cobertura_objetivo: number;
  estado: boolean;
}
