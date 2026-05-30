import { useState } from "react";
import { Download, BarChart2, TrendingUp } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";

const classSummary = [
  { class: "JHS 1A", students: 32, expected: 160000, collected: 148000, outstanding: 12000 },
  { class: "JHS 1B", students: 30, expected: 150000, collected: 142500, outstanding: 7500 },
  { class: "JHS 2A", students: 28, expected: 168000, collected: 152000, outstanding: 16000 },
  { class: "JHS 2B", students: 27, expected: 162000, collected: 150000, outstanding: 12000 },
  { class: "JHS 3A", students: 25, expected: 175000, collected: 170000, outstanding: 5000 },
  { class: "JHS 3B", students: 23, expected: 161000, collected: 155000, outstanding: 6000 },
];

const methodData = [
  { method: "Cash", amount: 450000, pct: 45, color: "#16A34A" },
  { method: "MoMo", amount: 380000, pct: 38, color: "#0080FF" },
  { method: "Bank Transfer", amount: 170000, pct: 17, color: "#8B5CF6" },
];

const fmt = (n: number) => `GHS ${n.toLocaleString()}`;

export function BursarReports() {
  const [period, setPeriod] = useState("This Term");

  const totalExpected = classSummary.reduce((a, c) => a + c.expected, 0);
  const totalCollected = classSummary.reduce((a, c) => a + c.collected, 0);
  const totalOutstanding = classSummary.reduce((a, c) => a + c.outstanding, 0);
  const collectionRate = Math.round((totalCollected / totalExpected) * 100);

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
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted/50" style={{ color: MUTED }}>
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
            {classSummary.map(r => {
              const rate = Math.round((r.collected / r.expected) * 100);
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
    </div>
  );
}
