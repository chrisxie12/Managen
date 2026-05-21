import { createBrowserRouter, Navigate } from "react-router";
import { LandingPageV2 } from "./pages/LandingPageV2_improved";
import { AuthPage } from "./pages/AuthPage";
import { DashboardLayout } from "./pages/DashboardLayout";
import { HeadmasterDashboard } from "./pages/HeadmasterDashboard";
import { AdminOverview } from "./pages/dashboard/AdminOverview";
import { StudentsPage } from "./pages/dashboard/StudentsPage";
import { StudentsImport } from "./pages/dashboard/StudentsImport";
import { FeesPage } from "./pages/dashboard/FeesPage";
import { AttendancePage } from "./pages/dashboard/AttendancePage";
import { ClassesPage } from "./pages/dashboard/ClassesPage";
import { AccountantDashboard } from "./pages/AccountantDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { StudentDashboard } from "./pages/StudentDashboard";
import { StudentDetails } from "./pages/StudentDetails";
import { ParentDashboard } from "./pages/ParentDashboard";
import { LibrarianDashboard } from "./pages/LibrarianDashboard";
import { ParentChildDetails } from "./pages/ParentChildDetails";
import { ParentLayout } from "./pages/parent/ParentLayout";
import { ParentHome } from "./pages/parent/ParentHome";
import { ParentChild } from "./pages/parent/ParentChild";
import { ParentFees } from "./pages/parent/ParentFees";
import { ParentReports } from "./pages/parent/ParentReports";
import { ParentProfile } from "./pages/parent/ParentProfile";
import { Inbox } from "./pages/Inbox";
import { NotificationsPage } from "./pages/NotificationsPage";
import { Students } from "./pages/Students";
import { StudentsEnhanced } from "./pages/StudentsEnhanced";
import { AttendanceLinks } from "./pages/AttendanceLinks";
import { ReportCards } from "./pages/ReportCards";
import { GradebookGrid } from "./pages/dashboard/gradebook/GradebookGrid";
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
import { AssessmentsEntry } from "./pages/AssessmentsEntry";
import { WeightedGradebook } from "./pages/WeightedGradebook";
import { FeePayment } from "./pages/FeePayment";
import { PaymentVerify } from "./pages/PaymentVerify";
import { TimetableScheduler } from "./pages/TimetableScheduler";
import { Assessments } from "./pages/Assessments";
import { AnalyticsDashboard } from "./pages/AnalyticsDashboard";
import { Reports } from "./pages/Reports";
import { AuditLogs } from "./pages/AuditLogs";
import { SystemHealth } from "./pages/SystemHealth";
import { SchoolSettings } from "./pages/dashboard/settings/SchoolSettings";
import { AdminProfile } from "./pages/dashboard/profile/AdminProfile";
import { SuperAdminLayout } from "./pages/SuperAdminLayout";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { SuperAdminSchools } from "./pages/SuperAdminSchools";
import { SuperAdminOverview } from "./pages/SuperAdminOverview";
import { SuperAdminBilling } from "./pages/SuperAdminBilling";
import { SuperAdminReportCards } from "./pages/SuperAdminReportCards";
import { SuperAdminAuthGuard } from "../components/SuperAdminAuthGuard";
import { RequireRole } from "../components/RequireRole";
import ManagenFlow from "./components/ManagenFlow";
import { AuthGuard } from "../components/AuthGuard";
import { ParentGuard } from "../components/ParentGuard";
import { OnboardingGuard } from "../components/OnboardingGuard";
import { ProfileGuard } from "../components/ProfileGuard";
import { Onboarding } from "./pages/Onboarding";
import { RoleRouter } from "./components/RoleRouter";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPageV2,
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
    path: "/onboarding",
    element: (
      <AuthGuard>
        <Onboarding />
      </AuthGuard>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <OnboardingGuard>
          <ProfileGuard>
            <DashboardLayout />
          </ProfileGuard>
        </OnboardingGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, Component: RoleRouter },
      { path: "admin", Component: AdminOverview },
      { path: "students", Component: StudentsPage },
      { path: "students/import", Component: StudentsImport },
      { path: "fees", Component: FeesPage },
      { path: "attendance", Component: AttendancePage },
      { path: "classes", Component: ClassesPage },
      { path: "headmaster", Component: HeadmasterDashboard },
      { path: "accountant", Component: AccountantDashboard },
      { path: "teacher", Component: TeacherDashboard },
      { path: "teacher/classes", Component: TeacherClassManagement },
      { path: "student", Component: StudentDashboard },
      { path: "student/details", Component: StudentDetails },
      { path: "student/details/:id", Component: StudentDetails },
      { path: "parent", Component: ParentDashboard },
      { path: "librarian", Component: LibrarianDashboard },
      { path: "parent/child/:id", Component: ParentChildDetails },
      { path: "inbox", Component: Inbox },
      { path: "notifications", Component: NotificationsPage },
      { path: "attendance-links", Component: AttendanceLinks },
      { path: "report-cards", Component: ReportCards },
      { path: "bulk-import", Component: BulkImport },
      { path: "staff", Component: StaffDirectory },
      { path: "daily-signin", Component: DailySignIn },
      { path: "assessments", Component: Assessments },
      { path: "weighted-gradebook", Component: WeightedGradebook },
      { path: "assessments/entry", Component: AssessmentsEntry },
      { path: "timetable-scheduler", Component: TimetableScheduler },
      { path: "analytics", Component: AnalyticsDashboard },
      { path: "academics", Component: Academics },
      { path: "finance", Component: Finance },
      { path: "gradebook", Component: GradebookGrid },
      { path: "reports", Component: Reports },
      { path: "audit-logs", Component: AuditLogs },
      { path: "fee-reminders", Component: SmartFeeReminders },
      { path: "communication", Component: Communication },
      { path: "system-health", Component: SystemHealth },
      
      // New Navigation Mappings
      { path: "whatsapp", Component: Communication },
      { path: "notices", Component: Communication },
      { path: "fees/collect", Component: FeesPage },
      { path: "fees/structure", Component: FeesPage },
      { path: "fees/reports", Component: Reports },
      { path: "setup/profile", Component: SchoolSettings },
      { path: "setup/staff", Component: StaffDirectory },
      { path: "setup/branding", Component: SchoolSettings },
      { path: "setup/nacca", Component: SchoolSettings },
      { path: "setup/integrations", Component: SchoolSettings },
      { path: "setup/data", Component: SchoolSettings },
      { path: "profile", Component: AdminProfile },
      { path: "settings", element: <RequireRole roles={["school_admin", "admin", "headmaster"]}><SchoolSettings /></RequireRole> },
      { path: "users", element: <RequireRole roles={["school_admin", "admin"]}><AdminUsers /></RequireRole> },
      { path: "roles", element: <RequireRole roles={["school_admin", "admin"]}><AdminRoles /></RequireRole> },
    ],
  },
  {
    path: "/parent",
    element: (
      <AuthGuard>
        <ParentGuard>
          <ParentLayout />
        </ParentGuard>
      </AuthGuard>
    ),
    children: [
      { index: true, Component: ParentHome },
      { path: "child", Component: ParentChild },
      { path: "fees", Component: ParentFees },
      { path: "reports", Component: ParentReports },
      { path: "profile", Component: ParentProfile },
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
