import { useState } from "react";
import {
  Download, RefreshCw, TrendingUp, Banknote, Smartphone, CreditCard,
  Receipt, Users, Target,
} from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";

// ─── Mock data ───────────────────────────────────────────────────
const TODAY_TRANSACTIONS = [
  { id: "T01", time: "07:58 AM", student: "Kwame Asante", class: "JHS 3A", amount: 500, method: "Cash", receipt: "RCP-001" },
  { id: "T02", time: "08:14 AM", student: "Abena Mensah", class: "JHS 2B", amount: 1200, method: "MoMo", receipt: "RCP-002" },
  { id: "T03", time: "08:32 AM", student: "Kofi Boateng", class: "JHS 1A", amount: 800, method: "Bank Transfer", receipt: "RCP-003" },
  { id: "T04", time: "08:47 AM", student: "Akosua Poku", class: "JHS 3B", amount: 950, method: "Cash", receipt: "RCP-004" },
  { id: "T05", time: "09:05 AM", student: "Yaw Darko", class: "Primary 5", amount: 600, method: "MoMo", receipt: "RCP-005" },
  { id: "T06", time: "09:23 AM", student: "Ama Owusu", class: "Primary 6", amount: 1100, method: "Bank Transfer", receipt: "RCP-006" },
  { id: "T07", time: "09:44 AM", student: "Efua Adjei", class: "JHS 2A", amount: 750, method: "Cash", receipt: "RCP-007" },
  { id: "T08", time: "10:02 AM", student: "Nana Ama Appiah", class: "Primary 4", amount: 450, method: "MoMo", receipt: "RCP-008" },
  { id: "T09", time: "10:31 AM", student: "Kwabena Frimpong", class: "JHS 1B", amount: 900, method: "Cash", receipt: "RCP-009" },
  { id: "T10", time: "10:55 AM", student: "Adjoa Asare", class: "Primary 6", amount: 650, method: "MoMo", receipt: "RCP-010" },
  { id: "T11", time: "11:08 AM", student: "Kojo Mensah", class: "JHS 3A", amount: 1300, method: "Bank Transfer", receipt: "RCP-011" },
  { id: "T12", time: "11:34 AM", student: "Maame Akua", class: "Primary 5", amount: 520, method: "Cash", receipt: "RCP-012" },
  { id: "T13", time: "12:15 PM", student: "Fiifi Asante", class: "JHS 2B", amount: 870, method: "MoMo", receipt: "RCP-013" },
  { id: "T14", time: "13:22 PM", student: "Adwoa Boateng", class: "Primary 4", amount: 490, method: "Cash", receipt: "RCP-014" },
  { id: "T15", time: "14:10 PM", student: "Nii Kotei", class: "JHS 1A", amount: 1050, method: "Bank Transfer", receipt: "RCP-015" },
];

const DAILY_TARGET = 15000;
const METHOD_COLOR: Record<string, string> = {
  Cash: SUCCESS,
  MoMo: WARNING,
  "Bank Transfer": NAVY,
};

function methodIcon(method: string) {
  if (method === "Cash") return <Banknote className="w-3.5 h-3.5" />;
  if (method === "MoMo") return <Smartphone className="w-3.5 h-3.5" />;
  return <CreditCard className="w-3.5 h-3.5" />;
}

export function BursarToday() {
  const [lastUpdated] = useState(2);

  const totalToday = TODAY_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);
  const cashTotal = TODAY_TRANSACTIONS.filter((t) => t.method === "Cash").reduce((s, t) => s + t.amount, 0);
  const momoTotal = TODAY_TRANSACTIONS.filter((t) => t.method === "MoMo").reduce((s, t) => s + t.amount, 0);
  const bankTotal = TODAY_TRANSACTIONS.filter((t) => t.method === "Bank Transfer").reduce((s, t) => s + t.amount, 0);
  const progressPct = Math.min(Math.round((totalToday / DAILY_TARGET) * 100), 100);

  const summaryCards = [
    { label: "Today's Total", value: `GHS ${totalToday.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: NAVY, bg: "#EFF6FF" },
    { label: "Cash", value: `GHS ${cashTotal.toLocaleString()}`, icon: <Banknote className="w-5 h-5" />, color: SUCCESS, bg: "#F0FDF4" },
    { label: "MoMo", value: `GHS ${momoTotal.toLocaleString()}`, icon: <Smartphone className="w-5 h-5" />, color: WARNING, bg: "#FFFBEB" },
    { label: "Bank Transfer", value: `GHS ${bankTotal.toLocaleString()}`, icon: <CreditCard className="w-5 h-5" />, color: "#6366F1", bg: "#EEF2FF" },
    { label: "Transactions", value: TODAY_TRANSACTIONS.length.toString(), icon: <Receipt className="w-5 h-5" />, color: "#EC4899", bg: "#FDF2F8" },
    { label: "Students Paid", value: TODAY_TRANSACTIONS.length.toString(), icon: <Users className="w-5 h-5" />, color: "#0EA5E9", bg: "#F0F9FF" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Today's Collections</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            {new Date().toLocaleDateString("en-GH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <RefreshCw className="w-3 h-3" style={{ color: SUCCESS }} />
            <span style={{ color: SUCCESS }}>Last updated {lastUpdated} min ago</span>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: NAVY }}
            onClick={() => alert("Exporting today's report…")}
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium" style={{ color: MUTED }}>{card.label}</p>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: card.bg, color: card.color }}
              >
                {card.icon}
              </div>
            </div>
            <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Daily target progress */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4" style={{ color: NAVY }} />
          <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Daily Target Progress</h3>
          <span className="ml-auto text-sm font-bold" style={{ color: progressPct >= 100 ? SUCCESS : NAVY }}>
            {progressPct}%
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
          <div
            className="h-3 rounded-full transition-all"
            style={{ width: `${progressPct}%`, background: progressPct >= 100 ? SUCCESS : NAVY }}
          />
        </div>
        <div className="flex justify-between text-xs" style={{ color: MUTED }}>
          <span>GHS {totalToday.toLocaleString()} collected</span>
          <span>Target: GHS {DAILY_TARGET.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment method breakdown bars */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Collection by Method</h3>
        <div className="space-y-3">
          {[
            { label: "Cash", amount: cashTotal, color: SUCCESS },
            { label: "Mobile Money (MoMo)", amount: momoTotal, color: WARNING },
            { label: "Bank Transfer", amount: bankTotal, color: "#6366F1" },
          ].map((item) => {
            const pct = totalToday > 0 ? Math.round((item.amount / totalToday) * 100) : 0;
            return (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: MUTED }}>{item.label}</span>
                  <span className="font-medium" style={{ color: NAVY }}>
                    GHS {item.amount.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full"
                    style={{ width: `${pct}%`, background: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction timeline */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
          Payment Timeline ({TODAY_TRANSACTIONS.length} transactions)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Time", "Student", "Class", "Method", "Amount (GHS)", "Receipt"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-semibold" style={{ color: MUTED }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...TODAY_TRANSACTIONS].reverse().map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-slate-50">
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: MUTED }}>{t.time}</td>
                  <td className="py-2.5 px-3 font-medium" style={{ color: NAVY }}>{t.student}</td>
                  <td className="py-2.5 px-3 text-xs" style={{ color: MUTED }}>{t.class}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className="flex items-center gap-1.5 text-xs font-medium"
                      style={{ color: METHOD_COLOR[t.method] }}
                    >
                      {methodIcon(t.method)}
                      {t.method}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold" style={{ color: SUCCESS }}>
                    {t.amount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-xs font-mono" style={{ color: MUTED }}>{t.receipt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
