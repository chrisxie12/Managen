import { useMemo } from "react";
import { Calendar, Loader2 } from "lucide-react";
import type { TimetableEntry } from "./types";

const PLUM = "#381932";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function TimetableWidget({ entries, loading }: { entries: TimetableEntry[]; loading: boolean }) {
  const periods = useMemo(() => {
    const set = new Set<number>();
    entries.forEach(e => set.add(e.period));
    return Array.from(set).sort((a, b) => a - b);
  }, [entries]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-6" style={{ color: MUTED }}>
        <Calendar size={28} className="mx-auto mb-2" />
        <p className="text-sm">No timetable available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(56,25,50,0.07)" }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: MILK }}>
            <th className="px-2 py-2 text-left text-xs font-medium" style={{ color: MUTED }}>Per</th>
            {DAYS.map(d => <th key={d} className="px-2 py-2 text-center text-xs font-medium" style={{ color: MUTED }}>{d.slice(0, 3)}</th>)}
          </tr>
        </thead>
        <tbody>
          {periods.map(period => (
            <tr key={period} style={{ borderTop: "1px solid rgba(56,25,50,0.05)" }}>
              <td className="px-2 py-1.5 text-xs font-medium" style={{ color: MUTED }}>{period}</td>
              {DAYS.map(day => {
                const entry = entries.find(e => e.day === day && e.period === period);
                return (
                  <td key={day} className="px-1 py-1.5 text-center">
                    {entry ? (
                      <span className="text-xs font-medium" style={{ color: PLUM }}>{entry.subject}</span>
                    ) : (
                      <span style={{ color: MUTED }}>—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
