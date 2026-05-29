import { useAuth } from "../contexts/AuthContext";
import { DashboardHome } from "../pages/DashboardHome";
import { TeacherDashboard } from "../pages/TeacherDashboard";
import { StudentDashboard } from "../pages/StudentDashboard";
import { ParentDashboard } from "../pages/ParentDashboard";
import { AccountantDashboard } from "../pages/AccountantDashboard";
import { HeadmasterDashboard } from "../pages/HeadmasterDashboard";

export function RoleDashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case "teacher":
      return <TeacherDashboard />;
    case "student":
      return <StudentDashboard />;
    case "parent":
      return <ParentDashboard />;
    case "accountant":
      return <AccountantDashboard />;
    case "headmaster":
      return <HeadmasterDashboard />;
    default:
      return <DashboardHome />;
  }
}
