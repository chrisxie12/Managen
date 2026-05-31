"use client";
import { useState } from "react";
import { Check, Zap } from "lucide-react";
import ScrollReveal from "../components/ScrollReveal";

const PLANS = [
  {
    name: "Free Trial",
    monthlyPrice: "Free",
    annualPrice: "Free",
    period: "7 days",
    features: ["Up to 50 students", "Attendance & fee tracking", "Basic reports", "Email support", "Setup in 10 minutes"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Starter",
    monthlyPrice: "GHS 199",
    annualPrice: "GHS 159",
    period: "month",
    features: ["Up to 150 students", "Everything in Free", "WhatsApp reports", "Exam scheduling", "CSV import"],
    cta: "Start Free Trial",
    featured: false,
  },
  {
    name: "Growth",
    monthlyPrice: "GHS 499",
    annualPrice: "GHS 399",
    period: "month",
    features: ["Up to 300 students", "Everything in Starter", "Fee tracking & invoicing", "Exams & admissions", "Unlimited WhatsApp", "Priority support"],
    cta: "Start Free Trial",
    featured: true,
    badge: "Most Popular",
  },
  {
    name: "Pro",
    monthlyPrice: "GHS 999",
    annualPrice: "GHS 799",
    period: "month",
    features: ["Up to 800 students", "Everything in Growth", "Library & hostel", "Payroll management", "All integrations"],
    cta: "Start Free Trial",
    featured: false,
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    annualPrice: "Custom",
    period: "",
    features: ["Unlimited students", "All modules", "Custom branding", "Dedicated manager", "API access"],
    cta: "Contact Sales",
    featured: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-[100px] bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <ScrollReveal className="text-center mb-10">
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#0B0F1C", marginBottom: 12, letterSpacing: "-0.025em" }}>
            Simple pricing, no hidden fees
          </h2>
          <p style={{ fontSize: 18, color: "#6B7280", marginBottom: 32 }}>Start free. Upgrade when you&apos;re ready.</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3">
            <span style={{ fontSize: 14, fontWeight: 500, color: annual ? "#9CA3AF" : "#0B0F1C" }}>Monthly</span>
            <button
              onClick={() => setAnnual(v => !v)}
              className="relative transition-all duration-300"
              style={{ width: 52, height: 28, borderRadius: 100, background: annual ? "#D4FF00" : "#E5E7EB", border: "none", cursor: "pointer", flexShrink: 0 }}
            >
              <div style={{ position: "absolute", top: 3, left: annual ? 27 : 3, width: 22, height: 22, borderRadius: "50%", background: annual ? "#0B0F1C" : "white", transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }} />
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: annual ? "#0B0F1C" : "#9CA3AF" }}>
              Annual
              {annual && <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, background: "#D4FF00", color: "#0B0F1C", padding: "2px 8px", borderRadius: 100 }}>Save 20%</span>}
            </span>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {PLANS.map((plan, i) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <ScrollReveal key={plan.name} delay={i * 70}>
                <div
                  className="relative flex flex-col h-full rounded-2xl transition-all duration-300 cursor-pointer group"
                  style={{
                    background: plan.featured ? "#0B0F1C" : "white",
                    border: plan.featured ? "2px solid #D4FF00" : "1.5px solid #E5E7EB",
                    padding: plan.featured ? "32px 28px" : "28px 24px",
                    boxShadow: plan.featured ? "0 8px 40px rgba(212,255,0,0.12)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(-6px)";
                    el.style.boxShadow = plan.featured
                      ? "0 20px 60px rgba(212,255,0,0.2)"
                      : "0 12px 40px rgba(0,0,0,0.1)";
                    if (!plan.featured) el.style.borderColor = "#0B4F30";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "none";
                    el.style.boxShadow = plan.featured ? "0 8px 40px rgba(212,255,0,0.12)" : "none";
                    if (!plan.featured) el.style.borderColor = "#E5E7EB";
                  }}
                >
                  {/* Top accent bar */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "14px 14px 0 0", background: plan.featured ? "#D4FF00" : i === 0 ? "transparent" : "linear-gradient(90deg, #E5E7EB, transparent)" }} />

                  {plan.badge && (
                    <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "#D4FF00", color: "#0B0F1C", fontSize: 10, fontWeight: 800, padding: "4px 14px", borderRadius: 100, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", animation: "pulseBadge 2.5s infinite", boxShadow: "0 4px 16px rgba(212,255,0,0.5)" }}>
                      {plan.badge}
                    </div>
                  )}

                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: plan.featured ? "rgba(255,255,255,0.5)" : "#9CA3AF", marginBottom: 12 }}>
                    {plan.name}
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    {annual && plan.monthlyPrice !== "Free" && plan.monthlyPrice !== "Custom" && (
                      <div style={{ fontSize: 12, color: plan.featured ? "rgba(255,255,255,0.35)" : "#9CA3AF", textDecoration: "line-through", marginBottom: 2 }}>
                        {plan.monthlyPrice}/mo
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: price === "Free" || price === "Custom" ? 36 : 28, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: plan.featured ? "white" : "#0B0F1C", letterSpacing: "-0.025em" }}>{price}</span>
                      {plan.period && <span style={{ fontSize: 13, color: plan.featured ? "rgba(255,255,255,0.4)" : "#9CA3AF" }}>/{plan.period}</span>}
                    </div>
                  </div>

                  <ul style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: plan.featured ? "rgba(255,255,255,0.8)" : "#4B5563" }}>
                        <Check size={14} style={{ color: plan.featured ? "#D4FF00" : "#0B4F30", flexShrink: 0, marginTop: 1 }} strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    style={{
                      width: "100%", padding: "12px 0", borderRadius: 12, fontSize: 13, fontWeight: 700,
                      background: plan.featured ? "#D4FF00" : "transparent",
                      color: plan.featured ? "#0B0F1C" : "#0B0F1C",
                      border: plan.featured ? "none" : "1.5px solid #E5E7EB",
                      cursor: "pointer", transition: "all 0.2s",
                      fontFamily: "'Space Grotesk', sans-serif",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                    onMouseEnter={(e) => {
                      if (plan.featured) { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(212,255,0,0.4)"; }
                      else {
                        (e.currentTarget as HTMLElement).style.borderColor = "#0B0F1C";
                        (e.currentTarget as HTMLElement).style.background = "#0B0F1C";
                        (e.currentTarget as HTMLElement).style.color = "white";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (plan.featured) { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }
                      else {
                        (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#0B0F1C";
                      }
                    }}
                  >
                    {plan.featured && <Zap size={13} strokeWidth={2.5} />}
                    {plan.cta}
                  </button>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
