import { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck, Loader2, Search, Check, X, Clock,
  UserCheck, AlertCircle,
} from "lucide-react";
import { api } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type Student = { id: string; name: string; class_name: string; admission_no?: string };
type AttendanceRecord = {
  id: string; student_id: string; date: string; status: string;
  class_name: string; notes?: string; marked_by?: string;
  student?: { name: string; class_name: string };
};
type ClassOption = { id?: string; name: string };

const STATUS_OPTIONS = [
  { value: "Present", color: "#10B981", bg: "#D1FAE5", icon: Check },
  { value: "Absent", color: "#EF4444", bg: "#FEF2F2", icon: X },
  { value: "Late", color: "#F59E0B", bg: "#FEF3C7", icon: Clock },
  { value: "Excused", color: "#6366F1", bg: "#EEF2FF", icon: AlertCircle },
  { value: "Half-day", color: "#EC4899", bg: "#FDF2F8", icon: UserCheck },
];

export function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"mark" | "history">("mark");
  const [search, setSearch] = useState("");
  const [historyFilter, setHistoryFilter] = useState("");

  const loadClasses = useCallback(async () => {
    try {
      const res = await api.get<{ classes: ClassOption[] }>("/api/school/classes");
      const cls = res.data?.classes || [];
      setClasses(cls);
      if (cls.length > 0 && !selectedClass) setSelectedClass(cls[0].name);
    } catch { /* ignore */ }
  }, []);

  const loadStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const res = await api.get<{ students: Student[]; total: number }>(
        `/api/school/students?className=${encodeURIComponent(selectedClass)}&limit=100`
      );
      const list = res.data?.students || [];
      setStudents(list);
      const defaultStatus: Record<string, string> = {};
      const defaultNotes: Record<string, string> = {};
      list.forEach(s => { defaultStatus[s.id] = "Present"; defaultNotes[s.id] = ""; });
      setAttendance(defaultStatus);
      setNotes(defaultNotes);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
    }
  }, [selectedClass]);

  const loadRecords = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.set("class_name", selectedClass);
      if (historyFilter) params.set("status", historyFilter);
      const res = await api.get<{ records: AttendanceRecord[] }>(`/api/school/attendance?${params}`);
      setRecords(res.data?.records || []);
    } catch { /* ignore */ }
  }, [selectedClass, historyFilter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadClasses(), loadRecords()]).finally(() => setLoading(false));
  }, [loadClasses, loadRecords]);

  useEffect(() => { if (selectedClass) loadStudents(); }, [selectedClass, loadStudents]);

  const filteredStudents = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.admission_no || "").toLowerCase().includes(search.toLowerCase())
  );

  const submittedCount = Object.values(attendance).filter(v => v).length;

  const submitAttendance = async () => {
    if (!selectedClass) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const records = Object.entries(attendance).map(([student_id, status]) => ({
        student_id, date: selectedDate, status, class_name: selectedClass,
        notes: notes[student_id] || undefined,
      }));
      await api.post("/api/school/attendance", { records });
      setSuccess(`Attendance saved for ${records.length} students on ${selectedDate}`);
      await loadRecords();
    } catch (err: any) {
      setError(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const statusCount = (status: string) =>
    Object.values(attendance).filter(v => v === status).length;

  const todayRecords = records.filter(r => r.date === selectedDate);

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", fontSize: "0.9rem" }}>
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0", fontSize: "0.9rem" }}>
          <Check size={14} /> {success}
          <button onClick={() => setSuccess("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: PLUM }}>Attendance</h2>
          <p className="text-sm" style={{ color: MUTED }}>Track and manage student attendance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab("mark")}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: tab === "mark" ? PLUM : "white", color: tab === "mark" ? MILK : PLUM_LIGHT, border: tab === "mark" ? "none" : "1px solid rgba(56,25,50,0.1)" }}>
            Mark Attendance
          </button>
          <button onClick={() => setTab("history")}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: tab === "history" ? PLUM : "white", color: tab === "history" ? MILK : PLUM_LIGHT, border: tab === "history" ? "none" : "1px solid rgba(56,25,50,0.1)" }}>
            History
          </button>
        </div>
      </div>

      {tab === "mark" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>Students</p>
              <p className="text-2xl font-bold mt-1" style={{ color: PLUM }}>{students.length}</p>
            </div>
            {STATUS_OPTIONS.map(s => (
              <div key={s.value} className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <div className="flex items-center gap-2">
                  <s.icon size={14} color={s.color} />
                  <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>{s.value}</p>
                </div>
                <p className="text-2xl font-bold mt-1" style={{ color: PLUM }}>{tab === "mark" ? statusCount(s.value) : todayRecords.filter(r => r.status === s.value).length}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM, minWidth: 180 }}>
              {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }} />
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", maxWidth: 280 }}>
              <Search size={14} color={MUTED} />
              <input placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
            </div>
            <button onClick={submitAttendance} disabled={saving || !selectedClass || students.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
              {saving ? <Loader2 size={15} className="animate-spin" /> : <CalendarCheck size={15} />}
              {saving ? "Saving..." : `Save (${submittedCount})`}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin" size={28} color={PLUM} /></div>
          ) : students.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <UserCheck size={40} color={MUTED} className="mx-auto mb-3" />
              <p className="font-semibold" style={{ color: PLUM }}>No students in this class</p>
              <p className="text-sm mt-1" style={{ color: MUTED }}>Add students to {selectedClass} first</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Admission No.</th>
                      {STATUS_OPTIONS.map(s => (
                        <th key={s.value} className="px-2 py-3 text-center font-medium">{s.value}</th>
                      ))}
                      <th className="px-4 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
                              {student.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                            </div>
                            <span className="font-medium" style={{ color: PLUM }}>{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{student.admission_no || "—"}</td>
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
                        <td className="px-4 py-3">
                          <input value={notes[student.id] || ""} onChange={(e) => setNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                            placeholder="Optional note..."
                            className="w-24 px-2 py-1 rounded-lg text-xs outline-none" style={{ background: MILK, border: "1px solid rgba(56,25,50,0.08)", color: PLUM }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM, minWidth: 180 }}>
              <option value="">All classes</option>
              {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <select value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM, minWidth: 140 }}>
              <option value="">All status</option>
              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin" size={28} color={PLUM} /></div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <Clock size={40} color={MUTED} className="mx-auto mb-3" />
              <p className="font-semibold" style={{ color: PLUM }}>No attendance records found</p>
              <p className="text-sm mt-1" style={{ color: MUTED }}>Mark attendance to see records here</p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Student</th>
                      <th className="px-4 py-3 font-medium">Class</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(record => {
                      const st = STATUS_OPTIONS.find(s => s.value === record.status) || STATUS_OPTIONS[1];
                      return (
                        <tr key={record.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                          <td className="px-4 py-3 font-medium" style={{ color: PLUM }}>{new Date(record.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3" style={{ color: PLUM }}>{record.student?.name || "Unknown"}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{record.class_name}</td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit"
                              style={{ background: st.bg, color: st.color }}>
                              <st.icon size={11} /> {st.value}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{record.notes || "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
