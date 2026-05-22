import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  ClipboardList,
  AlertCircle,
  Download,
  Settings,
  Clock,
  CheckCircle,
  Plus,
  Activity,
  TrendingDown,
  Info,
  AlertTriangle,
  Banknote,
  MessageCircle,
  CalendarCheck,
  Zap,
  ChevronRight,
  School,
  Bell,
} from "lucide-react";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtime } from "../../hooks/useRealtime";
import { EmptyState } from "../../components/ui/EmptyState";

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

// ─── KPI Card ───────────────────────────────────────────────────────────────
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

function KPICard({ icon, label, value, color, trend, subtext, onClick, isLoading }: KPICardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`p-5 rounded-2xl text-left transition-all ${
        onClick ? "cursor-pointer hover:shadow-xl hover:-translate-y-0.5 active:scale-95" : "cursor-default"
      }`}
      style={{
        background: "white",
        border: "1px solid rgba(10,36,114,0.08)",
        boxShadow: "0 2px 12px rgba(10,36,114,0.06)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}14` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
            style={{
              color: trend.direction === "up" ? COLOR_SCHEME.success : COLOR_SCHEME.danger,
              background: trend.direction === "up" ? `${COLOR_SCHEME.success}15` : `${COLOR_SCHEME.danger}15`,
            }}
          >
            {trend.direction === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}%
          </div>
        )}
      </div>
      <div
        style={{ fontFamily: "'JetBrains Mono', monospace", color: NAVY, fontSize: "1.85rem", fontWeight: 700, marginBottom: "0.2rem", lineHeight: 1 }}
      >
        {isLoading ? <span className="animate-pulse">···</span> : value}
      </div>
      <div style={{ color: MUTED, fontSize: "0.82rem", fontWeight: 500 }}>{label}</div>
      {subtext && <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.4rem" }}>{subtext}</div>}
    </button>
  );
}

// ─── Alert Banner ────────────────────────────────────────────────────────────
interface AlertProps {
  type: "error" | "warning" | "info" | "success";
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
}

function AlertBanner({ type, title, description, action, onDismiss }: AlertProps) {
  const colors = {
    error: { bg: `${COLOR_SCHEME.danger}12`, border: `${COLOR_SCHEME.danger}40`, text: COLOR_SCHEME.danger },
    warning: { bg: `${COLOR_SCHEME.warning}12`, border: `${COLOR_SCHEME.warning}40`, text: COLOR_SCHEME.warning },
    info: { bg: `${COLOR_SCHEME.info}12`, border: `${COLOR_SCHEME.info}40`, text: COLOR_SCHEME.info },
    success: { bg: `${COLOR_SCHEME.success}12`, border: `${COLOR_SCHEME.success}40`, text: COLOR_SCHEME.success },
  };
  const c = colors[type];

  return (
    <div
      className="p-4 rounded-xl flex items-start gap-3 border"
      style={{ background: c.bg, borderColor: c.border }}
    >
      {type === "error" && <AlertCircle size={18} style={{ color: c.text, flexShrink: 0 }} />}
      {type === "warning" && <AlertTriangle size={18} style={{ color: c.text, flexShrink: 0 }} />}
      {type === "info" && <Info size={18} style={{ color: c.text, flexShrink: 0 }} />}
      {type === "success" && <CheckCircle size={18} style={{ color: c.text, flexShrink: 0 }} />}
      <div className="flex-1 min-w-0">
        <div style={{ color: c.text, fontWeight: 600, fontSize: "0.9rem" }}>{title}</div>
        <div style={{ color: MUTED, fontSize: "0.82rem", marginTop: "0.2rem" }}>{description}</div>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-80 active:scale-95"
            style={{ background: c.text, color: "white" }}
          >
            {action.label} →
          </button>
        )}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-lg leading-none hover:opacity-70 flex-shrink-0" style={{ color: MUTED }}>
          ×
        </button>
      )}
    </div>
  );
}

