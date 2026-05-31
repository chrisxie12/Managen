import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Bell, Search, Menu, Info, User, Settings, LogOut, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { Sidebar } from "../components/layout/Sidebar";

import { SetupChecklist } from "../../components/SetupChecklist";
import { useRealtimeNotifications } from "../hooks/useRealtimeNotifications";
import { UserPreferencesProvider, useUserPreferences } from "../contexts/UserPreferencesContext";
import { Breadcrumbs } from "../components/ui/Breadcrumbs";
import { MobileBottomNav } from "../components/layout/MobileBottomNav";
import { GlobalSearch } from "../components/layout/GlobalSearch";
import { CommandPalette } from "../components/CommandPalette";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { processSyncQueue } from "../lib/offlineSync";
import { api } from "../services/api";
import type { SyncItem } from "../lib/offlineSync";
import { useHealthStatus } from "../hooks/useHealthStatus";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";



const topLevelPaths: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/admin": "Dashboard",
  "/dashboard/headmaster": "Headmaster Dashboard",
  "/dashboard/accountant": "Finance Dashboard",
  "/dashboard/teacher": "Teacher Dashboard",
  "/dashboard/student": "Student Dashboard",
  "/dashboard/parent": "Parent Dashboard",
  "/dashboard/librarian": "Librarian Dashboard",
  "/dashboard/students": "Students",
  "/dashboard/staff": "Teachers & Staff",
  "/dashboard/classes": "Classes & Tiers",
  "/dashboard/attendance": "Attendance",
  "/dashboard/attendance-links": "Attendance Links",
  "/dashboard/gradebook": "Gradebook & SBA",
  "/dashboard/reports": "Reports",
  "/dashboard/fees": "Fee Collections",
  "/dashboard/communication": "Broadcast & Notice Board",
  "/dashboard/settings": "School Settings",
  "/dashboard/profile": "My Profile",
  "/dashboard/notifications": "Notifications",
  "/dashboard/inbox": "Inbox",
  "/dashboard/analytics": "Analytics",
  "/dashboard/academics": "Academics",
  "/dashboard/finance": "Finance",
  "/dashboard/bulk-import": "Bulk Import",
  "/dashboard/report-cards": "Report Cards",
  "/dashboard/assessments": "Assessments",
  "/dashboard/timetable-scheduler": "Timetable Scheduler",
  "/dashboard/system-health": "System Health",
  "/dashboard/audit-logs": "Audit Logs",
  "/dashboard/fee-reminders": "Fee Reminders",
  "/dashboard/daily-signin": "Daily Sign-In",
};

function HealthBadge({
  label,
  status,
  tooltip,
}: {
  label: string;
  status: "active" | "error" | "pilot";
  tooltip?: string;
}) {
  const dotColor = status === "active" ? "#16A34A" : status === "pilot" ? "#F59E0B" : "#EF4444";
  const labelText = status === "active" ? "Online" : status === "pilot" ? "Pilot" : "Down";

  return (
    <div
      title={tooltip}
      className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-default"
      style={{ background: `${dotColor}12`, border: `1px solid ${dotColor}30` }}
    >
      <span
        className={status === "active" ? "animate-pulse" : ""}
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: dotColor,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: dotColor }}>
        {label}: {labelText}
      </span>
    </div>
  );
}

function SyncBadge({ isOnline }: { isOnline: boolean }) {
  const color = isOnline ? "#16A34A" : "#F59E0B";
  return (
    <div
      className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-default"
      style={{ background: `${color}12`, border: `1px solid ${color}30` }}
      title={isOnline ? "Connected to internet" : "Offline — changes will sync when reconnected"}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: color,
          display: "inline-block",
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: "0.7rem", fontWeight: 600, color }}>
        {isOnline ? "Online" : "Syncing..."}
      </span>
    </div>
  );
}

