import { useState, useEffect, useCallback } from "react";
import {
  Users, CalendarCheck, FileSpreadsheet, BarChart3, Calendar,
  Megaphone, ArrowLeft, BookOpen, Loader2,
  CheckCircle2, AlertCircle, X,
} from "lucide-react";
import { api } from "../services/api";
import { ClassCard } from "../components/teacher/ClassCard";
import { StudentList } from "../components/teacher/StudentList";
import { ClassAttendance } from "../components/teacher/ClassAttendance";
import { ClassGrades } from "../components/teacher/ClassGrades";
import { ClassPerformance } from "../components/teacher/ClassPerformance";
import { ClassTimetable } from "../components/teacher/ClassTimetable";
import { ClassAnnouncement } from "../components/teacher/ClassAnnouncement";
import type { TeacherClass, ClassStudent } from "../components/teacher/types";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type ViewMode = "list" | "detail";
type DetailTab = "students" | "attendance" | "grades" | "performance" | "timetable" | "announcements";

const DETAIL_TABS: { key: DetailTab; label: string; icon: any; desc: string }[] = [
  { key: "students", label: "Students", icon: Users, desc: "View class roster" },
  { key: "attendance", label: "Attendance", icon: CalendarCheck, desc: "Mark daily attendance" },
  { key: "grades", label: "Grades", icon: FileSpreadsheet, desc: "Enter assessment scores" },
  { key: "performance", label: "Performance", icon: BarChart3, desc: "Class analytics" },
  { key: "timetable", label: "Timetable", icon: Calendar, desc: "Weekly schedule" },
  { key: "announcements", label: "Announcements", icon: Megaphone, desc: "Send class messages" },
];

function AlertBanner({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) {
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{
      background: type === "error" ? "#FEF2F2" : "#D1FAE5",
      color: type === "error" ? "#EF4444" : "#065F46",
      border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}`,
      fontSize: "0.9rem",
    }}>
      {type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-auto"><X size={14} /></button>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin" size={32} color={NAVY} />
    </div>
  );
}

export function TeacherClassManagement() {
  const [view, setView] = useState<ViewMode>("list");
  const [selectedClass, setSelectedClass] = useState<TeacherClass | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>("students");
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<{ classes: TeacherClass[] }>("/api/school/my-classes");
        setClasses(res.data?.classes || []);
      } catch {
        setError("Failed to load your classes.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadStudents = useCallback(async (className: string) => {
    setStudentsLoading(true);
    try {
      const res = await api.get<{ students: ClassStudent[] }>(`/api/school/students?className=${encodeURIComponent(className)}&limit=200`);
      setStudents(res.data?.students || []);
    } catch {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  const openClass = (c: TeacherClass) => {
    setSelectedClass(c);
    setDetailTab("students");
    setView("detail");
    loadStudents(c.name);
  };

  const closeClass = () => {
    setView("list");
    setSelectedClass(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      {view === "list" && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>My Classes</h2>
              <p className="text-sm" style={{ color: MUTED }}>Manage your assigned classes</p>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
              <BookOpen size={14} /> {classes.length} class{classes.length !== 1 ? "es" : ""}
            </div>
          </div>

          {classes.length === 0 ? (
            <div className="text-center py-16" style={{ color: MUTED }}>
              <BookOpen size={48} className="mx-auto mb-4" color={MUTED} />
              <p className="text-lg font-semibold" style={{ color: NAVY }}>No Classes Assigned</p>
              <p className="text-sm mt-1">Your classes will appear here once the admin assigns them.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map(c => (
                <ClassCard key={c.id || c.name} c={c} onClick={() => openClass(c)} />
              ))}
            </div>
          )}
        </>
      )}

      {view === "detail" && selectedClass && (
        <>
          <div className="flex items-center gap-3 mb-2">
            <button onClick={closeClass} className="p-2 rounded-xl hover:opacity-70 transition-opacity" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)" }}>
              <ArrowLeft size={16} color={NAVY} />
            </button>
            <div>
              <h2 className="text-xl font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>{selectedClass.name}</h2>
              <p className="text-sm" style={{ color: MUTED }}>
                {selectedClass.role === "form_teacher" ? "Form Teacher" : selectedClass.role === "assistant" ? "Assistant Teacher" : "Subject Teacher"}
                {" · "}{selectedClass.student_count} student{selectedClass.student_count !== 1 ? "s" : ""}
                {selectedClass.subjects?.length ? ` · ${selectedClass.subjects.length} subject${selectedClass.subjects.length !== 1 ? "s" : ""}` : ""}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {DETAIL_TABS.map(tab => (
              <button key={tab.key} onClick={() => setDetailTab(tab.key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all active:scale-95"
                style={{
                  background: detailTab === tab.key ? NAVY : "white",
                  color: detailTab === tab.key ? CREAM : NAVY_LIGHT,
                  border: detailTab === tab.key ? "none" : "1px solid rgba(10,36,114,0.1)",
                }}>
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          {detailTab === "students" && <StudentList students={students} loading={studentsLoading} />}
          {detailTab === "attendance" && <ClassAttendance className={selectedClass.name} students={students} />}
          {detailTab === "grades" && <ClassGrades classId={selectedClass.id} className={selectedClass.name} students={students} />}
          {detailTab === "performance" && <ClassPerformance classId={selectedClass.id} className={selectedClass.name} />}
          {detailTab === "timetable" && <ClassTimetable className={selectedClass.name} />}
          {detailTab === "announcements" && <ClassAnnouncement className={selectedClass.name} classId={selectedClass.id} />}
        </>
      )}
    </div>
  );
}
