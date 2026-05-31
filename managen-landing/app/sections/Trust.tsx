"use client";
import { Users, Star, Award } from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";

const PROOF = [
  { icon: Users, stat: "2,400+", label: "Schools trust Managen" },
  { icon: Star, stat: "4.9/5", label: "Average school rating" },
  { icon: Award, stat: "WAEC", label: "Certified curriculum" },
];

const PARTNERS = [
  { name: "GES", label: "Curriculum", bg: "#1B4332", text: "white" },
  { name: "WAEC", label: "Exams", bg: "#1E3A5F", text: "white" },
  { name: "Paystack", label: "Payments", bg: "#011B33", text: "white" },
  { name: "MTN", label: "MoMo", bg: "#FFC107", text: "#0B0F1C" },
  { name: "WhatsApp", label: "Messaging", bg: "#25D366", text: "white" },
  { name: "NaCCA", label: "Standards", bg: "#1A237E", text: "white" },
];

export default function Trust() {
  return (
    <section style={{ background: "#F5F5F4", padding: "100px 0" }}>
      <div className="max-w-[1200px] mx-auto px-6">

        <ScrollReveal className="text-center mb-14">
          <h2 style={{ fontSize: "clamp(26px, 4vw, 44px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#0B0F1C", marginBottom: 16, letterSpacing: "-0.025em" }}>
            Built with input from Ghanaian educators
          </h2>
          <p style={{ fontSize: 18, color: "#6B7280", maxWidth: 580, margin: "0 auto" }}>
            We spent months interviewing headmasters, bursars, and teachers across Accra, Kumasi, and Cape Coast. Every feature came from their real frustrations.
          </p>
        </ScrollReveal>

        {/* Proof strip */}
        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {PROOF.map(({ icon: Icon, stat, label }) => (
              <div key={label} style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 20, padding: "28px 32px", display: "flex", alignItems: "center", gap: 16, transition: "all 0.25s ease" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 8px 32px rgba(0,0,0,0.08)"; el.style.transform = "translateY(-3px)"; el.style.borderColor = "#0B0F1C"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "none"; el.style.transform = "none"; el.style.borderColor = "#E5E7EB"; }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(11,15,28,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={24} style={{ color: "#0B0F1C" }} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 28, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: "#0B0F1C", letterSpacing: "-0.025em", lineHeight: 1 }}>{stat}</div>
                  <div style={{ fontSize: 14, color: "#6B7280", marginTop: 4 }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Partner logos */}
        <ScrollReveal delay={200}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            {PARTNERS.map((p) => (
              <div key={p.name} className="group" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", transition: "all 0.25s ease", fontFamily: "'Space Grotesk', sans-serif" }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "scale(1.08) translateY(-3px)"; el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "none"; el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; }}>
                  <span style={{ color: p.text, fontSize: 13, fontWeight: 800, letterSpacing: "0.02em" }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9CA3AF" }}>{p.label}</span>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
