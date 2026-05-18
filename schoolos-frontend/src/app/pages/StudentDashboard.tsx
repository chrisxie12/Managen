import { useState, useEffect } from "react";
import {
  GraduationCap, Loader2, AlertCircle,
  CheckCircle2, X,
} from "lucide-react";
import { api } from "../services/api";
import { ProfileSummary } from "../components/student/ProfileSummary";
import { AttendanceHistory } from "../components/student/AttendanceHistory";
import { ReportCardView } from "../components/student/ReportCardView";
import { TimetableWidget } from "../components/student/TimetableWidget";
import { FeeStatus } from "../components/student/FeeStatus";
import { InterventionNotes } from "../components/student/InterventionNotes";
import { StudentAnnouncements } from "../components/student/StudentAnnouncements";
import type { StudentProfile, AttendanceRecord, ReportCard, TimetableEntry, Invoice, Intervention } from "../components/student/types";

const PLUM = "#381932";
const MUTED = "#7D6077";

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
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold" style={{ color: PLUM, fontFamily: "'Playfair Display', serif", fontSize: "0.95rem" }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function StudentDashboard() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<any>("/api/school/student/dashboard");
        const d = res.data;
        if (!d) { setError("Could not load dashboard."); return; }
        setProfile(d.student);
        setAttendance(d.attendance || []);
        setReportCards(d.reportCards || []);
        setTimetable(d.timetable || []);
        setInvoices(d.invoices || []);
        setInterventions(d.interventions || []);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin" size={32} color={PLUM} /></div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <AlertBanner type="error" message={error} onClose={() => setError("")} />
        <div className="text-center py-16" style={{ color: MUTED }}>
          <GraduationCap size={48} className="mx-auto mb-4" color={MUTED} />
          <p className="text-lg font-semibold" style={{ color: PLUM }}>Could not load dashboard</p>
          <p className="text-sm mt-1">Contact your school admin if this persists.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16" style={{ color: MUTED }}>
        <GraduationCap size={48} className="mx-auto mb-4" color={MUTED} />
        <p className="text-lg font-semibold" style={{ color: PLUM }}>No Data Yet</p>
        <p className="text-sm mt-1 max-w-md mx-auto">Your grades, timetable, and announcements will appear once the school publishes them. If you believe this is an error, please contact your school admin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ProfileSummary student={profile} />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card title="Attendance History">
            <AttendanceHistory records={attendance} loading={false} />
          </Card>

          <Card title={`Report Card${reportCards.length > 1 ? "s" : ""}`}>
            <ReportCardView cards={reportCards} loading={false} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Class Schedule">
            <TimetableWidget entries={timetable} loading={false} />
          </Card>

          <Card title="Fee Status">
            <FeeStatus invoices={invoices} loading={false} />
          </Card>

          <Card title="Announcements">
            <StudentAnnouncements />
          </Card>

          {interventions.length > 0 && (
            <Card title="Support Notes">
              <InterventionNotes interventions={interventions} loading={false} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
