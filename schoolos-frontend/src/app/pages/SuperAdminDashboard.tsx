import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Building2, Users, AlertCircle, DollarSign, BarChart3,
  TrendingUp, Activity, ExternalLink,
  UserPlus, AlertTriangle,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";
import { api } from "../services/api";
import {
  StatCard, AlertBanner, MetricCell, Badge, LoadingSkeleton, EmptyState, ErrorState,
  ChartTooltip, planColors,
  CARD_BG_C as CARD_BG, BORDER_C as BORDER, TEXT_C as TEXT, MUTED_C as MUTED, ACCENT_C as ACCENT,
} from "./superadmin/Components";

type DashboardData = {
  stats: {
    totalSchools: number;
    activeSchools: number;
    suspended: number;
    totalRevenue: number;
    trends?: {
      totalSchools: number;
      activeSchools: number;
      suspended: number;
      totalRevenue: number;
    };
  };
  planBreakdown: { plan: string; count: number }[];
  recentActivity?: {
    id: string;
    type: "school_added" | "school_suspended" | "plan_upgraded" | "payment_received";
    label: string;
    timestamp: string;
  }[];
  mrrTrend?: { month: string; mrr: number }[];
};

const activityConfig: Record<string, { bg: string; icon: any; color: string }> = {
  school_added: { bg: "rgba(16,185,129,0.15)", icon: UserPlus, color: "#10B981" },
  school_suspended: { bg: "rgba(239,68,68,0.15)", icon: AlertTriangle, color: "#EF4444" },
  plan_upgraded: { bg: "rgba(99,102,241,0.15)", icon: TrendingUp, color: "#6366F1" },
  payment_received: { bg: "rgba(16,185,129,0.15)", icon: DollarSign, color: "#10B981" },
};

const relativeTime = (iso: string) => {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const d = new Date(iso);
  return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getDate()}`;
};

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<DashboardData>("/api/superadmin/dashboard");
      if (res.data) setData(res.data);
    } catch (err: any) { setError(err.message || "Failed to load dashboard"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <EmptyState icon={BarChart3} title="No data available" desc="Dashboard data will appear once schools are registered." />;

  const { stats, planBreakdown, recentActivity, mrrTrend } = data;
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
  const activityItems = (recentActivity || []).slice(0, 8);
  const mrrData = mrrTrend || [];

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
          trend={stats.trends?.totalSchools ?? (hasSchools ? { dir: "up", text: `${activePct}% active` } : { dir: "neutral", text: "No data" })}
          badge={hasSchools ? { text: "Primary KPI", color: ACCENT } : undefined} />
        <StatCard icon={Users} label="Active Schools" value={stats.activeSchools.toLocaleString()}
          sub={`${activePct}% of total enrollment`} color="#10B981"
          trend={stats.trends?.activeSchools ?? (stats.activeSchools > 0 ? { dir: "up", text: "Operational" } : { dir: "neutral", text: "Idle" })} />
        <StatCard icon={AlertCircle} label="Suspended" value={stats.suspended.toLocaleString()}
          sub={`${suspendedPct}% suspension rate`} color={stats.suspended > 0 ? "#EF4444" : "#10B981"}
          trend={stats.trends?.suspended ?? (stats.suspended > 0 ? { dir: "down", text: "Action needed" } : { dir: "up", text: "None" })} />
        <StatCard icon={DollarSign} label="Total Revenue" value={hasRevenue ? `GHS ${(stats.totalRevenue / 1000).toFixed(1)}K` : "GHS 0"}
          sub={hasRevenue ? "All-time platform revenue" : "Awaiting first payment"} color="#6366F1"
          trend={stats.trends?.totalRevenue ?? (hasRevenue ? { dir: "up", text: "Generating" } : { dir: "neutral", text: "No revenue" })} />
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
                  <Tooltip content={<ChartTooltip />} />
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

        {/* Recent Activity */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 mb-1">
            <Activity size={15} color={MUTED} />
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT }}>Recent Activity</h3>
          </div>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "1rem" }}>Latest platform events</p>
          {activityItems.length > 0 ? (
            <div className="overflow-y-auto max-h-[340px] space-y-0">
              {activityItems.map((a, i) => {
                const cfg = activityConfig[a.type] || activityConfig.school_added;
                const Icon = cfg.icon;
                return (
                  <div key={a.id}>
                    {i > 0 && <div style={{ height: 1, background: BORDER }} />}
                    <div className="flex items-center gap-3 py-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                        <Icon size={14} color={cfg.color} />
                      </div>
                      <span className="flex-1 min-w-0 truncate" style={{ color: "#94a3b8", fontSize: "0.78rem" }}>{a.label}</span>
                      <span style={{ color: MUTED, fontSize: "0.68rem", flexShrink: 0 }}>{relativeTime(a.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity size={28} color={MUTED} />
              <p style={{ color: MUTED, fontSize: "0.85rem", marginTop: "0.5rem" }}>No recent activity</p>
            </div>
          )}
        </div>

        {/* MRR Trend */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} color={MUTED} />
            <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT }}>MRR Trend</h3>
          </div>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "1rem" }}>Monthly recurring revenue</p>
          {mrrData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={mrrData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} width={80}
                  tickFormatter={(v: number) => `GHS ${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Line dataKey="mrr" name="MRR" type="monotone" stroke="#6366F1" strokeWidth={2}
                  dot={{ r: 3, fill: "#6366F1", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign size={28} color={MUTED} />
              <p style={{ color: MUTED, fontSize: "0.85rem", marginTop: "0.5rem" }}>No revenue data yet</p>
            </div>
          )}
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
