import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, Clock, FileSpreadsheet, ArrowRight, GraduationCap } from "lucide-react";
import { api } from "../services/api";
import { LoadingSpinner, StatCard, KpiCard, DashboardCard, MiniTable, StatusBadge, palette } from "../components/dashboard";

const { NAVY, MUTED } = palette;

type DashboardData = {
  totalStudents: number;
  avgPerformance: number | null;
  pendingApprovals: number;
  staffCount: number;
  recentAssessments: { id: string; name: string; class_name: string; status: string; date: string }[];
  academicPerformance: { subject: string; avg: number }[];
};

export function HeadmasterDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, assRes] = await Promise.all([
          api.get<{ totalStudents: number; totalTeachers: number; attendanceRate: number | string }>("/api/school/dashboard").catch(() => ({ data: undefined })),
          api.get<{ assessments: any[] }>("/api/school/assessments").catch(() => ({ data: undefined })),
        ]);

        const dash = dashRes.data || { totalStudents: 0, totalTeachers: 0, attendanceRate: 0 };
        const assessments = assRes.data?.assessments || [];

        setData({
          totalStudents: dash.totalStudents,
          avgPerformance: typeof dash.attendanceRate === "number" ? dash.attendanceRate : null,
          pendingApprovals: assessments.filter((a: any) => a.status === "draft").length,
          staffCount: dash.totalTeachers,
          recentAssessments: assessments.slice(0, 8).map((a: any) => ({
            id: a.id, name: a.name, class_name: a.class?.name || "—", status: a.status || "draft", date: a.date,
          })),
          academicPerformance: [],
        });
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner />;

  const d = data || { totalStudents: 0, avgPerformance: null, pendingApprovals: 0, staffCount: 0, recentAssessments: [], academicPerformance: [] };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value={d.totalStudents.toLocaleString()} color="#6366F1" path="/dashboard/students" />
        <KpiCard value={d.avgPerformance !== null ? `${d.avgPerformance}%` : "—"} label="Avg Performance" sub="Overall" positive={d.avgPerformance !== null && d.avgPerformance >= 50} />
        <StatCard icon={Clock} label="Pending Approvals" value={d.pendingApprovals.toString()} color={d.pendingApprovals > 0 ? "#F59E0B" : "#10B981"} />
        <KpiCard value={d.staffCount.toLocaleString()} label="Staff Count" sub="Teachers & staff" />
      </div>

      {d.recentAssessments.length > 0 ? (
        <DashboardCard title="Recent Assessments" action={
          <button onClick={() => navigate("/dashboard/assessments")} className="flex items-center gap-1 text-xs" style={{ color: NAVY }}>
            View All <ArrowRight size={11} />
          </button>
        }>
          <MiniTable
            headers={["Name", "Class", "Date", "Status"]}
            rows={d.recentAssessments.map((a) => [
              a.name,
              a.class_name,
              a.date ? new Date(a.date).toLocaleDateString() : "—",
              <StatusBadge key={a.id} status={a.status} />,
            ])}
          />
        </DashboardCard>
      ) : (
        <div className="flex items-center justify-center min-h-[300px] rounded-[24px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
          <div className="text-center p-8">
            <FileSpreadsheet size={40} color={MUTED} className="mx-auto mb-4" />
            <p style={{ color: NAVY, fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>Academic Performance</p>
            <p style={{ color: MUTED, fontSize: "0.85rem" }}>Performance data will appear here once academic records are created.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center min-h-[200px] rounded-[24px]" style={{ background: `linear-gradient(135deg, ${NAVY}, #0C2D8A)` }}>
        <div className="text-center p-8">
          <GraduationCap size={32} color="rgba(248,249,250,0.6)" className="mx-auto mb-3" />
          <p style={{ color: "#F8F9FA", fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>Pending Approvals</p>
          <p style={{ color: "rgba(248,249,250,0.6)", fontSize: "0.85rem" }}>
            {d.pendingApprovals > 0
              ? `${d.pendingApprovals} assessment${d.pendingApprovals > 1 ? "s" : ""} awaiting your review.`
              : "No pending approvals. All assessments have been reviewed."}
          </p>
        </div>
      </div>
    </div>
  );
}
