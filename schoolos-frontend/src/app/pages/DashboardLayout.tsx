import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Bell, Search, Menu, Download,
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

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";



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

// ─── Health Badge ──────────────────────────────────────────────────────────────
type BadgeStatus = "green" | "yellow" | "red";

function HealthBadge({
  label,
  status,
  latency,
}: {
  label: string;
  status: "active" | "error" | "unknown";
  latency: number;
}) {
  const badgeStatus: BadgeStatus =
    status === "active" && latency < 3000
      ? "green"
      : status === "active"
      ? "yellow"
      : "red";

  const dotColor =
    badgeStatus === "green" ? "#10B981" : badgeStatus === "yellow" ? "#F59E0B" : "#EF4444";
  const labelText =
    badgeStatus === "green" ? label : badgeStatus === "yellow" ? `${label} Slow` : `${label} Down`;

  return (
    <div
      title={`${label}: ${latency}ms`}
      className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-default"
      style={{ background: `${dotColor}12`, border: `1px solid ${dotColor}30` }}
    >
      <span
        className={badgeStatus === "green" ? "animate-pulse" : ""}
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
        {labelText}
      </span>
    </div>
  );
}

function SyncBadge({ isOnline }: { isOnline: boolean }) {
  const color = isOnline ? "#10B981" : "#F59E0B";
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
  const { user, school } = useAuth();
  const { unreadCount } = useRealtimeNotifications(user?.id, school?.slug);
  const { addRecentItem } = useUserPreferences();
  const { data: health } = useHealthStatus();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [syncing, setSyncing] = useState(false);

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

  const role = user?.role || "";
  void role; // used for sidebar
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
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: CREAM }}>
      {/* Desktop: full sidebar */}
      <div className="hidden lg:flex">
        <Sidebar role={(user?.role || "school-admin") as any} />
      </div>
      {/* Tablet: icon-only collapsed sidebar */}
      <div className="hidden md:flex lg:hidden">
        <Sidebar role={(user?.role || "school-admin") as any} collapsed={true} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 h-full bg-white shadow-xl">
             <Sidebar role={(user?.role || "school-admin") as any} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 flex-shrink-0 gap-3"
          style={{ background: "rgba(248,249,250,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden">
              <Menu size={20} color={NAVY} />
            </button>
            <div>
              <h1 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.2 }}>
                {pageTitle}
              </h1>
              <p style={{ color: MUTED, fontSize: "0.75rem" }}>Term 2, 2025/2026 Academic Year</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
            {/* Health Badges — only show after first successful poll */}
            {health && (
              <>
                <HealthBadge
                  label="MoMo"
                  status={health.momo.status}
                  latency={health.momo.latency_ms}
                />
                <HealthBadge
                  label="WhatsApp"
                  status={health.whatsapp.status}
                  latency={health.whatsapp.latency_ms}
                />
                <SyncBadge isOnline={navigator.onLine} />
              </>
            )}
          </div>

          {installPrompt && (
              <button onClick={handleInstall}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95 text-xs font-medium"
                style={{ background: "white", border: "1px solid rgba(10,36,114,0.08)", color: NAVY }}>
                <Download size={13} /> Install App
              </button>
            )}
            {syncing && (
              <span className="text-[11px] text-muted-foreground animate-pulse">Syncing...</span>
            )}
            <button
              onClick={() => setGlobalSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl transition-all active:scale-95"
              style={{ background: "white", border: "1px solid rgba(10,36,114,0.08)" }}
            >
              <Search size={14} color={MUTED} />
              <span style={{ color: MUTED, fontSize: "0.82rem" }}>Search...</span>
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-medium ml-4"
                style={{ background: `${NAVY}08`, color: MUTED }}>
                ⌘K
              </kbd>
            </button>

            <div className="relative">
              <button onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "white", border: "1px solid rgba(10,36,114,0.08)" }}>
                <Bell size={16} color={NAVY_LIGHT} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: "#EF4444", color: "white", fontSize: "0.6rem", minWidth: 16, height: 16, padding: "0 3px" }}>{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </button>
              {showNotifDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl shadow-lg overflow-hidden"
                    style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)" }}>
                    <div className="p-3 text-center text-sm" style={{ color: MUTED }}>
                      <button onClick={() => { setShowNotifDropdown(false); navigate("/dashboard/notifications"); }}
                        className="text-xs font-medium" style={{ color: NAVY }}>
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` }}>
              <span style={{ color: CREAM, fontSize: "0.78rem", fontWeight: 700 }}>{initials}</span>
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
