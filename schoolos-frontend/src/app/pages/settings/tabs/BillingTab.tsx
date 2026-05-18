import { useState, useEffect } from "react";
import { CreditCard, Loader2, Check, X, Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../services/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  growth: "Growth",
  enterprise: "Enterprise",
};

const PLAN_PRICES: Record<string, string> = {
  starter: "$29/mo",
  growth: "$79/mo",
  enterprise: "Custom",
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  active: { label: "Active", bg: "rgba(16,185,129,0.1)", color: "#10B981" },
  trial: { label: "Trial", bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
  expired: { label: "Expired", bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
};

const FEATURES: { name: string; starter: string; growth: string; enterprise: string }[] = [
  { name: "Students", starter: "100", growth: "500", enterprise: "Unlimited" },
  { name: "SMS Notifications", starter: "✗", growth: "✓", enterprise: "✓" },
  { name: "AI Insights", starter: "✗", growth: "✓", enterprise: "✓" },
  { name: "Custom Branding", starter: "✗", growth: "✓", enterprise: "✓" },
  { name: "Priority Support", starter: "✗", growth: "✗", enterprise: "✓" },
];

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: PLUM }}>{title}</h3>
      {desc && <p className="text-xs mb-4" style={{ color: MUTED }}>{desc}</p>}
      {children}
    </div>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric", month: "long", day: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

type BillingEntry = {
  date: string;
  description: string;
  amount: number;
  status: "paid" | "unpaid";
  receipt_url?: string | null;
};

type BillingData = {
  history?: BillingEntry[];
  payment_method?: Record<string, any> | null;
};

type Props = { profile: Record<string, any>; role: string };

