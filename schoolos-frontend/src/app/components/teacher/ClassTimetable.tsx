import { useEffect, useState, useMemo } from "react";
import { Loader2, Calendar } from "lucide-react";
import { api } from "../../services/api";
import type { TimetableEntry } from "./types";

const NAVY = "#031B4E";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function ClassTimetable({ className }: { className: string }) {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!className) return;
    setLoading(true);
    api.get<{ timetable: TimetableEntry[] }>("/api/school/timetable")
      .then(res => {
        const all = res.data?.timetable || [];
        setEntries(all.filter(e => e.class_name?.toLowerCase() === className.toLowerCase()));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [className]);

  const periods = useMemo(() => {
    const set = new Set<number>();
    entries.forEach(e => set.add(e.period));
    return Array.from(set).sort((a, b) => a - b);
  }, [entries]);

  const getEntry = (day: string, period: number) =>
    entries.find(e => e.day?.toLowerCase() === day.toLowerCase() && e.period === period);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: MUTED }}>
        <Calendar size={36} className="mx-auto mb-3" color={MUTED} />
        <p className="font-semibold" style={{ color: NAVY }}>No Timetable</p>
        <p className="text-sm mt-1">No timetable entries for {className}.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
              <th className="px-4 py-3 font-medium">Period</th>
              {DAYS.map(day => (
                <th key={day} className="px-4 py-3 font-medium">{day.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period} className="text-sm" style={{ borderBottom: "1px solid rgba(10,36,114,0.05)" }}>
                <td className="px-4 py-3 font-medium" style={{ color: NAVY }}>Period {period}</td>
                {DAYS.map(day => {
                  const entry = getEntry(day, period);
                  return (
                    <td key={day} className="px-4 py-3">
                      {entry ? (
                        <div className="p-2 rounded-lg" style={{ background: CREAM }}>
                          <p className="font-medium text-xs" style={{ color: NAVY }}>{entry.subject}</p>
                          {entry.room && <p className="text-xs" style={{ color: MUTED }}>{entry.room}</p>}
                        </div>
                      ) : (
                        <span className="text-xs" style={{ color: MUTED }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
