import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, XCircle, Upload, Loader2 } from "lucide-react";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";

interface ReconcRow {
  date: string; opening: number; cashIn: number; cashOut: number;
  expectedClosing: number; actualClosing: number; variance: number;
  status: "balanced" | "minor" | "major";
}

const fmt = (n: number) => `GHS ${Math.abs(n).toLocaleString()}`;

function classifyStatus(variance: number): ReconcRow["status"] {
  if (variance === 0) return "balanced";
  if (Math.abs(variance) <= 30) return "minor";
  return "major";
}

const StatusIcon = ({ status }: { status: ReconcRow["status"] }) => {
  if (status === "balanced") return <CheckCircle size={14} color={SUCCESS} />;
  if (status === "minor") return <AlertTriangle size={14} color="#D97706" />;
  return <XCircle size={14} color="#DC2626" />;
};

const PERIOD_OPTIONS = (() => {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return d.toLocaleString("en-GH", { month: "long", year: "numeric" });
  });
})();

export function BursarReconciliation() {
  const [dateRange, setDateRange] = useState(PERIOD_OPTIONS[0]);
  const [rows, setRows] = useState<ReconcRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<any>(`/api/school/reconciliation?period=${encodeURIComponent(dateRange)}`)
      .then((res) => {
        const d = res.data ?? {};
        const raw = d.rows ?? d.reconciliation ?? d.data ?? [];
        setRows(raw.map((r: any) => {
          const opening = Number(r.opening ?? r.opening_balance ?? 0);
          const cashIn = Number(r.cashIn ?? r.cash_in ?? 0);
          const cashOut = Number(r.cashOut ?? r.cash_out ?? 0);
          const expectedClosing = Number(r.expectedClosing ?? r.expected_closing ?? opening + cashIn - cashOut);
          const actualClosing = Number(r.actualClosing ?? r.actual_closing ?? expectedClosing);
          const variance = actualClosing - expectedClosing;
          return {
            date: r.date ?? "",
            opening, cashIn, cashOut, expectedClosing, actualClosing, variance,
            status: (r.status as ReconcRow["status"]) ?? classifyStatus(variance),
          };
        }));
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [dateRange]);

  const balanced = rows.filter(r => r.status === "balanced").length;
  const minor = rows.filter(r => r.status === "minor").length;
  const major = rows.filter(r => r.status === "major").length;
  const totalVariance = rows.reduce((s, r) => s + Math.abs(r.variance), 0);

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
            {PERIOD_OPTIONS.map(m => <option key={m}>{m}</option>)}
          </select>
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted/50 cursor-pointer" style={{ color: MUTED }}>
            <Upload size={14} /> Upload Statement
            <input type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("period", dateRange);
                api.post("/api/school/reconciliation/upload", formData).catch(() => {});
              }
            }} />
          </label>
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

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: MUTED }}>
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading reconciliation data…
        </div>
      ) : (
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
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: MUTED }}>
                      No reconciliation data for this period.
                    </td>
                  </tr>
                ) : rows.map(r => (
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
                      <StatusIcon status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
