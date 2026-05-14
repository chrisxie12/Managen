import { useNavigate } from "react-router";
import { TrendingUp, Users, Clock, AlertCircle, ArrowRight, BarChart3, ThumbsUp, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const performanceData = [
  { subject: "Math", avg: 78, target: 75 },
  { subject: "English", avg: 82, target: 75 },
  { subject: "Science", avg: 76, target: 75 },
  { subject: "Soc. Studies", avg: 80, target: 70 },
  { subject: "ICT", avg: 88, target: 75 },
];

const pendingApprovals = [
  { item: "Term 2 Exam Results", from: "Mrs. Akua Boateng", date: "2 days ago", type: "results" },
  { item: "JHS 3 Timetable Update", from: "Mr. Kofi Osei", date: "4 days ago", type: "timetable" },
  { item: "Science Fair Scores", from: "Mr. Yaw Mensah", date: "1 week ago", type: "results" },
];

export function HeadmasterDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: "1,248", sub: "12 classes", icon: Users, color: "#6366F1" },
          { label: "Avg Performance", value: "80.8%", sub: "Above target", icon: TrendingUp, color: "#10B981" },
          { label: "Pending Approvals", value: "3", sub: "Results & timetables", icon: Clock, color: "#F59E0B" },
          { label: "Staff Count", value: "48", sub: "12 teachers, 36 support", icon: Users, color: "#EC4899" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${card.color}15` }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{card.value}</div>
            <div style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.3rem" }}>{card.label}</div>
            <div style={{ color: MUTED, fontSize: "0.72rem" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem" }}>Academic Performance by Subject</h3>
              <p style={{ color: MUTED, fontSize: "0.78rem" }}>Average vs target — Term 2</p>
            </div>
            <button onClick={() => navigate("/dashboard/academics")} className="flex items-center gap-1 text-sm hover:opacity-70" style={{ color: PLUM_LIGHT }}>
              Full report <ArrowRight size={13} />
            </button>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.05)" />
              <XAxis dataKey="subject" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="avg" fill={PLUM} radius={[6, 6, 0, 0]} name="Average" />
              <Bar dataKey="target" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-[24px]" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
          <div className="flex items-center gap-2 mb-5">
            <Clock size={16} color={MILK} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: MILK, fontWeight: 700, fontSize: "1rem" }}>Pending Approvals</h3>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((a, i) => (
              <div key={i} className="p-3 rounded-2xl" style={{ background: "rgba(255,243,230,0.1)" }}>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(255,243,230,0.15)" }}>
                    {a.type === "results" ? <FileText size={12} color={MILK} /> : <Clock size={12} color={MILK} />}
                  </div>
                  <div className="flex-1">
                    <p style={{ color: MILK, fontSize: "0.82rem", fontWeight: 500 }}>{a.item}</p>
                    <p style={{ color: "rgba(255,243,230,0.6)", fontSize: "0.72rem" }}>By {a.from} · {a.date}</p>
                    <div className="flex gap-2 mt-2">
                      <button className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(255,243,230,0.2)", color: MILK }}>Approve</button>
                      <button className="px-3 py-1 rounded-full text-xs" style={{ background: "rgba(255,243,230,0.1)", color: "rgba(255,243,230,0.7)" }}>Review</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>Performance Highlights</h3>
          <div className="space-y-3">
            {[
              { label: "Classes Above Target", value: "4/5", icon: ThumbsUp, color: "#10B981" },
              { label: "Students at Risk", value: "42", icon: AlertCircle, color: "#EF4444" },
              { label: "Attendance Rate", value: "91.4%", icon: TrendingUp, color: "#6366F1" },
              { label: "Reports Published", value: "248", icon: FileText, color: "#F59E0B" },
            ].map((h) => (
              <div key={h.label} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "rgba(56,25,50,0.03)" }}>
                <div className="flex items-center gap-2">
                  <h.icon size={14} color={h.color} />
                  <span style={{ color: PLUM_LIGHT, fontSize: "0.85rem" }}>{h.label}</span>
                </div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontWeight: 700, fontSize: "0.9rem" }}>{h.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>
            <BarChart3 size={16} className="inline mr-1" color={PLUM_LIGHT} /> Key Metrics
          </h3>
          <div className="space-y-4">
            {[
              { label: "Student-Teacher Ratio", value: "26:1", target: "Target: 25:1" },
              { label: "Pass Rate", value: "92%", target: "Target: 85%" },
              { label: "Fee Collection Rate", value: "88%", target: "Target: 95%" },
              { label: "Parent Engagement", value: "76%", target: "Target: 80%" },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between mb-1">
                  <span style={{ color: PLUM_LIGHT, fontSize: "0.82rem" }}>{m.label}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontWeight: 600, fontSize: "0.82rem" }}>{m.value}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(56,25,50,0.08)" }}>
                    <div className="h-2 rounded-full" style={{ width: `${parseInt(m.value)}%`, background: parseInt(m.value) >= 85 ? "#10B981" : "#F59E0B" }} />
                  </div>
                  <span style={{ color: MUTED, fontSize: "0.65rem" }}>{m.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
