import { useState, useEffect } from "react";
import { Download, BarChart2, Loader2 } from "lucide-react";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";

interface ClassSummary {
  class: string; students: number; expected: number; collected: number; outstanding: number;
}
interface MethodData {
  method: string; amount: number; pct: number; color: string;
}

const METHOD_COLORS: Record<string, string> = {
  Cash: "#16A34A", MoMo: "#0080FF", "Bank Transfer": "#8B5CF6",
  cash: "#16A34A", momo: "#0080FF", bank_transfer: "#8B5CF6",
};

const fmt = (n: number) => `GHS ${n.toLocaleString()}`;

export function BursarReports() {
  const [period, setPeriod] = useState("This Term");
  const [classSummary, setClassSummary] = useState<ClassSummary[]>([]);
  const [methodData, setMethodData] = useState<MethodData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<any>(`/api/school/reports/fees?period=${encodeURIComponent(period)}`)
      .then((res) => {
        const d = res.data ?? {};
        const raw = d.classSummary ?? d.class_summary ?? d.classes ?? [];
        setClassSummary(raw.map((r: any) => ({
          class: r.class ?? r.class_name ?? "",
          students: Number(r.students ?? r.student_count ?? 0),
          expected: Number(r.expected ?? r.total_billed ?? 0),
          collected: Number(r.collected ?? r.amount_paid ?? 0),
          outstanding: Number(r.outstanding ?? r.balance ?? 0),
        })));
        const methods = d.methodData ?? d.payment_methods ?? d.methods ?? [];
        const total = methods.reduce((s: number, m: any) => s + Number(m.amount ?? 0), 0);
        setMethodData(methods.map((m: any) => {
          const amt = Number(m.amount ?? 0);
          const label = m.method === "bank_transfer" ? "Bank Transfer"
            : m.method === "momo" ? "MoMo"
            : m.method ?? "Other";
          return {
            method: label,
            amount: amt,
            pct: total > 0 ? Math.round((amt / total) * 100) : 0,
            color: METHOD_COLORS[m.method] ?? METHOD_COLORS[label] ?? MUTED,
          };
        }));
      })
      .catch(() => {
        setClassSummary([]);
        setMethodData([]);
      })
      .finally(() => setLoading(false));
  }, [period]);

  const totalExpected = classSummary.reduce((a, c) => a + c.expected, 0);
  const totalCollected = classSummary.reduce((a, c) => a + c.collected, 0);
  const totalOutstanding = classSummary.reduce((a, c) => a + c.outstanding, 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Fee Reports</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Collection analysis by class and payment method</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)}
            className="h-9 px-3 rounded-xl text-sm border border-border bg-card appearance-none focus:outline-none">
            <option>This Term</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
          <button
            onClick={() => {
              const csv = ["Class,Students,Expected,Collected,Outstanding",
                ...classSummary.map(r => `${r.class},${r.students},${r.expected},${r.collected},${r.outstanding}`)
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
              a.download = `fee-report-${new Date().toISOString().split("T")[0]}.csv`; a.click();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted/50" style={{ color: MUTED }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Expected", value: fmt(totalExpected), color: NAVY, bg: "#E0E7FF" },
          { label: "Total Collected", value: fmt(totalCollected), color: SUCCESS, bg: "#DCFCE7" },
          { label: "Outstanding", value: fmt(totalOutstanding), color: "#DC2626", bg: "#FEE2E2" },
          { label: "Collection Rate", value: `${collectionRate}%`, color: "#0080FF", bg: "#DBEAFE" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2" style={{ background: k.bg }}>
              <BarChart2 size={16} color={k.color} />
            </div>
            <p className="text-xl font-bold" style={{ color: NAVY }}>{k.value}</p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>{k.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: MUTED }}>
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading report data…
        </div>
      ) : (
        <>
          {/* By class */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Collection by Class</h3>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  {["Class", "Students", "Expected", "Collected", "Outstanding", "Rate"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: MUTED }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classSummary.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-sm" style={{ color: MUTED }}>
                      No report data available for this period.
                    </td>
                  </tr>
                ) : classSummary.map(r => {
                  const rate = r.expected > 0 ? Math.round((r.collected / r.expected) * 100) : 0;
                  return (
                    <tr key={r.class} className="border-b border-border last:border-0 hover:bg-muted/10">
                      <td className="px-4 py-3 font-medium text-sm" style={{ color: NAVY }}>{r.class}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{r.students}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: MUTED }}>{fmt(r.expected)}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: SUCCESS }}>{fmt(r.collected)}</td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: r.outstanding > 10000 ? "#DC2626" : "#F59E0B" }}>{fmt(r.outstanding)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-muted/30">
                            <div className="h-1.5 rounded-full" style={{ width: `${rate}%`, background: rate >= 90 ? SUCCESS : rate >= 75 ? "#F59E0B" : "#DC2626" }} />
                          </div>
                          <span className="text-xs font-medium w-8 text-right" style={{ color: NAVY }}>{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* By payment method */}
          {methodData.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Collection by Payment Method</h3>
              <div className="space-y-3">
                {methodData.map(m => (
                  <div key={m.method}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium" style={{ color: NAVY }}>{m.method}</span>
                      <span style={{ color: MUTED }}>{fmt(m.amount)} ({m.pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted/30">
                      <div className="h-2 rounded-full transition-all" style={{ width: `${m.pct}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
