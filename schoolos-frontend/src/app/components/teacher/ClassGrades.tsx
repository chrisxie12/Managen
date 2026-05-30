import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, X, AlertTriangle, Save } from "lucide-react";
import { api } from "../../services/api";
import type { ClassStudent, Assessment, Score } from "./types";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

export function ClassGrades({ classId, students }: { classId: string; className: string; students: ClassStudent[] }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [existingScores, setExistingScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get<{ assessments: Assessment[] }>(`/api/school/assessments?class_id=${classId}`);
        setAssessments(res.data?.assessments || []);
      } catch { /* ignore */ } finally { setLoading(false); }
    };
    if (classId) load();
  }, [classId]);

  useEffect(() => {
    if (!selectedAssessment) {
      setScores({});
      setExistingScores([]);
      return;
    }
    api.get<{ scores: Score[] }>(`/api/school/assessment-scores?assessment_id=${selectedAssessment}`)
      .then(res => {
        const list = res.data?.scores || [];
        setExistingScores(list);
        const map: Record<string, string> = {};
        list.forEach(s => { map[s.student_id] = String(s.score); });
        setScores(map);
      })
      .catch(() => { setScores({}); setExistingScores([]); });
  }, [selectedAssessment]);

  const selected = assessments.find(a => a.id === selectedAssessment);

  const saveScores = async () => {
    if (!selectedAssessment) return;
    setSaving(true);
    setAlert(null);
    try {
      const payload = Object.entries(scores)
        .filter(([_, val]) => val !== "")
        .map(([student_id, score]) => ({
          assessment_id: selectedAssessment,
          student_id,
          score: Number(score),
        }));
      await api.post("/api/school/assessment-scores/bulk", { scores: payload });
      setAlert({ type: "success", message: `Saved ${payload.length} scores.` });
    } catch {
      setAlert({ type: "error", message: "Failed to save scores." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: MUTED }}>
        <p className="font-semibold" style={{ color: NAVY }}>No Assessments</p>
        <p className="text-sm mt-1">Create assessments for this class first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alert && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{
          background: alert.type === "error" ? "#FEF2F2" : "#D1FAE5",
          color: alert.type === "error" ? "#EF4444" : "#065F46",
          border: `1px solid ${alert.type === "error" ? "#FECACA" : "#A7F3D0"}`,
          fontSize: "0.9rem",
        }}>
          {alert.type === "error" ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
          <span className="flex-1">{alert.message}</span>
          <button onClick={() => setAlert(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <select value={selectedAssessment} onChange={(e) => setSelectedAssessment(e.target.value)}
          className="px-4 py-2.5 rounded-xl outline-none text-sm flex-1 min-w-[200px]" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
          <option value="">Select an assessment...</option>
          {assessments.map(a => (
            <option key={a.id} value={a.id}>
              {a.name} ({a.subject?.name || "—"}) — {a.date ? new Date(a.date).toLocaleDateString() : ""}
            </option>
          ))}
        </select>
        {selected && (
          <span className="text-sm px-3 py-1.5 rounded-full" style={{ background: CREAM, color: NAVY_LIGHT }}>
            Max: {selected.max_score}
          </span>
        )}
        {selectedAssessment && (
          <button onClick={saveScores} disabled={saving}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
            style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Scores"}
          </button>
        )}
      </div>

      {selectedAssessment && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Score / {selected?.max_score || "?"}</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => {
                const existing = existingScores.find(s => s.student_id === student.id);
                return (
                  <tr key={student.id} className="text-sm" style={{ borderBottom: "1px solid rgba(10,36,114,0.05)" }}>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ color: NAVY }}>{student.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        max={selected?.max_score || 100}
                        value={scores[student.id] ?? ""}
                        onChange={(e) => setScores(prev => ({ ...prev, [student.id]: e.target.value }))}
                        placeholder="—"
                        className="w-20 px-2 py-1.5 rounded-lg text-sm outline-none"
                        style={{ background: CREAM, border: "1px solid rgba(10,36,114,0.08)", color: NAVY }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {existing ? (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#065F46" }}>
                          Saved
                        </span>
                      ) : scores[student.id] ? (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FEF3C7", color: "#92400E" }}>
                          Unsaved
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: MUTED }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
