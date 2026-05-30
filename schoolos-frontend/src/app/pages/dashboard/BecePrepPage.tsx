import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Download, BookOpen, TrendingUp } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const PRIMARY = "#031B4E";
const INFO = "#3B82F6";

const BECE_SUBJECTS = [
  "English",
  "Maths",
  "Science",
  "Social",
  "RME",
  "ICT",
  "French",
  "Ghanaian Lang",
  "Creative Arts",
  "Career Tech",
];

const FULL_SUBJECT_NAMES: Record<string, string> = {
  English: "English Language",
  Maths: "Mathematics",
  Science: "Integrated Science",
  Social: "Social Studies",
  RME: "Religious & Moral Education",
  ICT: "ICT",
  French: "French",
  "Ghanaian Lang": "Ghanaian Language",
  "Creative Arts": "Creative Arts",
  "Career Tech": "Career Technology",
};

type PerformanceBand = "All" | "On Track" | "At Risk" | "Critical";

interface StudentScores {
  English: number;
  Maths: number;
  Science: number;
  Social: number;
  RME: number;
  ICT: number;
  French: number;
  "Ghanaian Lang": number;
  "Creative Arts": number;
  "Career Tech": number;
}

interface BECEStudent {
  id: string;
  name: string;
  gender: "M" | "F";
  scores: StudentScores;
}

const mockStudents: BECEStudent[] = [
  {
    id: "1",
    name: "Ama Owusu",
    gender: "F",
    scores: { English: 72, Maths: 68, Science: 75, Social: 70, RME: 80, ICT: 65, French: 58, "Ghanaian Lang": 74, "Creative Arts": 82, "Career Tech": 71 },
  },
  {
    id: "2",
    name: "Kwame Asante",
    gender: "M",
    scores: { English: 55, Maths: 80, Science: 78, Social: 60, RME: 62, ICT: 85, French: 44, "Ghanaian Lang": 58, "Creative Arts": 55, "Career Tech": 76 },
  },
  {
    id: "3",
    name: "Abena Boateng",
    gender: "F",
    scores: { English: 45, Maths: 42, Science: 48, Social: 50, RME: 55, ICT: 40, French: 36, "Ghanaian Lang": 52, "Creative Arts": 60, "Career Tech": 45 },
  },
  {
    id: "4",
    name: "Kofi Mensah",
    gender: "M",
    scores: { English: 30, Maths: 28, Science: 35, Social: 38, RME: 42, ICT: 32, French: 25, "Ghanaian Lang": 40, "Creative Arts": 48, "Career Tech": 30 },
  },
  {
    id: "5",
    name: "Akosua Agyei",
    gender: "F",
    scores: { English: 88, Maths: 91, Science: 85, Social: 82, RME: 90, ICT: 78, French: 70, "Ghanaian Lang": 86, "Creative Arts": 88, "Career Tech": 84 },
  },
  {
    id: "6",
    name: "Yaw Darko",
    gender: "M",
    scores: { English: 60, Maths: 55, Science: 62, Social: 58, RME: 65, ICT: 70, French: 48, "Ghanaian Lang": 62, "Creative Arts": 68, "Career Tech": 60 },
  },
  {
    id: "7",
    name: "Efua Quansah",
    gender: "F",
    scores: { English: 42, Maths: 38, Science: 44, Social: 46, RME: 50, ICT: 35, French: 30, "Ghanaian Lang": 48, "Creative Arts": 55, "Career Tech": 40 },
  },
  {
    id: "8",
    name: "Kweku Aidoo",
    gender: "M",
    scores: { English: 78, Maths: 82, Science: 80, Social: 75, RME: 70, ICT: 88, French: 62, "Ghanaian Lang": 72, "Creative Arts": 65, "Career Tech": 80 },
  },
  {
    id: "9",
    name: "Maame Serwaa",
    gender: "F",
    scores: { English: 65, Maths: 48, Science: 52, Social: 60, RME: 72, ICT: 55, French: 42, "Ghanaian Lang": 68, "Creative Arts": 75, "Career Tech": 58 },
  },
  {
    id: "10",
    name: "Nana Kwesi",
    gender: "M",
    scores: { English: 35, Maths: 32, Science: 38, Social: 40, RME: 45, ICT: 30, French: 22, "Ghanaian Lang": 42, "Creative Arts": 50, "Career Tech": 35 },
  },
  {
    id: "11",
    name: "Adwoa Frimpong",
    gender: "F",
    scores: { English: 70, Maths: 75, Science: 68, Social: 72, RME: 78, ICT: 65, French: 55, "Ghanaian Lang": 70, "Creative Arts": 80, "Career Tech": 72 },
  },
  {
    id: "12",
    name: "Ato Armah",
    gender: "M",
    scores: { English: 52, Maths: 58, Science: 55, Social: 50, RME: 60, ICT: 62, French: 40, "Ghanaian Lang": 55, "Creative Arts": 58, "Career Tech": 54 },
  },
];

