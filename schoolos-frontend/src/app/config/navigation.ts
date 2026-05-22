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

export type UserRole = "super-admin" | "school-admin" | "teacher" | "bursar" | "parent";

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

// School Admin Navigation (Headmaster / Proprietor) - Executive Pro
export const schoolAdminNav: NavSection[] = [
  {
    id: "dashboard",
    label: "DASHBOARD",
    icon: Home,
    status: "active",
    subsections: [
      { id: "dashboard-home", label: "Dashboard Home", path: "/dashboard" },
    ],
  },
  {
    id: "finance-fees",
    label: "FINANCE & FEES",
    icon: DollarSign,
    status: "active",
    subsections: [
      { id: "collect-fees", label: "Collect Fees", path: "/dashboard/fees/collect" },
      { id: "search-due-fees", label: "Search Due Fees", path: "/dashboard/fees/search-due" },
      { id: "fee-groups", label: "Fee Groups", path: "/dashboard/fees/groups" },
      { id: "fee-types", label: "Fee Types", path: "/dashboard/fees/types" },
      { id: "assign-fees", label: "Assign Fees", path: "/dashboard/fees/assign" },
      { id: "all-transactions", label: "All Transactions", path: "/dashboard/fees/transactions" },
      { id: "online-payments", label: "Online Payments", path: "/dashboard/fees/online-payments" },
    ],
  },
  {
    id: "accounts",
    label: "ACCOUNTS",
    icon: BarChart3,
    status: "active",
    subsections: [
      { id: "bank-accounts", label: "Bank Accounts", path: "/dashboard/accounts/bank-accounts" },
      { id: "income-heads", label: "Income Heads", path: "/dashboard/accounts/income-heads" },
      { id: "expense-heads", label: "Expense Heads", path: "/dashboard/accounts/expense-heads" },
      { id: "income", label: "Income", path: "/dashboard/accounts/income" },
      { id: "expense", label: "Expense", path: "/dashboard/accounts/expense" },
    ],
  },
  {
    id: "student-information",
    label: "STUDENT INFORMATION",
    icon: Users,
    status: "active",
    subsections: [
      { id: "student-admission", label: "Student Admission", path: "/dashboard/students/admission" },
      { id: "student-list", label: "Student List", path: "/dashboard/students" },
      { id: "student-categories", label: "Student Categories", path: "/dashboard/students/categories" },
      { id: "student-houses", label: "Student Houses", path: "/dashboard/students/houses" },
      { id: "disabled-students", label: "Disabled Students", path: "/dashboard/students/disabled" },
      { id: "bulk-import", label: "Bulk Import", path: "/dashboard/students/import" },
      { id: "custom-fields", label: "Custom Fields", path: "/dashboard/students/custom-fields" },
      { id: "behavior-records", label: "Behavior Records", path: "/dashboard/students/behavior" },
    ],
  },
  {
    id: "academics",
    label: "ACADEMICS",
    icon: BookOpen,
    status: "active",
    subsections: [
      { id: "classes", label: "Classes", path: "/dashboard/academics/classes" },
      { id: "sections", label: "Sections", path: "/dashboard/academics/sections" },
      { id: "subjects", label: "Subjects", path: "/dashboard/academics/subjects" },
      { id: "assign-class-teacher", label: "Assign Class Teacher", path: "/dashboard/academics/assign-teacher" },
      { id: "assign-subjects", label: "Assign Subjects", path: "/dashboard/academics/assign-subjects" },
      { id: "class-timetable", label: "Class Timetable", path: "/dashboard/timetable" },
      { id: "promote-students", label: "Promote Students", path: "/dashboard/academics/promote" },
    ],
  },
  {
    id: "front-office",
    label: "FRONT OFFICE",
    icon: Briefcase,
    status: "active",
    subsections: [
      { id: "admission-enquiries", label: "Admission Enquiries", path: "/dashboard/front-office/enquiries" },
      { id: "visitor-book", label: "Visitor Book", path: "/dashboard/front-office/visitors" },
      { id: "complaints", label: "Complaints", path: "/dashboard/front-office/complaints" },
      { id: "postal-records", label: "Postal Records", path: "/dashboard/front-office/postal" },
      { id: "call-log", label: "Call Log", path: "/dashboard/front-office/call-log" },
    ],
  },
  {
    id: "offline-exams",
    label: "OFFLINE EXAMINATIONS",
    icon: ClipboardList,
    status: "active",
    subsections: [
      { id: "manage-exams", label: "Manage Exams", path: "/dashboard/exams/manage" },
      { id: "exam-types", label: "Exam Types", path: "/dashboard/exams/types" },
      { id: "schedule-marks", label: "Schedule & Marks Setup", path: "/dashboard/exams/schedule" },
      { id: "enter-marks", label: "Enter Marks", path: "/dashboard/exams/enter-marks" },
      { id: "manage-grades", label: "Manage Grades", path: "/dashboard/exams/grades" },
      { id: "marksheet-generator", label: "Marksheet Generator", path: "/dashboard/exams/marksheet" },
      { id: "report-card-setup", label: "Report Card Setup", path: "/dashboard/exams/report-card-setup" },
      { id: "generate-report-card", label: "Generate Report Card", path: "/dashboard/exams/generate-report-card" },
    ],
  },
  {
    id: "online-exams",
    label: "ONLINE EXAMINATIONS",
    icon: Zap,
    status: "active",
    subsections: [
      { id: "manage-online-exams", label: "Manage Online Exams", path: "/dashboard/online-exams/manage" },
      { id: "question-bank", label: "Question Bank", path: "/dashboard/online-exams/question-bank" },
    ],
  },
  {
    id: "human-resource",
    label: "HUMAN RESOURCE",
    icon: UserCog,
    status: "active",
    subsections: [
      { id: "staff-directory", label: "Staff Directory", path: "/dashboard/staff" },
      { id: "departments", label: "Departments", path: "/dashboard/staff/departments" },
      { id: "designations", label: "Designations", path: "/dashboard/staff/designations" },
      { id: "staff-attendance", label: "Staff Attendance", path: "/dashboard/staff/attendance" },
      { id: "payroll", label: "Payroll", path: "/dashboard/staff/payroll" },
      { id: "approve-leave", label: "Approve Leave", path: "/dashboard/staff/approve-leave" },
      { id: "leave-types", label: "Leave Types", path: "/dashboard/staff/leave-types" },
    ],
  },
  {
    id: "study-center",
    label: "STUDY CENTER",
    icon: BookOpen,
    status: "active",
    subsections: [
      { id: "manage-syllabus", label: "Manage Syllabus", path: "/dashboard/study/syllabus" },
      { id: "study-materials", label: "Study Materials", path: "/dashboard/study/materials" },
      { id: "homework", label: "Homework & Assignments", path: "/dashboard/study/homework" },
      { id: "live-classes", label: "Live Classes (Zoom/Meet)", path: "/dashboard/study/live-classes" },
    ],
  },
  {
    id: "knowledge-base",
    label: "KNOWLEDGE BASE & AI",
    icon: MessageSquare,
    status: "active",
    subsections: [
      { id: "ai-chatbot", label: "AI Chatbot", path: "/dashboard/ai/chatbot" },
      { id: "kb-articles", label: "KB Articles", path: "/dashboard/ai/articles" },
      { id: "kb-categories", label: "KB Categories", path: "/dashboard/ai/categories" },
    ],
  },
  {
    id: "certificates",
    label: "CERTIFICATES",
    icon: FileText,
    status: "active",
    subsections: [
      { id: "certificate-templates", label: "Certificate Templates", path: "/dashboard/certificates/templates" },
      { id: "generate-certificate", label: "Generate Certificate", path: "/dashboard/certificates/generate" },
      { id: "student-id-card", label: "Student ID Card", path: "/dashboard/certificates/id-card" },
    ],
  },
  {
    id: "communicate",
    label: "COMMUNICATE",
    icon: MessageSquare,
    status: "active",
    subsections: [
      { id: "notice-board", label: "Notice Board", path: "/dashboard/notices" },
      { id: "broadcast", label: "Broadcast (SMS/Email/WhatsApp)", path: "/dashboard/communications/broadcast" },
      { id: "broadcast-history", label: "Broadcast History", path: "/dashboard/communications/history" },
      { id: "event-calendar", label: "Event Calendar", path: "/dashboard/calendar" },
    ],
  },
  {
    id: "library",
    label: "LIBRARY",
    icon: Library,
    status: "active",
    subsections: [
      { id: "issue-return", label: "Issue / Return Books", path: "/dashboard/library/issue-return" },
      { id: "manage-books", label: "Manage Books", path: "/dashboard/library/books" },
      { id: "book-categories", label: "Book Categories", path: "/dashboard/library/categories" },
    ],
  },
  {
    id: "inventory",
    label: "INVENTORY",
    icon: ClipboardList,
    status: "active",
    subsections: [
      { id: "item-category", label: "Item Category", path: "/dashboard/inventory/categories" },
      { id: "item-list", label: "Item List", path: "/dashboard/inventory/items" },
      { id: "add-stock", label: "Add Stock", path: "/dashboard/inventory/add-stock" },
      { id: "issue-item", label: "Issue Item", path: "/dashboard/inventory/issue" },
      { id: "suppliers", label: "Suppliers", path: "/dashboard/inventory/suppliers" },
    ],
  },
  {
    id: "transport",
    label: "TRANSPORT",
    icon: Truck,
    status: "active",
    subsections: [
      { id: "manage-vehicles", label: "Manage Vehicles", path: "/dashboard/transport/vehicles" },
      { id: "manage-routes", label: "Manage Routes", path: "/dashboard/transport/routes" },
      { id: "student-assignment", label: "Student Assignment", path: "/dashboard/transport/assign" },
      { id: "live-tracking", label: "Live Tracking", path: "/dashboard/transport/tracking" },
    ],
  },
  {
    id: "hostel",
    label: "HOSTEL",
    icon: Hotel,
    status: "active",
    subsections: [
      { id: "manage-hostels", label: "Manage Hostels", path: "/dashboard/hostel/manage" },
      { id: "room-types", label: "Room Types", path: "/dashboard/hostel/room-types" },
      { id: "manage-rooms", label: "Manage Rooms", path: "/dashboard/hostel/rooms" },
      { id: "allocations", label: "Allocations", path: "/dashboard/hostel/allocations" },
    ],
  },
  {
    id: "reports",
    label: "REPORTS",
    icon: TrendingUp,
    status: "active",
    subsections: [
      { id: "student-report", label: "Student Report", path: "/dashboard/reports/student" },
      { id: "guardian-report", label: "Guardian Report", path: "/dashboard/reports/guardian" },
      { id: "admission-report", label: "Admission Report", path: "/dashboard/reports/admission" },
      { id: "fees-statement", label: "Fees Statement", path: "/dashboard/reports/fees-statement" },
      { id: "balance-fees", label: "Balance Fees Report", path: "/dashboard/reports/balance-fees" },
      { id: "fees-collection", label: "Fees Collection Report", path: "/dashboard/reports/fees-collection" },
      { id: "income-expense", label: "Income / Expense Report", path: "/dashboard/reports/income-expense" },
      { id: "monthly-attendance", label: "Monthly Attendance Report", path: "/dashboard/reports/attendance" },
      { id: "staff-attendance-report", label: "Staff Attendance Report", path: "/dashboard/reports/staff-attendance" },
      { id: "rank-report", label: "Rank Report", path: "/dashboard/reports/rank" },
      { id: "performance-report", label: "Class Performance Report", path: "/dashboard/reports/performance" },
      { id: "book-report", label: "Book Issue / Due Report", path: "/dashboard/reports/library" },
      { id: "stock-report", label: "Stock & Issue Report", path: "/dashboard/reports/inventory" },
      { id: "transport-report", label: "Transport Report", path: "/dashboard/reports/transport" },
      { id: "hostel-report", label: "Hostel Report", path: "/dashboard/reports/hostel" },
    ],
  },
  {
    id: "settings",
    label: "SETTINGS & BILLING",
    icon: Settings,
    status: "active",
    subsections: [
      { id: "school-settings", label: "School Settings", path: "/dashboard/settings/school" },
      { id: "module-settings", label: "Module Settings", path: "/dashboard/settings/modules" },
      { id: "roles-permissions", label: "Roles & Permissions", path: "/dashboard/settings/roles" },
      { id: "payment-gateway", label: "Payment Gateway", path: "/dashboard/settings/payment" },
      { id: "notification-settings", label: "Notification Settings", path: "/dashboard/settings/notifications" },
      { id: "admission-settings", label: "Admission Settings", path: "/dashboard/settings/admission" },
      { id: "biometric-devices", label: "Biometric Devices", path: "/dashboard/settings/biometric" },
      { id: "backup-management", label: "Backup Management", path: "/dashboard/settings/backup" },
      { id: "audit-trail", label: "Audit Trail", path: "/dashboard/settings/audit" },
      { id: "subscription", label: "Subscription", path: "/dashboard/settings/subscription" },
      { id: "subscription-history", label: "Subscription History", path: "/dashboard/settings/subscription-history" },
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
export function getNavigation(role: UserRole): NavSection[] {
  switch (role) {
    case "super-admin":
      return superAdminNav;
    case "school-admin":
      return schoolAdminNav;
    case "teacher":
      return teacherNav;
    case "bursar":
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
