import { useNavigate } from "react-router";
import { Calendar, Clock, TrendingUp, Wallet, Award, Bell, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

const weekSchedule = [
  { day: "Mon", periods: ["Math", "English", "Science", "ICT", "P.E"] },
  { day: "Tue", periods: ["Math", "French", "Science", "History", "Art"] },
  { day: "Wed", periods: ["Math", "English", "Science", "Music", "R.E"] },
  { day: "Thu", periods: ["Math", "English", "Science Lab", "ICT", "P.E"] },
  { day: "Fri", periods: ["Math", "English", "Social St.", "Library", "Assembly"] },
];

export function StudentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Attendance", value: "94%", sub: "This term", icon: Clock, color: "#10B981" },
          { label: "Average Grade", value: "86%", sub: "Top 5 in class", icon: TrendingUp, color: "#6366F1" },
          { label: "Fee Status", value: "Paid", sub: "Up to date", icon: Wallet, color: "#F59E0B" },
          { label: "Awards", value: "3", sub: "This term", icon: Award, color: "#EC4899" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${card.color}15` }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{card.value}</div>
            <div style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.3rem" }}>{card.label}</div>
            <div style={{ color: MUTED, fontSize: "0.72rem" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={16} color={PLUM_LIGHT} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem" }}>My Timetable</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {weekSchedule.map((day) => (
              <div key={day.day} className="p-2 rounded-xl" style={{ background: "rgba(56,25,50,0.03)" }}>
                <div style={{ color: PLUM, fontSize: "0.72rem", fontWeight: 700, textAlign: "center", marginBottom: "0.5rem" }}>{day.day}</div>
                {day.periods.map((p, i) => (
                  <div key={i} className="text-center py-1 px-1 rounded-md mb-0.5 text-xs" style={{
                    background: i === 0 ? "rgba(99,102,241,0.12)" : "transparent",
                    color: i === 0 ? "#6366F1" : MUTED,
                    fontWeight: i === 0 ? 600 : 400,
                  }}>{p}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>Recent Grades</h3>
          <div className="space-y-3">
            {[
              { subject: "Mathematics", score: 92, grade: "A" },
              { subject: "English Language", score: 85, grade: "B+" },
              { subject: "Integrated Science", score: 78, grade: "B" },
              { subject: "Social Studies", score: 88, grade: "A" },
              { subject: "ICT", score: 95, grade: "A+" },
            ].map((s) => (
              <div key={s.subject} className="flex items-center justify-between p-3 rounded-2xl" style={{ background: "rgba(56,25,50,0.03)" }}>
                <div>
                  <div style={{ color: PLUM, fontSize: "0.85rem", fontWeight: 500 }}>{s.subject}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 rounded-full" style={{ background: "rgba(56,25,50,0.08)" }}>
                    <div className="h-2 rounded-full" style={{ width: `${s.score}%`, background: s.score >= 90 ? "#10B981" : s.score >= 80 ? "#6366F1" : "#F59E0B" }} />
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontWeight: 700, fontSize: "0.85rem" }}>{s.score}%</span>
                  <span className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: s.grade === "A+" ? "#D1FAE5" : "#EDE9FE", color: s.grade === "A+" ? "#10B981" : "#6366F1" }}>{s.grade}</span>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/dashboard/academics")} className="mt-4 w-full py-2 rounded-full text-xs hover:opacity-70" style={{ color: PLUM_LIGHT }}>
            View full report card <ArrowRight size={11} className="inline" />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>Announcements</h3>
        <div className="space-y-3">
          {[
            { title: "Mid-Term Exam Schedule", text: "Exams start May 20. Check timetable for details.", time: "2 days ago", icon: Bell, color: "#6366F1" },
            { title: "Fee Payment Deadline", text: "Term 2 fees due by April 15th.", time: "1 week ago", icon: AlertCircle, color: "#F59E0B" },
            { title: "Science Fair Winners", text: "Congratulations to all participants!", time: "2 weeks ago", icon: CheckCircle, color: "#10B981" },
          ].map((a, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: "rgba(56,25,50,0.03)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}15` }}>
                <a.icon size={14} color={a.color} />
              </div>
              <div>
                <p style={{ color: PLUM, fontSize: "0.88rem", fontWeight: 500 }}>{a.title}</p>
                <p style={{ color: MUTED, fontSize: "0.78rem" }}>{a.text}</p>
                <p style={{ color: MUTED, fontSize: "0.7rem", marginTop: "0.15rem" }}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