function avgScore(scores: StudentScores): number {
  const vals = Object.values(scores);
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

function predictedGrade(avg: number): string {
  if (avg >= 80) return "A1 – Excellent";
  if (avg >= 70) return "B2 – Very Good";
  if (avg >= 60) return "B3 – Good";
  if (avg >= 55) return "C4 – Credit";
  if (avg >= 50) return "C5 – Credit";
  if (avg >= 45) return "C6 – Credit";
  if (avg >= 40) return "D7 – Pass";
  if (avg >= 35) return "E8 – Pass";
  return "F9 – Fail";
}

function readinessStatus(avg: number): "On Track" | "At Risk" | "Critical" {
  if (avg >= 50) return "On Track";
  if (avg >= 40) return "At Risk";
  return "Critical";
}

const statusStyle = (status: "On Track" | "At Risk" | "Critical") => {
  if (status === "On Track") return { bg: `${SUCCESS}18`, color: SUCCESS };
  if (status === "At Risk") return { bg: `${WARNING}18`, color: WARNING };
  return { bg: `${DANGER}18`, color: DANGER };
};

function scoreColor(score: number): string {
  if (score >= 60) return SUCCESS;
  if (score >= 45) return WARNING;
  return DANGER;
}

const SUBJECT_DISPLAY = ["English", "Maths", "Science", "Social"] as const;

const mockExamsCompleted = 3;

export function BecePrepPage() {
  const navigate = useNavigate();
  const [filterBand, setFilterBand] = useState<PerformanceBand>("All");
  const [showMockForm, setShowMockForm] = useState(false);
  const [mockExamDate, setMockExamDate] = useState("");
  const [mockExamSubject, setMockExamSubject] = useState("All Subjects");

  const enriched = mockStudents.map((s) => ({
    ...s,
    avg: avgScore(s.scores),
    grade: predictedGrade(avgScore(s.scores)),
    status: readinessStatus(avgScore(s.scores)),
  }));

  const filtered = enriched.filter((s) => {
    if (filterBand === "All") return true;
    return s.status === filterBand;
  });

  const onTrackCount = enriched.filter((s) => s.status === "On Track").length;
  const atRiskCount = enriched.filter((s) => s.status === "At Risk").length;
  const criticalCount = enriched.filter((s) => s.status === "Critical").length;
  const overallAvg = Math.round(enriched.reduce((sum, s) => sum + s.avg, 0) / enriched.length);
  const readyPct = Math.round((onTrackCount / enriched.length) * 100);

  return (
    <PageTemplate
      title="BECE Preparation"
      description="Track JHS 3 student readiness for the Basic Education Certificate Examination"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "BECE Prep" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export report"
          >
            <Download size={16} style={{ color: MUTED }} />
          </button>
          <button
            onClick={() => setShowMockForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-all"
            style={{ background: PRIMARY }}
          >
            <Plus size={15} />
            Schedule Mock Exam
          </button>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            JHS 3 Students
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: NAVY, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {enriched.length}
          </div>
          <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>registered candidates</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Mock Exams Done
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: INFO, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {mockExamsCompleted}
          </div>
          <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>of 6 planned mocks</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Average Score
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: scoreColor(overallAvg), fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {overallAvg}%
          </div>
          <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>across all subjects</div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Ready for BECE
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: readyPct >= 70 ? SUCCESS : readyPct >= 50 ? WARNING : DANGER, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {readyPct}%
          </div>
          <div className="mt-2 h-1.5 rounded-full" style={{ background: `${NAVY}12` }}>
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${readyPct}%`,
                background: readyPct >= 70 ? SUCCESS : readyPct >= 50 ? WARNING : DANGER,
              }}
            />
          </div>
        </div>
      </div>

      {/* Schedule Mock Exam form */}
      {showMockForm && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 style={{ color: NAVY, fontWeight: 600, marginBottom: "1rem" }}>Schedule Mock Exam</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Exam Date</label>
              <input
                type="date"
                value={mockExamDate}
                onChange={(e) => setMockExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: `${NAVY}25`, color: NAVY }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Subject(s)</label>
              <select
                value={mockExamSubject}
                onChange={(e) => setMockExamSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: `${NAVY}25`, color: NAVY }}
              >
                <option>All Subjects</option>
                {BECE_SUBJECTS.map((s) => (
                  <option key={s}>{FULL_SUBJECT_NAMES[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowMockForm(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ color: MUTED, background: `${NAVY}08` }}
            >
              Cancel
            </button>
            <button
              onClick={() => setShowMockForm(false)}
              disabled={!mockExamDate}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: PRIMARY, opacity: !mockExamDate ? 0.6 : 1 }}
            >
              Schedule
            </button>
          </div>
        </div>
      )}

      {/* Subject Coverage */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 style={{ color: NAVY, fontWeight: 600, marginBottom: "1rem" }}>BECE Subjects (10 Core Subjects)</h3>
        <div className="flex flex-wrap gap-2">
          {BECE_SUBJECTS.map((subj) => {
            const subjectAvg = Math.round(
              enriched.reduce((sum, s) => sum + s.scores[subj as keyof StudentScores], 0) / enriched.length
            );
            return (
              <div
                key={subj}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                style={{
                  background: `${scoreColor(subjectAvg)}12`,
                  border: `1px solid ${scoreColor(subjectAvg)}30`,
                }}
              >
                <span style={{ color: NAVY, fontWeight: 500 }}>{FULL_SUBJECT_NAMES[subj]}</span>
                <span className="font-mono font-bold text-xs" style={{ color: scoreColor(subjectAvg) }}>
                  {subjectAvg}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium" style={{ color: MUTED }}>Filter:</span>
        {(["All", "On Track", "At Risk", "Critical"] as PerformanceBand[]).map((band) => {
          const counts: Record<PerformanceBand, number> = {
            All: enriched.length,
            "On Track": onTrackCount,
            "At Risk": atRiskCount,
            Critical: criticalCount,
          };
          const bandColor: Record<PerformanceBand, string> = {
            All: PRIMARY,
            "On Track": SUCCESS,
            "At Risk": WARNING,
            Critical: DANGER,
          };
          const isActive = filterBand === band;
          return (
            <button
              key={band}
              onClick={() => setFilterBand(band)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: isActive ? `${bandColor[band]}18` : `${NAVY}06`,
                color: isActive ? bandColor[band] : MUTED,
                border: isActive ? `1px solid ${bandColor[band]}35` : "1px solid transparent",
              }}
            >
              {band}
              <span
                className="px-1.5 py-0.5 rounded-md font-bold text-[10px]"
                style={{ background: isActive ? `${bandColor[band]}25` : `${NAVY}10`, color: isActive ? bandColor[band] : MUTED }}
              >
                {counts[band]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Student Readiness Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: `${NAVY}06`, borderBottom: `1px solid ${NAVY}15` }}>
                <th className="px-5 py-3 text-left text-xs font-semibold" style={{ color: NAVY, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Student
                </th>
                <th className="px-5 py-3 text-right text-xs font-semibold" style={{ color: NAVY, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Avg Score
                </th>
                {SUBJECT_DISPLAY.map((subj) => (
                  <th key={subj} className="px-4 py-3 text-right text-xs font-semibold" style={{ color: NAVY, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {subj}
                  </th>
                ))}
                <th className="px-5 py-3 text-left text-xs font-semibold" style={{ color: NAVY, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Predicted Grade
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold" style={{ color: NAVY, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: MUTED }}>
                    No students in this performance band.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => {
                  const { bg, color } = statusStyle(student.status);
                  return (
                    <tr
                      key={student.id}
                      style={{ borderBottom: `1px solid ${NAVY}10` }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: student.gender === "F" ? "#EC4899" : INFO }}
                          >
                            {student.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </div>
                          <div>
                            <div className="text-sm font-medium" style={{ color: NAVY }}>{student.name}</div>
                            <div className="text-xs" style={{ color: MUTED }}>JHS 3</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span
                          className="font-mono font-bold text-sm px-2 py-0.5 rounded"
                          style={{
                            background: `${scoreColor(student.avg)}15`,
                            color: scoreColor(student.avg),
                          }}
                        >
                          {student.avg}%
                        </span>
                      </td>
                      {SUBJECT_DISPLAY.map((subj) => {
                        const score = student.scores[subj as keyof StudentScores];
                        return (
                          <td key={subj} className="px-4 py-4 text-right">
                            <span
                              className="font-mono text-xs font-semibold"
                              style={{ color: scoreColor(score) }}
                            >
                              {score}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>
                        {student.grade}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: bg, color }}
                        >
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: MUTED }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: SUCCESS }} />
          <span>On Track: avg ≥ 50%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: WARNING }} />
          <span>At Risk: avg 40–49%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: DANGER }} />
          <span>Critical: avg &lt; 40%</span>
        </div>
        <span>·</span>
        <span>Table shows 4 core subjects. Full 10-subject breakdown in subject cards above.</span>
      </div>
    </PageTemplate>
  );
}
