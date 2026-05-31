"use client";
import { useEffect, useRef, useState } from "react";
import { Building2, TrendingUp, Clock, Users } from "lucide-react";

function useCountUp(target: number, duration = 1600, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return value;
}

const STATS = [
  { target: 2400, suffix: "+", label: "Schools onboarded", icon: Building2, color: "#D4FF00" },
  { target: 98, suffix: "%", label: "Attendance accuracy", icon: TrendingUp, color: "#D4FF00" },
  { target: 5, suffix: "hrs", label: "Saved per week", icon: Clock, color: "#D4FF00" },
  { target: 48000, suffix: "+", label: "Students tracked", icon: Users, color: "#D4FF00" },
];

const MARQUEE_ITEMS = [
  "Paystack", "MTN MoMo", "WhatsApp Business", "WAEC", "GES", "NaCCA",
  "Vodafone Cash", "AirtelTigo Money", "Paystack", "MTN MoMo", "WhatsApp Business", "WAEC", "GES", "NaCCA",
  "Vodafone Cash", "AirtelTigo Money",
];

function StatCard({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const value = useCountUp(stat.target, 1800 + index * 200, started);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Icon = stat.icon;
  return (
    <div ref={ref} className="flex flex-col items-center gap-3 group">
      <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(212,255,0,0.08)", border: "1px solid rgba(212,255,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s ease" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(212,255,0,0.15)"; (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(212,255,0,0.08)"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
        <Icon size={22} style={{ color: "#D4FF00" }} strokeWidth={2} />
      </div>
      <div className="text-center">
        <div style={{ fontSize: "clamp(32px, 4vw, 48px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: "white", lineHeight: 1, letterSpacing: "-0.03em" }}>
          {value.toLocaleString()}
          <span style={{ color: "#D4FF00" }}>{stat.suffix}</span>
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginTop: 6, fontWeight: 500 }}>{stat.label}</div>
      </div>
    </div>
  );
}

export default function Stats() {
  return (
    <section style={{ background: "#0B0F1C", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      {/* Stat counters */}
      <div className="max-w-[1200px] mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6">
          {STATS.map((stat, i) => <StatCard key={stat.label} stat={stat} index={i} />)}
        </div>
      </div>

      {/* Marquee */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "20px 0", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(90deg, #0B0F1C, transparent)", zIndex: 2 }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 80, background: "linear-gradient(-90deg, #0B0F1C, transparent)", zIndex: 2 }} />
        <div style={{ display: "flex", gap: 0, animation: "marquee 28s linear infinite", width: "max-content" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.animationPlayState = "paused"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.animationPlayState = "running"; }}>
          {MARQUEE_ITEMS.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 32, paddingRight: 32 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", letterSpacing: "0.05em", textTransform: "uppercase" }}>{item}</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(212,255,0,0.3)", flexShrink: 0 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
