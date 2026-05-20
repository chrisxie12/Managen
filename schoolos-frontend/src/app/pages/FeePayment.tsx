import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router";
import {
  Wallet, Loader2, CreditCard, Smartphone,
  CheckCircle2, Receipt, Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

type Invoice = {
  id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: string;
  total_amount: number;
  paid_amount: number;
  student?: { name: string; admission_no?: string; class_name?: string };
  term?: { name: string };
};

type Child = {
  id: string;
  name: string;
  class_name?: string;
  admission_no?: string;
};

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    paid: { bg: "#D1FAE5", color: "#065F46", label: "Paid" },
    issued: { bg: "#FEF3C7", color: "#92400E", label: "Pending" },
    overdue: { bg: "#FEE2E2", color: "#DC2626", label: "Overdue" },
    draft: { bg: "#F3F4F6", color: "#6B7280", label: "Draft" },
    cancelled: { bg: "#F3F4F6", color: "#6B7280", label: "Cancelled" },
  };
  const c = config[status] || { bg: "#F3F4F6", color: "#6B7280", label: status };
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function PaymentMethodSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-3">
      {[
        { id: "card", label: "Card", icon: CreditCard },
        { id: "mobile_money", label: "Mobile Money", icon: Smartphone },
      ].map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className="flex-1 p-3 rounded-xl flex flex-col items-center gap-2 text-sm transition-all duration-200"
          style={{
            background: value === m.id ? NAVY : "white",
            color: value === m.id ? "white" : NAVY,
            border: value === m.id ? `2px solid ${NAVY}` : "2px solid rgba(56,25,50,0.1)",
          }}
        >
          <m.icon size={20} />
          {m.label}
        </button>
      ))}
    </div>
  );
}

function InvoiceRow({
  invoice,
  onPay,
  paying,
}: {
  invoice: Invoice;
  onPay: () => void;
  paying: boolean;
}) {
  const isOverdue = invoice.status === "issued" && new Date(invoice.due_date) < new Date();
  const displayStatus = isOverdue ? "overdue" : invoice.status;
  const canPay = invoice.status === "issued";

  return (
    <div
      className="p-4 rounded-xl flex items-center gap-4"
      style={{
        background: "white",
        border: "1px solid rgba(56,25,50,0.07)",
      }}
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(56,25,50,0.05)" }}>
        <Receipt size={18} style={{ color: NAVY }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm" style={{ color: NAVY }}>{invoice.invoice_number}</p>
        <p className="text-xs" style={{ color: MUTED }}>
          Due: {new Date(invoice.due_date).toLocaleDateString()}
          {invoice.term && ` · ${invoice.term.name}`}
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold" style={{ color: NAVY }}>GH₵{invoice.total_amount.toLocaleString()}</p>
        {invoice.paid_amount > 0 && (
          <p className="text-xs" style={{ color: MUTED }}>
            Paid: GH₵{invoice.paid_amount.toLocaleString()}
          </p>
        )}
      </div>
      <StatusBadge status={displayStatus} />
      {canPay && (
        <button
          onClick={onPay}
          disabled={paying}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50"
          style={{ background: NAVY }}
        >
          {paying ? <Loader2 size={14} className="animate-spin" /> : "Pay Now"}
        </button>
      )}
    </div>
  );
}

function CheckoutModal({
  invoice,
  email,
  onClose,
}: {
  invoice: Invoice;
  email: string;
  onClose: () => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paying, setPaying] = useState(false);

  const handlePay = useCallback(async () => {
    setPaying(true);
    try {
      const callbackUrl = `${window.location.origin}/payment/verify?invoice_id=${invoice.id}`;

      const res = await api.post<{
        success: boolean;
        data: { authorization_url: string; reference: string; invoice_id: string };
      }>("/api/billing/paystack-initialize", {
        invoice_id: invoice.id,
        amount: invoice.total_amount - invoice.paid_amount,
        email,
        callback_url: callbackUrl,
      });

      if (res.data?.data?.authorization_url) {
        // Redirect to Paystack payment page
        window.location.href = res.data.data.authorization_url;
      } else {
        toast.error("Failed to get payment link from Paystack.");
        setPaying(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to initiate payment.");
      setPaying(false);
    }
  }, [invoice, email]);

  const remaining = invoice.total_amount - invoice.paid_amount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md mx-4 rounded-2xl p-6 shadow-xl"
        style={{ background: "#F8F9FA" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: NAVY }}>Checkout</h2>
          <button onClick={onClose} className="text-lg" style={{ color: MUTED }}>✕</button>
        </div>

        <div className="p-4 rounded-xl mb-4" style={{ background: "white" }}>
          <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Invoice</p>
          <p className="font-medium" style={{ color: NAVY }}>{invoice.invoice_number}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm" style={{ color: MUTED }}>Amount Due</span>
            <span className="text-2xl font-bold" style={{ color: NAVY }}>GH₵{remaining.toLocaleString()}</span>
          </div>
        </div>

        <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: MUTED }}>
          Payment Method
        </label>
        <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

        {paymentMethod === "mobile_money" && (
          <p className="mt-2 text-xs" style={{ color: MUTED }}>
            You'll be prompted to enter your mobile number on Paystack's page.
          </p>
        )}

        <button
          onClick={handlePay}
          disabled={paying}
          className="w-full mt-4 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ background: NAVY }}
        >
          {paying ? (
            <><Loader2 size={14} className="animate-spin" /> Processing...</>
          ) : (
            <><Banknote size={16} /> Pay GH₵{remaining.toLocaleString()}</>
          )}
        </button>

        <p className="mt-3 text-xs text-center" style={{ color: MUTED }}>
          Secured by <strong>Paystack</strong>. Your payment info is encrypted.
        </p>
      </div>
    </div>
  );
}

