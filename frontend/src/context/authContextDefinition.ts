import { createContext } from "react";

export type UserRole = "admin" | "veterinario" | "cliente";

export interface AuthUser {
  sub?: string;
  id?: number;
  nombre?: string;
  email?: string;
  role: UserRole;
  rol?: UserRole;
  exp?: number;
  iat?: number;
  [claim: string]: unknown;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<{
    ok: boolean;
    message?: string;
    fieldErrors?: Record<string, string>;
  }>;
  logout: () => void;
  setToken: (token: string | null) => void;
}

export function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object" || !("role" in value)) return false;

  const role = value.role;
  return role === "admin" || role === "veterinario" || role === "cliente";
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
