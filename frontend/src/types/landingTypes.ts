/** Resumen de un bebedero incluido en la respuesta del establecimiento. */
export type BebederoResumen = {
  id: number;
  nombre: string;
};

/** Datos del establecimiento que necesitamos en las Landing. */
export type EstablecimientoDetalle = {
  nombre: string;
  bebederos: BebederoResumen[];
};

/** Una medicion guardada dentro del historial de un bebedero. */
export type ImagenDetalle = {
  id?: number;
  image_url?: string | null;
  nombre_archivo?: string;
  fecha_captura?: string;
};

export type MonitoreoDetalle = {
  fecha?: string;
  timestamp?: string;
  cobertura_capsulas_porciento?: number | null;
  coberturaCapsulasPorciento?: number | null;
  imagenes: ImagenDetalle[];
};

/** Datos completos utilizados por las Landing de bebederos y resumen. */
export type BebederoDetalle = {
  id: number;
  nombre: string;
  ubicacion?: string | null;
  cobertura_objetivo: number;
  ultima_medicion?: string | null;
  monitoreos: MonitoreoDetalle[];
};
