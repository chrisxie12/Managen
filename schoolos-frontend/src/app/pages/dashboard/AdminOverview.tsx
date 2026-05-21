import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  ClipboardList,
  AlertCircle,
  Zap,
  Calendar,
  Download,
  Settings,
  Clock,
  CheckCircle,
  Plus,
  Activity,
  ChevronRight,
  TrendingDown,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtime } from "../../hooks/useRealtime";
import { DashboardLayout } from "../../components/layout/Sidebar";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

const COLOR_SCHEME = {
  primary: NAVY,
  primaryLight: NAVY_LIGHT,
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  purple: "#8B5CF6",
  indigo: "#6366F1",
};

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  trend?: { direction: "up" | "down"; value: number };
  subtext?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

function KPICard({
  icon,
  label,
  value,
  color,
  trend,
  subtext,
  onClick,
  isLoading,
}: KPICardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`p-6 rounded-xl text-left transition-all ${
        onClick
          ? "cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95"
          : "cursor-default"
      }`}
      style={{
        background: "white",
        border: "1px solid rgba(10,36,114,0.1)",
        boxShadow: "0 2px 8px rgba(10,36,114,0.05)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
            style={{
              color: trend.direction === "up" ? COLOR_SCHEME.success : COLOR_SCHEME.danger,
              background:
                trend.direction === "up"
                  ? `${COLOR_SCHEME.success}15`
                  : `${COLOR_SCHEME.danger}15`,
            }}
          >
            {trend.direction === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {trend.value}%
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          color: NAVY,
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "0.25rem",
        }}
      >
        {isLoading ? "..." : value}
      </div>
      <div style={{ color: MUTED, fontSize: "0.875rem", fontWeight: 500 }}>
        {label}
      </div>
      {subtext && (
        <div
          style={{
            color: MUTED,
            fontSize: "0.8rem",
            marginTop: "0.5rem",
          }}
        >
          {subtext}
        </div>
      )}
    </button>
  );
}

interface AlertProps {
  type: "error" | "warning" | "info" | "success";
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
}

function AlertBanner({ type, title, description, action, onDismiss }: AlertProps) {
  const colors = {
    error: { bg: `${COLOR_SCHEME.danger}15`, border: COLOR_SCHEME.danger, text: COLOR_SCHEME.danger },
    warning: { bg: `${COLOR_SCHEME.warning}15`, border: COLOR_SCHEME.warning, text: COLOR_SCHEME.warning },
    info: { bg: `${COLOR_SCHEME.info}15`, border: COLOR_SCHEME.info, text: COLOR_SCHEME.info },
    success: { bg: `${COLOR_SCHEME.success}15`, border: COLOR_SCHEME.success, text: COLOR_SCHEME.success },
  };

  const typeColors = colors[type];

  return (
    <div
      className="p-4 rounded-lg flex items-start gap-3 border"
      style={{
        background: typeColors.bg,
        borderColor: typeColors.border,
      }}
    >
      {type === "error" && <AlertCircle size={20} style={{ color: typeColors.text, flexShrink: 0 }} />}
      {type === "warning" && <AlertTriangle size={20} style={{ color: typeColors.text, flexShrink: 0 }} />}
      {type === "info" && <Info size={20} style={{ color: typeColors.text, flexShrink: 0 }} />}
      {type === "success" && <CheckCircle size={20} style={{ color: typeColors.text, flexShrink: 0 }} />}

      <div className="flex-1">
        <div style={{ color: typeColors.text, fontWeight: 600, fontSize: "0.95rem" }}>
          {title}
        </div>
        <div style={{ color: MUTED, fontSize: "0.875rem", marginTop: "0.25rem" }}>
          {description}
        </div>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{
              background: typeColors.text,
              color: "white",
            }}
          >
            {action.label}
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-xl leading-none hover:opacity-70">
          ×
        </button>
      )}
    </div>
  );
}

interface TaskItemProps {
  title: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  owner?: string;
  onClick?: () => void;
}

function TaskItem({ title, priority, dueDate, owner, onClick }: TaskItemProps) {
  const priorityColor = {
    high: COLOR_SCHEME.danger,
    medium: COLOR_SCHEME.warning,
    low: COLOR_SCHEME.info,
  };

  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-lg text-left hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="font-medium text-sm" style={{ color: NAVY }}>
          {title}
        </span>
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
          style={{ background: priorityColor[priority] }}
        />
      </div>
      <div className="flex items-center gap-4 text-xs" style={{ color: MUTED }}>
        {dueDate && (
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {dueDate}
          </div>
        )}
        {owner && <span>{owner}</span>}
      </div>
    </button>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}

