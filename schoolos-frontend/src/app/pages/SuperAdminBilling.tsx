import { CreditCard, TrendingUp, Download, CheckCircle, AlertCircle } from "lucide-react";

const payments = [
  { id: "PAY-001", school: "Accra Ridge School", amount: 199, plan: "Premium", date: "Mar 28, 2026", status: "success" },
  { id: "PAY-002", school: "Green Valley School", amount: 99, plan: "Standard", date: "Mar 25, 2026", status: "success" },
  { id: "PAY-003", school: "St. Mary's Academy", amount: 49, plan: "Basic", date: "Mar 22, 2026", status: "success" },
  { id: "PAY-004", school: "Grace International", amount: 199, plan: "Premium", date: "Mar 20, 2026", status: "failed" },
  { id: "PAY-005", school: "Heritage School", amount: 99, plan: "Standard", date: "Mar 18, 2026", status: "success" },
];

export function SuperAdminBilling() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "MRR", value: "GHS 12,450", sub: "+8% this month", icon: TrendingUp, color: "#10B981" },
          { label: "Active Subscriptions", value: "124", sub: "85 paid, 39 trial", icon: CreditCard, color: "#6366F1" },
          { label: "Failed Payments", value: "3", sub: "This month", icon: AlertCircle, color: "#EF4444" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-[24px]" style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${card.color}15` }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0", fontSize: "1.3rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{card.value}</div>
            <div style={{ color: "#64748b", fontSize: "0.75rem", marginBottom: "0.3rem" }}>{card.label}</div>
            <div style={{ color: "#64748b", fontSize: "0.72rem" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[24px]" style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 style={{ fontWeight: 600, fontSize: "0.95rem" }}>Recent Payments</h3>
          <button className="flex items-center gap-1 text-xs" style={{ color: "#64748b" }}>
            <Download size={12} /> Export
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["School", "Plan", "Amount", "Date", "Status"].map((h) => (
                <th key={h} className="text-left px-5 py-3" style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <td className="px-5 py-4" style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>{p.school}</td>
                <td className="px-5 py-4" style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{p.plan}</td>
                <td className="px-5 py-4" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e2e8f0", fontSize: "0.85rem", fontWeight: 600 }}>GHS {p.amount}</td>
                <td className="px-5 py-4" style={{ color: "#64748b", fontSize: "0.78rem" }}>{p.date}</td>
                <td className="px-5 py-4">
                  {p.status === "success" ? (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#10B981" }}><CheckCircle size={12} /> Paid</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#EF4444" }}><AlertCircle size={12} /> Failed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
