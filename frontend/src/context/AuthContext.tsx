
import { createContext, useContext, useState} from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => false,
  logout: () => {},
  setToken: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState<any>(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  // Guardar token en estado + localStorage
  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) localStorage.setItem("token", newToken);
    else localStorage.removeItem("token");
  };

  // LOGIN REAL
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) return false;

      const data = await res.json();
      const token = data.token;

      // Guardar token
      setToken(token);

      // Decodificar usuario
      const decoded: any = jwtDecode(token);
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

export function useAuth() {
  return useContext(AuthContext);
}
