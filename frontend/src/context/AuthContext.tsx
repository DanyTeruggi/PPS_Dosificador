
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, isAuthUser } from "./authContextDefinition";
import type { AuthUser } from "./authContextDefinition";

interface LoginResponse {
  access_token: string;
}

function readStoredUser(): AuthUser | null {
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;

  try {
    const parsed: unknown = JSON.parse(storedUser);
    if (isAuthUser(parsed)) return parsed;
  } catch {
    // El dato persistido no contiene JSON válido.
  }

  localStorage.removeItem("user");
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  // Guardar token en estado + localStorage
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) localStorage.setItem("token", newToken);
    else localStorage.removeItem("token");
  };

  // LOGIN REAL
  const API = import.meta.env.VITE_API_BASE_URL;
  const PREFIX = import.meta.env.VITE_API_PREFIX;
   const login = async (email: string, password: string): Promise<boolean> => {
    try {
      
      const res = await fetch(`${API}${PREFIX}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

    
      if (!res.ok) return false;

      const data = (await res.json()) as LoginResponse;
      const token = data.access_token;

      // Guardar token
      setToken(token);

      // Decodificar usuario
      const decoded = jwtDecode<AuthUser>(token);
      if (!isAuthUser(decoded)) {
        throw new Error("El token no contiene un rol válido.");
      }
      setUser(decoded);
      localStorage.setItem("user", JSON.stringify(decoded));

      return true;

    } catch (err) {
      console.error("Error en login:", err);
      return false;
    }
  };

  // LOGOUT
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}
