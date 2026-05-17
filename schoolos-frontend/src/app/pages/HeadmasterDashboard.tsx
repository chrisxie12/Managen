import { BarChart3, Clock } from "lucide-react";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

export function HeadmasterDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "0" },
          { label: "Avg Performance", value: "—" },
          { label: "Pending Approvals", value: "0" },
          { label: "Staff Count", value: "0" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{card.value}</div>
            <div style={{ color: MUTED, fontSize: "0.75rem" }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center min-h-[300px] rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="text-center p-8">
          <BarChart3 size={40} color={MUTED} className="mx-auto mb-4" />
          <p style={{ color: PLUM, fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>Academic Performance</p>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>Performance data will appear here once academic records are created.</p>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[200px] rounded-[24px]" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
        <div className="text-center p-8">
          <Clock size={32} color="rgba(255,243,230,0.6)" className="mx-auto mb-3" />
          <p style={{ color: "#FFF3E6", fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>Pending Approvals</p>
          <p style={{ color: "rgba(255,243,230,0.6)", fontSize: "0.85rem" }}>Approvals from teachers will be listed here.</p>
        </div>
      </div>
    </div>
  );
}
