import { useEffect, useState } from "react";

import type { BebederoDetalle, EstablecimientoDetalle } from "../types/landingTypes";
import { useApi } from "../utils/apiFetch";

/**
 * Carga un establecimiento y luego obtiene el detalle de sus bebederos.
 * La pagina que lo use solo debe ocuparse de mostrar el resultado.
 */
export default function useEstablecimientoBebederos(id?: string) {
  const { apiFetch } = useApi();

  const [establecimientoNombre, setEstablecimientoNombre] = useState<string | null>(null);
  const [bebederos, setBebederos] = useState<BebederoDetalle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) {
        setError("No se indico un establecimiento.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch(`/api/v1/establecimientos/${id}`);

        if (!response) {
          setError("Sesion expirada. Volve a iniciar sesion.");
          return;
        }

        if (!response.ok) {
          throw new Error("No se pudo obtener el establecimiento");
        }

        const establecimiento: EstablecimientoDetalle = await response.json();
        setEstablecimientoNombre(establecimiento.nombre);

        // La respuesta anterior trae un resumen; aqui pedimos cada detalle.
        const detalles = await Promise.all(
          establecimiento.bebederos.map(async (bebedero) => {
            const detalleResponse = await apiFetch(`/api/v1/bebederos/${bebedero.id}`);

            if (!detalleResponse || !detalleResponse.ok) {
              throw new Error(`No se pudo obtener el bebedero ${bebedero.id}`);
            }

            return detalleResponse.json() as Promise<BebederoDetalle>;
          }),
        );

        setBebederos(detalles);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Error al cargar el establecimiento.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [apiFetch, id]);

  return {
    establecimientoNombre,
    bebederos,
    loading,
    error,
  };
}

