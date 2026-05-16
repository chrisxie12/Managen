import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Building2, AlertCircle,
  CreditCard, Zap, Shield, BarChart3,
  Clock, Users, DollarSign,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { api } from "../services/api";
import { StatCard, LoadingSkeleton, EmptyState, ErrorState, CARD_BG_C as CARD_BG, BORDER_C as BORDER } from "./superadmin/Components";

const ACCENT = "#ff6b35";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";

const planColors: Record<string, string> = {
  trial: "#F59E0B", basic: "#6366F1", standard: "#10B981", premium: "#8B5CF6",
};

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    stats: { totalSchools: number; activeSchools: number; suspended: number; totalRevenue: number };
    planBreakdown: { plan: string; count: number }[];
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ stats: { totalSchools: number; activeSchools: number; suspended: number; totalRevenue: number }; planBreakdown: { plan: string; count: number }[] }>("/api/superadmin/dashboard");
      if (res.data) setData(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState icon={BarChart3} title="No data available" desc="Dashboard data will appear once schools are registered." />;

  const { stats, planBreakdown } = data!;
  const pieData = planBreakdown.map((p) => ({
    name: p.plan.charAt(0).toUpperCase() + p.plan.slice(1),
    value: p.count,
    color: planColors[p.plan] || MUTED,
  }));
  const activePct = stats.totalSchools > 0 ? ((stats.activeSchools / stats.totalSchools) * 100).toFixed(0) : "0";
  const suspendedPct = stats.totalSchools > 0 ? ((stats.suspended / stats.totalSchools) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: TEXT }}>Platform Overview</h1>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>Monitor and manage all schools on the platform</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.2)" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "#10B981", animation: "pulse 2s infinite" }} />
          <span style={{ color: ACCENT, fontSize: "0.75rem", fontWeight: 600 }}>All Systems Normal</span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Schools" value={stats.totalSchools.toLocaleString()} sub={`${stats.activeSchools} active, ${stats.suspended} suspended`} color={ACCENT} trend={{ dir: "up", text: `${activePct}% active` }} />
        <StatCard icon={Users} label="Active Schools" value={stats.activeSchools.toLocaleString()} sub={`${activePct}% of total enrollment`} color="#10B981" trend={{ dir: "up", text: "Operational" }} />
        <StatCard icon={AlertCircle} label="Suspended" value={stats.suspended.toLocaleString()} sub={`${suspendedPct}% suspension rate`} color={stats.suspended > 0 ? "#EF4444" : "#10B981"} trend={stats.suspended > 0 ? { dir: "down", text: "Needs review" } : { dir: "up", text: "None" }} />
        <StatCard icon={DollarSign} label="Total Revenue" value={`GHS ${(stats.totalRevenue / 1000).toFixed(1)}K`} sub="All-time platform revenue" color="#6366F1" trend={stats.totalRevenue > 0 ? { dir: "up", text: "Generating" } : { dir: "down", text: "No payments" }} />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: "0.3rem" }}>Plan Distribution</h3>
          <p style={{ color: MUTED, fontSize: "0.78rem", marginBottom: "1rem" }}>How schools are distributed across plans</p>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2.5 mt-3">
                {pieData.map((d) => {
                  const maxVal = Math.max(...pieData.map(p => p.value), 1);
                  return (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{d.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${(d.value / maxVal) * 100}%`, background: d.color }} />
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: TEXT, fontSize: "0.82rem", fontWeight: 600 }}>{d.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : <EmptyState icon={BarChart3} title="No plan data" desc="Plan data will appear once schools subscribe." />}
        </div>

        {/* Platform Health */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: "1rem" }}>Platform Health</h3>
          <div className="space-y-3 mb-6">
            {[
              { label: "Database", status: "Connected", ok: true, icon: BarChart3 },
              { label: "Redis Cache", status: "Available", ok: true, icon: Zap },
              { label: "Payment Gateway", status: "Configured", ok: true, icon: CreditCard },
              { label: "Background Jobs", status: "Idle", ok: true, icon: Clock },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-2">
                  <s.icon size={14} color={s.ok ? "#10B981" : "#EF4444"} />
                  <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{s.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.ok ? "#10B981" : "#EF4444" }} />
                  <span style={{ color: s.ok ? "#10B981" : "#EF4444", fontSize: "0.72rem", fontWeight: 500 }}>{s.status}</span>
                </div>
              </div>
            ))}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: "0.8rem" }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Schools", icon: Building2, color: ACCENT, path: "/superadmin/schools" },
              { label: "Billing", icon: DollarSign, color: "#6366F1", path: "/superadmin/billing" },
              { label: "Alerts", icon: AlertCircle, color: "#F59E0B", path: "#" },
              { label: "Export", icon: Shield, color: "#8B5CF6", path: "#" },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="p-3 rounded-xl text-left transition-all duration-150 hover:scale-[1.03] active:scale-95"
                style={{ background: `${a.color}08`, border: `1px solid ${a.color}20` }}>
                <a.icon size={16} color={a.color} className="mb-1" />
                <p style={{ color: TEXT, fontSize: "0.75rem", fontWeight: 500 }}>{a.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Plans Bar Chart */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: "0.3rem" }}>Subscription Insight</h3>
          <p style={{ color: MUTED, fontSize: "0.78rem", marginBottom: "1rem" }}>Plan breakdown by count</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pieData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={BarChart3} title="No subscription data" desc="Subscription insights will appear once schools subscribe." />}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: "1rem" }}>Key Metrics</h3>
        {stats.totalSchools > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Conversion Rate", value: `${activePct}%`, sub: "Active vs total schools", color: "#10B981" },
              { label: "Avg Revenue per School", value: stats.totalSchools > 0 ? `GHS ${(stats.totalRevenue / stats.totalSchools).toFixed(0)}` : "GHS 0", sub: "Lifetime value", color: "#6366F1" },
              { label: "Suspension Rate", value: `${suspendedPct}%`, sub: "Of total schools", color: stats.suspended > 0 ? "#EF4444" : "#10B981" },
              { label: "Plan Diversity", value: `${planBreakdown.length} plans`, sub: `${pieData.reduce((a, b) => a + b.value, 0)} total subscriptions`, color: "#8B5CF6" },
            ].map((m) => (
              <div key={m.label} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div style={{ color: TEXT, fontSize: "0.85rem", fontWeight: 500 }}>{m.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: m.color, fontSize: "1.3rem", fontWeight: 700, marginTop: "0.3rem" }}>{m.value}</div>
                <div style={{ color: MUTED, fontSize: "0.72rem", marginTop: "0.15rem" }}>{m.sub}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="No metrics available" desc="Key metrics will populate as schools register and generate data." />
        )}
      </div>
    </div>
  );
}
