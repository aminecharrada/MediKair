import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI } from "@/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  cabinet?: string;
  address?: string;
  role?: string;
  favorites?: any[];
  notificationPrefs?: {
    email: boolean;
    stock: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; cabinet?: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("client_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("client_token");
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore session on mount
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("client_token");
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.data);
            setToken(storedToken);
          } else {
            localStorage.removeItem("client_token");
            localStorage.removeItem("client_user");
            setUser(null);
            setToken(null);
          }
        } catch {
          localStorage.removeItem("client_token");
          localStorage.removeItem("client_user");
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      setUser(res.data.data);
      setToken(res.data.token);
      localStorage.setItem("client_token", res.data.token);
      localStorage.setItem("client_user", JSON.stringify(res.data.data));
    } else {
      throw new Error(res.data.message || "Login failed");
    }
  };

  const register = async (data: { name: string; email: string; password: string; cabinet?: string; phone?: string }) => {
    const res = await authAPI.register(data);
    if (res.data.success) {
      setUser(res.data.data);
      setToken(res.data.token);
      localStorage.setItem("client_token", res.data.token);
      localStorage.setItem("client_user", JSON.stringify(res.data.data));
    } else {
      throw new Error(res.data.message || "Registration failed");
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("client_token");
    localStorage.removeItem("client_user");
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await authAPI.updateProfile(data);
    if (res.data.success) {
      setUser(res.data.data);
      localStorage.setItem("client_user", JSON.stringify(res.data.data));
    }
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem("client_user", JSON.stringify(res.data.data));
      }
    } catch { /* ignore */ }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
