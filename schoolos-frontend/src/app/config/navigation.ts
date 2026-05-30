/**
 * African Command Center Navigation Structure
 * Role-based navigation for SchoolOS v2.0
 */

import {
  BarChart3,
  Users,
  BookOpen,
  DollarSign,
  MessageSquare,
  Settings,
  Zap,
  FileText,
  Home,
  LayoutDashboard,
  UserPlus,
  Upload,
  Banknote,
  Receipt,
  Wallet,
  Coins,
  CheckCircle,
  Grid3x3,
  Target,
  MessageCircle,
  Send,
  Bus,
  Package,
  Building,
  Shield,
  Palette,
  Plug,
} from "lucide-react";

export type UserRole = "super-admin" | "school-admin" | "teacher" | "bursar" | "parent" | "admin" | "school_admin" | "headmaster" | "accountant" | string;

export interface NavSection {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  status?: "active" | "coming-soon";
  subsections?: NavItem[];
}

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
  status?: "active" | "coming-soon";
}

// Super Admin Navigation (SaaS Operator)
export const superAdminNav: NavSection[] = [
  {
    id: "africa-pulse",
    label: "AFRICA PULSE",
    icon: Zap,
    status: "active",
    subsections: [
      { id: "dashboard", label: "Dashboard", path: "/admin/dashboard" },
      { id: "revenue-analytics", label: "Revenue Analytics", path: "/admin/revenue" },
      { id: "growth-funnel", label: "Growth Funnel", path: "/admin/growth" },
      { id: "system-health", label: "System Health", path: "/admin/health" },
    ],
  },
  {
    id: "schools",
    label: "SCHOOLS",
    icon: Home,
    status: "active",
    subsections: [
      { id: "all-schools", label: "All Schools", path: "/admin/schools" },
      { id: "onboarding", label: "Onboarding Pipeline", path: "/admin/onboarding" },
      { id: "school-groups", label: "School Groups", path: "/admin/groups" },
      { id: "suspended", label: "Suspended / Churned", path: "/admin/suspended" },
    ],
  },
  {
    id: "african-finance",
    label: "AFRICAN FINANCE",
    icon: DollarSign,
    status: "coming-soon",
    subsections: [
      { id: "momo-settlement", label: "MoMo Settlement", path: "/admin/momo" },
      { id: "paystack", label: "Paystack / Flutterwave", path: "/admin/paystack" },
      { id: "mpesa", label: "M-Pesa", path: "/admin/mpesa" },
      { id: "exchange", label: "Currency Exchange", path: "/admin/exchange" },
    ],
  },
  {
    id: "integrations",
    label: "AFRICAN INTEGRATIONS",
    icon: Zap,
    status: "coming-soon",
    subsections: [
      { id: "whatsapp", label: "WhatsApp Business API", path: "/admin/whatsapp" },
      { id: "arkesel", label: "Arkesel SMS", path: "/admin/arkesel" },
      { id: "termii", label: "Termii SMS", path: "/admin/termii" },
      { id: "africas-talking", label: "Africa's Talking", path: "/admin/africas-talking" },
      { id: "momo-api", label: "MoMo API", path: "/admin/momo-api" },
    ],
  },
  {
    id: "platform",
    label: "PLATFORM",
    icon: Settings,
    status: "active",
    subsections: [
      { id: "plans", label: "Plans & Pricing", path: "/admin/plans" },
      { id: "feature-flags", label: "Feature Flags", path: "/admin/features" },
      { id: "themes", label: "System Themes", path: "/admin/themes" },
      { id: "email", label: "Email Templates", path: "/admin/email" },
    ],
  },
];

