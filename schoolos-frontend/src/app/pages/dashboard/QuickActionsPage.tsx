import { useNavigate } from "react-router";
import {
  Banknote, UserPlus, CheckSquare, Send, Wallet, BarChart2,
  BookOpen, Home, Bus, Package, Users, FileText, Settings, Bell,
  Upload, ClipboardList, MessageCircle, Calculator
} from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";

const NAVY = "#031B4E";
const MUTED = "#6B7280";

interface Action {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  description: string;
  path: string;
  color: string;
  bg: string;
}

const groups: { title: string; actions: Action[] }[] = [
  {
    title: "Financial",
    actions: [
      { icon: Banknote, label: "Collect Fees", description: "Record a student fee payment", path: "/dashboard/fees/collect", color: "#16A34A", bg: "#DCFCE7" },
      { icon: Wallet, label: "Add Expense", description: "Log a school expense", path: "/dashboard/expenses", color: "#F59E0B", bg: "#FEF3C7" },
      { icon: Calculator, label: "Payroll", description: "Process staff salaries", path: "/dashboard/payroll", color: "#8B5CF6", bg: "#EDE9FE" },
      { icon: BarChart2, label: "Fee Reports", description: "View collection reports", path: "/dashboard/fees/reports", color: "#0080FF", bg: "#DBEAFE" },
    ],
  },
  {
    title: "Students",
    actions: [
      { icon: UserPlus, label: "Add Student", description: "Enroll a new student", path: "/dashboard/students/add", color: "#0069D9", bg: "#DBEAFE" },
      { icon: Users, label: "All Students", description: "View student directory", path: "/dashboard/students", color: "#031B4E", bg: "#E0E7FF" },
      { icon: Upload, label: "Import CSV", description: "Bulk import students", path: "/dashboard/students/import", color: "#6B7280", bg: "#F3F4F6" },
      { icon: CheckSquare, label: "Attendance", description: "Mark today's attendance", path: "/dashboard/attendance", color: "#16A34A", bg: "#DCFCE7" },
    ],
  },
  {
    title: "Academics",
    actions: [
      { icon: ClipboardList, label: "Assessments", description: "Enter or review scores", path: "/dashboard/assessments", color: "#DC2626", bg: "#FEE2E2" },
      { icon: FileText, label: "Report Cards", description: "Generate & publish reports", path: "/dashboard/report-cards", color: "#0080FF", bg: "#DBEAFE" },
      { icon: BookOpen, label: "Library", description: "Manage book checkouts", path: "/dashboard/library", color: "#8B5CF6", bg: "#EDE9FE" },
      { icon: FileText, label: "BECE Prep", description: "Track JHS 3 readiness", path: "/dashboard/bece-prep", color: "#F59E0B", bg: "#FEF3C7" },
    ],
  },
  {
    title: "Communication & Operations",
    actions: [
      { icon: Send, label: "Send Notice", description: "Broadcast to parents", path: "/dashboard/notices", color: "#0080FF", bg: "#DBEAFE" },
      { icon: MessageCircle, label: "WhatsApp", description: "WhatsApp conversations", path: "/dashboard/whatsapp", color: "#16A34A", bg: "#DCFCE7" },
      { icon: Home, label: "Hostel", description: "Manage dormitory rooms", path: "/dashboard/hostel", color: "#6B7280", bg: "#F3F4F6" },
      { icon: Bus, label: "Transport", description: "Bus routes & students", path: "/dashboard/transport", color: "#F59E0B", bg: "#FEF3C7" },
      { icon: Package, label: "Inventory", description: "Track school assets", path: "/dashboard/inventory", color: "#8B5CF6", bg: "#EDE9FE" },
      { icon: Bell, label: "Fee Reminders", description: "Send automated reminders", path: "/dashboard/fee-reminders", color: "#DC2626", bg: "#FEE2E2" },
      { icon: Settings, label: "Settings", description: "Configure your school", path: "/dashboard/settings", color: "#031B4E", bg: "#E0E7FF" },
      { icon: BarChart2, label: "Analytics", description: "Insights & trends", path: "/dashboard/analytics", color: "#0080FF", bg: "#DBEAFE" },
    ],
  },
];

function ActionCard({ action }: { action: Action }) {
  const navigate = useNavigate();
  const Icon = action.icon;
  return (
    <button
      onClick={() => navigate(action.path)}
      className="flex flex-col items-start gap-3 p-4 rounded-2xl border border-border bg-card hover:shadow-md transition-all active:scale-95 text-left w-full"
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: action.bg }}>
        <Icon size={20} color={action.color} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: NAVY }}>{action.label}</p>
        <p className="text-xs mt-0.5 leading-snug" style={{ color: MUTED }}>{action.description}</p>
      </div>
    </button>
  );
}

export function QuickActionsPage() {
  return (
    <PageTemplate
      title="Quick Actions"
      description="Fast access to the most common tasks across SchoolOS."
    >
      <div className="space-y-8">
        {groups.map((group) => (
          <div key={group.title}>
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: MUTED }}>
              {group.title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {group.actions.map((action) => (
                <ActionCard key={action.label} action={action} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageTemplate>
  );
}
