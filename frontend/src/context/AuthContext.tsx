// Auth Context — JWT token management

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/services/api";

interface User {
  username:  string;
  full_name: string;
  email:     string;
  role:      string;
}

interface AuthContextType {
  user:    User | null;
  token:   string | null;
  login:   (username: string, password: string) => Promise<void>;
  logout:  () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [token,   setToken]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("sentinel_token");
    const storedUser  = localStorage.getItem("sentinel_user");
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      } catch {
        localStorage.removeItem("sentinel_token");
        localStorage.removeItem("sentinel_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);

    const { data } = await api.post<{ access_token: string; token_type: string; user: User }>(
      "/auth/login",
      params,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, user: userData } = data;
    localStorage.setItem("sentinel_token", access_token);
    localStorage.setItem("sentinel_user",  JSON.stringify(userData));
    api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    setToken(access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("sentinel_token");
    localStorage.removeItem("sentinel_user");
    delete api.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
