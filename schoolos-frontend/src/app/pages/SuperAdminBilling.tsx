import { useState, useEffect, useCallback } from "react";
import { CreditCard, AlertCircle, DollarSign, Download } from "lucide-react";
import { api } from "../services/api";
import { StatCard, LoadingSkeleton, ErrorState, CARD_BG_C as CARD_BG, BORDER_C as BORDER } from "./superadmin/Components";

const TEXT = "#e2e8f0";
const MUTED = "#64748b";

export function SuperAdminBilling() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<{ id: string; amount: number; paidAt: string }[]>([]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ payments: { id: string; amount: number; paidAt: string }[] }>("/api/superadmin/payments");
      if (res.data) setPayments(res.data.payments || []);
    } catch (err: any) {
      setError(err.message || "Failed to load payments");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const paymentCount = payments.length;

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchPayments} />;

  return (
    <div className="space-y-6" style={{ color: TEXT }}>
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem" }}>Billing</h1>
        <p style={{ color: MUTED, fontSize: "0.85rem" }}>Platform subscription and payment overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={DollarSign} label="Total Revenue" value={`GHS ${(totalRevenue / 1000).toFixed(1)}K`} sub={`${paymentCount} payments all-time`} color="#10B981" trend={paymentCount > 0 ? { dir: "up", text: "Active" } : { dir: "down", text: "No data" }} />
        <StatCard icon={CreditCard} label="Transactions" value={String(paymentCount)} sub={`${payments.filter(p => Number(p.amount) > 0).length} successful`} color="#6366F1" trend={paymentCount > 0 ? { dir: "up", text: "Recorded" } : { dir: "down", text: "None" }} />
        <StatCard icon={AlertCircle} label="Avg Payment" value={paymentCount > 0 ? `GHS ${(totalRevenue / paymentCount).toFixed(0)}` : "GHS 0"} sub="Per transaction" color="#F59E0B" />
      </div>

      <div className="rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: TEXT }}>Payment History</h3>
            <p style={{ color: MUTED, fontSize: "0.75rem" }}>{paymentCount} total transactions</p>
          </div>
          {paymentCount > 0 && (
            <button className="flex items-center gap-1 text-xs hover:opacity-70" style={{ color: MUTED }}>
              <Download size={12} /> Export
            </button>
          )}
        </div>
        {paymentCount > 0 ? (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["ID", "Amount", "Date", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3" style={{ color: MUTED, fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 50).map((p) => (
                <tr key={p.id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <td className="px-5 py-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#94a3b8", fontSize: "0.78rem" }}>{p.id.slice(0, 12)}...</td>
                  <td className="px-5 py-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: TEXT, fontSize: "0.85rem", fontWeight: 600 }}>GHS {Number(p.amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-4" style={{ color: MUTED, fontSize: "0.78rem" }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#10B981" }}>Paid</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard size={36} color={MUTED} />
            <p style={{ color: MUTED, fontSize: "0.9rem", marginTop: "0.75rem" }}>No payments yet</p>
            <p style={{ color: "#475569", fontSize: "0.78rem", marginTop: "0.25rem" }}>Payments from schools will appear here once subscriptions start.</p>
          </div>
        )}
      </div>

      {paymentCount > 0 && (
        <div className="p-6 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: TEXT, marginBottom: "1rem" }}>Revenue Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Gross Revenue", value: `GHS ${totalRevenue.toLocaleString()}`, color: "#10B981" },
              { label: "Avg per Transaction", value: paymentCount > 0 ? `GHS ${(totalRevenue / paymentCount).toFixed(0)}` : "GHS 0", color: "#6366F1" },
              { label: "Total Transactions", value: String(paymentCount), color: "#F59E0B" },
              { label: "Highest Payment", value: `GHS ${Math.max(...payments.map(p => Number(p.amount || 0)), 0).toLocaleString()}`, color: "#8B5CF6" },
            ].map((m) => (
              <div key={m.label} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: m.color, fontSize: "1.2rem", fontWeight: 700 }}>{m.value}</div>
                <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.2rem" }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
