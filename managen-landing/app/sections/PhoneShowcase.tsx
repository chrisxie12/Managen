"use client";
import { Zap, MessageSquare, CreditCard, ArrowRight } from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";

function ShowcasePhone() {
  return (
    <div style={{ width: 260, background: "#13102A", borderRadius: 44, padding: 10, boxShadow: "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)", margin: "0 auto", position: "relative" }}>
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 96, height: 24, background: "#13102A", borderRadius: 20, zIndex: 10 }} />
      <div style={{ background: "#0f0d20", borderRadius: 36, overflow: "hidden", minHeight: 480, padding: "44px 16px 20px" }}>
        {/* Ring chart */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 110 110" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle cx="55" cy="55" r="44" fill="none" stroke="#D4FF00" strokeWidth="10"
                strokeDasharray={`${0.94 * 2 * Math.PI * 44} ${2 * Math.PI * 44}`}
                strokeLinecap="round" style={{ filter: "drop-shadow(0 0 8px rgba(212,255,0,0.6))" }} />
            </svg>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: "white", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>94%</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Attendance</div>
            </div>
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          {[
            { label: "Save 5h/wk", color: "#D4FF00" },
            { label: "98% accurate", color: "#4ADE80" },
          ].map((s) => (
            <div key={s.label} style={{ borderRadius: 12, padding: "10px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Setup guide */}
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14, border: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>Quick Setup</div>
          {["Add school details", "Import students (CSV)", "Set fee structure", "Connect WhatsApp"].map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: i < 2 ? "#D4FF00" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: i < 2 ? "#0B0F1C" : "rgba(255,255,255,0.2)", flexShrink: 0 }}>
                {i < 2 ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 10, color: i < 2 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.25)" }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PhoneShowcase() {
  return (
    <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #3730a3 0%, #6d28d9 50%, #0B4F30 100%)", padding: "100px 0" }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      {/* Glow */}
      <div className="absolute pointer-events-none" style={{ bottom: 0, left: "50%", transform: "translateX(-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(212,255,0,0.12) 0%, transparent 65%)", filter: "blur(40px)" }} />

      <div className="max-w-[1200px] mx-auto px-6 relative">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <div className="text-white">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 100, padding: "6px 16px", marginBottom: 28, fontSize: 12, fontWeight: 600 }}>
                Managen meets WhatsApp
              </div>
              <h2 style={{ fontSize: "clamp(32px, 4.5vw, 52px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 20 }}>
                Your school in your pocket.{" "}
                <span style={{ color: "#D4FF00" }}>Every update. Every parent.</span>
              </h2>
              <p style={{ fontSize: 17, opacity: 0.75, lineHeight: 1.65, marginBottom: 36 }}>
                Parents get instant WhatsApp messages for attendance, fees, and exam results. No app downloads, no logins. Just a message on the phone they already use.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 40 }}>
                {[
                  { icon: Zap, title: "Save 5 Hours Weekly", text: "Automate attendance, fee reminders, and report generation." },
                  { icon: MessageSquare, title: "100% Parent Reach", text: "WhatsApp has 98% open rates. Every parent stays informed." },
                  { icon: CreditCard, title: "MoMo Payments", text: "Collect fees via MTN and Vodafone Cash instantly." },
                ].map(({ icon: Icon, title, text }) => (
                  <div key={title} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(255,255,255,0.15)" }}>
                      <Icon size={18} style={{ color: "#D4FF00" }} strokeWidth={2} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: "white", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 3 }}>{title}</div>
                      <div style={{ fontSize: 13, opacity: 0.6, lineHeight: 1.5 }}>{text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#D4FF00", color: "#0B0F1C", fontWeight: 700, fontSize: 15, padding: "16px 32px", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.2s", boxShadow: "0 4px 24px rgba(212,255,0,0.3)" }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 8px 40px rgba(212,255,0,0.45)"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "none"; el.style.boxShadow = "0 4px 24px rgba(212,255,0,0.3)"; }}>
                Start Free Trial
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <div style={{ animation: "bobSlow 5s ease-in-out infinite" }}>
              <ShowcasePhone />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
