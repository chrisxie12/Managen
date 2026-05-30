import { useState } from "react";
import { CheckCircle, AlertTriangle, XCircle, Upload } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";

interface ReconcRow {
  date: string; opening: number; cashIn: number; cashOut: number;
  expectedClosing: number; actualClosing: number; variance: number;
  status: "balanced" | "minor" | "major";
}

function makeRows(): ReconcRow[] {
  const rows: ReconcRow[] = [];
  let balance = 12500;
  for (let day = 1; day <= 20; day++) {
    const cashIn = [8200, 5400, 11200, 3800, 9600, 7100, 4200, 13400, 6800, 8900,
      5100, 9800, 7600, 4400, 12100, 6300, 8700, 5900, 10400, 7800][day - 1] || 6000;
    const cashOut = [4100, 2300, 3800, 1500, 4200, 3100, 1900, 5600, 2800, 3700,
      2100, 4200, 3200, 1800, 5100, 2600, 3600, 2500, 4400, 3300][day - 1] || 2500;
    const expectedClosing = balance + cashIn - cashOut;
    const varianceRaw = [0, 0, -20, 0, 0, 0, 15, 0, 0, -50, 0, 0, 0, 0, 0, 30, 0, 0, 0, 0][day - 1] || 0;
    const actualClosing = expectedClosing + varianceRaw;
    const variance = actualClosing - expectedClosing;
    const status: ReconcRow["status"] = variance === 0 ? "balanced" : Math.abs(variance) <= 30 ? "minor" : "major";
    rows.push({
      date: `2024-06-${String(day).padStart(2, "0")}`,
      opening: balance, cashIn, cashOut, expectedClosing, actualClosing, variance, status,
    });
    balance = actualClosing;
  }
  return rows;
}

const rows = makeRows();
const fmt = (n: number) => `GHS ${Math.abs(n).toLocaleString()}`;

export function BursarReconciliation() {
  const [dateRange, setDateRange] = useState("June 2024");

  const balanced = rows.filter(r => r.status === "balanced").length;
  const minor = rows.filter(r => r.status === "minor").length;
  const major = rows.filter(r => r.status === "major").length;
  const totalVariance = rows.reduce((s, r) => s + Math.abs(r.variance), 0);

  const StatusIcon = ({ status }: { status: ReconcRow["status"] }) => {
    if (status === "balanced") return <CheckCircle size={14} color={SUCCESS} />;
    if (status === "minor") return <AlertTriangle size={14} color="#D97706" />;
    return <XCircle size={14} color="#DC2626" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Reconciliation</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Daily cash book vs. actual balance</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={dateRange} onChange={e => setDateRange(e.target.value)}
            className="h-9 px-3 rounded-xl text-sm border border-border bg-card appearance-none focus:outline-none">
            {["June 2024", "May 2024", "April 2024"].map(m => <option key={m}>{m}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted/50" style={{ color: MUTED }}>
            <Upload size={14} /> Upload Statement
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Balanced Days", value: balanced, color: SUCCESS, bg: "#DCFCE7" },
          { label: "Minor Variance", value: minor, color: "#D97706", bg: "#FEF3C7" },
          { label: "Major Variance", value: major, color: "#DC2626", bg: "#FEE2E2" },
          { label: "Total Variance", value: fmt(totalVariance), color: NAVY, bg: "#E0E7FF" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2 text-sm font-bold"
              style={{ background: k.bg, color: k.color }}>
              {typeof k.value === "number" ? k.value : "Σ"}
            </div>
            <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {["Date", "Opening", "Cash In", "Cash Out", "Expected", "Actual", "Variance", "Status"].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.date}
                  className="border-b border-border last:border-0 hover:bg-muted/10"
                  style={{
                    background: r.status === "major" ? "#FEF2F2" : r.status === "minor" ? "#FFFBEB" : undefined,
                  }}>
                  <td className="px-3 py-2.5 text-xs font-medium" style={{ color: NAVY }}>{r.date}</td>
                  <td className="px-3 py-2.5 text-xs font-mono" style={{ color: MUTED }}>{fmt(r.opening)}</td>
                  <td className="px-3 py-2.5 text-xs font-mono" style={{ color: SUCCESS }}>{fmt(r.cashIn)}</td>
                  <td className="px-3 py-2.5 text-xs font-mono" style={{ color: "#DC2626" }}>{fmt(r.cashOut)}</td>
                  <td className="px-3 py-2.5 text-xs font-mono" style={{ color: NAVY }}>{fmt(r.expectedClosing)}</td>
                  <td className="px-3 py-2.5 text-xs font-mono" style={{ color: NAVY }}>{fmt(r.actualClosing)}</td>
                  <td className="px-3 py-2.5 text-xs font-mono font-semibold"
                    style={{ color: r.variance === 0 ? SUCCESS : r.variance > 0 ? SUCCESS : "#DC2626" }}>
                    {r.variance === 0 ? "0" : r.variance > 0 ? `+${fmt(r.variance)}` : `-${fmt(r.variance)}`}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <StatusIcon status={r.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
