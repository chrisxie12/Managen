"use client";
import ScrollReveal from "../components/ScrollReveal";

// Mini phone screens for each feature card
function AttendanceScreen() {
  return (
    <div className="p-3 pt-8 bg-white h-full min-h-[180px]">
      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-2">Attendance — Mon</div>
      <div className="space-y-1.5">
        {[
          { name: "Kwame A.", status: "Present", present: true },
          { name: "Abena M.", status: "Present", present: true },
          { name: "Kofi B.", status: "Absent", present: false },
          { name: "Ama O.", status: "Present", present: true },
        ].map((s) => (
          <div key={s.name} className="flex items-center justify-between p-1.5 rounded-lg" style={{ background: "#F8F9FA" }}>
            <span className="text-[9px] font-medium text-gray-700">{s.name}</span>
            <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: s.present ? "rgba(11,79,48,0.12)" : "rgba(239,68,68,0.1)", color: s.present ? "#0B4F30" : "#EF4444" }}>
              {s.status}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 p-1.5 rounded-lg text-center text-[8px] font-bold" style={{ background: "#D4FF00", color: "#0B0F1C" }}>
        ✓ 3/4 Marked — 75%
      </div>
    </div>
  );
}

function WhatsAppScreen() {
  return (
    <div className="bg-[#ECE5DD] h-full min-h-[180px] p-3 pt-8">
      <div className="text-[9px] font-bold text-gray-500 text-center mb-3">WhatsApp Reports</div>
      <div className="space-y-2">
        <div className="bg-white rounded-xl rounded-tl-none p-2 max-w-[80%] shadow-sm">
          <p className="text-[8px] text-gray-800">✅ Kwame was present today at Lincoln Academy</p>
          <p className="text-[7px] text-gray-400 mt-0.5">2:15 PM ✓✓</p>
        </div>
        <div className="bg-[#DCF8C6] rounded-xl rounded-tl-none p-2 max-w-[80%] ml-auto shadow-sm">
          <p className="text-[8px] text-gray-800">💰 Fee reminder: GHS 250 due Friday</p>
          <p className="text-[7px] text-gray-400 mt-0.5">2:15 PM ✓✓</p>
        </div>
        <div className="bg-white rounded-xl rounded-tl-none p-2 max-w-[80%] shadow-sm">
          <p className="text-[8px] text-gray-800">📊 Term 2 report card ready to view</p>
          <p className="text-[7px] text-gray-400 mt-0.5">2:16 PM ✓✓</p>
        </div>
      </div>
    </div>
  );
}

function PlanScreen() {
  return (
    <div className="p-3 pt-8 bg-white min-h-[180px]">
      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-3">Your Plan</div>
      <div className="p-2 rounded-xl mb-2" style={{ background: "#D4FF00" }}>
        <div className="text-[10px] font-black text-[#0B0F1C]">Growth</div>
        <div className="text-[8px] text-[#0B0F1C] opacity-70">GHS 499 / month</div>
        <div className="text-[8px] font-bold text-[#0B0F1C] mt-0.5">300 students</div>
      </div>
      <div className="space-y-1">
        {["WhatsApp Reports", "Fee Invoicing", "Exam Scheduling"].map((f) => (
          <div key={f} className="flex items-center gap-1.5 text-[8px] text-gray-600">
            <span className="text-[#0B4F30]">✓</span> {f}
          </div>
        ))}
      </div>
      <button className="w-full mt-3 py-1.5 rounded-lg text-[8px] font-bold" style={{ background: "#0B0F1C", color: "white" }}>
        Upgrade to Pro ↑
      </button>
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div className="p-3 pt-8 bg-white min-h-[180px]">
      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-2">Analytics</div>
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {[
          { label: "Avg Attendance", value: "92%", up: true },
          { label: "Fee Collection", value: "88%", up: true },
          { label: "Exam Pass Rate", value: "78%", up: false },
          { label: "Active Students", value: "297", up: true },
        ].map((m) => (
          <div key={m.label} className="p-1.5 rounded-lg" style={{ background: "#F8F9FA" }}>
            <div className="text-[7px] text-gray-500">{m.label}</div>
            <div className="text-[11px] font-bold text-[#0B0F1C]">{m.value}</div>
            <div className="text-[7px]" style={{ color: m.up ? "#0B4F30" : "#EF4444" }}>
              {m.up ? "↑ +3% this month" : "↓ -2% this term"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  {
    label: "Import",
    title: "One Dashboard, Every Department",
    text: "No spreadsheets. No paper registers. No manual reports. Just add your school once, and everything runs automatically.",
    screen: <AttendanceScreen />,
    reverse: false,
  },
  {
    label: "WhatsApp Reports",
    title: "Seamless Parent Communication",
    text: "Now live across Ghana. Send attendance, fee reminders, and report cards to every parent automatically. No manual work, no missed updates.",
    screen: <WhatsAppScreen />,
    reverse: true,
  },
  {
    label: "Go!",
    title: "Upgrade or Pause — Whenever You Want",
    text: "Need more features? Upgrade in a tap. Growing? Add students instantly. Not using it? Pause your plan and resume later — your data never expires.",
    screen: <PlanScreen />,
    reverse: false,
  },
  {
    label: "Analytics",
    title: "Real-Time School Insights",
    text: "Track attendance trends, fee collection rates, and academic performance from one dashboard. Export reports, identify issues, celebrate wins.",
    screen: <AnalyticsScreen />,
    reverse: true,
  },
];

function MiniPhone({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: 160,
        background: "#0B0F1C",
        borderRadius: 32,
        padding: 8,
        boxShadow: "0 12px 36px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}
    >
      {/* Dynamic Island */}
      <div style={{ position: "relative", marginBottom: -4 }}>
        <div
          style={{
            margin: "4px auto",
            width: 60,
            height: 14,
            background: "#0B0F1C",
            borderRadius: 14,
          }}
        />
      </div>
      <div style={{ background: "white", borderRadius: 26, overflow: "hidden", minHeight: 240 }}>
        {children}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="features" className="py-[100px] bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal className="text-center mb-4">
          <h2 className="text-4xl md:text-[40px] font-bold text-[#0B0F1C] mb-4">
            Set up in 10 minutes. Run for years.
          </h2>
          <p className="text-2xl font-bold text-[#0B0F1C] mb-4">
            Choose Your Plan — Free, Starter, Growth, Pro.
          </p>
          <p className="text-lg text-gray-500 max-w-[600px] mx-auto">
            Start free. Add features. Scale up. Whether you have 50 students or 500, Managen adjusts
            to what you need. No commitments. No overpaying. Just the right plan at the right moment.
          </p>
        </ScrollReveal>

        <div className="flex flex-col gap-5 mt-14">
          {FEATURES.map((feat, i) => (
            <ScrollReveal key={feat.label} delay={i * 100}>
              <div
                className="bg-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#0B0F1C]"
                style={{ border: "1px solid #E5E7EB" }}
              >
                {/* Mobile: always text above phone. Desktop: alternate left/right via grid */}
                <div className={`flex flex-col ${feat.reverse ? "md:flex-row-reverse" : "md:flex-row"} items-stretch`}>
                  {/* Text */}
                  <div className="flex-1 p-8 md:p-12">
                    <div
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-black mb-4"
                      style={{ background: "#D4FF00", color: "#0B0F1C", fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      {i + 1}
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{feat.label}</div>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#0B0F1C] mb-4 leading-snug">
                      {feat.title}
                    </h3>
                    <p className="text-base text-gray-500 leading-relaxed max-w-md">{feat.text}</p>
                  </div>

                  {/* Phone */}
                  <div className="flex justify-center items-center px-8 py-8 bg-gray-50" style={{ minWidth: 220 }}>
                    <MiniPhone>{feat.screen}</MiniPhone>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
