import { useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Home, User, Wallet, FileText, Settings, Bell, LogOut, RefreshCw,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { processSyncQueue } from "../../lib/offlineSync";
import { api } from "../../services/api";
import { toast } from "sonner";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

const NAV_ITEMS = [
  { path: "/parent", icon: Home, label: "Home" },
  { path: "/parent/child", icon: User, label: "Child" },
  { path: "/parent/fees", icon: Wallet, label: "Fees" },
  { path: "/parent/reports", icon: FileText, label: "Reports" },
  { path: "/parent/profile", icon: Settings, label: "Profile" },
] as const;

export function ParentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const activeTab = NAV_ITEMS.find((item) => location.pathname === item.path)?.path || "/parent";

  // PWA install
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  useState(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  });

  // Offline sync
  useState(() => {
    const sync = async () => {
      if (!navigator.onLine) return;
      try {
        const result = await processSyncQueue(async (item) => {
          if (item.type === "attendance") await api.post("/api/school/attendance/batch", item.payload);
          else if (item.type === "fee-payment") await api.post("/api/school/fees/payments", item.payload);
        });
        if (result.synced > 0) toast.success(`Synced ${result.synced} item${result.synced > 1 ? "s" : ""}`, { duration: 3000 });
      } catch {}
    };
    window.addEventListener("online", sync);
    sync();
    return () => window.removeEventListener("online", sync);
  });

  const handleInstall = useCallback(() => {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    (installPrompt as any).userChoice.then(() => setInstallPrompt(null));
  }, [installPrompt]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: CREAM, fontFamily: "'DM Sans', sans-serif" }}>
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-30"
        style={{ background: "rgba(248,249,250,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold" style={{ background: NAVY, color: CREAM }}>S</div>
          <div>
            <span className="text-sm font-semibold" style={{ color: NAVY }}>SchoolOS</span>
            <p className="text-[10px]" style={{ color: MUTED }}>{user?.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {installPrompt && (
            <button onClick={handleInstall} className="text-[11px] font-medium px-3 py-1.5 rounded-lg" style={{ background: NAVY, color: CREAM }}>
              Install
            </button>
          )}
          <button onClick={() => logout()} className="p-2 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.08)" }}>
            <LogOut size={15} color={MUTED} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 px-2 py-2"
        style={{ background: "rgba(248,249,250,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(10,36,114,0.07)" }}>
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all active:scale-90"
                style={{ color: isActive ? NAVY : MUTED }}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
