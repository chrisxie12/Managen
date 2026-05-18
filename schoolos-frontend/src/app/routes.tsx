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
import { StudentsEnhanced } from "./pages/StudentsEnhanced";
import { AttendanceLinks } from "./pages/AttendanceLinks";
import { ReportCards } from "./pages/ReportCards";
import { BulkImport } from "./pages/BulkImport";
import { StaffDirectory } from "./pages/StaffDirectory";
import { DailySignIn } from "./pages/DailySignIn";
import { Academics } from "./pages/Academics";
import { TeacherClassManagement } from "./pages/TeacherClassManagement";
import { Finance } from "./pages/Finance";
import { SmartFeeReminders } from "./pages/SmartFeeReminders";
import { Communication } from "./pages/Communication";
import { AdminRoles } from "./pages/AdminRoles";
import { AdminUsers } from "./pages/AdminUsers";
import { Attendance } from "./pages/Attendance";
import { WeightedGradebook } from "./pages/WeightedGradebook";
import { FeePayment } from "./pages/FeePayment";
import { PaymentVerify } from "./pages/PaymentVerify";
import { TimetableScheduler } from "./pages/TimetableScheduler";
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
import { SuperAdminReportCards } from "./pages/SuperAdminReportCards";
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
      { path: "students", Component: StudentsEnhanced },
      { path: "attendance", Component: Attendance },
      { path: "attendance-links", Component: AttendanceLinks },
      { path: "report-cards", Component: ReportCards },
      { path: "bulk-import", Component: BulkImport },
      { path: "staff", Component: StaffDirectory },
      { path: "daily-signin", Component: DailySignIn },
      { path: "assessments", Component: Assessments },
      { path: "weighted-gradebook", Component: WeightedGradebook },
      { path: "timetable-scheduler", Component: TimetableScheduler },
      { path: "analytics", Component: AnalyticsDashboard },
      { path: "academics", Component: Academics },
      { path: "finance", Component: Finance },
      { path: "reports", Component: Reports },
      { path: "audit-logs", Component: AuditLogs },
      { path: "fees", Component: FeePayment },
      { path: "fee-reminders", Component: SmartFeeReminders },
      { path: "communication", Component: Communication },
      { path: "system-health", Component: SystemHealth },
      { path: "settings", Component: SchoolSettings },
      { path: "users", Component: AdminUsers },
      { path: "roles", Component: AdminRoles },
    ],
  },
  {
    path: "/payment/verify",
    Component: PaymentVerify,
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
      { path: "report-cards", Component: SuperAdminReportCards },
    ],
  },
]);