// School Admin Navigation (Headmaster / Proprietor) - Executive Pro
export const schoolAdminNav: NavSection[] = [
  {
    id: "command-center",
    label: "COMMAND CENTER",
    icon: LayoutDashboard,
    status: "active",
    subsections: [
      { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { id: "quick-actions", label: "Quick Actions", path: "/dashboard/actions", icon: Zap },
    ],
  },
  {
    id: "students",
    label: "STUDENTS",
    icon: Users,
    status: "active",
    subsections: [
      { id: "all-students", label: "All Students", path: "/dashboard/students", icon: Users },
      { id: "add-student", label: "Add Student", path: "/dashboard/students/add", icon: UserPlus },
      { id: "import", label: "Import CSV", path: "/dashboard/students/import", icon: Upload },
    ],
  },
  {
    id: "fees",
    label: "FEES & FINANCE",
    icon: Banknote,
    status: "active",
    subsections: [
      { id: "collect", label: "Collect Fees", path: "/dashboard/fees/collect", icon: Banknote },
      { id: "fee-reports", label: "Fee Reports", path: "/dashboard/fees/reports", icon: Receipt },
      { id: "expenses", label: "Expenses", path: "/dashboard/expenses", icon: Wallet },
      { id: "payroll", label: "Payroll", path: "/dashboard/payroll", icon: Coins },
    ],
  },
  {
    id: "academics",
    label: "ACADEMICS",
    icon: CheckCircle,
    status: "active",
    subsections: [
      { id: "attendance", label: "Attendance", path: "/dashboard/attendance", icon: CheckCircle },
      { id: "assessments", label: "Assessments", path: "/dashboard/assessments", icon: Grid3x3 },
      { id: "report-cards", label: "Report Cards", path: "/dashboard/report-cards", icon: FileText },
      { id: "bece-prep", label: "BECE Prep", path: "/dashboard/bece-prep", icon: Target },
    ],
  },
  {
    id: "communication",
    label: "COMMUNICATION",
    icon: MessageCircle,
    status: "active",
    subsections: [
      { id: "whatsapp", label: "WhatsApp Reports", path: "/dashboard/whatsapp", icon: MessageCircle },
      { id: "send-notice", label: "Send Notice", path: "/dashboard/notices", icon: Send },
    ],
  },
  {
    id: "operations",
    label: "OPERATIONS",
    icon: BookOpen,
    status: "active",
    subsections: [
      { id: "library", label: "Library", path: "/dashboard/library", icon: BookOpen },
      { id: "hostel", label: "Hostel", path: "/dashboard/hostel", icon: Home },
      { id: "transport", label: "Transport", path: "/dashboard/transport", icon: Bus },
      { id: "inventory", label: "Inventory", path: "/dashboard/inventory", icon: Package },
    ],
  },
  {
    id: "settings",
    label: "SETTINGS",
    icon: Settings,
    status: "active",
    subsections: [
      { id: "profile", label: "School Profile", path: "/dashboard/setup/profile", icon: Building },
      { id: "users", label: "Users & Roles", path: "/dashboard/setup/staff", icon: Shield },
      { id: "theme", label: "Theme", path: "/dashboard/setup/branding", icon: Palette },
      { id: "integrations", label: "Integrations", path: "/dashboard/setup/integrations", icon: Plug },
    ],
  },
];

// Teacher Navigation
export const teacherNav: NavSection[] = [
  {
    id: "my-day",
    label: "MY DAY",
    icon: BarChart3,
    status: "active",
    subsections: [
      { id: "dashboard", label: "Dashboard", path: "/dashboard/teacher" },
      { id: "timetable", label: "My Timetable", path: "/dashboard/teacher/timetable" },
      { id: "attendance", label: "Mark Attendance", path: "/dashboard/teacher/attendance" },
      { id: "grades", label: "Enter Grades", path: "/dashboard/teacher/grades" },
    ],
  },
  {
    id: "my-students",
    label: "MY STUDENTS",
    icon: Users,
    status: "active",
    subsections: [
      { id: "class-list", label: "Class List", path: "/dashboard/teacher/students" },
      { id: "homework", label: "Homework & Assignments", path: "/dashboard/teacher/homework" },
    ],
  },
  {
    id: "communication",
    label: "COMMUNICATION",
    icon: MessageSquare,
    status: "active",
    subsections: [
      { id: "class-notice", label: "Send Class Notice", path: "/dashboard/teacher/notices" },
      { id: "parent-messages", label: "Parent Messages", path: "/dashboard/teacher/messages" },
    ],
  },
];

// Bursar Navigation
export const bursarNav: NavSection[] = [
  {
    id: "daily-cash",
    label: "DAILY CASH",
    icon: DollarSign,
    status: "active",
    subsections: [
      { id: "collect", label: "Collect Fees", path: "/dashboard/bursar/collect" },
      { id: "today", label: "Today's Collections", path: "/dashboard/bursar/today" },
      { id: "outstanding", label: "Outstanding Fees", path: "/dashboard/bursar/outstanding" },
      { id: "reports", label: "Fee Reports", path: "/dashboard/bursar/reports" },
    ],
  },
  {
    id: "finance",
    label: "FINANCE",
    icon: BarChart3,
    status: "active",
    subsections: [
      { id: "revenue", label: "Revenue Analytics", path: "/dashboard/bursar/revenue" },
      { id: "expenses", label: "Expenses", path: "/dashboard/bursar/expenses" },
      { id: "payroll", label: "Payroll", path: "/dashboard/bursar/payroll" },
      { id: "reconciliation", label: "Reconciliation", path: "/dashboard/bursar/reconciliation" },
    ],
  },
];

// Get navigation for a specific role
export function getNavigation(role: string): NavSection[] {
  switch (role) {
    case "super-admin":
    case "superadmin":
      return superAdminNav;
    case "school-admin":
    case "school_admin":
    case "admin":
    case "headmaster":
      return schoolAdminNav;
    case "teacher":
      return teacherNav;
    case "bursar":
    case "accountant":
      return bursarNav;
    case "parent":
      return [];
    default:
      return [];
  }
}

// Flatten navigation to get all items with paths
export function getAllNavItems(role: UserRole): Array<NavItem & { section: string }> {
  const nav = getNavigation(role);
  const items: Array<NavItem & { section: string }> = [];

  nav.forEach((section) => {
    if (section.subsections) {
      section.subsections.forEach((item) => {
        items.push({
          ...item,
          section: section.label,
        });
      });
    }
  });

  return items;
}

// Quick commands for Cmd+K search
export function getQuickCommands(role: UserRole) {
  const navItems = getAllNavItems(role);
  return navItems.map((item) => ({
    id: item.id,
    title: item.label,
    category: item.section,
    shortcut: "Cmd+K",
    action: () => {
      // Navigate to path
      window.location.pathname = item.path;
    },
  }));
}
