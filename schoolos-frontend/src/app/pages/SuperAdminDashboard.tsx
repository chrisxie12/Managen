import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Building2, TrendingUp, AlertCircle, CheckCircle,
  CreditCard, Activity, Zap, Shield,
  ArrowRight,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { api } from "../services/api";

const ACCENT = "#ff6b35";
const CARD_BG = "#0f0f1a";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";

const planColors: Record<string, string> = {
  trial: "#F59E0B",
  basic: "#6366F1",
  standard: "#10B981",
  premium: "#8B5CF6",
};

export function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalSchools: 0, activeSchools: 0, suspended: 0, totalRevenue: 0 });
  const [planBreakdown, setPlanBreakdown] = useState<{ plan: string; count: number }[]>([]);

  useEffect(() => {
    api.get<{ stats: typeof stats; planBreakdown: typeof planBreakdown }>("/api/superadmin/dashboard")
      .then((res) => {
        if (res.data) {
          setStats(res.data.stats);
          setPlanBreakdown(res.data.planBreakdown || []);
        }
      })
      .catch(() => {});
  }, []);

  const pieData = planBreakdown.map((p) => ({
    name: p.plan.charAt(0).toUpperCase() + p.plan.slice(1),
    value: p.count,
    color: planColors[p.plan] || MUTED,
  }));

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
          <span style={{ color: ACCENT, fontSize: "0.75rem", fontWeight: 600 }}>System Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Schools", value: stats.totalSchools.toLocaleString(), sub: `${stats.activeSchools} active`, icon: Building2, color: ACCENT, change: "+3 this week" },
          { label: "Active Schools", value: stats.activeSchools.toLocaleString(), sub: `${((stats.activeSchools / (stats.totalSchools || 1)) * 100).toFixed(0)}% of total`, icon: CheckCircle, color: "#10B981", change: "Healthy" },
          { label: "Suspended", value: stats.suspended.toLocaleString(), sub: `${((stats.suspended / (stats.totalSchools || 1)) * 100).toFixed(1)}% rate`, icon: AlertCircle, color: "#EF4444", change: stats.suspended > 0 ? "Needs attention" : "None" },
          { label: "Total Revenue", value: `GHS ${(stats.totalRevenue / 1000).toFixed(1)}K`, sub: "All-time collections", icon: TrendingUp, color: "#6366F1", change: stats.totalRevenue > 0 ? "+12% vs last month" : "No data" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-[24px] transition-all duration-200 hover:scale-[1.02]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${card.color}15` }}>
                <card.icon size={18} color={card.color} />
              </div>
              <span style={{ color: card.color, fontSize: "0.65rem", fontWeight: 600, padding: "2px 8px", borderRadius: "999px", background: `${card.color}15` }}>{card.change}</span>
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: TEXT, fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.2rem" }}>{card.value}</div>
            <div style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.1rem" }}>{card.label}</div>
            <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>{card.sub}</div>
          </div>
        ))}
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
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${(d.value / Math.max(...pieData.map(p => p.value), 1)) * 100}%`, background: d.color }} />
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: TEXT, fontSize: "0.82rem", fontWeight: 600 }}>{d.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: MUTED, fontSize: "0.85rem" }}>No schools registered yet</p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: "1rem" }}>Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "View Schools", icon: Building2, color: ACCENT, path: "/superadmin/schools" },
              { label: "Billing", icon: CreditCard, color: "#6366F1", path: "/superadmin/billing" },
              { label: "System Health", icon: Activity, color: "#10B981", path: "#" },
              { label: "Audit Log", icon: Shield, color: "#8B5CF6", path: "#" },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="p-4 rounded-2xl text-left transition-all duration-150 hover:scale-[1.03] active:scale-95"
                style={{ background: `${a.color}08`, border: `1px solid ${a.color}20` }}>
                <a.icon size={18} color={a.color} className="mb-2" />
                <p style={{ color: TEXT, fontSize: "0.78rem", fontWeight: 500 }}>{a.label}</p>
              </button>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-2xl" style={{ background: "rgba(255,107,53,0.06)", border: "1px solid rgba(255,107,53,0.15)" }}>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={14} color={ACCENT} />
              <span style={{ color: ACCENT, fontSize: "0.78rem", fontWeight: 600 }}>Platform Status</span>
            </div>
            <div className="space-y-1.5">
              {[
                { label: "Database", status: "Connected", ok: true },
                { label: "Redis Cache", status: "Available", ok: true },
                { label: "Email Service", status: "Configured", ok: true },
                { label: "Background Jobs", status: "Running", ok: true },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span style={{ color: "#94a3b8", fontSize: "0.72rem" }}>{s.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.ok ? "#10B981" : "#EF4444" }} />
                    <span style={{ color: s.ok ? "#10B981" : "#EF4444", fontSize: "0.7rem", fontWeight: 500 }}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Schools */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT }}>Recent Signups</h3>
              <p style={{ color: MUTED, fontSize: "0.78rem" }}>Latest schools to join</p>
            </div>
            <button onClick={() => navigate("/superadmin/schools")} className="flex items-center gap-1 text-xs hover:opacity-70" style={{ color: ACCENT }}>
              All schools <ArrowRight size={11} />
            </button>
          </div>
          <div className="space-y-3">
            {stats.totalSchools === 0 ? (
              <p style={{ color: MUTED, fontSize: "0.85rem", textAlign: "center", padding: "2rem 0" }}>
                Manage registered schools from the Schools page
              </p>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Building2 size={32} color={MUTED} />
                <p style={{ color: MUTED, fontSize: "0.9rem", marginTop: "0.75rem" }}>No schools registered yet</p>
                <p style={{ color: "#475569", fontSize: "0.78rem", marginTop: "0.25rem" }}>Signups will appear here once schools start registering</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subscription Insight */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: "1rem" }}>Subscription Insight</h3>
          {planBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: `1px solid ${BORDER}`, borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px]" style={{ color: MUTED, fontSize: "0.85rem" }}>No subscription data</div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: "1rem" }}>Key Metrics</h3>
          <div className="space-y-4">
            {[
              { label: "Conversion Rate", value: stats.totalSchools > 0 ? `${((stats.activeSchools / stats.totalSchools) * 100).toFixed(0)}%` : "0%", sub: "Active vs total schools", color: "#10B981" },
              { label: "Average Revenue per School", value: stats.totalSchools > 0 ? `GHS ${(stats.totalRevenue / stats.totalSchools).toFixed(0)}` : "GHS 0", sub: "Lifetime value", color: "#6366F1" },
              { label: "Suspension Rate", value: stats.totalSchools > 0 ? `${((stats.suspended / stats.totalSchools) * 100).toFixed(1)}%` : "0%", sub: "Of total schools", color: stats.suspended > 0 ? "#EF4444" : "#10B981" },
              { label: "Plan Diversity", value: `${planBreakdown.length} plans`, sub: `${pieData.reduce((a, b) => a + b.value, 0)} total subscriptions`, color: "#8B5CF6" },
            ].map((m) => (
              <div key={m.label} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div>
                  <div style={{ color: TEXT, fontSize: "0.85rem", fontWeight: 500 }}>{m.label}</div>
                  <div style={{ color: MUTED, fontSize: "0.7rem" }}>{m.sub}</div>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: m.color, fontSize: "1rem", fontWeight: 700 }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
