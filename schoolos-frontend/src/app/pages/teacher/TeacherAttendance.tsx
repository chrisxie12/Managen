import { useState } from "react";
import { CheckCircle2, XCircle, Clock, FileText, Users, ChevronDown, Send, CheckCheck } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const PRIMARY = "#0080FF";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

type Student = {
  id: string;
  name: string;
  admissionNo: string;
  status: AttendanceStatus | null;
};

const CLASSES = ["Form 1A", "Form 1B", "Form 2A", "Form 3"];

const MOCK_STUDENTS: Student[] = [
  { id: "1",  name: "Kwame Asante",         admissionNo: "GHA-2024-001", status: null },
  { id: "2",  name: "Abena Mensah",          admissionNo: "GHA-2024-002", status: null },
  { id: "3",  name: "Kofi Boateng",          admissionNo: "GHA-2024-003", status: null },
  { id: "4",  name: "Ama Owusu",             admissionNo: "GHA-2024-004", status: null },
  { id: "5",  name: "Yaw Darko",             admissionNo: "GHA-2024-005", status: null },
  { id: "6",  name: "Akosua Frimpong",       admissionNo: "GHA-2024-006", status: null },
  { id: "7",  name: "Kojo Acheampong",       admissionNo: "GHA-2024-007", status: null },
  { id: "8",  name: "Efua Antwi",            admissionNo: "GHA-2024-008", status: null },
  { id: "9",  name: "Nana Yaw Oppong",       admissionNo: "GHA-2024-009", status: null },
  { id: "10", name: "Adwoa Kyei",            admissionNo: "GHA-2024-010", status: null },
  { id: "11", name: "Kwabena Ofori",         admissionNo: "GHA-2024-011", status: null },
  { id: "12", name: "Afia Bonsu",            admissionNo: "GHA-2024-012", status: null },
  { id: "13", name: "Kweku Sarpong",         admissionNo: "GHA-2024-013", status: null },
  { id: "14", name: "Maame Konadu",          admissionNo: "GHA-2024-014", status: null },
  { id: "15", name: "Paa Kwesi Amponsah",    admissionNo: "GHA-2024-015", status: null },
  { id: "16", name: "Abena Asiedu",          admissionNo: "GHA-2024-016", status: null },
  { id: "17", name: "Fiifi Quaye",           admissionNo: "GHA-2024-017", status: null },
  { id: "18", name: "Araba Mensah",          admissionNo: "GHA-2024-018", status: null },
  { id: "19", name: "Kwadwo Osei",           admissionNo: "GHA-2024-019", status: null },
  { id: "20", name: "Akua Boateng",          admissionNo: "GHA-2024-020", status: null },
];

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  present: { label: "Present", color: SUCCESS,  bg: "#D1FAE5", icon: <CheckCircle2 size={14} /> },
  absent:  { label: "Absent",  color: DANGER,   bg: "#FEE2E2", icon: <XCircle size={14} /> },
  late:    { label: "Late",    color: WARNING,   bg: "#FEF3C7", icon: <Clock size={14} /> },
  excused: { label: "Excused", color: PRIMARY,   bg: "#DBEAFE", icon: <FileText size={14} /> },
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function getInitialColor(name: string) {
  const colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#06B6D4"];
  return colors[name.charCodeAt(0) % colors.length];
}

