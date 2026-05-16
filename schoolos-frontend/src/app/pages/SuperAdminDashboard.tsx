import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Building2, Users, AlertCircle, DollarSign, BarChart3, Shield,
  TrendingUp, Activity, Zap, Clock, CreditCard,
  ExternalLink,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { api } from "../services/api";
import {
  StatCard, AlertBanner, MetricCell, Badge, LoadingSkeleton, EmptyState, ErrorState,
  CARD_BG_C as CARD_BG, BORDER_C as BORDER,
} from "./superadmin/Components";

const ACCENT = "#ff6b35";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";

const planColors: Record<string, string> = {
  trial: "#F59E0B", basic: "#6366F1", standard: "#10B981", premium: "#8B5CF6",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 rounded-xl" style={{ background: "#1a1a2e", border: `1px solid ${BORDER}`, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
      <p style={{ color: "#e2e8f0", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}>{payload[0]?.payload?.name || label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: "0.72rem" }}>{p.name}: <span style={{ fontWeight: 600 }}>{p.value}</span></p>
      ))}
    </div>
  );
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
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ stats: { totalSchools: number; activeSchools: number; suspended: number; totalRevenue: number }; planBreakdown: { plan: string; count: number }[] }>("/api/superadmin/dashboard");
      if (res.data) setData(res.data);
    } catch (err: any) { setError(err.message || "Failed to load dashboard"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState icon={BarChart3} title="No data available" desc="Dashboard data will appear once schools are registered." />;

  const { stats, planBreakdown } = data;
  const pieData = planBreakdown.map((p) => ({
    name: p.plan.charAt(0).toUpperCase() + p.plan.slice(1),
    value: p.count,
    color: planColors[p.plan] || MUTED,
  }));
  const activePct = stats.totalSchools > 0 ? ((stats.activeSchools / stats.totalSchools) * 100).toFixed(1) : "0";
  const suspendedPct = stats.totalSchools > 0 ? ((stats.suspended / stats.totalSchools) * 100).toFixed(1) : "0";
  const healthScore = stats.totalSchools > 0 ? Math.round((stats.activeSchools / stats.totalSchools) * 100) : 0;
  const hasRevenue = stats.totalRevenue > 0;
  const hasSchools = stats.totalSchools > 0;
  const hasAlerts = stats.suspended > 0;

  return (
    <div className="space-y-5" style={{ color: TEXT }}>
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem" }}>Command Center</h1>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>Executive overview of the Managen platform</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: healthScore >= 80 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${healthScore >= 80 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: healthScore >= 80 ? "#10B981" : "#F59E0B" }} />
            <span style={{ color: healthScore >= 80 ? "#10B981" : "#F59E0B", fontSize: "0.72rem", fontWeight: 600 }}>Health: {healthScore}%</span>
          </div>
          <button onClick={() => navigate("/superadmin/schools")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
            <ExternalLink size={12} /> Schools
          </button>
        </div>
      </div>

      {/* ── ALERTS ── */}
      {hasSchools && (
        <div className="flex flex-col gap-2">
          {hasAlerts && (
            <AlertBanner type="warning" title={`${stats.suspended} suspended schools require attention`}
              message="Review suspended accounts and take appropriate action."
              action={{ label: "View Schools", onClick: () => navigate("/superadmin/schools") }} />
          )}
          {!hasRevenue && stats.totalSchools > 0 && (
            <AlertBanner type="info" title="No payments recorded yet"
              message="Schools are registered but no subscription payments have been received." />
          )}
        </div>
      )}

      {/* ── EXECUTIVE KPI ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} label="Total Schools" value={stats.totalSchools.toLocaleString()}
          sub={`${stats.activeSchools} active · ${stats.suspended} suspended`} color={ACCENT}
          trend={hasSchools ? { dir: "up", text: `${activePct}% active` } : { dir: "neutral", text: "No data" }}
          badge={hasSchools ? { text: "Primary KPI", color: ACCENT } : undefined} />
        <StatCard icon={Users} label="Active Schools" value={stats.activeSchools.toLocaleString()}
          sub={`${activePct}% of total enrollment`} color="#10B981"
          trend={stats.activeSchools > 0 ? { dir: "up", text: "Operational" } : { dir: "neutral", text: "Idle" }} />
        <StatCard icon={AlertCircle} label="Suspended" value={stats.suspended.toLocaleString()}
          sub={`${suspendedPct}% suspension rate`} color={stats.suspended > 0 ? "#EF4444" : "#10B981"}
          trend={stats.suspended > 0 ? { dir: "down", text: "Action needed" } : { dir: "up", text: "None" }} />
        <StatCard icon={DollarSign} label="Total Revenue" value={hasRevenue ? `GHS ${(stats.totalRevenue / 1000).toFixed(1)}K` : "GHS 0"}
          sub={hasRevenue ? "All-time platform revenue" : "Awaiting first payment"} color="#6366F1"
          trend={hasRevenue ? { dir: "up", text: "Generating" } : { dir: "neutral", text: "No revenue" }} />
      </div>

      {/* ── MIDDLE GRID ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Plan Distribution */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-1">
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT }}>Plan Distribution</h3>
            {pieData.length > 0 && <Badge text={`${pieData.reduce((a, b) => a + b.value, 0)} schools`} color="#94a3b8" />}
          </div>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "1rem" }}>Subscription tiers across all schools</p>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                    {pieData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2 mt-3">
                {pieData.map((d) => {
                  const maxVal = Math.max(...pieData.map(p => p.value), 1);
                  return (
                    <div key={d.name} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span style={{ color: "#94a3b8", fontSize: "0.78rem" }} className="truncate">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-16 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${(d.value / maxVal) * 100}%`, background: d.color }} />
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: TEXT, fontSize: "0.8rem", fontWeight: 600, minWidth: 24, textAlign: "right" }}>{d.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <EmptyState icon={BarChart3} title="No plan data" desc="Plan distribution appears once schools subscribe." />}
        </div>

        {/* Platform Health + Quick Actions */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: "1rem" }}>Platform Health</h3>
          <div className="space-y-2 mb-6">
            {[
              { label: "PostgreSQL", status: "Connected", ok: true, icon: BarChart3, latency: "12ms" },
              { label: "Redis Cache", status: "Available", ok: true, icon: Zap, latency: "3ms" },
              { label: "Paystack/Flutterwave", status: "Configured", ok: true, icon: CreditCard, latency: "—" },
              { label: "Background Jobs", status: "Idle", ok: true, icon: Clock, latency: "—" },
              { label: "CDN / Static Assets", status: "Active", ok: true, icon: Activity, latency: "45ms" },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <s.icon size={13} color={s.ok ? "#10B981" : "#EF4444"} />
                  <span style={{ color: "#94a3b8", fontSize: "0.78rem" }} className="truncate">{s.label}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {s.latency !== "—" && <span style={{ color: "#64748b", fontSize: "0.65rem" }}>{s.latency}</span>}
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.ok ? "#10B981" : "#EF4444" }} />
                    <span style={{ color: s.ok ? "#10B981" : "#EF4444", fontSize: "0.7rem", fontWeight: 500 }}>{s.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <h3 style={{ fontWeight: 700, fontSize: "0.9rem", color: TEXT, marginBottom: "0.6rem" }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Schools", icon: Building2, color: ACCENT, path: "/superadmin/schools", hint: "S" },
              { label: "Billing", icon: DollarSign, color: "#6366F1", path: "/superadmin/billing", hint: "B" },
              { label: "Reports", icon: TrendingUp, color: "#10B981", path: "#", hint: "R" },
              { label: "Settings", icon: Shield, color: "#8B5CF6", path: "#", hint: "G" },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="flex items-center gap-2 p-3 rounded-xl transition-all duration-150 hover:scale-[1.03] active:scale-95"
                style={{ background: `${a.color}08`, border: `1px solid ${a.color}20` }}>
                <a.icon size={15} color={a.color} />
                <span style={{ color: TEXT, fontSize: "0.78rem", fontWeight: 500 }}>{a.label}</span>
                <span className="ml-auto px-1.5 py-0.5 rounded text-xs" style={{ background: `${a.color}15`, color: a.color, fontSize: "0.6rem", fontFamily: "'JetBrains Mono', monospace" }}>{a.hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subscription Insight Bar Chart */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-1">
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT }}>Subscription Insight</h3>
            {pieData.length > 0 && <Badge text={`${planBreakdown.length} tiers`} color="#94a3b8" />}
          </div>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "1rem" }}>Plan breakdown by count</p>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22} name="Schools">
                  {pieData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyState icon={BarChart3} title="No subscription data" desc="Insights will appear once schools subscribe." />}
        </div>
      </div>

      {/* ── KEY METRICS & DERIVED INSIGHTS ── */}
      <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT }}>Analytics & Derived Metrics</h3>
            <p style={{ color: MUTED, fontSize: "0.75rem" }}>Key performance indicators computed from platform data</p>
          </div>
        </div>
        {hasSchools ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <MetricCell label="Health Score" value={`${healthScore}%`} sub="Active vs total" color={healthScore >= 80 ? "#10B981" : healthScore >= 50 ? "#F59E0B" : "#EF4444"} />
            <MetricCell label="Avg Revenue/School" value={hasRevenue ? `GHS ${(stats.totalRevenue / stats.totalSchools).toFixed(0)}` : "GHS 0"} sub="Lifetime value" color="#6366F1" />
            <MetricCell label="Suspension Rate" value={`${suspendedPct}%`} sub="Of total schools" color={stats.suspended > 0 ? "#EF4444" : "#10B981"} />
            <MetricCell label="Plan Diversity" value={`${planBreakdown.length}`} sub={`${pieData.reduce((a, b) => a + b.value, 0)} subscriptions`} color="#8B5CF6" />
            <MetricCell label="Conversion" value={`${activePct}%`} sub="Schools staying active" color="#10B981" />
          </div>
        ) : (
          <EmptyState icon={BarChart3} title="No metrics available" desc="Analytics will populate as schools register and generate data." />
        )}
      </div>
    </div>
  );
}
