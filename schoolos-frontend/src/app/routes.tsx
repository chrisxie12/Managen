import { createBrowserRouter, Navigate, Outlet } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { AuthPage } from "./pages/AuthPage";
import { DashboardLayout } from "./pages/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { Students } from "./pages/Students";
import { Academics } from "./pages/Academics";
import { Finance } from "./pages/Finance";
import { SmartFeeReminders } from "./pages/SmartFeeReminders";
import { Communication } from "./pages/Communication";
import SchoolOSFlow from "./components/SchoolOSFlow";
import { AuthGuard } from "../components/AuthGuard";

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
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </AuthGuard>
    ),
    children: [
      { index: true, Component: DashboardHome },
      { path: "students", Component: Students },
      { path: "academics", Component: Academics },
      { path: "finance", Component: Finance },
      { path: "fee-reminders", Component: SmartFeeReminders },
      { path: "communication", Component: Communication },
    ],
  },
]);
