import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Users, Wallet, TrendingUp, AlertCircle, Clock, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Activity, MessageSquare, FileText,
  BarChart3, Calendar, Settings, Download, Bell, Search,
  ChevronRight, MoreHorizontal, Zap, DollarSign, BookOpen,
  GraduationCap, ClipboardList, LucideIcon, CalendarCheck
} from "lucide-react";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtime } from "../../hooks/useRealtime";

// ─────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  trend?: { direction: "up" | "down" | "neutral"; value: number };
  color: "blue" | "green" | "red" | "amber" | "purple" | "indigo";
  onClick?: () => void;
  isLoading?: boolean;
}

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}

interface AlertProps {
  id: string;
  type: "error" | "warning" | "info" | "success";
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

interface TaskProps {
  id: string;
  title: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  owner?: string;
}

// ─────────────────────────────────────────────────────────────────
// Color System
// ─────────────────────────────────────────────────────────────────

const COLOR_SCHEME = {
  primary: "#031B4E",
  primaryLight: "#0069D9",
  secondary: "#F8F9FA",
  accent: "#0080FF",
  success: "#16A34A",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  purple: "#8B5CF6",
  indigo: "#6366F1",
};

const colorMap = {
  blue: { bg: "#E0E7FF", text: "#3B82F6", icon: "#1D4ED8" },
  green: { bg: "#DCFCE7", text: "#16A34A", icon: "#059669" },
  red: { bg: "#FEE2E2", text: "#EF4444", icon: "#DC2626" },
  amber: { bg: "#FEF3C7", text: "#F59E0B", icon: "#D97706" },
  purple: { bg: "#F3E8FF", text: "#A855F7", icon: "#7C3AED" },
  indigo: { bg: "#E0E7FF", text: "#6366F1", icon: "#4F46E5" },
};

// ─────────────────────────────────────────────────────────────────
// KPI Card Component
// ─────────────────────────────────────────────────────────────────

function KPICard({ icon: Icon, label, value, subtext, trend, color, onClick, isLoading }: KPICardProps) {
  const colors = colorMap[color];
  
  return (
    <div
      onClick={onClick}
      className={`p-6 rounded-2xl border transition-all ${onClick ? "cursor-pointer hover:shadow-lg" : ""}`}
      style={{
        background: "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center"
          style={{ background: colors.bg }}
        >
          <Icon size={24} color={colors.icon} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: colors.bg }}>
            {trend.direction === "up" ? (
              <ArrowUpRight size={16} color={colors.text} />
            ) : trend.direction === "down" ? (
              <ArrowDownRight size={16} color={colors.text} />
            ) : null}
            <span style={{ color: colors.text, fontSize: "0.875rem", fontWeight: 600 }}>
              {trend.value}%
            </span>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded animate-pulse w-1/2" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
        </div>
      ) : (
        <>
          <div className="text-3xl font-bold text-foreground" style={{ marginBottom: "0.5rem" }}>
            {value}
          </div>
          <div className="text-muted-foreground" style={{ fontSize: "0.875rem" }}>{label}</div>
          {subtext && (
            <div className="text-muted-foreground/70" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
              {subtext}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Quick Action Card
// ─────────────────────────────────────────────────────────────────

function QuickActionCard({ icon: Icon, label, description, onClick, color }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-xl border transition-all hover:shadow-lg text-left bg-card"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: color + "20" }}
        >
          <Icon size={20} color={color} />
        </div>
        <ChevronRight size={16} className="text-muted-foreground/50" />
      </div>
      <div className="text-foreground" style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>
        {label}
      </div>
      <div className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
        {description}
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────
// Alert Banner
// ─────────────────────────────────────────────────────────────────

function AlertBanner({ type, title, description, action }: Omit<AlertProps, "id">) {
  const alertStyles = {
    error: { bg: "#FEE2E2", border: "#FECACA", icon: "#DC2626", text: "#7F1D1D" },
    warning: { bg: "#FEF3C7", border: "#FCD34D", icon: "#D97706", text: "#78350F" },
    info: { bg: "#DBEAFE", border: "#93C5FD", icon: "#0284C7", text: "#0C2340" },
    success: { bg: "#DCFCE7", border: "#86EFAC", icon: "#16A34A", text: "#14532D" },
  };

  const style = alertStyles[type];

  return (
    <div
      className="flex items-start gap-4 p-4 rounded-xl border"
      style={{ background: style.bg, borderColor: style.border }}
    >
      <AlertCircle size={20} color={style.icon} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div style={{ color: style.text, fontWeight: 600, marginBottom: "0.25rem" }}>
          {title}
        </div>
        <div style={{ color: style.text, fontSize: "0.875rem", opacity: 0.8 }}>
          {description}
        </div>
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-sm font-semibold px-3 py-1.5 rounded-lg mt-2 whitespace-nowrap flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.5)", color: style.text }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Task Item
// ─────────────────────────────────────────────────────────────────

function TaskItem({ title, priority, status, dueDate, owner }: TaskProps) {
  const priorityColors = {
    high: "#EF4444",
    medium: "#F59E0B",
    low: "#16A34A",
  };

  const statusIcons = {
    pending: <Clock size={16} style={{ color: "#6B7280" }} />,
    "in-progress": <Activity size={16} style={{ color: "#F59E0B" }} />,
    completed: <CheckCircle2 size={16} style={{ color: "#16A34A" }} />,
  };

  return (
    <div
      className="p-4 rounded-lg border flex items-center justify-between hover:bg-muted/40 transition-colors"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-3 flex-1">
        {statusIcons[status]}
        <div className="flex-1">
          <div className="text-foreground" style={{ fontWeight: 600, marginBottom: "0.25rem" }}>{title}</div>
          <div className="text-muted-foreground" style={{ fontSize: "0.75rem" }}>
            Due {new Date(dueDate).toLocaleDateString()}
            {owner && ` • ${owner}`}
          </div>
        </div>
      </div>
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: priorityColors[priority] }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Performance Chart
// ─────────────────────────────────────────────────────────────────

function PerformanceChart({ data, title }: { data: { month: string; value: number }[]; title: string }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const avgValue = Math.round(data.reduce((sum, d) => sum + d.value, 0) / data.length);

  return (
    <div className="p-6 rounded-2xl border bg-card" style={{ borderColor: "var(--border)" }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-muted-foreground" style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
            {title}
          </h3>
          <div className="text-foreground" style={{ fontSize: "1.875rem", fontWeight: 700 }}>
            {avgValue}%
          </div>
        </div>
        <div className="flex gap-2">
          <button className="text-muted-foreground" style={{ padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--border)", cursor: "pointer", background: "var(--card)" }}>
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between h-40 gap-2">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded-t transition-all hover:opacity-75"
              style={{
                background: COLOR_SCHEME.info,
                height: `${(item.value / maxValue) * 100}%`,
                minHeight: "4px",
              }}
              title={`${item.month}: ${item.value}%`}
            />
            <div className="text-muted-foreground" style={{ fontSize: "0.625rem", marginTop: "0.5rem" }}>
              {item.month}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Dashboard Component
// ─────────────────────────────────────────────────────────────────

export function AdminOverviewV3() {
  const navigate = useNavigate();
  const { user, school } = useAuth();
  const { data: dashData, isLoading } = useDashboardStats();
  const { connected } = useRealtime({ schoolId: school?.slug || "", userId: user?.id || "" });
  const [timeRange, setTimeRange] = useState("month");

  // Mock data for charts
  const attendanceChartData = [
    { month: "Jan", value: 92 },
    { month: "Feb", value: 88 },
    { month: "Mar", value: 95 },
    { month: "Apr", value: 91 },
    { month: "May", value: 94 },
    { month: "Jun", value: 89 },
  ];

  const performanceChartData = [
    { month: "Jan", value: 78 },
    { month: "Feb", value: 82 },
    { month: "Mar", value: 85 },
    { month: "Apr", value: 88 },
    { month: "May", value: 87 },
    { month: "Jun", value: 91 },
  ];

  // Calculate metrics from dashData
  const totalStudents = dashData?.stats?.totalStudents ?? 0;
  const totalTeachers = dashData?.stats?.totalTeachers ?? 0;
  const attendanceRate = dashData?.stats?.attendanceRate ?? 0;
  const totalBilled = dashData?.finance?.totalBilled ?? 0;
  const totalCollected = dashData?.finance?.totalCollected ?? 0;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  const defaultersCount = (dashData as any)?.defaulters?.count ?? 0;
  const pendingApprovals = dashData?.pendingCount ?? 0;

  // Mock alerts
  const alerts: Omit<AlertProps, "id">[] = [
    {
      type: "warning",
      title: "Fee Collection Alert",
      description: `${defaultersCount} students have pending fees. Total outstanding: KES ${(totalBilled - totalCollected).toLocaleString()}`,
      action: { label: "View Defaulters", onClick: () => navigate("/dashboard/reports") },
    },
    {
      type: "info",
      title: "System Update",
      description: "New features available: Admit Card Generator, Period-by-Period Attendance tracking",
      action: { label: "View Updates", onClick: () => {} },
    },
  ];

  // Mock tasks
  const tasks: TaskProps[] = [
    {
      id: "1",
      title: "Approve pending exam results",
      priority: "high",
      status: "pending",
      dueDate: new Date().toISOString(),
      owner: "John Kamau",
    },
    {
      id: "2",
      title: "Generate report cards for Term 2",
      priority: "high",
      status: "in-progress",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      title: "Configure fee installment plans",
      priority: "medium",
      status: "pending",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      title: "Conduct staff performance reviews",
      priority: "medium",
      status: "pending",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const quickActions: QuickActionProps[] = [
    {
      icon: Users,
      label: "Bulk Import Students",
      description: "Add multiple students via CSV",
      onClick: () => navigate("/dashboard/bulk-import"),
      color: COLOR_SCHEME.primary,
    },
    {
      icon: FileText,
      label: "Generate Report Cards",
      description: "Create and distribute reports",
      onClick: () => navigate("/dashboard/report-cards"),
      color: "#16A34A",
    },
    {
      icon: Wallet,
      label: "Fee Reminders",
      description: "Send payment notifications",
      onClick: () => navigate("/dashboard/fee-reminders"),
      color: "#F59E0B",
    },
    {
      icon: ClipboardList,
      label: "Class Timetable",
      description: "Manage schedule & periods",
      onClick: () => navigate("/dashboard/timetable-scheduler"),
      color: "#8B5CF6",
    },
    {
      icon: BarChart3,
      label: "Analytics",
      description: "View detailed reports",
      onClick: () => navigate("/dashboard/analytics"),
      color: "#3B82F6",
    },
    {
      icon: MessageSquare,
      label: "Send Communication",
      description: "Broadcast to staff & parents",
      onClick: () => navigate("/dashboard/communication"),
      color: "#EC4899",
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "0.5rem",
              }}
              className="text-foreground"
            >
              Welcome back, {user?.fullName?.split(' ')[0] || "Admin"}
            </h1>
            <p className="text-muted-foreground">
              {school?.name || "School Management"}
              {connected && (
                <span style={{ color: "#16A34A", marginLeft: "1rem" }}>
                  ● Live
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                background: "var(--card)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Download size={18} className="text-foreground" />
              <span className="text-foreground font-medium">Export</span>
            </button>
            <button
              style={{
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid var(--border)",
                background: "var(--card)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Settings size={18} className="text-foreground" />
            </button>
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2 w-fit">
          {["Today", "Week", "Month", "Year"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range.toLowerCase())}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border)",
                background: timeRange === range.toLowerCase() ? "var(--primary)" : "var(--card)",
                color: timeRange === range.toLowerCase() ? "var(--primary-foreground)" : "var(--foreground)",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 gap-3 mb-8">
          {alerts.map((alert, idx) => (
            <AlertBanner key={idx} {...alert} />
          ))}
        </div>
      )}

      {/* KPI Grid - Top Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={Users}
          label="Total Students"
          value={totalStudents}
          color="blue"
          subtext="Active enrollments"
          onClick={() => navigate("/dashboard/students")}
          isLoading={isLoading}
        />
        <KPICard
          icon={GraduationCap}
          label="Staff Members"
          value={totalTeachers}
          color="green"
          subtext="Teachers & Support"
          onClick={() => navigate("/dashboard/staff")}
          isLoading={isLoading}
        />
        <KPICard
          icon={CalendarCheck}
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          color="indigo"
          trend={{ direction: "up", value: 2 }}
          subtext="Today's average"
          onClick={() => navigate("/dashboard/attendance")}
          isLoading={isLoading}
        />
        <KPICard
          icon={Wallet}
          label="Collection Rate"
          value={`${collectionRate}%`}
          color="amber"
          trend={{ direction: "up", value: 5 }}
          subtext={`KES ${totalCollected.toLocaleString()}`}
          onClick={() => navigate("/dashboard/finance")}
          isLoading={isLoading}
        />
      </div>

      {/* KPI Grid - Secondary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={AlertCircle}
          label="Pending Approvals"
          value={pendingApprovals}
          color="red"
          subtext="Awaiting your review"
          onClick={() => navigate("/dashboard/approvals")}
          isLoading={isLoading}
        />
        <KPICard
          icon={Zap}
          label="Defaulters"
          value={defaultersCount}
          color="amber"
          subtext="Unpaid fees"
          onClick={() => navigate("/dashboard/reports")}
          isLoading={isLoading}
        />
        <KPICard
          icon={TrendingUp}
          label="Revenue (MTD)"
          value={`KES ${totalCollected.toLocaleString()}`}
          color="green"
          subtext="vs Budget"
          isLoading={isLoading}
        />
        <KPICard
          icon={BookOpen}
          label="Active Classes"
          value={(dashData?.stats as any)?.activeClasses ?? 0}
          color="purple"
          subtext="Scheduled today"
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Charts */}
        <div className="lg:col-span-2">
          <PerformanceChart data={attendanceChartData} title="Attendance Trend" />
        </div>

        {/* Tasks Sidebar */}
        <div
          className="p-6 rounded-2xl border bg-card"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
              Pending Tasks
            </h3>
            <span
              style={{
                background: "#FEE2E2",
                color: "#DC2626",
                padding: "0.25rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              {tasks.filter((t) => t.status !== "completed").length}
            </span>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map((task) => (
              <TaskItem key={task.id} {...task} />
            ))}
          </div>

          <button
            style={{
              width: "100%",
              padding: "0.75rem",
              marginTop: "1rem",
              borderRadius: "0.75rem",
              border: `2px solid ${COLOR_SCHEME.primary}`,
              background: "transparent",
              color: COLOR_SCHEME.primary,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            View All Tasks
          </button>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mb-8">
        <PerformanceChart data={performanceChartData} title="Academic Performance" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "1.5rem",
            color: COLOR_SCHEME.primary,
          }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => (
            <QuickActionCard key={idx} {...action} />
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div
        className="mt-8 p-6 rounded-2xl border text-center bg-card"
        style={{ borderColor: "var(--border)" }}
      >
        <p className="text-muted-foreground" style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
          📊 Tip: Your school is performing above average. Keep the great work!
        </p>
        <p className="text-muted-foreground/60" style={{ fontSize: "0.75rem" }}>
          Dashboard loaded at {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

export default AdminOverviewV3;