export function FeePayment() {
  const { user } = useAuth();
  const location = useLocation();
  const [children, setChildren] = useState<Child[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");
  const [checkoutInvoice, setCheckoutInvoice] = useState<Invoice | null>(null);
  const [filterTab, setFilterTab] = useState<"pending" | "paid">(
    (location.state as { filter?: string } | null)?.filter === 'overdue' ? 'pending' : 'pending'
  );

  const isParent = user?.role === "parent";
  const isStudent = user?.role === "student";

  useEffect(() => {
    if (isParent) loadChildren();
    else if (isStudent) loadInvoices(user!.id);
  }, [user]);

  const loadChildren = useCallback(async () => {
    try {
      const res = await api.get<{ data: { children: Child[] } }>("/api/school/parent/children");
      const kids = res.data?.data?.children || [];
      setChildren(kids);
      if (kids.length > 0) {
        setActiveTab(kids[0].id);
        loadInvoices(kids[0].id);
      }
    } catch {
      toast.error("Failed to load children");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInvoices = useCallback(async (studentId: string) => {
    setLoading(true);
    try {
      const res = await api.get<{ data: { invoices: Invoice[] } }>(
        `/api/school/invoices?student_id=${studentId}`
      );
      setInvoices(res.data?.data?.invoices || []);
    } catch {
      toast.error("Failed to load invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTabChange = (childId: string) => {
    setActiveTab(childId);
    loadInvoices(childId);
  };

  const handlePay = (invoice: Invoice) => {
    setCheckoutInvoice(invoice);
  };

  const pendingInvoices = invoices.filter(
    (inv) => inv.status === "issued" && new Date(inv.due_date) >= new Date()
  );
  const overdueInvoices = invoices.filter(
    (inv) => inv.status === "issued" && new Date(inv.due_date) < new Date()
  );
  const paidInvoices = invoices.filter((inv) => inv.status === "paid");

  const displayInvoices = filterTab === "pending"
    ? [...overdueInvoices, ...pendingInvoices]
    : paidInvoices;

  if (!isParent && !isStudent) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: MUTED }}>You do not have access to this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(56,25,50,0.08)" }}>
          <Wallet size={20} style={{ color: NAVY }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Fee Payment</h1>
          <p className="text-sm" style={{ color: MUTED }}>
            {isParent ? "View and pay fees for your children" : "View and pay your fees"}
          </p>
        </div>
      </div>

      {isParent && children.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => handleTabChange(child.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                background: activeTab === child.id ? NAVY : "white",
                color: activeTab === child.id ? "white" : NAVY,
                border: activeTab === child.id ? "none" : "1px solid rgba(56,25,50,0.12)",
              }}
            >
              {child.name}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {(["pending", "paid"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{
              background: filterTab === tab ? NAVY : "transparent",
              color: filterTab === tab ? "white" : MUTED,
            }}
          >
            {tab === "pending" ? "Outstanding" : "Paid"}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: MUTED }} />
        </div>
      )}

      {!loading && displayInvoices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <CheckCircle2 size={32} style={{ color: "#059669" }} />
          <p className="font-medium" style={{ color: NAVY }}>
            {filterTab === "pending" ? "No outstanding fees" : "No paid invoices yet"}
          </p>
          <p className="text-sm" style={{ color: MUTED }}>
            {filterTab === "pending" ? "All fees are cleared!" : "Paid invoices will appear here"}
          </p>
        </div>
      )}

      {!loading && displayInvoices.length > 0 && (
        <div className="space-y-3">
          {displayInvoices.map((inv) => (
            <InvoiceRow
              key={inv.id}
              invoice={inv}
              onPay={() => handlePay(inv)}
              paying={false}
            />
          ))}
        </div>
      )}

      {checkoutInvoice && (
        <CheckoutModal
          invoice={checkoutInvoice}
          email={user?.email || ""}
          onClose={() => setCheckoutInvoice(null)}
        />
      )}
    </div>
  );
}
