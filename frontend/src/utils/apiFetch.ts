import { useAuth } from "../context/AuthContext";

/**
 * Hook que devuelve una función apiFetch()
 * 
 * Objetivo:
 * - Adjuntar automáticamente el token JWT en cada request
 * - Detectar expiración del token (401 Unauthorized)
 * - Hacer logout automático si el token expiró
 * - Redirigir al login con un mensaje opcional
 * 
 * Esto evita repetir lógica en cada fetch del proyecto.
 */
export function useApi() {
  const { token, logout } = useAuth();

  /**
   * apiFetch: reemplazo de fetch() con manejo de autenticación
   * 
   * @param url - endpoint del backend
   * @param options - configuración opcional del fetch
   */
  const apiFetch = async (url: string, options: RequestInit = {}) => {
    // 1) Armamos headers con el token JWT
    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    };

    // 2) Ejecutamos el fetch real
    const response = await fetch(url, {
      ...options,
      headers
    });

    // 3) Si el backend devuelve 401 → token expirado o inválido
    if (response.status === 401) {
      console.warn("Token expirado o inválido. Cerrando sesión...");

      logout(); // limpia token + user + localStorage

      // Redirigimos al login con un mensaje opcional
      window.location.href = "/login?expired=true";

      // Importante: detenemos la ejecución
      return;
    }

    // 4) Si no es 401, devolvemos la respuesta normal
    return response;
  };

  return { apiFetch };
}
