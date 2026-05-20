import { useNavigate, useLocation } from "react-router";
import { LayoutDashboard, Users, CalendarCheck, Wallet, Bell } from "lucide-react";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Users, label: "Students", path: "/dashboard/students" },
  { icon: CalendarCheck, label: "Attendance", path: "/dashboard/attendance" },
  { icon: Wallet, label: "Fees", path: "/dashboard/fees" },
  { icon: Bell, label: "Alerts", path: "/dashboard/notifications" },
];

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
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
