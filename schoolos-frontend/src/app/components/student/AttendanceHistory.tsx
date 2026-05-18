import { useMemo } from "react";
import { Check, X, Clock, AlertCircle, Loader2, CalendarCheck } from "lucide-react";
import type { AttendanceRecord } from "./types";

const PLUM = "#381932";
const MUTED = "#7D6077";

const STATUS_MAP: Record<string, { color: string; bg: string; icon: any }> = {
  Present: { color: "#10B981", bg: "#D1FAE5", icon: Check },
  Absent: { color: "#EF4444", bg: "#FEF2F2", icon: X },
  Late: { color: "#F59E0B", bg: "#FEF3C7", icon: Clock },
  Excused: { color: "#6366F1", bg: "#EEF2FF", icon: AlertCircle },
};

export function AttendanceHistory({ records, loading }: { records: AttendanceRecord[]; loading: boolean }) {
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter(r => r.status === "Present").length;
    const absent = records.filter(r => r.status === "Absent").length;
    const late = records.filter(r => r.status === "Late").length;
    return { total, present, absent, late, rate: total > 0 ? ((present / total) * 100).toFixed(1) : "—" };
  }, [records]);

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <div className="p-3 rounded-xl text-center" style={{ background: "#D1FAE5" }}>
          <p className="text-lg font-bold" style={{ color: "#065F46" }}>{stats.present}</p>
          <p className="text-xs" style={{ color: "#065F46" }}>Present</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: "#FEF2F2" }}>
          <p className="text-lg font-bold" style={{ color: "#991B1B" }}>{stats.absent}</p>
          <p className="text-xs" style={{ color: "#991B1B" }}>Absent</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: "#FEF3C7" }}>
          <p className="text-lg font-bold" style={{ color: "#92400E" }}>{stats.late}</p>
          <p className="text-xs" style={{ color: "#92400E" }}>Late</p>
        </div>
        <div className="p-3 rounded-xl text-center" style={{ background: "#EEF2FF" }}>
          <p className="text-lg font-bold" style={{ color: "#3730A3" }}>{stats.rate}%</p>
          <p className="text-xs" style={{ color: "#3730A3" }}>Rate</p>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-6" style={{ color: MUTED }}>
          <CalendarCheck size={28} className="mx-auto mb-2" />
          <p className="text-sm">No attendance records yet.</p>
        </div>
      ) : (
        <div className="max-h-[200px] overflow-y-auto space-y-1">
          {records.slice(0, 20).map(r => {
            const s = STATUS_MAP[r.status] || STATUS_MAP.Present;
            return (
              <div key={r.id} className="flex items-center justify-between p-2 rounded-lg text-sm" style={{ background: `${s.bg}60` }}>
                <span style={{ color: PLUM }}>{new Date(r.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                  <s.icon size={11} /> {r.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
