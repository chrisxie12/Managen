import { useState, useEffect, useCallback } from "react";
import {
  Loader2, X, AlertCircle, Check, Download, Calendar, Users,
  TrendingUp, BookOpen, School, DollarSign, Receipt, UserPlus,
  AlertTriangle, Activity, BarChart3,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const COLORS = ["#6366F1", "#16A34A", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#14B8A6", "#F97316"];

// ─── Shared Types ───────────────────────────────────────────────
type ClassOption = { id: string; name: string };
type TermOption = { id: string; name: string; is_current?: boolean };


const statusStyles: Record<string, string> = {
  Present: "bg-green-100 text-green-700", Absent: "bg-red-100 text-red-700",
  Late: "bg-yellow-100 text-yellow-700", Excused: "bg-blue-100 text-blue-700",
  "Half-day": "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700", failed: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700", refunded: "bg-purple-100 text-purple-700",
  paid: "bg-green-100 text-green-700", issued: "bg-blue-100 text-blue-700",
  draft: "bg-gray-100 text-gray-600", overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  open: "bg-yellow-100 text-yellow-700", in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  active: "bg-green-100 text-green-700", inactive: "bg-gray-100 text-gray-500",
};

const StatusBadge = ({ status }: { status: string }) => (
  <Badge className={statusStyles[status] || "bg-gray-100 text-gray-600"} variant="outline">
    {status.replace(/_/g, " ")}
  </Badge>
);

const AlertBanner = ({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) => {
  const bg = type === "error" ? "#FEF2F2" : "#D1FAE5";
  const color = type === "error" ? "#EF4444" : "#065F46";
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: bg, color, border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}`, fontSize: "0.9rem" }}>
      {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-auto"><X size={14} /></button>
    </div>
  );
};

const LoadingSpinner = ({ height = 48 }: { height?: number }) => (
  <div className="flex items-center justify-center" style={{ height }}><Loader2 className="animate-spin" size={24} color={NAVY} /></div>
);

const EmptyState = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="text-center py-10 rounded-2xl" style={{ background: "rgba(10,36,114,0.03)", border: "1px dashed rgba(10,36,114,0.1)" }}>
    <Icon size={36} color={MUTED} className="mx-auto mb-2" />
    <p className="font-semibold text-sm" style={{ color: NAVY }}>{title}</p>
    <p className="text-xs mt-1" style={{ color: MUTED }}>{desc}</p>
  </div>
);

const MetricCard = ({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color?: string;
}) => (
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
    {sub && <p className="text-xs" style={{ color: MUTED }}>{sub}</p>}
  </div>
);

const ChartCard = ({ title, subtitle, children }: {
  title: string; subtitle?: string; children: React.ReactNode;
}) => (
  <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
    <div className="mb-4">
      <h3 className="font-semibold text-sm" style={{ color: NAVY }}>{title}</h3>
      {subtitle && <p className="text-xs" style={{ color: MUTED }}>{subtitle}</p>}
    </div>
    {children}
  </div>
);

type FilterBarProps = {
  dateFrom: string; setDateFrom: (v: string) => void;
  dateTo: string; setDateTo: (v: string) => void;
  children?: React.ReactNode;
  onExport?: () => void;
  exportLabel?: string;
};

function FilterBar({ dateFrom, setDateFrom, dateTo, setDateTo, children, onExport, exportLabel }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <Calendar size={14} color={MUTED} />
      <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
        className="w-[140px] h-9 text-xs" />
      <span className="text-xs" style={{ color: MUTED }}>to</span>
      <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
        className="w-[140px] h-9 text-xs" />
      {children}
      <div className="ml-auto" />
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport}
          className="rounded-full text-xs h-9" style={{ borderColor: "rgba(10,36,114,0.15)", color: NAVY }}>
          <Download size={13} className="mr-1" /> {exportLabel || "Export CSV"}
        </Button>
      )}
    </div>
  );
}

const formatCedi = (amount: number) =>
  `GHS ${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ─── 1. Attendance Tab ──────────────────────────────────────────
function AttendanceTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classes, setClasses] = useState<ClassOption[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      if (classFilter) params.set("class_name", classFilter);
      if (statusFilter) params.set("status", statusFilter);
      const [res, clsRes] = await Promise.all([
        api.get<any>(`/api/school/reports/attendance?${params}`),
        api.get<{ classes: ClassOption[] }>("/api/school/classes"),
      ]);
      setData(res.data);
      setClasses(clsRes.data?.classes || []);
    } catch { setError("Failed to load attendance report"); }
    finally { setLoading(false); }
  }, [dateFrom, dateTo, classFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner height={300} />;
  const s = data?.summary;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <FilterBar dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onExport={() => window.open(`/api/school/reports/export?type=attendance&date_from=${dateFrom}&date_to=${dateTo}`, "_blank")}>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All status</SelectItem>
            {["Present", "Absent", "Late", "Excused", "Half-day"].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      {!s || s.total === 0 ? (
        <EmptyState icon={Calendar} title="No attendance records" desc="Mark attendance to generate reports" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard icon={Calendar} label="Total Records" value={s.total} sub={`${data.totalRecords} total in range`} color="#6366F1" />
            <MetricCard icon={Check} label="Present" value={s.present} sub={`${s.presentRate}% rate`} color="#16A34A" />
            <MetricCard icon={AlertCircle} label="Absent" value={s.absent} sub={s.total > 0 ? `${((s.absent / s.total) * 100).toFixed(1)}%` : "0%"} color="#EF4444" />
            <MetricCard icon={AlertTriangle} label="Late" value={s.late} sub={s.excused > 0 ? `${s.excused} excused` : "No excused"} color="#F59E0B" />
          </div>

          <ChartCard title="Attendance Records" subtitle={`${data.records.length} record(s) shown`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell style={{ color: MUTED, fontSize: 12 }}>{r.date}</TableCell>
                    <TableCell style={{ color: NAVY, fontSize: 13 }}>{r.student?.name || "—"}</TableCell>
                    <TableCell style={{ color: MUTED, fontSize: 12 }}>{r.class_name}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </>
      )}
    </div>
  );
}

// ─── 2. Staff Attendance Tab ────────────────────────────────────
function StaffAttendanceTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      if (statusFilter) params.set("status", statusFilter);
      const res = await api.get<any>(`/api/school/reports/staff-attendance?${params}`);
      setData(res.data);
    } catch { setError("Failed to load staff attendance"); }
    finally { setLoading(false); }
  }, [dateFrom, dateTo, statusFilter]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner height={300} />;
  const s = data?.summary;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <FilterBar dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onExport={() => window.open(`/api/school/reports/export?type=staff-attendance&date_from=${dateFrom}&date_to=${dateTo}`, "_blank")}>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {["Present", "Absent", "Late", "Excused", "Half-day"].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      {!s || s.total === 0 ? (
        <EmptyState icon={Users} title="No staff attendance records" desc="Mark staff attendance to generate reports" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard icon={Users} label="Staff Tracked" value={s.uniqueStaff} sub={`${s.total} record(s)`} color="#6366F1" />
            <MetricCard icon={Check} label="Present" value={s.present} sub={`${s.presentRate}% rate`} color="#16A34A" />
            <MetricCard icon={AlertCircle} label="Absent" value={s.absent} color="#EF4444" />
            <MetricCard icon={AlertTriangle} label="Late" value={s.late} color="#F59E0B" />
          </div>
          <ChartCard title="Staff Attendance Records">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.date}</TableCell>
                    <TableCell style={{ color: NAVY, fontSize: 13 }}>{r.user?.name}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.user?.email}</TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.check_in || "—"}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.check_out || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </>
      )}
    </div>
  );
}

