import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  CalendarCheck, Wallet, MessageSquare, ClipboardCheck,
  ArrowRight, Loader2, AlertTriangle, TrendingUp, TrendingDown,
} from "lucide-react";
import { api } from "../../services/api";
import { PerformanceChart } from "./components/PerformanceChart";
import { QuickActions } from "./components/QuickActions";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  attendanceRate: number | string;
  teachingStaff: number;
}

interface FinanceSummary {
  totalBilled: number;
  totalPaid: number;
  totalCollected: number;
  totalOutstanding: number;
  overdueCount: number;
}

interface SmsBalance {
  balance: number;
  low_balance_threshold: number;
}

interface PendingAssessment {
  id: string;
  status: string;
}

interface TermInfo {
  id: string;
  name: string;
  is_current: boolean;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  color,
  loading,
}: {
  icon: typeof CalendarCheck;
  label: string;
  value: string;
  sub?: string;
  trend?: { direction: "up" | "down"; text: string };
  color: string;
  loading?: boolean;
}) {
  return (
    <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={20} color={color} />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-7 w-24 rounded animate-pulse" style={{ background: `${PLUM}08` }} />
          <div className="h-3 w-32 rounded animate-pulse" style={{ background: `${PLUM}05` }} />
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}

export function AdminOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [smsBalance, setSmsBalance] = useState<SmsBalance | null>(null);
  const [pendingAssessments, setPendingAssessments] = useState<PendingAssessment[]>([]);
  const [currentTerm, setCurrentTerm] = useState<TermInfo | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, finRes, termsRes, smsRes, assessRes] = await Promise.all([
          api.get<DashboardStats>("/api/school/dashboard"),
          api.get<FinanceSummary>("/api/school/finance/summary"),
          api.get<{ terms: TermInfo[] }>("/api/school/terms"),
          api.get<SmsBalance>("/api/school/settings/kv/sms_balance").catch(() => null),
          api.get<{ types: any[] }>("/api/school/assessment-types").catch(() => null),
        ]);

        if (dashRes.data) setStats(dashRes.data);
        if (finRes.data) setFinance(finRes.data);

        const terms = termsRes.data?.terms || [];
        const current = terms.find((t) => t.is_current);
        if (current) setCurrentTerm(current);

        if (smsRes?.data) {
          const bal = smsRes.data;
          setSmsBalance(typeof bal === "number" ? { balance: bal, low_balance_threshold: 100 } : bal);
        }

        if (assessRes?.data) {
          const types = assessRes.data?.types || [];
          setPendingAssessments(
            types.filter((t: any) => t.status === "pending" || t.is_active === false)
          );
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const attendanceRate = stats?.attendanceRate ?? 0;
  const totalCollected = finance?.totalCollected ?? 0;
  const totalBilled = finance?.totalBilled ?? 0;
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
  const smsBal = smsBalance?.balance ?? 0;
  const lowThreshold = smsBalance?.low_balance_threshold ?? 100;
  const isLowBalance = smsBal < lowThreshold;
  const pendingCount = pendingAssessments.length;

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex items-start justify-between">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontSize: "1.35rem", fontWeight: 700 }}>
            School Overview
          </h1>
          <p style={{ color: MUTED, fontSize: "0.82rem" }}>
            {currentTerm
              ? `${currentTerm.name} · ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`
              : "Welcome to the new term"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={CalendarCheck}
          label="Today's Attendance"
          value={loading ? "—" : `${attendanceRate}%`}
          trend={!loading ? { direction: Number(attendanceRate) >= 75 ? "up" : "down", text: `${stats?.totalStudents ?? 0} students` } : undefined}
          color="#6366F1"
          loading={loading}
        />
        <MetricCard
          icon={Wallet}
          label="Term Fees Recovered"
          value={loading ? "—" : `GH₵ ${(totalCollected / 100).toLocaleString()}`}
          sub={!loading ? `${collectionRate}% collection rate` : undefined}
          color="#10B981"
          loading={loading}
        />
        <MetricCard
          icon={MessageSquare}
          label="Arkesel SMS Balance"
          value={loading ? "—" : smsBal.toLocaleString()}
          sub={!loading ? (isLowBalance ? "Low balance — top up soon" : "Sufficient credits") : undefined}
          color={isLowBalance ? "#EF4444" : "#25D366"}
          loading={loading}
        />
        <MetricCard
          icon={ClipboardCheck}
          label="Pending Assessments"
          value={loading ? "—" : String(pendingCount)}
          sub={!loading ? "NaCCA SBA tracker" : undefined}
          color={pendingCount > 0 ? "#F59E0B" : PLUM_LIGHT}
          loading={loading}
        />
      </div>

      <PerformanceChart />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>

        <div className="p-6 rounded-[24px] flex flex-col" style={{ background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`, boxShadow: "0 8px 32px rgba(56,25,50,0.2)" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: MILK, fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>
            {stats?.totalStudents ? "School at a Glance" : "Welcome!"}
          </h3>
          <p style={{ color: "rgba(255,243,230,0.7)", fontSize: "0.8rem", lineHeight: 1.5, marginBottom: "1rem" }}>
            {stats?.totalStudents
              ? `${stats.totalStudents} learners · ${stats.totalStaff ?? 0} staff members · ${collectionRate}% fee collection rate`
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
      </div>
    </div>
  );
}
