import { CreditCard, TrendingUp, AlertCircle } from "lucide-react";

const CARD_BG = "#0f0f1a";
const BORDER = "rgba(255,255,255,0.07)";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";

export function SuperAdminBilling() {

  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: TEXT }}>Billing</h1>
        <p style={{ color: MUTED, fontSize: "0.85rem" }}>Platform subscription and payment overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "MRR", value: "GHS 0", sub: "Monthly recurring revenue", icon: TrendingUp, color: "#10B981" },
          { label: "Active Subscriptions", value: "0", sub: "Paid schools", icon: CreditCard, color: "#6366F1" },
          { label: "Failed Payments", value: "0", sub: "This month", icon: AlertCircle, color: "#EF4444" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${card.color}15` }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: TEXT, fontSize: "1.3rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{card.value}</div>
            <div style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.3rem" }}>{card.label}</div>
            <div style={{ color: MUTED, fontSize: "0.72rem" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[24px]" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.95rem", color: TEXT }}>Recent Payments</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CreditCard size={36} color={MUTED} />
          <p style={{ color: MUTED, fontSize: "0.9rem", marginTop: "0.75rem" }}>No payments yet</p>
          <p style={{ color: "#475569", fontSize: "0.78rem", marginTop: "0.25rem" }}>Payments from schools will appear here once subscriptions start</p>
        </div>
      </div>
    </div>
  );
}
