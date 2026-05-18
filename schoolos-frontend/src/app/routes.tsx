import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardLayout } from "./pages/DashboardLayout";
import { HeadmasterDashboard } from "./pages/HeadmasterDashboard";
import { AccountantDashboard } from "./pages/AccountantDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StudentDetails } from "./pages/StudentDetails";
import { ParentDashboard } from "./pages/ParentDashboard";
import { ParentChildDetails } from "./pages/ParentChildDetails";
import { Inbox } from "./pages/Inbox";
import { NotificationsPage } from "./pages/NotificationsPage";
import { Students } from "./pages/Students";
import { Academics } from "./pages/Academics";
import { TeacherClassManagement } from "./pages/TeacherClassManagement";
import { Finance } from "./pages/Finance";
import { SmartFeeReminders } from "./pages/SmartFeeReminders";
import { Communication } from "./pages/Communication";
import { AdminRoles } from "./pages/AdminRoles";
import { AdminUsers } from "./pages/AdminUsers";
import { Attendance } from "./pages/Attendance";
import { Assessments } from "./pages/Assessments";
import { AnalyticsDashboard } from "./pages/AnalyticsDashboard";
import { Reports } from "./pages/Reports";
import { AuditLogs } from "./pages/AuditLogs";
import { SystemHealth } from "./pages/SystemHealth";
import { SchoolSettings } from "./pages/Settings";
import { SuperAdminLayout } from "./pages/SuperAdminLayout";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { SuperAdminSchools } from "./pages/SuperAdminSchools";
import { SuperAdminOverview } from "./pages/SuperAdminOverview";
import { SuperAdminBilling } from "./pages/SuperAdminBilling";
import { SuperAdminAuthGuard } from "../components/SuperAdminAuthGuard";
import ManagenFlow from "./components/ManagenFlow";
import { AuthGuard } from "../components/AuthGuard";
import { RoleRouter } from "./components/RoleRouter";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    element: <Navigate to="/auth" replace />,
  },
  {
    path: "/auth/login",
    element: <Navigate to="/auth" replace />,
  },
  {
    path: "/architecture",
    Component: ManagenFlow,
  },
  {
    path: "/auth",
    Component: AuthPage,
  },
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, Component: RoleRouter },
      { path: "headmaster", Component: HeadmasterDashboard },
      { path: "accountant", Component: AccountantDashboard },
      { path: "teacher", Component: TeacherDashboard },
      { path: "teacher/classes", Component: TeacherClassManagement },
      { path: "student", Component: StudentDashboard },
      { path: "student/details", Component: StudentDetails },
      { path: "student/details/:id", Component: StudentDetails },
      { path: "parent", Component: ParentDashboard },
      { path: "parent/child/:id", Component: ParentChildDetails },
      { path: "inbox", Component: Inbox },
      { path: "notifications", Component: NotificationsPage },
      { path: "students", Component: Students },
      { path: "attendance", Component: Attendance },
      { path: "assessments", Component: Assessments },
      { path: "analytics", Component: AnalyticsDashboard },
      { path: "academics", Component: Academics },
      { path: "finance", Component: Finance },
      { path: "reports", Component: Reports },
      { path: "audit-logs", Component: AuditLogs },
      { path: "fee-reminders", Component: SmartFeeReminders },
      { path: "communication", Component: Communication },
      { path: "system-health", Component: SystemHealth },
      { path: "settings", Component: SchoolSettings },
      { path: "users", Component: AdminUsers },
      { path: "roles", Component: AdminRoles },
    ],
  },
  {
    path: "/superadmin",
    element: (
      <SuperAdminAuthGuard>
        <SuperAdminLayout />
      </SuperAdminAuthGuard>
    ),
    children: [
      { index: true, Component: SuperAdminDashboard },
        { path: "overview", Component: SuperAdminOverview },
      { path: "schools", Component: SuperAdminSchools },
      { path: "billing", Component: SuperAdminBilling },
    ],
  },
]);
