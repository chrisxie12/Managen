import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import {
  LayoutDashboard, Users, Wallet, Megaphone, Sliders,
  Bell, School, BarChart3, CalendarCheck, NotebookPen,
  UserCircle, TrendingUp,
} from "lucide-react";

const NAVY = "#0A2472";
const AMBER = "#FFBA08";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type MobileNavItem = {
  icon: any;
  label: string;
  path: string;
};

function useMobileNav(role: string): MobileNavItem[] {
  switch (role) {
    case "school_admin":
    case "admin":
      return [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
        { icon: School, label: "Schools", path: "/dashboard/users" },
        { icon: Wallet, label: "Finance", path: "/dashboard/finance" },
        { icon: TrendingUp, label: "Analytics", path: "/dashboard/analytics" },
        { icon: Sliders, label: "Settings", path: "/dashboard/settings" },
      ];
    case "headmaster":
      return [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/headmaster" },
        { icon: Users, label: "Students", path: "/dashboard/students" },
        { icon: Wallet, label: "Fees", path: "/dashboard/fees" },
        { icon: Megaphone, label: "Comms", path: "/dashboard/communication" },
        { icon: Sliders, label: "Setup", path: "/dashboard/settings" },
      ];
    case "teacher":
      return [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/teacher" },
        { icon: CalendarCheck, label: "Attendance", path: "/dashboard/attendance" },
        { icon: Users, label: "Students", path: "/dashboard/students" },
        { icon: NotebookPen, label: "Grades", path: "/dashboard/gradebook" },
        { icon: Megaphone, label: "Notices", path: "/dashboard/communication" },
      ];
    case "accountant":
    case "bursar":
      return [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/accountant" },
        { icon: Wallet, label: "Fees", path: "/dashboard/fees" },
        { icon: BarChart3, label: "Reports", path: "/dashboard/finance" },
        { icon: TrendingUp, label: "Revenue", path: "/dashboard/analytics" },
        { icon: UserCircle, label: "Profile", path: "/dashboard/profile" },
      ];
    default:
      return [
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: Users, label: "Students", path: "/dashboard/students" },
        { icon: CalendarCheck, label: "Attendance", path: "/dashboard/attendance" },
        { icon: Wallet, label: "Fees", path: "/dashboard/fees" },
        { icon: Bell, label: "Alerts", path: "/dashboard/notifications" },
      ];
  }
}

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const NAV_ITEMS = useMobileNav(user?.role || "");

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex items-center justify-around px-2 pb-2 pt-1"
      style={{
        background: "rgba(248,249,250,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(10,36,114,0.07)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all active:scale-90"
            style={{ minWidth: 48, minHeight: 44 }}
          >
            <item.icon
              size={18}
              color={active ? NAVY : MUTED}
              style={{ opacity: active ? 1 : 0.6 }}
            />
            <span
              style={{
                color: active ? NAVY : MUTED,
                fontSize: "0.6rem",
                fontWeight: active ? 600 : 400,
                opacity: active ? 1 : 0.6,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
