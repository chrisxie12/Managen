import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard, Users, GraduationCap, ShieldCheck, School,
  CalendarCheck, NotebookPen, FileSpreadsheet, Wallet, Receipt,
  Megaphone, Sliders, Lock, UserCircle, LogOut, HelpCircle,
  ChevronLeft, PanelRightClose, GraduationCap as Logo, Clock,
} from "lucide-react";
import { useAuth } from "../../app/contexts/AuthContext";
import { useUserPreferences } from "../../app/contexts/UserPreferencesContext";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";
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
      { icon: NotebookPen, label: "Gradebook & SBA", path: "/dashboard/gradebook" },
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

export function ManaGenSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, school, logout } = useAuth();
  const { preferences } = useUserPreferences();
  const recentItems = preferences.recentItems;

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

  return (
    <aside
      className="flex flex-col flex-shrink-0 overflow-y-auto"
      style={{
        width: 240,
        background: SIDEBAR_BG,
        borderRight: "1px solid rgba(10,36,114,0.07)",
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center gap-2 px-5 py-6 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` }}>
            <Logo size={17} color={CREAM} />
          </div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.1 }}>Managen</div>
            <div style={{ color: MUTED, fontSize: "0.68rem" }}>{school?.name || "Dashboard"}</div>
          </div>
        </div>

        <div className="mx-4 mb-4" style={{ height: 1, background: `rgba(10,36,114,0.07)` }} />

        {/* Recent Items */}
        {recentItems.length > 0 && (
          <div className="px-3 mb-2">
            <p className="px-3 mb-1.5 uppercase tracking-widest" style={{ color: MUTED, fontSize: "0.63rem" }}>
              Recent
            </p>
            <div className="flex flex-col gap-0.5">
              {recentItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-3 px-3 py-1.5 rounded-xl w-full text-left transition-all active:scale-95"
                  style={{ color: NAVY_LIGHT }}
                >
                  <Clock size={13} className="shrink-0" style={{ opacity: 0.5 }} />
                  <span style={{ fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="mx-3 mt-1" style={{ height: 1, background: `rgba(10,36,114,0.07)` }} />
          </div>
        )}

        {/* Navigation */}
        <div className="flex-1 px-3 overflow-y-auto">
          {navSections.map((section) => {
            const sectionActive = section.items.some((item) => isActive(item.path));
            return (
              <div key={section.heading} className="mb-4">
                <p className="px-3 mb-1.5 uppercase tracking-widest" style={{
                  color: sectionActive ? NAVY : MUTED,
                  fontSize: "0.63rem",
                  fontWeight: sectionActive ? 600 : 400,
                }}>
                  {section.heading}
                </p>
                <div className="flex flex-col gap-0.5">
                  {section.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <button key={item.path} onClick={() => { if (!item.future) navigate(item.path); }}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left transition-all active:scale-95"
                        style={{
                          background: active ? NAVY : "transparent",
                          color: active ? CREAM : item.future ? MUTED : NAVY_LIGHT,
                          opacity: item.future ? 0.45 : 1,
                          cursor: item.future ? "not-allowed" : "pointer",
                        }}
                      >
                        <item.icon size={17} className="shrink-0" />
                        <span style={{ fontSize: "0.85rem", fontWeight: active ? 600 : 400, whiteSpace: "nowrap" }}>
                          {item.label}
                        </span>
                        {item.future && (
                          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full"
                            style={{ background: "rgba(10,36,114,0.08)", color: MUTED }}>
                            Soon
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Support */}
        <div className="px-3 mb-2">
          <p className="px-3 mb-1.5 uppercase tracking-widest" style={{ color: MUTED, fontSize: "0.63rem" }}>Support</p>
          <a href="mailto:support@getschoolos.me"
            className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left transition-opacity hover:opacity-70"
            style={{ color: MUTED }}>
            <HelpCircle size={16} />
            <span style={{ fontSize: "0.85rem" }}>Help & Support</span>
          </a>
        </div>

        {/* User footer */}
        <div className="mx-3 mb-4 p-3 rounded-2xl flex items-center gap-3"
          style={{ background: "rgba(10,36,114,0.05)", border: "1px solid rgba(10,36,114,0.07)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` }}>
            <span style={{ color: CREAM, fontSize: "0.8rem", fontWeight: 700 }}>{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ color: NAVY, fontSize: "0.82rem", fontWeight: 600 }} className="truncate">{user?.fullName || "User"}</div>
            <div style={{ color: MUTED, fontSize: "0.72rem" }}>{roleLabel}</div>
          </div>
          <button onClick={handleLogout} className="hover:opacity-70 transition-opacity shrink-0">
            <LogOut size={15} color={MUTED} />
          </button>
        </div>
      </div>
    </aside>
  );
}
