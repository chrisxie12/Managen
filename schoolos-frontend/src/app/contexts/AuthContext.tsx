import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/react";
import { api } from "../services/api";

const SUBDOMAIN_KEY = "managen_subdomain";

export function storeSubdomain(subdomain: string) {
  try { localStorage.setItem(SUBDOMAIN_KEY, subdomain); } catch {}
}

function getSubdomainHeader(): Record<string, string> {
  try {
    const host = window.location.hostname;
    if (host.endsWith(".getschoolos.me")) {
      return { "x-school-subdomain": host.split(".")[0] };
    }
    if (host.endsWith(".localhost") && host.split(".").length === 2) {
      return { "x-school-subdomain": host.split(".")[0] };
    }
    const stored = localStorage.getItem(SUBDOMAIN_KEY);
    if (stored) return { "x-school-subdomain": stored };
  } catch {}
  return {};
}

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
  const { getToken, signOut } = useClerkAuth();
  const { isLoaded, isSignedIn } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  const setUserFromApi = (res: { user: Record<string, any>; school: Record<string, any> }) => {
    setUser({
      id: res.user.id,
      fullName: res.user.full_name || res.user.fullName,
      email: res.user.email,
      role: res.user.role,
      roleId: res.user.role_id || res.user.roleId,
      permissions: res.user.permissions || [],
    });
    setSchool({
      name: res.school.name,
      slug: res.school.slug,
      subdomain: res.school.subdomain || res.school.slug,
      plan: res.school.plan,
      modules: res.school.modules || [],
    });
  };

  const exchangeToken = useCallback(async () => {
    try {
      const clerkToken = await getToken();
      if (!clerkToken) {
        setUser(null);
        setSchool(null);
        return;
      }
      const subdomainHeader = getSubdomainHeader();
      await api.post("/api/auth/clerk-exchange", { clerkToken }, { headers: subdomainHeader });
      const res = await api.get<{ user: Record<string, any>; school: Record<string, any> }>("/api/auth/me", { headers: subdomainHeader });
      if (res.data) {
        setUserFromApi(res.data);
      }
    } catch {
      setUser(null);
      setSchool(null);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const loadFromCookie = useCallback(async () => {
    try {
      const subdomainHeader = getSubdomainHeader();
      const res = await api.get<{ user: Record<string, any>; school: Record<string, any> }>("/api/auth/me", { headers: subdomainHeader });
      if (res.data) {
        setUserFromApi(res.data);
      }
    } catch {
      setUser(null);
      setSchool(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      exchangeToken();
    } else {
      loadFromCookie();
    }
  }, [isLoaded, isSignedIn, exchangeToken, loadFromCookie]);

  const logout = useCallback(async () => {
    await api.post("/api/auth/logout", {});
    await signOut();
    setUser(null);
    setSchool(null);
  }, [signOut]);

  const refresh = useCallback(async () => {
    setLoading(true);
    if (isSignedIn) {
      await exchangeToken();
    } else {
      await loadFromCookie();
    }
  }, [isSignedIn, exchangeToken, loadFromCookie]);

  return (
    <AuthContext.Provider value={{ user, school, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
