import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Shield, LayoutDashboard, Building2, CreditCard, LogOut, Menu, X } from "lucide-react";

const DARK = "#080810";
const CARD_BG = "#0f0f1a";
const BORDER = "rgba(255,255,255,0.07)";
const ACCENT = "#ff6b35";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/superadmin" },
  { icon: Building2, label: "Schools", path: "/superadmin/schools" },
  { icon: CreditCard, label: "Billing", path: "/superadmin/billing" },
];

export function SuperAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/superadmin" ? location.pathname === "/superadmin" : location.pathname.startsWith(path);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-6 cursor-pointer" onClick={() => navigate("/superadmin")}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: ACCENT }}>
          <Shield size={17} color="white" />
        </div>
        <div>
          <div style={{ color: "white", fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.1 }}>SchoolOS</div>
          <div style={{ color: "#64748b", fontSize: "0.68rem" }}>Super Admin</div>
        </div>
      </div>

      <div style={{ height: 1, background: BORDER, margin: "0 16px 16px" }} />

      <div className="flex-1 px-3 flex flex-col gap-1">
        <p className="px-3 mb-2 uppercase tracking-widest" style={{ color: "#64748b", fontSize: "0.65rem" }}>Platform</p>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button key={item.path} onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-left transition-all"
              style={{ background: active ? `${ACCENT}20` : "transparent", color: active ? ACCENT : "#94a3b8" }}>
              <item.icon size={17} />
              <span style={{ fontSize: "0.9rem", fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ margin: "0 12px 12px", padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div className="flex items-center gap-2">
          <img src="/schoolos-logo.svg" alt="SchoolOS" style={{ height: "28px", width: "auto", filter: "brightness(0) invert(1)" }} />
          <span style={{ color: "#e2e8f0", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "-0.01em" }}>SchoolOS</span>
        </div>
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: "12px" }}>
          <button onClick={() => { document.cookie = "schoolos_admin_token=; path=/api/superadmin; max-age=0"; navigate("/auth"); }}
            className="flex items-center gap-2 w-full text-left hover:opacity-70" style={{ color: "#64748b", fontSize: "0.82rem" }}>
            <LogOut size={14} /> Back to App
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: DARK, color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>
      <aside className="hidden lg:flex flex-col w-60 flex-shrink-0" style={{ background: CARD_BG, borderRight: `1px solid ${BORDER}` }}>
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <aside className="relative w-64 flex flex-col h-full" style={{ background: CARD_BG }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4"><X size={20} color="#64748b" /></button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4" style={{ background: CARD_BG, borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu size={22} color="#94a3b8" /></button>
            <h1 style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              {navItems.find((n) => isActive(n.path))?.label || "Super Admin"}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
