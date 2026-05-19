import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Bell, Search, Menu,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Sidebar } from "../components/Sidebar";
import { SetupChecklist } from "../../components/SetupChecklist";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";
import { UserPreferencesProvider, useUserPreferences } from "../contexts/UserPreferencesContext";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { MobileBottomNav } from "../components/layout/MobileBottomNav";
import { GlobalSearch } from "../components/layout/GlobalSearch";
import { CommandPalette } from "../components/CommandPalette";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

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
  "/dashboard/inbox": "Inbox",
};

function DashboardLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, school } = useAuth();
  const { unreadCount } = useRealtimeNotifications(user?.id, school?.slug);
  const { preferences, toggleSidebar, addRecentItem } = useUserPreferences();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useKeyboardShortcuts();

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

  useEffect(() => {
    if (pageTitle !== "Dashboard") {
      addRecentItem(location.pathname, pageTitle);
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: MILK }}>
      <Sidebar
        collapsed={preferences.sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
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
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95"
              style={{ background: "white", border: "1px solid rgba(56,25,50,0.08)" }}
            >
              <Search size={14} color={MUTED} />
              <span style={{ color: MUTED, fontSize: "0.82rem" }}>Search...</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium ml-4"
                style={{ background: `${PLUM}08`, color: MUTED }}>
                ⌘K
              </kbd>
            </button>

            <div className="relative">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "white", border: "1px solid rgba(56,25,50,0.08)" }}>
                <Bell size={16} color={PLUM_LIGHT} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: "#EF4444", color: "white", fontSize: "0.6rem", minWidth: 16, height: 16, padding: "0 3px" }}>{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </button>
              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl shadow-lg overflow-hidden"
                    style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
                    <div className="p-3 text-center text-sm" style={{ color: MUTED }}>
                      <button onClick={() => { setShowNotifDropdown(false); navigate("/dashboard/notifications"); }}
                        className="text-xs font-medium" style={{ color: PLUM }}>
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
              <span style={{ color: MILK, fontSize: "0.78rem", fontWeight: 700 }}>{initials}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <SetupChecklist />
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>

      <GlobalSearch open={globalSearchOpen} onClose={() => setGlobalSearchOpen(false)} />
      <CommandPalette />
      <MobileBottomNav />
    </div>
  );
}

export function DashboardLayout() {
  return (
    <UserPreferencesProvider>
      <DashboardLayoutInner />
    </UserPreferencesProvider>
  );
}
