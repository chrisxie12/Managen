import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "../services/api";

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  roleId: string;
  permissions: string[];
}

export interface School {
  name: string;
  slug: string;
  subdomain: string;
  plan: string;
  modules: string[];
}

interface AuthState {
  user: User | null;
  school: School | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  school: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<{ user: Record<string, any>; school: Record<string, any> }>("/api/auth/me");
      if (res.data) {
        setUser({
          id: res.data.user.id,
          fullName: res.data.user.full_name || res.data.user.fullName,
          email: res.data.user.email,
          role: res.data.user.role,
          roleId: res.data.user.role_id || res.data.user.roleId,
          permissions: res.data.user.permissions || [],
        });
        setSchool({
          name: res.data.school.name,
          slug: res.data.school.slug,
          subdomain: res.data.school.subdomain || res.data.school.slug,
          plan: res.data.school.plan,
          modules: res.data.school.modules || [],
        });
      }
    } catch {
      setUser(null);
      setSchool(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout", {});
    setUser(null);
    setSchool(null);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, school, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
