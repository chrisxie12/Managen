import { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Bell, Search, Menu, Download, Info, User, Settings, LogOut, ChevronDown,
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
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";



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
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
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

  const handleInstall = () => {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    (installPrompt as any).userChoice.then(() => setInstallPrompt(null));
  };

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

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-[260px] md:ml-16 min-w-0">
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 flex-shrink-0 gap-3 bg-background/85 backdrop-blur-xl border-b border-border">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-foreground">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-foreground font-semibold" style={{ fontSize: "1.05rem", lineHeight: 1.3 }}>
                {pageTitle}
              </h1>
              {school?.name && (
                <p className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>{school.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
            {/* Health Badges — only show after first successful poll */}
            {health && (
              <>
              {health?.momo && (
                  <HealthBadge
                    label="MoMo"
                    status="pilot"
                    tooltip="Connect MTN MoMo API to go live"
                  />
                )}
                {health?.whatsapp && (
                  <HealthBadge
                    label="WhatsApp"
                    status="pilot"
                    tooltip="Connect Arkesel to go live"
                  />
                )}
                <SyncBadge isOnline={navigator.onLine} />
              </>
            )}
          </div>

          {installPrompt && (
              <button onClick={handleInstall}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95 text-xs font-medium bg-card border border-border text-foreground">
                <Download size={13} /> Install App
              </button>
            )}
            {syncing && (
              <span className="text-[11px] text-muted-foreground animate-pulse">Syncing...</span>
            )}
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95 bg-card border border-border"
            >
              <Search size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground" style={{ fontSize: "0.82rem" }}>Search...</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium ml-4 bg-muted text-muted-foreground">
                ⌘K
              </kbd>
            </button>

            <div className="relative">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-card border border-border">
                <Bell size={16} className="text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: "#EF4444", color: "white", fontSize: "0.6rem", minWidth: 16, height: 16, padding: "0 3px" }}>{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </button>
              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-[calc(100vw-2rem)] max-w-xs rounded-2xl shadow-lg overflow-hidden bg-card border border-border sm:w-80">
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      <button onClick={() => { setShowNotifDropdown(false); navigate("/dashboard/notifications"); }}
                        className="text-xs font-medium text-foreground hover:text-primary transition-colors">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-card border border-transparent hover:border-border"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` }}>
                  <span style={{ color: CREAM, fontSize: "0.75rem", fontWeight: 700 }}>{initials}</span>
                </div>
                <ChevronDown size={13} className="text-muted-foreground hidden sm:block" />
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl shadow-lg overflow-hidden bg-card border border-border py-1">
                    <div className="px-3 py-2.5 border-b border-border mb-1">
                      <div className="text-[13px] font-semibold text-foreground truncate">{user?.fullName || "User"}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{user?.email || ""}</div>
                    </div>
                    <button
                      onClick={() => { setShowUserMenu(false); navigate("/dashboard/profile"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-accent/50 transition-colors"
                    >
                      <User size={14} className="text-muted-foreground" /> My Profile
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); navigate("/dashboard/settings"); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-accent/50 transition-colors"
                    >
                      <Settings size={14} className="text-muted-foreground" /> Settings
                    </button>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={() => { setShowUserMenu(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
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

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6 w-full min-w-0">
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
