import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft, CalendarCheck, FileSpreadsheet, BarChart3, Calendar,
  Wallet, AlertTriangle, Bell, Loader2, AlertCircle, User,
} from "lucide-react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { api } from "../services/api";
import { AttendanceHistory } from "../components/student/AttendanceHistory";
import { ReportCardView } from "../components/student/ReportCardView";
import { TimetableWidget } from "../components/student/TimetableWidget";
import { FeeStatus } from "../components/student/FeeStatus";
import { InterventionNotes } from "../components/student/InterventionNotes";
import { StudentAnnouncements } from "../components/student/StudentAnnouncements";
import { UploadButton } from "../components/ui/UploadButton";
import type { StudentProfile, AttendanceRecord, ReportCard, TimetableEntry, Invoice, Intervention } from "../components/student/types";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)", boxShadow: "0 4px 24px rgba(10,36,114,0.06)" }}>
      <h3 className="font-bold mb-4" style={{ color: NAVY, fontFamily: "'Playfair Display', serif", fontSize: "0.95rem" }}>{title}</h3>
      {children}
    </div>
  );
}

type Tab = "attendance" | "grades" | "performance" | "timetable" | "fees" | "notes" | "announcements";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "attendance", label: "Attendance", icon: CalendarCheck },
  { key: "grades", label: "Grades", icon: FileSpreadsheet },
  { key: "performance", label: "Performance", icon: BarChart3 },
  { key: "timetable", label: "Timetable", icon: Calendar },
  { key: "fees", label: "Fees", icon: Wallet },
  { key: "notes", label: "Support Notes", icon: AlertTriangle },
  { key: "announcements", label: "Announcements", icon: Bell },
];

export function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [tab, setTab] = useState<Tab>("attendance");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [studRes, attRes, cardsRes, ttRes, invRes, intRes] = await Promise.all([
          api.get<{ student: StudentProfile }>(`/api/school/students/${id}`),
          api.get<{ records: AttendanceRecord[] }>(`/api/school/attendance/student/${id}`).catch(() => ({ data: { records: [] } })),
          api.get<{ reportCards: ReportCard[] }>(`/api/school/report-cards?student_id=${id}`).catch(() => ({ data: { reportCards: [] } })),
          api.get<{ timetable: TimetableEntry[] }>("/api/school/timetable").catch(() => ({ data: { timetable: [] } })),
          api.get<{ invoices: Invoice[] }>(`/api/school/invoices?student_id=${id}`).catch(() => ({ data: { invoices: [] } })),
          api.get<{ interventions: Intervention[] }>(`/api/school/interventions?student_id=${id}`).catch(() => ({ data: { interventions: [] } })),
        ]);

        const studentData = studRes.data?.student;
        setStudent(studentData || null);
        setAvatarUrl(studentData?.avatar_url);
        setAttendance(attRes.data?.records || []);
        setReportCards(cardsRes.data?.reportCards || []);
        const allTt: TimetableEntry[] = ttRes.data?.timetable || [];
        setTimetable(allTt.filter((e: any) => e.class_name?.toLowerCase() === studentData?.class_name?.toLowerCase()));
        setInvoices(invRes.data?.invoices || []);
        setInterventions(intRes.data?.interventions || []);
      } catch (err: any) {
        setError(err.message || "Failed to load student details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleAvatarUpload = useCallback(async (result: { url: string; key: string }) => {
    if (!id) return;
    try {
      await api.patch(`/api/school/students/${id}/avatar`, { key: result.key || result.url });
      setAvatarUrl(result.key || result.url);
      toast.success("Photo updated");
    } catch {
      toast.error("Failed to save photo URL");
    }
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin" size={32} color={NAVY} /></div>;
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl flex items-center gap-2" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" }}>
        <AlertCircle size={14} /> {error}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl shrink-0 mt-1" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)" }}>
          <ArrowLeft size={16} color={NAVY} />
        </button>
        <UploadButton
          bucket="student-photos"
          currentUrl={avatarUrl}
          onUploadComplete={handleAvatarUpload}
          onError={(msg) => toast.error(msg)}
        />
        <div className="min-w-0">
          <h2 className="text-xl font-bold truncate" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>{student?.name || "Student"}</h2>
          <p className="text-sm" style={{ color: MUTED }}>{student?.class_name}{student?.admission_no ? ` · ${student.admission_no}` : ""}</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all active:scale-95"
            style={{
              background: tab === t.key ? NAVY : "white",
              color: tab === t.key ? CREAM : NAVY_LIGHT,
              border: tab === t.key ? "none" : "1px solid rgba(10,36,114,0.1)",
            }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "attendance" && <Card title="Attendance History"><AttendanceHistory records={attendance} loading={false} /></Card>}
      {tab === "grades" && <Card title="Grades & Report Cards"><ReportCardView cards={reportCards} loading={false} /></Card>}
      {tab === "performance" && <Card title="Performance"><ReportCardView cards={reportCards} loading={false} /></Card>}
      {tab === "timetable" && <Card title="Timetable"><TimetableWidget entries={timetable} loading={false} /></Card>}
      {tab === "fees" && <Card title="Fee Status"><FeeStatus invoices={invoices} loading={false} /></Card>}
      {tab === "notes" && <Card title="Support & Behavioral Notes"><InterventionNotes interventions={interventions} loading={false} /></Card>}
      {tab === "announcements" && <Card title="Announcements"><StudentAnnouncements /></Card>}
    </div>
  );
}