// ─── 3. Academic Performance Tab ────────────────────────────────
function AcademicPerformanceTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [termFilter, setTermFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (termFilter) params.set("term_id", termFilter);
      if (classFilter) params.set("class_id", classFilter);
      const [res, termRes, clsRes] = await Promise.all([
        api.get<any>(`/api/school/reports/academic-performance?${params}`),
        api.get<{ terms: TermOption[] }>("/api/school/terms"),
        api.get<{ classes: ClassOption[] }>("/api/school/classes"),
      ]);
      setData(res.data);
      setTerms(termRes.data?.terms || []);
      setClasses(clsRes.data?.classes || []);
      if (!termFilter) {
        const current = (termRes.data?.terms || []).find((t: TermOption) => t.is_current);
        if (current) setTermFilter(current.id);
      }
    } catch { setError("Failed to load performance report"); }
    finally { setLoading(false); }
  }, [termFilter, classFilter]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner height={300} />;
  const s = data?.summary;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <Select value={termFilter} onValueChange={setTermFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Select term" /></SelectTrigger>
          <SelectContent>
            {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!s || s.totalAssessments === 0 ? (
        <EmptyState icon={BookOpen} title="No performance data" desc="Create assessments and enter scores" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard icon={BookOpen} label="Assessments" value={s.totalAssessments} color="#6366F1" />
            <MetricCard icon={TrendingUp} label="Avg Score" value={`${s.avgScore}%`} color="#16A34A" />
            <MetricCard icon={Users} label="Students Assessed" value={s.totalStudents} color="#3B82F6" />
            <MetricCard icon={Check} label="Pass Rate" value={`${s.passRate}%`} color={Number(s.passRate) >= 50 ? "#16A34A" : "#EF4444"} />
          </div>

          {data.subjectBreakdown?.length > 0 && (
            <ChartCard title="Subject Performance" subtitle="Average score by subject">
              <div className="space-y-2 mb-6">
                {data.subjectBreakdown.map((sb: any, i: number) => (
                  <div key={sb.subject_id} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-24 truncate shrink-0" style={{ color: NAVY }}>{sb.subject_name}</span>
                    <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(10,36,114,0.06)" }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(sb.avgRate, 100)}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="text-xs font-medium w-10 text-right shrink-0" style={{ color: MUTED }}>{sb.avgRate}%</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}

          <ChartCard title="Assessment Details">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Max</TableHead>
                  <TableHead>Avg</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((r: any) => (
                  <TableRow key={r.assessment_id}>
                    <TableCell className="font-medium" style={{ color: NAVY, fontSize: 13 }}>{r.name}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.date}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.class}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.subject}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.type}</TableCell>
                    <TableCell style={{ fontSize: 13 }}>{r.max_score}</TableCell>
                    <TableCell style={{ fontSize: 13 }}>{r.average}</TableCell>
                    <TableCell><StatusBadge status={r.rate >= 50 ? "active" : "inactive"} /></TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.studentCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </>
      )}
    </div>
  );
}

// ─── 4. Class Comparison Tab ────────────────────────────────────
function ClassComparisonTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [termFilter, setTermFilter] = useState("");

  const load = useCallback(async () => {
    if (!termFilter) return;
    setLoading(true);
    try {
      const [res, termRes] = await Promise.all([
        api.get<any>(`/api/school/reports/class-comparison?term_id=${termFilter}`),
        api.get<{ terms: TermOption[] }>("/api/school/terms"),
      ]);
      setData(res.data);
      setTerms(termRes.data?.terms || []);
    } catch { setError("Failed to load class comparison"); }
    finally { setLoading(false); }
  }, [termFilter]);

  useEffect(() => {
    if (!termFilter && terms.length > 0) {
      const current = terms.find(t => t.is_current);
      if (current) setTermFilter(current.id);
    }
  }, [terms, termFilter]);

  useEffect(() => {
    api.get<{ terms: TermOption[] }>("/api/school/terms").then(res => {
      const list = res.data?.terms || [];
      setTerms(list);
      const current = list.find((t: TermOption) => t.is_current);
      if (current) setTermFilter(current.id);
      else if (list.length > 0) setTermFilter(list[0].id);
    }).catch(() => setError("Failed to load terms"));
  }, []);

  useEffect(() => { if (termFilter) load(); }, [termFilter, load]);

  if (loading) return <LoadingSpinner height={300} />;
  if (!data) return <EmptyState icon={School} title="Select a term" desc="Choose a term to compare classes" />;
  const s = data?.summary;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <Select value={termFilter} onValueChange={setTermFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Select term" /></SelectTrigger>
          <SelectContent>
            {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!data.records || data.records.length === 0 ? (
        <EmptyState icon={School} title="No class data" desc="No assessments found for this term" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <MetricCard icon={School} label="Classes" value={s?.totalClasses || 0} color="#6366F1" />
            <MetricCard icon={TrendingUp} label="School Avg" value={`${s?.avgRateAll || 0}%`} color="#16A34A" />
          </div>

          <ChartCard title="Class Comparison" subtitle="Average performance by class">
            <ResponsiveContainer width="100%" height={Math.max(180, (data.records.length || 1) * 45)}>
              <BarChart data={data.records} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.06)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: MUTED }} unit="%" />
                <YAxis type="category" dataKey="class_name" tick={{ fontSize: 11, fill: NAVY }} width={80} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(10,36,114,0.15)" }}
                  formatter={(value: number) => [`${value}%`, "Avg Score"]} />
                <Bar dataKey="avgRate" radius={[0, 4, 4, 0]}>
                  {data.records.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Class Details">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Assessments</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Avg Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((r: any) => (
                  <TableRow key={r.class_id}>
                    <TableCell className="font-medium" style={{ color: NAVY }}>{r.class_name}</TableCell>
                    <TableCell style={{ color: MUTED }}>{r.totalAssessments}</TableCell>
                    <TableCell style={{ color: MUTED }}>{r.studentCount}</TableCell>
                    <TableCell><StatusBadge status={r.avgRate >= 50 ? "active" : "inactive"} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </>
      )}
    </div>
  );
}

