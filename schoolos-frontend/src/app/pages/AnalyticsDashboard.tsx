import { useState, useEffect, useCallback } from "react";
import {
  Loader2, X, AlertCircle, Check, TrendingUp, Users,
  AlertTriangle, BookOpen, School, Star,
  ArrowUp, ArrowDown, ShieldAlert,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { api } from "../services/api";

const NAVY = "#0A2472";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type AttendanceTrend = { date: string; present: number; total: number; rate: number };
type PerfTrend = { assessment_id: string; name: string; date: string; max_score: number; average: number; studentCount: number; rate: number };
type SubjectComp = { subject_id: string; subject_name: string; totalScore: number; totalMax: number; count: number; average: number; rate: number };
type ClassComp = { class_id: string; class_name: string; average: number; rate: number; studentCount: number };
type RiskAlert = { type: "attendance" | "performance"; severity: "high" | "medium"; student_id: string; student: { name: string; class_name: string; admission_no?: string } | null; metric: number; message: string };
type InterventionItem = { id: string; type: string; severity: string; status: string; notes?: string; student: { name: string; class_name: string } | null; assigned: { full_name?: string } | null; created_at: string };
type ReportCard = { id: string; student_id: string; average: number; grade: string; rank: number; student?: { name: string; admission_no?: string }; class?: { name: string } };
type TermOption = { id: string; name: string; is_current?: boolean };

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#14B8A6", "#F97316"];

function AlertBanner({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) {
  const bg = type === "error" ? "#FEF2F2" : "#D1FAE5";
  const color = type === "error" ? "#EF4444" : "#065F46";
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: bg, color, border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}`, fontSize: "0.9rem" }}>
      {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-auto"><X size={14} /></button>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, trend, color }: {
  icon: any; label: string; value: string | number; sub?: string; trend?: "up" | "down"; color?: string;
}) {
  return (
    <div className="p-5 rounded-2xl relative overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10" style={{ background: color || NAVY }} />
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color || NAVY}15` }}>
          <Icon size={18} color={color || NAVY} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>{label}</p>
          <p className="text-2xl font-bold" style={{ color: NAVY }}>{value}</p>
        </div>
      </div>
      {sub && (
        <div className="flex items-center gap-1 text-xs" style={{ color: trend === "up" ? "#065F46" : trend === "down" ? "#EF4444" : MUTED }}>
          {trend === "up" && <ArrowUp size={12} />}
          {trend === "down" && <ArrowDown size={12} />}
          {sub}
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, subtitle, children, action }: {
  title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: NAVY }}>{title}</h3>
          {subtitle && <p className="text-xs" style={{ color: MUTED }}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function LoadingSpinner({ height = 48 }: { height?: number }) {
  return <div className="flex items-center justify-center" style={{ height }}><Loader2 className="animate-spin" size={24} color={NAVY} /></div>;
}

function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="text-center py-10 rounded-2xl" style={{ background: "rgba(10,36,114,0.03)", border: "1px dashed rgba(10,36,114,0.1)" }}>
      <Icon size={36} color={MUTED} className="mx-auto mb-2" />
      <p className="font-semibold text-sm" style={{ color: NAVY }}>{title}</p>
      <p className="text-xs mt-1" style={{ color: MUTED }}>{desc}</p>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    high: { bg: "#FEF2F2", color: "#EF4444" },
    medium: { bg: "#FEF3C7", color: "#B45309" },
    low: { bg: "#D1FAE5", color: "#065F46" },
  };
  const s = map[severity] || map.medium;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>{severity}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    open: { bg: "#FEF3C7", color: "#B45309" },
    in_progress: { bg: "#EEF2FF", color: "#3730A3" },
    resolved: { bg: "#D1FAE5", color: "#065F46" },
  };
  const s = map[status] || map.open;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.color }}>{status.replace("_", " ")}</span>;
}

