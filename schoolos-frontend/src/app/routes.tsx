import { createBrowserRouter, Navigate } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardLayout } from "./pages/DashboardLayout";
import { HeadmasterDashboard } from "./pages/HeadmasterDashboard";
import { AccountantDashboard } from "./pages/AccountantDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { ParentDashboard } from "./pages/ParentDashboard";
import { Students } from "./pages/Students";
import { Academics } from "./pages/Academics";
import { Finance } from "./pages/Finance";
import { SmartFeeReminders } from "./pages/SmartFeeReminders";
import { Communication } from "./pages/Communication";
import { SuperAdminLayout } from "./pages/SuperAdminLayout";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { SuperAdminSchools } from "./pages/SuperAdminSchools";
import { SuperAdminBilling } from "./pages/SuperAdminBilling";
import { SuperAdminAuthGuard } from "../components/SuperAdminAuthGuard";
import SchoolOSFlow from "./components/SchoolOSFlow";
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
    Component: SchoolOSFlow,
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
      { path: "student", Component: StudentDashboard },
      { path: "parent", Component: ParentDashboard },
      { path: "students", Component: Students },
      { path: "academics", Component: Academics },
      { path: "finance", Component: Finance },
      { path: "fee-reminders", Component: SmartFeeReminders },
      { path: "communication", Component: Communication },
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
      { path: "schools", Component: SuperAdminSchools },
      { path: "billing", Component: SuperAdminBilling },
    ],
  },
]);
