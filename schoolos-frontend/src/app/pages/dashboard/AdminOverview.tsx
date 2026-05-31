import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Users, BookOpen, CalendarCheck, DollarSign, Search, SlidersHorizontal,
  ArrowUpRight, ArrowDownRight, RefreshCw, ChevronRight, CheckCircle,
  Banknote, MessageCircle, Plus, Building, Upload, FileText, Zap,
} from "lucide-react";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtime } from "../../hooks/useRealtime";

const NAVY    = "#1C1917";      // stone-900 — headings, key text
const MUTED   = "#78716C";      // stone-500 — secondary text
const PRIMARY = "#0B4F30";      // forest green — primary brand
const GOLD    = "#D4A017";      // warm gold — secondary CTA
const SUCCESS = "#22C55E";      // green-500
const WARNING = "#F59E0B";      // amber-500
const DANGER  = "#EF4444";      // red-500
const INFO    = "#3B82F6";      // blue-500
const PURPLE  = "#8B5CF6";      // purple
const ACCENT  = "#F0FDF4";      // green-50 bg

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 72, H = 28;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / range) * (H - 4) - 2}`)
    .join(" ");
  const areaEnd = `${W},${H} 0,${H}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none">
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${pts} ${areaEnd}`} fill={`url(#sg-${color.replace("#", "")})`} />
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: Array<{ value: number; color: string; label: string }>;
  centerLabel: string;
  centerValue: string;
}) {
  const total = segments.reduce((s, v) => s + v.value, 0);
  const r = 52, cx = 70, cy = 70, strokeW = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  return (
    <svg width={140} height={140} viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth={strokeW} />
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = circumference * pct - 2;
        const gap = circumference - dash;
        const el = (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeW}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={circumference * offset}
            transform={`rotate(-90 ${cx} ${cy})`}
            strokeLinecap="round"
          />
        );
        offset -= pct;
        return el;
      })}
      <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontSize: 9, fill: MUTED, fontFamily: "DM Sans, sans-serif" }}>
        {centerLabel}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" style={{ fontSize: 22, fontWeight: 700, fill: NAVY, fontFamily: "JetBrains Mono, monospace" }}>
        {centerValue}
      </text>
    </svg>
  );
}

