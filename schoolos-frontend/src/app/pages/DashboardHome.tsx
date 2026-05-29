import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users, Wallet, Clock, BookOpen, MessageSquare,
  ArrowRight, CheckCircle2, Bell, Briefcase,
  TrendingUp, AlertTriangle,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
} from "recharts";
import { api } from "../services/api";
import {
  LoadingSpinner, StatCard, ChartCard, ActivityFeed, QuickActions, SectionHeader,
  DashboardCard, MiniTable, palette,
} from "../components/dashboard";

const { NAVY, NAVY_LIGHT, MUTED } = palette;

const quickActions = [
  { label: "Mark Attendance", icon: Clock, color: "#6366F1", path: "/dashboard/students" },
  { label: "Send Fee Reminder", icon: Bell, color: "#F59E0B", path: "/dashboard/communication" },
  { label: "Generate Report", icon: BookOpen, color: "#10B981", path: "/dashboard/academics" },
  { label: "Add Student", icon: Users, color: "#EC4899", path: "/dashboard/students" },
];

// ─── PHASE 1: Types for new API response shapes ──────────────────
type MonthlyRevenue = { month: string; label: string; amount: number; count: number };
type PaymentBreakdown = { status: string; amount: number; count: number };
type FinanceSummary = {
  totalBilled: number; totalPaid: number; totalOutstanding: number;
  overdueAmount: number; totalCollected: number;
  invoiceCount: number; overdueCount: number; paymentCount: number;
};
type AttTrendItem = { date: string; present: number; total: number; rate: number };
type StaffSummary = {
  totalStaff: number; teachingStaff: number; nonTeachingStaff: number;
  staffAttendanceToday: number; staffPresentToday: number; staffAttendanceRate: number;
};
type ClassComparisonItem = { class_id: string; class_name: string; average: number; rate: number; studentCount: number };
type TopPerformer = { student: { name: string; admission_no: string }; class: { name: string }; average: number; grade: string };
type RiskAlert = { type: string; severity: string; student_id: string; student: { name: string; class_name: string }; metric: number; message: string };
type AuditLog = { id: string; user: { name: string; role: string }; action: string; resource: string; created_at: string };

const STATUS_COLORS: Record<string, string> = {
  completed: "#10B981", paid: "#10B981",
  pending: "#F59E0B", partial: "#F59E0B",
  failed: "#EF4444", overdue: "#EF4444",
  refunded: "#8B5CF6",
};

