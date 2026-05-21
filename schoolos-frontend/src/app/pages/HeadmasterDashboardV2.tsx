import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users, TrendingUp, AlertCircle, CheckCircle2, Clock, Zap,
  BarChart3, DollarSign, FileCheck, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { api } from "../services/api";

const COLORS = {
  NAVY: "#0A2472",
  AMBER: "#FFBA08",
  MUTED: "#6B7280",
  GREEN: "#10B981",
  RED: "#EF4444",
  BLUE: "#3B82F6",
};

type DashboardMetrics = {
  totalStudents: number;
  totalStaff: number;
  attendanceToday: number;
  feesCollectedThisMonth: number;
  feesOutstanding: number;
  upcomingExams: number;
  approvalsPending: number;
  averagePerformance: number;
};

export function HeadmasterDashboardV2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalStudents: 0,
    totalStaff: 0,
    attendanceToday: 0,
    feesCollectedThisMonth: 0,
    feesOutstanding: 0,
    upcomingExams: 0,
    approvalsPending: 0,
    averagePerformance: 0,
  });

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await api.get("/api/school/dashboard");
        if (res.data) {
          setMetrics({
            totalStudents: res.data.totalStudents || 0,
            totalStaff: res.data.totalTeachers || 0,
            attendanceToday: Math.random() * 100, // Replace with real API
            feesCollectedThisMonth: res.data.feesCollected || 0,
            feesOutstanding: res.data.feesOutstanding || 0,
            upcomingExams: res.data.upcomingExams || 0,
            approvalsPending: res.data.pendingApprovals || 0,
            averagePerformance: res.data.avgPerformance || 0,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const KpiCard = ({ icon: Icon, label, value, subtext, color, trend, onClick }: any) => (
    <div
      onClick={onClick}
      className="p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg"
      style={{
        background: "white",
        borderColor: `${color}20`,
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={24} style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: trend > 0 ? COLORS.GREEN : COLORS.RED }}>
            {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ color: COLORS.NAVY }} className="text-3xl font-bold mb-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div style={{ color: COLORS.MUTED }} className="text-sm font-medium">
        {label}
      </div>
      {subtext && <div style={{ color: COLORS.MUTED }} className="text-xs mt-2">{subtext}</div>}
    </div>
  );

  const ActionCard = ({ icon: Icon, title, desc, color, onClick }: any) => (
    <div
      onClick={onClick}
      className="p-6 rounded-xl border cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
      style={{
        background: "white",
        borderColor: `${color}20`,
      }}
    >
      <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div style={{ color: COLORS.NAVY }} className="font-bold">
        {title}
      </div>
      <div style={{ color: COLORS.MUTED }} className="text-sm mt-1">
        {desc}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* HEADER */}
      <div>
        <h1 style={{ color: COLORS.NAVY }} className="text-2xl sm:text-3xl font-bold">
          Dashboard
        </h1>
        <p style={{ color: COLORS.MUTED }} className="mt-2">
          Welcome back! Here's your school's overview.
        </p>
      </div>

      {/* KEY METRICS - PRIMARY ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Total Students"
          value={metrics.totalStudents}
          color={COLORS.BLUE}
          trend={12}
          onClick={() => navigate("/dashboard/students")}
        />
        <KpiCard
          icon={TrendingUp}
          label="Avg Performance"
          value={`${Math.round(metrics.averagePerformance)}%`}
          color={COLORS.GREEN}
          trend={5}
          onClick={() => navigate("/dashboard/reports")}
        />
        <KpiCard
          icon={DollarSign}
          label="Fees This Month"
          value={`GHS ${metrics.feesCollectedThisMonth.toLocaleString()}`}
          color={COLORS.AMBER}
          trend={8}
          onClick={() => navigate("/dashboard/fees")}
        />
        <KpiCard
          icon={AlertCircle}
          label="Outstanding Fees"
          value={`GHS ${metrics.feesOutstanding.toLocaleString()}`}
          color={COLORS.RED}
          subtext="Follow up required"
        />
      </div>

      {/* SECONDARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          icon={Clock}
          label="Attendance Today"
          value={`${Math.round(metrics.attendanceToday)}%`}
          color={COLORS.GREEN}
          onClick={() => navigate("/dashboard/attendance")}
        />
        <KpiCard
          icon={FileCheck}
          label="Pending Approvals"
          value={metrics.approvalsPending}
          color={metrics.approvalsPending > 0 ? COLORS.RED : COLORS.GREEN}
          subtext={metrics.approvalsPending > 0 ? "Action needed" : "All cleared"}
        />
        <KpiCard
          icon={BarChart3}
          label="Upcoming Exams"
          value={metrics.upcomingExams}
          color={COLORS.BLUE}
          subtext="This term"
        />
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 style={{ color: COLORS.NAVY }} className="text-lg font-bold mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionCard
            icon={Users}
            title="Manage Students"
            desc="Add, edit, or import student records"
            color={COLORS.BLUE}
            onClick={() => navigate("/dashboard/students")}
          />
          <ActionCard
            icon={DollarSign}
            title="Collect Fees"
            desc="Record fee payments and invoices"
            color={COLORS.GREEN}
            onClick={() => navigate("/dashboard/fees")}
          />
          <ActionCard
            icon={BarChart3}
            title="Create Exam"
            desc="Schedule exams and manage results"
            color={COLORS.BLUE}
            onClick={() => navigate("/dashboard/exams")}
          />
          <ActionCard
            icon={Zap}
            title="Send Announcement"
            desc="Notify parents via WhatsApp"
            color={COLORS.AMBER}
            onClick={() => navigate("/dashboard/communication")}
          />
        </div>
      </div>

      {/* RECENT ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="p-4 sm:p-6 rounded-xl border bg-white">
          <h3 style={{ color: COLORS.NAVY }} className="font-bold mb-4">
            Recent Payments
          </h3>
          <div className="space-y-3">
            {[
              { student: "Kofi Mensah", amount: "GHS 500", date: "Today", icon: CheckCircle2 },
              { student: "Ama Osei", amount: "GHS 250", date: "Yesterday", icon: CheckCircle2 },
              { student: "David Owusu", amount: "GHS 1,000", date: "2 days ago", icon: CheckCircle2 },
            ].map((p) => (
              <div key={p.student} className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg" style={{ background: `${COLORS.GREEN}20` }}>
                    <p.icon size={20} style={{ color: COLORS.GREEN, margin: "5px" }} />
                  </div>
                  <div>
                    <div style={{ color: COLORS.NAVY }} className="font-medium text-sm">
                      {p.student}
                    </div>
                    <div style={{ color: COLORS.MUTED }} className="text-xs">
                      {p.date}
                    </div>
                  </div>
                </div>
                <div style={{ color: COLORS.GREEN }} className="font-bold">
                  {p.amount}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="p-4 sm:p-6 rounded-xl border bg-white">
          <h3 style={{ color: COLORS.NAVY }} className="font-bold mb-4">
            Attendance This Week
          </h3>
          <div className="space-y-3">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, i) => {
              const attendance = 85 + Math.random() * 10;
              return (
                <div key={day} className="flex items-center gap-3">
                  <div style={{ color: COLORS.MUTED }} className="text-sm font-medium w-20">
                    {day}
                  </div>
                  <div className="flex-1 h-2 rounded-full" style={{ background: "#E5E7EB" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${attendance}%`,
                        background: attendance > 90 ? COLORS.GREEN : COLORS.AMBER,
                      }}
                    />
                  </div>
                  <div style={{ color: COLORS.NAVY }} className="font-bold text-sm w-10 text-right">
                    {Math.round(attendance)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
