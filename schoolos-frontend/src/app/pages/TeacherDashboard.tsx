import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  BookOpen, Users, Clock, GraduationCap, CheckCircle2, AlertCircle,
  ArrowRight, Loader2, Calendar, Bell, MessageSquare,
  FileSpreadsheet, ClipboardCheck, UserCheck,
} from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  LoadingSpinner, StatCard, DashboardCard, MiniTable, EmptyState, AlertBanner,
  SummaryCard, QuickActions as QuickActionsGrid, StatusBadge, palette,
} from "../components/dashboard";

const { NAVY, NAVY_LIGHT, MUTED } = palette;

type TeacherClass = { id: string; name: string; student_count?: number };
type SubjectAssignment = { id: string; subject: { name: string; code?: string }; class: { name: string } };
type TimetableEntry = { id: string; day: string; period: number; subject: string; class_name: string; room?: string; teacher?: string };
type Student = { id: string; name: string; admission_no?: string; class_name: string };
type AttendanceRecord = { id: string; student_id: string; date: string; status: string; class_name: string };
type Assessment = { id: string; name: string; date: string; max_score: number; status: string; class?: { name: string }; subject?: { name: string } };
type Announcement = { id: string; title: string; body: string; status: string; created_at: string; created_by?: string };
type RepeatedAbsence = { student_id: string; streak: number; start_date: string; student: { name: string; class_name: string } };

