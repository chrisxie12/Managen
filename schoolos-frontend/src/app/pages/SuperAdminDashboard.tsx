import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Building2, Users, AlertCircle, DollarSign, BarChart3,
  TrendingUp, Activity, ExternalLink, ChevronDown,
  UserPlus, AlertTriangle, Settings, RefreshCw, ToggleLeft,
  Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis } from "recharts";
import { api } from "../services/api";
import {
  StatCard, AlertBanner, Badge, LoadingSkeleton, EmptyState, ErrorState,
  ChartTooltip, planColors,
  CARD_BG_C as CARD_BG, BORDER_C as BORDER, TEXT_C as TEXT, MUTED_C as MUTED, ACCENT_C as ACCENT,
} from "./superadmin/Components";

type DashboardData = {
  stats: {
    totalSchools: number; activeSchools: number; suspended: number; totalRevenue: number;
    trends?: { totalSchools: number; activeSchools: number; suspended: number; totalRevenue: number };
  };
  planBreakdown: { plan: string; count: number }[];
  recentActivity?: { id: string; type: string; label: string; timestamp: string }[];
  mrrTrend?: { month: string; mrr: number }[];
};

type School = { id: string; name: string; email: string; slug: string; plan: string; is_active: boolean; created_at: string };

const activityConfig: Record<string, { bg: string; icon: any; color: string }> = {
  school_added: { bg: "rgba(16,185,129,0.15)", icon: UserPlus, color: "#16A34A" },
  school_suspended: { bg: "rgba(239,68,68,0.15)", icon: AlertTriangle, color: "#EF4444" },
  plan_upgraded: { bg: "rgba(99,102,241,0.15)", icon: TrendingUp, color: "#6366F1" },
  payment_received: { bg: "rgba(16,185,129,0.15)", icon: DollarSign, color: "#16A34A" },
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
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsTotal, setSchoolsTotal] = useState(0);
  const [schoolsPages, setSchoolsPages] = useState(1);
  const [schoolsPage, setSchoolsPage] = useState(1);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<DashboardData>("/api/superadmin/dashboard");
      if (res.data) setData(res.data);
    } catch (err: any) { setError(err.message || "Failed to load dashboard"); }
    finally { setLoading(false); }
  }, []);

  const fetchSchools = useCallback(async () => {
    setSchoolsLoading(true);
    try {
      const res = await api.get<{ schools: School[]; total: number; pages: number }>(
        `/api/superadmin/schools?page=${schoolsPage}&limit=15`
      );
      if (res.data) { setSchools(res.data.schools); setSchoolsTotal(res.data.total); setSchoolsPages(res.data.pages); }
    } catch { /* ignore */ }
    finally { setSchoolsLoading(false); }
  }, [schoolsPage]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown]")) setOpenMenuId(null);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

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

  const planLabel = (p: string) => ({ trial: "Free Trial", growth: "Growth", pro: "Pro", enterprise: "Enterprise" }[p] || p);

  return (
    <div className="space-y-4" style={{ color: TEXT }}>
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Command Center</h1>
          <p style={{ color: MUTED, fontSize: "0.82rem" }}>Executive overview of the SchoolOS platform</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: healthScore >= 80 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", border: `1px solid ${healthScore >= 80 ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: healthScore >= 80 ? "#16A34A" : "#F59E0B" }} />
            <span style={{ color: healthScore >= 80 ? "#16A34A" : "#F59E0B", fontSize: "0.7rem", fontWeight: 600 }}>Health: {healthScore}%</span>
          </div>
          <button onClick={() => navigate("/superadmin/schools")} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium" style={{ background: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}25` }}>
            <ExternalLink size={11} /> Schools
          </button>
        </div>
      </div>

      {/* ── ALERTS ── */}
      {hasSchools && (
        <div className="flex flex-col gap-1.5">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Building2} label="Total Schools"
          value={stats.totalSchools.toLocaleString()}
          sub={`${stats.activeSchools} active · ${stats.suspended} suspended`} color={ACCENT}
          trend={stats.trends?.totalSchools ?? (hasSchools ? { dir: "up" as const, text: `${activePct}% active` } : { dir: "neutral" as const, text: "No data" })}
          badge={hasSchools ? { text: "Primary KPI", color: ACCENT } : undefined} />
        <StatCard icon={Users} label="Active Schools"
          value={stats.activeSchools.toLocaleString()}
          sub={`${activePct}% of total enrollment`} color="#16A34A"
          trend={stats.trends?.activeSchools ?? (stats.activeSchools > 0 ? { dir: "up" as const, text: "Operational" } : { dir: "neutral" as const, text: "Idle" })} />
        <StatCard icon={AlertCircle} label="Suspended"
          value={stats.suspended.toLocaleString()}
          sub={`${suspendedPct}% suspension rate`} color={stats.suspended > 0 ? "#EF4444" : "#16A34A"}
          trend={stats.trends?.suspended ?? (stats.suspended > 0 ? { dir: "down" as const, text: "Action needed" } : { dir: "up" as const, text: "None" })} />
        <StatCard icon={DollarSign} label="Total Revenue"
          value={hasRevenue ? `GHS ${(stats.totalRevenue / 1000).toFixed(1)}K` : "GHS 0"}
          sub={hasRevenue ? "All-time platform revenue" : "Awaiting first payment"} color="#6366F1"
          trend={stats.trends?.totalRevenue ?? (hasRevenue ? { dir: "up" as const, text: "Generating" } : { dir: "neutral" as const, text: "No revenue" })} />
      </div>

      {/* ── MIDDLE GRID ── */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Plan Distribution */}
        <div className="p-5 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-0.5">
            <h3 className="text-base font-bold text-white">Plan Distribution</h3>
            {pieData.length > 0 && <Badge text={`${pieData.reduce((a, b) => a + b.value, 0)} schools`} color="#94a3b8" />}
          </div>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.75rem" }}>Subscription tiers across all schools</p>
          {pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={2} dataKey="value">
                    {pieData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-1.5 mt-2">
                {pieData.map((d) => {
                  const maxVal = Math.max(...pieData.map(p => p.value), 1);
                  return (
                    <div key={d.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                        <span style={{ color: "#94a3b8", fontSize: "0.75rem" }} className="truncate">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-14 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-1.5 rounded-full" style={{ width: `${(d.value / maxVal) * 100}%`, background: d.color }} />
                        </div>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: TEXT, fontSize: "0.8rem", fontWeight: 600, minWidth: 22, textAlign: "right" }}>{d.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : <EmptyState icon={BarChart3} title="No plan data" desc="Plan distribution appears once schools subscribe." />}
        </div>

        {/* Recent Activity */}
        <div className="p-5 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <Activity size={15} color={MUTED} />
            <h3 className="text-base font-bold text-white">Recent Activity</h3>
          </div>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.75rem" }}>Latest platform events</p>
          {activityItems.length > 0 ? (
            <div className="overflow-y-auto max-h-[300px] space-y-0">
              {activityItems.map((a, i) => {
                const cfg = activityConfig[a.type] || activityConfig.school_added;
                const Icon = cfg.icon;
                return (
                  <div key={a.id}>
                    {i > 0 && <div style={{ height: 1, background: BORDER }} />}
                    <div className="flex items-center gap-2.5 py-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                        <Icon size={13} color={cfg.color} />
                      </div>
                      <span className="flex-1 min-w-0 truncate" style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{a.label}</span>
                      <span style={{ color: MUTED, fontSize: "0.65rem", flexShrink: 0 }}>{relativeTime(a.timestamp)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity size={26} color={MUTED} />
              <p style={{ color: MUTED, fontSize: "0.82rem", marginTop: "0.4rem" }}>No recent activity</p>
            </div>
          )}
        </div>

        {/* MRR Trend */}
        <div className="p-5 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-1.5 mb-0.5">
            <TrendingUp size={15} color={MUTED} />
            <h3 className="text-base font-bold text-white">MRR Trend</h3>
          </div>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.75rem" }}>Monthly recurring revenue</p>
          {mrrTrend && mrrTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={mrrTrend} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} width={70}
                  tickFormatter={(v: number) => `GHS ${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Line dataKey="mrr" name="MRR" type="monotone" stroke="#6366F1" strokeWidth={2}
                  dot={{ r: 2.5, fill: "#6366F1", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <DollarSign size={26} color={MUTED} />
              <p style={{ color: MUTED, fontSize: "0.82rem", marginTop: "0.4rem" }}>No revenue data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ── REGISTERED SCHOOL CLUSTERS TABLE ── */}
      <div className="rounded-[24px] overflow-hidden" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h3 className="text-base font-bold text-white">Registered School Clusters</h3>
            <p style={{ color: MUTED, fontSize: "0.75rem" }}>Global tenant management ledger &middot; {schoolsTotal} total</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}` }}>
              <Search size={13} color={MUTED} />
              <input placeholder="Search schools..." className="bg-transparent outline-none text-xs flex-1 min-w-0" style={{ color: "#94a3b8" }} />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
                <th className="text-left font-semibold px-5 py-3" style={{ color: MUTED, fontSize: "0.68rem", letterSpacing: "0.05em" }}>School Name</th>
                <th className="text-left font-semibold px-4 py-3" style={{ color: MUTED, fontSize: "0.68rem", letterSpacing: "0.05em" }}>Core Subdomain</th>
                <th className="text-left font-semibold px-4 py-3" style={{ color: MUTED, fontSize: "0.68rem", letterSpacing: "0.05em" }}>Tier Plan</th>
                <th className="text-left font-semibold px-4 py-3" style={{ color: MUTED, fontSize: "0.68rem", letterSpacing: "0.05em" }}>Account Status</th>
                <th className="text-right font-semibold px-5 py-3" style={{ color: MUTED, fontSize: "0.68rem", letterSpacing: "0.05em" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {schoolsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                    <td colSpan={5} className="px-5 py-3">
                      <div className="h-5 rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)", maxWidth: "60%" }} />
                    </td>
                  </tr>
                ))
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center">
                    <Building2 size={24} color={MUTED} className="mx-auto mb-2" />
                    <p style={{ color: MUTED, fontSize: "0.82rem" }}>No schools registered yet</p>
                  </td>
                </tr>
              ) : (
                schools.map((school) => (
                  <tr key={school.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                    className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <span className="font-semibold text-white" style={{ fontSize: "0.82rem" }}>{school.name}</span>
                      <span className="block" style={{ color: MUTED, fontSize: "0.65rem" }}>{school.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <code style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.72rem" }}>
                        {school.slug}.schoolos.com.gh
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <Badge text={planLabel(school.plan)} color={planColors[school.plan] || MUTED} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ background: school.is_active ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)", color: school.is_active ? "#16A34A" : "#EF4444" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: school.is_active ? "#16A34A" : "#EF4444" }} />
                        {school.is_active ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="relative inline-block" data-dropdown>
                        <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === school.id ? null : school.id); }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors"
                          style={{ background: openMenuId === school.id ? `${ACCENT}15` : "rgba(255,255,255,0.04)", color: "#94a3b8", border: `1px solid ${BORDER}` }}>
                          Manage <ChevronDown size={11} />
                        </button>
                        {openMenuId === school.id && (
                          <div className="absolute right-0 mt-1 w-44 rounded-xl overflow-hidden z-20 shadow-xl"
                            style={{ background: "#1a1a2e", border: `1px solid ${BORDER}` }}>
                            <button onClick={() => { navigate(`/superadmin/schools/${school.id}`); setOpenMenuId(null); }}
                              className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs text-left hover:bg-white/[0.04] transition-colors" style={{ color: "#94a3b8" }}>
                              <Settings size={13} /> View Tenant Settings
                            </button>
                            <button onClick={() => { setOpenMenuId(null); }}
                              className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs text-left hover:bg-white/[0.04] transition-colors" style={{ color: "#94a3b8" }}>
                              <RefreshCw size={13} /> Trigger Manual Sync
                            </button>
                            <div style={{ height: 1, background: BORDER }} />
                            <button onClick={() => { setOpenMenuId(null); }}
                              className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs text-left hover:bg-white/[0.04] transition-colors"
                              style={{ color: school.is_active ? "#EF4444" : "#16A34A" }}>
                              <ToggleLeft size={13} />
                              {school.is_active ? "Suspend School" : "Reactivate School"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {schoolsPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: `1px solid ${BORDER}` }}>
            <p style={{ color: MUTED, fontSize: "0.68rem" }}>Page {schoolsPage} of {schoolsPages} ({schoolsTotal} entries)</p>
            <div className="flex gap-1.5">
              <button onClick={() => setSchoolsPage(p => Math.max(1, p - 1))} disabled={schoolsPage <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-30 transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8", border: `1px solid ${BORDER}` }}>
                <ChevronLeft size={12} /> Prev
              </button>
              <button onClick={() => setSchoolsPage(p => Math.min(schoolsPages, p + 1))} disabled={schoolsPage >= schoolsPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-30 transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", color: "#94a3b8", border: `1px solid ${BORDER}` }}>
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
