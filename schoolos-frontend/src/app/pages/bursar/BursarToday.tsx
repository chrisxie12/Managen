import { useState, useEffect } from "react";
import {
  Download, RefreshCw, TrendingUp, Banknote, Smartphone, CreditCard,
  Receipt, Users, Target, Loader2,
} from "lucide-react";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";

const DAILY_TARGET = 15000;

const METHOD_COLOR: Record<string, string> = {
  Cash: SUCCESS, MoMo: WARNING, "Bank Transfer": NAVY,
};

function methodIcon(method: string) {
  if (method === "Cash") return <Banknote className="w-3.5 h-3.5" />;
  if (method === "MoMo") return <Smartphone className="w-3.5 h-3.5" />;
  return <CreditCard className="w-3.5 h-3.5" />;
}

interface Transaction {
  id: string; time: string; student: string; class: string;
  amount: number; method: string; receipt: string;
}

export function BursarToday() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  function fetchToday() {
    setLoading(true);
    api.get<{ payments: any[] }>("/api/school/payments/today")
      .then((res) => {
        const raw = res.data?.payments ?? [];
        setTransactions(raw.map((p: any, i: number) => ({
          id: String(p.id ?? i),
          time: p.time || new Date(p.created_at || p.date || Date.now()).toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" }),
          student: p.student_name || p.studentName || "",
          class: p.class || p.class_name || "",
          amount: Number(p.amount),
          method: p.payment_method === "bank_transfer" ? "Bank Transfer"
            : p.payment_method === "momo" ? "MoMo" : "Cash",
          receipt: p.receipt_no || `RCP-${String(p.id ?? i).padStart(3, "0")}`,
        })));
        setLastUpdated(new Date());
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchToday(); }, []);

  const totalToday = transactions.reduce((s, t) => s + t.amount, 0);
  const cashTotal = transactions.filter((t) => t.method === "Cash").reduce((s, t) => s + t.amount, 0);
  const momoTotal = transactions.filter((t) => t.method === "MoMo").reduce((s, t) => s + t.amount, 0);
  const bankTotal = transactions.filter((t) => t.method === "Bank Transfer").reduce((s, t) => s + t.amount, 0);
  const progressPct = Math.min(Math.round((totalToday / DAILY_TARGET) * 100), 100);

  const minutesAgo = lastUpdated
    ? Math.round((Date.now() - lastUpdated.getTime()) / 60000)
    : null;

  const summaryCards = [
    { label: "Today's Total", value: `GHS ${totalToday.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5" />, color: NAVY, bg: "#EFF6FF" },
    { label: "Cash", value: `GHS ${cashTotal.toLocaleString()}`, icon: <Banknote className="w-5 h-5" />, color: SUCCESS, bg: "#F0FDF4" },
    { label: "MoMo", value: `GHS ${momoTotal.toLocaleString()}`, icon: <Smartphone className="w-5 h-5" />, color: WARNING, bg: "#FFFBEB" },
    { label: "Bank Transfer", value: `GHS ${bankTotal.toLocaleString()}`, icon: <CreditCard className="w-5 h-5" />, color: "#6366F1", bg: "#EEF2FF" },
    { label: "Transactions", value: transactions.length.toString(), icon: <Receipt className="w-5 h-5" />, color: "#EC4899", bg: "#FDF2F8" },
    { label: "Students Paid", value: new Set(transactions.map(t => t.student)).size.toString(), icon: <Users className="w-5 h-5" />, color: "#0EA5E9", bg: "#F0F9FF" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Today's Collections</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            {new Date().toLocaleDateString("en-GH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
              <RefreshCw className="w-3 h-3" style={{ color: SUCCESS }} />
              <span style={{ color: SUCCESS }}>
                {minutesAgo === 0 ? "Just updated" : `Updated ${minutesAgo}m ago`}
              </span>
            </div>
          )}
          <button
            onClick={fetchToday}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted/50"
            style={{ color: MUTED }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white"
            style={{ background: NAVY }}
            onClick={() => {
              const csv = ["Time,Student,Class,Method,Amount,Receipt",
                ...transactions.map(t => `${t.time},${t.student},${t.class},${t.method},${t.amount},${t.receipt}`)
              ].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
              a.download = `collections-${new Date().toISOString().split("T")[0]}.csv`; a.click();
            }}
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16" style={{ color: MUTED }}>
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading today's data…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryCards.map((card) => (
              <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium" style={{ color: MUTED }}>{card.label}</p>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: card.bg, color: card.color }}>{card.icon}</div>
                </div>
                <p className="text-xl font-bold" style={{ color: card.color }}>{card.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4" style={{ color: NAVY }} />
              <h3 className="text-sm font-semibold" style={{ color: NAVY }}>Daily Target Progress</h3>
              <span className="ml-auto text-sm font-bold" style={{ color: progressPct >= 100 ? SUCCESS : NAVY }}>
                {progressPct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 mb-2">
              <div className="h-3 rounded-full transition-all"
                style={{ width: `${progressPct}%`, background: progressPct >= 100 ? SUCCESS : NAVY }} />
            </div>
            <div className="flex justify-between text-xs" style={{ color: MUTED }}>
              <span>GHS {totalToday.toLocaleString()} collected</span>
              <span>Target: GHS {DAILY_TARGET.toLocaleString()}</span>
            </div>
          </div>

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
                      <div className="h-2.5 rounded-full" style={{ width: `${pct}%`, background: item.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>
              Payment Timeline ({transactions.length} transaction{transactions.length !== 1 ? "s" : ""})
            </h3>
            {transactions.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: MUTED }}>No payments recorded today yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Time", "Student", "Class", "Method", "Amount (GHS)", "Receipt"].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold" style={{ color: MUTED }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...transactions].reverse().map((t) => (
                      <tr key={t.id} className="border-b border-border last:border-0 hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-xs font-mono" style={{ color: MUTED }}>{t.time}</td>
                        <td className="py-2.5 px-3 font-medium" style={{ color: NAVY }}>{t.student}</td>
                        <td className="py-2.5 px-3 text-xs" style={{ color: MUTED }}>{t.class}</td>
                        <td className="py-2.5 px-3">
                          <span className="flex items-center gap-1.5 text-xs font-medium"
                            style={{ color: METHOD_COLOR[t.method] || MUTED }}>
                            {methodIcon(t.method)} {t.method}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-bold" style={{ color: SUCCESS }}>{t.amount.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-xs font-mono" style={{ color: MUTED }}>{t.receipt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
