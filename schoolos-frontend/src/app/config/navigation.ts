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
  UserCog,
  TrendingUp,
  ClipboardList,
  Calendar,
  AlertCircle,
  Truck,
  Library,
  Hotel,
  Briefcase,
  Bell,
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

// School Admin Navigation (Headmaster / Proprietor)
export const schoolAdminNav: NavSection[] = [
  {
    id: "command-center",
    label: "COMMAND CENTER",
    icon: BarChart3,
    status: "active",
    subsections: [
      { id: "dashboard", label: "Dashboard", path: "/dashboard" },
      { id: "analytics", label: "Analytics", path: "/dashboard/analytics", status: "coming-soon" },
    ],
  },
  {
    id: "front-office",
    label: "FRONT OFFICE",
    icon: Briefcase,
    status: "coming-soon",
    subsections: [
      { id: "admission", label: "Admission Enquiry", path: "/dashboard/admission" },
      { id: "id-cards", label: "Student ID Cards", path: "/dashboard/id-cards" },
      { id: "certificates", label: "Certificates", path: "/dashboard/certificates" },
    ],
  },
  {
    id: "students",
    label: "STUDENTS",
    icon: Users,
    status: "active",
    subsections: [
      { id: "all-students", label: "All Students", path: "/dashboard/students" },
      { id: "add-student", label: "Add Student", path: "/dashboard/students/add" },
      { id: "import", label: "Import Students", path: "/dashboard/students/import" },
    ],
  },
  {
    id: "academics",
    label: "ACADEMICS",
    icon: BookOpen,
    status: "active",
    subsections: [
      { id: "classes", label: "Classes & Subjects", path: "/dashboard/classes" },
      { id: "timetable", label: "Timetable", path: "/dashboard/timetable" },
      { id: "attendance", label: "Attendance", path: "/dashboard/attendance" },
      { id: "ca", label: "Continuous Assessment", path: "/dashboard/ca" },
      { id: "exams", label: "Exam Scheduling", path: "/dashboard/exams" },
      { id: "report-cards", label: "Report Cards", path: "/dashboard/report-cards" },
      {
        id: "bece-prep",
        label: "BECE / WASSCE Prep",
        path: "/dashboard/bece-prep",
        status: "coming-soon",
      },
    ],
  },
  {
    id: "fees",
    label: "FEES & FINANCE",
    icon: DollarSign,
    status: "active",
    subsections: [
      { id: "collect", label: "Collect Fees", path: "/dashboard/fees/collect" },
      { id: "fee-structure", label: "Fee Structure", path: "/dashboard/fees/structure" },
      { id: "fee-reports", label: "Fee Reports", path: "/dashboard/fees/reports" },
      { id: "expenses", label: "Expenses", path: "/dashboard/expenses", status: "coming-soon" },
      { id: "payroll", label: "Payroll", path: "/dashboard/payroll", status: "coming-soon" },
    ],
  },
  {
    id: "operations",
    label: "OPERATIONS",
    icon: Zap,
    status: "coming-soon",
    subsections: [
      { id: "library", label: "Library", path: "/dashboard/library" },
      { id: "hostel", label: "Hostel", path: "/dashboard/hostel" },
      { id: "transport", label: "Transport", path: "/dashboard/transport" },
      { id: "inventory", label: "Inventory", path: "/dashboard/inventory" },
    ],
  },
  {
    id: "communication",
    label: "AFRICAN COMMUNICATION",
    icon: MessageSquare,
    status: "active",
    subsections: [
      { id: "whatsapp", label: "WhatsApp Reports", path: "/dashboard/whatsapp" },
      { id: "sms", label: "SMS Fallback", path: "/dashboard/sms" },
      { id: "notice-board", label: "Notice Board", path: "/dashboard/notices" },
      { id: "voice-notes", label: "Voice Notes", path: "/dashboard/voice", status: "coming-soon" },
    ],
  },
  {
    id: "setup",
    label: "SCHOOL SETUP",
    icon: Settings,
    status: "active",
    subsections: [
      { id: "profile", label: "School Profile", path: "/dashboard/setup/profile" },
      { id: "staff", label: "Classes & Staff", path: "/dashboard/setup/staff" },
      { id: "branding", label: "Theme & Branding", path: "/dashboard/setup/branding" },
      { id: "nacca", label: "NaCCA Settings", path: "/dashboard/setup/nacca" },
      { id: "integrations", label: "Integrations", path: "/dashboard/setup/integrations" },
      { id: "data", label: "Data Management", path: "/dashboard/setup/data" },
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
      { id: "dashboard", label: "Dashboard", path: "/teacher/dashboard" },
      { id: "timetable", label: "My Timetable", path: "/teacher/timetable" },
      { id: "attendance", label: "Mark Attendance", path: "/teacher/attendance" },
      { id: "grades", label: "Enter Grades", path: "/teacher/grades" },
    ],
  },
  {
    id: "my-students",
    label: "MY STUDENTS",
    icon: Users,
    status: "active",
    subsections: [
      { id: "class-list", label: "Class List", path: "/teacher/students" },
      { id: "profiles", label: "Student Profiles", path: "/teacher/profiles" },
      { id: "homework", label: "Homework & Assignments", path: "/teacher/homework" },
    ],
  },
  {
    id: "communication",
    label: "COMMUNICATION",
    icon: MessageSquare,
    status: "coming-soon",
    subsections: [
      { id: "class-notice", label: "Send Class Notice", path: "/teacher/notices" },
      { id: "parent-messages", label: "Parent Messages", path: "/teacher/messages" },
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
      { id: "collect", label: "Collect Fees", path: "/bursar/collect" },
      { id: "today", label: "Today's Collections", path: "/bursar/today" },
      { id: "outstanding", label: "Outstanding Fees", path: "/bursar/outstanding" },
      { id: "reports", label: "Fee Reports", path: "/bursar/reports" },
    ],
  },
  {
    id: "finance",
    label: "FINANCE",
    icon: BarChart3,
    status: "coming-soon",
    subsections: [
      { id: "revenue", label: "Revenue Analytics", path: "/bursar/revenue" },
      { id: "expenses", label: "Expenses", path: "/bursar/expenses" },
      { id: "payroll", label: "Payroll", path: "/bursar/payroll" },
      { id: "reconciliation", label: "Reconciliation", path: "/bursar/reconciliation" },
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
