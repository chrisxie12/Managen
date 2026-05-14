import { useNavigate } from "react-router";
import { Clock, TrendingUp, Wallet, MessageSquare, Bell, ArrowRight, CheckCircle, AlertCircle, GraduationCap } from "lucide-react";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const children = [
  {
    name: "Ama Owusu", class: "JHS 3A", attendance: 96, gpa: 92.4,
    feeStatus: "paid", feeBalance: 0, teacher: "Mrs. Akua Boateng",
  },
  {
    name: "Kofi Owusu", class: "JHS 1B", attendance: 88, gpa: 78.5,
    feeStatus: "partial", feeBalance: 450, teacher: "Mr. Kofi Osei",
  },
];

export function ParentDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {children.map((child) => (
        <div key={child.name}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
              <GraduationCap size={18} color={MILK} />
            </div>
            <div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.2rem" }}>{child.name}</h2>
              <p style={{ color: MUTED, fontSize: "0.8rem" }}>{child.class} · Teacher: {child.teacher}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Attendance", value: `${child.attendance}%`, icon: Clock, color: child.attendance >= 90 ? "#10B981" : "#F59E0B" },
              { label: "Average Grade", value: `${child.gpa}%`, icon: TrendingUp, color: "#6366F1" },
              { label: "Fee Status", value: child.feeStatus === "paid" ? "Paid" : `GHS ${child.feeBalance}`, icon: Wallet, color: child.feeStatus === "paid" ? "#10B981" : "#EF4444" },
              { label: "Contact Teacher", value: "Message", icon: MessageSquare, color: "#25D366" },
            ].map((card) => (
              <div key={card.label} className="p-4 rounded-[20px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center mb-3" style={{ background: `${card.color}15` }}>
                  <card.icon size={16} color={card.color} />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "1.2rem", fontWeight: 700 }}>{card.value}</div>
                <div style={{ color: MUTED, fontSize: "0.75rem" }}>{card.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.8rem" }}>Recent Grades</h3>
              <div className="space-y-2">
                {[
                  { subject: "Mathematics", score: child.gpa >= 90 ? 92 : 78 },
                  { subject: "English", score: child.gpa >= 90 ? 85 : 72 },
                  { subject: "Science", score: child.gpa >= 90 ? 88 : 80 },
                  { subject: "Social Studies", score: child.gpa >= 90 ? 90 : 75 },
                ].map((s) => (
                  <div key={s.subject} className="flex items-center justify-between">
                    <span style={{ color: PLUM_LIGHT, fontSize: "0.8rem" }}>{s.subject}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full" style={{ background: "rgba(56,25,50,0.08)" }}>
                        <div className="h-1.5 rounded-full" style={{ width: `${s.score}%`, background: s.score >= 85 ? "#10B981" : "#6366F1" }} />
                      </div>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.78rem", fontWeight: 600 }}>{s.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate("/dashboard/academics")} className="mt-3 text-xs" style={{ color: PLUM_LIGHT }}>View all reports <ArrowRight size={11} className="inline" /></button>
            </div>

            <div className="p-5 rounded-[24px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.8rem" }}>Recent Updates</h3>
              <div className="space-y-3">
                {[
                  { text: `Attendance alert: ${child.name} was absent yesterday`, time: "Yesterday", icon: Bell, color: "#F59E0B" },
                  { text: child.feeStatus === "paid" ? "Fee payment confirmed" : `Fee balance of GHS ${child.feeBalance} pending`, time: "3 days ago", icon: child.feeStatus === "paid" ? CheckCircle : AlertCircle, color: child.feeStatus === "paid" ? "#10B981" : "#EF4444" },
                  { text: "Mid-term exam results published", time: "1 week ago", icon: CheckCircle, color: "#10B981" },
                ].map((u, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <u.icon size={12} color={u.color} className="mt-0.5" />
                    <div>
                      <p style={{ color: PLUM_LIGHT, fontSize: "0.78rem" }}>{u.text}</p>
                      <p style={{ color: MUTED, fontSize: "0.68rem" }}>{u.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="grid lg:grid-cols-2 gap-4">
        <button onClick={() => navigate("/dashboard/communication")}
          className="p-5 rounded-[24px] text-left" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <MessageSquare size={20} color="#25D366" className="mb-2" />
          <h3 style={{ color: PLUM, fontWeight: 600, fontSize: "0.95rem" }}>Message a Teacher</h3>
          <p style={{ color: MUTED, fontSize: "0.78rem" }}>Send a message to your child's teacher</p>
        </button>
        <button onClick={() => navigate("/dashboard/fee-reminders")}
          className="p-5 rounded-[24px] text-left" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <Wallet size={20} color="#F59E0B" className="mb-2" />
          <h3 style={{ color: PLUM, fontWeight: 600, fontSize: "0.95rem" }}>Pay Fees Online</h3>
          <p style={{ color: MUTED, fontSize: "0.78rem" }}>View fee details and make payments</p>
        </button>
      </div>
    </div>
  );
}
