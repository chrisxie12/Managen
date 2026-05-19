import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Bell, Search, Menu,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Sidebar } from "../components/Sidebar";
import { SetupChecklist } from "../../components/SetupChecklist";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const roleLabels: Record<string, string> = {
  school_admin: "Administrator",
  admin: "Administrator",
  headmaster: "Headmaster",
  accountant: "Accountant",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

const topLevelPaths: Record<string, string> = {
  "/dashboard/admin": "Dashboard",
  "/dashboard/students": "Students",
  "/dashboard/staff": "Teachers & Staff",
  "/dashboard/parents": "Guardians",
  "/dashboard/classes": "Classes & Tiers",
  "/dashboard/attendance": "Attendance",
  "/dashboard/gradebook": "Gradebook & SBA",
  "/dashboard/reports": "Terminal Report Cards",
  "/dashboard/fees": "Fee Collections",
  "/dashboard/invoices": "Invoices & Accounts",
  "/dashboard/communication": "Broadcast & Notice Board",
  "/dashboard/settings": "School Settings",
  "/dashboard/roles": "Security & Roles",
  "/dashboard/profile": "My Profile",
  "/dashboard/notifications": "Notifications",
};

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, school, logout } = useAuth();
  const { unreadCount } = useRealtimeNotifications(user?.id, school?.slug);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = user?.role || "";
  const roleLabel = roleLabels[role] || "Administrator";
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SA";

  const pageTitle = Object.entries(topLevelPaths).find(
    ([path]) => path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path),
  )?.[1] || "Dashboard";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: MILK }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 flex-shrink-0 gap-3"
          style={{ background: "rgba(255,243,230,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden">
              <Menu size={20} color={PLUM} />
            </button>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.2 }}>
                {pageTitle}
              </h1>
              <p style={{ color: MUTED, fontSize: "0.75rem" }}>Term 2, 2025/2026 Academic Year</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "white", border: "1px solid rgba(56,25,50,0.08)", width: 220 }}>
              <Search size={14} color={MUTED} />
              <input placeholder="Search..." className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
            </div>

            <button onClick={() => navigate("/dashboard/notifications")}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "white", border: "1px solid rgba(56,25,50,0.08)" }}>
              <Bell size={16} color={PLUM_LIGHT} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 rounded-xl flex items-center justify-center text-xs font-bold"
                  style={{ background: "#EF4444", color: "white", fontSize: "0.6rem", minWidth: 16, height: 16, padding: "0 3px" }}>{unreadCount > 99 ? "99+" : unreadCount}</span>
              )}
            </button>

            <div className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
              <span style={{ color: MILK, fontSize: "0.78rem", fontWeight: 700 }}>{initials}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <SetupChecklist />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
