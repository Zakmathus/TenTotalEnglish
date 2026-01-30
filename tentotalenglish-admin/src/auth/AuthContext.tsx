import React, { createContext, useContext, useMemo, useState } from "react";
import { http } from "../api/http";

type AuthState = {
  token: string | null;
};

type AuthContextValue = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("access_token")
  );

  const login = async (username: string, password: string) => {
    const res = await http.post("/api/auth/login", { username, password });
    const accessToken = res.data.accessToken as string;

    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
  };

  const value = useMemo(() => ({ token, login, logout }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
