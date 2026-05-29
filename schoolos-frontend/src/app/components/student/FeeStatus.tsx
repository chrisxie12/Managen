import { Wallet, Loader2 } from "lucide-react";
import type { Invoice } from "./types";

const MUTED = "#6B7280";

export function FeeStatus({ invoices, loading }: { invoices: Invoice[]; loading: boolean }) {
  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  const totalDue = invoices.reduce((s, i) => s + Number(i.total_amount || 0), 0);
  const totalPaid = invoices.reduce((s, i) => s + Number(i.paid_amount || 0), 0);
  const balance = totalDue - totalPaid;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-3 rounded-xl" style={{ background: "#EEF2FF" }}>
          <p className="text-lg font-bold" style={{ color: "#3730A3" }}>{(totalDue).toLocaleString()}</p>
          <p className="text-xs" style={{ color: "#3730A3" }}>Total Due</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: "#D1FAE5" }}>
          <p className="text-lg font-bold" style={{ color: "#065F46" }}>{(totalPaid).toLocaleString()}</p>
          <p className="text-xs" style={{ color: "#065F46" }}>Paid</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: balance > 0 ? "#FEF2F2" : "#D1FAE5" }}>
          <p className="text-lg font-bold" style={{ color: balance > 0 ? "#991B1B" : "#065F46" }}>{(balance).toLocaleString()}</p>
          <p className="text-xs" style={{ color: balance > 0 ? "#991B1B" : "#065F46" }}>Balance</p>
        </div>
      </div>

      {invoices.length === 0 && (
        <div className="text-center py-4" style={{ color: MUTED }}>
          <Wallet size={24} className="mx-auto mb-2" />
          <p className="text-sm">No fee records.</p>
        </div>
      )}
    </div>
  );
}
