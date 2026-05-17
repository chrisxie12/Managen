import { useState, useEffect, useCallback } from "react";
import {
  Plus, X, Loader2, Search, Check, AlertCircle, FileSpreadsheet,
  ClipboardCheck, Scale, BookOpen, Users, School, Star,
  Eye, SendHorizonal, ShieldCheck,
} from "lucide-react";
import { api } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type AssessmentType = { id: string; name: string; weight: number; description?: string };
type GradingScale = { id: string; name: string; is_default: boolean };
type GradeRule = { id: string; grading_scale_id: string; grade: string; min_percent: number; max_percent: number; points: number; remark?: string };
type ClassItem = { id: string; name: string };
type SubjectItem = { id: string; name: string; code?: string };
type Term = { id: string; name: string };
type Session = { id: string; name: string };
type Assessment = {
  id: string; name: string; date: string; max_score: number; status: string;
  class?: { name: string }; subject?: { name: string; code?: string };
  type?: { name: string; weight: number }; term?: { name: string }; session?: { name: string };
  assessment_type_id?: string; class_id?: string; subject_id?: string;
  term_id?: string; session_id?: string;
};
type Student = { id: string; name: string; admission_no?: string };
type Score = { id?: string; assessment_id: string; student_id: string; score: number };
type ReportCard = {
  id: string; student_id: string; class_id: string; term_id: string; session_id?: string;
  total_score: number; total_max_score: number; average: number; grade: string;
  rank: number; subject_count: number; status: string;
  student?: { name: string; admission_no?: string };
  class?: { name: string }; term?: { name: string }; session?: { name: string };
};

function AlertBanner({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) {
  const bg = type === "error" ? "#FEF2F2" : "#D1FAE5";
  const color = type === "error" ? "#EF4444" : "#065F46";
  const border = type === "error" ? "#FECACA" : "#A7F3D0";
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: bg, color, border: `1px solid ${border}`, fontSize: "0.9rem" }}>
      {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-auto"><X size={14} /></button>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color?: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} color={color || MUTED} />
        <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ color: PLUM }}>{value}</p>
    </div>
  );
}

function LoadingSpinner({ height = 48 }: { height?: number }) {
  return <div className="flex items-center justify-center" style={{ height }}><Loader2 className="animate-spin" size={24} color={PLUM} /></div>;
}

function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <Icon size={40} color={MUTED} className="mx-auto mb-3" />
      <p className="font-semibold" style={{ color: PLUM }}>{title}</p>
      <p className="text-sm mt-1" style={{ color: MUTED }}>{desc}</p>
    </div>
  );
}

function Modal({ title, onClose, saving, onSave, children, saveLabel = "Save", wide }: {
  title: string; onClose: () => void; saving?: boolean; onSave?: () => void; children: React.ReactNode; saveLabel?: string; wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(56,25,50,0.6)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className={`${wide ? "max-w-2xl" : "max-w-md"} w-full rounded-[32px] p-8`} style={{ background: "white", boxShadow: "0 32px 80px rgba(56,25,50,0.3)" }}
        onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: PLUM }}>{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:opacity-70" style={{ background: "rgba(56,25,50,0.06)" }}>
            <X size={16} color={MUTED} />
          </button>
        </div>
        <div className="flex flex-col gap-1">{children}</div>
        {onSave && (
          <button onClick={onSave} disabled={saving}
            className="w-full py-3 rounded-full flex items-center justify-center gap-2 mt-6 active:scale-95 transition-transform text-sm font-semibold"
            style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {saving ? "Saving..." : saveLabel}
          </button>
        )}
      </div>
    </div>
  );
}

const TABS = [
  { key: "setup", label: "Setup", icon: Scale },
  { key: "assessments", label: "Assessments", icon: ClipboardCheck },
  { key: "scores", label: "Scores", icon: FileSpreadsheet },
  { key: "report-cards", label: "Report Cards", icon: Star },
];

