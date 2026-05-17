import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users,
  Wallet,
  Clock,
  TrendingUp,
  TrendingDown,
  BookOpen,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Circle,
  ChevronRight,
  Bell,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const quickActions = [
  { label: "Mark Attendance", icon: Clock, color: "#6366F1", path: "/dashboard/students" },
  { label: "Send Fee Reminder", icon: Bell, color: "#F59E0B", path: "/dashboard/communication" },
  { label: "Generate Report", icon: BookOpen, color: "#10B981", path: "/dashboard/academics" },
  { label: "Add Student", icon: Users, color: "#EC4899", path: "/dashboard/students" },
];

export function DashboardHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalStudents: number;
    totalTeachers: number;
    attendanceRate: number | string;
    recentActivity: { name: string; class_name: string; created_at: string }[];
  } | null>(null);
  const [fees, setFees] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, feesRes] = await Promise.all([
          api.get<{
            totalStudents: number;
            totalTeachers: number;
            attendanceRate: number | string;
            recentActivity: { name: string; class_name: string; created_at: string }[];
          }>("/api/school/dashboard"),
          api.get<{ fees: any[] }>("/api/school/fees"),
        ]);
        if (statsRes.data) setStats(statsRes.data);
        if (feesRes.data) setFees(feesRes.data.fees || []);
      } catch {
        // silently fail — dashboard shows empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin" size={32} color={PLUM} />
      </div>
    );
  }

  const totalStudents = stats?.totalStudents ?? 0;
  const totalTeachers = stats?.totalTeachers ?? 0;
  const attendanceRate = stats?.attendanceRate ?? 0;

  const paidFees = fees.filter((f) => f.status === "paid");
  const partialFees = fees.filter((f) => f.status === "partial");
  const overdueFees = fees.filter((f) => f.status === "overdue" || f.status === "pending");
  const totalRevenue = paidFees.reduce((sum: number, f: any) => sum + Number(f.amount || 0), 0);

  const pieData = [
    { name: "Paid", value: paidFees.length || 1, color: "#10B981" },
    { name: "Partial", value: partialFees.length || 1, color: "#F59E0B" },
    { name: "Overdue", value: overdueFees.length || 1, color: "#EF4444" },
  ];

  const totalFeesForPie = paidFees.length + partialFees.length + overdueFees.length;

  const revenueData = (() => {
    const months: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en", { month: "short" });
      months[key] = 0;
    }
    paidFees.forEach((f: any) => {
      if (f.paid_at || f.created_at) {
        const d = new Date(f.paid_at || f.created_at);
        const key = d.toLocaleString("en", { month: "short" });
        if (key in months) {
          months[key] += Number(f.amount || 0);
        }
      }
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  })();

  const activityItems = (stats?.recentActivity || []).map((s: any) => ({
    type: "student",
    text: `${s.name} (${s.class_name || "No class"}) joined`,
    time: s.created_at ? new Date(s.created_at).toLocaleDateString() : "",
    status: "success" as const,
  }));

  const hasData = totalStudents > 0 || fees.length > 0;

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Students",
            value: totalStudents.toLocaleString(),
            change: `${totalTeachers} teacher${totalTeachers !== 1 ? "s" : ""}`,
            positive: true,
            icon: Users,
            color: "#6366F1",
            path: "/dashboard/students",
          },
          {
            label: "Total Revenue",
            value: `GHS ${totalRevenue.toLocaleString()}`,
            change: `${fees.length} fee record${fees.length !== 1 ? "s" : ""}`,
            positive: true,
            icon: Wallet,
            color: "#10B981",
            path: "/dashboard/finance",
          },
          {
            label: "Avg Attendance",
            value: `${attendanceRate}%`,
            change: "Today",
            positive: true,
            icon: Clock,
            color: "#F59E0B",
            path: "/dashboard/students",
          },
          {
            label: "Fee Collections",
            value: `${paidFees.length}`,
            change: `${overdueFees.length} overdue`,
            positive: overdueFees.length === 0,
            icon: MessageSquare,
            color: "#25D366",
            path: "/dashboard/communication",
          },
        ].map((card) => (
          <div
            key={card.label}
            onClick={() => navigate(card.path)}
            className="p-5 rounded-[24px] cursor-pointer hover:scale-[1.02] transition-transform"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.07)`,
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: `${card.color}15` }}
              >
                <card.icon size={18} color={card.color} />
              </div>
              <ChevronRight size={14} color={MUTED} />
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: PLUM,
                fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)",
                fontWeight: 700,
                lineHeight: 1.1,
                marginBottom: "0.3rem",
              }}
            >
              {card.value}
            </div>
            <div style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.3rem" }}>
              {card.label}
            </div>
            <div
              className="flex items-center gap-1 text-xs"
              style={{ color: card.positive ? "#10B981" : "#EF4444" }}
            >
              {card.positive ? (
                <TrendingUp size={11} />
              ) : (
                <TrendingDown size={11} />
              )}
              {card.change}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart — 2 cols */}
        <div
          className="lg:col-span-2 p-6 rounded-[24px]"
          style={{
            background: "white",
            border: `1px solid rgba(56,25,50,0.07)`,
            boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: PLUM,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                }}
              >
                Fee Collection
              </h3>
              <p style={{ color: MUTED, fontSize: "0.78rem" }}>This academic year</p>
            </div>
            <button
              onClick={() => navigate("/dashboard/finance")}
              className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity"
              style={{ color: PLUM_LIGHT }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          {revenueData.some((d) => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PLUM} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={PLUM} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.05)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: MUTED }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: MUTED }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: `1px solid rgba(56,25,50,0.1)`,
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`GHS ${v.toLocaleString()}`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={PLUM}
                  strokeWidth={2.5}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px]" style={{ color: MUTED }}>
              <p style={{ fontSize: "0.85rem" }}>No fee data yet — revenue chart will appear once payments are recorded.</p>
            </div>
          )}
        </div>

        {/* Fee Status Pie */}
        <div
          className="p-6 rounded-[24px]"
          style={{
            background: "white",
            border: `1px solid rgba(56,25,50,0.07)`,
            boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              color: PLUM,
              fontWeight: 700,
              fontSize: "1.05rem",
              marginBottom: "0.3rem",
            }}
          >
            Fee Status
          </h3>
          <p style={{ color: MUTED, fontSize: "0.78rem", marginBottom: "1rem" }}>
            {totalStudents} student{totalStudents !== 1 ? "s" : ""}
          </p>

          {totalFeesForPie > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: `1px solid rgba(56,25,50,0.1)`,
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: d.color }}
                      />
                      <span style={{ color: MUTED, fontSize: "0.8rem" }}>{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: PLUM,
                          fontSize: "0.82rem",
                          fontWeight: 600,
                        }}
                      >
                        {d.value}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded-full text-xs"
                        style={{
                          background: `${d.color}15`,
                          color: d.color,
                          fontSize: "0.65rem",
                        }}
                      >
                        {totalFeesForPie > 0
                          ? ((d.value / totalFeesForPie) * 100).toFixed(0)
                          : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[260px]" style={{ color: MUTED }}>
              <p style={{ fontSize: "0.85rem", textAlign: "center" }}>
                No fees recorded yet.<br />Fee status breakdown will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div
          className="lg:col-span-2 p-6 rounded-[24px]"
          style={{
            background: "white",
            border: `1px solid rgba(56,25,50,0.07)`,
            boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontWeight: 700,
                fontSize: "1.05rem",
              }}
            >
              Recent Activity
            </h3>
          </div>
          {activityItems.length > 0 ? (
            <div className="space-y-4">
              {activityItems.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background:
                        item.status === "success"
                          ? "#D1FAE5"
                          : item.status === "warning"
                          ? "#FEF3C7"
                          : "#EDE9FE",
                    }}
                  >
                    {item.status === "success" ? (
                      <CheckCircle2 size={14} color="#10B981" />
                    ) : item.status === "warning" ? (
                      <AlertCircle size={14} color="#F59E0B" />
                    ) : (
                      <Circle size={14} color="#8B5CF6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p style={{ color: PLUM_LIGHT, fontSize: "0.88rem", lineHeight: 1.4 }}>
                      {item.text}
                    </p>
                    <p style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.15rem" }}>
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px]" style={{ color: MUTED }}>
              <p style={{ fontSize: "0.85rem" }}>No activity yet — start by adding students or recording fees.</p>
            </div>
          )}
        </div>

        {/* Right column: Quick Actions + Getting Started */}
        <div className="flex flex-col gap-5">
          {/* Quick Actions */}
          <div
            className="p-5 rounded-[24px]"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.07)`,
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontWeight: 700,
                fontSize: "1rem",
                marginBottom: "1rem",
              }}
            >
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="p-3 rounded-2xl text-left hover:scale-[1.03] transition-transform active:scale-95"
                  style={{
                    background: `${action.color}10`,
                    border: `1px solid ${action.color}20`,
                  }}
                >
                  <action.icon size={16} color={action.color} className="mb-2" />
                  <p
                    style={{
                      color: PLUM,
                      fontSize: "0.75rem",
                      fontWeight: 500,
                      lineHeight: 1.3,
                    }}
                  >
                    {action.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Getting Started / Welcome */}
          <div
            className="p-5 rounded-[24px] flex-1"
            style={{
              background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`,
              boxShadow: "0 8px 32px rgba(56,25,50,0.2)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: MILK,
                fontWeight: 700,
                fontSize: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              {hasData ? "School Overview" : "Welcome!"}
            </h3>
            <p style={{ color: "rgba(255,243,230,0.7)", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "1rem" }}>
              {hasData
                ? `${totalStudents} students enrolled · ${fees.length} fee records`
                : "Start by adding students and setting up fees. Use the Quick Actions above to get started."}
            </p>
            <div className="space-y-2">
              {[
                { label: "Add Students", path: "/dashboard/students" },
                { label: "Set Up Fees", path: "/dashboard/finance" },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="w-full py-2 rounded-full text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  style={{
                    background: "rgba(255,243,230,0.12)",
                    color: MILK,
                    border: "1px solid rgba(255,243,230,0.2)",
                  }}
                >
                  {item.label} <ArrowRight size={11} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
