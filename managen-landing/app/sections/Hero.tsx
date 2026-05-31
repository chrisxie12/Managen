"use client";
import { useEffect, useState } from "react";
import FloatingCard from "../components/FloatingCard";

// Minimal inline phone screen — a compact dashboard
function DashboardScreen() {
  return (
    <div className="p-4 pt-12 bg-white min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] text-gray-400 font-medium">Good morning,</div>
          <div className="text-sm font-bold text-[#0B0F1C]">Headmaster Adu</div>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ background: "#0B0F1C" }}
        >
          A
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: "Attendance", value: "94%", color: "#D4FF00", textColor: "#0B0F1C" },
          { label: "Fees Paid", value: "81%", color: "#0B4F30", textColor: "white" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-3"
            style={{ background: s.color }}
          >
            <div className="text-xs font-medium mb-1" style={{ color: s.textColor, opacity: 0.75 }}>
              {s.label}
            </div>
            <div className="text-xl font-bold" style={{ color: s.textColor }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div
        className="rounded-xl p-3 mb-4"
        style={{ background: "#F8F9FA", border: "1px solid #E5E7EB" }}
      >
        <div className="text-[10px] font-semibold text-gray-500 mb-2">Weekly Attendance</div>
        <div className="flex items-end gap-1 h-12">
          {[70, 88, 94, 82, 91, 87, 95].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${h}%`,
                background: i === 6 ? "#D4FF00" : "#0B0F1C",
                opacity: i === 6 ? 1 : 0.15 + i * 0.12,
              }}
            />
          ))}
        </div>
      </div>

      {/* Student list */}
      <div className="text-[10px] font-semibold text-gray-500 mb-2">Recent Activity</div>
      {[
        { name: "Kwame Asante", action: "Present", color: "#0B4F30" },
        { name: "Abena Mensah", action: "Fee Paid", color: "#0B0F1C" },
        { name: "Kofi Boateng", action: "Present", color: "#0B4F30" },
      ].map((s) => (
        <div key={s.name} className="flex items-center justify-between py-1.5 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
              style={{ background: s.color }}
            >
              {s.name[0]}
            </div>
            <span className="text-[10px] text-gray-700">{s.name}</span>
          </div>
          <span
            className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              background: s.color === "#0B4F30" ? "rgba(11,79,48,0.1)" : "rgba(11,15,28,0.08)",
              color: s.color,
            }}
          >
            {s.action}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setLoaded(true); }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-72px)] flex items-center pt-[72px]"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #1a1f2e 0%, #0B0F1C 50%)",
      }}
    >
      {/* Background lime glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: "15%",
          top: "50%",
          transform: "translateY(-50%)",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(212,255,0,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-6 py-16 w-full">
        <div className="grid md:grid-cols-[55fr_45fr] gap-16 items-center">
          {/* LEFT */}
          <div
            className="flex flex-col gap-6"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 self-start rounded-full text-xs font-medium text-white"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "6px 14px",
              }}
            >
              🇬🇭 Built for Ghanaian Schools
            </div>

            {/* Headline */}
            <h1
              className="font-black leading-[1.08] tracking-[-0.03em]"
              style={{ fontSize: "clamp(36px, 5.5vw, 64px)", color: "white", maxWidth: 560 }}
            >
              Run Your School{" "}
              <span style={{ color: "#D4FF00" }}>Without</span> the Paperwork
            </h1>

            {/* Sub-bullets */}
            <div className="flex flex-col gap-2">
              {[
                { bold: "Attendance in 30 Seconds", rest: " — marked from any device" },
                { bold: "Fees via MoMo", rest: ", Automatically collected" },
              ].map((b, i) => (
                <p key={i} className="text-lg" style={{ color: "rgba(255,255,255,0.8)" }}>
                  <strong className="font-bold text-white">{b.bold}</strong>{b.rest}
                </p>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col gap-1.5">
              {[
                { plain: "Built for ", bold: "WAEC & BECE" },
                { plain: "Integrated with ", bold: "Paystack & MTN MoMo" },
              ].map((t, i) => (
                <p key={i} className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {t.plain}
                  <strong className="font-semibold text-white">{t.bold}</strong>
                </p>
              ))}
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3 mt-2">
              <button
                className="font-bold rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "#D4FF00",
                  color: "#0B0F1C",
                  padding: "16px 32px",
                  fontSize: 16,
                  boxShadow: "0 4px 24px rgba(212,255,0,0.35)",
                }}
              >
                Start Free Trial
              </button>
              <button
                className="font-semibold rounded-xl transition-all duration-200 hover:border-white hover:text-white"
                style={{
                  background: "transparent",
                  color: "rgba(255,255,255,0.85)",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  padding: "16px 28px",
                  fontSize: 16,
                }}
              >
                Watch Demo →
              </button>
            </div>

            {/* Partner badges */}
            <div className="flex flex-wrap items-center gap-6 mt-4 opacity-70">
              {["Paystack", "MTN MoMo", "WhatsApp", "WAEC"].map((p) => (
                <div key={p} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Phone mockup */}
          <div
            className="relative flex justify-center items-center"
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(32px)",
              transition: "opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s",
            }}
          >
            {/* Phone */}
            <div className="relative" style={{ animation: "bob 4s ease-in-out infinite" }}>
              <div
                style={{
                  width: 280,
                  background: "#0B0F1C",
                  borderRadius: 48,
                  padding: 12,
                  boxShadow: "0 25px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)",
                  position: "relative",
                }}
              >
                {/* Dynamic Island */}
                <div
                  style={{
                    position: "absolute",
                    top: 18,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 120,
                    height: 30,
                    background: "#0B0F1C",
                    borderRadius: 30,
                    zIndex: 10,
                  }}
                />
                {/* Screen */}
                <div style={{ background: "white", borderRadius: 38, overflow: "hidden", minHeight: 520 }}>
                  <DashboardScreen />
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute" style={{ left: -60, top: "20%" }}>
                <FloatingCard icon="✓" text="Attendance marked" subtext="94% today" delay={0} />
              </div>
              <div className="absolute" style={{ right: -50, top: "48%" }}>
                <FloatingCard icon="💰" text="₵2,400 via MoMo" subtext="3 mins ago" delay={0.5} />
              </div>
              <div className="absolute" style={{ left: -48, bottom: "15%" }}>
                <FloatingCard icon="✓" text="WhatsApp sent" subtext="32 parents notified" delay={1} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
