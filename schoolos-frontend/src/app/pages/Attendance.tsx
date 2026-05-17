import { useState, useEffect, useCallback } from "react";
import {
  CalendarCheck, Loader2, Search, Check, X, Clock,
  UserCheck, AlertCircle, Users, UserX,
  AlertTriangle, ChevronLeft, ChevronRight, BarChart3,
  School, List,
} from "lucide-react";
import { api } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type Student = { id: string; name: string; class_name: string; admission_no?: string };
type Teacher = { id: string; name: string; email?: string };
type AttendanceRecord = {
  id: string; student_id: string; date: string; status: string;
  class_name: string; notes?: string; marked_by?: string;
  student?: { name: string; class_name: string };
};
type DailyTrend = { date: string; Present: number; Absent: number; Late: number; Excused: number; "Half-day": number; total: number };
type RepeatedAbsence = {
  student_id: string; streak: number; start_date: string; end_date: string;
  student: { name: string; class_name: string; admission_no?: string };
};

type ClassOption = { id?: string; name: string };

const STATUS_OPTIONS = [
  { value: "Present", color: "#10B981", bg: "#D1FAE5", icon: Check },
  { value: "Absent", color: "#EF4444", bg: "#FEF2F2", icon: X },
  { value: "Late", color: "#F59E0B", bg: "#FEF3C7", icon: Clock },
  { value: "Excused", color: "#6366F1", bg: "#EEF2FF", icon: AlertCircle },
  { value: "Half-day", color: "#EC4899", bg: "#FDF2F8", icon: UserCheck },
];

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "mark", label: "Mark", icon: CalendarCheck },
  { key: "staff", label: "Staff", icon: Users },
  { key: "history", label: "History", icon: List },
];

function AlertBanner({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) {
  const bg = type === "error" ? "#FEF2F2" : "#D1FAE5";
  const color = type === "error" ? "#EF4444" : "#065F46";
  const border = type === "error" ? "#FECACA" : "#A7F3D0";
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: bg, color, border: `1px solid ${border}`, fontSize: "0.9rem" }}>
      {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-auto"><X size={14} /></button>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} color={color || MUTED} />
        <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ color: PLUM }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: MUTED }}>{sub}</p>}
    </div>
  );
}

function TrendBar({ day, max }: { day: DailyTrend; max: number }) {
  const presentPct = day.total > 0 ? (day.Present / day.total) * 100 : 0;
  const absentPct = day.total > 0 ? (day.Absent / day.total) * 100 : 0;
  const latePct = day.total > 0 ? (day.Late / day.total) * 100 : 0;
  const barH = max > 0 ? Math.max(4, (day.total / max) * 80) : 4;
  const label = new Date(day.date).toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
  return (
    <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
      <span className="text-[10px] font-medium truncate w-full text-center" style={{ color: MUTED }}>{label}</span>
      <div className="relative w-full flex items-end justify-center" style={{ height: 84 }}>
        <div className="flex flex-col items-center" style={{ height: `${barH}px`, minHeight: 4 }}>
          <div className="w-6 rounded-t-sm transition-all" style={{ height: `${presentPct}%`, background: "#10B981", minHeight: presentPct > 0 ? 2 : 0 }} />
          <div className="w-6 transition-all" style={{ height: `${latePct}%`, background: "#F59E0B", minHeight: latePct > 0 ? 2 : 0 }} />
          <div className="w-6 rounded-b-sm transition-all" style={{ height: `${absentPct}%`, background: "#EF4444", minHeight: absentPct > 0 ? 2 : 0 }} />
        </div>
      </div>
      <span className="text-[10px]" style={{ color: MUTED }}>{day.total}</span>
    </div>
  );
}

function LoadingSpinner({ height = 48 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <Loader2 className="animate-spin" size={24} color={PLUM} />
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <Icon size={40} color={MUTED} className="mx-auto mb-3" />
      <p className="font-semibold" style={{ color: PLUM }}>{title}</p>
      <p className="text-sm mt-1" style={{ color: MUTED }}>{desc}</p>
    </div>
  );
}

