import { useState, useEffect, useMemo } from "react";
import { Loader2, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../../services/api";
import { useMetaData, useGradebookData, type AssessmentItem, type StudentBasic } from "../../../hooks/useGradebook";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";
const BG = "#F9F1E7";

const GRADE_BANDS = [
  { min: 80, max: 100, label: "EE", color: "#22c55e", desc: "Exceeding Expectation" },
  { min: 65, max: 79.99, label: "ME", color: "#3b82f6", desc: "Meeting Expectation" },
  { min: 50, max: 64.99, label: "AE", color: "#f59e0b", desc: "Approaching Expectation" },
  { min: 0, max: 49.99, label: "B", color: "#ef4444", desc: "Developing" },
];

function getGradeBand(pct: number) {
  return GRADE_BANDS.find(b => pct >= b.min && pct <= b.max) || GRADE_BANDS[GRADE_BANDS.length - 1];
}

export function GradebookGrid() {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<AssessmentItem[]>([]);
  const [students, setStudents] = useState<StudentBasic[]>([]);
  const [scores, setScores] = useState<Record<string, Record<string, string>>>({});
  const [dirty, setDirty] = useState(false);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  const [addingItem, setAddingItem] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"SBA" | "EXAM">("SBA");
  const [newItemMax, setNewItemMax] = useState("100");

  const { data: meta } = useMetaData();
  const classes = meta?.classes ?? [];
  const subjects = meta?.subjects ?? [];
  const terms = meta?.terms ?? [];

  const { data: gb, isLoading, refetch: refetchGradebook } = useGradebookData(selectedClass, selectedSubject, selectedTerm);
  const loading = isLoading;
  useEffect(() => {
    if (gb && !dirty) {
      setItems(gb.items);
      setStudents(gb.students);
      setScores(gb.scores);
    } else if (gb && dirty) {
      setStudents(gb.students);
      const merged = { ...scores };
      for (const [sid, itemScores] of Object.entries(gb.scores)) {
        if (!merged[sid]) merged[sid] = {};
        for (const [itemId, val] of Object.entries(itemScores)) {
          if (!merged[sid][itemId]) merged[sid][itemId] = val;
        }
      }
      setScores((prev) => (Object.keys(prev).length > 0 ? prev : gb.scores));
    }
  }, [gb]);

  const sbaItems = useMemo(() => items.filter(i => i.assessment_type === "SBA"), [items]);
  const examItems = useMemo(() => items.filter(i => i.assessment_type === "EXAM"), [items]);

  const studentRows = useMemo(() => {
    return students.map(student => {
      let sbaSum = 0, sbaMax = 0, examSum = 0, examMax = 0;

      sbaItems.forEach(item => {
        const val = parseFloat(scores[student.id]?.[item.id]) || 0;
        sbaSum += val;
        sbaMax += item.max_points;
      });
      examItems.forEach(item => {
        const val = parseFloat(scores[student.id]?.[item.id]) || 0;
        examSum += val;
        examMax += item.max_points;
      });

      const sbaWeighted = sbaMax > 0 ? (sbaSum / sbaMax) * 30 : 0;
      const examWeighted = examMax > 0 ? (examSum / examMax) * 70 : 0;
      const finalPct = sbaWeighted + examWeighted;
      const band = getGradeBand(finalPct);

      return { student, sbaSum, sbaMax, examSum, examMax, sbaWeighted: Math.round(sbaWeighted * 100) / 100, examWeighted: Math.round(examWeighted * 100) / 100, finalPct: Math.round(finalPct * 100) / 100, band };
    });
  }, [students, scores, sbaItems, examItems]);

  const handleScoreChange = (studentId: string, itemId: string, value: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const num = parseFloat(value);
    if (value !== "" && (isNaN(num) || num < 0)) return;
    if (num > item.max_points) return;

    setScores(prev => {
      const updated = { ...prev };
      if (!updated[studentId]) updated[studentId] = {};
      if (value === "" || value === "0") {
        delete updated[studentId][itemId];
      } else {
        updated[studentId] = { ...updated[studentId], [itemId]: value };
      }
      return updated;
    });
    setDirty(true);
  };

  const handleBlurCommit = async (studentId: string, itemId: string) => {
    const val = scores[studentId]?.[itemId];
    if (val === undefined || val === "") return;
    try {
      await api.post("/api/grades/save", {
        scores: [{ student_id: studentId, assessment_item_id: itemId, score_achieved: parseFloat(val) }],
      });
    } catch { /* swallow individual save errors, bulk save handles it */ }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload: { student_id: string; assessment_item_id: string; score_achieved: number }[] = [];
      Object.entries(scores).forEach(([studentId, itemScores]) => {
        Object.entries(itemScores).forEach(([itemId, val]) => {
          if (val !== undefined && val !== "") {
            payload.push({ student_id: studentId, assessment_item_id: itemId, score_achieved: parseFloat(val) });
          }
        });
      });

      if (payload.length === 0) {
        toast.info("No scores to save");
        return;
      }
      await api.post("/api/grades/save", { scores: payload });
      setDirty(false);
      toast.success(`Saved ${payload.length} scores`);
    } catch (err: any) {
      toast.error(err.message || "Failed to save scores");
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim() || !newItemMax) return;
    setAddingItem(true);
    try {
      const res = await api.post<{ data: AssessmentItem }>("/api/grades/items", {
        class_id: selectedClass,
        subject_id: selectedSubject,
        term_id: selectedTerm,
        assessment_type: newItemType,
        name: newItemName.trim(),
        max_points: parseFloat(newItemMax),
        sort_order: items.length,
      });
      if (res.data) setItems(prev => [...prev, res.data!]);
      setNewItemName("");
      setNewItemType("SBA");
      setNewItemMax("100");
      toast.success(`Added ${newItemType} item`);
    } catch (err: any) {
      toast.error(err.message || "Failed to add item");
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.delete(`/api/grades/items/${itemId}`);
      setItems(prev => prev.filter(i => i.id !== itemId));
      setScores(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(sid => { delete updated[sid][itemId]; if (Object.keys(updated[sid]).length === 0) delete updated[sid]; });
        return updated;
      });
      setDirty(true);
      toast.success("Assessment item deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete item");
    }
  };

  const hasItems = items.length > 0;

  if (loading && !selectedClass && !selectedSubject && !selectedTerm) {
    return <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin" color={MUTED} /></div>;
  }

  return (
    <div className="p-6 h-full flex flex-col" style={{ background: CREAM }}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Gradebook & SBA</h1>
        {hasItems && (
          <button onClick={handleSaveAll} disabled={saving || !dirty}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
            style={{ background: dirty ? NAVY : MUTED, color: CREAM }}>
            <Save size={16} />
            {saving ? "Saving..." : "Save All Changes"}
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-4 items-end">
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Class</label>
          <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm border min-w-[160px]"
            style={{ borderColor: "rgba(56,25,50,0.15)", background: "#fff", color: NAVY }}>
            <option value="">Select class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Subject</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm border min-w-[160px]"
            style={{ borderColor: "rgba(56,25,50,0.15)", background: "#fff", color: NAVY }}>
            <option value="">Select subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Term</label>
          <select value={selectedTerm} onChange={e => setSelectedTerm(e.target.value)}
            className="rounded-xl px-3 py-2 text-sm border min-w-[160px]"
            style={{ borderColor: "rgba(56,25,50,0.15)", background: "#fff", color: NAVY }}>
            <option value="">Select term...</option>
            {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <button onClick={() => refetchGradebook()} disabled={!selectedClass || !selectedSubject || !selectedTerm}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: NAVY, color: CREAM }}>
          <Loader2 size={14} className={loading ? "animate-spin" : "hidden"} />
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {/* Add Assessment Item */}
      {selectedClass && selectedSubject && selectedTerm && (
        <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-2xl items-center" style={{ background: BG, border: "1px solid rgba(56,25,50,0.08)" }}>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: MUTED }}>Add Assessment:</span>
          <input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="e.g. Exercise 1"
            className="rounded-xl px-3 py-1.5 text-sm border flex-1 min-w-[160px]"
            style={{ borderColor: "rgba(56,25,50,0.15)", background: "#fff", color: NAVY }} />
          <select value={newItemType} onChange={e => setNewItemType(e.target.value as "SBA" | "EXAM")}
            className="rounded-xl px-3 py-1.5 text-sm border" style={{ borderColor: "rgba(56,25,50,0.15)", background: "#fff", color: NAVY }}>
            <option value="SBA">SBA (30%)</option>
            <option value="EXAM">Exam (70%)</option>
          </select>
          <input value={newItemMax} onChange={e => setNewItemMax(e.target.value)} placeholder="Max pts"
            type="number" min="1" className="rounded-xl px-3 py-1.5 text-sm border w-20"
            style={{ borderColor: "rgba(56,25,50,0.15)", background: "#fff", color: NAVY }} />
          <button onClick={handleAddItem} disabled={addingItem || !newItemName.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: NAVY, color: CREAM }}>
            <Plus size={14} /> {addingItem ? "Adding..." : "Add"}
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto rounded-2xl border" style={{ borderColor: "rgba(56,25,50,0.1)", background: "#fff" }}>
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin" color={MUTED} /></div>
        ) : !selectedClass || !selectedSubject || !selectedTerm ? (
          <div className="text-center py-20" style={{ color: MUTED }}>
            <p className="font-semibold" style={{ color: NAVY }}>Select Filters</p>
            <p className="text-sm mt-1">Choose a class, subject, and term to load the gradebook.</p>
          </div>
        ) : !hasItems ? (
          <div className="text-center py-16" style={{ color: MUTED }}>
            <p className="font-semibold" style={{ color: NAVY }}>No Assessment Items Yet</p>
            <p className="text-sm mt-1">Use the "Add Assessment" bar above to create SBA or Exam items.</p>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="sticky top-0 z-10" style={{ background: NAVY }}>
                <th className="sticky left-0 z-20 text-left px-3 py-2.5 font-semibold text-xs uppercase tracking-wider whitespace-nowrap min-w-[160px]"
                  style={{ background: NAVY, color: CREAM }}>Student</th>

                {/* SBA Header */}
                {sbaItems.length > 0 && (
                  <th colSpan={sbaItems.length}
                    className="px-3 py-2 font-semibold text-xs uppercase tracking-wider text-center whitespace-nowrap"
                    style={{ background: "#6B7280", color: CREAM }}>
                    School-Based Assessment (×30%)
                  </th>
                )}

                {sbaItems.length > 0 && examItems.length > 0 && (
                  <th className="px-2 py-2" style={{ background: NAVY, width: 24 }} />
                )}

                {/* EXAM Header */}
                {examItems.length > 0 && (
                  <th colSpan={examItems.length}
                    className="px-3 py-2 font-semibold text-xs uppercase tracking-wider text-center whitespace-nowrap"
                    style={{ background: "#0C2D8A", color: CREAM }}>
                    Terminal Examination (×70%)
                  </th>
                )}

                {/* Separator before summary */}
                <th className="sticky right-[268px] z-10 px-2 py-2" style={{ background: NAVY, width: 12 }} />

                {/* Summary columns — cascade right values: 268→196→124→52→0 */}
                <th className="sticky right-[196px] z-20 px-2.5 py-2 font-semibold text-xs uppercase tracking-wider text-center whitespace-nowrap min-w-[72px]"
                  style={{ background: NAVY, color: CREAM }}>SBA<br/>(30%)</th>
                <th className="sticky right-[124px] z-20 px-2.5 py-2 font-semibold text-xs uppercase tracking-wider text-center whitespace-nowrap min-w-[72px]"
                  style={{ background: NAVY, color: CREAM }}>Exam<br/>(70%)</th>
                <th className="sticky right-[52px] z-20 px-2.5 py-2 font-semibold text-xs uppercase tracking-wider text-center whitespace-nowrap min-w-[72px]"
                  style={{ background: NAVY, color: CREAM }}>Final<br/>%</th>
                <th className="sticky right-0 z-30 px-2.5 py-2 font-semibold text-xs uppercase tracking-wider text-center min-w-[52px]"
                  style={{ background: NAVY, color: CREAM }}>Grade</th>
              </tr>

              {/* Sub-header row for item names */}
              <tr style={{ background: "#f0e6d8" }}>
                <th className="sticky left-0 z-10 px-3 py-1.5 font-medium text-xs"
                  style={{ background: "#f0e6d8", color: MUTED }}></th>

                {sbaItems.map(item => (
                  <th key={item.id} className="relative px-2 py-1.5 font-medium text-xs text-center group min-w-[80px]"
                    style={{ color: NAVY }}>
                    <div className="flex items-center justify-center gap-1">
                      <span className="truncate max-w-[70px]">{item.name}</span>
                      <button onClick={() => handleDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100">
                        <Trash2 size={10} color="#ef4444" />
                      </button>
                    </div>
                    <div style={{ color: MUTED, fontSize: "0.6rem" }}>max {item.max_points}</div>
                  </th>
                ))}

                {sbaItems.length > 0 && examItems.length > 0 && (
                  <th className="px-2 py-1.5" style={{ background: "#f0e6d8", width: 24 }} />
                )}

                {examItems.map(item => (
                  <th key={item.id} className="relative px-2 py-1.5 font-medium text-xs text-center group min-w-[80px]"
                    style={{ color: NAVY }}>
                    <div className="flex items-center justify-center gap-1">
                      <span className="truncate max-w-[70px]">{item.name}</span>
                      <button onClick={() => handleDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100">
                        <Trash2 size={10} color="#ef4444" />
                      </button>
                    </div>
                    <div style={{ color: MUTED, fontSize: "0.6rem" }}>max {item.max_points}</div>
                  </th>
                ))}

                <th className="sticky right-[268px] z-10 px-1.5 py-1.5" style={{ background: "#f0e6d8", width: 12 }} />
                <th className="sticky right-[196px] z-10 px-2.5 py-1.5" style={{ background: "#f0e6d8", width: 72 }} />
                <th className="sticky right-[124px] z-10 px-2.5 py-1.5" style={{ background: "#f0e6d8", width: 72 }} />
                <th className="sticky right-[52px] z-10 px-2.5 py-1.5" style={{ background: "#f0e6d8", width: 72 }} />
                <th className="sticky right-0 z-10 px-2.5 py-1.5" style={{ background: "#f0e6d8", width: 52 }} />
              </tr>
            </thead>

            <tbody>
              {studentRows.map((row, idx) => (
                <tr key={row.student.id}
                  className="transition-colors hover:bg-opacity-50"
                  style={{ background: idx % 2 === 0 ? "#fff" : "rgba(249,241,231,0.4)" }}>
                  {/* Student name column */}
                  <td className="sticky left-0 z-10 px-3 py-2 font-medium text-sm whitespace-nowrap"
                    style={{ background: idx % 2 === 0 ? "#fff" : "rgba(249,241,231,0.4)", color: NAVY }}>
                    {row.student.first_name} {row.student.last_name}
                    {row.student.admission_number && (
                      <span className="ml-2 text-xs" style={{ color: MUTED }}>#{row.student.admission_number}</span>
                    )}
                  </td>

                  {/* SBA score cells */}
                  {sbaItems.map(item => {
                    const val = scores[row.student.id]?.[item.id] || "";
                    const numVal = parseFloat(val);
                    const isOver = !isNaN(numVal) && numVal > item.max_points;
                    return (
                      <td key={item.id} className="px-1.5 py-1 text-center">
                        <input value={val} onChange={e => handleScoreChange(row.student.id, item.id, e.target.value)}
                          onBlur={() => handleBlurCommit(row.student.id, item.id)}
                          className="w-full max-w-[60px] mx-auto px-1.5 py-1 rounded-lg text-center text-sm border transition-all"
                          style={{
                            borderColor: isOver ? "#ef4444" : "rgba(56,25,50,0.12)",
                            color: NAVY,
                            background: val ? "#fff" : "rgba(249,241,231,0.5)",
                          }}
                          type="number" min="0" step="any" />
                      </td>
                    );
                  })}

                  {sbaItems.length > 0 && examItems.length > 0 && (
                    <td className="px-2 py-2" style={{ background: BG, width: 24 }}>
                      <div style={{ width: 1, height: "100%", background: "rgba(56,25,50,0.1)", margin: "0 auto" }} />
                    </td>
                  )}

                  {/* EXAM score cells */}
                  {examItems.map(item => {
                    const val = scores[row.student.id]?.[item.id] || "";
                    const numVal = parseFloat(val);
                    const isOver = !isNaN(numVal) && numVal > item.max_points;
                    return (
                      <td key={item.id} className="px-1.5 py-1 text-center">
                        <input value={val} onChange={e => handleScoreChange(row.student.id, item.id, e.target.value)}
                          onBlur={() => handleBlurCommit(row.student.id, item.id)}
                          className="w-full max-w-[60px] mx-auto px-1.5 py-1 rounded-lg text-center text-sm border transition-all"
                          style={{
                            borderColor: isOver ? "#ef4444" : "rgba(56,25,50,0.12)",
                            color: NAVY,
                            background: val ? "#fff" : "rgba(249,241,231,0.5)",
                          }}
                          type="number" min="0" step="any" />
                      </td>
                    );
                  })}

                  {/* Separator */}
                  <td className="sticky right-[268px] z-10 px-1.5 py-2" style={{ background: BG, width: 12 }}>
                    <div style={{ width: 1, height: "100%", background: "rgba(56,25,50,0.1)", margin: "0 auto" }} />
                  </td>

                  {/* SBA Weighted */}
                  <td className="sticky right-[196px] z-10 px-2.5 py-2 text-center font-semibold text-sm"
                    style={{ background: idx % 2 === 0 ? "#fff" : "rgba(249,241,231,0.4)", color: NAVY }}>
                    {row.sbaWeighted.toFixed(1)}
                  </td>

                  {/* Exam Weighted */}
                  <td className="sticky right-[124px] z-10 px-2.5 py-2 text-center font-semibold text-sm"
                    style={{ background: idx % 2 === 0 ? "#fff" : "rgba(249,241,231,0.4)", color: NAVY }}>
                    {row.examWeighted.toFixed(1)}
                  </td>

                  {/* Final % */}
                  <td className="sticky right-[52px] z-10 px-2.5 py-2 text-center font-bold text-sm"
                    style={{ background: idx % 2 === 0 ? "#fff" : "rgba(249,241,231,0.4)", color: NAVY }}>
                    {row.finalPct.toFixed(1)}
                  </td>

                  {/* Grade Badge */}
                  <td className="sticky right-0 z-20 px-2.5 py-2 text-center" style={{ background: idx % 2 === 0 ? "#fff" : "rgba(249,241,231,0.4)" }}>
                    <span className="inline-block px-2 py-0.5 rounded-lg text-xs font-bold"
                      style={{ background: `${row.band.color}20`, color: row.band.color }}>
                      {row.band.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Legend */}
      {hasItems && (
        <div className="flex gap-4 mt-3 text-xs" style={{ color: MUTED }}>
          <span><span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{ background: "#22c55e" }} /> EE (≥80%)</span>
          <span><span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{ background: "#3b82f6" }} /> ME (65-79%)</span>
          <span><span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{ background: "#f59e0b" }} /> AE (50-64%)</span>
          <span><span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{ background: "#ef4444" }} /> B (&lt;50%)</span>
        </div>
      )}
    </div>
  );
}
