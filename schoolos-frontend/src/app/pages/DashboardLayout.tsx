import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { GraduationCap, Users, BellRing, MessageSquare, Wallet,
  Bell, LogOut, Menu, X, Settings, HelpCircle, BookOpen, Search,
  Shield, UserPlus, CalendarCheck, ClipboardCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { pagePermissions } from "../utils/permissions";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const SIDEBAR_BG = "#F9F1E7";
const MUTED = "#7D6077";

const allNavItems = [
  { icon: GraduationCap, label: "Dashboard", path: "/dashboard" },
  { icon: Shield, label: "Roles & Permissions", path: "/dashboard/roles" },
  { icon: UserPlus, label: "Users", path: "/dashboard/users" },
  { icon: Users, label: "Students", path: "/dashboard/students" },
  { icon: CalendarCheck, label: "Attendance", path: "/dashboard/attendance" },
  { icon: ClipboardCheck, label: "Assessments", path: "/dashboard/assessments" },
  { icon: BookOpen, label: "Academics", path: "/dashboard/academics" },
  { icon: Wallet, label: "Finance", path: "/dashboard/finance" },
  { icon: BellRing, label: "Fee Reminders", path: "/dashboard/fee-reminders" },
  { icon: MessageSquare, label: "Communication", path: "/dashboard/communication" },
];

const roleLabels: Record<string, string> = {
  school_admin: "Administrator",
  admin: "Administrator",
  headmaster: "Headmaster",
  accountant: "Accountant",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, school, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount] = useState(3);

  const userPerms = user?.permissions || [];
  const role = user?.role || "school_admin";

  // Permission-driven nav filtering
  const navItems = userPerms.length === 0
    ? allNavItems
    : allNavItems.filter((item) => {
        const required = pagePermissions[item.path];
        return !required || required.some((p) => userPerms.includes(p));
      });

  const roleLabel = roleLabels[role] || "Administrator";
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SA";

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-6 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
          <GraduationCap size={17} color={MILK} />
        </div>
        <div>
          <div style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.1 }}>Managen</div>
          <div style={{ color: MUTED, fontSize: "0.68rem" }}>{school?.name || "Dashboard"}</div>
        </div>
      </div>

      <div className="mx-4 mb-4" style={{ height: 1, background: `rgba(56,25,50,0.07)` }} />

      <div className="flex-1 px-3 flex flex-col gap-1">
        <p className="px-3 mb-2 uppercase tracking-widest" style={{ color: MUTED, fontSize: "0.65rem" }}>Main Menu</p>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all active:scale-95"
              style={{ background: active ? PLUM : "transparent", color: active ? MILK : PLUM_LIGHT }}>
              <item.icon size={17} />
              <span style={{ fontSize: "0.9rem", fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </button>
          );
        })}

        <div className="mt-6 mb-2">
          <p className="px-3 mb-2 uppercase tracking-widest" style={{ color: MUTED, fontSize: "0.65rem" }}>Support</p>
          {[{ icon: Settings, label: "Settings", path: "#" }, { icon: HelpCircle, label: "Help & Support", path: "mailto:support@getschoolos.me" }].map((item) => (
            <button key={item.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left hover:opacity-70 transition-opacity"
              style={{ color: MUTED }}>
              <item.icon size={16} />
              <span style={{ fontSize: "0.88rem" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-3 mb-4 p-3 rounded-2xl flex items-center gap-3"
        style={{ background: "rgba(56,25,50,0.05)", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
          <span style={{ color: MILK, fontSize: "0.8rem", fontWeight: 700 }}>{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div style={{ color: PLUM, fontSize: "0.82rem", fontWeight: 600 }} className="truncate">{user?.fullName || "User"}</div>
          <div style={{ color: MUTED, fontSize: "0.72rem" }}>{roleLabel}</div>
        </div>
        <button onClick={handleLogout} className="hover:opacity-70 transition-opacity">
          <LogOut size={15} color={MUTED} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: MILK }}>
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0"
        style={{ background: SIDEBAR_BG, borderRight: "1px solid rgba(56,25,50,0.07)" }}>
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <aside className="relative w-64 flex flex-col h-full" style={{ background: SIDEBAR_BG }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4"><X size={20} color={MUTED} /></button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ background: "rgba(255,243,230,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu size={22} color={PLUM} /></button>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.2 }}>
                {navItems.find((n) => isActive(n.path))?.label || "Dashboard"}
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

            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "white", border: "1px solid rgba(56,25,50,0.08)" }}>
              <Bell size={16} color={PLUM_LIGHT} />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                  style={{ background: "#EF4444", color: "white", fontSize: "0.6rem" }}>{notifCount}</span>
              )}
            </button>

            <div className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
              <span style={{ color: MILK, fontSize: "0.78rem", fontWeight: 700 }}>{initials}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
