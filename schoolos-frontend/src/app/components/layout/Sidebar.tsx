import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { getNavigation, UserRole } from "../../config/navigation";
import { LogOut } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

// ─── Original SchoolOS palette ────────────────────────────────────────────────
const BLUE   = "#0080FF";
const NAVY   = "#031B4E";
const NAVY_L = "#0069D9";
const CREAM  = "#F8F9FC";
const BLUE_BG = "#EFF6FF";   // active nav background
const BORDER = "#E5E7EB";
const TP     = "#111827";    // text-primary
const TS     = "#6B7280";    // text-secondary
const TM     = "#9CA3AF";    // text-muted
const SH     = "#F8F9FC";    // surface-hover

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

// ─── Collapsed (icon-only) mode ───────────────────────────────────────────────
function CollapsedSidebar({ role, onClose }: { role: UserRole; onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const navigation = getNavigation(role);
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <aside style={{ width: 64, background: "#fff", borderRight: `1px solid ${BORDER}`, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "12px 0", gap: 2, flexShrink: 0 }}>
      {/* Logo mark */}
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${NAVY},${BLUE})`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
        <span style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>S</span>
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
                      background: active ? BLUE_BG : "transparent",
                      borderLeft: `3px solid ${active ? BLUE : "transparent"}`,
                      color: active ? BLUE : TS,
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      opacity: isDisabled ? 0.4 : 1,
                      transition: "all 0.15s ease",
                      border: "none",
                      borderLeft: `3px solid ${active ? BLUE : "transparent"}`,
                    }}
                    onMouseEnter={(e) => { if (!active && !isDisabled) (e.currentTarget as HTMLElement).style.background = SH; }}
                    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    <Icon size={19} strokeWidth={active ? 2 : 1.5} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="right" sideOffset={8}
                    style={{ background: NAVY, color: "#fff", fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 6, zIndex: 100 }}>
                    {item.label}{isDisabled ? " (Soon)" : ""}
                    <Tooltip.Arrow style={{ fill: NAVY }} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          );
        })
      )}

      <div style={{ marginTop: "auto", paddingBottom: 8 }}>
        <button onClick={() => logout()}
          style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: TM, cursor: "pointer", transition: "all 0.15s" }}
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

  if (collapsed) return <CollapsedSidebar role={role} onClose={onClose} />;

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleNav = (path: string) => { navigate(path); onClose?.(); };

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SA";
  const userRoleStr = (user?.role || role).replace(/[-_]/g, " ");

  return (
    <aside style={{ width: 220, background: "#fff", borderRight: `1px solid ${BORDER}`, height: "100vh", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>

      {/* ── Logo ── */}
      <div style={{ height: 56, padding: "0 18px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${NAVY},${BLUE})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ color: "#fff", fontSize: 13, fontWeight: 800 }}>S</span>
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: TP, letterSpacing: "-0.01em", lineHeight: 1.2 }}>
            School<span style={{ background: `linear-gradient(135deg,${BLUE},${NAVY_L})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>OS</span>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: TM, letterSpacing: "0.06em", textTransform: "uppercase" }}>School Management</div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "6px 10px", scrollbarWidth: "thin", scrollbarColor: `${BORDER} transparent` }}>
        {navigation.map((section) => (
          <div key={section.id} style={{ marginBottom: 2 }}>
            {/* Group label */}
            <div style={{ padding: "14px 10px 5px", fontSize: 10, fontWeight: 700, color: TM, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              {section.label}
            </div>

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
                    height: 38,
                    padding: active ? "0 10px 0 7px" : "0 10px",
                    marginBottom: 1,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    color: active ? BLUE : TS,
                    background: active ? BLUE_BG : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${active ? BLUE : "transparent"}`,
                    opacity: isDisabled ? 0.45 : 1,
                    transition: "all 0.12s ease",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (!active && !isDisabled) {
                      (e.currentTarget as HTMLElement).style.background = SH;
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
                  <Icon size={17} strokeWidth={active ? 2 : 1.5} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.label}
                  </span>
                  {isDisabled && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#F59E0B", background: "#FFFBEB", padding: "2px 5px", borderRadius: 4, letterSpacing: "0.04em", flexShrink: 0 }}>
                      SOON
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Upgrade CTA ── */}
      <div style={{ padding: "0 10px 10px", flexShrink: 0 }}>
        <div style={{ background: `${BLUE}0A`, border: `1px solid ${BLUE}25`, borderRadius: 12, padding: "14px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TP, marginBottom: 2 }}>Upgrade to Pro</div>
          <div style={{ fontSize: 11, color: TS, marginBottom: 10 }}>5 days left in trial</div>
          <div style={{ height: 3, background: `${BLUE}20`, borderRadius: 2, marginBottom: 10 }}>
            <div style={{ width: "70%", height: "100%", background: BLUE, borderRadius: 2 }} />
          </div>
          <button
            onClick={() => navigate("/dashboard/billing")}
            style={{ width: "100%", height: 32, background: NAVY, color: "#fff", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = BLUE; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = NAVY; }}
          >
            Upgrade Now
          </button>
        </div>
      </div>

      {/* ── Bottom ── */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "8px 10px 10px", flexShrink: 0, display: "flex", flexDirection: "column", gap: 1 }}>
        {/* Logout */}
        <button
          onClick={() => logout()}
          style={{ height: 36, display: "flex", alignItems: "center", gap: 9, padding: "0 10px", borderRadius: 8, background: "transparent", border: "none", cursor: "pointer", color: TS, width: "100%", transition: "all 0.12s", textAlign: "left" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#EF4444"; (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = TS; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <LogOut size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 400 }}>Log out</span>
        </button>

        {/* User */}
        <button
          onClick={() => navigate("/dashboard/profile")}
          style={{ height: 46, display: "flex", alignItems: "center", gap: 9, padding: "0 6px", background: "transparent", border: "none", cursor: "pointer", borderRadius: 10, width: "100%", transition: "background 0.12s", textAlign: "left" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = SH; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${NAVY},${BLUE})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>{initials}</span>
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: TP, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.fullName || "User"}</div>
            <div style={{ fontSize: 11, color: TS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "capitalize" }}>{userRoleStr}</div>
          </div>
          <span style={{ flexShrink: 0, fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 4, background: `linear-gradient(135deg,${NAVY},${BLUE})`, color: "#fff", letterSpacing: "0.04em" }}>
            PRO
          </span>
        </button>
      </div>
    </aside>
  );
}
