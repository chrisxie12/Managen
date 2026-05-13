import { useState } from "react";
import {
  FileText,
  Send,
  Download,
  Plus,
  CheckCircle2,
  Star,
  Award,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const gradeData = [
  { subject: "Math", avg: 78, highest: 96 },
  { subject: "English", avg: 82, highest: 98 },
  { subject: "Science", avg: 74, highest: 94 },
  { subject: "Social", avg: 88, highest: 100 },
  { subject: "ICT", avg: 85, highest: 97 },
  { subject: "French", avg: 71, highest: 91 },
];

const classes = ["JHS 3A", "JHS 3B", "JHS 2A", "JHS 2B", "JHS 2C", "JHS 1A", "JHS 1C"];
const terms = ["Term 2, 2025/2026", "Term 1, 2025/2026", "Term 3, 2024/2025"];

const studentResults = [
  { name: "Ama Owusu", id: "GH-2024-001", math: 97, english: 95, science: 94, social: 98, ict: 96, french: 93, total: 573, avg: 95.5, grade: "A1", position: 1 },
  { name: "Kwesi Boateng", id: "GH-2024-012", math: 91, english: 94, science: 88, social: 95, ict: 97, french: 89, total: 554, avg: 92.3, grade: "A1", position: 2 },
  { name: "Efua Mensah", id: "GH-2024-034", math: 88, english: 90, science: 85, social: 94, ict: 92, french: 87, total: 536, avg: 89.3, grade: "A2", position: 3 },
  { name: "Kofi Adu", id: "GH-2024-067", math: 84, english: 88, science: 80, social: 90, ict: 89, french: 82, total: 513, avg: 85.5, grade: "B2", position: 4 },
  { name: "Akosua Frimpong", id: "GH-2024-078", math: 80, english: 85, science: 76, social: 87, ict: 84, french: 79, total: 491, avg: 81.8, grade: "B2", position: 5 },
  { name: "Abena Asante", id: "GH-2024-055", math: 72, english: 78, science: 70, social: 82, ict: 79, french: 74, total: 455, avg: 75.8, grade: "C4", position: 6 },
];

const exams = [
  { name: "Mid-Term Mathematics", class: "JHS 3A", date: "May 14, 2026", status: "upcoming", students: 32 },
  { name: "English Language Oral", class: "JHS 2B", date: "May 16, 2026", status: "upcoming", students: 28 },
  { name: "Basic Science Practical", class: "JHS 3A", date: "Apr 28, 2026", status: "completed", students: 32 },
  { name: "Social Studies Mock", class: "All JHS 3", date: "Apr 22, 2026", status: "completed", students: 64 },
];

const gradeColors: Record<string, { bg: string; color: string }> = {
  A1: { bg: "#D1FAE5", color: "#065F46" },
  A2: { bg: "#DBEAFE", color: "#1E40AF" },
  B2: { bg: "#FEF3C7", color: "#92400E" },
  C4: { bg: "#FEE2E2", color: "#991B1B" },
};

export function Academics() {
  const [selectedClass, setSelectedClass] = useState("JHS 3A");
  const [selectedTerm, setSelectedTerm] = useState(terms[0]);
  const [activeTab, setActiveTab] = useState<"results" | "exams" | "reports">("results");
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);

  const handleGenerate = (id: string) => {
    setGeneratingReport(id);
    setTimeout(() => setGeneratingReport(null), 2000);
  };

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 rounded-xl outline-none text-sm"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.08)`,
              color: PLUM,
              boxShadow: "0 2px 8px rgba(56,25,50,0.04)",
            }}
          >
            {classes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-4 py-2.5 rounded-xl outline-none text-sm"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.08)`,
              color: PLUM,
            }}
          >
            {terms.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div
          className="flex rounded-xl overflow-hidden ml-auto"
          style={{ border: `1px solid rgba(56,25,50,0.08)` }}
        >
          {(["results", "exams", "reports"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-2.5 text-sm capitalize transition-colors"
              style={{
                background: activeTab === tab ? PLUM : "white",
                color: activeTab === tab ? MILK : MUTED,
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-transform"
          style={{
            background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
            color: MILK,
            boxShadow: "0 4px 14px rgba(56,25,50,0.25)",
          }}
        >
          <Plus size={15} />
          {activeTab === "exams" ? "Add Exam" : activeTab === "reports" ? "Generate All" : "Enter Grades"}
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Class Average", value: "87.3%", icon: BarChart2, color: "#6366F1", change: "+3.2%", up: true },
          { label: "Top Score", value: "95.5%", icon: Star, color: "#F59E0B", change: "Ama Owusu", up: true },
          { label: "Passed (≥50%)", value: "29/32", icon: CheckCircle2, color: "#10B981", change: "90.6%", up: true },
          { label: "Pending Reports", value: "32", icon: FileText, color: "#EC4899", change: "Ready to send", up: null },
        ].map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-[24px]"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.07)`,
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${s.color}15` }}
            >
              <s.icon size={16} color={s.color} />
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: PLUM,
                fontSize: "1.4rem",
                fontWeight: 700,
              }}
            >
              {s.value}
            </div>
            <div style={{ color: MUTED, fontSize: "0.75rem" }}>{s.label}</div>
            <div
              className="flex items-center gap-1 mt-1 text-xs"
              style={{
                color: s.up === true ? "#10B981" : s.up === false ? "#EF4444" : MUTED,
              }}
            >
              {s.up === true ? <TrendingUp size={10} /> : s.up === false ? <TrendingDown size={10} /> : null}
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left: Results table or Exams */}
        <div
          className="lg:col-span-2 rounded-[24px] overflow-hidden"
          style={{
            background: "white",
            border: `1px solid rgba(56,25,50,0.07)`,
            boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
          }}
        >
          {activeTab === "results" && (
            <>
              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ borderBottom: `1px solid rgba(56,25,50,0.06)` }}
              >
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: PLUM,
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  Terminal Results — {selectedClass}
                </h3>
                <button
                  className="flex items-center gap-1.5 text-sm hover:opacity-70"
                  style={{ color: PLUM_LIGHT }}
                >
                  <Download size={13} /> Export
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: `1px solid rgba(56,25,50,0.06)` }}>
                      {["#", "Student", "Math", "Eng", "Sci", "Social", "ICT", "Fr", "Avg", "Grade"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-center"
                          style={{
                            color: MUTED,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            textTransform: "uppercase",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {studentResults.map((s) => (
                      <tr
                        key={s.id}
                        style={{ borderBottom: `1px solid rgba(56,25,50,0.04)` }}
                        className="hover:bg-[#FFF3E6]/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-center">
                          {s.position === 1 ? (
                            <Award size={14} color="#F59E0B" />
                          ) : (
                            <span style={{ color: MUTED, fontSize: "0.8rem" }}>
                              {s.position}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p style={{ color: PLUM, fontSize: "0.85rem", fontWeight: 500, whiteSpace: "nowrap" }}>
                            {s.name}
                          </p>
                          <p style={{ color: MUTED, fontSize: "0.68rem", fontFamily: "'JetBrains Mono', monospace" }}>
                            {s.id}
                          </p>
                        </td>
                        {[s.math, s.english, s.science, s.social, s.ict, s.french].map((score, i) => (
                          <td key={i} className="px-4 py-3 text-center">
                            <span
                              style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                color: score >= 90 ? "#10B981" : score >= 75 ? PLUM : "#EF4444",
                                fontSize: "0.82rem",
                                fontWeight: 600,
                              }}
                            >
                              {score}
                            </span>
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center">
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              color: PLUM,
                              fontSize: "0.85rem",
                              fontWeight: 700,
                            }}
                          >
                            {s.avg}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-bold"
                            style={gradeColors[s.grade]}
                          >
                            {s.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === "exams" && (
            <div className="p-6">
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: PLUM,
                  fontWeight: 700,
                  fontSize: "1rem",
                  marginBottom: "1rem",
                }}
              >
                Exam Schedule
              </h3>
              <div className="space-y-3">
                {exams.map((exam, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{
                      background: "#FAFAFA",
                      border: `1px solid rgba(56,25,50,0.06)`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background:
                            exam.status === "upcoming" ? `${PLUM}15` : "#D1FAE5",
                        }}
                      >
                        {exam.status === "upcoming" ? (
                          <Clock size={16} color={PLUM} />
                        ) : (
                          <CheckCircle2 size={16} color="#10B981" />
                        )}
                      </div>
                      <div>
                        <p style={{ color: PLUM, fontSize: "0.9rem", fontWeight: 500 }}>
                          {exam.name}
                        </p>
                        <p style={{ color: MUTED, fontSize: "0.75rem" }}>
                          {exam.class} · {exam.students} students · {exam.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={
                        exam.status === "upcoming"
                          ? { background: "#EDE9FE", color: "#5B21B6" }
                          : { background: "#D1FAE5", color: "#065F46" }
                      }
                    >
                      {exam.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="p-6">
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: PLUM,
                  fontWeight: 700,
                  fontSize: "1rem",
                  marginBottom: "1rem",
                }}
              >
                Terminal Report Cards — {selectedClass}
              </h3>
              <div className="space-y-3">
                {studentResults.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-4 rounded-2xl"
                    style={{
                      background: "#FAFAFA",
                      border: `1px solid rgba(56,25,50,0.06)`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${PLUM}20, ${PLUM_LIGHT}30)`,
                          color: PLUM_LIGHT,
                          fontSize: "0.75rem",
                          fontWeight: 700,
                        }}
                      >
                        {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p style={{ color: PLUM, fontSize: "0.88rem", fontWeight: 500 }}>
                          {s.name}
                        </p>
                        <p style={{ color: MUTED, fontSize: "0.72rem", fontFamily: "'JetBrains Mono', monospace" }}>
                          {s.id} · Avg: {s.avg}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                        style={{ background: `${PLUM}10` }}
                      >
                        <Download size={13} color={PLUM} />
                      </button>
                      <button
                        onClick={() => handleGenerate(s.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs active:scale-95 transition-transform"
                        style={{
                          background: generatingReport === s.id ? "#D1FAE5" : `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                          color: generatingReport === s.id ? "#065F46" : MILK,
                          fontWeight: 600,
                        }}
                      >
                        {generatingReport === s.id ? (
                          <>
                            <CheckCircle2 size={12} /> Sent!
                          </>
                        ) : (
                          <>
                            <Send size={12} /> WhatsApp
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Subject Performance Chart */}
        <div className="flex flex-col gap-5">
          <div
            className="p-5 rounded-[24px]"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.07)`,
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontWeight: 700,
                fontSize: "1rem",
                marginBottom: "0.3rem",
              }}
            >
              Subject Averages
            </h3>
            <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "1rem" }}>
              {selectedClass} · {selectedTerm}
            </p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={gradeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.04)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis dataKey="subject" type="category" tick={{ fontSize: 11, fill: PLUM_LIGHT }} axisLine={false} tickLine={false} width={45} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: `1px solid rgba(56,25,50,0.1)`,
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="avg" fill={PLUM} radius={[0, 4, 4, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* WAEC style grades legend */}
          <div
            className="p-5 rounded-[24px]"
            style={{
              background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`,
              boxShadow: "0 8px 28px rgba(56,25,50,0.2)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: MILK,
                fontWeight: 700,
                fontSize: "1rem",
                marginBottom: "1rem",
              }}
            >
              BECE Grade Scale
            </h3>
            {[
              { grade: "A1", range: "80 – 100", desc: "Distinction" },
              { grade: "B2", range: "70 – 79", desc: "Very Good" },
              { grade: "B3", range: "60 – 69", desc: "Good" },
              { grade: "C4", range: "50 – 59", desc: "Credit" },
              { grade: "D7", range: "40 – 49", desc: "Pass" },
              { grade: "F9", range: "0 – 39", desc: "Fail" },
            ].map((g) => (
              <div key={g.grade} className="flex items-center justify-between py-1.5" style={{ borderBottom: `1px solid rgba(255,243,230,0.08)` }}>
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 text-center py-0.5 rounded text-xs font-bold"
                    style={{ background: "rgba(255,243,230,0.15)", color: MILK, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {g.grade}
                  </span>
                  <span style={{ color: "rgba(255,243,230,0.7)", fontSize: "0.8rem" }}>
                    {g.desc}
                  </span>
                </div>
                <span style={{ color: "rgba(255,243,230,0.55)", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace" }}>
                  {g.range}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