// ─── 5. Subject Performance Tab ─────────────────────────────────
function SubjectPerformanceTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [termFilter, setTermFilter] = useState("");

  useEffect(() => {
    api.get<{ terms: TermOption[] }>("/api/school/terms").then(res => {
      const list = res.data?.terms || [];
      setTerms(list);
      const current = list.find((t: TermOption) => t.is_current);
      if (current) setTermFilter(current.id);
      else if (list.length > 0) setTermFilter(list[0].id);
    }).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!termFilter) return;
    setLoading(true);
    try {
      const res = await api.get<any>(`/api/school/reports/subject-performance?term_id=${termFilter}`);
      setData(res.data);
    } catch { setError("Failed to load subject performance"); }
    finally { setLoading(false); }
  }, [termFilter]);

  useEffect(() => { if (termFilter) load(); }, [termFilter, load]);

  if (loading) return <LoadingSpinner height={300} />;
  if (!data) return <EmptyState icon={BookOpen} title="Select a term" desc="Choose a term to view subject performance" />;
  const s = data?.summary;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <Select value={termFilter} onValueChange={setTermFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs"><SelectValue placeholder="Select term" /></SelectTrigger>
          <SelectContent>
            {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {!data.records || data.records.length === 0 ? (
        <EmptyState icon={BookOpen} title="No subject data" desc="No assessments found for this term" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <MetricCard icon={BookOpen} label="Subjects" value={s?.totalSubjects || 0} color="#6366F1" />
            <MetricCard icon={TrendingUp} label="Overall Avg" value={`${s?.avgRateAll || 0}%`} color="#16A34A" />
          </div>

          <ChartCard title="Subject Performance" subtitle="Average score by subject">
            <div className="space-y-2 mb-6">
              {data.records.map((sb: any, i: number) => (
                <div key={sb.subject_id} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-28 truncate shrink-0" style={{ color: NAVY }}>{sb.subject_name}</span>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(10,36,114,0.06)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(sb.avgRate, 100)}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                  <span className="text-xs font-medium w-10 text-right shrink-0" style={{ color: MUTED }}>{sb.avgRate}%</span>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard title="Assessment Breakdown">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Assessment</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Max Score</TableHead>
                  <TableHead>Avg Score</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Students</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.assessmentBreakdown?.map((r: any) => (
                  <TableRow key={r.assessment_id}>
                    <TableCell className="font-medium" style={{ color: NAVY, fontSize: 13 }}>{r.name}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.subject}</TableCell>
                    <TableCell style={{ fontSize: 13 }}>{r.max_score}</TableCell>
                    <TableCell style={{ fontSize: 13 }}>{r.avgScore}</TableCell>
                    <TableCell><StatusBadge status={r.rate >= 50 ? "active" : "inactive"} /></TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.studentCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </>
      )}
    </div>
  );
}

// ─── 6. Fee Collection Tab ──────────────────────────────────────
function FeeCollectionTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      const res = await api.get<any>(`/api/school/reports/fee-collection?${params}`);
      setData(res.data);
    } catch { setError("Failed to load fee collection"); }
    finally { setLoading(false); }
  }, [dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner height={300} />;
  const s = data?.summary;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <FilterBar dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onExport={() => window.open(`/api/school/reports/export?type=fee-collection&date_from=${dateFrom}&date_to=${dateTo}`, "_blank")} />

      {!s || s.paymentCount === 0 ? (
        <EmptyState icon={DollarSign} title="No fee collection data" desc="Record payments to see collection reports" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard icon={DollarSign} label="Total Collected" value={formatCedi(s.totalCollected)} sub={`${s.completedCount} payment(s)`} color="#16A34A" />
            <MetricCard icon={AlertCircle} label="Failed Amount" value={formatCedi(s.totalFailed)} sub={`${s.failedCount} failed`} color="#EF4444" />
            <MetricCard icon={AlertTriangle} label="Pending Amount" value={formatCedi(s.totalPending)} color="#F59E0B" />
            <MetricCard icon={Receipt} label="Total Payments" value={s.paymentCount} color="#6366F1" />
          </div>

          {data.monthly?.length > 0 && (
            <ChartCard title="Monthly Collection Trend">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: MUTED }} />
                  <YAxis tick={{ fontSize: 10, fill: MUTED }} tickFormatter={(v) => `GHS ${(v / 100).toFixed(0)}`} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(10,36,114,0.15)" }}
                    formatter={(value: number) => [formatCedi(value), "Collected"]} />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {data.monthly.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {data.byMethod?.length > 0 && (
            <ChartCard title="Collection by Method">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {data.byMethod.map((m: any) => (
                  <div key={m.method} className="p-3 rounded-xl text-center" style={{ background: "rgba(10,36,114,0.03)" }}>
                    <p className="text-lg font-bold" style={{ color: NAVY }}>{formatCedi(m.amount)}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{m.method} ({m.count})</p>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );
}

// ─── 7. Outstanding Balance Tab ─────────────────────────────────
function OutstandingBalanceTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      const res = await api.get<any>(`/api/school/reports/outstanding-balance?${params}`);
      setData(res.data);
    } catch { setError("Failed to load outstanding balances"); }
    finally { setLoading(false); }
  }, [dateFrom, dateTo]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner height={300} />;
  const s = data?.summary;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <FilterBar dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onExport={() => window.open(`/api/school/reports/export?type=outstanding&date_from=${dateFrom}&date_to=${dateTo}`, "_blank")} />

      {!s || s.invoiceCount === 0 ? (
        <EmptyState icon={Receipt} title="No outstanding balances" desc="All invoices are paid up" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <MetricCard icon={DollarSign} label="Total Outstanding" value={formatCedi(s.totalOutstanding)} color="#EF4444" />
            <MetricCard icon={AlertCircle} label="Overdue Amount" value={formatCedi(s.overdueAmount)} sub={`${s.overdueCount} overdue`} color="#EF4444" />
            <MetricCard icon={Receipt} label="Unpaid Invoices" value={s.invoiceCount} color="#F59E0B" />
          </div>

          <ChartCard title="Outstanding Invoices" subtitle={`${data.records.length} outstanding invoice(s)`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Overdue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium" style={{ color: NAVY, fontSize: 13 }}>{inv.student?.name || "—"}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{inv.class?.name}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{inv.invoice_number}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{new Date(inv.due_date).toLocaleDateString()}</TableCell>
                    <TableCell style={{ fontSize: 13 }}>{formatCedi(inv.total_amount)}</TableCell>
                    <TableCell style={{ fontSize: 13 }}>{formatCedi(inv.paid_amount)}</TableCell>
                    <TableCell className="font-medium" style={{ color: "#EF4444" }}>{formatCedi(inv.balance)}</TableCell>
                    <TableCell><StatusBadge status={inv.daysOverdue > 0 ? "overdue" : "active"} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </>
      )}
    </div>
  );
}

// ─── 8. Admissions Tab ──────────────────────────────────────────
function AdmissionsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [classes, setClasses] = useState<ClassOption[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      if (classFilter) params.set("class_name", classFilter);
      const [res, clsRes] = await Promise.all([
        api.get<any>(`/api/school/reports/admissions?${params}`),
        api.get<{ classes: ClassOption[] }>("/api/school/classes"),
      ]);
      setData(res.data);
      setClasses(clsRes.data?.classes || []);
    } catch { setError("Failed to load admissions report"); }
    finally { setLoading(false); }
  }, [dateFrom, dateTo, classFilter]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner height={300} />;
  const s = data?.summary;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <FilterBar dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onExport={() => window.open(`/api/school/reports/export?type=admissions&date_from=${dateFrom}&date_to=${dateTo}`, "_blank")}>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All classes</SelectItem>
            {classes.map(c => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterBar>

      {!s || s.totalStudents === 0 ? (
        <EmptyState icon={UserPlus} title="No enrollment data" desc="Add students to see admissions reports" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard icon={Users} label="Total Students" value={s.totalStudents} sub={`${s.totalActive} active`} color="#6366F1" />
            <MetricCard icon={UserPlus} label="Male" value={s.maleCount} color="#3B82F6" />
            <MetricCard icon={UserPlus} label="Female" value={s.femaleCount} color="#EC4899" />
            <MetricCard icon={AlertTriangle} label="Unassigned" value={s.unassigned} color={s.unassigned > 0 ? "#F59E0B" : "#16A34A"} />
          </div>

          {data.monthly?.length > 0 && (
            <ChartCard title="Enrollment Trend" subtitle="New students by month">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.06)" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: MUTED }} />
                  <YAxis tick={{ fontSize: 10, fill: MUTED }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(10,36,114,0.15)" }}
                    formatter={(value: number) => [value, "New Students"]} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.monthly.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {data.byClass?.length > 0 && (
            <ChartCard title="Students by Class">
              <ResponsiveContainer width="100%" height={Math.max(150, (data.byClass.length || 1) * 35)}>
                <BarChart data={data.byClass} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: MUTED }} allowDecimals={false} />
                  <YAxis type="category" dataKey="class_name" tick={{ fontSize: 11, fill: NAVY }} width={80} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none" }}
                    formatter={(value: number) => [value, "Students"]} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.byClass.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </>
      )}
    </div>
  );
}

// ─── 9. Incidents Tab ───────────────────────────────────────────
function IncidentsTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      if (typeFilter) params.set("type", typeFilter);
      if (severityFilter) params.set("severity", severityFilter);
      const res = await api.get<any>(`/api/school/reports/incidents?${params}`);
      setData(res.data);
    } catch { setError("Failed to load incidents"); }
    finally { setLoading(false); }
  }, [dateFrom, dateTo, typeFilter, severityFilter]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner height={300} />;
  const s = data?.summary;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <FilterBar dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onExport={() => window.open(`/api/school/reports/export?type=incidents&date_from=${dateFrom}&date_to=${dateTo}`, "_blank")}>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[130px] h-9 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All types</SelectItem>
            {["attendance", "performance", "behavior"].map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All severities</SelectItem>
            {["low", "medium", "high", "critical"].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      {!s || s.total === 0 ? (
        <EmptyState icon={AlertTriangle} title="No incidents" desc="No interventions have been recorded" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard icon={AlertTriangle} label="Total Incidents" value={s.total} color="#6366F1" />
            <MetricCard icon={AlertCircle} label="Open" value={s.openCount} color="#EF4444" />
            <MetricCard icon={Check} label="Resolved" value={s.resolvedCount} color="#16A34A" />
          </div>

          {s.byType?.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              {s.byType.map((t: any) => (
                <div key={t.type} className="p-4 rounded-xl text-center" style={{ background: "rgba(10,36,114,0.03)", border: "1px solid rgba(10,36,114,0.07)" }}>
                  <p className="text-2xl font-bold" style={{ color: NAVY }}>{t.count}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{t.type}</p>
                </div>
              ))}
              {s.bySeverity?.map((sev: any) => (
                <div key={sev.severity} className="p-4 rounded-xl text-center" style={{ background: "rgba(10,36,114,0.03)", border: "1px solid rgba(10,36,114,0.07)" }}>
                  <p className="text-2xl font-bold" style={{ color: NAVY }}>{sev.count}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{sev.severity}</p>
                </div>
              ))}
            </div>
          )}

          <ChartCard title="Incident Records">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium" style={{ color: NAVY, fontSize: 13 }}>{r.student?.name || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="bg-gray-50">{r.type}</Badge></TableCell>
                    <TableCell><StatusBadge status={r.severity} /></TableCell>
                    <TableCell><StatusBadge status={r.status} /></TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{r.assigned?.name || "—"}</TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED, maxWidth: 200 }} className="truncate">{r.notes || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </>
      )}
    </div>
  );
}

// ─── 10. User Activity Tab ──────────────────────────────────────
function ActivityTab() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (dateFrom) params.set("date_from", dateFrom);
      if (dateTo) params.set("date_to", dateTo);
      if (actionFilter) params.set("action", actionFilter);
      if (resourceFilter) params.set("resource", resourceFilter);
      const res = await api.get<any>(`/api/school/reports/activity?${params}`);
      setData(res.data);
    } catch { setError("Failed to load activity report"); }
    finally { setLoading(false); }
  }, [dateFrom, dateTo, actionFilter, resourceFilter]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner height={300} />;
  const s = data?.summary;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <FilterBar dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo}
        onExport={() => window.open(`/api/school/reports/export?type=activity&date_from=${dateFrom}&date_to=${dateTo}`, "_blank")}>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All actions</SelectItem>
            {["created", "updated", "deleted", "viewed"].map(a => (
              <SelectItem key={a} value={a}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={resourceFilter} onValueChange={setResourceFilter}>
          <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue placeholder="Resource" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All resources</SelectItem>
            {["student", "fee", "report", "attendance", "user", "class", "assessment"].map(r => (
              <SelectItem key={r} value={r}>{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>

      {!s || s.total === 0 ? (
        <EmptyState icon={Activity} title="No activity data" desc="User actions will appear here as they happen" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <MetricCard icon={Activity} label="Total Actions" value={s.total} color="#6366F1" />
            {s.byAction?.slice(0, 3).map((a: any) => (
              <MetricCard key={a.action} icon={BarChart3} label={a.action} value={a.count} color={COLORS[Math.abs(a.action.length) % COLORS.length]} />
            ))}
          </div>

          {s.byResource?.length > 0 && (
            <ChartCard title="Activity by Resource">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                {s.byResource.map((r: any) => (
                  <div key={r.resource} className="p-3 rounded-xl text-center" style={{ background: "rgba(10,36,114,0.03)" }}>
                    <p className="text-lg font-bold" style={{ color: NAVY }}>{r.count}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{r.resource}</p>
                  </div>
                ))}
              </div>
            </ChartCard>
          )}

          <ChartCard title="Recent Activity" subtitle="Last 100 actions">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell style={{ fontSize: 12, color: MUTED }}>{new Date(r.created_at).toLocaleString()}</TableCell>
                    <TableCell style={{ color: NAVY, fontSize: 13 }}>{r.user?.name || "System"}</TableCell>
                    <TableCell><StatusBadge status={r.action} /></TableCell>
                    <TableCell><Badge variant="outline" className="bg-gray-50">{r.resource}</Badge></TableCell>
                    <TableCell style={{ fontSize: 12, color: MUTED, maxWidth: 200 }} className="truncate">
                      {r.resource_id || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ChartCard>
        </>
      )}
    </div>
  );
}

// ─── Main Reports Component ─────────────────────────────────────
export function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: NAVY }}>Reports & Analytics</h1>
        <p style={{ color: MUTED, fontSize: "0.85rem" }}>Actionable school-wide reports with filtering and export</p>
      </div>

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList style={{ background: "rgba(10,36,114,0.05)", borderRadius: 12 }} className="flex-wrap h-auto p-1">
          <TabsTrigger value="attendance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Attendance</TabsTrigger>
          <TabsTrigger value="staff-attendance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Staff Attendance</TabsTrigger>
          <TabsTrigger value="academic" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Academic</TabsTrigger>
          <TabsTrigger value="class-comparison" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Class Comparison</TabsTrigger>
          <TabsTrigger value="subject-performance" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Subject Performance</TabsTrigger>
          <TabsTrigger value="fee-collection" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Fee Collection</TabsTrigger>
          <TabsTrigger value="outstanding" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Outstanding</TabsTrigger>
          <TabsTrigger value="admissions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Admissions</TabsTrigger>
          <TabsTrigger value="incidents" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Incidents</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Activity</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="attendance"><AttendanceTab /></TabsContent>
          <TabsContent value="staff-attendance"><StaffAttendanceTab /></TabsContent>
          <TabsContent value="academic"><AcademicPerformanceTab /></TabsContent>
          <TabsContent value="class-comparison"><ClassComparisonTab /></TabsContent>
          <TabsContent value="subject-performance"><SubjectPerformanceTab /></TabsContent>
          <TabsContent value="fee-collection"><FeeCollectionTab /></TabsContent>
          <TabsContent value="outstanding"><OutstandingBalanceTab /></TabsContent>
          <TabsContent value="admissions"><AdmissionsTab /></TabsContent>
          <TabsContent value="incidents"><IncidentsTab /></TabsContent>
          <TabsContent value="activity"><ActivityTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
