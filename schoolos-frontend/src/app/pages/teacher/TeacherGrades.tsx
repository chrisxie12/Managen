import { useState } from "react";
import { ChevronDown, Lock, Save, BookOpen, CheckCircle2 } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const PRIMARY = "#0080FF";

const ASSESSMENTS = ["Midterm Exam", "End of Term", "Class Test 1", "Class Test 2", "Project Work"];
const SUBJECTS = ["Mathematics", "English", "Science"];
const CLASSES = ["Form 1A", "Form 1B", "Form 2A", "Form 3"];

type Grade = "A" | "B" | "C" | "D" | "F" | "-";

function calcGrade(score: number | ""): Grade {
  if (score === "") return "-";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

const GRADE_STYLE: Record<Grade, { color: string; bg: string }> = {
  A: { color: SUCCESS,  bg: "#D1FAE5" },
  B: { color: PRIMARY,  bg: "#DBEAFE" },
  C: { color: WARNING,  bg: "#FEF3C7" },
  D: { color: "#D97706", bg: "#FDE68A" },
  F: { color: DANGER,   bg: "#FEE2E2" },
  "-": { color: MUTED,  bg: "#F3F4F6" },
};

type StudentRow = {
  id: string;
  name: string;
  admissionNo: string;
  score: number | "";
  remarks: string;
};

const BASE_STUDENTS: Omit<StudentRow, "score" | "remarks">[] = [
  { id: "1",  name: "Kwame Asante",         admissionNo: "GHA-2024-001" },
  { id: "2",  name: "Abena Mensah",          admissionNo: "GHA-2024-002" },
  { id: "3",  name: "Kofi Boateng",          admissionNo: "GHA-2024-003" },
  { id: "4",  name: "Ama Owusu",             admissionNo: "GHA-2024-004" },
  { id: "5",  name: "Yaw Darko",             admissionNo: "GHA-2024-005" },
  { id: "6",  name: "Akosua Frimpong",       admissionNo: "GHA-2024-006" },
  { id: "7",  name: "Kojo Acheampong",       admissionNo: "GHA-2024-007" },
  { id: "8",  name: "Efua Antwi",            admissionNo: "GHA-2024-008" },
  { id: "9",  name: "Nana Yaw Oppong",       admissionNo: "GHA-2024-009" },
  { id: "10", name: "Adwoa Kyei",            admissionNo: "GHA-2024-010" },
  { id: "11", name: "Kwabena Ofori",         admissionNo: "GHA-2024-011" },
  { id: "12", name: "Afia Bonsu",            admissionNo: "GHA-2024-012" },
  { id: "13", name: "Kweku Sarpong",         admissionNo: "GHA-2024-013" },
  { id: "14", name: "Maame Konadu",          admissionNo: "GHA-2024-014" },
  { id: "15", name: "Paa Kwesi Amponsah",    admissionNo: "GHA-2024-015" },
  { id: "16", name: "Abena Asiedu",          admissionNo: "GHA-2024-016" },
  { id: "17", name: "Fiifi Quaye",           admissionNo: "GHA-2024-017" },
  { id: "18", name: "Araba Mensah",          admissionNo: "GHA-2024-018" },
  { id: "19", name: "Kwadwo Osei",           admissionNo: "GHA-2024-019" },
  { id: "20", name: "Akua Boateng",          admissionNo: "GHA-2024-020" },
  { id: "21", name: "Nii Adjei",             admissionNo: "GHA-2024-021" },
  { id: "22", name: "Serwaah Tetteh",        admissionNo: "GHA-2024-022" },
  { id: "23", name: "Kofi Atta",             admissionNo: "GHA-2024-023" },
  { id: "24", name: "Akweley Lomo",          admissionNo: "GHA-2024-024" },
  { id: "25", name: "Emmanuel Asumadu",      admissionNo: "GHA-2024-025" },
];

function freshStudents(): StudentRow[] {
  return BASE_STUDENTS.map(s => ({ ...s, score: "", remarks: "" }));
}

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
}

function getInitialColor(name: string) {
  const colors = ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444", "#06B6D4"];
  return colors[name.charCodeAt(0) % colors.length];
}

