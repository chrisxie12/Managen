import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Users, BookOpen, BarChart3, Clock, CheckCircle2, AlertCircle,
  ArrowUpRight, Calendar, Zap,
} from "lucide-react";
import { api } from "../services/api";

const COLORS = {
  NAVY: "#0A2472",
  AMBER: "#FFBA08",
  MUTED: "#6B7280",
  GREEN: "#10B981",
  RED: "#EF4444",
  BLUE: "#3B82F6",
  PURPLE: "#8B5CF6",
};

type TeacherDashboardData = {
  totalClasses: number;
  totalStudents: number;
  averagePerformance: number;
  pendingGradeEntry: number;
  attendanceMarked: boolean;
  upcomingExams: number;
};

export function TeacherDashboardV2() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TeacherDashboardData>({
    totalClasses: 4,
    totalStudents: 120,
    averagePerformance: 78,
    pendingGradeEntry: 45,
    attendanceMarked: false,
    upcomingExams: 2,
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  const KpiCard = ({ icon: Icon, label, value, color, action, actionLabel }: any) => (
    <div
      className="p-6 rounded-xl border transition-all hover:shadow-lg"
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
      </div>
      <div style={{ color: COLORS.NAVY }} className="text-3xl font-bold mb-1">
        {value}
      </div>
      <div style={{ color: COLORS.MUTED }} className="text-sm font-medium">
        {label}
      </div>
      {action && (
        <button
          onClick={action}
          style={{ color: COLORS.AMBER }}
          className="text-xs font-semibold mt-3 hover:underline"
        >
          {actionLabel} →
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-6">
      {/* HEADER */}
      <div>
        <h1 style={{ color: COLORS.NAVY }} className="text-2xl sm:text-3xl font-bold">
          My Classes
        </h1>
        <p style={{ color: COLORS.MUTED }} className="mt-2">
          Manage your teaching schedule and student progress.
        </p>
      </div>

      {/* TODAY'S STATUS */}
      <div className="p-4 sm:p-6 rounded-xl border"
        style={{
          background: data.attendanceMarked
            ? `linear-gradient(135deg, ${COLORS.GREEN}15, ${COLORS.GREEN}08)`
            : `linear-gradient(135deg, ${COLORS.AMBER}15, ${COLORS.AMBER}08)`,
          borderColor: data.attendanceMarked ? `${COLORS.GREEN}30` : `${COLORS.AMBER}30`,
        }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 style={{ color: COLORS.NAVY }} className="font-bold text-lg">
              {data.attendanceMarked ? "✓ Today's Attendance Marked" : "⚠ Mark Today's Attendance"}
            </h3>
            <p style={{ color: COLORS.MUTED }} className="mt-1">
              {data.attendanceMarked
                ? "All classes recorded for today."
                : "Don't forget to mark attendance for all classes."}
            </p>
          </div>
          {!data.attendanceMarked && (
            <button
              onClick={() => navigate("/dashboard/attendance")}
              className="px-6 py-2.5 rounded-lg font-bold text-white"
              style={{ background: COLORS.AMBER }}
            >
              Mark Now
            </button>
          )}
        </div>
      </div>

      {/* KEY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={BookOpen}
          label="My Classes"
          value={data.totalClasses}
          color={COLORS.BLUE}
          action={() => navigate("/dashboard/classes")}
          actionLabel="View classes"
        />
        <KpiCard
          icon={Users}
          label="Total Students"
          value={data.totalStudents}
          color={COLORS.GREEN}
        />
        <KpiCard
          icon={BarChart3}
          label="Avg Performance"
          value={`${data.averagePerformance}%`}
          color={data.averagePerformance >= 75 ? COLORS.GREEN : COLORS.AMBER}
          action={() => navigate("/dashboard/grades")}
          actionLabel="See grades"
        />
        <KpiCard
          icon={AlertCircle}
          label="Pending Grades"
          value={data.pendingGradeEntry}
          color={COLORS.RED}
          action={() => navigate("/dashboard/grades")}
          actionLabel="Enter grades"
        />
      </div>

      {/* MY CLASSES GRID */}
      <div>
        <h2 style={{ color: COLORS.NAVY }} className="text-lg font-bold mb-4">
          Class Assignments
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { name: "JHS 2A - Mathematics", students: 35, avgGrade: 78, color: COLORS.BLUE },
            { name: "JHS 2B - Mathematics", students: 32, avgGrade: 82, color: COLORS.GREEN },
            { name: "SHS 1A - Physics", students: 28, avgGrade: 75, color: COLORS.AMBER },
            { name: "SHS 1B - Physics", students: 25, avgGrade: 79, color: COLORS.PURPLE },
          ].map((cls, i) => (
            <div
              key={i}
              onClick={() => navigate(`/dashboard/classes/${cls.name}`)}
              className="p-4 sm:p-6 rounded-xl border bg-white cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: `${cls.color}20` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ background: `${cls.color}15`, color: cls.color }}
                >
                  <BookOpen size={24} />
                </div>
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: `${cls.color}15`,
                    color: cls.color,
                  }}
                >
                  {cls.students} students
                </span>
              </div>
              <h3 style={{ color: COLORS.NAVY }} className="font-bold mb-3">
                {cls.name}
              </h3>
              <div className="flex items-center gap-4">
                <div>
                  <div style={{ color: COLORS.MUTED }} className="text-xs mb-1">
                    Class Average
                  </div>
                  <div style={{ color: cls.color }} className="text-2xl font-bold">
                    {cls.avgGrade}%
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full" style={{ background: "#E5E7EB" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${cls.avgGrade}%`,
                        background: cls.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h2 style={{ color: COLORS.NAVY }} className="text-lg font-bold mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Clock,
              title: "Mark Attendance",
              desc: "Record present/absent for today",
              action: () => navigate("/dashboard/attendance"),
            },
            {
              icon: BarChart3,
              title: "Enter Grades",
              desc: "Update student assessment scores",
              action: () => navigate("/dashboard/grades"),
            },
            {
              icon: Zap,
              title: "Send Message",
              desc: "Notify parents via WhatsApp",
              action: () => navigate("/dashboard/communication"),
            },
          ].map((action, i) => (
            <div
              key={i}
              onClick={action.action}
              className="p-4 sm:p-6 rounded-xl border bg-white cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
              style={{ borderColor: `${COLORS.BLUE}20` }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${COLORS.BLUE}15`, color: COLORS.BLUE }}
              >
                <action.icon size={24} />
              </div>
              <div style={{ color: COLORS.NAVY }} className="font-bold">
                {action.title}
              </div>
              <div style={{ color: COLORS.MUTED }} className="text-sm mt-1">
                {action.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* UPCOMING EXAMS */}
      {data.upcomingExams > 0 && (
        <div className="p-4 sm:p-6 rounded-xl border bg-white">
          <h3 style={{ color: COLORS.NAVY }} className="font-bold mb-4">
            Upcoming Exams
          </h3>
          <div className="space-y-3">
            {[
              { subject: "Mathematics", class: "JHS 2", date: "May 28", time: "9:00 AM" },
              { subject: "Physics", class: "SHS 1", date: "June 1", time: "2:00 PM" },
            ].map((exam, i) => (
              <div
                key={i}
                className="p-4 rounded-lg flex items-center justify-between"
                style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
              >
                <div>
                  <div style={{ color: COLORS.NAVY }} className="font-bold">
                    {exam.subject}
                  </div>
                  <div style={{ color: COLORS.MUTED }} className="text-sm">
                    {exam.class} · {exam.date} at {exam.time}
                  </div>
                </div>
                <Calendar size={20} style={{ color: COLORS.AMBER }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
