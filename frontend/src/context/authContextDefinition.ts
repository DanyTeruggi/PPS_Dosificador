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
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setToken: (token: string | null) => void;
}

export function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object" || !("role" in value)) return false;

  const role = value.role;
  return role === "admin" || role === "veterinario" || role === "cliente";
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
