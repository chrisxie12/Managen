import { Receipt } from "lucide-react";

const PLUM = "#381932";
const MUTED = "#7D6077";

export function AccountantDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", value: "GHS 0" },
          { label: "Outstanding", value: "GHS 0" },
          { label: "Overdue Accounts", value: "0" },
          { label: "Invoices This Month", value: "0" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "clamp(1rem, 2vw, 1.4rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{card.value}</div>
            <div style={{ color: MUTED, fontSize: "0.75rem" }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center min-h-[300px] rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="text-center p-8">
          <Receipt size={40} color={MUTED} className="mx-auto mb-4" />
          <p style={{ color: PLUM, fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>No Financial Data Yet</p>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>Revenue, invoices, and transaction history will appear once fees are set up and payments are recorded.</p>
        </div>
      </div>
    </div>
  );
}
