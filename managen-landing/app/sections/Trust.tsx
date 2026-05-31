"use client";
import ScrollReveal from "../components/ScrollReveal";

const PARTNERS = [
  { name: "GES", label: "Curriculum", emoji: "🏫" },
  { name: "WAEC", label: "Exams", emoji: "📝" },
  { name: "Paystack", label: "Payments", emoji: "💳" },
  { name: "MTN", label: "MoMo", emoji: "📱" },
  { name: "WhatsApp", label: "Messaging", emoji: "💬" },
  { name: "NaCCA", label: "Standards", emoji: "📚" },
];

export default function Trust() {
  return (
    <section className="py-[100px]" style={{ background: "#F5F5F4" }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal className="text-center">
          <h2 className="text-4xl md:text-[40px] font-bold text-[#0B0F1C] mb-6">
            Built with input from Ghanaian educators
          </h2>
          <p className="text-lg text-gray-500 max-w-[600px] mx-auto">
            We spent months interviewing headmasters, bursars, and teachers across Accra, Kumasi, and
            Cape Coast to understand what actually slows schools down. Every feature came from their
            real frustrations.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {PARTNERS.map((p) => (
              <div
                key={p.name}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 group-hover:opacity-100 group-hover:shadow-md"
                  style={{
                    background: "white",
                    border: "1.5px solid #E5E7EB",
                    opacity: 0.7,
                  }}
                >
                  {p.emoji}
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs font-bold text-[#0B0F1C]">{p.name}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {p.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
