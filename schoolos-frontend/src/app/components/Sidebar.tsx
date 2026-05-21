import { useNavigate, useLocation } from "react-router";
import {
  Activity, LayoutDashboard, Users, GraduationCap, ShieldCheck, School,
  CalendarCheck, NotebookPen, FileSpreadsheet, Wallet, Receipt,
  Megaphone, Sliders, Lock, UserCircle, LogOut, HelpCircle,
  ChevronLeft, PanelRightClose, GraduationCap as Logo, Clock,
  BarChart3, DoorOpen, CreditCard, Award, UserPlus, Upload,
  Calendar, Target, DollarSign, BookOpen, Home, Bus, Package,
  MessageCircle, MessageSquare, Mic, Palette, Puzzle, Database,
  ArrowDownCircle, TrendingUp, Globe, Smartphone,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useUserPreferences } from "../contexts/UserPreferencesContext";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const AMBER = "#FFBA08";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";
const SIDEBAR_BG = "#F9F1E7";

type NavItem = {
  icon: any;
  label: string;
  path: string;
  future?: boolean;
  badge?: string;
};

type NavSection = {
  heading: string;
  items: NavItem[];
};

const superAdminSections: NavSection[] = [
  {
    heading: "Africa Pulse",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
      { icon: TrendingUp, label: "Revenue Analytics", path: "/dashboard/analytics" },
      { icon: BarChart3, label: "Growth Funnel", path: "/dashboard/analytics", future: true },
      { icon: Activity, label: "System Health", path: "/dashboard/analytics", future: true },
    ],
  },
  {
    heading: "Schools",
    items: [
      { icon: School, label: "All Schools", path: "/dashboard/admin" },
      { icon: UserPlus, label: "Onboarding Pipeline", path: "/dashboard/users", badge: "MoMo" },
      { icon: Users, label: "School Groups", path: "/dashboard/users", future: true },
      { icon: ShieldCheck, label: "Suspended / Churned", path: "/dashboard/roles", future: true },
    ],
  },
  {
    heading: "African Finance",
    items: [
      { icon: Wallet, label: "MoMo Settlement", path: "/dashboard/finance", badge: "MoMo" },
      { icon: Globe, label: "Paystack / Flutterwave", path: "/dashboard/finance" },
      { icon: Smartphone, label: "M-Pesa", path: "/dashboard/finance", future: true },
      { icon: DollarSign, label: "Currency Dashboard", path: "/dashboard/finance", future: true },
    ],
  },
  {
    heading: "African Integrations",
    items: [
      { icon: MessageCircle, label: "WhatsApp", path: "/dashboard/communication", badge: "Live" },
      { icon: MessageSquare, label: "Arkesel / Termii", path: "/dashboard/communication", future: true },
      { icon: Globe, label: "Africa's Talking", path: "/dashboard/communication", future: true },
      { icon: Wallet, label: "MoMo API", path: "/dashboard/finance", future: true },
    ],
  },
  {
    heading: "Platform",
    items: [
      { icon: Sliders, label: "Plans & Pricing", path: "/dashboard/settings" },
      { icon: Puzzle, label: "Feature Flags", path: "/dashboard/settings" },
      { icon: Palette, label: "System Themes", path: "/dashboard/settings" },
      { icon: FileSpreadsheet, label: "Email Templates", path: "/dashboard/settings", future: true },
    ],
  },
];