// ─── BECE Countdown ──────────────────────────────────────────────────────────
function BeceCountdown({ beceDate, unreadyCount }: { beceDate: Date; unreadyCount: number }) {
  const navigate = useNavigate();
  const daysLeft = Math.ceil((beceDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysLeft > 60 || daysLeft < 0) return null;

  const urgency = daysLeft <= 14 ? COLOR_SCHEME.danger : daysLeft <= 30 ? COLOR_SCHEME.warning : "#EA580C";

  return (
    <div
      className="p-4 rounded-2xl flex items-center gap-4 border"
      style={{ background: `${urgency}10`, borderColor: `${urgency}30` }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${urgency}20` }}
      >
        <Clock size={22} style={{ color: urgency }} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ color: urgency, fontWeight: 700, fontSize: "0.95rem" }}>
          📚 BECE Countdown — {daysLeft} days remaining
        </div>
        <div style={{ color: MUTED, fontSize: "0.82rem", marginTop: "0.2rem" }}>
          {unreadyCount > 0
            ? `${unreadyCount} students have incomplete assessments. Don't let them walk into BECE unprepared.`
            : "All students have completed assessments. Your class is ready!"}
        </div>
      </div>
      <button
        onClick={() => navigate("/dashboard/gradebook")}
        className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 flex-shrink-0"
        style={{ background: urgency, color: "white" }}
      >
        View Readiness <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Quick Actions Panel ─────────────────────────────────────────────────────
function QuickActionsPanel() {
  const navigate = useNavigate();

  const actions = [
    {
      id: "mark-attendance",
      icon: <CalendarCheck size={22} />,
      label: "Mark Attendance",
      description: "The bell has rung",
      color: COLOR_SCHEME.info,
      gradient: "linear-gradient(135deg, #2563EB, #3B82F6)",
      onClick: () => navigate("/dashboard/attendance"),
    },
    {
      id: "collect-fee",
      icon: <Banknote size={22} />,
      label: "Collect Fee",
      description: "MoMo or cash",
      color: COLOR_SCHEME.success,
      gradient: "linear-gradient(135deg, #059669, #10B981)",
      onClick: () => navigate("/dashboard/fees/collect"),
    },
    {
      id: "send-notice",
      icon: <MessageCircle size={22} />,
      label: "Send Notice",
      description: "WhatsApp broadcast",
      color: "#7C3AED",
      gradient: "linear-gradient(135deg, #6D28D9, #8B5CF6)",
      onClick: () => navigate("/dashboard/whatsapp"),
    },
    {
      id: "add-student",
      icon: <Plus size={22} />,
      label: "Add Student",
      description: "Enrol new pupil",
      color: NAVY,
      gradient: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`,
      onClick: () => navigate("/dashboard/students"),
    },
    {
      id: "generate-reports",
      icon: <ClipboardList size={22} />,
      label: "Report Cards",
      description: "Generate & print",
      color: "#D97706",
      gradient: "linear-gradient(135deg, #B45309, #D97706)",
      onClick: () => navigate("/dashboard/report-cards"),
    },
    {
      id: "send-reminders",
      icon: <Bell size={22} />,
      label: "Fee Reminder",
      description: "WhatsApp defaulters",
      color: COLOR_SCHEME.danger,
      gradient: "linear-gradient(135deg, #DC2626, #EF4444)",
      onClick: () => navigate("/dashboard/fee-reminders"),
    },
  ];

  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: "white", border: "1px solid rgba(10,36,114,0.08)", boxShadow: "0 2px 12px rgba(10,36,114,0.06)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={16} style={{ color: NAVY }} />
          <h3 style={{ fontWeight: 700, color: NAVY, fontSize: "0.95rem" }}>Quick Actions</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <button
            id={`quick-action-${action.id}`}
            key={action.id}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all hover:scale-105 active:scale-95 hover:shadow-md group"
            style={{ background: CREAM, border: "1px solid rgba(10,36,114,0.06)" }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ background: action.gradient }}
            >
              <div style={{ color: "white" }}>{action.icon}</div>
            </div>
            <div className="text-center">
              <div style={{ color: NAVY, fontWeight: 600, fontSize: "0.78rem", lineHeight: 1.2 }}>
                {action.label}
              </div>
              <div style={{ color: MUTED, fontSize: "0.68rem", marginTop: "0.15rem" }}>
                {action.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Task Item ───────────────────────────────────────────────────────────────
function TaskItem({ title, priority, dueDate, owner, onClick }: {
  title: string;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  owner?: string;
  onClick?: () => void;
}) {
  const priorityColor = { high: COLOR_SCHEME.danger, medium: COLOR_SCHEME.warning, low: COLOR_SCHEME.info };

  return (
    <button
      onClick={onClick}
      className="w-full p-3 rounded-xl text-left hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
    >
      <div className="flex items-start justify-between mb-1.5">
        <span className="font-medium text-sm" style={{ color: NAVY }}>{title}</span>
        <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: priorityColor[priority] }} />
      </div>
      <div className="flex items-center gap-4 text-xs" style={{ color: MUTED }}>
        {dueDate && <div className="flex items-center gap-1"><Clock size={11} />{dueDate}</div>}
        {owner && <span>{owner}</span>}
      </div>
    </button>
  );
}

// ─── Admin Overview ──────────────────────────────────────────────────────────
export function AdminOverview() {
  const navigate = useNavigate();
  const { user, school } = useAuth();
  const { data: dash, isLoading } = useDashboardStats();
  const { connected } = useRealtime({ schoolId: (school as any)?.id || (school as any)?.slug || "", userId: (user as any)?.id || "" });
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month" | "year">("today");

  // BECE date — read from school settings if available, otherwise use default JHS3 exam month
  const beceDate = useMemo(() => {
    const raw = (school as any)?.bece_date;
    if (raw) return new Date(raw);
    const now = new Date();
    const candidate = new Date(now.getFullYear(), 4, 20);
    return candidate < now ? new Date(now.getFullYear() + 1, 4, 20) : candidate;
  }, [school]);

  // Mock data — replaced by real data from useDashboardStats
  const mockData = {
    stats: { totalStudents: 542, totalTeachers: 28, attendanceRate: 86, activeClasses: 18 },
    finance: { totalBilled: 125000, totalCollected: 98500 },
    defaulters: { count: 12 },
    pendingCount: 5,
    alerts: [
      {
        id: "fee-alert",
        type: "warning" as const,
        title: "Outstanding Fees",
        description: "12 students have not cleared their fees for this term.",
        action: { label: "View Defaulters", onClick: () => navigate("/dashboard/fees") },
      },
      {
        id: "approval-alert",
        type: "info" as const,
        title: "Pending Approvals",
        description: "5 exam results are waiting for review and approval.",
        action: { label: "Review Now", onClick: () => navigate("/dashboard/assessments") },
      },
    ],
    tasks: [
      { id: "1", title: "Approve Exam Results (Form 3)", priority: "high" as const, dueDate: "Today", owner: "Mr. Kofi" },
      { id: "2", title: "Generate Report Cards", priority: "high" as const, dueDate: "Tomorrow", owner: "System" },
      { id: "3", title: "Set Class Timetable", priority: "medium" as const, dueDate: "Friday", owner: "Mr. Asante" },
      { id: "4", title: "Review Fee Settings", priority: "medium" as const, dueDate: "Next Week", owner: "Finance" },
    ],
  };

  const dashData = dash || mockData;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyDash = dashData as any;
  const attendanceRate = Number(dashData.stats?.attendanceRate ?? 0);
  const totalCollected = dashData.finance?.totalCollected ?? 0;
  const totalBilled = dashData.finance?.totalBilled ?? 0;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  const defaulters = anyDash.defaulters?.count ?? 0;
  const pendingCount = anyDash.pendingCount ?? 0;
  const totalStudents = dashData.stats?.totalStudents ?? 0;

  const visibleAlerts = ((anyDash.alerts || []) as Array<any>).filter((a) => !dismissedAlerts.includes(a.id || ""));

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  return (
    <div className="space-y-5 pb-10">
      {/* ── Hero Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.2 }}>
            {greeting}, {(user as any)?.firstName || (user?.fullName?.split(" ")[0]) || "Admin"} 👋
          </h1>
          <p style={{ color: MUTED, fontSize: "0.88rem", marginTop: "0.4rem" }}>
            {school?.name || "School Dashboard"} · Term 2, 2025/2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connected && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: `${COLOR_SCHEME.success}15` }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: COLOR_SCHEME.success }} />
              <span style={{ fontSize: "0.78rem", color: COLOR_SCHEME.success, fontWeight: 600 }}>Live</span>
            </div>
          )}
          <button onClick={() => navigate("/dashboard/settings")} className="p-2 rounded-xl hover:bg-white transition-colors" title="Settings">
            <Settings size={18} style={{ color: MUTED }} />
          </button>
          <button onClick={() => navigate("/dashboard/export")} className="p-2 rounded-xl hover:bg-white transition-colors" title="Export">
            <Download size={18} style={{ color: MUTED }} />
          </button>
        </div>
      </div>

      {/* ── BECE Countdown (shows ≤60 days before exam) ── */}
      <BeceCountdown beceDate={beceDate} unreadyCount={Math.max(0, Math.floor(totalStudents * 0.08))} />

      {/* ── Alerts ── */}
      {visibleAlerts.length > 0 && (
        <div className="space-y-2">
          {visibleAlerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              type={alert.type}
              title={alert.title}
              description={alert.description}
              action={alert.action}
              onDismiss={() => setDismissedAlerts([...dismissedAlerts, alert.id || ""])}
            />
          ))}
        </div>
      )}

      {/* ── Quick Actions (prominently placed, FIRST thing after alerts) ── */}
      <QuickActionsPanel />

      {/* ── Time Range Filter ── */}
      <div className="flex items-center gap-2">
        <span style={{ color: MUTED, fontSize: "0.78rem", fontWeight: 500 }}>Showing:</span>
        {(["today", "week", "month", "year"] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className="px-3 py-1.5 rounded-lg font-medium transition-all text-sm"
            style={{
              background: timeRange === range ? NAVY : "transparent",
              color: timeRange === range ? "white" : MUTED,
              border: timeRange === range ? "none" : "1px solid rgba(10,36,114,0.1)",
            }}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Primary KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<Users size={22} />}
          label="Total Students"
          value={totalStudents || 0}
          color={COLOR_SCHEME.info}
          trend={{ direction: "up", value: 5 }}
          onClick={() => navigate("/dashboard/students")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<BookOpen size={22} />}
          label="Staff Members"
          value={dashData.stats?.totalTeachers || 0}
          color={COLOR_SCHEME.success}
          trend={{ direction: "up", value: 2 }}
          onClick={() => navigate("/dashboard/staff")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<CalendarCheck size={22} />}
          label="Attendance"
          value={`${attendanceRate}%`}
          color={COLOR_SCHEME.purple}
          trend={{ direction: attendanceRate >= 80 ? "up" : "down", value: 3 }}
          onClick={() => navigate("/dashboard/attendance")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<DollarSign size={22} />}
          label="Fee Collection"
          value={`${collectionRate}%`}
          color={COLOR_SCHEME.indigo}
          trend={{ direction: collectionRate >= 75 ? "up" : "down", value: 2 }}
          subtext={`₵${(totalCollected / 1000).toFixed(1)}K of ₵${(totalBilled / 1000).toFixed(1)}K`}
          onClick={() => navigate("/dashboard/fees/collect")}
          isLoading={isLoading}
        />
      </div>

      {/* ── Secondary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<AlertCircle size={22} />}
          label="Fee Defaulters"
          value={defaulters}
          color={COLOR_SCHEME.danger}
          subtext="Students with unpaid fees"
          onClick={() => navigate("/dashboard/fees")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<ClipboardList size={22} />}
          label="Pending Approvals"
          value={pendingCount}
          color={COLOR_SCHEME.warning}
          subtext="Items awaiting review"
          onClick={() => navigate("/dashboard/assessments")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<DollarSign size={22} />}
          label="Revenue (MTD)"
          value={`₵${(totalCollected / 1000).toFixed(1)}K`}
          color={COLOR_SCHEME.success}
          subtext="Month to date"
          onClick={() => navigate("/dashboard/fees/reports")}
          isLoading={isLoading}
        />
        <KPICard
          icon={<School size={22} />}
          label="Active Classes"
          value={anyDash.stats?.activeClasses || 0}
          color={COLOR_SCHEME.info}
          subtext="Scheduled today"
          onClick={() => navigate("/dashboard/classes")}
          isLoading={isLoading}
        />
      </div>

      {/* ── Charts & Tasks ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Attendance Bar Chart */}
        <div
          className="lg:col-span-2 p-5 rounded-2xl"
          style={{ background: "white", border: "1px solid rgba(10,36,114,0.08)", boxShadow: "0 2px 12px rgba(10,36,114,0.06)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontWeight: 700, color: NAVY, fontSize: "0.95rem" }}>Attendance Trend (7 days)</h3>
            <span style={{ color: MUTED, fontSize: "0.78rem" }}>↑ +1.2% vs last week</span>
          </div>
          {totalStudents === 0 && !isLoading ? (
            <EmptyState
              icon={<CalendarCheck size={36} />}
              title="No attendance data yet"
              description="The bell has rung. Mark your class present before the headmaster asks."
              action={{ label: "Mark Attendance", href: "/dashboard/attendance" }}
              compact
            />
          ) : (
            <div className="h-44 flex items-end gap-1.5">
              {[78, 82, 81, 85, 83, 86, 87].map((val, i) => {
                const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span style={{ fontSize: "0.65rem", color: val >= 85 ? COLOR_SCHEME.success : COLOR_SCHEME.warning, fontWeight: 700 }}>
                      {val}%
                    </span>
                    <div
                      className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                      style={{
                        background: val >= 85
                          ? `linear-gradient(180deg, ${COLOR_SCHEME.success}, ${COLOR_SCHEME.success}88)`
                          : `linear-gradient(180deg, ${COLOR_SCHEME.info}, ${COLOR_SCHEME.info}88)`,
                        height: `${(val / 100) * 140}px`,
                        minHeight: 4,
                      }}
                      title={`${days[i]}: ${val}%`}
                    />
                    <span style={{ fontSize: "0.68rem", color: MUTED }}>{days[i]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tasks Panel */}
        <div
          className="p-5 rounded-2xl"
          style={{ background: "white", border: "1px solid rgba(10,36,114,0.08)", boxShadow: "0 2px 12px rgba(10,36,114,0.06)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontWeight: 700, color: NAVY, fontSize: "0.95rem" }}>
              Pending Tasks
              {anyDash.tasks?.length > 0 && (
                <span
                  className="ml-2 px-2 py-0.5 rounded-full text-xs"
                  style={{ background: `${COLOR_SCHEME.danger}15`, color: COLOR_SCHEME.danger, fontWeight: 700 }}
                >
                  {anyDash.tasks.length}
                </span>
              )}
            </h3>
          </div>
          {!anyDash.tasks?.length ? (
            <EmptyState
              icon={<CheckCircle size={32} />}
              title="All caught up!"
              description="No pending tasks. Great leadership, headmaster."
              compact
            />
          ) : (
            <>
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {(anyDash.tasks as any[]).map((task) => (
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
                className="w-full mt-3 py-2 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: `${COLOR_SCHEME.primary}10`, color: COLOR_SCHEME.primary }}
              >
                View All Tasks
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Academic Performance Chart ── */}
      <div
        className="p-5 rounded-2xl"
        style={{ background: "white", border: "1px solid rgba(10,36,114,0.08)", boxShadow: "0 2px 12px rgba(10,36,114,0.06)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontWeight: 700, color: NAVY, fontSize: "0.95rem" }}>Academic Performance (6 months)</h3>
          <span style={{ color: MUTED, fontSize: "0.78rem" }}>All classes · SBA + Exams</span>
        </div>
        <div className="h-36 flex items-end gap-2">
          {[
            { val: 72, month: "Nov" }, { val: 75, month: "Dec" }, { val: 78, month: "Jan" },
            { val: 80, month: "Feb" }, { val: 82, month: "Mar" }, { val: 85, month: "Apr" },
          ].map(({ val, month }, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span style={{ fontSize: "0.65rem", color: NAVY, fontWeight: 700 }}>{val}%</span>
              <div
                className="w-full rounded-t-lg"
                style={{
                  background: `linear-gradient(180deg, ${COLOR_SCHEME.success}, ${COLOR_SCHEME.success}55)`,
                  height: `${(val / 100) * 110}px`,
                  minHeight: 4,
                }}
                title={`${month}: ${val}%`}
              />
              <span style={{ fontSize: "0.68rem", color: MUTED }}>{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer Status ── */}
      <div
        className="p-4 rounded-2xl flex items-center justify-between"
        style={{ background: `${COLOR_SCHEME.primary}08`, border: `1px solid ${COLOR_SCHEME.primary}15` }}
      >
        <div className="flex items-center gap-2">
          <Activity size={15} style={{ color: NAVY }} />
          <span style={{ color: NAVY, fontSize: "0.82rem", fontWeight: 500 }}>
            Last synced {new Date().toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
        <button
          onClick={() => navigate("/dashboard/audit-logs")}
          className="text-xs font-medium hover:underline"
          style={{ color: MUTED }}
        >
          View audit log →
        </button>
      </div>
    </div>
  );
}