export function AnalyticsDashboard() {
  const [error, setError] = useState("");
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [selectedTermId, setSelectedTermId] = useState("");
  const [attTrend, setAttTrend] = useState<AttendanceTrend[]>([]);
  const [perfTrend, setPerfTrend] = useState<PerfTrend[]>([]);
  const [subjectComp, setSubjectComp] = useState<SubjectComp[]>([]);
  const [classComp, setClassComp] = useState<ClassComp[]>([]);
  const [riskData, setRiskData] = useState<{ alerts: RiskAlert[]; openInterventions: InterventionItem[] } | null>(null);
  const [performers, setPerformers] = useState<{ top: ReportCard[]; bottom: ReportCard[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>("/api/school/terms")
      .then(res => {
        const list = res.data?.data?.terms || res.data?.terms || [];
        setTerms(list);
        const current = list.find((t: TermOption) => t.is_current);
        if (current) setSelectedTermId(current.id);
        else if (list.length > 0) setSelectedTermId(list[0].id);
      })
      .catch(() => {});
  }, []);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [attRes, perfRes, subRes, clsRes, riskRes, topRes] = await Promise.all([
        api.get<any>("/api/school/analytics/attendance-trend?days=30"),
        selectedTermId ? api.get<any>(`/api/school/analytics/performance-trend?term_id=${selectedTermId}`) : Promise.resolve({ data: { data: [] } }),
        selectedTermId ? api.get<any>(`/api/school/analytics/subject-comparison?term_id=${selectedTermId}`) : Promise.resolve({ data: { data: [] } }),
        selectedTermId ? api.get<any>(`/api/school/analytics/class-comparison?term_id=${selectedTermId}`) : Promise.resolve({ data: { data: [] } }),
        api.get<any>("/api/school/analytics/risk-alerts"),
        selectedTermId ? api.get<any>(`/api/school/analytics/top-bottom?term_id=${selectedTermId}&limit=5`) : Promise.resolve({ data: { data: { top: [], bottom: [] } } }),
      ]);

      setAttTrend(attRes.data?.data || []);
      setPerfTrend(perfRes.data?.data || []);
      setSubjectComp(subRes.data?.data || []);
      setClassComp(clsRes.data?.data || []);
      setRiskData(riskRes.data?.data || null);
      setPerformers(topRes.data?.data || null);
    } catch { setError("Failed to load analytics"); } finally { setLoading(false); }
  }, [selectedTermId]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  const avgAttendance = attTrend.length > 0
    ? Number((attTrend.reduce((s, d) => s + d.rate, 0) / attTrend.length).toFixed(1))
    : 0;
  const avgPerformance = perfTrend.length > 0
    ? Number((perfTrend.reduce((s, d) => s + d.rate, 0) / perfTrend.length).toFixed(1))
    : 0;
  const alertCount = riskData?.alerts?.length || 0;
  const interventionCount = riskData?.openInterventions?.length || 0;
  const totalStudents = (classComp.length > 0 ? classComp.reduce((s, c) => s + c.studentCount, 0) : attTrend.length > 0
    ? Math.max(...attTrend.map(d => d.total)) : 0);

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: NAVY }}>Academic Analytics</h2>
          <p className="text-sm" style={{ color: MUTED }}>Attendance trends, performance metrics, and risk insights</p>
        </div>
        <select value={selectedTermId} onChange={(e) => setSelectedTermId(e.target.value)}
          className="px-4 py-2.5 rounded-xl outline-none text-sm w-full sm:w-auto"
          style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
          {terms.map(t => <option key={t.id} value={t.id}>{t.name}{t.is_current ? " (Current)" : ""}</option>)}
        </select>
      </div>

      {loading ? (
        <LoadingSpinner height={400} />
      ) : (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard icon={TrendingUp} label="Avg Attendance (30d)" value={`${avgAttendance}%`}
              sub={`${attTrend.length} days tracked`} color="#10B981" />
            <MetricCard icon={Star} label="Avg Performance" value={perfTrend.length > 0 ? `${avgPerformance}%` : "—"}
              sub={perfTrend.length > 0 ? `${perfTrend.length} assessments` : "No data yet"} color="#6366F1" />
            <MetricCard icon={ShieldAlert} label="Risk Alerts" value={alertCount}
              sub={`${riskData?.alerts.filter(a => a.severity === "high").length || 0} high severity`}
              color={alertCount > 0 ? "#EF4444" : "#10B981"} trend={alertCount > 0 ? "down" : "up"} />
            <MetricCard icon={Users} label="Students Tracked" value={totalStudents || "—"}
              sub={riskData ? `${interventionCount} open intervention(s)` : "No data"}
              color="#F59E0B" />
          </div>

          {/* Attendance Trend Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Attendance Trend" subtitle={`Last 30 days · ${avgAttendance}% average`}>
              {attTrend.length === 0 ? <EmptyState icon={TrendingUp} title="No attendance data" desc="Mark attendance to see trends" /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={attTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.06)" />
                    <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      tick={{ fontSize: 10, fill: MUTED }} interval="preserveStartEnd" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: MUTED }} unit="%" />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(10,36,114,0.15)" }}
                      labelFormatter={(d) => new Date(d).toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}
                      formatter={(value: number) => [`${value}%`, "Attendance"]} />
                    <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2.5} dot={false}
                      activeDot={{ r: 4, fill: "#10B981", stroke: "white", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Performance Trend Chart */}
            <ChartCard title="Performance Trend" subtitle={perfTrend.length > 0 ? `${perfTrend.length} assessment(s) this term` : "No assessments yet"}>
              {perfTrend.length === 0 ? <EmptyState icon={Star} title="No performance data" desc="Create assessments and enter scores" /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={perfTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.06)" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: MUTED }} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: MUTED }} unit="%" />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(10,36,114,0.15)" }}
                      formatter={(value: number) => [`${value}%`, "Avg Score"]} />
                    <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                      {perfTrend.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Subject & Class Comparison */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Subject Comparison" subtitle={subjectComp.length > 0 ? `${subjectComp.length} subject(s)` : "No subject data"}>
              {subjectComp.length === 0 ? <EmptyState icon={BookOpen} title="No subject data" desc="Link subjects to classes and enter scores" /> : (
                <div className="space-y-2">
                  {subjectComp.map((s, i) => (
                    <div key={s.subject_id} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-24 truncate shrink-0" style={{ color: NAVY }}>{s.subject_name}</span>
                      <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(10,36,114,0.06)" }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(s.rate, 100)}%`, background: COLORS[i % COLORS.length] }} />
                      </div>
                      <span className="text-xs font-medium w-12 text-right shrink-0" style={{ color: MUTED }}>{s.rate}%</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>

            <ChartCard title="Class Comparison" subtitle={classComp.length > 0 ? `${classComp.length} class(es)` : "No class data"}>
              {classComp.length === 0 ? <EmptyState icon={School} title="No class data" desc="Assign students to classes and enter scores" /> : (
                <ResponsiveContainer width="100%" height={Math.max(180, classComp.length * 40)}>
                  <BarChart data={classComp} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.06)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: MUTED }} unit="%" />
                    <YAxis type="category" dataKey="class_name" tick={{ fontSize: 11, fill: NAVY }} width={80} />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(10,36,114,0.15)" }}
                      formatter={(value: number) => [`${value}%`, "Avg Score"]} />
                    <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                      {classComp.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* Risk Alerts */}
          <ChartCard title="Risk Alerts & Interventions"
            subtitle={riskData ? `${alertCount} alert(s) · ${interventionCount} open intervention(s)` : "Loading..."}>
            {!riskData || (riskData.alerts.length === 0 && riskData.openInterventions.length === 0) ? (
              <EmptyState icon={ShieldAlert} title="No alerts" desc="All students are performing well" />
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <div>
                  <h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: MUTED }}>
                    <AlertTriangle size={12} className="inline mr-1" /> Risk Alerts ({riskData.alerts.length})
                  </h4>
                  {riskData.alerts.length === 0 ? (
                    <p className="text-xs" style={{ color: MUTED }}>No risk alerts</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {riskData.alerts.slice(0, 10).map((a, i) => (
                        <div key={i} className="p-3 rounded-xl text-sm" style={{
                          background: a.severity === "high" ? "#FEF2F2" : "#FEF3C7",
                          border: `1px solid ${a.severity === "high" ? "#FECACA" : "#FDE68A"}`,
                        }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium" style={{ color: a.severity === "high" ? "#991B1B" : "#B45309" }}>
                              {a.student?.name || "Unknown"}
                            </span>
                            <SeverityBadge severity={a.severity} />
                          </div>
                          <p className="text-xs" style={{ color: a.severity === "high" ? "#EF4444" : "#B45309" }}>
                            {a.student?.class_name && `${a.student.class_name} · `}{a.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider mb-2" style={{ color: MUTED }}>
                    <AlertCircle size={12} className="inline mr-1" /> Open Interventions ({riskData.openInterventions.length})
                  </h4>
                  {riskData.openInterventions.length === 0 ? (
                    <p className="text-xs" style={{ color: MUTED }}>No open interventions</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {riskData.openInterventions.slice(0, 10).map(i => (
                        <div key={i.id} className="p-3 rounded-xl text-sm" style={{ background: CREAM, border: "1px solid rgba(10,36,114,0.07)" }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-xs" style={{ color: NAVY }}>{i.student?.name || "Unknown"}</span>
                            <div className="flex gap-1">
                              <SeverityBadge severity={i.severity} />
                              <StatusBadge status={i.status} />
                            </div>
                          </div>
                          <p className="text-xs" style={{ color: MUTED }}>
                            {i.type}{i.assigned?.full_name ? ` · Assigned: ${i.assigned.full_name}` : ""}
                          </p>
                          {i.notes && <p className="text-xs mt-1" style={{ color: MUTED }}>{i.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </ChartCard>

          {/* Top & Bottom Performers */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Top Performers" subtitle={performers?.top?.length ? "Highest average scores" : "No published report cards"}>
              {!performers || performers.top.length === 0 ? (
                <EmptyState icon={ArrowUp} title="No performers" desc="Generate and publish report cards" />
              ) : (
                <div className="space-y-2">
                  {performers.top.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.06)" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#CD7F32" : "#10B981" }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: NAVY }}>{p.student?.name || "Unknown"}</p>
                        <p className="text-xs" style={{ color: MUTED }}>{p.class?.name} · Grade {p.grade}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: "#065F46" }}>{p.average}%</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>

            <ChartCard title="Needs Improvement" subtitle={performers?.bottom?.length ? "Lowest average scores" : "No published report cards"}>
              {!performers || performers.bottom.length === 0 ? (
                <EmptyState icon={ArrowDown} title="No data" desc="Generate and publish report cards" />
              ) : (
                <div className="space-y-2">
                  {performers.bottom.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)" }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "#EF4444" }}>
                        {performers.bottom.length - i}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: NAVY }}>{p.student?.name || "Unknown"}</p>
                        <p className="text-xs" style={{ color: MUTED }}>{p.class?.name} · Grade {p.grade}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: "#EF4444" }}>{p.average}%</span>
                    </div>
                  ))}
                </div>
              )}
            </ChartCard>
          </div>
        </div>
      )}
    </div>
  );
}
