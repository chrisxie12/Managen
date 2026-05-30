import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../../contexts/AuthContext";
import { getNavigation, UserRole } from "../../config/navigation";
import { ChevronRight, Bell } from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface SidebarProps {
  role: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
  /** Icon-only mode for tablet (md breakpoint) */
  collapsed?: boolean;
}

export function Sidebar({ role, onClose, collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const navigation = getNavigation(role);

  const isPathActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const handleNavigation = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const sidebarWidth = collapsed ? "w-16" : "w-[260px]";

  // User card info
  const initials = user?.fullName
    ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SA";
  const userRoleStr = role.replace("-", " ").replace("_", " ");

  return (
    <aside
      className={`fixed inset-y-0 left-0 ${sidebarWidth} bg-sidebar border-r border-sidebar-border flex flex-col overflow-y-auto h-screen scrollbar-thin transition-all duration-200 z-50`}
    >
      {/* Header */}
      <div className={`h-14 px-4 flex items-center gap-3 border-b border-sidebar-border flex-shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <img src="/schoolos-logo.svg" alt="SchoolOS" className="flex-shrink-0" style={{ height: "32px", width: "auto" }} />
        {!collapsed && (
          <>
            <span className="font-semibold text-base tracking-tight truncate text-sidebar-foreground">
              School<span style={{ background: "linear-gradient(135deg,#0080FF,#0069D9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>OS</span>
            </span>
            <span className="ml-auto flex-shrink-0 text-[10px] bg-sidebar-primary text-sidebar-primary-foreground px-1.5 py-0.5 rounded font-medium">Pro</span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${collapsed ? "px-2" : "px-3"} py-2 space-y-0.5`}>
        {navigation.map((section) => (
          <div key={section.id} className="mb-2">
            {/* Group Label */}
            {!collapsed && (
              <div className="px-3 pt-5 pb-2 text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
                {section.label}
              </div>
            )}

            {/* Flat Items */}
            {section.subsections && (
              <div className="space-y-0.5">
                {section.subsections.map((item) => {
                  const active = isPathActive(item.path);
                  const isDisabled = item.status === "coming-soon";
                  const Icon = item.icon || section.icon;

                  if (collapsed) {
                    return (
                      <Tooltip.Provider key={item.id} delayDuration={200}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              onClick={() => { if (!isDisabled) handleNavigation(item.path); }}
                              disabled={isDisabled}
                              className={`w-full h-10 flex items-center justify-center rounded-md transition-colors duration-150 ${
                                isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                              } ${
                                active
                                  ? "bg-sidebar-accent/20 border-l-[3px] border-sidebar-primary"
                                  : "hover:bg-sidebar-accent/10"
                              }`}
                            >
                              <Icon className={`w-[18px] h-[18px] stroke-[2] ${active ? "text-sidebar-foreground" : "text-sidebar-foreground/50"}`} />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              side="right"
                              sideOffset={8}
                              className="z-50 text-sidebar-foreground text-xs font-medium bg-sidebar border border-sidebar-border px-2 py-1 rounded shadow-lg"
                            >
                              {item.label}
                              {isDisabled && " (Soon)"}
                              <Tooltip.Arrow className="fill-sidebar" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => { if (!isDisabled) handleNavigation(item.path); }}
                      disabled={isDisabled}
                      className={`w-full h-9 px-3 flex items-center gap-2.5 rounded-md transition-colors duration-150 ${
                        isDisabled ? "opacity-50 cursor-not-allowed text-sidebar-foreground/40" : "cursor-pointer"
                      } ${
                        active
                          ? "bg-sidebar-accent/20 text-sidebar-foreground border-l-[3px] border-sidebar-primary pl-[calc(0.75rem-3px)]"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground"
                      }`}
                    >
                      <Icon className={`w-[18px] h-[18px] stroke-[2] ${active ? "text-sidebar-foreground" : "text-sidebar-foreground/50"}`} />
                      <span className="text-[13px] font-medium">{item.label}</span>
                      {isDisabled && (
                        <span className="ml-auto text-[9px] uppercase tracking-wider font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto border-t border-sidebar-border px-3 py-3 space-y-0.5 flex-shrink-0">
        {!collapsed && (
          <button onClick={() => navigate("/dashboard/notifications")} className="w-full h-9 px-3 flex items-center gap-2.5 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/10 hover:text-sidebar-foreground transition-colors duration-150 mb-2">
            <Bell className="w-[18px] h-[18px] stroke-[2] text-sidebar-foreground/50" />
            <span className="text-[13px] font-medium">Notifications</span>
          </button>
        )}

        <button onClick={() => navigate("/dashboard/profile")} className={`w-full ${collapsed ? "h-12 justify-center px-0" : "h-10 px-2 gap-3"} flex items-center rounded-md hover:bg-sidebar-accent/10 transition-colors`}>
          <div className="w-8 h-8 rounded-full bg-sidebar-accent/30 flex items-center justify-center text-xs text-sidebar-foreground font-medium flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="text-left overflow-hidden">
                <div className="text-[13px] text-sidebar-foreground font-medium truncate">{user?.fullName || "User"}</div>
                <div className="text-[11px] text-sidebar-foreground/50 truncate capitalize">{userRoleStr}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-sidebar-foreground/40 ml-auto flex-shrink-0" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
