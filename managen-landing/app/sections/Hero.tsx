"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Banknote, MessageSquare, ArrowRight, Play, ShieldCheck, Smartphone } from "lucide-react";

function DashboardScreen() {
  return (
    <div className="p-4 pt-14 bg-white h-full" style={{ minHeight: 520 }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div style={{ fontSize: 9, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Good morning</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0B0F1C", fontFamily: "'Space Grotesk', sans-serif" }}>Headmaster Adu</div>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #0B0F1C, #0B4F30)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700 }}>A</div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Attendance", value: "94%", bg: "#D4FF00", text: "#0B0F1C" },
          { label: "Fees Paid", value: "81%", bg: "#0B4F30", text: "white" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ fontSize: 9, color: s.text, opacity: 0.7, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.text, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.2, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ background: "#F8F9FA", borderRadius: 12, padding: "10px 12px", marginBottom: 12, border: "1px solid #F0F0F0" }}>
        <div style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Weekly Attendance</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 44 }}>
          {[0.72, 0.88, 0.94, 0.81, 0.91, 0.86, 0.97].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h * 100}%`, borderRadius: "3px 3px 0 0", background: i === 6 ? "#D4FF00" : i === 5 ? "#0B0F1C" : `rgba(11,15,28,${0.08 + i * 0.08})` }} />
          ))}
        </div>
      </div>

      {/* Activity */}
      <div style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Recent Activity</div>
      {[
        { name: "Kwame Asante", action: "Present", color: "#0B4F30" },
        { name: "Abena Mensah", action: "Fee Paid", color: "#0B0F1C" },
        { name: "Kofi Boateng", action: "Report Sent", color: "#7C3AED" },
      ].map((s) => (
        <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F5F5F5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: s.color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 8, fontWeight: 700 }}>{s.name[0]}</div>
            <span style={{ fontSize: 10, color: "#374151", fontWeight: 500 }}>{s.name}</span>
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: `${s.color}15`, color: s.color }}>{s.action}</span>
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const words = [
    { text: "Run Your School", lime: false },
    { text: "Without", lime: true },
    { text: "the Paperwork", lime: false },
  ];

  return (
    <section id="hero" className="relative overflow-hidden" style={{ background: "#0B0F1C", minHeight: "calc(100vh - 0px)", paddingTop: 72, display: "flex", alignItems: "center" }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

      {/* Glow blobs */}
      <div className="absolute pointer-events-none" style={{ top: "-10%", left: "-5%", width: 700, height: 700, background: "radial-gradient(circle, rgba(212,255,0,0.07) 0%, transparent 65%)", filter: "blur(40px)", animation: "glowPulse 6s ease-in-out infinite" }} />
      <div className="absolute pointer-events-none" style={{ bottom: "-10%", right: "-5%", width: 600, height: 600, background: "radial-gradient(circle, rgba(11,79,48,0.12) 0%, transparent 65%)", filter: "blur(40px)", animation: "glowPulse 8s ease-in-out infinite 2s" }} />
      <div className="absolute pointer-events-none" style={{ top: "40%", right: "20%", width: 400, height: 400, background: "radial-gradient(circle, rgba(212,255,0,0.05) 0%, transparent 65%)", filter: "blur(60px)" }} />

      <div className="max-w-[1200px] mx-auto px-6 py-20 w-full">
        <div className="grid md:grid-cols-[56fr_44fr] gap-14 items-center">

          {/* LEFT */}
          <div style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)", transition: "opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)" }}>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-7 text-xs font-semibold"
              style={{ background: "rgba(212,255,0,0.08)", border: "1px solid rgba(212,255,0,0.2)", borderRadius: 100, padding: "6px 14px", color: "#D4FF00" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#D4FF00", display: "inline-block", animation: "pulseBadge 2s infinite" }} />
              Built for Ghanaian Schools · Free to start
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: "clamp(40px, 5.5vw, 68px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, lineHeight: 1.06, letterSpacing: "-0.035em", color: "white", marginBottom: 28, maxWidth: 580 }}>
              {words.map((w, i) => (
                <span key={i} style={{ display: "block", opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(20px)", transition: `opacity 0.7s ease ${i * 100 + 100}ms, transform 0.7s ease ${i * 100 + 100}ms`, color: w.lime ? "#D4FF00" : "white" }}>
                  {w.text}
                </span>
              ))}
            </h1>

            {/* Sub-bullets */}
            <div className="flex flex-col gap-3 mb-8">
              {[
                "Attendance marked in 30 seconds from any device",
                "Fees collected via MoMo, automatically",
                "WhatsApp reports sent to every parent instantly",
              ].map((b, i) => (
                <div key={i} className="flex items-start gap-3"
                  style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(12px)", transition: `opacity 0.6s ease ${400 + i * 80}ms, transform 0.6s ease ${400 + i * 80}ms` }}>
                  <CheckCircle2 size={18} style={{ color: "#D4FF00", flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mb-10"
              style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 700ms" }}>
              {[
                { icon: ShieldCheck, text: "WAEC & BECE aligned" },
                { icon: Smartphone, text: "Paystack & MTN MoMo" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "rgba(255,255,255,0.5)" }}>
                  <Icon size={13} style={{ color: "rgba(255,255,255,0.35)" }} />
                  {text}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3"
              style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 800ms" }}>
              <button className="flex items-center gap-2 font-bold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "#D4FF00", color: "#0B0F1C", padding: "16px 32px", fontSize: 16, fontFamily: "'Space Grotesk', sans-serif", boxShadow: "0 4px 28px rgba(212,255,0,0.3)" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 40px rgba(212,255,0,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 28px rgba(212,255,0,0.3)"; }}>
                Start Free Trial
                <ArrowRight size={18} strokeWidth={2.5} />
              </button>
              <button className="flex items-center gap-2 font-semibold rounded-xl transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.06)", color: "white", border: "1px solid rgba(255,255,255,0.12)", padding: "16px 28px", fontSize: 16 }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; }}>
                <Play size={16} strokeWidth={2.5} />
                Watch Demo
              </button>
            </div>
          </div>

          {/* RIGHT — Phone */}
          <div className="relative flex justify-center items-center"
            style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(36px)", transition: "opacity 1s ease 0.3s, transform 1s ease 0.3s" }}>

            {/* Lime glow behind phone */}
            <div className="absolute pointer-events-none" style={{ width: 320, height: 320, background: "radial-gradient(circle, rgba(212,255,0,0.18) 0%, transparent 70%)", filter: "blur(40px)", zIndex: 0 }} />

            <div className="relative" style={{ animation: "bobSlow 5s ease-in-out infinite", zIndex: 1 }}>
              {/* Phone */}
              <div style={{ width: 280, background: "#0B0F1C", borderRadius: 48, padding: 12, boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1), 0 0 60px rgba(212,255,0,0.08)", position: "relative" }}>
                {/* Dynamic Island */}
                <div style={{ position: "absolute", top: 18, left: "50%", transform: "translateX(-50%)", width: 110, height: 28, background: "#0B0F1C", borderRadius: 30, zIndex: 10 }} />
                {/* Screen */}
                <div style={{ background: "white", borderRadius: 38, overflow: "hidden", minHeight: 520 }}>
                  <DashboardScreen />
                </div>
              </div>

              {/* Floating card 1 — Attendance */}
              <div className="absolute" style={{ left: -64, top: "18%", animation: "bob 3s ease-in-out infinite" }}>
                <div style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", whiteSpace: "nowrap" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(11,79,48,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CheckCircle2 size={16} style={{ color: "#0B4F30" }} strokeWidth={2.5} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0B0F1C", fontFamily: "'Space Grotesk', sans-serif" }}>Attendance marked</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>94% today · Class 5A</div>
                  </div>
                </div>
              </div>

              {/* Floating card 2 — MoMo */}
              <div className="absolute" style={{ right: -56, top: "44%", animation: "bob 3s ease-in-out infinite 0.8s" }}>
                <div style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", whiteSpace: "nowrap" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(212,255,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Banknote size={16} style={{ color: "#0B4F30" }} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0B0F1C", fontFamily: "'Space Grotesk', sans-serif" }}>₵2,400 received</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>via MTN MoMo · 3m ago</div>
                  </div>
                </div>
              </div>

              {/* Floating card 3 — WhatsApp */}
              <div className="absolute" style={{ left: -52, bottom: "14%", animation: "bob 3s ease-in-out infinite 1.6s" }}>
                <div style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", whiteSpace: "nowrap" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "rgba(37,211,102,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MessageSquare size={16} style={{ color: "#25D366" }} strokeWidth={2} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#0B0F1C", fontFamily: "'Space Grotesk', sans-serif" }}>WhatsApp sent</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF" }}>32 parents notified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
