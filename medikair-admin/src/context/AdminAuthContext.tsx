import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { adminAuthAPI } from "@/api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  privilege: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem("admin_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("admin_token");
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem("admin_token");
      if (storedToken) {
        try {
          const res = await adminAuthAPI.getMe();
          if (res.data.success) {
            setAdmin(res.data.data);
            setToken(res.data.token || storedToken);
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setAdmin(null);
    setToken(null);
  };

  const login = async (email: string, password: string) => {
    const res = await adminAuthAPI.login({ email, password });
    if (res.data.success) {
      setAdmin(res.data.data);
      setToken(res.data.token);
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_user", JSON.stringify(res.data.data));
    } else {
      throw new Error(res.data.message || "Login failed");
    }
  };

  const logout = async () => {
    try {
      await adminAuthAPI.logout();
    } catch {
      // ignore
    }
    clearAuth();
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
}