function DashboardLayoutInner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, school, logout } = useAuth();
  const { unreadCount } = useRealtimeNotifications(user?.id, school?.slug);
  const { addRecentItem } = useUserPreferences();
  const { data: health } = useHealthStatus();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [pilotDismissed, setPilotDismissed] = useState(() => sessionStorage.getItem("pilotBannerDismissed") === "true");
  const [_installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [syncing, setSyncing] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useKeyboardShortcuts();

  // PWA install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Offline sync on reconnect
  useEffect(() => {
    const syncOffline = async () => {
      if (!navigator.onLine) return;
      setSyncing(true);
      try {
        const result = await processSyncQueue(async (item: SyncItem) => {
          if (item.type === "attendance") {
            await api.post("/api/school/attendance/batch", item.payload);
          } else if (item.type === "fee-payment") {
            await api.post("/api/school/fees/payments", item.payload);
          }
        }, (completed, total) => {
          toast.loading(`Syncing offline data... ${completed}/${total}`, { id: "offline-sync" });
        });
        if (result.synced > 0) {
          toast.success(`Synced ${result.synced} item${result.synced > 1 ? "s" : ""}`, { id: "offline-sync", duration: 3000 });
        } else {
          toast.dismiss("offline-sync");
        }
        if (result.failed > 0) {
          toast.error(`${result.failed} item${result.failed > 1 ? "s" : ""} failed to sync`);
        }
      } catch {
        toast.dismiss("offline-sync");
      } finally {
        setSyncing(false);
      }
    };

    window.addEventListener("online", syncOffline);
    syncOffline();
    return () => window.removeEventListener("online", syncOffline);
  }, []);

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
    <div className="flex h-screen overflow-hidden bg-background" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Desktop: full sidebar */}
      <div className="hidden lg:flex">
        <Sidebar role={user?.role || "school-admin"} />
      </div>
      {/* Tablet: icon-only collapsed sidebar */}
      <div className="hidden md:flex lg:hidden">
        <Sidebar role={user?.role || "school-admin"} collapsed={true} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 h-full w-[260px] max-w-[80vw] bg-sidebar shadow-xl flex-shrink-0">
            <Sidebar role={user?.role || "school-admin"} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-[220px] md:ml-16 min-w-0">
        <header className="flex items-center justify-between px-6 lg:px-8 py-0 flex-shrink-0 gap-4 bg-background border-b border-border" style={{ height: 64 }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-foreground">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-semibold" style={{ fontSize: "1.1rem", color: "#1C1917", lineHeight: 1.3, letterSpacing: "-0.01em" }}>
                Welcome back, {(user as any)?.firstName || user?.fullName?.split(" ")[0] || "Admin"}!
              </h1>
              {school?.name && (
                <p style={{ fontSize: "0.75rem", color: "#78716C", lineHeight: 1 }}>{school.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#A8A29E" }} />
              <input
                readOnly
                onClick={() => setGlobalSearchOpen(true)}
                placeholder="Search students, classes, reports..."
                style={{
                  width: 260,
                  height: 40,
                  border: "1px solid #E7E5E4",
                  borderRadius: 10,
                  padding: "0 14px 0 36px",
                  background: "#FFFFFF",
                  fontSize: 13,
                  color: "#A8A29E",
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <kbd style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: "#F5F5F4", color: "#A8A29E", border: "1px solid #E7E5E4" }}>
                ⌘K
              </kbd>
            </div>

            {/* Status badges — show only when available */}
            {health && (
              <div className="hidden md:flex items-center gap-2">
                {health?.momo && <HealthBadge label="MoMo" status="pilot" tooltip="Connect MTN MoMo API to go live" />}
                {health?.whatsapp && <HealthBadge label="WhatsApp" status="pilot" tooltip="Connect Arkesel to go live" />}
                <SyncBadge isOnline={navigator.onLine} />
              </div>
            )}

            {syncing && <span className="text-[11px] text-muted-foreground animate-pulse hidden sm:block">Syncing…</span>}

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFFFF", border: "1px solid #E7E5E4", cursor: "pointer", position: "relative", transition: "background 0.15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FAFAF9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFFFFF"; }}
              >
                <Bell size={18} style={{ color: "#78716C" }} />
                {unreadCount > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 4, background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-2xl shadow-lg overflow-hidden bg-card border border-border">
                    <div className="p-3 text-center">
                      <button onClick={() => { setShowNotifDropdown(false); navigate("/dashboard/notifications"); }} className="text-xs font-medium text-foreground hover:text-primary transition-colors">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 4px 4px", borderRadius: 10, background: "transparent", border: "1px solid transparent", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FAFAF9"; (e.currentTarget as HTMLElement).style.borderColor = "#E7E5E4"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}
              >
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{initials}</span>
                </div>
                <ChevronDown size={13} style={{ color: "#A8A29E" }} className="hidden sm:block" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 8, zIndex: 50, width: 200, borderRadius: 12, background: "#fff", border: "1px solid #E7E5E4", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", padding: "6px 0", overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px 10px", borderBottom: "1px solid #E7E5E4", marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1C1917", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fullName || "User"}</div>
                      <div style={{ fontSize: 11, color: "#78716C", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || ""}</div>
                    </div>
                    {[
                      { label: "My Profile",  Icon: User,     href: "/dashboard/profile" },
                      { label: "Settings",    Icon: Settings, href: "/dashboard/settings" },
                    ].map(({ label, Icon, href }) => (
                      <button key={label} onClick={() => { setShowUserMenu(false); navigate(href); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", fontSize: 13, color: "#1C1917", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.12s", textAlign: "left" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FAFAF9"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <Icon size={14} style={{ color: "#78716C" }} /> {label}
                      </button>
                    ))}
                    <div style={{ borderTop: "1px solid #E7E5E4", marginTop: 4, paddingTop: 4 }}>
                      <button onClick={() => { setShowUserMenu(false); logout(); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", fontSize: 13, color: "#EF4444", background: "transparent", border: "none", cursor: "pointer", transition: "background 0.12s", textAlign: "left" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <LogOut size={14} /> Log out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8 pb-24 lg:pb-8 w-full min-w-0">
          {!pilotDismissed && (
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl mb-5 border border-blue-200 bg-blue-50">
              <Info className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="flex-1 text-[13px] text-blue-700 font-medium">
                Preview mode — MoMo payments and WhatsApp messages are simulated until your school is connected.
              </p>
              <button
                onClick={() => {
                  sessionStorage.setItem("pilotBannerDismissed", "true");
                  setPilotDismissed(true);
                }}
                className="flex-shrink-0 text-[12px] font-semibold px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors active:scale-95"
              >
                Got it
              </button>
            </div>
          )}
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