export function DashboardHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // ─── PHASE 1: New state from finance endpoints ────────────
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown[]>([]);
  // ─── PHASE 2: State for new stat cards ────────────────────
  const [staffSummary, setStaffSummary] = useState<StaffSummary | null>(null);
  // ─── PHASE 3: Attendance trend state ──────────────────────
  const [attendanceTrend, setAttendanceTrend] = useState<AttTrendItem[]>([]);
  // ─── PHASE 4: Academic performance state ──────────────────
  const [classComparison, setClassComparison] = useState<ClassComparisonItem[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [riskAlerts, setRiskAlerts] = useState<RiskAlert[]>([]);
  // ─── PHASE 5: Activity feed state ─────────────────────────
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Existing state kept for student/teacher counts and attendance rate
  const [stats, setStats] = useState<{
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number | string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const safeFetch = async <T,>(url: string): Promise<T | null> => {
        try {
          const res = await api.get<T>(url);
          return res.data ?? null;
        } catch {
          return null;
        }
      };

      const [dashData, finSum, finMonth, finBreak, staffSum,
        attTrend, termsData, auditData] = await Promise.all([
        safeFetch<{ totalStudents: number; totalTeachers: number; attendanceRate: number | string }>("/api/school/dashboard"),
        safeFetch<FinanceSummary>("/api/school/finance/summary"),
        safeFetch<{ monthly: MonthlyRevenue[] }>("/api/school/finance/monthly?months=6"),
        safeFetch<{ breakdown: PaymentBreakdown[] }>("/api/school/finance/payment-status-breakdown"),
        safeFetch<StaffSummary>("/api/school/staff/summary"),
        safeFetch<AttTrendItem[]>("/api/school/analytics/attendance-trend?days=30"),
        safeFetch<{ terms: { id: string; name: string; is_current: boolean }[] }>("/api/school/terms"),
        safeFetch<{ logs: AuditLog[] }>("/api/school/audit?limit=10"),
      ]);

      if (dashData) setStats(dashData);
      if (finSum) setFinanceSummary(finSum);
      if (finMonth) setMonthlyRevenue(finMonth.monthly || []);
      if (finBreak) setPaymentBreakdown(finBreak.breakdown || []);
      if (staffSum) setStaffSummary(staffSum);
      if (attTrend) setAttendanceTrend(attTrend);
      if (auditData) setAuditLogs(auditData.logs || []);

      const currentTerm = (termsData?.terms || []).find(t => t.is_current);
      if (currentTerm && finSum) {
        const [classRes, topRes, riskRes] = await Promise.all([
          safeFetch<ClassComparisonItem[]>(`/api/school/analytics/class-comparison?term_id=${currentTerm.id}`),
          safeFetch<{ top: TopPerformer[]; bottom: any[] }>(`/api/school/analytics/top-bottom?term_id=${currentTerm.id}&limit=5`),
          safeFetch<{ alerts: RiskAlert[]; openInterventions: any[] }>("/api/school/analytics/risk-alerts"),
        ]);
        if (classRes) setClassComparison(classRes);
        if (topRes) setTopPerformers(topRes.top || []);
        if (riskRes) setRiskAlerts(riskRes.alerts || []);
      }

      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  // ─── PHASE 1: Derived finance values ───────────────────────────
  const totalStudents = stats?.totalStudents ?? 0;
  const totalTeachers = stats?.totalTeachers ?? 0;
  const attendanceRate = stats?.attendanceRate ?? 0;

  const totalBilled = financeSummary?.totalBilled ?? 0;
  const totalCollected = financeSummary?.totalCollected ?? 0;
  const totalOutstanding = financeSummary?.totalOutstanding ?? 0;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Monthly revenue chart data (PHASE 1: replaces old fees-based revenueData)
  const revenueData = monthlyRevenue.map(m => ({ month: m.label, amount: m.amount }));

  // Payment status pie chart (PHASE 1: replaces old fees status pie)
  const pieData = (paymentBreakdown.length > 0 ? paymentBreakdown : [
    { status: "completed", amount: 1, count: 0 },
  ]).map(p => ({
    name: p.status.charAt(0).toUpperCase() + p.status.slice(1),
    value: p.amount,
    color: STATUS_COLORS[p.status] || MUTED,
  }));
  const totalPieAmount = pieData.reduce((s, p) => s + p.value, 0);

  // Staff summary (PHASE 2)
  const totalStaff = staffSummary?.totalStaff ?? 0;
  const staffAttRate = staffSummary?.staffAttendanceRate ?? 0;
  const teachingStaff = staffSummary?.teachingStaff ?? 0;

  // PHASE 5: Activity feed from audit logs
  const activityItems = auditLogs.map((log) => ({
    icon: log.action === 'created' ? CheckCircle2
      : log.action === 'updated' ? BookOpen
      : log.action === 'deleted' ? AlertTriangle
      : Clock,
    color: log.action === 'created' ? "#10B981"
      : log.action === 'updated' ? "#6366F1"
      : log.action === 'deleted' ? "#EF4444"
      : "#F59E0B",
    text: `${log.user?.name || "Someone"} ${log.action} ${log.resource}`,
    time: log.created_at ? new Date(log.created_at).toLocaleDateString() : "",
  }));

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* ─── PHASE 1+2: Stat cards row ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={totalStudents.toLocaleString()} color="#6366F1" path="/dashboard/students" badge={`${totalTeachers} teacher${totalTeachers !== 1 ? "s" : ""}`} />
        <StatCard icon={Wallet} label="Total Revenue" value={`GHS ${(totalCollected / 100).toLocaleString()}`} color="#10B981" path="/dashboard/finance" badge={`${collectionRate}% collected`} />
        <StatCard icon={Clock} label="Avg Attendance" value={`${attendanceRate}%`} color="#F59E0B" path="/dashboard/attendance" badge="Today" />
        <StatCard icon={Briefcase} label="Total Staff" value={totalStaff.toLocaleString()} color="#6366F1" path="/dashboard/staff" badge={`${teachingStaff} teaching`} />
      </div>

      {/* ─── Additional stat cards (PHASE 2) ───────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={MessageSquare} label="Fee Collection" value={`${collectionRate}%`} color="#25D366" onClick={() => navigate('/dashboard/fees', { state: { filter: 'overdue' } })} badge={`${financeSummary?.overdueCount || 0} overdue`} />
        <StatCard icon={Clock} label="Staff Attendance" value={`${staffAttRate}%`} color="#F59E0B" onClick={() => { console.warn('Staff attendance detail page not yet implemented – navigating to staff directory'); navigate('/dashboard/staff'); }} badge="Today" />
        <StatCard icon={Wallet} label="Outstanding" value={`GHS ${(totalOutstanding / 100).toLocaleString()}`} color="#EF4444" onClick={() => navigate('/dashboard/fees', { state: { filter: 'overdue' } })} badge={`${financeSummary?.overdueCount || 0} overdue`} />
        <StatCard icon={TrendingUp} label="Collection Rate" value={`${collectionRate}%`} color="#10B981" path="/dashboard/finance" badge={`${totalCollected}/${totalBilled}`} />
      </div>

      {/* ─── PHASE 1: Fee Collection chart + Payment Status pie (replaced) ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <ChartCard title="Fee Collection" subtitle="Last 6 months" action={
          <button onClick={() => navigate("/dashboard/finance")} className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity" style={{ color: NAVY_LIGHT }}>
            View all <ArrowRight size={13} />
          </button>
        }>
          {revenueData.some((d) => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={NAVY} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={NAVY} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `GHS ${(v / 100).toFixed(0)}`} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`GHS ${(v / 100).toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="amount" stroke={NAVY} strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px]" style={{ color: MUTED }}>
              <p style={{ fontSize: "0.85rem" }}>No fee data yet — revenue chart will appear once payments are recorded.</p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Payment Status" subtitle={`${totalStudents} student${totalStudents !== 1 ? "s" : ""}`}>
          {totalPieAmount > 1 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`GHS ${(v / 100).toLocaleString()}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span style={{ color: MUTED, fontSize: "0.8rem" }}>{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: NAVY, fontSize: "0.82rem", fontWeight: 600 }}>
                        GHS {(d.value / 100).toLocaleString()}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: `${d.color}15`, color: d.color, fontSize: "0.65rem" }}>
                        {totalPieAmount > 0 ? ((d.value / totalPieAmount) * 100).toFixed(0) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[260px]" style={{ color: MUTED }}>
              <p style={{ fontSize: "0.85rem", textAlign: "center" }}>
                No payments recorded yet.<br />Payment status breakdown will appear here.
              </p>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ─── PHASE 3: Attendance Trend Chart ─────────────────────── */}
      <ChartCard title="Attendance Trend" subtitle="Last 30 days" action={
        <button onClick={() => navigate("/dashboard/attendance")} className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity" style={{ color: NAVY_LIGHT }}>
          View attendance <ArrowRight size={13} />
        </button>
      }>
        {attendanceTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={attendanceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v: string) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric" })} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Attendance"]} labelFormatter={(v: string) => new Date(v).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })} />
              <Line type="monotone" dataKey="rate" stroke="#6366F1" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[220px]" style={{ color: MUTED }}>
            <p style={{ fontSize: "0.85rem" }}>No attendance data yet — trend will appear once records are created.</p>
          </div>
        )}
      </ChartCard>

      {/* ─── PHASE 4: Academic Performance Widget ────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <DashboardCard title="Class Performance Comparison" action={
          <button onClick={() => navigate("/dashboard/assessments")} className="flex items-center gap-1 text-xs" style={{ color: NAVY }}>
            View All <ArrowRight size={11} />
          </button>
        }>
          {classComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.05)" />
                <XAxis dataKey="class_name" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Average"]} />
                <Bar dataKey="rate" fill={NAVY} radius={[6, 6, 0, 0]} cursor="pointer"
                  onClick={(data) => {
                    if (data?.payload?.class_id) {
                      navigate(`/dashboard/students?class_id=${data.payload.class_id}`);
                    }
                  }}
                  activeBar={{ fill: '#ffc658' }} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px]" style={{ color: MUTED }}>
              <p style={{ fontSize: "0.85rem" }}>Class performance data will appear once assessments are graded.</p>
            </div>
          )}
        </DashboardCard>

        <DashboardCard title="Top Performers">
          {topPerformers.length > 0 ? (
            <MiniTable
              headers={["Student", "Class", "Average", "Grade"]}
              rows={topPerformers.map((p) => [
                p.student?.name || "—",
                p.class?.name || "—",
                `${p.average}%`,
                p.grade || "—",
              ])}
            />
          ) : (
            <div className="flex items-center justify-center h-[220px]" style={{ color: MUTED }}>
              <p style={{ fontSize: "0.85rem" }}>Top performers will appear once report cards are published.</p>
            </div>
          )}
        </DashboardCard>
      </div>

      {/* ─── At-Risk Students (PHASE 4) ─────────────────────────── */}
      {riskAlerts.length > 0 && (
        <DashboardCard title={`At-Risk Students (${riskAlerts.length})`} action={
          <button onClick={() => navigate("/dashboard/students")} className="flex items-center gap-1 text-xs" style={{ color: NAVY }}>
            View Students <ArrowRight size={11} />
          </button>
        }>
          <MiniTable
            headers={["Student", "Type", "Severity", "Metric"]}
            rows={riskAlerts.slice(0, 5).map((a) => [
              a.student?.name || "—",
              a.type,
              <span key={a.student_id} className="px-2 py-0.5 rounded-full text-xs" style={{
                background: a.severity === 'high' ? "#FEF2F2" : "#FEF3C7",
                color: a.severity === 'high' ? "#EF4444" : "#92400E",
              }}>{a.severity}</span>,
              a.message,
            ])}
          />
        </DashboardCard>
      )}

      {/* ─── PHASE 5: Replaced Activity Feed + Quick Actions ────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)", boxShadow: "0 4px 24px rgba(10,36,114,0.06)" }}>
          <SectionHeader title="Recent Activity" />
          <ActivityFeed items={activityItems} />
        </div>

        <div className="flex flex-col gap-5">
          <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)", boxShadow: "0 4px 24px rgba(10,36,114,0.06)" }}>
            <SectionHeader title="Quick Actions" />
            <QuickActions items={quickActions} />
          </div>

          <div className="p-5 rounded-[24px] flex-1" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`, boxShadow: "0 8px 32px rgba(10,36,114,0.2)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#F8F9FA", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>
              {totalStudents > 0 ? "School Overview" : "Welcome!"}
            </h3>
            <p style={{ color: "rgba(248,249,250,0.7)", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "1rem" }}>
              {totalStudents > 0
                ? `${totalStudents} students · ${totalStaff} staff · ${collectionRate}% collection rate`
                : "Start by adding students and setting up fees. Use the Quick Actions above to get started."}
            </p>
            <div className="space-y-2">
              {[
                { label: "Add Students", path: "/dashboard/students" },
                { label: "Set Up Fees", path: "/dashboard/finance" },
              ].map((item) => (
                <button key={item.label} onClick={() => navigate(item.path)}
                  className="w-full py-2 rounded-full text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  style={{ background: "rgba(248,249,250,0.12)", color: "#F8F9FA", border: "1px solid rgba(248,249,250,0.2)" }}>
                  {item.label} <ArrowRight size={11} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* ─── PHASE 6: Legacy fees table references fully removed ── */}
    </div>
  );
}