const headmasterSections: NavSection[] = [
  {
    heading: "Command Center",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/headmaster" },
      { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    ],
  },
  {
    heading: "Front Office",
    items: [
      { icon: DoorOpen, label: "Admission Enquiry", path: "/dashboard/parents", future: true },
      { icon: CreditCard, label: "Student ID Cards", path: "/dashboard/students", future: true },
      { icon: Award, label: "Certificates", path: "/dashboard/report-cards", future: true },
    ],
  },
  {
    heading: "Students",
    items: [
      { icon: Users, label: "All Students", path: "/dashboard/students" },
      { icon: UserPlus, label: "Add Student", path: "/dashboard/students" },
      { icon: Upload, label: "Import Students", path: "/dashboard/bulk-import" },
    ],
  },
  {
    heading: "Academics & NaCCA",
    items: [
      { icon: School, label: "Classes & Subjects", path: "/dashboard/academics" },
      { icon: Calendar, label: "Timetable", path: "/dashboard/timetable-scheduler" },
      { icon: CalendarCheck, label: "Attendance", path: "/dashboard/attendance" },
      { icon: NotebookPen, label: "Continuous Assessment", path: "/dashboard/assessments" },
      { icon: Calendar, label: "Exam Scheduling", path: "/dashboard/assessments" },
      { icon: FileSpreadsheet, label: "Report Cards", path: "/dashboard/report-cards" },
      { icon: Target, label: "BECE / WASSCE Prep", path: "/dashboard/reports", future: true },
    ],
  },
  {
    heading: "Fees & Finance",
    items: [
      { icon: Wallet, label: "Collect Fees", path: "/dashboard/fees", badge: "MoMo" },
      { icon: Receipt, label: "Fee Structure", path: "/dashboard/finance" },
      { icon: BarChart3, label: "Fee Reports", path: "/dashboard/finance" },
      { icon: ArrowDownCircle, label: "Expenses", path: "/dashboard/finance", future: true },
      { icon: DollarSign, label: "Payroll", path: "/dashboard/finance", future: true },
    ],
  },
  {
    heading: "Operations",
    items: [
      { icon: BookOpen, label: "Library", path: "/dashboard/settings", future: true },
      { icon: Home, label: "Hostel", path: "/dashboard/settings", future: true },
      { icon: Bus, label: "Transport", path: "/dashboard/settings", future: true },
      { icon: Package, label: "Inventory", path: "/dashboard/settings", future: true },
    ],
  },
  {
    heading: "African Communication",
    items: [
      { icon: MessageCircle, label: "WhatsApp Reports", path: "/dashboard/communication", badge: "Live" },
      { icon: MessageSquare, label: "SMS Fallback", path: "/dashboard/communication" },
      { icon: Megaphone, label: "Notice Board", path: "/dashboard/communication" },
      { icon: Mic, label: "Voice Notes", path: "/dashboard/communication", future: true },
    ],
  },
  {
    heading: "School Setup",
    items: [
      { icon: Sliders, label: "School Profile", path: "/dashboard/settings" },
      { icon: Users, label: "Classes & Staff", path: "/dashboard/settings" },
      { icon: Palette, label: "Theme & Branding", path: "/dashboard/settings" },
      { icon: GraduationCap, label: "NaCCA Settings", path: "/dashboard/settings" },
      { icon: Puzzle, label: "Integrations", path: "/dashboard/settings" },
      { icon: Database, label: "Data Management", path: "/dashboard/settings" },
    ],
  },
];

const teacherSections: NavSection[] = [
  {
    heading: "My Day",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/teacher" },
      { icon: Calendar, label: "My Timetable", path: "/dashboard/timetable-scheduler" },
      { icon: CalendarCheck, label: "Mark Attendance", path: "/dashboard/attendance" },
      { icon: NotebookPen, label: "Enter Grades", path: "/dashboard/gradebook" },
    ],
  },
  {
    heading: "My Students",
    items: [
      { icon: Users, label: "Class List", path: "/dashboard/students" },
      { icon: UserCircle, label: "Student Profiles", path: "/dashboard/students" },
      { icon: BookOpen, label: "Homework & Assignments", path: "/dashboard/assessments", future: true },
    ],
  },
  {
    heading: "Communication",
    items: [
      { icon: Megaphone, label: "Send Class Notice", path: "/dashboard/communication" },
      { icon: MessageCircle, label: "Parent Messages", path: "/dashboard/communication", badge: "WhatsApp" },
    ],
  },
];

const bursarSections: NavSection[] = [
  {
    heading: "Daily Cash",
    items: [
      { icon: Wallet, label: "Collect Fees", path: "/dashboard/fees", badge: "MoMo" },
      { icon: TrendingUp, label: "Today's Collections", path: "/dashboard/fees" },
      { icon: ShieldCheck, label: "Outstanding Fees", path: "/dashboard/finance" },
      { icon: FileSpreadsheet, label: "Fee Reports", path: "/dashboard/finance" },
    ],
  },
  {
    heading: "Finance",
    items: [
      { icon: BarChart3, label: "Revenue Analytics", path: "/dashboard/analytics" },
      { icon: ArrowDownCircle, label: "Expenses", path: "/dashboard/finance", future: true },
      { icon: DollarSign, label: "Payroll", path: "/dashboard/finance", future: true },
      { icon: Receipt, label: "Reconciliation", path: "/dashboard/finance", future: true },
    ],
  },
];