export function BillingTab({ profile, role }: Props) {
  const isReadOnly = role !== "school_admin";
  const planKey = (profile.billing_plan || profile.plan || "starter").toLowerCase();
  const planName = PLAN_NAMES[planKey] || "Starter";
  const planPrice = PLAN_PRICES[planKey] || "$29/mo";
  const statusKey = (profile.billing_status || "active").toLowerCase();
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.active;
  const renewalDate = formatDate(profile.billing_renewal_date);

  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    const fetchBilling = async () => {
      setLoadingBilling(true);
      try {
        const res = await api.get<any>("/api/school/settings/billing");
        if (res.data) setBillingData(res.data.data || res.data);
      } catch {
        // silent
      } finally {
        setLoadingBilling(false);
      }
    };
    fetchBilling();
  }, []);

  const history: BillingEntry[] = billingData?.history || [];

  const handleDownloadAll = async () => {
    setDownloadingAll(true);
    try {
      const csv = [["Date", "Description", "Amount", "Status"].join(",")];
      history.forEach((entry) => {
        csv.push([entry.date, entry.description, entry.amount.toFixed(2), entry.status].join(","));
      });
      const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "billing-history.csv";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded billing history");
    } catch {
      toast.error("Failed to download");
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <div>
      {/* CURRENT PLAN */}
      <SectionCard title="Current Plan" desc="Your subscription plan and billing status">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="rounded-xl p-3" style={{ background: "rgba(56,25,50,0.06)" }}>
              <CreditCard size={22} color={PLUM} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold" style={{ color: PLUM }}>{planName}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: statusCfg.bg, color: statusCfg.color }}>
                  {statusCfg.label}
                </span>
              </div>
              <p className="text-xs" style={{ color: MUTED }}>
                {planPrice}{renewalDate !== "—" ? ` · Renews ${renewalDate}` : ""}
              </p>
            </div>
          </div>
          {!isReadOnly && (
            <button onClick={() => setShowUpgradeModal(true)}
              className="self-start sm:self-auto px-5 py-2 rounded-xl text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: PLUM }}>
              {planKey === "enterprise" ? "Contact Sales" : "Upgrade Plan"}
            </button>
          )}
        </div>
      </SectionCard>

      {/* PLAN FEATURES COMPARISON */}
      <SectionCard title="Plan Features Comparison" desc="See what's included in each plan">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="text-left" style={{ color: MUTED }}>
                <th className="pb-2.5 pr-4 font-medium">Feature</th>
                <th className="pb-2.5 pr-4 font-medium">Starter</th>
                <th className="pb-2.5 pr-4 font-medium">Growth</th>
                <th className="pb-2.5 pr-4 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feat) => {
                return (
                  <tr key={feat.name} className="border-t" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                    <td className="py-2.5 pr-4 font-medium" style={{ color: PLUM }}>{feat.name}</td>
                    {(["starter", "growth", "enterprise"] as const).map((p) => {
                      const isActivePlan = planKey === p;
                      return (
                        <td key={p} className={`py-2.5 pr-4 ${isActivePlan ? "rounded-lg" : ""}`}
                          style={{
                            color: isActivePlan ? PLUM : MUTED,
                            background: isActivePlan ? "rgba(56,25,50,0.04)" : "transparent",
                            fontWeight: isActivePlan ? 600 : 400,
                          }}>
                          {feat[p]}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* PAYMENT HISTORY */}
      <SectionCard title="Payment History" desc="Past invoices and payments">
        {loadingBilling ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={18} className="animate-spin" style={{ color: PLUM }} />
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs py-4 text-center" style={{ color: MUTED }}>No payment history yet.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="text-left" style={{ color: MUTED }}>
                    <th className="pb-2.5 pr-4 font-medium">Date</th>
                    <th className="pb-2.5 pr-4 font-medium">Description</th>
                    <th className="pb-2.5 pr-4 font-medium">Amount</th>
                    <th className="pb-2.5 pr-4 font-medium">Status</th>
                    <th className="pb-2.5 font-medium">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry, idx) => (
                    <tr key={idx} className="border-t" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                      <td className="py-2.5 pr-4 whitespace-nowrap" style={{ color: PLUM }}>
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-2.5 pr-4" style={{ color: PLUM }}>{entry.description}</td>
                      <td className="py-2.5 pr-4 whitespace-nowrap" style={{ color: PLUM }}>
                        ${(entry.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            background: entry.status === "paid" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            color: entry.status === "paid" ? "#10B981" : "#EF4444",
                          }}>
                          {entry.status === "paid" ? <Check size={10} /> : <X size={10} />}
                          {entry.status === "paid" ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {entry.receipt_url ? (
                          <a href={entry.receipt_url} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                            style={{ color: PLUM }}>
                            <Download size={12} />
                            Receipt
                          </a>
                        ) : (
                          <span style={{ color: MUTED }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {history.length > 0 && !isReadOnly && (
              <div className="flex justify-end mt-3">
                <Button onClick={handleDownloadAll} disabled={downloadingAll}
                  className="text-xs rounded-xl h-9 px-4" style={{ background: PLUM_LIGHT }}>
                  {downloadingAll ? <Loader2 size={14} className="animate-spin mr-1" /> : <Download size={14} className="mr-1" />}
                  Download All (CSV)
                </Button>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* PAYMENT METHOD */}
      <SectionCard title="Payment Method" desc="How you pay for your subscription">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-3" style={{ background: "rgba(56,25,50,0.06)" }}>
              <CreditCard size={20} color={MUTED} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: PLUM }}>
                {billingData?.payment_method ? "Card on file" : "No payment method on file"}
              </p>
              {billingData?.payment_method && (
                <p className="text-xs" style={{ color: MUTED }}>
                  {billingData.payment_method.brand || "Card"} ····{billingData.payment_method.last4}
                </p>
              )}
            </div>
          </div>
          {!isReadOnly && (
            <div className="flex gap-2">
              {billingData?.payment_method && (
                <button onClick={() => toast.success("Payment method removed (demo)")}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-90"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                  Remove
                </button>
              )}
              <button onClick={() => setShowPaymentModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-90"
                style={{ background: PLUM_LIGHT, color: "white" }}>
                {billingData?.payment_method ? "Update" : "Add Payment Method"}
              </button>
            </div>
          )}
        </div>
      </SectionCard>

      {/* UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpgradeModal(false); }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-sm font-semibold mb-2" style={{ color: PLUM }}>Upgrade Plan</h3>
            <p className="text-xs mb-4" style={{ color: MUTED }}>
              Compare plans and contact our sales team to upgrade.
            </p>
            <div className="space-y-3 mb-4">
              {(["starter", "growth", "enterprise"] as const).map((p) => (
                <div key={p}
                  className={`flex items-center justify-between p-3 rounded-xl ${planKey === p ? "ring-2" : ""}`}
                  style={{
                    background: planKey === p ? "rgba(56,25,50,0.04)" : "white",
                    border: "1px solid rgba(56,25,50,0.1)",
                    ringColor: planKey === p ? PLUM : "transparent",
                  }}>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: PLUM }}>{PLAN_NAMES[p]}</span>
                    <p className="text-xs" style={{ color: MUTED }}>{PLAN_PRICES[p]}</p>
                  </div>
                  {planKey === p && <Check size={16} color="#16A34A" />}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium"
                style={{ background: "rgba(56,25,50,0.06)", color: PLUM }}>
                Cancel
              </button>
              <a href="mailto:support@getschoolos.me?subject=Plan%20Upgrade%20Request"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white"
                style={{ background: PLUM }}>
                <Mail size={14} /> Contact Sales
              </a>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setShowPaymentModal(false); }}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-sm font-semibold mb-2" style={{ color: PLUM }}>
              {billingData?.payment_method ? "Update Payment Method" : "Add Payment Method"}
            </h3>
            <p className="text-xs mb-4" style={{ color: MUTED }}>
              Payment processing is handled securely. Contact support to update payment details.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>Card Number</label>
                <Input placeholder="4242 4242 4242 4242" disabled
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>Expiry</label>
                  <Input placeholder="MM/YY" disabled
                    className="h-9 text-sm rounded-xl"
                    style={{ borderColor: "rgba(56,25,50,0.12)" }} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>CVC</label>
                  <Input placeholder="123" disabled
                    className="h-9 text-sm rounded-xl"
                    style={{ borderColor: "rgba(56,25,50,0.12)" }} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium"
                style={{ background: "rgba(56,25,50,0.06)", color: PLUM }}>
                Cancel
              </button>
              <a href="mailto:support@getschoolos.me?subject=Payment%20Method%20Update"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white"
                style={{ background: PLUM }}>
                <Mail size={14} /> Contact Support
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
