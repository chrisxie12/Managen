import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const PRIMARY = "#0080FF";

const monthlyData = [
  { month: "Jan", schoolFees: 320000, hostel: 45000, transport: 28000, other: 15000 },
  { month: "Feb", schoolFees: 280000, hostel: 45000, transport: 28000, other: 12000 },
  { month: "Mar", schoolFees: 410000, hostel: 45000, transport: 30000, other: 18000 },
  { month: "Apr", schoolFees: 195000, hostel: 45000, transport: 28000, other: 11000 },
  { month: "May", schoolFees: 380000, hostel: 45000, transport: 30000, other: 22000 },
  { month: "Jun", schoolFees: 460000, hostel: 45000, transport: 32000, other: 25000 },
];

const fmt = (n: number) => `GHS ${n.toLocaleString()}`;

const categories = [
  { label: "School Fees", key: "schoolFees" as const, color: PRIMARY, pct: 82 },
  { label: "Hostel", key: "hostel" as const, color: "#8B5CF6", pct: 10 },
  { label: "Transport", key: "transport" as const, color: "#F59E0B", pct: 6 },
  { label: "Other", key: "other" as const, color: "#6B7280", pct: 2 },
];

const maxTotal = Math.max(...monthlyData.map(d => d.schoolFees + d.hostel + d.transport + d.other));

export function BursarRevenue() {
  const ytd = monthlyData.reduce((s, d) => s + d.schoolFees + d.hostel + d.transport + d.other, 0);
  const lastMonth = monthlyData[monthlyData.length - 2];
  const thisMonth = monthlyData[monthlyData.length - 1];
  const thisTotal = thisMonth.schoolFees + thisMonth.hostel + thisMonth.transport + thisMonth.other;
  const lastTotal = lastMonth.schoolFees + lastMonth.hostel + lastMonth.transport + lastMonth.other;
  const mom = Math.round(((thisTotal - lastTotal) / lastTotal) * 100);
  const avgPerStudent = Math.round(ytd / 165);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Revenue Analytics</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>Income trends and category breakdown</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Month", value: fmt(thisTotal), sub: mom >= 0 ? `↑ ${mom}% vs last month` : `↓ ${Math.abs(mom)}% vs last month`, color: mom >= 0 ? SUCCESS : "#DC2626" },
          { label: "YTD Revenue", value: fmt(ytd), sub: "Jan – Jun 2024", color: NAVY },
          { label: "Avg per Student", value: fmt(avgPerStudent), sub: "165 enrolled", color: PRIMARY },
          { label: "Projected EOY", value: fmt(ytd * 2), sub: "Based on H1", color: "#8B5CF6" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xl font-bold" style={{ color: NAVY }}>{k.value}</p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>{k.label}</p>
            <p className="text-xs mt-1 font-medium" style={{ color: k.color }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Monthly Revenue (Jan – Jun)</h3>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map(d => {
            const total = d.schoolFees + d.hostel + d.transport + d.other;
            const height = Math.round((total / maxTotal) * 100);
            return (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-mono" style={{ color: MUTED }}>{`${Math.round(total / 1000)}k`}</span>
                <div className="w-full rounded-t-lg transition-all" style={{ height: `${height}%`, background: PRIMARY, minHeight: 4 }} />
                <span className="text-xs font-medium" style={{ color: MUTED }}>{d.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Revenue by Category</h3>
        <div className="space-y-3">
          {categories.map(c => (
            <div key={c.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium" style={{ color: NAVY }}>{c.label}</span>
                <span style={{ color: MUTED }}>{c.pct}% of total</span>
              </div>
              <div className="h-2 rounded-full bg-muted/30">
                <div className="h-2 rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Monthly Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {["Month", "School Fees", "Hostel", "Transport", "Other", "Total"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthlyData.map(d => {
                const total = d.schoolFees + d.hostel + d.transport + d.other;
                return (
                  <tr key={d.month} className="border-b border-border last:border-0 hover:bg-muted/10">
                    <td className="px-4 py-3 font-medium" style={{ color: NAVY }}>{d.month}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: MUTED }}>{fmt(d.schoolFees)}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: MUTED }}>{fmt(d.hostel)}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: MUTED }}>{fmt(d.transport)}</td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: MUTED }}>{fmt(d.other)}</td>
                    <td className="px-4 py-3 text-xs font-bold font-mono" style={{ color: NAVY }}>{fmt(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
