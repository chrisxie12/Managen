import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { getNavigation, UserRole } from "../../config/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

// ─── Design tokens ────────────────────────────────────────────────────────────
const FOREST    = "#0B4F30";
const GOLD      = "#D4A017";
const ACCENT    = "#F0FDF4";
const BORDER    = "#E7E5E4";
const TP        = "#1C1917";   // text-primary
const TS        = "#78716C";   // text-secondary
const TM        = "#A8A29E";   // text-muted
const SURFACE_H = "#FAFAF9";   // surface-hover

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

// ─── Collapsed (icon-only) sidebar ───────────────────────────────────────────
function CollapsedSidebar({ role, onClose }: { role: UserRole; onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const navigation = getNavigation(role);

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside style={{ width: 64, background: "#fff", borderRight: `1px solid ${BORDER}`, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 4, flexShrink: 0 }}>
      {/* Logo mark */}
      <div style={{ width: 36, height: 36, borderRadius: 10, background: FOREST, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 800 }}>S</span>
      </div>

      {navigation.map((section) =>
        section.subsections?.map((item) => {
          const active = isActive(item.path);
          const isDisabled = item.status === "coming-soon";
          const Icon = item.icon || section.icon;
          return (
            <Tooltip.Provider key={item.id} delayDuration={150}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => { if (!isDisabled) { navigate(item.path); onClose?.(); } }}
                    disabled={isDisabled}
                    style={{
                      width: 40, height: 40, borderRadius: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: active ? ACCENT : "transparent",
                      border: active ? `1px solid ${FOREST}20` : "1px solid transparent",
                      color: active ? FOREST : TS,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.4 : 1,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => { if (!active && !isDisabled) (e.currentTarget as HTMLElement).style.background = SURFACE_H; }}
                    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="right" sideOffset={8}
                    style={{ background: TP, color: "#fff", fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 6, zIndex: 100 }}>
                    {item.label}{isDisabled ? " (Soon)" : ""}
                    <Tooltip.Arrow style={{ fill: TP }} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          );
        })
      )}

      <div style={{ marginTop: "auto" }}>
        <button onClick={() => logout()} style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: TM, cursor: "pointer", transition: "all 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#EF4444"; (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = TM; (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <LogOut size={18} strokeWidth={1.5} />
        </button>
      </div>
    </aside>
  );
}

// ─── Full sidebar ─────────────────────────────────────────────────────────────
export function Sidebar({ role, onClose, collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigation = getNavigation(role);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  if (collapsed) return <CollapsedSidebar role={role} onClose={onClose} />;

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const toggleSection = (id: string) =>
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SA";
  const userRoleStr = (user?.role || role).replace(/[-_]/g, " ");

  return (
    <aside
      style={{
        width: 220,
        background: "#FFFFFF",
        borderRight: `1px solid ${BORDER}`,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {/* ── Logo ── */}
      <div style={{ height: 56, padding: "0 20px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: FOREST, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>S</span>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: TP, letterSpacing: "-0.01em", lineHeight: 1.2 }}>SchoolOS</div>
          <div style={{ fontSize: 10, fontWeight: 600, color: TM, letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1 }}>School Management</div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 12px", scrollbarWidth: "thin", scrollbarColor: `${BORDER} transparent` }}>
        {navigation.map((section) => {
          const isExpanded = expandedSections.includes(section.id);
          const hasChildren = section.subsections && section.subsections.length > 0;

          return (
            <div key={section.id} style={{ marginBottom: 4 }}>
              {/* Group label */}
              <div style={{ padding: "14px 12px 6px", fontSize: 11, fontWeight: 600, color: TM, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {section.label}
              </div>

              {/* Items */}
              {section.subsections?.map((item) => {
                const active = isPathActive(item.path);
                const isDisabled = item.status === "coming-soon";
                const Icon = item.icon || section.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => { if (!isDisabled) handleNav(item.path); }}
                    disabled={isDisabled}
                    style={{
                      width: "100%",
                      height: 40,
                      padding: active ? "0 12px 0 9px" : "0 12px",
                      marginBottom: 2,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      color: active ? FOREST : TS,
                      background: active ? ACCENT : "transparent",
                      borderLeft: `3px solid ${active ? FOREST : "transparent"}`,
                      opacity: isDisabled ? 0.45 : 1,
                      transition: "all 0.15s ease",
                      textAlign: "left",
                      border: "none",
                      borderLeft: `3px solid ${active ? FOREST : "transparent"}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!active && !isDisabled) {
                        (e.currentTarget as HTMLElement).style.background = SURFACE_H;
                        (e.currentTarget as HTMLElement).style.color = TP;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = TS;
                      }
                    }}
                  >
                    <Icon size={18} strokeWidth={active ? 2 : 1.5} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 14, fontWeight: active ? 500 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.label}
                    </span>
                    {isDisabled && (
                      <span style={{ fontSize: 10, fontWeight: 600, color: GOLD, background: "#FFFBEB", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.03em", flexShrink: 0 }}>
                        SOON
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* ── Upgrade Card ── */}
      <div style={{ padding: "0 12px 12px", flexShrink: 0 }}>
        <div style={{ background: "#FFFBEB", border: `1px solid #FEF3C7`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: TP, marginBottom: 2 }}>Upgrade to Pro</div>
          <div style={{ fontSize: 12, color: TS, marginBottom: 10 }}>5 days left in trial</div>
          <div style={{ height: 4, background: "#FEF3C7", borderRadius: 2, marginBottom: 10 }}>
            <div style={{ width: "70%", height: "100%", background: "#F59E0B", borderRadius: 2 }} />
          </div>
          <button
            onClick={() => navigate("/dashboard/billing")}
            style={{ width: "100%", height: 34, background: TP, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#2D2D2D"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = TP; }}
          >
            Upgrade Now
          </button>
        </div>
      </div>

      {/* ── Bottom: Log out + User ── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "10px 12px 12px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Logout */}
        <button
          onClick={() => logout()}
          style={{ height: 38, display: "flex", alignItems: "center", gap: 10, padding: "0 12px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", color: TS, width: "100%", transition: "all 0.15s", textAlign: "left" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#EF4444"; (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = TS; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <LogOut size={18} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 14, fontWeight: 400 }}>Log out</span>
        </button>

        {/* User profile */}
        <button
          onClick={() => navigate("/dashboard/profile")}
          style={{ height: 48, display: "flex", alignItems: "center", gap: 10, padding: "0 8px", background: "transparent", border: "none", cursor: "pointer", borderRadius: 10, width: "100%", transition: "background 0.15s", textAlign: "left" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = SURFACE_H; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg, ${FOREST}, #22C55E)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{initials}</span>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: TP, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fullName || "User"}</div>
            <div style={{ fontSize: 11, color: TS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "capitalize" }}>{userRoleStr}</div>
          </div>
          <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: `linear-gradient(135deg, ${FOREST}, #22C55E)`, color: "#fff", letterSpacing: "0.04em" }}>
            PRO
          </span>
        </button>
      </div>
    </aside>
  );
}
