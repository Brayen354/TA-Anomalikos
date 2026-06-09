"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, clearToken, getToken, setToken } from "@/lib/api";
import type { LoginData, Pengguna } from "@/types";

interface AuthContextValue {
  user: Pengguna | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: Pengguna | null) => void;
}

export interface RegisterPayload {
  nama: string;
  email: string;
  password: string;
  no_telp?: string;
  jenis_kelamin?: "L" | "P";
}

const AuthContext = createContext<AuthContextValue | null>(null);

function extractToken(data?: LoginData): string | null {
  if (!data) return null;
  const t = data.token;
  if (!t) return null;
  return t.access_token ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Pengguna | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const res = await api.get<Pengguna | { user: Pengguna }>("/me");
      const data = res.data as Pengguna & { user?: Pengguna };
      setUser(data?.user ?? (data as Pengguna) ?? null);
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await api.post<LoginData>("/login", { email, password }, false);
      const token = extractToken(res.data);
      if (!token) throw new Error("Token tidak diterima dari server.");
      setToken(token);
      const u = res.data?.user;
      if (u) setUser(u);
      else await refreshUser();
    },
    [refreshUser]
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await api.post<LoginData>("/register", payload, false);
      const token = extractToken(res.data);
      if (token) {
        setToken(token);
        const u = res.data?.user;
        if (u) setUser(u);
        else await refreshUser();
      }
    },
    [refreshUser]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/logout");
    } catch {
      // sesi lokal tetap dibersihkan
    } finally {
      clearToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
}
