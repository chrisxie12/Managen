import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { AdminOverview } from "../pages/dashboard/AdminOverview";

const roleRoutes: Record<string, string> = {
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

  if (user?.role === "school_admin" || user?.role === "admin") {
    return <AdminOverview />;
  }

  const route = user ? roleRoutes[user.role] : null;
  if (route) return <Navigate to={route} replace />;

  return <AdminOverview />;
}