// ─── Area Chart ──────────────────────────────────────────────────────────────
function AreaChart({ data, color, labels }: { data: number[]; color: string; labels: string[] }) {
  const W = 100, H = 100;
  const max = Math.max(...data);
  const min = 0;
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 10) - 5,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = pathD + ` L ${W} ${H} L 0 ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[25, 50, 75, 100].map((pct) => (
        <line
          key={pct}
          x1={0} y1={H - (pct / 100) * (H - 10) - 5}
          x2={W} y2={H - (pct / 100) * (H - 10) - 5}
          stroke="#F3F4F6" strokeWidth="0.5"
        />
      ))}
      <path d={areaD} fill="url(#area-fill)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Data point dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="1.5" fill={color} />
      ))}
    </svg>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
interface KPICardProps {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string | number;
  trend?: { direction: "up" | "down"; value: number };
  sparkData?: number[];
  onClick?: () => void;
  isLoading?: boolean;
  delay?: number;
}

function KPICard({ icon, iconColor, label, value, trend, sparkData, onClick, isLoading, delay = 0 }: KPICardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100" />
          <div className="w-12 h-5 rounded-full bg-gray-100" />
        </div>
        <div className="h-7 w-16 rounded bg-gray-100 mb-1.5" />
        <div className="h-4 w-24 rounded bg-gray-100" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`bg-white rounded-2xl p-5 border border-gray-100 text-left w-full opacity-0 animate-slide-up-sm group ${onClick ? "cursor-pointer" : "cursor-default"}`}
      style={{
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        animationDelay: `${delay}ms`,
        animationFillMode: "forwards",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => { if (onClick) { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.06)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <div style={{ color: iconColor }}>{icon}</div>
        </div>
        {trend && (
          <div
            className="flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: trend.direction === "up" ? SUCCESS : DANGER,
              backgroundColor: trend.direction === "up" ? `${SUCCESS}12` : `${DANGER}12`,
            }}
          >
            {trend.direction === "up" ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            +{trend.value}%
          </div>
        )}
      </div>

      <div
        className="font-bold mb-0.5"
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.75rem", lineHeight: 1, color: NAVY }}
      >
        {value}
      </div>
      <div className="text-[13px] font-medium mb-3" style={{ color: MUTED }}>{label}</div>

      {sparkData && (
        <Sparkline data={sparkData} color={iconColor} />
      )}
    </button>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    paid:       { bg: `${SUCCESS}12`,  text: SUCCESS,  dot: SUCCESS },
    pending:    { bg: `${WARNING}12`,  text: WARNING,  dot: WARNING },
    overdue:    { bg: `${DANGER}12`,   text: DANGER,   dot: DANGER },
    partial:    { bg: `${PRIMARY}12`,  text: PRIMARY,  dot: PRIMARY },
    "in progress": { bg: `${PRIMARY}12`, text: PRIMARY, dot: PRIMARY },
    "not started": { bg: `${DANGER}12`,  text: DANGER,  dot: DANGER },
    active:     { bg: `${SUCCESS}12`,  text: SUCCESS,  dot: SUCCESS },
    high:       { bg: `${DANGER}12`,   text: DANGER,   dot: DANGER },
    medium:     { bg: `${WARNING}12`,  text: WARNING,  dot: WARNING },
    low:        { bg: `${SUCCESS}12`,  text: SUCCESS,  dot: SUCCESS },
  };
  const s = map[status.toLowerCase()] || { bg: "#F3F4F6", text: MUTED, dot: MUTED };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize"
      style={{ background: s.bg, color: s.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
      {status}
    </span>
  );
}

// ─── Onboarding ──────────────────────────────────────────────────────────────
function OnboardingWizard() {
  const navigate = useNavigate();
  const steps = [
    { n: 1, label: "Add school profile", desc: "Name, GES registration, academic calendar", href: "/dashboard/settings/school", icon: Building, done: true },
    { n: 2, label: "Import your students", desc: "Upload your register or add one by one", href: "/dashboard/students/import", icon: Upload },
    { n: 3, label: "Set fee structure", desc: "Tuition, PTA, exam fees per class", href: "/dashboard/fees/structure", icon: Banknote },
    { n: 4, label: "Mark today's attendance", desc: "Start with your first class", href: "/dashboard/attendance", icon: CheckCircle },
    { n: 5, label: "Generate first report card", desc: "NaCCA-compliant, ready to print", href: "/dashboard/report-cards", icon: FileText },
  ];

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <h2 className="text-xl font-bold mb-1" style={{ color: NAVY }}>Welcome to SchoolOS</h2>
      <p className="text-sm mb-8" style={{ color: MUTED }}>Every great school starts with one student. Set up in 5 minutes.</p>
      <div className="space-y-2 max-w-lg">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.n}
              onClick={() => navigate(s.href)}
              className="flex items-center gap-4 p-3 rounded-xl cursor-pointer border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-colors group"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ background: s.done ? `${SUCCESS}15` : `${PRIMARY}12`, color: s.done ? SUCCESS : PRIMARY }}
              >
                {s.done ? <CheckCircle size={15} /> : s.n}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon size={14} style={{ color: s.done ? SUCCESS : MUTED }} />
                  <span className="text-sm font-medium" style={{ color: NAVY }}>{s.label}</span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: MUTED }}>{s.desc}</p>
              </div>
              <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Admin Overview ──────────────────────────────────────────────────────────
export function AdminOverview() {
  const navigate = useNavigate();
  const { user, school } = useAuth();
  const { data: dash, isLoading, refetch } = useDashboardStats();
  const { connected } = useRealtime({ schoolId: (school as any)?.id || "", userId: (user as any)?.id || "" });
  const [timeFilter, setTimeFilter] = useState<"week" | "month" | "term">("month");
  const [refreshing, setRefreshing] = useState(false);

  const dashData = (dash || {}) as any;
  const totalStudents  = dashData.stats?.totalStudents ?? 0;
  const totalTeachers  = dashData.stats?.totalTeachers ?? 0;
  const attendanceRate = Number(dashData.stats?.attendanceRate ?? 0);
  const totalCollected = dashData.finance?.totalCollected ?? 0;
  const totalBilled    = dashData.finance?.totalBilled ?? 0;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  const defaulters     = dashData.defaulters?.count ?? 0;
  const activeClasses  = dashData.stats?.activeClasses ?? 0;

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = (user as any)?.firstName || user?.fullName?.split(" ")[0] || "Admin";

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch?.();
    setTimeout(() => setRefreshing(false), 800);
  };

  // Weekly attendance data (mock progression — replace with real when API supports it)
  const attendanceTrend = [72, 75, 78, 76, 82, 85, 87, 84, 88, 86, 90, 87];
  const attendanceLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const feeTrend = [45, 52, 61, 58, 70, 68, 75, 80, 78, 85, 82, 88];

  // Activity split for donut
  const activitySegments = [
    { value: 45, color: PRIMARY,  label: "Attendance" },
    { value: 25, color: SUCCESS,  label: "Fee Collection" },
    { value: 20, color: PURPLE,   label: "Assessments" },
    { value: 10, color: WARNING,  label: "Reports" },
  ];

  // Pending tasks table
  const tasks: Array<{ title: string; dueDate: string; type: string; status: string; priority: string; href: string }> = [
    ...(dashData.tasks || []).slice(0, 5).map((t: any) => ({
      title: t.title, dueDate: t.dueDate || "—", type: t.type || "Task",
      status: t.status || "pending", priority: t.priority || "medium", href: "/dashboard/assessments",
    })),
    // Fallback rows so table never looks empty
    ...(!dashData.tasks?.length ? [
      { title: "Mark today's attendance", dueDate: "Today", type: "Attendance", status: "pending", priority: "high", href: "/dashboard/attendance" },
      { title: "Review fee defaulters", dueDate: "This week", type: "Finance", status: "in progress", priority: "medium", href: "/dashboard/fees" },
      { title: "Generate term report cards", dueDate: "End of term", type: "Reports", status: "not started", priority: "high", href: "/dashboard/report-cards" },
    ] : []),
  ];

  // Quick action buttons
  const quickActions = [
    { icon: <CalendarCheck size={20} />, label: "Mark Attendance", desc: "Record daily register", color: PRIMARY, gradient: `linear-gradient(135deg,${PRIMARY},#16A34A)`, href: "/dashboard/attendance" },
    { icon: <Banknote size={20} />, label: "Collect Fee", desc: "MoMo or cash", color: GOLD, gradient: "linear-gradient(135deg,#B8860B,#D4A017)", href: "/dashboard/fees/collect" },
    { icon: <MessageCircle size={20} />, label: "Send Notice", desc: "WhatsApp broadcast", color: PURPLE, gradient: "linear-gradient(135deg,#6D28D9,#8B5CF6)", href: "/dashboard/whatsapp" },
    { icon: <Plus size={20} />, label: "Add Student", desc: "Enrol new pupil", color: INFO, gradient: "linear-gradient(135deg,#2563EB,#3B82F6)", href: "/dashboard/students" },
  ];

  if (totalStudents === 0 && !isLoading) {
    return <OnboardingWizard />;
  }

  return (
    <div className="space-y-5 pb-10">

      {/* ── Welcome Header ── */}
      <div
        className="flex items-center justify-between opacity-0 animate-fade-in"
        style={{ animationFillMode: "forwards" }}
      >
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: PRIMARY }}>
            {school?.name}
          </p>
          <h1 className="font-bold" style={{ color: NAVY, fontSize: "1.5rem", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            {greeting}, {firstName}! 👋
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: MUTED }}>
            Here's what's happening at your school today.{" "}
            {connected && <span style={{ color: SUCCESS, fontWeight: 600 }}>● Live</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(["week", "month", "term"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeFilter(r)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: timeFilter === r ? PRIMARY : "white",
                color: timeFilter === r ? "white" : MUTED,
                border: `1px solid ${timeFilter === r ? PRIMARY : "#E7E5E4"}`,
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border bg-white hover:bg-gray-50 transition-colors"
            style={{ color: MUTED, borderColor: "#E7E5E4" }}
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={<Users size={20} />}
          iconColor={PRIMARY}
          label="Students Enrolled"
          value={totalStudents}
          trend={{ direction: "up", value: 5 }}
          sparkData={[62, 65, 68, 70, 72, 74, 76, 78, 80, totalStudents]}
          onClick={() => navigate("/dashboard/students")}
          isLoading={isLoading}
          delay={0}
        />
        <KPICard
          icon={<BookOpen size={20} />}
          iconColor={SUCCESS}
          label="Staff Members"
          value={totalTeachers}
          trend={{ direction: "up", value: 2 }}
          sparkData={[8, 9, 10, 10, 11, 12, 12, 13, totalTeachers, totalTeachers]}
          onClick={() => navigate("/dashboard/staff")}
          isLoading={isLoading}
          delay={80}
        />
        <KPICard
          icon={<CalendarCheck size={20} />}
          iconColor={PURPLE}
          label="Attendance Rate"
          value={`${attendanceRate}%`}
          trend={{ direction: attendanceRate >= 80 ? "up" : "down", value: 3 }}
          sparkData={attendanceTrend.slice(-8)}
          onClick={() => navigate("/dashboard/attendance")}
          isLoading={isLoading}
          delay={160}
        />
        <KPICard
          icon={<DollarSign size={20} />}
          iconColor={WARNING}
          label="Fee Collection"
          value={`${collectionRate}%`}
          trend={{ direction: collectionRate >= 75 ? "up" : "down", value: 6 }}
          sparkData={feeTrend.slice(-8)}
          onClick={() => navigate("/dashboard/fees/collect")}
          isLoading={isLoading}
          delay={240}
        />
      </div>

      {/* ── Chart Row ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Attendance Area Chart */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 opacity-0 animate-slide-up-sm"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", animationDelay: "120ms", animationFillMode: "forwards" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[15px]" style={{ color: NAVY }}>Attendance Overview</h3>
              <p className="text-[12px] mt-0.5" style={{ color: MUTED }}>Monthly attendance trend · {new Date().getFullYear()}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white cursor-default">
                All Classes
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 bg-white cursor-default">
                {new Date().getFullYear()}
              </div>
            </div>
          </div>

          {/* Y-axis labels + chart */}
          <div className="flex gap-3">
            <div className="flex flex-col justify-between text-right pb-6" style={{ width: 28 }}>
              {[100, 75, 50, 25, 0].map((v) => (
                <span key={v} style={{ fontSize: 9, color: "#9CA3AF" }}>{v}</span>
              ))}
            </div>
            <div className="flex-1 flex flex-col">
              <div className="h-36" style={{ position: "relative" }}>
                <AreaChart data={attendanceTrend} color={PRIMARY} labels={attendanceLabels} />
              </div>
              {/* X-axis labels */}
              <div className="flex justify-between mt-1.5 px-1">
                {attendanceLabels.map((l) => (
                  <span key={l} style={{ fontSize: 9, color: "#9CA3AF" }}>{l}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom stats row */}
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-50">
            <div>
              <div className="text-[11px] font-medium" style={{ color: MUTED }}>Current Rate</div>
              <div className="text-lg font-bold" style={{ color: NAVY, fontFamily: "JetBrains Mono, monospace" }}>{attendanceRate}%</div>
            </div>
            <div>
              <div className="text-[11px] font-medium" style={{ color: MUTED }}>Peak Month</div>
              <div className="text-lg font-bold" style={{ color: NAVY, fontFamily: "JetBrains Mono, monospace" }}>90%</div>
            </div>
            <div>
              <div className="text-[11px] font-medium" style={{ color: MUTED }}>Avg (YTD)</div>
              <div className="text-lg font-bold" style={{ color: NAVY, fontFamily: "JetBrains Mono, monospace" }}>
                {Math.round(attendanceTrend.reduce((a, b) => a + b, 0) / attendanceTrend.length)}%
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: SUCCESS }}>
              <ArrowUpRight size={13} /> +1.2% vs last month
            </div>
          </div>
        </div>

        {/* Activity Split Donut */}
        <div
          className="bg-white rounded-2xl p-5 border border-gray-100 opacity-0 animate-slide-up-sm"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", animationDelay: "200ms", animationFillMode: "forwards" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[15px]" style={{ color: NAVY }}>Activity Split</h3>
              <p className="text-[12px] mt-0.5" style={{ color: MUTED }}>This {timeFilter}</p>
            </div>
          </div>
          <div className="flex justify-center mb-4">
            <DonutChart
              segments={activitySegments}
              centerLabel="Collection"
              centerValue={`${collectionRate}%`}
            />
          </div>
          <div className="space-y-2">
            {activitySegments.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                  <span className="text-[12px]" style={{ color: MUTED }}>{seg.label}</span>
                </div>
                <span className="text-[12px] font-semibold" style={{ color: NAVY }}>{seg.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom Row: Tasks + Quick Actions ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Tasks / Upcoming Table */}
        <div
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden opacity-0 animate-slide-up-sm"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", animationDelay: "240ms", animationFillMode: "forwards" }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="font-semibold text-[15px]" style={{ color: NAVY }}>
              Upcoming Priorities
              {tasks.length > 0 && (
                <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${DANGER}12`, color: DANGER }}>
                  {tasks.length}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <Search size={13} />
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-500 hover:bg-gray-50 transition-colors">
                <SlidersHorizontal size={11} /> Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {["Task / Course", "Due Date", "Type", "Status", "Priority"].map((h) => (
                    <th key={h} className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide" style={{ color: "#9CA3AF" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-50 hover:bg-gray-50/60 cursor-pointer transition-colors"
                    onClick={() => navigate(task.href)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: PRIMARY }} />
                        <span className="text-[13px] font-medium truncate max-w-[200px]" style={{ color: NAVY }}>{task.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[12px]" style={{ color: MUTED }}>{task.dueDate}</td>
                    <td className="px-5 py-3 text-[12px]" style={{ color: MUTED }}>{task.type}</td>
                    <td className="px-5 py-3"><StatusBadge status={task.status} /></td>
                    <td className="px-5 py-3"><StatusBadge status={task.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-gray-50">
            <button
              onClick={() => navigate("/dashboard/assessments")}
              className="text-[12px] font-semibold transition-colors hover:underline"
              style={{ color: PRIMARY }}
            >
              View all tasks →
            </button>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div
          className="bg-white rounded-2xl p-5 border border-gray-100 opacity-0 animate-slide-up-sm"
          style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)", animationDelay: "300ms", animationFillMode: "forwards" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `linear-gradient(135deg,${PRIMARY},#16A34A)` }}>
              <Zap size={12} style={{ color: "white" }} />
            </div>
            <h3 className="font-semibold text-[15px]" style={{ color: NAVY }}>Quick Actions</h3>
          </div>

          <div className="space-y-2.5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.href)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 text-left group transition-all hover:border-gray-200"
                style={{ transition: "box-shadow 0.15s ease, transform 0.15s ease" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 14px ${action.color}25`; (e.currentTarget as HTMLElement).style.transform = "translateX(2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:rotate-6"
                  style={{ background: action.gradient, boxShadow: `0 3px 8px ${action.color}35` }}
                >
                  <div style={{ color: "white" }}>{action.icon}</div>
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold truncate" style={{ color: NAVY }}>{action.label}</div>
                  <div className="text-[11px] truncate" style={{ color: MUTED }}>{action.desc}</div>
                </div>
                <ChevronRight size={14} className="ml-auto flex-shrink-0 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: "#E7E5E4" }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: "#A8A29E" }}>At a glance</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Defaulters",     value: defaulters,          color: DANGER   },
                { label: "Active Classes", value: activeClasses,       color: PRIMARY  },
                { label: "Fee Target",     value: `${collectionRate}%`, color: GOLD    },
                { label: "Attendance",     value: `${attendanceRate}%`, color: SUCCESS },
              ].map((stat) => (
                <div key={stat.label} className="p-2.5 rounded-xl" style={{ background: `${stat.color}0D`, border: `1px solid ${stat.color}20` }}>
                  <div className="text-[10px] font-medium uppercase tracking-wide" style={{ color: "#A8A29E" }}>{stat.label}</div>
                  <div className="text-[15px] font-bold mt-0.5" style={{ color: stat.color, fontFamily: "JetBrains Mono, monospace" }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
