import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, Users, CalendarCheck, Wallet, Bell,
  BookOpen, BarChart3, Clock,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const NAVY = "#031B4E";
const MUTED = "#6B7280";

// Role-specific bottom nav items (max 5)
const roleBottomNav: Record<string, Array<{ icon: any; label: string; path: string }>> = {
  school_admin: [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard/admin" },
    { icon: Users, label: "Students", path: "/dashboard/students" },
    { icon: CalendarCheck, label: "Attendance", path: "/dashboard/attendance" },
    { icon: Wallet, label: "Fees", path: "/dashboard/fees/collect" },
    { icon: Bell, label: "Inbox", path: "/dashboard/notifications" },
  ],
  headmaster: [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard/admin" },
    { icon: Users, label: "Students", path: "/dashboard/students" },
    { icon: CalendarCheck, label: "Attendance", path: "/dashboard/attendance" },
    { icon: Wallet, label: "Fees", path: "/dashboard/fees/collect" },
    { icon: Bell, label: "Inbox", path: "/dashboard/notifications" },
  ],
  admin: [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard/admin" },
    { icon: Users, label: "Students", path: "/dashboard/students" },
    { icon: CalendarCheck, label: "Attendance", path: "/dashboard/attendance" },
    { icon: Wallet, label: "Fees", path: "/dashboard/fees/collect" },
    { icon: Bell, label: "Inbox", path: "/dashboard/notifications" },
  ],
  teacher: [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard/teacher" },
    { icon: CalendarCheck, label: "Attendance", path: "/dashboard/attendance" },
    { icon: BookOpen, label: "Grades", path: "/dashboard/gradebook" },
    { icon: Clock, label: "Timetable", path: "/dashboard/timetable-scheduler" },
    { icon: Bell, label: "Inbox", path: "/dashboard/notifications" },
  ],
  accountant: [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard/accountant" },
    { icon: Wallet, label: "Fees", path: "/dashboard/fees/collect" },
    { icon: BarChart3, label: "Reports", path: "/dashboard/fees/reports" },
    { icon: Bell, label: "Inbox", path: "/dashboard/notifications" },
  ],
};

const defaultNav = [
  { icon: LayoutDashboard, label: "Home", path: "/dashboard" },
  { icon: Bell, label: "Alerts", path: "/dashboard/notifications" },
];

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const role = user?.role || "";
  const navItems = roleBottomNav[role] || defaultNav;

  const isActive = (path: string) => {
    if (path === "/dashboard" || path === "/dashboard/admin" || path === "/dashboard/teacher" || path === "/dashboard/accountant") {
      return location.pathname === path || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex items-center justify-around px-2 pb-safe-area-inset-bottom pt-1"
      style={{
        background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(10,36,114,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}
    >
      {navItems.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            id={`mobile-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all active:scale-90"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <div
              className="flex items-center justify-center w-10 h-6 rounded-full transition-all"
              style={{
                background: active ? "#0080FF" : "transparent",
                boxShadow: active ? "0 2px 8px rgba(0,128,255,0.3)" : "none",
              }}
            >
              <item.icon
                size={17}
                color={active ? "#fff" : MUTED}
                style={{ opacity: active ? 1 : 0.55 }}
              />
            </div>
            <span
              style={{
                color: active ? "#0080FF" : MUTED,
                fontSize: "0.58rem",
                fontWeight: active ? 700 : 400,
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
