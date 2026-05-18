import { useState, useEffect, useCallback } from "react";
import { FileText, Loader2, Check, X, AlertCircle, RefreshCw, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { api } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type ClassOption = { id: string; name: string };
type TermOption = { id: string; name: string };

type CategoryBreakdown = {
  category_name: string;
  average: number;
  weight: number;
  scored: number;
  total: number;
};

type StudentGrade = {
  student_id: string;
  student_name: string;
  admission_no: string;
  percentage: number;
  grade: string;
  grade_remark: string;
  rank: number;
  category_breakdown?: CategoryBreakdown[];
};

function AlertBanner({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) {
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{
      background: type === "error" ? "#FEF2F2" : "#D1FAE5",
      color: type === "error" ? "#EF4444" : "#065F46",
      border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}`,
      fontSize: "0.9rem"
    }}>
      {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function LoadingSpinner({ height = 48 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <Loader2 className="animate-spin" size={24} color={PLUM} />
    </div>
  );
}

export function WeightedGradebook() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generating, setGenerating] = useState(false);

  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      api.get<{ data: { classes: ClassOption[] } }>("/api/school/classes"),
      api.get<{ data: { terms: TermOption[] } }>("/api/school/terms"),
    ]).then(([cRes, tRes]) => {
      setClasses(cRes.data?.data?.classes || []);
      setTerms(tRes.data?.data?.terms || []);
    }).catch((err: any) => {
      setError(err.message || "Failed to load form data");
    });
  }, []);

  const loadGradebook = useCallback(async () => {
    if (!selectedClass || !selectedTerm) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.get<{ data: StudentGrade[] }>(
        `/api/school/classes/${selectedClass}/terms/${selectedTerm}/gradebook?include_category_breakdown=true`
      );
      setStudents(res.data?.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load gradebook");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedTerm]);

  useEffect(() => {
    loadGradebook();
  }, [loadGradebook]);

  const toggleRow = (studentId: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const generateReportCards = async () => {
    if (!selectedClass || !selectedTerm) return;
    setGenerating(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.post<{ data: { jobId: string; message: string } }>(
        `/api/school/report-cards/generate/${selectedClass}/${selectedTerm}`,
        {}
      );
      const msg = res.data?.data?.message || "Report card generation queued.";
      setSuccess(msg);
    } catch (err: any) {
      setError(err.message || "Failed to generate report cards");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: PLUM }}>Weighted Gradebook</h2>
          <p className="text-sm" style={{ color: MUTED }}>View and manage term averages with weighted category breakdown</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedClass && selectedTerm && (
            <button onClick={generateReportCards} disabled={generating || students.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
              {generating ? <Loader2 size={15} className="animate-spin" /> : <FileText size={15} />}
              {generating ? "Generating..." : "Generate Report Cards"}
            </button>
          )}
        </div>
      </div>

      <div className="p-5 rounded-xl mb-6" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: MILK, border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
              <option value="">Select class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: MUTED }}>Term</label>
            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: MILK, border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
              <option value="">Select term...</option>
              {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
        {selectedClass && selectedTerm && (
          <div className="flex justify-end mt-4">
            <button onClick={loadGradebook} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
              style={{ border: "1px solid rgba(56,25,50,0.1)", color: PLUM_LIGHT, background: "white" }}>
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {!selectedClass || !selectedTerm ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(56,25,50,0.03)", border: "1px dashed rgba(56,25,50,0.1)" }}>
          <RotateCcw size={40} color={MUTED} className="mx-auto mb-3" />
          <p className="font-semibold text-sm" style={{ color: PLUM }}>Select a class and term</p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>Choose a class and term above to view the gradebook</p>
        </div>
      ) : loading ? (
        <LoadingSpinner height={300} />
      ) : students.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(56,25,50,0.03)", border: "1px dashed rgba(56,25,50,0.1)" }}>
          <FileText size={40} color={MUTED} className="mx-auto mb-3" />
          <p className="font-semibold text-sm" style={{ color: PLUM }}>No grade data found</p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>No assessments or scores recorded for this class and term</p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                  <th className="px-4 py-3 font-medium w-8"></th>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Student Name</th>
                  <th className="px-4 py-3 font-medium">Roll Number</th>
                  <th className="px-4 py-3 font-medium">Category Breakdown</th>
                  <th className="px-4 py-3 font-medium">Term Average (%)</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const isExpanded = expandedRows.has(student.student_id);
                  const breakdown = student.category_breakdown || [];
                  return (
                    <tr key={student.student_id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleRow(student.student_id)}
                          className="p-1 rounded hover:opacity-70 transition-opacity"
                          style={{ color: MUTED }}>
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{student.rank}</td>
                      <td className="px-4 py-3 font-medium" style={{ color: PLUM }}>{student.student_name}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{student.admission_no || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs" style={{ color: MUTED }}>
                          {breakdown.length > 0 ? `${breakdown.length} categories` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: PLUM }}>
                        {student.percentage.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: student.grade === "N/A" || student.grade === "ERR"
                              ? "#FEF2F2" : "#D1FAE5",
                            color: student.grade === "N/A" || student.grade === "ERR"
                              ? "#EF4444" : "#065F46",
                          }}>
                          {student.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleRow(student.student_id)}
                          className="text-xs font-medium hover:opacity-70 transition-opacity"
                          style={{ color: PLUM }}>
                          {isExpanded ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {students.map((student) => {
            const isExpanded = expandedRows.has(student.student_id);
            const breakdown = student.category_breakdown || [];
            if (!isExpanded || breakdown.length === 0) return null;
            return (
              <div key={`breakdown-${student.student_id}`}
                className="border-t px-4 py-3"
                style={{ background: "rgba(56,25,50,0.02)", borderColor: "rgba(56,25,50,0.05)" }}>
                <div className="text-xs font-semibold mb-2" style={{ color: PLUM }}>
                  {student.student_name} — Category Breakdown
                </div>
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED }}>
                      <th className="pb-1.5 pr-4 font-medium">Category</th>
                      <th className="pb-1.5 pr-4 font-medium">Weight</th>
                      <th className="pb-1.5 pr-4 font-medium">Average Score (%)</th>
                      <th className="pb-1.5 font-medium">Scored</th>
                    </tr>
                  </thead>
                  <tbody>
                    {breakdown.map((cat, i) => (
                      <tr key={i} className="text-xs" style={{ color: PLUM_LIGHT }}>
                        <td className="py-1 pr-4 font-medium">{cat.category_name}</td>
                        <td className="py-1 pr-4">{cat.weight}</td>
                        <td className="py-1 pr-4 font-semibold">{cat.average.toFixed(1)}%</td>
                        <td className="py-1">{cat.scored}/{cat.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
