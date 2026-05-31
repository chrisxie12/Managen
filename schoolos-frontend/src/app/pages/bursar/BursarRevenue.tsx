import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const PRIMARY = "#0080FF";

interface MonthlyEntry {
  month: string; schoolFees: number; hostel: number; transport: number; other: number;
}

const fmt = (n: number) => `GHS ${n.toLocaleString()}`;

export function BursarRevenue() {
  const [monthlyData, setMonthlyData] = useState<MonthlyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledCount, setEnrolledCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get<any>("/api/school/finance/monthly?months=12")
      .then((res) => {
        const d = res.data ?? {};
        const raw = d.monthly ?? [];
        setMonthlyData(raw.map((r: any) => ({
          month: r.label ?? r.month ?? "",
          schoolFees: Number(r.amount ?? r.schoolFees ?? 0),
          hostel: 0,
          transport: 0,
          other: 0,
        })));
        setEnrolledCount(0);
      })
      .catch(() => setMonthlyData([]))
      .finally(() => setLoading(false));
  }, []);

  const ytd = monthlyData.reduce((s, d) => s + d.schoolFees + d.hostel + d.transport + d.other, 0);
  const maxTotal = monthlyData.length > 0
    ? Math.max(...monthlyData.map(d => d.schoolFees + d.hostel + d.transport + d.other), 1)
    : 1;

  const thisMonth = monthlyData[monthlyData.length - 1];
  const lastMonth = monthlyData[monthlyData.length - 2];
  const thisTotal = thisMonth ? thisMonth.schoolFees + thisMonth.hostel + thisMonth.transport + thisMonth.other : 0;
  const lastTotal = lastMonth ? lastMonth.schoolFees + lastMonth.hostel + lastMonth.transport + lastMonth.other : 0;
  const mom = lastTotal > 0 ? Math.round(((thisTotal - lastTotal) / lastTotal) * 100) : 0;
  const avgPerStudent = enrolledCount > 0 && ytd > 0 ? Math.round(ytd / enrolledCount) : 0;

  const categories = [
    { label: "School Fees", key: "schoolFees" as const, color: PRIMARY },
    { label: "Hostel", key: "hostel" as const, color: "#8B5CF6" },
    { label: "Transport", key: "transport" as const, color: "#F59E0B" },
    { label: "Other", key: "other" as const, color: "#6B7280" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Revenue Analytics</h1>
        <p className="text-sm mt-1" style={{ color: MUTED }}>Income trends and category breakdown</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "This Month", value: fmt(thisTotal),
            sub: monthlyData.length >= 2 ? (mom >= 0 ? `↑ ${mom}% vs last month` : `↓ ${Math.abs(mom)}% vs last month`) : "—",
            color: mom >= 0 ? SUCCESS : "#DC2626",
          },
          { label: "YTD Revenue", value: fmt(ytd), sub: `${monthlyData.length} months`, color: NAVY },
          {
            label: "Avg per Student", value: avgPerStudent > 0 ? fmt(avgPerStudent) : "—",
            sub: enrolledCount > 0 ? `${enrolledCount} enrolled` : "No enrollment data",
            color: PRIMARY,
          },
          { label: "Projected EOY", value: ytd > 0 ? fmt(Math.round(ytd * (12 / Math.max(monthlyData.length, 1)))) : "—", sub: "Annualised", color: "#8B5CF6" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xl font-bold" style={{ color: NAVY }}>{k.value}</p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>{k.label}</p>
            {k.sub && <p className="text-xs mt-1 font-medium" style={{ color: k.color }}>{k.sub}</p>}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: MUTED }}>
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading revenue data…
        </div>
      ) : monthlyData.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center" style={{ color: MUTED }}>
          No revenue data available yet.
        </div>
      ) : (
        <>
          {/* Monthly bar chart */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
              Monthly Revenue ({monthlyData[0]?.month} – {monthlyData[monthlyData.length - 1]?.month})
            </h3>
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
          {ytd > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Revenue by Category</h3>
              <div className="space-y-3">
                {categories.map(c => {
                  const catTotal = monthlyData.reduce((s, d) => s + d[c.key], 0);
                  const pct = ytd > 0 ? Math.round((catTotal / ytd) * 100) : 0;
                  return (
                    <div key={c.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium" style={{ color: NAVY }}>{c.label}</span>
                        <span style={{ color: MUTED }}>{pct}% of total</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/30">
                        <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: c.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
        </>
      )}
    </div>
  );
}
