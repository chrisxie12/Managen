import { Navigate } from "react-router";
import { useAuth } from "../app/contexts/AuthContext";

export function ParentGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== "parent") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
