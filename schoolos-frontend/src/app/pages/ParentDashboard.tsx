import { GraduationCap } from "lucide-react";

const PLUM = "#381932";
const MUTED = "#7D6077";

export function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center min-h-[300px] rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="text-center p-8">
          <GraduationCap size={40} color={MUTED} className="mx-auto mb-4" />
          <p style={{ color: PLUM, fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>No Children Linked Yet</p>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>Your child's attendance, grades, and fee status will appear here once your account is linked by the school.</p>
        </div>
      </div>
    </div>
  );
}
