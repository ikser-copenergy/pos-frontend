import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { loginRequest, registerRequest, meRequest } from "./authApi";
import type { RegisterInput } from "./authApi";
import type { AuthUser } from "./types";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "pos_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    meRequest(token)
      .then((u) => {
        setUser(u);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (data: RegisterInput) => {
    const res = await registerRequest(data);
    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return;
    const u = await meRequest(t);
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
