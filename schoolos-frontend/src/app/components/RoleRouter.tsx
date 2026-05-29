import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

/**
 * Index route handler — redirects each role to their home page.
 * All pages render inside DashboardLayout's <Outlet />.
 */
const roleHomeRoutes: Record<string, string> = {
  school_admin: "/dashboard/admin",
  admin: "/dashboard/admin",
  headmaster: "/dashboard/headmaster",
  accountant: "/dashboard/accountant",
  teacher: "/dashboard/teacher",
  student: "/dashboard/student",
  parent: "/dashboard/parent",
  librarian: "/dashboard/librarian",
};

export function RoleRouter() {
  const { user, loading } = useAuth();

  if (loading) return null;

  const route = user ? roleHomeRoutes[user.role] : null;
  if (route) return <Navigate to={route} replace />;

  // Fallback
  return <Navigate to="/dashboard/admin" replace />;
}
