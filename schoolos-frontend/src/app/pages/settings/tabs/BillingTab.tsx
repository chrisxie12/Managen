import { useState, useEffect } from "react";
import { CreditCard, Loader2, Check, X, Download } from "lucide-react";
import { api } from "../../../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: PLUM }}>{title}</h3>
      {desc && <p className="text-xs mb-4" style={{ color: MUTED }}>{desc}</p>}
      {children}
    </div>
  );
}

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

type Props = { profile: Record<string, any> };

export function BillingTab({ profile }: Props) {
  const planKey = (profile.billing_plan || profile.plan || "starter").toLowerCase();
  const planName = PLAN_NAMES[planKey] || "Starter";
  const planPrice = PLAN_PRICES[planKey] || "$29/mo";
  const statusKey = (profile.billing_status || "active").toLowerCase();
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.active;
  const renewalDate = formatDate(profile.billing_renewal_date);

  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [loadingBilling, setLoadingBilling] = useState(true);

  useEffect(() => {
    const fetchBilling = async () => {
      setLoadingBilling(true);
      try {
        const res = await api.get<any>("/school/settings/billing");
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

  const handleUpgrade = () => {
    const modal = document.createElement("div");
    modal.style.cssText =
      "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4)";
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    const box = document.createElement("div");
    box.style.cssText =
      "background:white;border-radius:16px;padding:24px;max-width:400px;width:90%;margin:16px;box-shadow:0 20px 60px rgba(0,0,0,0.15)";

    const header = document.createElement("h3");
    header.style.cssText = `font-size:14px;font-weight:600;margin-bottom:8px;color:${PLUM}`;
    header.textContent = "Upgrade Plan";

    const msg = document.createElement("p");
    msg.style.cssText = `font-size:12px;margin-bottom:16px;color:${MUTED};line-height:1.5`;
    msg.textContent = "Contact support to upgrade your plan.";

    const link = document.createElement("a");
    link.href = "mailto:support@getschoolos.me?subject=Plan%20Upgrade%20Request";
    link.style.cssText =
      `display:inline-flex;align-items:center;gap:6px;padding:8px 20px;border-radius:12px;font-size:12px;font-weight:500;color:white;text-decoration:none;background:${PLUM}`;
    link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Contact Support`;
    link.target = "_blank";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Cancel";
    closeBtn.style.cssText =
      `padding:8px 20px;border-radius:12px;font-size:12px;font-weight:500;border:none;cursor:pointer;margin-left:8px;background:rgba(56,25,50,0.06);color:${PLUM}`;
    closeBtn.onclick = () => modal.remove();

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;justify-content:flex-end";
    actions.appendChild(link);
    actions.appendChild(closeBtn);

    box.appendChild(header);
    box.appendChild(msg);
    box.appendChild(actions);
    modal.appendChild(box);
    document.body.appendChild(modal);
  };

  const handleUpdatePayment = () => {
    const modal = document.createElement("div");
    modal.style.cssText =
      "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.4)";
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    const box = document.createElement("div");
    box.style.cssText =
      "background:white;border-radius:16px;padding:24px;max-width:400px;width:90%;margin:16px;box-shadow:0 20px 60px rgba(0,0,0,0.15)";

    const header = document.createElement("h3");
    header.style.cssText = `font-size:14px;font-weight:600;margin-bottom:8px;color:${PLUM}`;
    header.textContent = "Update Payment Method";

    const msg = document.createElement("p");
    msg.style.cssText = `font-size:12px;margin-bottom:16px;color:${MUTED};line-height:1.5`;
    msg.textContent = "Contact support to update your payment method.";

    const link = document.createElement("a");
    link.href = "mailto:support@getschoolos.me?subject=Payment%20Method%20Update";
    link.style.cssText =
      `display:inline-flex;align-items:center;gap:6px;padding:8px 20px;border-radius:12px;font-size:12px;font-weight:500;color:white;text-decoration:none;background:${PLUM}`;
    link.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Contact Support`;
    link.target = "_blank";

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Cancel";
    closeBtn.style.cssText =
      `padding:8px 20px;border-radius:12px;font-size:12px;font-weight:500;border:none;cursor:pointer;margin-left:8px;background:rgba(56,25,50,0.06);color:${PLUM}`;
    closeBtn.onclick = () => modal.remove();

    const actions = document.createElement("div");
    actions.style.cssText = "display:flex;justify-content:flex-end";
    actions.appendChild(link);
    actions.appendChild(closeBtn);

    box.appendChild(header);
    box.appendChild(msg);
    box.appendChild(actions);
    modal.appendChild(box);
    document.body.appendChild(modal);
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
          <button onClick={handleUpgrade}
            className="self-start sm:self-auto px-5 py-2 rounded-xl text-xs font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: PLUM }}>
            {planKey === "enterprise" ? "Contact Sales" : "Upgrade Plan"}
          </button>
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
                  {billingData.payment_method.brand} ····{billingData.payment_method.last4}
                </p>
              )}
            </div>
          </div>
          <button onClick={handleUpdatePayment}
            className="px-4 py-2 rounded-xl text-xs font-medium transition-opacity hover:opacity-90"
            style={{ background: PLUM_LIGHT, color: "white" }}>
            Update Payment Method
          </button>
        </div>
      </SectionCard>
    </div>
  );
}
