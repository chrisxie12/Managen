import {} from "react";
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

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const revenueData = [
  { month: "Sep", amount: 42000 },
  { month: "Oct", amount: 58000 },
  { month: "Nov", amount: 49000 },
  { month: "Dec", amount: 63000 },
  { month: "Jan", amount: 71000 },
  { month: "Feb", amount: 86000 },
  { month: "Mar", amount: 94000 },
];

const [] = [
  { day: "Mon", rate: 92 },
  { day: "Tue", rate: 95 },
  { day: "Wed", rate: 88 },
  { day: "Thu", rate: 96 },
  { day: "Fri", rate: 91 },
];

const pieData = [
  { name: "Paid", value: 812, color: "#10B981" },
  { name: "Partial", value: 276, color: "#F59E0B" },
  { name: "Overdue", value: 160, color: "#EF4444" },
];

const recentActivity = [
  { type: "fee", text: "Fee payment from Kofi Adu (JHS 3)", time: "2 min ago", status: "success" },
  { type: "report", text: "Term 1 reports sent to 248 parents via WhatsApp", time: "1 hr ago", status: "success" },
  { type: "alert", text: "6 students overdue on fees (>30 days)", time: "3 hrs ago", status: "warning" },
  { type: "attend", text: "Attendance marked for all 12 classes", time: "This morning", status: "success" },
  { type: "exam", text: "Mid-term exam schedule uploaded", time: "Yesterday", status: "info" },
];

const quickActions = [
  { label: "Mark Attendance", icon: Clock, color: "#6366F1", path: "/dashboard/students" },
  { label: "Send Fee Reminder", icon: Bell, color: "#F59E0B", path: "/dashboard/communication" },
  { label: "Generate Report", icon: BookOpen, color: "#10B981", path: "/dashboard/academics" },
  { label: "Add Student", icon: Users, color: "#EC4899", path: "/dashboard/students" },
];

const topStudents = [
  { id: "GH-2024-001", name: "Ama Owusu", class: "JHS 3A", avg: 96.4, trend: "up" },
  { id: "GH-2024-012", name: "Kwesi Boateng", class: "JHS 2B", avg: 94.1, trend: "up" },
  { id: "GH-2024-034", name: "Efua Mensah", class: "JHS 3A", avg: 91.7, trend: "down" },
  { id: "GH-2024-047", name: "Yaw Darko", class: "JHS 1C", avg: 90.2, trend: "up" },
];

export function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Students",
            value: "1,248",
            change: "+24 this term",
            positive: true,
            icon: Users,
            color: "#6366F1",
            path: "/dashboard/students",
          },
          {
            label: "Term Revenue",
            value: "GHS 186,400",
            change: "+18% vs last term",
            positive: true,
            icon: Wallet,
            color: "#10B981",
            path: "/dashboard/finance",
          },
          {
            label: "Avg Attendance",
            value: "91.4%",
            change: "-2.1% this week",
            positive: false,
            icon: Clock,
            color: "#F59E0B",
            path: "/dashboard/students",
          },
          {
            label: "Reports Sent",
            value: "2,340",
            change: "WhatsApp delivered",
            positive: true,
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
            1,248 students
          </p>

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
                    {((d.value / 1248) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
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
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
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
        </div>

        {/* Right column: Quick Actions + Top Students */}
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
            <div className="grid grid-cols-2 gap-2">
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

          {/* Top Students */}
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
                marginBottom: "1rem",
              }}
            >
              Top Performers
            </h3>
            <div className="space-y-3">
              {topStudents.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        i === 0
                          ? "#F59E0B"
                          : i === 1
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(255,255,255,0.12)",
                      color: i === 0 ? "white" : "rgba(255,243,230,0.8)",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      style={{
                        color: MILK,
                        fontSize: "0.82rem",
                        fontWeight: 500,
                      }}
                      className="truncate"
                    >
                      {s.name}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,243,230,0.55)",
                        fontSize: "0.7rem",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {s.class} · {s.id}
                    </p>
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: MILK,
                      fontSize: "0.9rem",
                      fontWeight: 700,
                    }}
                  >
                    {s.avg}%
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/dashboard/academics")}
              className="mt-4 w-full py-2 rounded-full text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
              style={{
                background: "rgba(255,243,230,0.12)",
                color: MILK,
                border: "1px solid rgba(255,243,230,0.2)",
              }}
            >
              View All Results <ArrowRight size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