export function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS.map(s => ({ ...s })));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const todayStr = today.toLocaleDateString("en-GH", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const setStatus = (id: string, status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const markAll = (status: AttendanceStatus) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleClassChange = (cls: string) => {
    setSelectedClass(cls);
    setSubmitted(false);
    setStudents(MOCK_STUDENTS.map(s => ({ ...s, status: null })));
  };

  const counts = {
    present: students.filter(s => s.status === "present").length,
    absent:  students.filter(s => s.status === "absent").length,
    late:    students.filter(s => s.status === "late").length,
    excused: students.filter(s => s.status === "excused").length,
    unmarked: students.filter(s => s.status === null).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Mark Attendance</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>{todayStr}</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-xl border border-border bg-white">
          <Users size={15} style={{ color: MUTED }} />
          <span style={{ color: NAVY }}>{students.length} students</span>
        </div>
      </div>

      {/* Class Selector */}
      <div className="relative w-full sm:w-64">
        <select
          value={selectedClass}
          onChange={e => handleClassChange(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-medium appearance-none cursor-pointer bg-white pr-9"
          style={{ color: NAVY }}
        >
          {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
      </div>

      {submitted ? (
        /* Already Submitted State */
        <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "#D1FAE5" }}>
            <CheckCheck size={32} style={{ color: SUCCESS }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: NAVY }}>Attendance Submitted</h2>
            <p className="text-sm mt-1" style={{ color: MUTED }}>{selectedClass} · {todayStr}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm max-w-lg mx-auto">
            {(["present", "absent", "late", "excused"] as AttendanceStatus[]).map(status => (
              <div key={status} className="rounded-xl p-3 border border-border">
                <div className="text-xl font-bold" style={{ color: STATUS_CONFIG[status].color }}>{counts[status]}</div>
                <div className="text-xs mt-0.5" style={{ color: MUTED }}>{STATUS_CONFIG[status].label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSubmitted(false)}
            className="text-sm underline"
            style={{ color: PRIMARY }}
          >Edit attendance</button>
        </div>
      ) : (
        <>
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => markAll("present")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:opacity-80"
              style={{ background: "#D1FAE5", color: SUCCESS, borderColor: "#A7F3D0" }}
            >
              <CheckCircle2 size={14} /> Mark All Present
            </button>
            <button
              onClick={() => markAll("absent")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition-colors hover:opacity-80"
              style={{ background: "#FEE2E2", color: DANGER, borderColor: "#FECACA" }}
            >
              <XCircle size={14} /> Mark All Absent
            </button>
            {counts.unmarked > 0 && (
              <span className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs" style={{ background: "#FEF3C7", color: "#92400E" }}>
                {counts.unmarked} not yet marked
              </span>
            )}
          </div>

          {/* Student List */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="divide-y divide-border">
              {students.map((student, idx) => {
                const initColor = getInitialColor(student.name);
                return (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                    style={{ background: student.status ? STATUS_CONFIG[student.status].bg + "40" : "white" }}
                  >
                    {/* Rank */}
                    <span className="text-xs w-5 text-right" style={{ color: MUTED }}>{idx + 1}</span>

                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: initColor }}
                    >
                      {getInitials(student.name)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate" style={{ color: NAVY }}>{student.name}</div>
                      <div className="text-xs" style={{ color: MUTED }}>{student.admissionNo}</div>
                    </div>

                    {/* Status buttons */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {(["present", "absent", "late", "excused"] as AttendanceStatus[]).map(status => {
                        const cfg = STATUS_CONFIG[status];
                        const active = student.status === status;
                        return (
                          <button
                            key={status}
                            onClick={() => setStatus(student.id, status)}
                            title={cfg.label}
                            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:scale-110 active:scale-95"
                            style={{
                              background: active ? cfg.color : "#F3F4F6",
                              color: active ? "white" : MUTED,
                              border: active ? `1.5px solid ${cfg.color}` : "1.5px solid transparent",
                            }}
                          >
                            {cfg.icon}
                          </button>
                        );
                      })}
                    </div>

                    {/* Status badge */}
                    {student.status && (
                      <span className="hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full min-w-[60px] text-center" style={{ background: STATUS_CONFIG[student.status].bg, color: STATUS_CONFIG[student.status].color }}>
                        {STATUS_CONFIG[student.status].label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["present", "absent", "late", "excused"] as AttendanceStatus[]).map(status => (
              <div key={status} className="bg-card border border-border rounded-2xl p-4 text-center">
                <div className="text-2xl font-bold" style={{ color: STATUS_CONFIG[status].color }}>{counts[status]}</div>
                <div className="text-xs mt-1" style={{ color: MUTED }}>{STATUS_CONFIG[status].label}</div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || counts.unmarked === students.length}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-base font-semibold transition-all disabled:opacity-50"
            style={{ background: SUCCESS, color: "white" }}
          >
            {submitting ? (
              <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send size={18} />
            )}
            {submitting ? "Submitting…" : "Submit Attendance"}
          </button>
        </>
      )}
    </div>
  );
}
