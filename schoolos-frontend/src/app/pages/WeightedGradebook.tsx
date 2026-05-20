import { useState, useEffect, useCallback, useRef, Fragment } from "react";
import {
  Loader2, ChevronDown, ChevronRight, RefreshCw, FileSpreadsheet,
  AlertCircle, School, Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

type ClassItem = { id: string; name: string };
type Term = { id: string; name: string };

type CategoryBreakdown = Record<string, {
  average: number;
  weight: number;
  weighted_score: number;
  assessments_count: number;
  total_assessments: number;
}>;

type GradebookEntry = {
  student_id: string;
  name: string;
  roll_number?: string;
  admission_number?: string;
  percentage?: number;
  grade?: string;
  grade_remark?: string;
  category_breakdown?: CategoryBreakdown;
  total_weight?: number;
  error?: string;
};

type JobStatusResponse = {
  jobId: string;
  state: string;
  progress: number;
  result: any;
  failedReason: string | null;
};

function LoadingSpinner({ size = 16 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" />;
}

export function WeightedGradebook() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [gradebookData, setGradebookData] = useState<GradebookEntry[]>([]);
  const [fetching, setFetching] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadClasses();
    loadTerms();
  }, []);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  useEffect(() => {
    if (selectedClass && selectedTerm) {
      fetchGradebook();
    }
  }, [selectedClass, selectedTerm]);

  const loadClasses = useCallback(async () => {
    try {
      const res = await api.get<{ data: ClassItem[] }>("/api/school/classes");
      if (res.data?.data) setClasses(res.data.data);
    } catch {
      toast.error("Failed to load classes");
    }
  }, []);

  const loadTerms = useCallback(async () => {
    try {
      const res = await api.get<{ data: Term[] }>("/api/school/terms");
      if (res.data?.data) setTerms(res.data.data);
    } catch {
      toast.error("Failed to load terms");
    }
  }, []);

  const fetchGradebook = useCallback(async () => {
    if (!selectedClass || !selectedTerm) return;
    setFetching(true);
    try {
      const res = await api.get<{ success: boolean; data: GradebookEntry[] }>(
        `/api/school/classes/${selectedClass}/terms/${selectedTerm}/gradebook?include_breakdown=true`
      );
      if (res.data?.success && res.data?.data) {
        setGradebookData(res.data.data);
        if (res.data.data.length === 0) {
          toast.info("No assessment data found for this class and term");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch gradebook");
      setGradebookData([]);
    } finally {
      setFetching(false);
    }
  }, [selectedClass, selectedTerm]);

  const startPolling = useCallback((id: string) => {
    setJobId(id);
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await api.get<JobStatusResponse>(`/api/school/report-cards/status/${id}`);
        const job = res.data;
        if (!job) return;

        if (job.state === "completed") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setGenerating(false);
          setJobId(null);
          toast.success("Report cards generated successfully");
          fetchGradebook();
        } else if (job.state === "failed") {
          clearInterval(pollingRef.current!);
          pollingRef.current = null;
          setGenerating(false);
          setJobId(null);
          toast.error(job.failedReason || "Report card generation failed");
        }
      } catch {
        clearInterval(pollingRef.current!);
        pollingRef.current = null;
        setGenerating(false);
        setJobId(null);
        toast.error("Failed to check job status");
      }
    }, 2000);
  }, [fetchGradebook]);

  const handleGenerate = useCallback(async () => {
    if (!selectedClass || !selectedTerm || generating) return;
    setGenerating(true);
    try {
      const res = await api.post<{ success: boolean; async?: boolean; jobId?: string; data?: any }>(
        `/api/school/report-cards/generate/${selectedClass}/${selectedTerm}`,
        {}
      );
      if (res.data?.async && res.data?.jobId) {
        startPolling(res.data.jobId);
      } else if (res.data?.success) {
        toast.success("Report cards generated successfully");
        fetchGradebook();
        setGenerating(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report cards");
      setGenerating(false);
    }
  }, [selectedClass, selectedTerm, generating, startPolling, fetchGradebook]);

  const toggleRow = (studentId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const hasData = gradebookData.length > 0 && gradebookData.some(e => e.percentage !== undefined);
  const isSchoolStaff = user && ["school_admin", "headmaster", "teacher"].includes(user.role);

  if (!isSchoolStaff) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: MUTED }}>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Weighted Gradebook</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchGradebook}
            disabled={fetching || !selectedClass || !selectedTerm}
            className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-all duration-200"
            style={{
              background: "white",
              border: "1px solid rgba(56,25,50,0.15)",
              color: NAVY,
              opacity: fetching || !selectedClass || !selectedTerm ? 0.5 : 1,
            }}
          >
            {fetching ? <LoadingSpinner /> : <RefreshCw size={14} />}
            Refresh
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating || !hasData}
            className="px-4 py-2 rounded-xl flex items-center gap-2 text-sm transition-all duration-200 text-white"
            style={{
              background: generating ? MUTED : NAVY,
              opacity: generating || !hasData ? 0.6 : 1,
            }}
          >
            {generating ? <LoadingSpinner /> : <FileSpreadsheet size={14} />}
            {generating ? "Generating..." : "Generate Report Cards"}
          </button>
        </div>
      </div>

      {generating && jobId && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-3" style={{ background: "#FEFCE8", border: "1px solid #FDE68A" }}>
          <LoadingSpinner size={18} />
          <span className="text-sm" style={{ color: "#92400E" }}>Generating report cards... Checking progress every 2s</span>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: MUTED }}>
            <School size={12} className="inline mr-1" />Class
          </label>
          <select
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm"
            style={{
              background: "white",
              border: "1px solid rgba(56,25,50,0.12)",
              color: NAVY,
            }}
          >
            <option value="">Select a class...</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1 uppercase tracking-wider" style={{ color: MUTED }}>
            <Calendar size={12} className="inline mr-1" />Term
          </label>
          <select
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm"
            style={{
              background: "white",
              border: "1px solid rgba(56,25,50,0.12)",
              color: NAVY,
            }}
          >
            <option value="">Select a term...</option>
            {terms.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {fetching && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size={24} />
        </div>
      )}

      {!fetching && selectedClass && selectedTerm && gradebookData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <AlertCircle size={32} style={{ color: MUTED }} />
          <p style={{ color: MUTED }}>No assessment data found for this class and term.</p>
        </div>
      )}

      {!fetching && gradebookData.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: NAVY }}>
                <th className="text-left p-3 text-xs uppercase tracking-wider text-white w-8"></th>
                <th className="text-left p-3 text-xs uppercase tracking-wider text-white">Student Name</th>
                <th className="text-left p-3 text-xs uppercase tracking-wider text-white">Roll No</th>
                <th className="text-center p-3 text-xs uppercase tracking-wider text-white">Term Average</th>
                <th className="text-center p-3 text-xs uppercase tracking-wider text-white">Grade</th>
                <th className="text-center p-3 text-xs uppercase tracking-wider text-white">Remark</th>
              </tr>
            </thead>
            <tbody>
              {gradebookData.map((entry, idx) => {
                const isExpanded = expandedRows.has(entry.student_id);
                const hasBreakdown = entry.category_breakdown && Object.keys(entry.category_breakdown).length > 0;

                return (
                  <Fragment key={entry.student_id}>
                    <tr
                      onClick={() => toggleRow(entry.student_id)}
                      className="cursor-pointer transition-all duration-150"
                      style={{
                        background: idx % 2 === 0 ? "white" : "rgba(56,25,50,0.02)",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(56,25,50,0.05)")}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = idx % 2 === 0 ? "white" : "rgba(56,25,50,0.02)";
                      }}
                    >
                      <td className="p-3">
                        {hasBreakdown && (
                          isExpanded ? <ChevronDown size={14} style={{ color: MUTED }} /> : <ChevronRight size={14} style={{ color: MUTED }} />
                        )}
                      </td>
                      <td className="p-3 font-medium" style={{ color: NAVY }}>{entry.name}</td>
                      <td className="p-3" style={{ color: MUTED }}>{entry.roll_number || entry.admission_number || "-"}</td>
                      <td className="p-3 text-center font-semibold" style={{ color: NAVY }}>
                        {entry.error ? (
                          <span className="text-red-500 text-xs">{entry.error}</span>
                        ) : entry.percentage !== undefined ? (
                          `${entry.percentage}%`
                        ) : "-"}
                      </td>
                      <td className="p-3 text-center">
                        {entry.grade && (
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                            style={{
                              background: entry.grade === "F" ? "#FEE2E2" : entry.grade === "A" ? "#D1FAE5" : "#FEF3C7",
                              color: entry.grade === "F" ? "#DC2626" : entry.grade === "A" ? "#059669" : "#D97706",
                            }}
                          >
                            {entry.grade}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center text-xs" style={{ color: MUTED }}>{entry.grade_remark || "-"}</td>
                    </tr>
                    {isExpanded && hasBreakdown && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="p-4" style={{ background: "rgba(56,25,50,0.03)" }}>
                            <h4 className="text-sm font-semibold mb-2" style={{ color: NAVY }}>Category Breakdown</h4>
                            <table className="w-full text-xs">
                              <thead>
                                <tr>
                                  <th className="text-left p-2 font-medium" style={{ color: MUTED }}>Category</th>
                                  <th className="text-center p-2 font-medium" style={{ color: MUTED }}>Avg %</th>
                                  <th className="text-center p-2 font-medium" style={{ color: MUTED }}>Weight</th>
                                  <th className="text-center p-2 font-medium" style={{ color: MUTED }}>Assessments</th>
                                  <th className="text-center p-2 font-medium" style={{ color: MUTED }}>Weighted Score</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(entry.category_breakdown!).map(([cat, data]) => (
                                  <tr key={cat}>
                                    <td className="p-2" style={{ color: NAVY }}>{cat}</td>
                                    <td className="p-2 text-center" style={{ color: NAVY }}>{data.average}%</td>
                                    <td className="p-2 text-center" style={{ color: MUTED }}>{data.weight}%</td>
                                    <td className="p-2 text-center" style={{ color: MUTED }}>
                                      {data.assessments_count}/{data.total_assessments}
                                    </td>
                                    <td className="p-2 text-center font-medium" style={{ color: NAVY }}>
                                      {data.weighted_score.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

