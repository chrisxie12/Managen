import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users, Wallet, Clock, BookOpen, MessageSquare,
  ArrowRight, CheckCircle2, Bell,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { api } from "../services/api";
import {
  LoadingSpinner, StatCard, ChartCard, ActivityFeed, QuickActions, SectionHeader, palette,
} from "../components/dashboard";

const { PLUM, PLUM_LIGHT, MUTED } = palette;

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
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

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
    icon: CheckCircle2,
    color: "#10B981",
    text: `${s.name} (${s.class_name || "No class"}) joined`,
    time: s.created_at ? new Date(s.created_at).toLocaleDateString() : "",
  }));

  const hasData = totalStudents > 0 || fees.length > 0;

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={totalStudents.toLocaleString()} color="#6366F1" path="/dashboard/students" badge={`${totalTeachers} teacher${totalTeachers !== 1 ? "s" : ""}`} />
        <StatCard icon={Wallet} label="Total Revenue" value={`GHS ${totalRevenue.toLocaleString()}`} color="#10B981" path="/dashboard/finance" badge={`${fees.length} fee record${fees.length !== 1 ? "s" : ""}`} />
        <StatCard icon={Clock} label="Avg Attendance" value={`${attendanceRate}%`} color="#F59E0B" path="/dashboard/students" badge="Today" />
        <StatCard icon={MessageSquare} label="Fee Collections" value={`${paidFees.length}`} color="#25D366" path="/dashboard/communication" badge={`${overdueFees.length} overdue`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <ChartCard title="Fee Collection" subtitle="This academic year" action={
          <button onClick={() => navigate("/dashboard/finance")} className="flex items-center gap-1 text-sm hover:opacity-70 transition-opacity" style={{ color: PLUM_LIGHT }}>
            View all <ArrowRight size={13} />
          </button>
        }>
          {revenueData.some((d) => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PLUM} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={PLUM} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", borderRadius: 12, fontSize: 12 }} formatter={(v: number) => [`GHS ${v.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="amount" stroke={PLUM} strokeWidth={2.5} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px]" style={{ color: MUTED }}>
              <p style={{ fontSize: "0.85rem" }}>No fee data yet — revenue chart will appear once payments are recorded.</p>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Fee Status" subtitle={`${totalStudents} student${totalStudents !== 1 ? "s" : ""}`}>
          {totalFeesForPie > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", borderRadius: 8, fontSize: 11 }} />
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
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.82rem", fontWeight: 600 }}>{d.value}</span>
                      <span className="px-1.5 py-0.5 rounded-full text-xs" style={{ background: `${d.color}15`, color: d.color, fontSize: "0.65rem" }}>
                        {totalFeesForPie > 0 ? ((d.value / totalFeesForPie) * 100).toFixed(0) : 0}%
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
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
          <SectionHeader title="Recent Activity" />
          <ActivityFeed items={activityItems} />
        </div>

        <div className="flex flex-col gap-5">
          <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
            <SectionHeader title="Quick Actions" />
            <QuickActions items={quickActions} />
          </div>

          <div className="p-5 rounded-[24px] flex-1" style={{ background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`, boxShadow: "0 8px 32px rgba(56,25,50,0.2)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#FFF3E6", fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>
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
                <button key={item.label} onClick={() => navigate(item.path)}
                  className="w-full py-2 rounded-full text-xs flex items-center justify-center gap-1 active:scale-95 transition-transform"
                  style={{ background: "rgba(255,243,230,0.12)", color: "#FFF3E6", border: "1px solid rgba(255,243,230,0.2)" }}>
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