export function TeacherGrades() {
  const [assessment, setAssessment] = useState(ASSESSMENTS[0]);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [cls, setCls] = useState(CLASSES[0]);
  const [students, setStudents] = useState<StudentRow[]>(freshStudents());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFilterChange = () => {
    setSaved(false);
    setStudents(freshStudents());
  };

  const setScore = (id: string, val: string) => {
    const num = val === "" ? "" : Math.min(100, Math.max(0, Number(val)));
    setStudents(prev => prev.map(s => s.id === id ? { ...s, score: num } : s));
  };

  const setRemarks = (id: string, val: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, remarks: val } : s));
  };

  const autoCalculate = () => {
    setStudents(prev =>
      prev.map(s => {
        const g = calcGrade(s.score);
        const remarks =
          g === "A" ? "Excellent" :
          g === "B" ? "Good" :
          g === "C" ? "Average" :
          g === "D" ? "Below Average" :
          g === "F" ? "Needs Improvement" : "";
        return { ...s, remarks };
      })
    );
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
    }, 1200);
  };

  const graded = students.filter(s => s.score !== "").length;
  const avg = graded > 0
    ? (students.reduce((acc, s) => acc + (s.score !== "" ? Number(s.score) : 0), 0) / graded).toFixed(1)
    : "—";

  const dist: Record<Grade, number> = { A: 0, B: 0, C: 0, D: 0, F: 0, "-": 0 };
  students.forEach(s => { dist[calcGrade(s.score)]++; });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Grade Entry</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Enter and manage student scores for assessments</p>
        </div>
        {saved && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium" style={{ background: "#D1FAE5", color: SUCCESS }}>
            <Lock size={14} /> Grades Locked
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: "Assessment", value: assessment, options: ASSESSMENTS, onChange: (v: string) => { setAssessment(v); handleFilterChange(); } },
          { label: "Subject",    value: subject,    options: SUBJECTS,    onChange: (v: string) => { setSubject(v);    handleFilterChange(); } },
          { label: "Class",      value: cls,        options: CLASSES,     onChange: (v: string) => { setCls(v);        handleFilterChange(); } },
        ].map(f => (
          <div key={f.label} className="relative">
            <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>{f.label}</label>
            <select
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border text-sm font-medium appearance-none cursor-pointer bg-white pr-9"
              style={{ color: NAVY }}
            >
              {f.options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <ChevronDown size={15} className="absolute right-3 bottom-3 pointer-events-none" style={{ color: MUTED }} />
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {(["A","B","C","D","F"] as Grade[]).map(g => (
          <div key={g} className="bg-card border border-border rounded-2xl p-3 text-center">
            <div className="text-xl font-bold" style={{ color: GRADE_STYLE[g].color }}>{dist[g]}</div>
            <div className="text-xs mt-0.5 font-medium" style={{ color: GRADE_STYLE[g].color }}>Grade {g}</div>
          </div>
        ))}
      </div>

      {saved ? (
        /* Read-only view */
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border" style={{ background: "#F9FAFB" }}>
            <div className="flex items-center gap-2">
              <Lock size={15} style={{ color: NAVY }} />
              <span className="font-semibold text-sm" style={{ color: NAVY }}>
                {assessment} — {subject} — {cls}
              </span>
            </div>
            <div className="text-sm" style={{ color: MUTED }}>Class average: <span className="font-bold" style={{ color: NAVY }}>{avg}</span></div>
            <button onClick={() => setSaved(false)} className="text-xs underline" style={{ color: PRIMARY }}>Edit Grades</button>
          </div>
          <div className="divide-y divide-border">
            {students.map((s, idx) => {
              const g = calcGrade(s.score);
              return (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-xs w-5 text-right" style={{ color: MUTED }}>{idx + 1}</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: getInitialColor(s.name) }}>
                    {getInitials(s.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: NAVY }}>{s.name}</div>
                    <div className="text-xs" style={{ color: MUTED }}>{s.admissionNo}</div>
                  </div>
                  <div className="text-sm font-bold w-12 text-right" style={{ color: NAVY }}>{s.score !== "" ? s.score : "—"}</div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full w-8 text-center" style={{ background: GRADE_STYLE[g].bg, color: GRADE_STYLE[g].color }}>{g}</span>
                  <div className="text-xs w-32 truncate hidden sm:block" style={{ color: MUTED }}>{s.remarks}</div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Editable table */
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={autoCalculate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-slate-50 transition-colors"
              style={{ color: NAVY }}
            >
              <BookOpen size={14} /> Auto-calculate Remarks
            </button>
            <span className="text-xs px-3 py-2 rounded-xl border border-border" style={{ color: MUTED }}>
              {graded}/{students.length} graded · Avg: {avg}
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr style={{ background: "#F9FAFB" }}>
                    <th className="px-4 py-3 text-left font-semibold w-8 border-b border-border" style={{ color: MUTED }}>#</th>
                    <th className="px-4 py-3 text-left font-semibold border-b border-border" style={{ color: MUTED }}>Student</th>
                    <th className="px-4 py-3 text-center font-semibold w-28 border-b border-border" style={{ color: MUTED }}>Score /100</th>
                    <th className="px-4 py-3 text-center font-semibold w-20 border-b border-border" style={{ color: MUTED }}>Grade</th>
                    <th className="px-4 py-3 text-left font-semibold border-b border-border" style={{ color: MUTED }}>Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((s, idx) => {
                    const g = calcGrade(s.score);
                    return (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2.5 text-xs" style={{ color: MUTED }}>{idx + 1}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: getInitialColor(s.name) }}>
                              {getInitials(s.name)}
                            </div>
                            <div>
                              <div className="font-medium text-xs" style={{ color: NAVY }}>{s.name}</div>
                              <div className="text-[11px]" style={{ color: MUTED }}>{s.admissionNo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={s.score}
                            onChange={e => setScore(s.id, e.target.value)}
                            placeholder="—"
                            className="w-20 text-center px-2 py-1.5 rounded-lg border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-300"
                            style={{ color: NAVY }}
                          />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: GRADE_STYLE[g].bg, color: GRADE_STYLE[g].color }}>{g}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={s.remarks}
                            onChange={e => setRemarks(s.id, e.target.value)}
                            placeholder="Optional remarks..."
                            className="w-full px-2 py-1.5 rounded-lg border border-border text-xs focus:outline-none focus:ring-2 focus:ring-blue-300"
                            style={{ color: NAVY }}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || graded === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
              style={{ background: SUCCESS }}
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
              ) : (
                <><Save size={15} /> Save Grades</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