export function Assessments() {
  const [tab, setTab] = useState("setup");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: PLUM }}>Assessments & Grading</h2>
          <p className="text-sm" style={{ color: MUTED }}>Create assessments, enter scores, and generate report cards</p>
        </div>
      </div>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
            style={{
              background: tab === t.key ? PLUM : "white",
              color: tab === t.key ? MILK : PLUM_LIGHT,
              border: tab === t.key ? "none" : "1px solid rgba(56,25,50,0.1)",
            }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>
      {tab === "setup" && <SetupTab setError={setError} setSuccess={setSuccess} />}
      {tab === "assessments" && <AssessmentsTab setError={setError} setSuccess={setSuccess} />}
      {tab === "scores" && <ScoresTab setError={setError} setSuccess={setSuccess} />}
      {tab === "report-cards" && <ReportCardsTab setError={setError} setSuccess={setSuccess} />}
    </div>
  );
}

// ─── Setup Tab ───────────────────────────────────────────────
function SetupTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [types, setTypes] = useState<AssessmentType[]>([]);
  const [scales, setScales] = useState<GradingScale[]>([]);
  const [rules, setRules] = useState<GradeRule[]>([]);
  const [selectedScaleId, setSelectedScaleId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [showScaleForm, setShowScaleForm] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [typeForm, setTypeForm] = useState({ name: "", weight: 0, description: "" });
  const [scaleForm, setScaleForm] = useState({ name: "", is_default: false });
  const [ruleForm, setRuleForm] = useState({ grade: "", min_percent: 0, max_percent: 100, points: 0, remark: "" });
  const [editTypeId, setEditTypeId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        api.get<any>("/api/school/assessment-types"),
        api.get<any>("/api/school/grading-scales"),
      ]);
      setTypes(tRes.data?.data?.types || []);
      setScales(sRes.data?.data?.scales || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedScaleId && scales.length > 0) {
      setSelectedScaleId(scales[0].id);
    }
  }, [scales, selectedScaleId]);

  useEffect(() => {
    if (selectedScaleId) {
      api.get<any>(`/api/school/grade-rules?scale_id=${selectedScaleId}`)
        .then(res => setRules(res.data?.data?.rules || []))
        .catch(() => setRules([]));
    } else {
      setRules([]);
    }
  }, [selectedScaleId]);

  const handleSaveType = async () => {
    if (!typeForm.name) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      if (editTypeId) {
        await api.put(`/api/school/assessment-types/${editTypeId}`, typeForm);
        setSuccess("Assessment type updated");
      } else {
        await api.post("/api/school/assessment-types", typeForm);
        setSuccess("Assessment type created");
      }
      setTypeForm({ name: "", weight: 0, description: "" });
      setEditTypeId(null);
      setShowTypeForm(false);
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleEditType = (t: AssessmentType) => {
    setTypeForm({ name: t.name, weight: t.weight, description: t.description || "" });
    setEditTypeId(t.id);
    setShowTypeForm(true);
  };

  const handleDeleteType = async (id: string) => {
    if (!confirm("Delete this assessment type?")) return;
    try { await api.delete(`/api/school/assessment-types/${id}`); await load(); }
    catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleSaveScale = async () => {
    if (!scaleForm.name) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/grading-scales", scaleForm);
      setScaleForm({ name: "", is_default: false });
      setShowScaleForm(false);
      setSuccess("Grading scale created");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDeleteScale = async (id: string) => {
    if (!confirm("Delete this grading scale?")) return;
    try { await api.delete(`/api/school/grading-scales/${id}`); if (selectedScaleId === id) setSelectedScaleId(""); await load(); }
    catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleSaveRule = async () => {
    if (!ruleForm.grade || !selectedScaleId) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post(`/api/school/grade-rules?scale_id=${selectedScaleId}`, ruleForm);
      setRuleForm({ grade: "", min_percent: 0, max_percent: 100, points: 0, remark: "" });
      setShowRuleForm(false);
      setSuccess("Grade rule added");
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Delete this grade rule?")) return;
    try { await api.delete(`/api/school/grade-rules/${id}`); }
    catch (err: any) { setError(err.message || "Failed"); }
  };

  if (loading) return <LoadingSpinner height={200} />;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="p-5 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm" style={{ color: PLUM }}>Assessment Types</h3>
          <button onClick={() => { setEditTypeId(null); setTypeForm({ name: "", weight: 0, description: "" }); setShowTypeForm(true); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
            <Plus size={12} /> Add
          </button>
        </div>
        <p className="text-xs mb-3" style={{ color: MUTED }}>Weights determine each type's contribution to final grade</p>
        {types.length === 0 ? (
          <EmptyState icon={Scale} title="No types defined" desc="Add quiz, assignment, test, exam types" />
        ) : (
          <div className="space-y-2">
            {types.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: MILK }}>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm" style={{ color: PLUM }}>{t.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}>
                    {t.weight}%
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEditType(t)} className="p-1 rounded hover:opacity-70" style={{ color: MUTED }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => handleDeleteType(t.id)} className="p-1 rounded hover:opacity-70" style={{ color: MUTED }}><X size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm" style={{ color: PLUM }}>Grading Scales</h3>
          <button onClick={() => setShowScaleForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
            <Plus size={12} /> Add
          </button>
        </div>
        {scales.length === 0 ? (
          <EmptyState icon={Scale} title="No grading scales" desc="Define grade boundaries (A-F, etc.)" />
        ) : (
          <div className="space-y-3">
            {scales.map(s => (
              <div key={s.id} className={`p-3 rounded-lg cursor-pointer ${selectedScaleId === s.id ? "ring-2" : ""}`}
                style={{ background: MILK, ringColor: selectedScaleId === s.id ? PLUM : "transparent" }}
                onClick={() => setSelectedScaleId(s.id)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm" style={{ color: PLUM }}>{s.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteScale(s.id); }} className="p-1 rounded hover:opacity-70" style={{ color: MUTED }}>
                    <X size={12} />
                  </button>
                </div>
                {selectedScaleId === s.id && (
                  <div className="mt-2">
                    <button onClick={() => setShowRuleForm(true)}
                      className="text-xs font-medium px-2 py-1 rounded-lg mb-2"
                      style={{ background: PLUM, color: MILK }}>+ Add Grade</button>
                    {rules.length === 0 ? (
                      <p className="text-xs" style={{ color: MUTED }}>No grade boundaries yet</p>
                    ) : (
                      <div className="space-y-1">
                        {rules.map(r => (
                          <div key={r.id} className="flex items-center justify-between text-xs px-2 py-1 rounded" style={{ background: "white" }}>
                            <span className="font-bold" style={{ color: PLUM }}>{r.grade}</span>
                            <span style={{ color: MUTED }}>{r.min_percent}% – {r.max_percent}% ({r.points} pts)</span>
                            <button onClick={() => handleDeleteRule(r.id)} className="hover:opacity-70" style={{ color: MUTED }}><X size={10} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showTypeForm && (
        <Modal title={editTypeId ? "Edit Assessment Type" : "Add Assessment Type"} onClose={() => setShowTypeForm(false)} saving={saving} onSave={handleSaveType}>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Type Name</label>
          <input value={typeForm.name} onChange={(e) => setTypeForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Quiz, Assignment, Exam" className="w-full px-4 py-3 rounded-2xl outline-none text-sm mb-3"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Weight (%)</label>
          <input type="number" value={typeForm.weight} onChange={(e) => setTypeForm(p => ({ ...p, weight: Number(e.target.value) }))}
            min="0" max="100" className="w-full px-4 py-3 rounded-2xl outline-none text-sm mb-3"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Description (optional)</label>
          <textarea value={typeForm.description} onChange={(e) => setTypeForm(p => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm" rows={2}
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
        </Modal>
      )}

      {showScaleForm && (
        <Modal title="Add Grading Scale" onClose={() => setShowScaleForm(false)} saving={saving} onSave={handleSaveScale}>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Scale Name</label>
          <input value={scaleForm.name} onChange={(e) => setScaleForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Default A-F, WAEC, BECE" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
        </Modal>
      )}

      {showRuleForm && (
        <Modal title="Add Grade Boundary" onClose={() => setShowRuleForm(false)} saving={saving} onSave={handleSaveRule}>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Grade</label>
              <input value={ruleForm.grade} onChange={(e) => setRuleForm(p => ({ ...p, grade: e.target.value }))}
                placeholder="e.g. A" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Points</label>
              <input type="number" value={ruleForm.points} onChange={(e) => setRuleForm(p => ({ ...p, points: Number(e.target.value) }))}
                min="0" max="5" step="0.1" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Min %</label>
              <input type="number" value={ruleForm.min_percent} onChange={(e) => setRuleForm(p => ({ ...p, min_percent: Number(e.target.value) }))}
                min="0" max="100" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Max %</label>
              <input type="number" value={ruleForm.max_percent} onChange={(e) => setRuleForm(p => ({ ...p, max_percent: Number(e.target.value) }))}
                min="0" max="100" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
          </div>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Remark (optional)</label>
          <input value={ruleForm.remark} onChange={(e) => setRuleForm(p => ({ ...p, remark: e.target.value }))}
            placeholder="e.g. Excellent" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
        </Modal>
      )}
    </div>
  );
}

// ─── Assessments Tab ──────────────────────────────────────────
function AssessmentsTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [types, setTypes] = useState<AssessmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ class_id: "", subject_id: "", term_id: "", assessment_type_id: "" });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "", date: new Date().toISOString().split("T")[0], max_score: 100, description: "",
    class_id: "", subject_id: "", term_id: "", session_id: "", assessment_type_id: "", status: "draft",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, cRes, sRes, tRes, sesRes, tyRes] = await Promise.all([
        api.get<any>("/api/school/assessments"),
        api.get<any>("/api/school/classes"),
        api.get<any>("/api/school/subjects"),
        api.get<any>("/api/school/terms"),
        api.get<any>("/api/school/sessions"),
        api.get<any>("/api/school/assessment-types"),
      ]);
      setAssessments(aRes.data?.data?.assessments || []);
      setClasses(cRes.data?.data?.classes || cRes.data?.classes || []);
      setSubjects(sRes.data?.data?.subjects || sRes.data?.subjects || []);
      setTerms(tRes.data?.data?.terms || tRes.data?.terms || []);
      setSessions(sesRes.data?.data?.sessions || sesRes.data?.sessions || []);
      setTypes(tyRes.data?.data?.types || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = assessments.filter(a => {
    if (filters.class_id && a.class_id !== filters.class_id) return false;
    if (filters.subject_id && a.subject_id !== filters.subject_id) return false;
    if (filters.term_id && a.term_id !== filters.term_id) return false;
    if (filters.assessment_type_id && a.assessment_type_id !== filters.assessment_type_id) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleCreate = async () => {
    if (!form.name || !form.class_id || !form.subject_id || !form.assessment_type_id) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/assessments", form);
      setShowCreate(false);
      setForm({ name: "", date: new Date().toISOString().split("T")[0], max_score: 100, description: "", class_id: "", subject_id: "", term_id: "", session_id: "", assessment_type_id: "", status: "draft" });
      setSuccess("Assessment created");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assessment? Scores will also be removed.")) return;
    try { await api.delete(`/api/school/assessments/${id}`); setSuccess("Assessment deleted"); await load(); }
    catch (err: any) { setError(err.message || "Failed"); }
  };

  if (loading) return <LoadingSpinner height={200} />;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <SummaryCard icon={ClipboardCheck} label="Total Assessments" value={assessments.length} />
        <SummaryCard icon={Star} label="Draft" value={assessments.filter(a => a.status === "draft").length} color="#F59E0B" />
        <SummaryCard icon={Check} label="Open" value={assessments.filter(a => a.status === "open").length} color="#10B981" />
        <SummaryCard icon={School} label="Closed" value={assessments.filter(a => a.status === "closed").length} color="#6366F1" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          <Plus size={14} /> New Assessment
        </button>
        <select value={filters.class_id} onChange={(e) => setFilters(p => ({ ...p, class_id: e.target.value }))}
          className="px-3 py-2 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
          <option value="">All classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.subject_id} onChange={(e) => setFilters(p => ({ ...p, subject_id: e.target.value }))}
          className="px-3 py-2 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
          <option value="">All subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filters.term_id} onChange={(e) => setFilters(p => ({ ...p, term_id: e.target.value }))}
          className="px-3 py-2 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
          <option value="">All terms</option>
          {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[180px] max-w-[240px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
          <Search size={14} color={MUTED} />
          <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="No assessments found" desc="Create an assessment to start tracking scores" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(a => (
            <div key={a.id} className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm" style={{ color: PLUM }}>{a.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  a.status === "open" ? "text-green-700" : a.status === "closed" ? "text-indigo-700" : "text-amber-700"
                }`} style={{
                  background: a.status === "open" ? "#D1FAE5" : a.status === "closed" ? "#EEF2FF" : "#FEF3C7",
                }}>{a.status}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 text-xs mb-2" style={{ color: MUTED }}>
                <span className="px-2 py-0.5 rounded" style={{ background: "rgba(99,102,241,0.08)", color: "#6366F1" }}>{a.class?.name}</span>
                <span className="px-2 py-0.5 rounded" style={{ background: "rgba(16,185,129,0.08)", color: "#065F46" }}>{a.subject?.name}</span>
                <span className="px-2 py-0.5 rounded" style={{ background: "rgba(245,158,11,0.08)", color: "#B45309" }}>{a.type?.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: MUTED }}>
                <span>{a.term?.name}{a.session ? ` · ${a.session.name}` : ""}</span>
                <span>{new Date(a.date).toLocaleDateString()} · Max: {a.max_score}</span>
              </div>
              <div className="flex gap-1 mt-2 pt-2" style={{ borderTop: "1px solid rgba(56,25,50,0.06)" }}>
                <button onClick={() => handleDelete(a.id)} className="text-xs px-2 py-1 rounded hover:opacity-70" style={{ color: "#EF4444" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="Create Assessment" onClose={() => setShowCreate(false)} saving={saving} onSave={handleCreate} wide>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Assessment Name</label>
              <input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. End of Term Mathematics Exam" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Class</label>
              <select value={form.class_id} onChange={(e) => setForm(p => ({ ...p, class_id: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                <option value="">Select...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Subject</label>
              <select value={form.subject_id} onChange={(e) => setForm(p => ({ ...p, subject_id: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                <option value="">Select...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Assessment Type</label>
              <select value={form.assessment_type_id} onChange={(e) => setForm(p => ({ ...p, assessment_type_id: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                <option value="">Select...</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name} ({t.weight}%)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Max Score</label>
              <input type="number" value={form.max_score} onChange={(e) => setForm(p => ({ ...p, max_score: Number(e.target.value) }))}
                min="1" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Term</label>
              <select value={form.term_id} onChange={(e) => setForm(p => ({ ...p, term_id: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                <option value="">Select...</option>
                {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Session</label>
              <select value={form.session_id} onChange={(e) => setForm(p => ({ ...p, session_id: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                <option value="">Select...</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Description (optional)</label>
          <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm" rows={2}
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
        </Modal>
      )}
    </>
  );
}

// ─── Scores Tab ──────────────────────────────────────────────
function ScoresTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [existingScores, setExistingScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get<any>("/api/school/assessments")
      .then(res => setAssessments(res.data?.data?.assessments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedAssessmentId) { setStudents([]); setScores({}); setExistingScores([]); return; }
    const assessment = assessments.find(a => a.id === selectedAssessmentId);
    if (!assessment?.class_id) return;
    setLoading(true);
    Promise.all([
      api.get<any>(`/api/school/students?classId=${assessment.class_id}&limit=200`),
      api.get<any>(`/api/school/assessment-scores?assessment_id=${selectedAssessmentId}`),
    ]).then(([sRes, scRes]) => {
      const list = sRes.data?.data?.students || sRes.data?.students || [];
      setStudents(list);
      const existing: Record<string, number> = {};
      const exList: Score[] = (scRes.data?.data?.scores || []).map((s: any) => ({
        assessment_id: selectedAssessmentId,
        student_id: s.student_id,
        score: Number(s.score),
        id: s.id,
      }));
      setExistingScores(exList);
      exList.forEach(s => { existing[s.student_id] = s.score; });
      setScores(existing);
    }).catch(() => setError("Failed to load data"))
    .finally(() => setLoading(false));
  }, [selectedAssessmentId, assessments, setError]);

  const filteredStudents = students.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.admission_no || "").toLowerCase().includes(search.toLowerCase())
  );

  const missingIds = students.filter(s => !(s.id in scores)).map(s => s.id);
  const filledCount = Object.keys(scores).filter(k => scores[k] !== undefined && scores[k] !== null).length;

  const handleSaveAll = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const scoresPayload = Object.entries(scores).map(([student_id, score]) => ({
        assessment_id: selectedAssessmentId,
        student_id,
        score: score || 0,
      }));
      await api.post("/api/school/assessment-scores/bulk", { scores: scoresPayload });
      setSuccess(`${scoresPayload.length} scores saved`);
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const selectedAssessment = assessments.find(a => a.id === selectedAssessmentId);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select value={selectedAssessmentId} onChange={(e) => setSelectedAssessmentId(e.target.value)}
          className="px-4 py-2.5 rounded-xl outline-none text-sm flex-1 min-w-[250px]"
          style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
          <option value="">Select an assessment...</option>
          {assessments.map(a => (
            <option key={a.id} value={a.id}>{a.name} — {a.class?.name} / {a.subject?.name}</option>
          ))}
        </select>
        {selectedAssessment && (
          <span className="text-xs px-3 py-2 rounded-xl" style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}>
            Max: {selectedAssessment.max_score}
          </span>
        )}
      </div>

      {selectedAssessmentId && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl max-w-[240px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
            <Search size={14} color={MUTED} />
            <input placeholder="Search student..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
          </div>
          <span className="text-sm" style={{ color: MUTED }}>{students.length} students</span>
          <span className="text-sm" style={{ color: "#10B981" }}>{filledCount} scored</span>
          {missingIds.length > 0 && <span className="text-sm" style={{ color: "#F59E0B" }}>{missingIds.length} missing</span>}
          <button onClick={handleSaveAll} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold ml-auto"
            style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {saving ? "Saving..." : `Save All (${filledCount})`}
          </button>
        </div>
      )}

      {!selectedAssessmentId ? (
        <EmptyState icon={FileSpreadsheet} title="Select an assessment" desc="Choose an assessment to enter scores" />
      ) : loading ? (
        <LoadingSpinner height={200} />
      ) : students.length === 0 ? (
        <EmptyState icon={Users} title="No students found" desc="No students in this class" />
      ) : filteredStudents.length === 0 ? (
        <EmptyState icon={Search} title="No matches" desc="No students match your search" />
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Admission No.</th>
                  <th className="px-4 py-3 font-medium">Score (max: {selectedAssessment?.max_score})</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => (
                  <tr key={s.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{i + 1}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: PLUM }}>{s.name}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{s.admission_no || "—"}</td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" max={selectedAssessment?.max_score || 100}
                        value={scores[s.id] ?? ""}
                        onChange={(e) => setScores(prev => ({ ...prev, [s.id]: e.target.value === "" ? null as unknown as number : Number(e.target.value) }))}
                        className="w-24 px-3 py-2 rounded-xl outline-none text-sm"
                        style={{ background: scores[s.id] !== undefined && scores[s.id] !== null ? "#D1FAE5" : MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Report Cards Tab ─────────────────────────────────────────
function ReportCardsTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [cards, setCards] = useState<ReportCard[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [scales, setScales] = useState<GradingScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ term_id: "", class_id: "", status: "" });
  const [showGenerate, setShowGenerate] = useState(false);
  const [previewCard, setPreviewCard] = useState<ReportCard | null>(null);
  const [genForm, setGenForm] = useState({ class_id: "", term_id: "", session_id: "", student_id: "", scale_id: "" });
  const [students, setStudents] = useState<Student[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, tRes, sRes, clRes, scRes] = await Promise.all([
        api.get<any>("/api/school/report-cards"),
        api.get<any>("/api/school/terms"),
        api.get<any>("/api/school/sessions"),
        api.get<any>("/api/school/classes"),
        api.get<any>("/api/school/grading-scales"),
      ]);
      setCards(cRes.data?.data?.reportCards || []);
      setTerms(tRes.data?.data?.terms || tRes.data?.terms || []);
      setSessions(sRes.data?.data?.sessions || sRes.data?.sessions || []);
      setClasses(clRes.data?.data?.classes || clRes.data?.classes || []);
      setScales(scRes.data?.data?.scales || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (genForm.class_id) {
      api.get<any>(`/api/school/students?classId=${genForm.class_id}&limit=500`)
        .then(res => setStudents(res.data?.data?.students || res.data?.students || []))
        .catch(() => setStudents([]));
    }
  }, [genForm.class_id]);

  const filtered = cards.filter(c => {
    if (filters.class_id && c.class_id !== filters.class_id) return false;
    if (filters.term_id && c.term_id !== filters.term_id) return false;
    if (filters.status && c.status !== filters.status) return false;
    return true;
  });

  const handleGenerate = async () => {
    if (!genForm.class_id || !genForm.term_id || !genForm.student_id) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/report-cards/generate", genForm);
      setSuccess("Report card generated");
      setShowGenerate(false);
      setGenForm({ class_id: "", term_id: "", session_id: "", student_id: "", scale_id: "" });
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handlePublish = async (id: string) => {
    try {
      await api.put(`/api/school/report-cards/${id}/publish`);
      setSuccess("Report card published");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/api/school/report-cards/${id}/approve`);
      setSuccess("Report card approved");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); }
  };

  if (loading) return <LoadingSpinner height={200} />;

  const statusStyles: Record<string, { bg: string; color: string }> = {
    draft: { bg: "#FEF3C7", color: "#B45309" },
    published: { bg: "#D1FAE5", color: "#065F46" },
    approved: { bg: "#EEF2FF", color: "#3730A3" },
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <SummaryCard icon={Star} label="Total Report Cards" value={cards.length} />
        <SummaryCard icon={Eye} label="Draft" value={cards.filter(c => c.status === "draft").length} color="#F59E0B" />
        <SummaryCard icon={SendHorizonal} label="Published" value={cards.filter(c => c.status === "published").length} color="#10B981" />
        <SummaryCard icon={ShieldCheck} label="Approved" value={cards.filter(c => c.status === "approved").length} color="#6366F1" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setShowGenerate(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          <Plus size={14} /> Generate Report Card
        </button>
        <select value={filters.term_id} onChange={(e) => setFilters(p => ({ ...p, term_id: e.target.value }))}
          className="px-3 py-2 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
          <option value="">All terms</option>
          {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={filters.class_id} onChange={(e) => setFilters(p => ({ ...p, class_id: e.target.value }))}
          className="px-3 py-2 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
          <option value="">All classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
          className="px-3 py-2 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="approved">Approved</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Star} title="No report cards yet" desc="Generate report cards from assessment scores" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => {
            const st = statusStyles[c.status] || statusStyles.draft;
            return (
              <div key={c.id} className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
                      {c.student?.name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: PLUM }}>{c.student?.name || "Unknown"}</p>
                      <p className="text-xs" style={{ color: MUTED }}>{c.class?.name} · {c.term?.name}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0" style={{ background: st.bg, color: st.color }}>{c.status}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 rounded-lg" style={{ background: "rgba(99,102,241,0.08)" }}>
                    <p className="text-lg font-bold" style={{ color: "#6366F1" }}>{c.average}%</p>
                    <p className="text-[10px] uppercase" style={{ color: MUTED }}>Average</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: "rgba(16,185,129,0.08)" }}>
                    <p className="text-lg font-bold" style={{ color: "#065F46" }}>{c.grade}</p>
                    <p className="text-[10px] uppercase" style={{ color: MUTED }}>Grade</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ background: "rgba(245,158,11,0.08)" }}>
                    <p className="text-lg font-bold" style={{ color: "#B45309" }}>#{c.rank}</p>
                    <p className="text-[10px] uppercase" style={{ color: MUTED }}>Rank</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs" style={{ color: MUTED }}>
                  <span>{c.subject_count} subject{c.subject_count !== 1 ? "s" : ""}</span>
                  <span>Score: {c.total_score}/{c.total_max_score}</span>
                </div>
                <div className="flex gap-1 mt-2 pt-2" style={{ borderTop: "1px solid rgba(56,25,50,0.06)" }}>
                  <button onClick={() => setPreviewCard(c)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium"
                    style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}>
                    <Eye size={12} /> Preview
                  </button>
                  {c.status === "draft" && (
                    <button onClick={() => handlePublish(c.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: "#D1FAE5", color: "#065F46" }}>
                      <SendHorizonal size={12} /> Publish
                    </button>
                  )}
                  {c.status === "published" && (
                    <button onClick={() => handleApprove(c.id)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: "#EEF2FF", color: "#3730A3" }}>
                      <ShieldCheck size={12} /> Approve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showGenerate && (
        <Modal title="Generate Report Card" onClose={() => setShowGenerate(false)} saving={saving} onSave={handleGenerate}>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Class</label>
          <select value={genForm.class_id} onChange={(e) => setGenForm(p => ({ ...p, class_id: e.target.value, student_id: "" }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm mb-3"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Student</label>
          <select value={genForm.student_id} onChange={(e) => setGenForm(p => ({ ...p, student_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm mb-3"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select student...</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Term</label>
          <select value={genForm.term_id} onChange={(e) => setGenForm(p => ({ ...p, term_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm mb-3"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select term...</option>
            {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Session (optional)</label>
          <select value={genForm.session_id} onChange={(e) => setGenForm(p => ({ ...p, session_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm mb-3"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select session...</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Grading Scale (optional)</label>
          <select value={genForm.scale_id} onChange={(e) => setGenForm(p => ({ ...p, scale_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Default scale</option>
            {scales.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Modal>
      )}

      {previewCard && (
        <Modal title="Report Card Preview" onClose={() => setPreviewCard(null)} wide>
          <div className="p-6 rounded-2xl" style={{ background: MILK }}>
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg" style={{ color: PLUM }}>Term Report</h3>
              <p className="text-sm" style={{ color: MUTED }}>{previewCard.student?.name} — {previewCard.class?.name} · {previewCard.term?.name}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Average", value: `${previewCard.average}%` },
                { label: "Grade", value: previewCard.grade },
                { label: "Rank", value: `#${previewCard.rank}` },
                { label: "Subjects", value: previewCard.subject_count },
                { label: "Total Score", value: `${previewCard.total_score}/${previewCard.total_max_score}` },
                { label: "Status", value: previewCard.status.charAt(0).toUpperCase() + previewCard.status.slice(1) },
              ].map(item => (
                <div key={item.label} className="text-center p-3 rounded-xl" style={{ background: "white" }}>
                  <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>{item.label}</p>
                  <p className="text-lg font-bold mt-1" style={{ color: PLUM }}>{item.value}</p>
                </div>
              ))}
            </div>
            {previewCard.session && (
              <p className="text-center text-xs" style={{ color: MUTED }}>Session: {previewCard.session.name}</p>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
