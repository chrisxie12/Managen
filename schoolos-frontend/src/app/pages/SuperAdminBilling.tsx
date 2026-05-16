import { useState, useEffect, useCallback, useMemo } from "react";
import { CreditCard, DollarSign, Download, TrendingUp, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "../services/api";
import { StatCard, AlertBanner, Badge, LoadingSkeleton, ErrorState, CARD_BG_C as CARD_BG, BORDER_C as BORDER } from "./superadmin/Components";

const TEXT = "#e2e8f0";
const MUTED = "#64748b";

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-3 rounded-xl" style={{ background: "#1a1a2e", border: `1px solid ${BORDER}`, boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
      <p style={{ color: "#e2e8f0", fontSize: "0.78rem", fontWeight: 600, marginBottom: "0.25rem" }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color, fontSize: "0.72rem" }}>{p.name}: <span style={{ fontWeight: 600 }}>{p.value}</span></p>
      ))}
    </div>
  );
};

export function SuperAdminBilling() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<{ id: string; amount: number; paidAt: string }[]>([]);

  const fetchPayments = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get<{ payments: { id: string; amount: number; paidAt: string }[] }>("/api/superadmin/payments");
      if (res.data) setPayments(res.data.payments || []);
    } catch (err: any) { setError(err.message || "Failed to load payments"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const { totalRevenue, paymentCount, avgPayment, highestPayment, monthlyData } = useMemo(() => {
    const numeric = payments.map(p => ({ ...p, amount: Number(p.amount || 0) }));
    const total = numeric.reduce((s, p) => s + p.amount, 0);
    const count = numeric.length;
    const avg = count > 0 ? total / count : 0;
    const highest = count > 0 ? Math.max(...numeric.map(p => p.amount)) : 0;

    const byMonth: Record<string, number> = {};
    for (const p of numeric) {
      if (p.paidAt) {
        const d = new Date(p.paidAt);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        byMonth[key] = (byMonth[key] || 0) + p.amount;
      }
    }
    const monthly = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, amount]) => {
        const [y, m] = month.split("-");
        const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return { month: `${names[parseInt(m) - 1]} ${y}`, amount };
      });

    return { totalRevenue: total, paymentCount: count, avgPayment: avg, highestPayment: highest, monthlyData: monthly };
  }, [payments]);

  const hasPayments = paymentCount > 0;
  const hasMonthlyTrend = monthlyData.length >= 2;
  const latestMonthRev = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].amount : 0;
  const prevMonthRev = monthlyData.length >= 2 ? monthlyData[monthlyData.length - 2].amount : 0;
  const trendDir = latestMonthRev >= prevMonthRev ? "up" : prevMonthRev > 0 ? "down" : "neutral";
  const trendPct = prevMonthRev > 0 ? Math.abs(((latestMonthRev - prevMonthRev) / prevMonthRev) * 100).toFixed(0) : "—";
  const recentPayments = payments.slice(0, 20);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchPayments} />;

  return (
    <div className="space-y-5" style={{ color: TEXT }}>
      {/* Header */}
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem" }}>Billing Intelligence</h1>
        <p style={{ color: MUTED, fontSize: "0.85rem" }}>Revenue analytics and payment monitoring</p>
      </div>

      {/* Alerts */}
      {!hasPayments && (
        <AlertBanner type="info" title="No payments recorded yet"
          message="Revenue and billing metrics will populate once schools begin subscribing." />
      )}
      {hasPayments && paymentCount < 5 && (
        <AlertBanner type="info" title="Limited payment data"
          message={`Only ${paymentCount} transaction(s) recorded. Trends and averages will improve as more data accumulates.`} />
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`GHS ${(totalRevenue / 1000).toFixed(1)}K`}
          sub={`${paymentCount} payment${paymentCount !== 1 ? "s" : ""} all-time`} color="#10B981"
          trend={hasPayments ? { dir: "up", text: "Lifetime" } : { dir: "neutral", text: "No revenue" }} />
        <StatCard icon={CreditCard} label="Transactions" value={String(paymentCount)}
          sub={hasPayments ? `${paymentCount} completed` : "No transactions"} color="#6366F1"
          trend={hasPayments ? { dir: "up", text: "Recorded" } : { dir: "neutral", text: "None" }} />
        <StatCard icon={TrendingUp} label="Avg per Transaction" value={hasPayments ? `GHS ${avgPayment.toFixed(0)}` : "GHS 0"}
          sub="Across all payments" color="#F59E0B" />
        <StatCard icon={ArrowUp} label="Highest Payment" value={hasPayments ? `GHS ${highestPayment.toLocaleString()}` : "GHS 0"}
          sub="Single largest transaction" color="#8B5CF6" />
      </div>

      {/* Monthly Revenue Trend + Summary */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Calendar size={15} color={MUTED} />
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT }}>Revenue Trend</h3>
            </div>
            {hasMonthlyTrend && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: trendDir === "up" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                {trendDir === "up" ? <ArrowUp size={12} color="#10B981" /> : <ArrowDown size={12} color="#EF4444" />}
                <span style={{ color: trendDir === "up" ? "#10B981" : "#EF4444", fontSize: "0.7rem", fontWeight: 600 }}>
                  {trendPct}% vs prev month
                </span>
              </div>
            )}
          </div>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "1rem" }}>Monthly payment volume</p>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `GHS ${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="amount" name="Revenue" radius={[4, 4, 0, 0]} barSize={32} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp size={32} color={MUTED} />
              <p style={{ color: MUTED, fontSize: "0.85rem", marginTop: "0.75rem" }}>No monthly trend data</p>
              <p style={{ color: "#475569", fontSize: "0.75rem", marginTop: "0.2rem" }}>Revenue trends will appear once payments span multiple months.</p>
            </div>
          )}
        </div>

        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: TEXT, marginBottom: "0.3rem" }}>Revenue Summary</h3>
          <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "1rem" }}>Key billing metrics</p>
          {hasPayments ? (
            <div className="space-y-3">
              {[
                { label: "Gross Revenue", value: `GHS ${totalRevenue.toLocaleString()}`, color: "#10B981" },
                { label: "Avg per Transaction", value: `GHS ${avgPayment.toFixed(0)}`, color: "#6366F1" },
                { label: "Total Transactions", value: String(paymentCount), color: "#F59E0B" },
                { label: "Highest Payment", value: `GHS ${highestPayment.toLocaleString()}`, color: "#8B5CF6" },
              ].map((m) => (
                <div key={m.label} className="p-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: m.color, fontSize: "1.1rem", fontWeight: 700 }}>{m.value}</div>
                  <div style={{ color: MUTED, fontSize: "0.72rem", marginTop: "0.15rem" }}>{m.label}</div>
                </div>
              ))}
              {monthlyData.length > 0 && (
                <div className="p-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: trendDir === "up" ? "#10B981" : "#EF4444", fontSize: "1.1rem", fontWeight: 700 }}>
                    {trendPct !== "—" ? `${trendPct}%` : "—"}
                  </div>
                  <div style={{ color: MUTED, fontSize: "0.72rem", marginTop: "0.15rem" }}>
                    {trendDir === "up" ? "Month-over-month growth" : "Month-over-month decline"}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard size={28} color={MUTED} />
              <p style={{ color: MUTED, fontSize: "0.82rem", marginTop: "0.5rem" }}>No data</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment History Table */}
      <div className="rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div className="flex items-center gap-3">
            <div>
              <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: TEXT }}>Payment History</h3>
              <p style={{ color: MUTED, fontSize: "0.75rem" }}>{paymentCount} total transaction{paymentCount !== 1 ? "s" : ""}</p>
            </div>
            {hasPayments && (
              <Badge text={`Last ${Math.min(paymentCount, 20)}`} color="#6366F1" />
            )}
          </div>
          {hasPayments && (
            <button className="flex items-center gap-1 text-xs hover:opacity-70" style={{ color: MUTED }}>
              <Download size={12} /> Export
            </button>
          )}
        </div>
        {hasPayments ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Transaction ID", "Amount", "Date", "Status"].map((h) => (
                    <th key={h} className="text-left px-5 py-3" style={{ color: MUTED, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.3px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${BORDER}` }} className="hover:opacity-80 transition-opacity">
                    <td className="px-5 py-3.5">
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", fontSize: "0.78rem" }}>{p.id.slice(0, 12)}...</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: TEXT, fontSize: "0.85rem", fontWeight: 600 }}>
                        GHS {Number(p.amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ color: MUTED, fontSize: "0.78rem" }}>
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: "rgba(16,185,129,0.12)", color: "#10B981" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10B981" }} />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard size={36} color={MUTED} />
            <p style={{ color: MUTED, fontSize: "0.9rem", marginTop: "0.75rem" }}>No payments yet</p>
            <p style={{ color: "#475569", fontSize: "0.78rem", marginTop: "0.25rem" }}>Payments from schools will appear here once subscriptions start.</p>
          </div>
        )}
      </div>

      {/* Billing Intelligence Note */}
      {!hasPayments && (
        <div className="p-5 rounded-[24px]" style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", lineHeight: 1.6 }}>
            This page will display <span style={{ color: TEXT, fontWeight: 500 }}>revenue trends, plan breakdown, subscription health, MRR tracking, and failed payment alerts</span> once payment data is available. Currently awaiting first school subscription.
          </p>
        </div>
      )}
    </div>
  );
}
