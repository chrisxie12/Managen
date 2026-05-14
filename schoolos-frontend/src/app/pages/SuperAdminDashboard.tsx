import { useState, useEffect } from "react";
import { Building2, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../services/api";

const planColors: Record<string, string> = {
  trial: "#F59E0B",
  basic: "#6366F1",
  standard: "#10B981",
  premium: "#8B5CF6",
};

export function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalSchools: 0,
    activeSchools: 0,
    suspended: 0,
    totalRevenue: 0,
  });
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
    color: planColors[p.plan] || "#64748b",
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Schools", value: stats.totalSchools.toLocaleString(), icon: Building2, color: "#ff6b35" },
          { label: "Active", value: stats.activeSchools.toLocaleString(), icon: CheckCircle, color: "#10B981" },
          { label: "Suspended", value: stats.suspended.toLocaleString(), icon: AlertCircle, color: "#EF4444" },
          { label: "Revenue", value: `GHS ${(stats.totalRevenue / 1000).toFixed(1)}K`, icon: TrendingUp, color: "#6366F1" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-[24px]" style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${card.color}15` }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{card.value}</div>
            <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-[24px]" style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "1.5rem" }}>Platform Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Schools on Trial", value: planBreakdown.find((p) => p.plan === "trial")?.count || 0, color: "#F59E0B" },
              { label: "Basic Plan", value: planBreakdown.find((p) => p.plan === "basic")?.count || 0, color: "#6366F1" },
              { label: "Standard Plan", value: planBreakdown.find((p) => p.plan === "standard")?.count || 0, color: "#10B981" },
              { label: "Premium Plan", value: planBreakdown.find((p) => p.plan === "premium")?.count || 0, color: "#8B5CF6" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)" }}>
                <div style={{ color: "#64748b", fontSize: "0.78rem", marginBottom: "0.3rem" }}>{item.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0", fontSize: "1.3rem", fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-[24px]" style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>Plan Distribution</h3>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                      <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>{d.name}</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0", fontSize: "0.82rem", fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p style={{ color: "#64748b", fontSize: "0.85rem" }}>No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
