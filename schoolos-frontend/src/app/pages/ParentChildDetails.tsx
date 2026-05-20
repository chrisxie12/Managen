import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft, CalendarCheck, BarChart3, Wallet, Bell,
  Loader2, AlertCircle,
} from "lucide-react";
import { api } from "../services/api";
import { AttendanceHistory } from "../components/student/AttendanceHistory";
import { ReportCardView } from "../components/student/ReportCardView";
import { FeeStatus } from "../components/student/FeeStatus";
import { InterventionNotes } from "../components/student/InterventionNotes";
import { StudentAnnouncements } from "../components/student/StudentAnnouncements";
import type { StudentProfile, AttendanceRecord, ReportCard, Invoice, Intervention } from "../components/student/types";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
      <h3 className="font-bold mb-4" style={{ color: NAVY, fontFamily: "'Playfair Display', serif", fontSize: "0.95rem" }}>{title}</h3>
      {children}
    </div>
  );
}

type Tab = "attendance" | "performance" | "fees" | "notes" | "announcements";

const TABS: { key: Tab; label: string; icon: any }[] = [
  { key: "attendance", label: "Attendance", icon: CalendarCheck },
  { key: "performance", label: "Performance", icon: BarChart3 },
  { key: "fees", label: "Fees", icon: Wallet },
  { key: "notes", label: "Support Notes", icon: AlertCircle },
  { key: "announcements", label: "Announcements", icon: Bell },
];

export function ParentChildDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [tab, setTab] = useState<Tab>("attendance");
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        // First verify this child belongs to the parent
        const briefRes = await api.get<any>(`/api/school/parent/children/${id}`);
        if (!briefRes.data) { setError("Access denied."); return; }

        const child = briefRes.data.student || briefRes.data;
        setStudent(child);

        const [attRes, cardsRes, invRes, intRes] = await Promise.all([
          api.get<{ records: AttendanceRecord[] }>(`/api/school/attendance/student/${id}`).catch(() => ({ data: { records: [] } })),
          api.get<{ reportCards: ReportCard[] }>(`/api/school/report-cards?student_id=${id}`).catch(() => ({ data: { reportCards: [] } })),
          api.get<{ invoices: Invoice[] }>(`/api/school/invoices?student_id=${id}`).catch(() => ({ data: { invoices: [] } })),
          api.get<{ interventions: Intervention[] }>(`/api/school/interventions?student_id=${id}`).catch(() => ({ data: { interventions: [] } })),
        ]);

        setAttendance(attRes.data?.records || []);
        setReportCards(cardsRes.data?.reportCards || []);
        setInvoices(invRes.data?.invoices || []);
        setInterventions(intRes.data?.interventions || []);
      } catch (err: any) {
        setError(err.message || "Failed to load child details.");
      } finally {
        setLoading(false);
      }
    };
    load();
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
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate("/dashboard/parent")} className="p-2 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
          <ArrowLeft size={16} color={NAVY} />
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>{student?.name || "Child"}</h2>
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
              border: tab === t.key ? "none" : "1px solid rgba(56,25,50,0.1)",
            }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "attendance" && <Card title="Attendance History"><AttendanceHistory records={attendance} loading={false} /></Card>}
      {tab === "performance" && <Card title="Academic Performance"><ReportCardView cards={reportCards} loading={false} /></Card>}
      {tab === "fees" && <Card title="Fee Status"><FeeStatus invoices={invoices} loading={false} /></Card>}
      {tab === "notes" && <Card title="Support & Behavioral Notes"><InterventionNotes interventions={interventions} loading={false} /></Card>}
      {tab === "announcements" && <Card title="Announcements"><StudentAnnouncements /></Card>}
    </div>
  );
}
