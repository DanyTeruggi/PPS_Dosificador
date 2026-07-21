import { useCallback } from "react";
import { useAuth } from "../context/useAuth";

export type ApiFetchOptions = RequestInit & {
  skipAuth?: boolean;
  skipUnauthorizedLogout?: boolean;
};

export function useApi() {
  const { token, logout } = useAuth();

  // Variables del .env
  const API_BASE = import.meta.env.VITE_API_BASE_URL;   // http://localhost:8000
  const API_PREFIX = import.meta.env.VITE_API_PREFIX;   // /api/v1

  const apiFetch = useCallback(async (path: string, options: ApiFetchOptions = {}) => {
    // Construimos la URL final del backend
    const normalizedBase = API_BASE?.replace(/\/$/, "") ?? "";
    const normalizedPrefix = API_PREFIX?.replace(/^\//, "").replace(/\/$/, "") ?? "";
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

    const alreadyHasPrefix = normalizedPath.startsWith(`${normalizedPrefix}/`) || normalizedPath === normalizedPrefix;
    const url = alreadyHasPrefix
      ? `${normalizedBase}/${normalizedPath}`
      : `${normalizedBase}/${normalizedPrefix}/${normalizedPath}`;

    const { skipAuth = false, skipUnauthorizedLogout = false, ...requestOptions } = options;
    const headers = new Headers(requestOptions.headers);

    if (token && !skipAuth) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, {
      ...requestOptions,
      headers
    });

    if (response.status === 401 && token && !skipUnauthorizedLogout) {
      console.warn("Token expirado o inválido. Cerrando sesión...");
      logout();
      window.location.href = "/";
      return;
    }

    return response;
  }, [API_BASE, API_PREFIX, token, logout]);

  return { apiFetch };
}