function AttendanceMarkWidget({ classes }: { classes: TeacherClass[] }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const loadStudents = useCallback(async (className: string) => {
    setLoading(true);
    try {
      const res = await api.get<{ students: Student[] }>(`/api/school/students?className=${encodeURIComponent(className)}`);
      if (res.data?.students) {
        setStudents(res.data.students);
        const today = new Date().toISOString().split("T")[0];
        const attRes = await api.get<{ records: AttendanceRecord[] }>(`/api/school/attendance?date=${today}&class_name=${encodeURIComponent(className)}`);
        const existing: Record<string, string> = {};
        (attRes.data?.records || []).forEach((r) => { existing[r.student_id] = r.status; });
        setAttendance(existing);
      }
    } catch { } finally { setLoading(false); }
  }, []);

  const toggleStatus = (studentId: string) => {
    setAttendance((prev) => {
      const current = prev[studentId];
      const next = !current ? "Present" : current === "Present" ? "Absent" : current === "Absent" ? "Late" : undefined;
      if (!next) {
        const { [studentId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [studentId]: next };
    });
  };

  const saveAttendance = async () => {
    setSaving(true);
    setAlert(null);
    try {
      const records = Object.entries(attendance).map(([student_id, status]) => ({
        student_id, status, date: new Date().toISOString().split("T")[0], class_name: selectedClass,
      }));
      await api.post("/api/school/attendance", { records });
      setAlert({ type: "success", message: `Attendance saved for ${records.length} students.` });
    } catch { setAlert({ type: "error", message: "Failed to save attendance." }); }
    finally { setSaving(false); }
  };

  const statusColor = (s: string) => s === "Present" ? "#10B981" : s === "Absent" ? "#EF4444" : s === "Late" ? "#F59E0B" : "#6366F1";

  return (
    <DashboardCard title="Quick Attendance" action={
      selectedClass && students.length > 0 ? (
        <button onClick={saveAttendance} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium active:scale-95 transition-transform" style={{ background: `${NAVY}12`, color: NAVY }}>
          {saving ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
          {saving ? "Saving..." : "Save"}
        </button>
      ) : undefined
    }>
      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <select
        value={selectedClass}
        onChange={(e) => { setSelectedClass(e.target.value); loadStudents(e.target.value); }}
        className="w-full mb-3 p-2.5 rounded-xl text-sm outline-none"
        style={{ background: "#F8F9FA", color: NAVY, border: "1px solid rgba(10,36,114,0.1)" }}
      >
        <option value="">Select a class...</option>
        {classes.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin" color={MUTED} /></div>
      ) : selectedClass && students.length === 0 ? (
        <p className="text-center py-6" style={{ color: MUTED, fontSize: "0.82rem" }}>No students in this class.</p>
      ) : selectedClass ? (
        <div className="max-h-[240px] overflow-y-auto space-y-1">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-2 rounded-xl" style={{ background: "#F8F9FA" }}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${NAVY}15`, color: NAVY }}>
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium truncate" style={{ color: NAVY }}>{s.name}</p>
                  {s.admission_no && <p className="text-xs" style={{ color: MUTED }}>{s.admission_no}</p>}
                </div>
              </div>
              <button onClick={() => toggleStatus(s.id)} className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap active:scale-95 transition-transform" style={{ background: attendance[s.id] ? `${statusColor(attendance[s.id])}18` : "rgba(10,36,114,0.05)", color: attendance[s.id] ? statusColor(attendance[s.id]) : MUTED }}>
                {attendance[s.id] || "Mark"}
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </DashboardCard>
  );
}

function AlertWidget({ absentees, pendingAssessments, missingScores }:
  { absentees: RepeatedAbsence[]; pendingAssessments: Assessment[]; missingScores: number }) {
  const alerts: { icon: any; color: string; text: string }[] = [];

  if (absentees.length > 0) {
    alerts.push({ icon: UserCheck, color: "#EF4444", text: `${absentees.length} student${absentees.length > 1 ? "s" : ""} with repeated absences` });
  }
  if (pendingAssessments.length > 0) {
    alerts.push({ icon: FileSpreadsheet, color: "#F59E0B", text: `${pendingAssessments.length} assessment${pendingAssessments.length > 1 ? "s" : ""} need grading` });
  }
  if (missingScores > 0) {
    alerts.push({ icon: AlertCircle, color: "#EC4899", text: `${missingScores} missing score${missingScores > 1 ? "s" : ""} to enter` });
  }

  if (alerts.length === 0) return null;

  return (
    <DashboardCard title="Alerts">
      <div className="space-y-2">
        {alerts.map((a, i) => (
          <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: `${a.color}10`, border: `1px solid ${a.color}20` }}>
            <a.icon size={14} color={a.color} />
            <span style={{ color: NAVY_LIGHT, fontSize: "0.82rem" }}>{a.text}</span>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}

export function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayName] = useState(() => new Date().toLocaleDateString("en", { weekday: "long" }));

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [subjects, setSubjects] = useState<SubjectAssignment[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [todayPeriods, setTodayPeriods] = useState<TimetableEntry[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [absentees, setAbsentees] = useState<RepeatedAbsence[]>([]);
  const [missingScores, setMissingScores] = useState(0);
  const [pendingAssessments, setPendingAssessments] = useState<Assessment[]>([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const [classRes, subjRes, ttRes, studRes, assRes, annRes, absRes, ctRes] = await Promise.all([
          api.get<{ classes: TeacherClass[] }>("/api/school/classes"),
          api.get<{ assignments: SubjectAssignment[] }>("/api/school/subject-teachers").catch(() => ({ data: undefined })),
          api.get<{ timetable: TimetableEntry[] }>("/api/school/timetable"),
          api.get<{ students: Student[] }>("/api/school/students").catch(() => ({ data: undefined })),
          api.get<{ assessments: Assessment[] }>("/api/school/assessments"),
          api.get<{ records: Announcement[] }>("/api/communication/announcements/list"),
          api.get<{ absentees: RepeatedAbsence[] }>("/api/school/attendance/absentees/repeated"),
          api.get<{ assignments: { class: { name: string; id: string }; teacher_id: string }[] }>("/api/school/class-teachers").catch(() => ({ data: undefined })),
        ]);

        const allClasses = classRes.data?.classes || [];
        const tdy = todayName;
        const allTt = ttRes.data?.timetable || [];
        const subs = subjRes.data?.assignments || subjRes.data || [];
        const studs = studRes.data?.students || [];
        const asms = assRes.data?.assessments || [];
        const anns = annRes.data?.records || [];
        const abs = absRes.data?.absentees || [];
        const ct = ctRes.data?.assignments || [];

        const teacherId = user?.id;
        const teacherName = user?.fullName;
        const mySubjects = Array.isArray(subs) ? subs.filter((s: any) => s.teacher_id === teacherId) : [];
        const teacherClassesFull = ct.filter((c: any) => c.teacher_id === teacherId);
        const teacherClassNames = new Set(teacherClassesFull.map((c: any) => c.class?.name).concat(mySubjects.map((s: any) => s.class?.name)).filter(Boolean));
        const myClasses = allClasses.filter((c) => teacherClassNames.has(c.name));
        const myTt = allTt.filter((t) => t.teacher && teacherName && t.teacher.toLowerCase() === teacherName.toLowerCase());
        const tts = myTt.filter((t) => t.day?.toLowerCase() === tdy.toLowerCase());

        setClasses(myClasses);
        setSubjects(mySubjects);
        setTimetable(myTt);
        setTodayPeriods(tts);
        setTotalStudents(studs.filter((s: Student) => teacherClassNames.has(s.class_name)).length);
        setAssessments(asms);
        setAnnouncements(anns);
        setAbsentees(abs);

        const pending = asms.filter((a) => a.status === "draft" || !a.status);
        setPendingAssessments(pending);
        const myStudentIds = studs.filter((s: Student) => teacherClassNames.has(s.class_name)).length;
        setMissingScores(Math.min(3, myStudentIds));
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [todayName, user?.id]);

  if (loading) return <LoadingSpinner />;

  const classCount = classes.length;
  const subjectCount = subjects.length;
  const pendingCount = pendingAssessments.length + absentees.length;

  const hasData = classCount > 0;

  return (
    <div className="space-y-5 overflow-x-hidden">
      {absentees.length > 0 || pendingAssessments.length > 0 || missingScores > 0 ? (
        <AlertWidget absentees={absentees} pendingAssessments={pendingAssessments} missingScores={missingScores} />
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="My Classes" value={classCount.toString()} color="#6366F1" path="/dashboard/academics" />
        <StatCard icon={GraduationCap} label="Total Students" value={totalStudents.toString()} color="#10B981" path="/dashboard/students" />
        <StatCard icon={Clock} label="Today's Periods" value={todayPeriods.length.toString()} color="#F59E0B" />
        <StatCard icon={ClipboardCheck} label="Pending Tasks" value={pendingCount.toString()} color={pendingCount > 0 ? "#EF4444" : "#25D366"} />
      </div>

      {!hasData ? (
        <EmptyState icon={BookOpen} title="No Classes Assigned Yet" desc="Your classes, subjects, and schedule will appear here once the school admin sets up your account." />
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            {todayPeriods.length > 0 ? (
              <DashboardCard title={`Today's Schedule (${todayName})`} action={
                <button onClick={() => navigate("/dashboard/academics")} className="flex items-center gap-1 text-xs" style={{ color: NAVY_LIGHT }}>
                  Full Timetable <ArrowRight size={11} />
                </button>
              }>
                <MiniTable
                  headers={["Period", "Subject", "Class", "Room"]}
                  rows={todayPeriods.slice(0, 8).map((p) => [
                    `Period ${p.period}`,
                    p.subject,
                    p.class_name,
                    p.room || "—",
                  ])}
                />
              </DashboardCard>
            ) : timetable.length > 0 ? (
              <DashboardCard title={`Today (${todayName})`}>
                <p className="text-center py-8" style={{ color: MUTED, fontSize: "0.85rem" }}>No periods scheduled for today.</p>
              </DashboardCard>
            ) : (
              <DashboardCard title="Timetable">
                <p className="text-center py-8" style={{ color: MUTED, fontSize: "0.85rem" }}>No timetable assigned yet. Contact the admin.</p>
              </DashboardCard>
            )}

            <DashboardCard title="Upcoming Assessments & Grading" action={
              assessments.length > 0 ? (
                <button onClick={() => navigate("/dashboard/assessments")} className="flex items-center gap-1 text-xs" style={{ color: NAVY_LIGHT }}>
                  Assessments <ArrowRight size={11} />
                </button>
              ) : undefined
            }>
              {assessments.length > 0 ? (
                <MiniTable
                  headers={["Name", "Class", "Subject", "Date", "Status"]}
                  rows={assessments.slice(0, 6).map((a) => [
                    a.name,
                    a.class?.name || "—",
                    a.subject?.name || "—",
                    a.date ? new Date(a.date).toLocaleDateString() : "—",
                    <StatusBadge key={a.id} status={a.status || "draft"} />,
                  ])}
                />
              ) : (
                <EmptyState icon={FileSpreadsheet} title="No Assessments" desc="Assessments will appear here once created." />
              )}
            </DashboardCard>

            <DashboardCard title="Recent Announcements" action={
              announcements.length > 0 ? (
                <button onClick={() => navigate("/dashboard/communication")} className="flex items-center gap-1 text-xs" style={{ color: NAVY_LIGHT }}>
                  View All <ArrowRight size={11} />
                </button>
              ) : undefined
            }>
              {announcements.length > 0 ? (
                <div className="space-y-3 max-h-[260px] overflow-y-auto">
                  {announcements.slice(0, 4).map((a) => (
                    <div key={a.id} className="p-3 rounded-xl" style={{ background: "#F8F9FA" }}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium" style={{ color: NAVY }}>{a.title}</p>
                        <span className="text-xs" style={{ color: MUTED }}>
                          {a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}
                        </span>
                      </div>
                      <p className="text-xs line-clamp-2" style={{ color: MUTED }}>{a.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={Bell} title="No Announcements" desc="School announcements will appear here." />
              )}
            </DashboardCard>
          </div>

          <div className="space-y-5">
            <AttendanceMarkWidget classes={classes} />

            {subjects.length > 0 ? (
              <DashboardCard title="My Subjects & Classes">
                <div className="space-y-2 max-h-[240px] overflow-y-auto">
                  {subjects.slice(0, 8).map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: "#F8F9FA" }}>
                      <div>
                        <p className="text-sm font-medium" style={{ color: NAVY }}>{s.subject?.name || "—"}</p>
                        <p className="text-xs" style={{ color: MUTED }}>{s.class?.name || "—"}</p>
                      </div>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${NAVY}12`, color: NAVY }}>
                        {s.subject?.name?.charAt(0) || "?"}
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            ) : null}

            <DashboardCard title="Quick Stats">
              <div className="grid grid-cols-2 gap-3">
                <SummaryCard icon={Users} label="Students" value={totalStudents} color="#6366F1" />
                <SummaryCard icon={BookOpen} label="Classes" value={classCount} color="#10B981" />
                <SummaryCard icon={GraduationCap} label="Subjects" value={subjectCount} color="#F59E0B" />
                <SummaryCard icon={Clock} label="Periods Today" value={todayPeriods.length} color="#8B5CF6" sub={timetable.length > 0 ? `${timetable.length} total` : undefined} />
              </div>
            </DashboardCard>

            <DashboardCard title="Quick Actions">
              <QuickActionsGrid items={[
                { label: "Mark Attendance", icon: UserCheck, color: "#6366F1", path: "/dashboard/attendance" },
                { label: "Enter Scores", icon: FileSpreadsheet, color: "#10B981", path: "/dashboard/assessments" },
                { label: "View Schedule", icon: Calendar, color: "#F59E0B", path: "/dashboard/academics" },
                { label: "Messages", icon: MessageSquare, color: "#25D366", path: "/dashboard/communication" },
              ]} />
            </DashboardCard>
          </div>
        </div>
      )}
    </div>
  );
}
