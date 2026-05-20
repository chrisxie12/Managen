import { useState } from "react";
import { useNavigate } from "react-router";
import {
  CalendarCheck, Wallet, MessageSquare, ClipboardCheck,
  ArrowRight, TrendingUp, TrendingDown, GripVertical, EyeOff,
} from "lucide-react";
import { useDashboardStats } from "../../hooks/useDashboardStats";
import { useAuth } from "../../contexts/AuthContext";
import { useRealtime } from "../../hooks/useRealtime";
import { PerformanceChart } from "./components/PerformanceChart";
import { QuickActions } from "./components/QuickActions";
import { LiveIndicator } from "../../components/ui/LiveIndicator";
import { useUserPreferences } from "../../contexts/UserPreferencesContext";
import { SkeletonLoader } from "../../components/ui/SkeletonLoader";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color,
  onClick,
}: {
  icon: typeof CalendarCheck;
  label: string;
  value: string;
  sub?: string;
  trend?: { direction: "up" | "down"; text: string };
  color: string;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      onClick={onClick}
      className={`p-5 rounded-[24px] ${onClick ? "cursor-pointer active:scale-[0.98] transition-all" : ""}`}
      style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.25rem" }}>
        {value}
      </div>
      <div style={{ color: MUTED, fontSize: "0.75rem", marginBottom: trend ? "0.3rem" : 0 }}>{label}</div>
      {trend && (
        <div className="flex items-center gap-1 mt-1" style={{ color: trend.direction === "up" ? "#10B981" : "#EF4444", fontSize: "0.72rem" }}>
          {trend.direction === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trend.text}
        </div>
      )}
      {sub && (
        <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
          style={{ background: `${color}12`, color }}>
          {sub}
        </div>
      )}
    </Wrapper>
  );
}

export function AdminOverview() {
  const navigate = useNavigate();
  const { user, school } = useAuth();
  const { preferences, updateDashboardWidgets } = useUserPreferences();
  const { data: dash, isLoading } = useDashboardStats();
  const [editMode, setEditMode] = useState(false);
  const { connected } = useRealtime({ schoolId: school?.id || school?.slug || "", userId: user?.id || "" });

  const widgets = preferences.dashboardLayout.widgets;

  const attendanceRate = dash?.stats?.attendanceRate ?? 0;
  const totalCollected = dash?.finance?.totalCollected ?? 0;
  const totalBilled = dash?.finance?.totalBilled ?? 0;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  const smsBal = dash?.smsBalance?.balance ?? 0;
  const lowThreshold = dash?.smsBalance?.low_balance_threshold ?? 100;
  const isLowBalance = smsBal < lowThreshold;
  const pendingCount = dash?.pendingCount ?? 0;

  const toggleWidget = (widgetId: string) => {
    updateDashboardWidgets(
      widgets.map((w) => (w.id === widgetId ? { ...w, visible: !w.visible } : w)),
    );
  };

  const visibleWidgets = widgets.filter((w) => w.visible);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontSize: "1.35rem", fontWeight: 700 }}>
              School Overview
            </h1>
            <LiveIndicator connected={connected} />
          </div>
          <p style={{ color: MUTED, fontSize: "0.82rem" }}>
            {dash?.currentTerm
              ? `${dash.currentTerm.name} · ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
              : "Welcome to the new term"}
          </p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: editMode ? PLUM : "white",
            color: editMode ? MILK : MUTED,
            border: editMode ? "none" : "1px solid rgba(56,25,50,0.1)",
          }}
        >
          {editMode ? "Done" : "Customize"}
        </button>
      </div>

      {editMode && (
        <div className="p-4 rounded-xl flex flex-wrap gap-2" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          {widgets.map((w) => (
            <button
              key={w.id}
              onClick={() => toggleWidget(w.id)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: w.visible ? `${PLUM}12` : "transparent",
                color: PLUM,
                border: `1px solid ${w.visible ? `${PLUM}30` : "rgba(56,25,50,0.1)"}`,
                opacity: w.visible ? 1 : 0.5,
              }}
            >
              {w.visible ? <EyeOff size={12} /> : <GripVertical size={12} />}
              {w.id.charAt(0).toUpperCase() + w.id.slice(1).replace("-", " ")}
            </button>
          ))}
        </div>
      )}

      {visibleWidgets.find((w) => w.id === "metrics") && (
        <>
          {isLoading ? (
            <SkeletonLoader variant="metric" count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={CalendarCheck}
                label="Today's Attendance"
                value={`${attendanceRate}%`}
                trend={{ direction: Number(attendanceRate) >= 75 ? "up" : "down", text: `${dash?.stats?.totalStudents ?? 0} students` }}
                color="#6366F1"
                onClick={() => navigate("/dashboard/attendance")}
              />
              <MetricCard
                icon={Wallet}
                label="Term Fees Recovered"
                value={`GH₵ ${(totalCollected / 100).toLocaleString()}`}
                sub={`${collectionRate}% collection rate`}
                color="#10B981"
                onClick={() => navigate("/dashboard/fees")}
              />
              <MetricCard
                icon={MessageSquare}
                label="Arkesel SMS Balance"
                value={smsBal.toLocaleString()}
                sub={isLowBalance ? "Low balance — top up soon" : "Sufficient credits"}
                color={isLowBalance ? "#EF4444" : "#25D366"}
              />
              <MetricCard
                icon={ClipboardCheck}
                label="Pending Assessments"
                value={String(pendingCount)}
                sub="NaCCA SBA tracker"
                color={pendingCount > 0 ? "#F59E0B" : PLUM_LIGHT}
                onClick={() => navigate("/dashboard/assessments")}
              />
            </div>
          )}
        </>
      )}

      {visibleWidgets.find((w) => w.id === "chart") && (
        isLoading ? <SkeletonLoader variant="chart" /> : <PerformanceChart />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {visibleWidgets.find((w) => w.id === "quick-actions") && (
          <div className="lg:col-span-2">
            {isLoading ? <SkeletonLoader variant="card" count={1} /> : <QuickActions />}
          </div>
        )}

        {visibleWidgets.find((w) => w.id === "school-glance") && (
          <div className="p-6 rounded-[24px] flex flex-col" style={{ background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`, boxShadow: "0 8px 32px rgba(56,25,50,0.2)" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: MILK, fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>
              {dash?.stats?.totalStudents ? "School at a Glance" : "Welcome!"}
            </h3>
            <p style={{ color: "rgba(255,243,230,0.7)", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "1rem" }}>
              {dash?.stats?.totalStudents
                ? `${dash.stats.totalStudents} learners · ${dash.stats.totalStaff ?? 0} staff members · ${collectionRate}% fee collection rate`
                : "Start by adding learners and configuring your school profile."}
            </p>
            <div className="space-y-2 mt-auto">
              {[
                { label: "Manage Learners", path: "/dashboard/students" },
                { label: "View Reports", path: "/dashboard/reports" },
              ].map((item) => (
                <button key={item.label} onClick={() => navigate(item.path)}
                  className="w-full py-2.5 rounded-full text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                  style={{ background: "rgba(255,243,230,0.12)", color: MILK, border: "1px solid rgba(255,243,230,0.2)" }}>
                  {item.label} <ArrowRight size={11} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