function QuickActionCard({ icon, label, description, onClick, color }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="p-6 rounded-lg text-left transition-all hover:shadow-lg hover:scale-105 active:scale-95"
      style={{
        background: "white",
        border: "1px solid rgba(10,36,114,0.1)",
        boxShadow: "0 2px 8px rgba(10,36,114,0.05)",
      }}
    >
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
        style={{ background: `${color}15` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div style={{ fontWeight: 600, color: NAVY, marginBottom: "0.25rem" }}>
        {label}
      </div>
      <div style={{ color: MUTED, fontSize: "0.875rem" }}>
        {description}
      </div>
    </button>
  );
}

export function AdminOverview() {
  const navigate = useNavigate();
  const { user, school } = useAuth();
  const { data: dash, isLoading } = useDashboardStats();
  const { connected } = useRealtime({
    schoolId: school?.id || school?.slug || "",
    userId: user?.id || "",
  });
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "year">(
    "today"
  );

  // Determine user role for sidebar
  const userRole = (user?.role || "school-admin") as
    | "super-admin"
    | "school-admin"
    | "teacher"
    | "bursar"
    | "parent";

  // Mock data - will be replaced with real data from API
  const mockData = {
    stats: {
      totalStudents: 542,
      totalTeachers: 28,
      attendanceRate: 86,
      activeClasses: 18,
    },
    finance: {
      totalBilled: 125000,
      totalCollected: 98500,
    },
    defaulters: { count: 12 },
    pendingCount: 5,
    alerts: [
      {
        id: "fee-alert",
        type: "warning" as const,
        title: "Outstanding Fees",
        description: "12 students have not cleared their fees for this term",
        action: { label: "View Defaulters", onClick: () => navigate("/dashboard/fees") },
      },
      {
        id: "approval-alert",
        type: "info" as const,
        title: "Pending Approvals",
        description: "5 exam results waiting for review and approval",
        action: { label: "Review Now", onClick: () => navigate("/dashboard/assessments") },
      },
    ],
    tasks: [
      {
        id: "1",
        title: "Approve Exam Results (Form 3)",
        priority: "high" as const,
        dueDate: "Today",
        owner: "Mr. Kofi",
      },
      {
        id: "2",
        title: "Generate Report Cards",
        priority: "high" as const,
        dueDate: "Tomorrow",
        owner: "System",
      },
      {
        id: "3",
        title: "Set Class Timetable",
        priority: "medium" as const,
        dueDate: "Friday",
        owner: "Mr. Asante",
      },
      {
        id: "4",
        title: "Review Fee Settings",
        priority: "medium" as const,
        dueDate: "Next Week",
        owner: "Finance",
      },
    ],
  };

  const dashData = dash || mockData;
  const attendanceRate = dashData.stats?.attendanceRate ?? 0;
  const totalCollected = dashData.finance?.totalCollected ?? 0;
  const totalBilled = dashData.finance?.totalBilled ?? 0;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  const defaulters = dashData.defaulters?.count ?? 0;
  const pendingCount = dashData.pendingCount ?? 0;

  const visibleAlerts = (dashData.alerts || []).filter(
    (a) => !dismissedAlerts.includes(a.id || "")
  );

  const quickActions: QuickActionProps[] = [
    {
      icon: <Plus size={24} />,
      label: "Bulk Import Students",
      description: "Add multiple students at once",
      onClick: () => navigate("/dashboard/bulk-import"),
      color: COLOR_SCHEME.primary,
    },
    {
      icon: <ClipboardList size={24} />,
      label: "Generate Report Cards",
      description: "Create and print report cards",
      onClick: () => navigate("/dashboard/reports"),
      color: COLOR_SCHEME.info,
    },
    {
      icon: <AlertCircle size={24} />,
      label: "Fee Reminders",
      description: "Send payment reminders",
      onClick: () => navigate("/dashboard/fees"),
      color: COLOR_SCHEME.warning,
    },
    {
      icon: <Calendar size={24} />,
      label: "Class Timetable",
      description: "Manage class schedules",
      onClick: () => navigate("/dashboard/timetable"),
      color: COLOR_SCHEME.success,
    },
    {
      icon: <TrendingUp size={24} />,
      label: "Analytics",
      description: "View detailed reports",
      onClick: () => navigate("/dashboard/analytics"),
      color: COLOR_SCHEME.purple,
    },
    {
      icon: <Activity size={24} />,
      label: "Send Communication",
      description: "Broadcast messages",
      onClick: () => navigate("/dashboard/communications"),
      color: COLOR_SCHEME.indigo,
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview", status: "active" },
    { id: "analytics", label: "Analytics", status: "coming-soon" },
    { id: "reports", label: "Reports", status: "coming-soon" },
    { id: "finance", label: "Finance", status: "coming-soon" },
    { id: "settings", label: "Settings", status: "coming-soon" },
  ];

  const [activeTab, setActiveTab] = useState("overview");

  const dashboardContent = (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              color: NAVY,
              fontSize: "2rem",
              fontWeight: 700,
            }}
          >
            Welcome back, {user?.firstName || "Admin"}
          </h1>
          <p style={{ color: MUTED, fontSize: "0.95rem", marginTop: "0.5rem" }}>
            {school?.name || "School Dashboard"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {connected && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: `${COLOR_SCHEME.success}15` }}
            >
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: COLOR_SCHEME.success }}
              />
              <span style={{ fontSize: "0.875rem", color: COLOR_SCHEME.success, fontWeight: 500 }}>
                Live
              </span>
            </div>
          )}
          <button
            onClick={() => navigate("/dashboard/export")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Export data"
          >
            <Download size={20} style={{ color: NAVY }} />
          </button>
          <button
            onClick={() => navigate("/dashboard/settings")}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Settings"
          >
            <Settings size={20} style={{ color: NAVY }} />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        className="flex items-center gap-1 border-b overflow-x-auto"
        style={{ borderColor: "rgba(10,36,114,0.1)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.status !== "coming-soon") {
                setActiveTab(tab.id);
              }
            }}
            disabled={tab.status === "coming-soon"}
            className={`px-4 py-3 font-medium text-sm transition-all relative ${
              tab.status === "coming-soon"
                ? "cursor-not-allowed opacity-50"
                : activeTab === tab.id
                ? "cursor-pointer"
                : "cursor-pointer hover:text-gray-600"
            }`}
            style={{
              color:
                tab.status === "coming-soon"
                  ? MUTED
                  : activeTab === tab.id
                  ? NAVY
                  : MUTED,
            }}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.status === "coming-soon" && (
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: `${COLOR_SCHEME.warning}20`,
                    color: COLOR_SCHEME.warning,
                    fontWeight: 600,
                  }}
                >
                  Soon
                </span>
              )}
            </span>
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-1 rounded-t"
                style={{ background: COLOR_SCHEME.primary }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {["today", "week", "month", "year"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range as typeof timeRange)}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              timeRange === range
                ? "text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            style={{
              background:
                timeRange === range ? COLOR_SCHEME.primary : "transparent",
            }}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-2">
          {visibleAlerts.map((alert) => (
            <AlertBanner
              key={alert.id || ""}
              type={alert.type}
              title={alert.title}
              description={alert.description}
              action={alert.action}
              onDismiss={() =>
                setDismissedAlerts([...dismissedAlerts, alert.id || ""])
              }
            />
          ))}
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<Users size={24} />}
          label="Total Students"
          value={dashData.stats?.totalStudents || 0}
          color={COLOR_SCHEME.info}
          trend={{ direction: "up", value: 5 }}
          onClick={() => navigate("/dashboard/students")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<BookOpen size={24} />}
          label="Staff Members"
          value={dashData.stats?.totalTeachers || 0}
          color={COLOR_SCHEME.success}
          trend={{ direction: "up", value: 2 }}
          onClick={() => navigate("/dashboard/staff")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<TrendingUp size={24} />}
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          color={COLOR_SCHEME.purple}
          trend={{
            direction: attendanceRate >= 80 ? "up" : "down",
            value: 3,
          }}
          onClick={() => navigate("/dashboard/attendance")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<DollarSign size={24} />}
          label="Collection Rate"
          value={`${collectionRate}%`}
          color={COLOR_SCHEME.indigo}
          trend={{
            direction: collectionRate >= 75 ? "up" : "down",
            value: 2,
          }}
          onClick={() => navigate("/dashboard/fees")}
          isLoading={isLoading}
        />
      </div>

      {/* Secondary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<ClipboardList size={24} />}
          label="Pending Approvals"
          value={pendingCount}
          color={COLOR_SCHEME.warning}
          subtext="Items awaiting review"
          onClick={() => navigate("/dashboard/approvals")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<AlertCircle size={24} />}
          label="Defaulters"
          value={defaulters}
          color={COLOR_SCHEME.danger}
          subtext="Students with unpaid fees"
          onClick={() => navigate("/dashboard/defaulters")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<DollarSign size={24} />}
          label="Revenue (MTD)"
          value={`${(totalCollected / 1000).toFixed(1)}K`}
          color={COLOR_SCHEME.success}
          subtext="Month to date"
          onClick={() => navigate("/dashboard/revenue")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<Calendar size={24} />}
          label="Active Classes"
          value={dashData.stats?.activeClasses || 0}
          color={COLOR_SCHEME.info}
          subtext="Scheduled today"
          onClick={() => navigate("/dashboard/classes")}
          isLoading={isLoading}
        />
      </div>

      {/* Charts & Tasks Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance Chart */}
        <div
          className="lg:col-span-2 p-6 rounded-lg"
          style={{
            background: "white",
            border: "1px solid rgba(10,36,114,0.1)",
            boxShadow: "0 2px 8px rgba(10,36,114,0.05)",
          }}
        >
          <h3 style={{ fontWeight: 600, color: NAVY, marginBottom: "1rem" }}>
            Attendance Trend (7 days)
          </h3>
          <div className="h-40 flex items-end gap-1">
            {[78, 82, 81, 85, 83, 86, 87].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                  style={{
                    background: COLOR_SCHEME.info,
                    height: `${(value / 100) * 100}%`,
                    minHeight: "4px",
                  }}
                  title={`${value}%`}
                />
                <span style={{ fontSize: "0.7rem", color: MUTED, marginTop: "0.5rem" }}>
                  Day {i + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks Panel */}
        <div
          className="p-6 rounded-lg"
          style={{
            background: "white",
            border: "1px solid rgba(10,36,114,0.1)",
            boxShadow: "0 2px 8px rgba(10,36,114,0.05)",
          }}
        >
          <h3 style={{ fontWeight: 600, color: NAVY, marginBottom: "1rem" }}>
            Pending Tasks ({dashData.tasks?.length || 0})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {dashData.tasks?.map((task) => (
              <TaskItem
                key={task.id}
                title={task.title}
                priority={task.priority}
                dueDate={task.dueDate}
                owner={task.owner}
              />
            ))}
          </div>
          <button
            onClick={() => navigate("/dashboard/tasks")}
            className="w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: `${COLOR_SCHEME.primary}15`,
              color: COLOR_SCHEME.primary,
            }}
          >
            View All Tasks
          </button>
        </div>
      </div>

      {/* Performance Chart */}
      <div
        className="p-6 rounded-lg"
        style={{
          background: "white",
          border: "1px solid rgba(10,36,114,0.1)",
          boxShadow: "0 2px 8px rgba(10,36,114,0.05)",
        }}
      >
        <h3 style={{ fontWeight: 600, color: NAVY, marginBottom: "1rem" }}>
          Academic Performance (6 months)
        </h3>
        <div className="h-40 flex items-end gap-1">
          {[72, 75, 78, 80, 82, 85].map((value, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                style={{
                  background: COLOR_SCHEME.success,
                  height: `${(value / 100) * 100}%`,
                  minHeight: "4px",
                }}
                title={`${value}%`}
              />
              <span style={{ fontSize: "0.7rem", color: MUTED, marginTop: "0.5rem" }}>
                Month {i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3
          style={{
            fontWeight: 600,
            color: NAVY,
            marginBottom: "1rem",
            fontSize: "1.1rem",
          }}
        >
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <QuickActionCard
              key={i}
              icon={action.icon}
              label={action.label}
              description={action.description}
              onClick={action.onClick}
              color={action.color}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        className="p-6 rounded-lg text-center"
        style={{
          background: `${COLOR_SCHEME.primary}10`,
          border: `1px solid ${COLOR_SCHEME.primary}20`,
        }}
      >
        <p style={{ color: NAVY, fontWeight: 500 }}>
          ✨ Dashboard updated successfully
        </p>
        <p style={{ color: MUTED, fontSize: "0.875rem", marginTop: "0.5rem" }}>
          Last synced {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {dashboardContent}
    </>
  );
}
