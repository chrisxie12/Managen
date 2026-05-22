
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getNavigation, UserRole } from "../../config/navigation";
import { GraduationCap, ChevronRight, Bell } from "lucide-react";
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
      className={`fixed inset-y-0 left-0 ${sidebarWidth} bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto h-screen scrollbar-thin transition-all duration-200 z-50`}
    >
      {/* Header */}
      <div className={`h-14 px-4 flex items-center gap-3 border-b border-slate-800 flex-shrink-0 ${collapsed ? "justify-center px-0" : ""}`}>
        <GraduationCap className="w-7 h-7 text-white flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="text-white font-semibold text-base tracking-tight truncate">SchoolOS</span>
            <span className="ml-auto flex-shrink-0 text-[10px] bg-primary-600 text-white px-1.5 py-0.5 rounded font-medium">Pro</span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-1 ${collapsed ? "px-2" : "px-3"} py-2 space-y-0.5`}>
        {navigation.map((section) => (
          <div key={section.id} className="mb-2">
            {/* Group Label */}
            {!collapsed && (
              <div className="px-3 pt-5 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
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
                                  ? "bg-slate-800 border-l-[3px] border-primary-500"
                                  : "hover:bg-slate-800/50"
                              }`}
                            >
                              <Icon className={`w-[18px] h-[18px] stroke-[2] ${active ? "text-white" : "text-slate-400"}`} />
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              side="right"
                              sideOffset={8}
                              className="z-50 text-white text-xs font-medium bg-slate-800 px-2 py-1 rounded shadow-lg"
                            >
                              {item.label}
                              {isDisabled && " (Soon)"}
                              <Tooltip.Arrow className="fill-slate-800" />
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
                        isDisabled ? "opacity-50 cursor-not-allowed text-slate-500" : "cursor-pointer"
                      } ${
                        active
                          ? "bg-slate-800 text-white border-l-[3px] border-primary-500 -ml-[3px]"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-slate-200"
                      }`}
                    >
                      <Icon className={`w-[18px] h-[18px] stroke-[2] ${active ? "text-white" : "text-slate-400"}`} />
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
      <div className="mt-auto border-t border-slate-800 px-3 py-3 space-y-0.5 flex-shrink-0">
        {!collapsed && (
          <button className="w-full h-9 px-3 flex items-center gap-2.5 rounded-md text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 transition-colors duration-150 mb-2">
            <Bell className="w-[18px] h-[18px] stroke-[2] text-slate-400" />
            <span className="text-[13px] font-medium">Notifications</span>
            <div className="w-2 h-2 rounded-full bg-red-500 ml-auto" />
          </button>
        )}
        
        <button className={`w-full ${collapsed ? "h-12 justify-center px-0" : "h-10 px-2 gap-3"} flex items-center rounded-md hover:bg-slate-800/50 transition-colors`}>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white font-medium flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <>
              <div className="text-left overflow-hidden">
                <div className="text-[13px] text-white font-medium truncate">{user?.fullName || "Kofi Mensah"}</div>
                <div className="text-[11px] text-slate-500 truncate capitalize">{userRoleStr}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 ml-auto flex-shrink-0" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
