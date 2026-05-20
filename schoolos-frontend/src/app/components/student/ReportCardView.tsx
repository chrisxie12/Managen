import { FileSpreadsheet, Loader2 } from "lucide-react";
import type { ReportCard } from "./types";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

export function ReportCardView({ cards, loading }: { cards: ReportCard[]; loading: boolean }) {
  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-6" style={{ color: MUTED }}>
        <FileSpreadsheet size={28} className="mx-auto mb-2" />
        <p className="text-sm">No report cards published yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map(c => {
        const gradeColor = c.average >= 80 ? "#10B981" : c.average >= 60 ? "#6366F1" : c.average >= 40 ? "#F59E0B" : "#EF4444";
        return (
          <div key={c.id} className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-sm" style={{ color: NAVY }}>
                {c.term?.name || "Term"} {c.session?.name ? `(${c.session.name})` : ""}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{
                background: c.status === "published" ? "#D1FAE5" : "#FEF3C7",
                color: c.status === "published" ? "#065F46" : "#92400E",
              }}>
                {c.status}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold" style={{ color: gradeColor }}>{c.average?.toFixed(1)}%</p>
                <p className="text-xs" style={{ color: MUTED }}>Average</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: NAVY }}>{c.grade || "—"}</p>
                <p className="text-xs" style={{ color: MUTED }}>Grade</p>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: NAVY }}>#{c.rank || "—"}</p>
                <p className="text-xs" style={{ color: MUTED }}>Rank</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
