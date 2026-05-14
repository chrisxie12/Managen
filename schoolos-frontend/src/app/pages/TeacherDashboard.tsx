import { useNavigate } from "react-router";
import { BookOpen, Users, Clock, ClipboardCheck, Calendar, ArrowRight } from "lucide-react";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const myClasses = [
  { name: "JHS 3A", subject: "Mathematics", students: 32, room: "Room 4" },
  { name: "JHS 2B", subject: "Mathematics", students: 28, room: "Room 7" },
  { name: "JHS 1C", subject: "Core Maths", students: 30, room: "Lab 2" },
];

const todaySchedule = [
  { period: "1st", time: "8:00 - 8:45", subject: "Mathematics", class: "JHS 3A" },
  { period: "2nd", time: "8:50 - 9:35", subject: "Mathematics", class: "JHS 2B" },
  { period: "3rd", time: "9:40 - 10:25", subject: "Core Maths", class: "JHS 1C" },
  { period: "4th", time: "10:45 - 11:30", subject: "Free Period" },
  { period: "5th", time: "11:35 - 12:20", subject: "Mathematics", class: "JHS 3A" },
];

export function TeacherDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Classes", value: "3", change: "28-32 students each", icon: BookOpen, color: "#6366F1" },
          { label: "Total Students", value: "90", change: "Across all classes", icon: Users, color: "#10B981" },
          { label: "Today's Periods", value: "5", change: "2 before break", icon: Clock, color: "#F59E0B" },
          { label: "Pending Tasks", value: "2", change: "Attendance & grades", icon: ClipboardCheck, color: "#EC4899" },
        ].map((card) => (
          <div key={card.label} className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${card.color}15` }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.1, marginBottom: "0.3rem" }}>{card.value}</div>
            <div style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.3rem" }}>{card.label}</div>
            <div style={{ color: MUTED, fontSize: "0.72rem" }}>{card.change}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem" }}>My Classes</h3>
            <button onClick={() => navigate("/dashboard/students")} className="flex items-center gap-1 text-sm hover:opacity-70" style={{ color: PLUM_LIGHT }}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div className="space-y-3">
            {myClasses.map((cls) => (
              <div key={cls.name} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: "rgba(56,25,50,0.03)" }}>
                <div>
                  <div style={{ color: PLUM, fontWeight: 600, fontSize: "0.95rem" }}>{cls.name}</div>
                  <div style={{ color: MUTED, fontSize: "0.8rem" }}>{cls.subject} · {cls.students} students · {cls.room}</div>
                </div>
                <button className="px-3 py-1.5 rounded-full text-xs" style={{ background: PLUM, color: MILK }}>
                  Mark Attendance
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={16} color={PLUM_LIGHT} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem" }}>Today's Schedule</h3>
          </div>
          <div className="space-y-1">
            {todaySchedule.map((s) => (
              <div key={s.period} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: s.subject === "Free Period" ? "transparent" : "rgba(56,25,50,0.03)" }}>
                <div className="w-10 text-center">
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.75rem", fontWeight: 600 }}>{s.period}</div>
                  <div style={{ color: MUTED, fontSize: "0.6rem" }}>{s.time}</div>
                </div>
                <div className="flex-1">
                  <div style={{ color: PLUM, fontSize: "0.85rem", fontWeight: s.subject === "Free Period" ? 400 : 500 }}>{s.subject}</div>
                  {s.class && <div style={{ color: MUTED, fontSize: "0.72rem" }}>{s.class}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.05rem", marginBottom: "1rem" }}>Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Take Attendance", icon: ClipboardCheck, color: "#6366F1", path: "/dashboard/students" },
              { label: "Enter Grades", icon: BookOpen, color: "#10B981", path: "/dashboard/academics" },
              { label: "View Timetable", icon: Calendar, color: "#F59E0B", path: "/dashboard/academics" },
              { label: "Message Parent", icon: Users, color: "#EC4899", path: "/dashboard/communication" },
            ].map((a) => (
              <button key={a.label} onClick={() => navigate(a.path)}
                className="p-4 rounded-2xl text-left hover:scale-[1.03] transition-transform"
                style={{ background: `${a.color}10`, border: `1px solid ${a.color}20` }}>
                <a.icon size={18} color={a.color} className="mb-2" />
                <p style={{ color: PLUM, fontSize: "0.78rem", fontWeight: 500 }}>{a.label}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-[24px]" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: MILK, fontWeight: 700, fontSize: "1rem", marginBottom: "0.5rem" }}>Weekly Summary</h3>
          <div className="space-y-3 mt-4">
            {[
              { label: "Classes Taught", value: "14/15" },
              { label: "Attendance Marked", value: "92%" },
              { label: "Assignments Graded", value: "3/4" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between mb-1">
                  <span style={{ color: "rgba(255,243,230,0.7)", fontSize: "0.78rem" }}>{s.label}</span>
                  <span style={{ color: MILK, fontSize: "0.8rem", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{s.value}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: "rgba(255,243,230,0.15)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: "80%", background: MILK, opacity: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
