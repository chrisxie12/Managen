import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Receipt, ArrowRight } from "lucide-react";
import { api } from "../services/api";
import { LoadingSpinner, KpiCard, DashboardCard, MiniTable, StatusBadge, palette } from "../components/dashboard";

const { NAVY, MUTED } = palette;

type Payment = { id: string; amount: number; status: string; paid_at?: string; created_at?: string; school_name?: string; description?: string };

export function AccountantDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [feesRes] = await Promise.all([
          api.get<{ fees: any[] }>("/api/school/fees").catch(() => ({ data: undefined })),
        ]);
        const fees = feesRes.data?.fees || [];
        setPayments(fees.map((f: any) => ({
          id: f.id, amount: Number(f.amount || 0), status: f.status || "pending",
          paid_at: f.paid_at, created_at: f.created_at, description: f.description,
        })));
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalCollected = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const outstanding = payments.filter(p => p.status === "partial" || p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const overdue = payments.filter(p => p.status === "overdue").reduce((s, p) => s + p.amount, 0);
  const overdueCount = payments.filter(p => p.status === "overdue").length;
  const thisMonth = payments.filter(p => {
    const d = new Date(p.paid_at || p.created_at || Date.now());
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthlyTotal = thisMonth.reduce((s, p) => s + p.amount, 0);
  const hasData = payments.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard value={`GHS ${totalCollected.toLocaleString()}`} label="Total Collected" sub={`${payments.filter(p => p.status === "paid").length} paid records`} positive />
        <KpiCard value={`GHS ${outstanding.toLocaleString()}`} label="Outstanding" positive={false} sub="Partial + pending" />
        <KpiCard value={overdueCount.toString()} label="Overdue Accounts" sub={`GHS ${overdue.toLocaleString()} total`} positive={overdueCount === 0} />
        <KpiCard value={`GHS ${monthlyTotal.toLocaleString()}`} label="Invoices This Month" sub={`${thisMonth.length} transaction${thisMonth.length !== 1 ? "s" : ""}`} positive />
      </div>

      {hasData ? (
        <DashboardCard title="Recent Transactions" action={
          <button onClick={() => navigate("/dashboard/finance")} className="flex items-center gap-1 text-xs" style={{ color: NAVY }}>
            View All <ArrowRight size={11} />
          </button>
        }>
          <MiniTable
            headers={["Amount", "Status", "Date"]}
            rows={payments.slice(0, 10).map((p) => [
              `GHS ${p.amount.toLocaleString()}`,
              <StatusBadge key={p.id} status={p.status} />,
              p.paid_at || p.created_at ? new Date(p.paid_at || p.created_at!).toLocaleDateString() : "—",
            ])}
          />
        </DashboardCard>
      ) : (
        <div className="flex items-center justify-center min-h-[300px] rounded-[24px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
          <div className="text-center p-8">
            <Receipt size={40} color={MUTED} className="mx-auto mb-4" />
            <p style={{ color: NAVY, fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>No Financial Data Yet</p>
            <p style={{ color: MUTED, fontSize: "0.85rem" }}>Revenue, invoices, and transaction history will appear once fees are set up and payments are recorded.</p>
          </div>
        </div>
      )}
    </div>
  );
}
