import { Wallet, Plus } from "lucide-react";
import { useNavigate } from "react-router";

const PLUM = "#381932";
const MUTED = "#7D6077";

export function Finance() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: PLUM }}>Finance</h1>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>Manage fees, payments, and payroll</p>
        </div>
        <button className="px-4 py-2 rounded-full text-sm flex items-center gap-2" style={{ background: PLUM, color: "#FFF3E6" }}>
          <Plus size={15} /> Record Payment
        </button>
      </div>

      <div className="flex items-center justify-center min-h-[400px] rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="text-center p-8">
          <Wallet size={48} color={MUTED} className="mx-auto mb-4" />
          <p style={{ color: PLUM, fontSize: "1.1rem", fontWeight: 600, marginBottom: "0.3rem" }}>No Financial Records Yet</p>
          <p style={{ color: MUTED, fontSize: "0.85rem", marginBottom: "1.5rem" }}>Fees, payments, and payroll will appear once you start recording them.</p>
          <button onClick={() => navigate("/dashboard/finance")} className="px-6 py-2.5 rounded-full text-sm" style={{ background: PLUM, color: "#FFF3E6" }}>
            <Plus size={15} className="inline mr-1" /> Record Payment
          </button>
        </div>
      </div>
    </div>
  );
}
