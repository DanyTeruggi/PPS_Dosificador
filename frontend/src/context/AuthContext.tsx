
import { useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, isAuthUser } from "./authContextDefinition";
import type { AuthUser } from "./authContextDefinition";
import { getApiErrorDetails } from "../utils/apiError";

interface LoginResponse {
  access_token: string;
}

function normalizeAuthUser(value: unknown): AuthUser | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const role = data.role ?? data.rol;
  if (role !== "admin" && role !== "veterinario" && role !== "cliente") return null;
  return { ...data, role, rol: role } as AuthUser;
}

function readStoredUser(): AuthUser | null {
  const storedUser = sessionStorage.getItem("user");
  if (!storedUser) return null;

  try {
    const parsed: unknown = JSON.parse(storedUser);
    const normalized = normalizeAuthUser(parsed);
    if (normalized && isAuthUser(normalized)) return normalized;
  } catch {
    // El dato persistido no contiene JSON valido.
  }

  sessionStorage.removeItem("user");
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    sessionStorage.getItem("token")
  );
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [isInitializing, setIsInitializing] = useState(
    () => Boolean(sessionStorage.getItem("token")),
  );

  const API = import.meta.env.VITE_API_BASE_URL;
  const PREFIX = import.meta.env.VITE_API_PREFIX;

  // La sesión se conserva al recargar, pero no al cerrar el navegador.
  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) sessionStorage.setItem("token", newToken);
    else sessionStorage.removeItem("token");
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem("user");
  }, [setToken]);

  useEffect(() => {
    // Elimina credenciales persistentes creadas por versiones anteriores.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (!token) {
      const timeoutId = window.setTimeout(() => setIsInitializing(false), 0);
      return () => window.clearTimeout(timeoutId);
    }

    const controller = new AbortController();
    let active = true;

    async function validateSession() {
      try {
        const response = await fetch(`${API}${PREFIX}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Sesión inválida: ${response.status}`);

        const validatedUser = normalizeAuthUser(await response.json());
        if (!validatedUser) throw new Error("La API devolvió un usuario inválido.");

        if (active) {
          setUser(validatedUser);
          sessionStorage.setItem("user", JSON.stringify(validatedUser));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (active) logout();
      } finally {
        if (active) setIsInitializing(false);
      }
    }

    void validateSession();
    return () => {
      active = false;
      controller.abort();
    };
  }, [API, PREFIX, logout, token]);

  // LOGIN REAL
  const login = async (email: string, password: string) => {
    try {

      const res = await fetch(`${API}${PREFIX}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });


      if (!res.ok) {
        const details = await getApiErrorDetails(res, "No se pudo iniciar sesión.");
        return { ok: false, ...details };
      }

      const data = (await res.json()) as LoginResponse;
      const token = data.access_token;

      // Guardar token
      setToken(token);

      // Decodificar usuario
      const decoded = normalizeAuthUser(jwtDecode<unknown>(token));
      if (!decoded || !isAuthUser(decoded)) {
        throw new Error("El token no contiene un rol válido.");
      }
      setUser(decoded);
      sessionStorage.setItem("user", JSON.stringify(decoded));

      return { ok: true };

    } catch (err) {
      console.error("Error en login:", err);
      return { ok: false, message: "Ocurrió un problema de comunicación." };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isInitializing, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
