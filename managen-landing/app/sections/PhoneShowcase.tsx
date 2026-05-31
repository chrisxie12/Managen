"use client";
import ScrollReveal from "../components/ScrollReveal";

function ShowcasePhone() {
  return (
    <div
      style={{
        width: 260,
        background: "#1a1a2e",
        borderRadius: 44,
        padding: 10,
        boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          position: "relative",
          background: "#0f0f1a",
          borderRadius: 36,
          overflow: "hidden",
          minHeight: 480,
          padding: "40px 16px 20px",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            transform: "translateX(-50%)",
            width: 100,
            height: 26,
            background: "#0f0f1a",
            borderRadius: 20,
          }}
        />

        {/* Attendance ring */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "conic-gradient(#D4FF00 0% 94%, rgba(255,255,255,0.1) 94% 100%)",
              boxShadow: "0 0 32px rgba(212,255,0,0.3)",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#0f0f1a",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="text-2xl font-black text-white">94%</span>
              <span className="text-[8px] text-gray-400">Attendance</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: "Save 5h/week", icon: "⏱️", color: "#D4FF00" },
            { label: "WhatsApp ✓", icon: "💬", color: "#25D366" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-2.5 flex items-center gap-2"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <span>{s.icon}</span>
              <span className="text-[10px] font-semibold text-white">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Getting started card */}
        <div
          className="rounded-xl p-3"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="text-[9px] font-bold uppercase tracking-wide text-gray-500 mb-1">
            Getting Started
          </div>
          <div className="space-y-1.5">
            {[
              "Add your school details",
              "Import student list (CSV)",
              "Set up fee structure",
              "Connect WhatsApp notifications",
            ].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0"
                  style={{
                    background: i < 2 ? "#D4FF00" : "rgba(255,255,255,0.1)",
                    color: i < 2 ? "#0B0F1C" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {i < 2 ? "✓" : i + 1}
                </div>
                <span className="text-[9px]" style={{ color: i < 2 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PhoneShowcase() {
  return (
    <section
      className="py-[100px] relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* BG glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 100%, rgba(212,255,0,0.15) 0%, transparent 60%)",
        }}
      />

      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <ScrollReveal>
            <div className="text-white">
              <div
                className="inline-flex items-center gap-2 mb-6 rounded-full text-xs font-semibold"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  padding: "6px 14px",
                }}
              >
                ✨ Managen meets WhatsApp
              </div>
              <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6">
                Your school in your pocket.
                <br />
                <span style={{ color: "#D4FF00" }}>Every update. Every parent.</span>
              </h2>
              <p className="text-lg opacity-80 mb-8 leading-relaxed">
                Parents get instant WhatsApp messages for attendance, fees, and exam results. No app
                downloads, no logins. Just a message on the phone they already use.
              </p>

              <div className="space-y-4">
                {[
                  { icon: "⚡", title: "Save 5 Hours Weekly", text: "Automate attendance, fee reminders, and report generation." },
                  { icon: "💬", title: "100% Parent Reach", text: "WhatsApp has 98% open rates. Every parent stays informed." },
                  { icon: "🇬🇭", title: "MoMo Payments", text: "Collect fees directly via MTN and Vodafone Cash." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-bold text-white">{item.title}</div>
                      <div className="text-sm opacity-70 mt-0.5">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="mt-10 font-bold rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: "#D4FF00",
                  color: "#0B0F1C",
                  padding: "16px 32px",
                  fontSize: 16,
                  boxShadow: "0 4px 24px rgba(212,255,0,0.3)",
                }}
              >
                Start Free Trial →
              </button>
            </div>
          </ScrollReveal>

          {/* Right: Phone */}
          <ScrollReveal delay={150}>
            <ShowcasePhone />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