const roleLabels: Record<string, string> = {
  school_admin: "Administrator",
  admin: "Administrator",
  headmaster: "Headmaster",
  accountant: "Bursar",
  teacher: "Teacher",
  student: "Student",
  parent: "Parent",
  bursar: "Bursar",
};

function useRoleSections(role: string): NavSection[] {
  switch (role) {
    case "school_admin":
    case "admin":
      return superAdminSections;
    case "headmaster":
      return headmasterSections;
    case "teacher":
      return teacherSections;
    case "accountant":
    case "bursar":
      return bursarSections;
    default:
      return headmasterSections;
  }
}

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
  const { preferences, clearRecentItems } = useUserPreferences();
  const recentItems = preferences.recentItems;

  const initials = user?.fullName
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SA";
  const roleLabel = roleLabels[user?.role || ""] || "Administrator";
  const navSections = useRoleSections(user?.role || "");

  const isActive = (path: string) => {
    if (path === "/dashboard/admin" || path === "/dashboard/headmaster" || path === "/dashboard/teacher") {
      return location.pathname === path || location.pathname === "/dashboard";
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
      <div className="flex items-center gap-2 px-5 py-6 cursor-pointer" onClick={() => navigate("/")}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` }}>
          <Logo size={17} color={CREAM} />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.1 }}>Managen</div>
            <div style={{ color: MUTED, fontSize: "0.68rem" }}>{school?.name || "Dashboard"}</div>
          </div>
        )}
      </div>

      <div className="mx-4 mb-4" style={{ height: 1, background: `rgba(10,36,114,0.07)` }} />

      {/* Recent Items */}
      {!collapsed && recentItems.length > 0 && (
        <div className="px-3 mb-2">
          <p className="px-3 mb-1.5 uppercase tracking-widest" style={{ color: MUTED, fontSize: "0.63rem" }}>
            Recent
          </p>
          <div className="flex flex-col gap-0.5">
            {recentItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); onMobileClose(); }}
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
              {!collapsed && (
                <p className="px-3 mb-1.5 uppercase tracking-widest" style={{
                  color: sectionActive ? NAVY : MUTED,
                  fontSize: "0.63rem",
                  fontWeight: sectionActive ? 600 : 400,
                }}>
                  {section.heading}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <button key={item.path + item.label} onClick={() => handleNavigate(item)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left transition-all active:scale-95 relative group"
                      style={{
                        background: active ? NAVY : "transparent",
                        color: active ? CREAM : item.future ? MUTED : NAVY_LIGHT,
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
                          <span className="ml-auto flex items-center gap-1">
                            {item.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                                style={{
                                  background: item.badge === "MoMo" ? "#FFBA08" : item.badge === "Live" ? "#22C55E" : "rgba(10,36,114,0.08)",
                                  color: item.badge === "MoMo" ? "#0A2472" : item.badge === "Live" ? "#FFFFFF" : MUTED,
                                }}>
                                {item.badge}
                              </span>
                            )}
                            {item.future && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                                style={{ background: "rgba(10,36,114,0.08)", color: MUTED }}>
                                Soon
                              </span>
                            )}
                          </span>
                        </>
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
        style={{ background: "rgba(10,36,114,0.05)", border: "1px solid rgba(10,36,114,0.07)" }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` }}>
          <span style={{ color: CREAM, fontSize: "0.8rem", fontWeight: 700 }}>{initials}</span>
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <div style={{ color: NAVY, fontSize: "0.82rem", fontWeight: 600 }} className="truncate">{user?.fullName || "User"}</div>
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
      <aside
        className="hidden lg:flex flex-col flex-shrink-0 overflow-y-auto transition-all duration-200"
        style={{
          background: SIDEBAR_BG,
          borderRight: "1px solid rgba(10,36,114,0.07)",
          width: collapsed ? 72 : 240,
        }}
      >
        <button
          onClick={onToggleCollapse}
          className="absolute z-10 -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center hidden lg:flex"
          style={{ background: NAVY, color: CREAM, border: `2px solid ${CREAM}` }}
        >
          {collapsed ? <PanelRightClose size={12} /> : <ChevronLeft size={12} />}
        </button>
        {sidebarContent}
      </aside>

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
