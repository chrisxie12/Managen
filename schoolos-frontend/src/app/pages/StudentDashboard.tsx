import { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
import { api } from "../services/api";
import { ProfileSummary } from "../components/student/ProfileSummary";
import { AttendanceHistory } from "../components/student/AttendanceHistory";
import { ReportCardView } from "../components/student/ReportCardView";
import { TimetableWidget } from "../components/student/TimetableWidget";
import { FeeStatus } from "../components/student/FeeStatus";
import { InterventionNotes } from "../components/student/InterventionNotes";
import { StudentAnnouncements } from "../components/student/StudentAnnouncements";
import type { StudentProfile, AttendanceRecord, ReportCard, TimetableEntry, Invoice, Intervention } from "../components/student/types";
import { LoadingSpinner, ErrorState, EmptyState, DashboardCard, AlertBanner } from "../components/dashboard";

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

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="space-y-4">
        <AlertBanner type="error" message={error} onClose={() => setError("")} />
        <ErrorState message="Contact your school admin if this persists." />
      </div>
    );
  }

  if (!profile) {
    return <EmptyState icon={GraduationCap} title="No Data Yet" desc="Your grades, timetable, and announcements will appear once the school publishes them. If you believe this is an error, please contact your school admin." />;
  }

  return (
    <div className="space-y-5">
      <ProfileSummary student={profile} />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <DashboardCard title="Attendance History">
            <AttendanceHistory records={attendance} loading={false} />
          </DashboardCard>

          <DashboardCard title={`Report Card${reportCards.length > 1 ? "s" : ""}`}>
            <ReportCardView cards={reportCards} loading={false} />
          </DashboardCard>
        </div>

        <div className="space-y-5">
          <DashboardCard title="Class Schedule">
            <TimetableWidget entries={timetable} loading={false} />
          </DashboardCard>

          <DashboardCard title="Fee Status">
            <FeeStatus invoices={invoices} loading={false} />
          </DashboardCard>

          <DashboardCard title="Announcements">
            <StudentAnnouncements />
          </DashboardCard>

          {interventions.length > 0 && (
            <DashboardCard title="Support Notes">
              <InterventionNotes interventions={interventions} loading={false} />
            </DashboardCard>
          )}
        </div>
      </div>
    </div>
  );
}