function Pagination({ page, total, limit, onChange }: { page: number; total: number; limit: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm" style={{ borderTop: "1px solid rgba(56,25,50,0.07)" }}>
      <span style={{ color: MUTED }}>{total} record{total !== 1 ? "s" : ""}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: PLUM, border: "1px solid rgba(56,25,50,0.12)" }}>
          <ChevronLeft size={14} />
        </button>
        <span className="font-medium px-2" style={{ color: PLUM }}>{page} / {totalPages}</span>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: PLUM, border: "1px solid rgba(56,25,50,0.12)" }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export function Attendance() {
  const [tab, setTab] = useState("overview");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: PLUM }}>Attendance</h2>
          <p className="text-sm" style={{ color: MUTED }}>Track and manage attendance</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{
                background: tab === t.key ? PLUM : "white",
                color: tab === t.key ? MILK : PLUM_LIGHT,
                border: tab === t.key ? "none" : "1px solid rgba(56,25,50,0.1)",
              }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "mark" && <MarkTab setError={setError} setSuccess={setSuccess} />}
      {tab === "staff" && <StaffTab setError={setError} setSuccess={setSuccess} />}
      {tab === "history" && <HistoryTab />}
    </div>
  );
}

function OverviewTab() {
  const [todayStats, setTodayStats] = useState<{ present: number; absent: number; late: number; total: number } | null>(null);
  const [trends, setTrends] = useState<DailyTrend[]>([]);
  const [absentees, setAbsentees] = useState<RepeatedAbsence[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7);

  const load = useCallback(async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - trendDays * 86400000).toISOString().split("T")[0];
    try {
      const [statsRes, trendsRes, absRes] = await Promise.all([
        api.get<{ data: { records: AttendanceRecord[]; total: number } }>(`/api/school/attendance?date=${today}&limit=500`),
        api.get<{ data: { trends: DailyTrend[] } }>(`/api/school/attendance/trends?start=${start}&end=${today}`),
        api.get<{ data: { absentees: RepeatedAbsence[] } }>("/api/school/attendance/absentees/repeated?min=3"),
      ]);
      const records = statsRes.data?.data?.records || [];
      setTodayStats({
        present: records.filter(r => r.status === "Present").length,
        absent: records.filter(r => r.status === "Absent").length,
        late: records.filter(r => r.status === "Late").length,
        total: records.length,
      });
      setTrends(trendsRes.data?.data?.trends || []);
      setAbsentees(absRes.data?.data?.absentees || []);
    } catch {
      setTodayStats(null);
    } finally {
      setLoading(false);
    }
  }, [trendDays]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner height={200} />;

  const maxTotal = Math.max(1, ...trends.map(d => d.total));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={School} label="Today's Records" value={todayStats?.total ?? 0} sub="Total attendance entries" />
        <SummaryCard icon={UserCheck} label="Present" value={todayStats?.present ?? 0}
          sub={todayStats?.total ? `${((todayStats.present / todayStats.total) * 100).toFixed(1)}% rate` : "No data"} color="#10B981" />
        <SummaryCard icon={UserX} label="Absent" value={todayStats?.absent ?? 0} color="#EF4444"
          sub={todayStats?.total ? `${((todayStats.absent / todayStats.total) * 100).toFixed(1)}%` : "No data"} />
        <SummaryCard icon={Clock} label="Late" value={todayStats?.late ?? 0} color="#F59E0B"
          sub={todayStats?.total ? `${((todayStats.late / todayStats.total) * 100).toFixed(1)}%` : "No data"} />
      </div>

      {trends.length > 0 && (
        <div className="p-5 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: PLUM }}>Daily Trends</h3>
            <div className="flex gap-1.5">
              {[7, 14, 30].map(d => (
                <button key={d} onClick={() => setTrendDays(d)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: trendDays === d ? PLUM : "transparent",
                    color: trendDays === d ? MILK : MUTED,
                  }}>{d}d</button>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-1">
            {trends.map(day => <TrendBar key={day.date} day={day} max={maxTotal} />)}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: MUTED }}>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#10B981" }} /> Present</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#F59E0B" }} /> Late</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#EF4444" }} /> Absent</span>
          </div>
        </div>
      )}

      {absentees.length > 0 && (
        <div className="p-5 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} color="#EF4444" />
            <h3 className="font-semibold text-sm" style={{ color: PLUM }}>
              Repeated Absence Alerts ({absentees.length})
            </h3>
          </div>
          <div className="space-y-2">
            {absentees.slice(0, 10).map((a, i) => (
              <div key={a.student_id + i} className="flex items-center justify-between p-3 rounded-lg text-sm"
                style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: "#EF4444" }}>
                    {a.student?.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate" style={{ color: "#991B1B" }}>{a.student?.name || "Unknown"}</p>
                    <p className="text-xs" style={{ color: "#EF4444" }}>
                      {a.student?.class_name && `${a.student.class_name} · `}
                      {a.streak} consecutive absences
                    </p>
                  </div>
                </div>
                <span className="text-xs shrink-0 ml-2" style={{ color: "#991B1B" }}>
                  {new Date(a.start_date).toLocaleDateString()} – {new Date(a.end_date).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!todayStats && trends.length === 0 && absentees.length === 0 && (
        <EmptyState icon={BarChart3} title="No attendance data yet" desc="Mark attendance to see overview" />
      )}
    </div>
  );
}

function MarkTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const loadClasses = useCallback(async () => {
    try {
      const res = await api.get<{ data: { classes: ClassOption[] } }>("/api/school/classes");
      const cls = res.data?.data?.classes || [];
      setClasses(cls);
      if (cls.length > 0 && !selectedClass) setSelectedClass(cls[0].name);
    } catch { /* ignore */ }
  }, [selectedClass]);

  const loadStudents = useCallback(async () => {
    if (!selectedClass) return;
    try {
      const res = await api.get<{ data: { students: Student[]; total: number } }>(
        `/api/school/students?className=${encodeURIComponent(selectedClass)}&limit=100`
      );
      const list = res.data?.data?.students || [];
      setStudents(list);
      const defaultStatus: Record<string, string> = {};
      const defaultNotes: Record<string, string> = {};
      list.forEach(s => { defaultStatus[s.id] = "Present"; defaultNotes[s.id] = ""; });
      setAttendance(defaultStatus);
      setNotes(defaultNotes);
    } catch (err: any) {
      setError(err.message || "Failed to load students");
    }
  }, [selectedClass, setError]);

  useEffect(() => {
    setLoading(true);
    loadClasses().finally(() => setLoading(false));
  }, [loadClasses]);

  useEffect(() => { if (selectedClass) loadStudents(); }, [selectedClass, loadStudents]);

  const filteredStudents = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.admission_no || "").toLowerCase().includes(search.toLowerCase())
  );

  const statusCount = (status: string) => Object.values(attendance).filter(v => v === status).length;
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
    } catch (err: any) {
      setError(err.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <SummaryCard icon={School} label="Students" value={students.length} sub={selectedClass || "No class"} />
        {STATUS_OPTIONS.map(s => (
          <SummaryCard key={s.value} icon={s.icon} label={s.value} value={statusCount(s.value)} color={s.color} />
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
        <LoadingSpinner height={192} />
      ) : students.length === 0 ? (
        <EmptyState icon={UserCheck} title="No students in this class" desc={`Add students to ${selectedClass} first`} />
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
                {filteredStudents.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-sm" style={{ color: MUTED }}>No students match search</td></tr>
                ) : filteredStudents.map(student => (
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
                        placeholder="Note..."
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
  );
}

function StaffTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [checkIn, setCheckIn] = useState<Record<string, string>>({});
  const [checkOut, setCheckOut] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get<{ data: { teachers: Teacher[] } }>("/api/school/teachers")
      .then(res => {
        const list = res.data?.data?.teachers || [];
        setTeachers(list);
        const defaults: Record<string, string> = {};
        list.forEach(t => { defaults[t.id] = "Present"; });
        setAttendance(defaults);
      })
      .catch(() => setError("Failed to load staff"))
      .finally(() => setLoading(false));
  }, [setError]);

  const filtered = teachers.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusCount = (status: string) => Object.values(attendance).filter(v => v === status).length;
  const submittedCount = Object.values(attendance).filter(v => v).length;

  const submitStaffAttendance = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const records = Object.entries(attendance).map(([user_id, status]) => ({
        user_id, date: selectedDate, status,
        check_in: checkIn[user_id] || null,
        check_out: checkOut[user_id] || null,
      }));
      await api.post("/api/school/attendance/staff", { records });
      setSuccess(`Staff attendance saved for ${records.length} on ${selectedDate}`);
    } catch (err: any) {
      setError(err.message || "Failed to save staff attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <SummaryCard icon={Users} label="Staff" value={teachers.length} sub="Total teachers" />
        {STATUS_OPTIONS.map(s => (
          <SummaryCard key={s.value} icon={s.icon} label={s.value} value={statusCount(s.value)} color={s.color} />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }} />
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", maxWidth: 280 }}>
          <Search size={14} color={MUTED} />
          <input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
        </div>
        <button onClick={submitStaffAttendance} disabled={saving || teachers.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <CalendarCheck size={15} />}
          {saving ? "Saving..." : `Save (${submittedCount})`}
        </button>
      </div>

      {loading ? (
        <LoadingSpinner height={192} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No staff found" desc="Add teachers first" />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                  <th className="px-4 py-3 font-medium">Staff</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  {STATUS_OPTIONS.map(s => (
                    <th key={s.value} className="px-2 py-3 text-center font-medium">{s.value}</th>
                  ))}
                  <th className="px-2 py-3 font-medium">Check-in</th>
                  <th className="px-2 py-3 font-medium">Check-out</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
                          {t.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <span className="font-medium" style={{ color: PLUM }}>{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{t.email || "—"}</td>
                    {STATUS_OPTIONS.map(s => (
                      <td key={s.value} className="px-2 py-3 text-center">
                        <button onClick={() => setAttendance(prev => ({ ...prev, [t.id]: s.value }))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
                          style={{
                            background: attendance[t.id] === s.value ? s.bg : "transparent",
                            border: `1.5px solid ${attendance[t.id] === s.value ? s.color : "rgba(56,25,50,0.12)"}`,
                          }}>
                          <s.icon size={13} color={attendance[t.id] === s.value ? s.color : MUTED} />
                        </button>
                      </td>
                    ))}
                    <td className="px-2 py-3">
                      <input type="time" value={checkIn[t.id] || ""} onChange={(e) => setCheckIn(prev => ({ ...prev, [t.id]: e.target.value }))}
                        className="w-20 px-1.5 py-1 rounded-lg text-xs outline-none" style={{ background: MILK, border: "1px solid rgba(56,25,50,0.08)", color: PLUM }} />
                    </td>
                    <td className="px-2 py-3">
                      <input type="time" value={checkOut[t.id] || ""} onChange={(e) => setCheckOut(prev => ({ ...prev, [t.id]: e.target.value }))}
                        className="w-20 px-1.5 py-1 rounded-lg text-xs outline-none" style={{ background: MILK, border: "1px solid rgba(56,25,50,0.08)", color: PLUM }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function HistoryTab() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 25;

  const loadRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedClass) params.set("class_name", selectedClass);
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", String(limit));
      const res = await api.get<{ data: { records: AttendanceRecord[]; total: number; page: number; limit: number } }>(
        `/api/school/attendance?${params}`
      );
      setRecords(res.data?.data?.records || []);
      setTotal(res.data?.data?.total || 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [selectedClass, statusFilter, page]);

  useEffect(() => {
    api.get<{ data: { classes: ClassOption[] } }>("/api/school/classes")
      .then(res => setClasses(res.data?.data?.classes || []))
      .catch(() => {});
  }, []);

  useEffect(() => { loadRecords(); }, [loadRecords]);

  useEffect(() => { setPage(1); }, [selectedClass, statusFilter]);

  const filtered = records.filter(r =>
    !search || (r.student?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM, minWidth: 160 }}>
          <option value="">All classes</option>
          {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM, minWidth: 140 }}>
          <option value="">All status</option>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.value}</option>)}
        </select>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", maxWidth: 280 }}>
          <Search size={14} color={MUTED} />
          <input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner height={256} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Clock} title="No attendance records found" desc={records.length > 0 ? "No records match your search" : "Mark attendance to see records here"} />
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
                {filtered.map(record => {
                  const st = STATUS_OPTIONS.find(s => s.value === record.status) || STATUS_OPTIONS[0];
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
          <Pagination page={page} total={total} limit={limit} onChange={setPage} />
        </div>
      )}
    </>
  );
}
