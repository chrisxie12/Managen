import { useState, useEffect } from "react";
import { Check, X, Clock, AlertCircle, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "../../services/api";
import type { ClassStudent } from "./types";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

const STATUS_OPTIONS = [
  { value: "Present", color: "#10B981", bg: "#D1FAE5", icon: Check },
  { value: "Absent", color: "#EF4444", bg: "#FEF2F2", icon: X },
  { value: "Late", color: "#F59E0B", bg: "#FEF3C7", icon: Clock },
  { value: "Excused", color: "#6366F1", bg: "#EEF2FF", icon: AlertCircle },
];

export function ClassAttendance({ className, students }: { className: string; students: ClassStudent[] }) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<{ records: any[] }>(`/api/school/attendance?date=${date}&class_name=${encodeURIComponent(className)}&limit=200`);
        const records = res.data?.records || [];
        const map: Record<string, string> = {};
        records.forEach((r: any) => { map[r.student_id] = r.status; });
        setAttendance(map);
      } catch { /* no existing records */ }
    };
    if (className) load();
  }, [date, className]);

  const saveAttendance = async () => {
    setSaving(true);
    setAlert(null);
    try {
      const records = Object.entries(attendance).map(([student_id, status]) => ({
        student_id, status, date, class_name: className,
      }));
      await api.post("/api/school/attendance", { records });
      setAlert({ type: "success", message: `Attendance saved for ${records.length} students on ${new Date(date).toLocaleDateString()}.` });
    } catch {
      setAlert({ type: "error", message: "Failed to save attendance." });
    } finally {
      setSaving(false);
    }
  };

  const summary = STATUS_OPTIONS.map(opt => ({
    label: opt.value,
    count: Object.values(attendance).filter(v => v === opt.value).length,
    color: opt.color,
  }));

  return (
    <div className="space-y-4">
      {alert && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{
          background: alert.type === "error" ? "#FEF2F2" : "#D1FAE5",
          color: alert.type === "error" ? "#EF4444" : "#065F46",
          border: `1px solid ${alert.type === "error" ? "#FECACA" : "#A7F3D0"}`,
          fontSize: "0.9rem",
        }}>
          {alert.type === "error" ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          <span className="flex-1">{alert.message}</span>
          <button onClick={() => setAlert(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="px-4 py-2 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY }} />
        <div className="flex gap-2 flex-wrap">
          {summary.filter(s => s.count > 0).map(s => (
            <span key={s.label} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: `${s.color}15`, color: s.color }}>
              {s.label}: {s.count}
            </span>
          ))}
        </div>
        <button onClick={saveAttendance} disabled={saving || students.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50 ml-auto"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
              <th className="px-4 py-3 font-medium">Student</th>
              {STATUS_OPTIONS.map(s => <th key={s.value} className="px-2 py-3 text-center font-medium">{s.value}</th>)}
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                      {student.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: NAVY }}>{student.name}</span>
                  </div>
                </td>
                {STATUS_OPTIONS.map(s => (
                  <td key={s.value} className="px-2 py-3 text-center">
                    <button onClick={() => setAttendance(prev => ({ ...prev, [student.id]: s.value }))}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                      style={{
                        background: attendance[student.id] === s.value ? s.bg : "transparent",
                        border: `1.5px solid ${attendance[student.id] === s.value ? s.color : "rgba(56,25,50,0.12)"}`,
                      }}>
                      <s.icon size={13} color={attendance[student.id] === s.value ? s.color : MUTED} />
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
