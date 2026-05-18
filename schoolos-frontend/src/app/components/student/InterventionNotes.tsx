import { Loader2, CheckCircle2 } from "lucide-react";
import type { Intervention } from "./types";

const PLUM = "#381932";
const MUTED = "#7D6077";

const SEVERITY_COLORS: Record<string, { bg: string; color: string }> = {
  low: { bg: "#EEF2FF", color: "#3730A3" },
  medium: { bg: "#FEF3C7", color: "#92400E" },
  high: { bg: "#FEF2F2", color: "#991B1B" },
  critical: { bg: "#FEF2F2", color: "#DC2626" },
};

const TYPE_LABELS: Record<string, string> = {
  attendance: "Attendance",
  performance: "Academic Performance",
  behavior: "Behavior",
};

export function InterventionNotes({ interventions, loading }: { interventions: Intervention[]; loading: boolean }) {
  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  if (interventions.length === 0) {
    return (
      <div className="text-center py-6" style={{ color: MUTED }}>
        <CheckCircle2 size={28} className="mx-auto mb-2" />
        <p className="text-sm">No support notes or alerts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {interventions.map(i => {
        const sev = SEVERITY_COLORS[i.severity] || SEVERITY_COLORS.low;
        return (
          <div key={i.id} className="p-3 rounded-xl text-sm" style={{ background: sev.bg, border: `1px solid ${sev.color}30` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium" style={{ color: PLUM }}>{TYPE_LABELS[i.type] || i.type}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: sev.color, color: "white" }}>{i.severity}</span>
            </div>
            {i.notes && <p className="text-xs mt-1" style={{ color: sev.color }}>{i.notes}</p>}
            <p className="text-xs mt-1" style={{ color: MUTED }}>
              {new Date(i.created_at).toLocaleDateString()}
              {i.assigned?.full_name ? ` · ${i.assigned.full_name}` : ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}
