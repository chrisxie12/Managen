import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, Users, GraduationCap, ShieldCheck, School,
  CalendarCheck, NotebookPen, FileSpreadsheet, Wallet, Receipt,
  Megaphone, Sliders, Lock, UserCircle, LogOut, HelpCircle,
  ChevronLeft, PanelRightClose, GraduationCap as Logo,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";
const SIDEBAR_BG = "#F9F1E7";

type NavItem = {
  icon: any;
  label: string;
  path: string;
  future?: boolean;
};

type NavSection = {
  heading: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    heading: "Main",
    items: [{ icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" }],
  },
  {
    heading: "People Hub",
    items: [
      { icon: Users, label: "Students", path: "/dashboard/students" },
      { icon: GraduationCap, label: "Teachers & Staff", path: "/dashboard/staff" },
      { icon: ShieldCheck, label: "Guardians", path: "/dashboard/parents" },
    ],
  },
  {
    heading: "Academics & NaCCA",
    items: [
      { icon: School, label: "Classes & Tiers", path: "/dashboard/classes" },
      { icon: CalendarCheck, label: "Attendance", path: "/dashboard/attendance" },
      { icon: NotebookPen, label: "Gradebook & SBA", path: "/dashboard/gradebook", future: true },
      { icon: FileSpreadsheet, label: "Terminal Report Cards", path: "/dashboard/reports", future: true },
    ],
  },
  {
    heading: "Financial Ledger",
    items: [
      { icon: Wallet, label: "Fee Collections", path: "/dashboard/fees" },
      { icon: Receipt, label: "Invoices & Accounts", path: "/dashboard/invoices" },
    ],
  },
  {
    heading: "Communications",
    items: [{ icon: Megaphone, label: "Broadcast & Notice Board", path: "/dashboard/communication" }],
  },
  {
    heading: "System Administration",
    items: [
      { icon: Sliders, label: "School Settings", path: "/dashboard/settings" },
      { icon: Lock, label: "Security & Roles", path: "/dashboard/roles" },
      { icon: UserCircle, label: "My Profile", path: "/dashboard/profile" },
    ],
  },
];

const roleLabels: Record<string, string> = {
  school_admin: "Administrator",
  admin: "Administrator",
  headmaster: "Headmaster",
  accountant: "Accountant",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
};

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, school, logout } = useAuth();

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SA";
  const roleLabel = roleLabels[user?.role || ""] || "Administrator";

  const isActive = (path: string) => {
    if (path === "/dashboard/admin") {
      return location.pathname === "/dashboard/admin" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleNavigate = (item: NavItem) => {
    if (item.future) return;
    navigate(item.path);
    onMobileClose();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-6 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
          <Logo size={17} color={MILK} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.1 }}>Managen</div>
            <div style={{ color: MUTED, fontSize: "0.68rem" }}>{school?.name || "Dashboard"}</div>
          </div>
        )}
      </div>

      <div className="mx-4 mb-4" style={{ height: 1, background: `rgba(56,25,50,0.07)` }} />

      {/* Navigation */}
      <div className="flex-1 px-3 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.heading} className="mb-4">
            {!collapsed && (
              <p className="px-3 mb-1.5 uppercase tracking-widest" style={{ color: MUTED, fontSize: "0.63rem" }}>
                {section.heading}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <button key={item.path} onClick={() => handleNavigate(item)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left transition-all active:scale-95 relative group"
                    style={{
                      background: active ? PLUM : "transparent",
                      color: active ? MILK : item.future ? MUTED : PLUM_LIGHT,
                      opacity: item.future ? 0.45 : 1,
                      cursor: item.future ? "not-allowed" : "pointer",
                    }}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={17} className="shrink-0" />
                    {!collapsed && (
                      <>
                        <span style={{ fontSize: "0.85rem", fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>
                          {item.label}
                        </span>
                        {item.future && (
                          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(56,25,50,0.08)", color: MUTED }}>
                            Soon
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Support */}
      {!collapsed && (
        <div className="px-3 mb-2">
          <p className="px-3 mb-1.5 uppercase tracking-widest" style={{ color: MUTED, fontSize: "0.63rem" }}>Support</p>
          <a href="mailto:support@getschoolos.me"
            className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left transition-opacity hover:opacity-70"
            style={{ color: MUTED }}>
            <HelpCircle size={16} />
            <span style={{ fontSize: "0.85rem" }}>Help & Support</span>
          </a>
        </div>
      )}

      {/* User footer */}
      <div className="mx-3 mb-4 p-3 rounded-2xl flex items-center gap-3"
        style={{ background: "rgba(56,25,50,0.05)", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
          <span style={{ color: MILK, fontSize: "0.8rem", fontWeight: 700 }}>{initials}</span>
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div style={{ color: PLUM, fontSize: "0.82rem", fontWeight: 600 }} className="truncate">{user?.fullName || "User"}</div>
              <div style={{ color: MUTED, fontSize: "0.72rem" }}>{roleLabel}</div>
            </div>
            <button onClick={handleLogout} className="hover:opacity-70 transition-opacity shrink-0">
              <LogOut size={15} color={MUTED} />
            </button>
          </>
        )}
        {collapsed && (
          <button onClick={handleLogout} className="hover:opacity-70 transition-opacity mx-auto">
            <LogOut size={15} color={MUTED} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto transition-all duration-200"
        style={{
          background: SIDEBAR_BG,
          borderRight: "1px solid rgba(56,25,50,0.07)",
          width: collapsed ? 72 : 240,
        }}
      >
        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          className="absolute z-10 -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center hidden lg:flex"
          style={{ background: PLUM, color: MILK, border: `2px solid ${MILK}` }}
        >
          {collapsed ? <PanelRightClose size={12} /> : <ChevronLeft size={12} />}
        </button>
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onMobileClose} />
          <aside
            className="relative w-72 h-full overflow-y-auto flex flex-col"
            style={{ background: SIDEBAR_BG }}
          >
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
