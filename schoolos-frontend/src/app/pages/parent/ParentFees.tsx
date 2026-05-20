import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Wallet, ArrowDown, ArrowUp, Loader2, CheckCircle, XCircle } from "lucide-react";
import { api } from "../../services/api";
import { toast } from "sonner";
import { addToSyncQueue } from "../../lib/offlineSync";
import { useAuth } from "../../contexts/AuthContext";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type Child = { id: string; name: string; class_name: string };
type Invoice = {
  id: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  due_date?: string;
  term?: { name: string };
};
type Payment = {
  id: string;
  amount: number;
  method: string;
  status: string;
  created_at: string;
};

export function ParentFees() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const childId = searchParams.get("child");
  const refParam = searchParams.get("reference");

  const [children, setChildren] = useState<Child[]>([]);
  const [selected, setSelected] = useState<Child | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<"success" | "failed" | null>(null);

  useEffect(() => {
    api.get<{ children: Child[] }>("/api/school/parent/children")
      .then((res) => {
        const kids = res.data?.children || [];
        setChildren(kids);
        const preselected = childId ? kids.find((k) => k.id === childId) : kids[0];
        if (preselected) setSelected(preselected);
      })
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, [childId]);

  useEffect(() => {
    if (!selected) return;
    Promise.all([
      api.get<{ invoices: Invoice[] }>(`/api/school/invoices?student_id=${selected.id}`).catch(() => ({ data: { invoices: [] } })),
      api.get<{ payments: Payment[] }>(`/api/school/payments?student_id=${selected.id}`).catch(() => ({ data: { payments: [] } })),
    ]).then(([invRes, payRes]) => {
      setInvoices(invRes.data?.invoices || []);
      setPayments(payRes.data?.payments || []);
    });
  }, [selected]);

  useEffect(() => {
    if (!refParam) return;
    setVerifying(true);
    api.get<{ status: string; message?: string }>(`/api/billing/verify-payment?reference=${refParam}`)
      .then((res) => {
        const ok = res.data?.status === "completed" || res.data?.status === "already_completed";
        setVerifyResult(ok ? "success" : "failed");
        if (ok) {
          toast.success("Payment verified successfully!");
          setSearchParams((prev) => { prev.delete("reference"); prev.delete("trxref"); return prev; });
        } else {
          toast.error(res.data?.message || "Payment verification failed.");
        }
      })
      .catch(() => {
        setVerifyResult("failed");
        toast.error("Could not verify payment.");
      })
      .finally(() => setVerifying(false));
  }, [refParam, setSearchParams]);

  const totalBilled = invoices.reduce((s, i) => s + Number(i.total_amount), 0);
  const totalPaid = invoices.reduce((s, i) => s + Number(i.paid_amount), 0);
  const balance = totalBilled - totalPaid;
  const pendingInvoices = invoices.filter((i) => i.status === "pending" || i.status === "overdue");

  const handlePayWithPaystack = async (invoice: Invoice) => {
    if (!selected || !user?.email) return;
    setPaying(true);
    const amount = Number(invoice.total_amount) - Number(invoice.paid_amount);
    try {
      if (!navigator.onLine) {
        await addToSyncQueue("fee-payment", { studentId: selected.id, amount, method: "offline_pending" });
        toast.success("Payment saved offline. Will sync when connected.");
        return;
      }
      const callbackUrl = `${window.location.origin}/parent/fees?child=${selected.id}`;
      const res = await api.post<{ authorization_url: string; reference: string }>(
        "/api/billing/paystack-initialize",
        { invoice_id: invoice.id, amount, email: user.email, callback_url: callbackUrl }
      );
      const authUrl = res.data?.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error("No authorization URL returned.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || "Payment initialization failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={28} color={NAVY} /></div>;

  return (
    <div className="space-y-5">
      {/* Child selector */}
      {children.length > 1 && (
        <select
          value={selected?.id || ""}
          onChange={(e) => setSelected(children.find((c) => c.id === e.target.value) || null)}
          className="w-full p-3 rounded-2xl text-sm font-medium"
          style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}
        >
          {children.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}

      {selected && (
        <>
          {/* Verify result banner */}
          {verifying && (
            <div className="flex items-center gap-2 p-4 rounded-2xl" style={{ background: "#FFF3CD", border: "1px solid #FFC107" }}>
              <Loader2 className="animate-spin" size={18} color="#856404" />
              <span className="text-sm" style={{ color: "#856404" }}>Verifying your payment...</span>
            </div>
          )}
          {verifyResult === "success" && (
            <div className="flex items-center gap-2 p-4 rounded-2xl" style={{ background: "#D4EDDA", border: "1px solid #28A745" }}>
              <CheckCircle size={18} color="#155724" />
              <span className="text-sm font-medium" style={{ color: "#155724" }}>Payment successful! Your account has been updated.</span>
            </div>
          )}
          {verifyResult === "failed" && (
            <div className="flex items-center gap-2 p-4 rounded-2xl" style={{ background: "#F8D7DA", border: "1px solid #DC3545" }}>
              <XCircle size={18} color="#721C24" />
              <span className="text-sm font-medium" style={{ color: "#721C24" }}>Payment verification failed. Please contact support if funds were deducted.</span>
            </div>
          )}

          {/* Balance summary */}
          <div className="p-5 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` }}>
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={18} />
              <span className="text-sm opacity-80">Total Balance</span>
            </div>
            <p className="text-2xl font-bold font-mono">GH₵ {(balance / 100).toLocaleString()}</p>
            <div className="flex gap-4 mt-3 text-xs opacity-80">
              <span>Billed: GH₵ {(totalBilled / 100).toLocaleString()}</span>
              <span>Paid: GH₵ {(totalPaid / 100).toLocaleString()}</span>
            </div>
          </div>

          {/* Pending invoices */}
          {pendingInvoices.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                <ArrowDown size={15} color="#EF4444" /> Outstanding Payments
              </h3>
              {pendingInvoices.map((inv) => {
                const due = Number(inv.total_amount) - Number(inv.paid_amount);
                return (
                  <div key={inv.id} className="p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: NAVY }}>{inv.term?.name || "Term"} Fee</span>
                      <span className="text-xs font-mono font-bold" style={{ color: inv.status === "overdue" ? "#EF4444" : "#F59E0B" }}>
                        GH₵ {(due / 100).toLocaleString()}
                      </span>
                    </div>
                    {inv.due_date && (
                      <p className="text-[11px]" style={{ color: MUTED }}>Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                    )}
                    <button
                      onClick={() => handlePayWithPaystack(inv)}
                      disabled={paying || verifying}
                      className="mt-2 w-full py-2.5 rounded-xl text-xs font-semibold active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ background: "#0A2472", color: "white" }}
                    >
                      {paying ? <Loader2 className="animate-spin" size={14} /> : null}
                      {paying ? "Connecting to Paystack..." : `Pay with Paystack — GH₵ ${(due / 100).toLocaleString()}`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment history */}
          {payments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: NAVY }}>
                <ArrowUp size={15} color="#10B981" /> Payment History
              </h3>
              {payments.slice(0, 10).map((p) => {
                const methodLabel: Record<string, string> = { card: "Card", mobile_money: "Mobile Money", cash: "Cash", bank_transfer: "Bank Transfer", paystack: "Online" };
                return (
                  <div key={p.id} className="p-3 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium" style={{ color: NAVY }}>{methodLabel[p.method] || p.method.toUpperCase()}</span>
                        <p className="text-[10px]" style={{ color: MUTED }}>{new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-mono font-bold" style={{ color: "#10B981" }}>
                        +GH₵ {(p.amount / 100).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {invoices.length === 0 && (
            <div className="text-center py-10 text-sm" style={{ color: MUTED }}>
              No fee records found.
            </div>
          )}
        </>
      )}
    </div>
  );
}
