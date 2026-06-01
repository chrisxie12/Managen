"use client";
import { useState } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'DM Sans', system-ui, sans-serif; background: #fff; color: #0B0F1C; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

  .lp-hero { min-height: 100vh; background: #0B0F1C; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 24px 80px; text-align: center; position: relative; overflow: hidden; }
  .lp-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 50px 50px; pointer-events: none; }
  .lp-glow { position: absolute; border-radius: 50%; pointer-events: none; }
  .lp-inner { position: relative; z-index: 1; max-width: 780px; display: flex; flex-direction: column; align-items: center; }
  .lp-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; padding: 6px 16px; margin-bottom: 32px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.8); }
  .lp-badge-dot { width: 6px; height: 6px; background: #D4FF00; border-radius: 50%; animation: lpPulse 2s infinite; }
  .lp-h1 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(40px, 7vw, 64px); font-weight: 800; color: #fff; line-height: 1.08; letter-spacing: -0.025em; margin-bottom: 24px; }
  .lp-lime { color: #D4FF00; }
  .lp-sub { font-size: clamp(16px, 2.5vw, 18px); color: rgba(255,255,255,0.58); max-width: 520px; line-height: 1.65; margin-bottom: 32px; }
  .lp-bullets { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-bottom: 40px; }
  .lp-bullet { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 100px; padding: 8px 16px; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.85); }
  .lp-bullet-dot { width: 8px; height: 8px; background: #D4FF00; border-radius: 50%; flex-shrink: 0; }
  .lp-actions { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
  .lp-btn-lime { background: #D4FF00; color: #0B0F1C; border: none; border-radius: 100px; padding: 14px 28px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: all 0.2s; }
  .lp-btn-lime:hover { background: #c4ef00; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(212,255,0,0.3); }
  .lp-btn-ghost { background: transparent; color: rgba(255,255,255,0.85); border: 1px solid rgba(255,255,255,0.22); border-radius: 100px; padding: 14px 28px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: all 0.2s; }
  .lp-btn-ghost:hover { border-color: rgba(255,255,255,0.5); color: #fff; }

  .lp-section { padding: 96px 24px; }
  .lp-eyebrow { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0B4F30; background: rgba(11,79,48,0.08); padding: 4px 12px; border-radius: 100px; margin-bottom: 16px; }
  .lp-section-h2 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(28px, 5vw, 44px); font-weight: 700; color: #0B0F1C; line-height: 1.12; letter-spacing: -0.02em; margin-bottom: 16px; }
  .lp-section-p { font-size: 17px; color: #6B7280; line-height: 1.7; max-width: 600px; }
  .lp-section-hdr { text-align: center; margin-bottom: 56px; }

  .lp-pricing-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; max-width: 1240px; margin: 0 auto; align-items: start; }
  .lp-plan { background: #fff; border: 1px solid #E5E7EB; border-radius: 20px; padding: 28px 22px 24px; position: relative; transition: transform 0.25s, box-shadow 0.25s; }
  .lp-plan:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.1); }
  .lp-plan.feat { background: #0B0F1C; border: 2px solid #D4FF00; }
  .lp-popular { position: absolute; top: -13px; left: 50%; transform: translateX(-50%); background: #D4FF00; color: #0B0F1C; font-size: 10px; font-weight: 800; padding: 4px 14px; border-radius: 100px; white-space: nowrap; }
  .lp-plan-tier { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; color: #9CA3AF; margin-bottom: 10px; }
  .lp-plan.feat .lp-plan-tier { color: rgba(255,255,255,0.5); }
  .lp-plan-price { display: flex; align-items: baseline; gap: 3px; margin-bottom: 4px; }
  .lp-plan-currency { font-size: 14px; font-weight: 600; color: #9CA3AF; }
  .lp-plan-amount { font-family: 'Space Grotesk', sans-serif; font-size: 34px; font-weight: 700; color: #0B0F1C; line-height: 1; }
  .lp-plan.feat .lp-plan-currency { color: rgba(255,255,255,0.45); }
  .lp-plan.feat .lp-plan-amount { color: #fff; }
  .lp-plan-period { font-size: 12px; color: #9CA3AF; margin-bottom: 20px; }
  .lp-plan.feat .lp-plan-period { color: rgba(255,255,255,0.4); }
  .lp-plan-divider { height: 1px; background: #E5E7EB; margin: 20px 0; }
  .lp-plan.feat .lp-plan-divider { background: rgba(255,255,255,0.1); }
  .lp-plan-features { list-style: none; display: flex; flex-direction: column; gap: 9px; margin-bottom: 24px; }
  .lp-plan-feat-item { display: flex; gap: 8px; font-size: 13px; color: #374151; line-height: 1.4; }
  .lp-plan-feat-item::before { content: "✓"; color: #0B4F30; font-weight: 700; flex-shrink: 0; }
  .lp-plan.feat .lp-plan-feat-item { color: rgba(255,255,255,0.75); }
  .lp-plan.feat .lp-plan-feat-item::before { color: #D4FF00; }
  .lp-plan-btn { width: 100%; padding: 12px; border-radius: 100px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; border: none; transition: all 0.2s; }
  .lp-plan-btn.ghost { background: #F3F4F6; color: #0B0F1C; }
  .lp-plan-btn.ghost:hover { background: #E5E7EB; }
  .lp-plan-btn.lime { background: #D4FF00; color: #0B0F1C; }
  .lp-plan-btn.lime:hover { background: #c4ef00; }
  .lp-plan-btn.dark { background: #0B0F1C; color: #fff; }
  .lp-plan-btn.dark:hover { opacity: 0.85; }

  .lp-calc-box { max-width: 700px; margin: 0 auto; background: #fff; border: 1px solid #E5E7EB; border-radius: 24px; padding: 48px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .lp-calc-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 32px; }
  .lp-calc-label { display: block; font-size: 12px; font-weight: 700; color: #6B7280; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 8px; }
  .lp-calc-select { width: 100%; padding: 12px 16px; border: 1px solid #E5E7EB; border-radius: 12px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; color: #0B0F1C; background: #F9FAFB; appearance: none; cursor: pointer; outline: none; transition: border-color 0.2s; }
  .lp-calc-select:focus { border-color: #D4FF00; box-shadow: 0 0 0 3px rgba(212,255,0,0.15); }
  .lp-calc-result { background: #0B0F1C; border-radius: 16px; padding: 28px 32px; text-align: center; }
  .lp-calc-result-lbl { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
  .lp-calc-result-val { font-family: 'Space Grotesk', sans-serif; font-size: clamp(28px, 4vw, 40px); font-weight: 800; color: #D4FF00; line-height: 1; margin-bottom: 8px; }
  .lp-calc-result-sub { font-size: 15px; color: rgba(255,255,255,0.6); }

  .lp-hiw-cards { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
  .lp-hiw-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 24px; overflow: hidden; transition: box-shadow 0.3s, border-color 0.3s; }
  .lp-hiw-card:hover { box-shadow: 0 20px 60px rgba(0,0,0,0.09); border-color: #c4c8d0; }
  .lp-hiw-row { display: flex; align-items: stretch; }
  .lp-hiw-row.rev { flex-direction: row-reverse; }
  .lp-hiw-text { flex: 1; padding: 48px 56px; }
  .lp-hiw-num { width: 36px; height: 36px; background: #D4FF00; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-size: 14px; font-weight: 800; color: #0B0F1C; margin-bottom: 16px; }
  .lp-hiw-kicker { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #9CA3AF; margin-bottom: 8px; }
  .lp-hiw-h3 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(22px, 3vw, 30px); font-weight: 700; color: #0B0F1C; line-height: 1.2; margin-bottom: 16px; }
  .lp-hiw-p { font-size: 15px; color: #6B7280; line-height: 1.75; max-width: 420px; }
  .lp-hiw-phone { min-width: 260px; display: flex; align-items: center; justify-content: center; padding: 40px; background: #F8F9FA; flex-shrink: 0; }
  .lp-phone { width: 158px; background: #0B0F1C; border-radius: 32px; padding: 8px; box-shadow: 0 12px 36px rgba(0,0,0,0.28), 0 0 0 1px rgba(255,255,255,0.07); }
  .lp-phone-island { width: 60px; height: 13px; background: #0B0F1C; border-radius: 13px; margin: 3px auto 0; }
  .lp-phone-screen { background: #fff; border-radius: 25px; overflow: hidden; min-height: 240px; }

  .lp-trust-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; max-width: 1000px; margin: 0 auto 64px; }
  .lp-trust-logo { background: #fff; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px 16px; display: flex; flex-direction: column; align-items: center; gap: 8px; transition: box-shadow 0.2s; }
  .lp-trust-logo:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
  .lp-trust-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 800; }
  .lp-trust-name { font-size: 11px; font-weight: 700; color: #6B7280; text-align: center; }
  .lp-trust-quote-box { max-width: 720px; margin: 0 auto; text-align: center; padding: 40px; background: #fff; border: 1px solid #E5E7EB; border-radius: 20px; }
  .lp-trust-quote-txt { font-size: 18px; font-style: italic; color: #0B0F1C; line-height: 1.7; margin-bottom: 20px; }
  .lp-trust-quote-attr { font-size: 14px; font-weight: 600; color: #9CA3AF; }

  .lp-footer { background: #0B0F1C; border-top: 1px solid rgba(255,255,255,0.07); padding: 64px 32px 40px; }
  .lp-footer-inner { max-width: 1100px; margin: 0 auto; }
  .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }
  .lp-footer-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; margin-bottom: 14px; }
  .lp-footer-mark { width: 34px; height: 34px; background: #D4FF00; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 17px; color: #0B0F1C; flex-shrink: 0; }
  .lp-footer-brand { font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 19px; color: #fff; }
  .lp-footer-tag { font-size: 14px; color: rgba(255,255,255,0.42); line-height: 1.6; max-width: 240px; }
  .lp-footer-col-title { font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 16px; }
  .lp-footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .lp-footer-links a { text-decoration: none; font-size: 14px; color: rgba(255,255,255,0.55); transition: color 0.2s; }
  .lp-footer-links a:hover { color: #fff; }
  .lp-footer-bottom { border-top: 1px solid rgba(255,255,255,0.07); padding-top: 28px; display: flex; align-items: center; justify-content: space-between; }
  .lp-footer-copy, .lp-footer-love { font-size: 13px; color: rgba(255,255,255,0.3); }

  @keyframes lpPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }

  @media (max-width: 1100px) {
    .lp-pricing-grid { grid-template-columns: repeat(3, 1fr); }
    .lp-trust-grid { grid-template-columns: repeat(3, 1fr); }
    .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
  }
  @media (max-width: 768px) {
    .lp-section { padding: 64px 24px; }
    .lp-hiw-row, .lp-hiw-row.rev { flex-direction: column !important; }
    .lp-hiw-text { padding: 28px 24px; }
    .lp-hiw-phone { padding: 24px; min-width: unset; }
    .lp-pricing-grid { grid-template-columns: 1fr; }
    .lp-calc-row { grid-template-columns: 1fr; }
    .lp-trust-grid { grid-template-columns: repeat(2, 1fr); }
    .lp-footer-grid { grid-template-columns: 1fr; }
    .lp-footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
  }
  @media (max-width: 480px) {
    .lp-actions { flex-direction: column; align-items: center; }
    .lp-calc-box { padding: 28px 20px; }
  }
`;

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="lp-phone">
      <div className="lp-phone-island" />
      <div className="lp-phone-screen">{children}</div>
    </div>
  );
}

function AttendanceScreen() {
  const rows = [
    { name: "Kwame A.", present: true },
    { name: "Abena M.", present: true },
    { name: "Kofi B.", present: false },
    { name: "Ama O.", present: true },
  ];
  return (
    <div style={{ padding: 10 }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3AF", marginBottom: 8 }}>Attendance — Mon</div>
      {rows.map((r) => (
        <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 6px", borderRadius: 6, background: "#F9FAFB", marginBottom: 3 }}>
          <span style={{ fontSize: 8, fontWeight: 600, color: "#0B0F1C" }}>{r.name}</span>
          <span style={{ fontSize: 7, fontWeight: 700, padding: "2px 6px", borderRadius: 100, background: r.present ? "rgba(11,79,48,0.12)" : "rgba(239,68,68,0.1)", color: r.present ? "#0B4F30" : "#EF4444" }}>{r.present ? "Present" : "Absent"}</span>
        </div>
      ))}
      <div style={{ background: "#D4FF00", borderRadius: 7, textAlign: "center", padding: 5, fontSize: 7.5, fontWeight: 700, color: "#0B0F1C", marginTop: 7 }}>✓ 3/4 Marked — 75%</div>
    </div>
  );
}

function WAScreen() {
  const msgs = [
    { text: "✅ Kwame was present today at Lincoln Academy", out: false },
    { text: "💰 Fee reminder: GHS 250 due Friday", out: true },
    { text: "📊 Term 2 report card ready to view", out: false },
  ];
  return (
    <div style={{ background: "#ECE5DD", padding: 10, minHeight: 240 }}>
      <div style={{ fontSize: 8, fontWeight: 700, color: "#6B7280", textAlign: "center", marginBottom: 10 }}>WhatsApp Reports</div>
      {msgs.map((m, i) => (
        <div key={i} style={{ background: m.out ? "#DCF8C6" : "#fff", borderRadius: m.out ? "10px 10px 2px 10px" : "10px 10px 10px 2px", padding: "7px 9px", maxWidth: "82%", marginBottom: 6, marginLeft: m.out ? "auto" : 0, fontSize: 7.5, color: "#333", lineHeight: 1.4 }}>
          {m.text}
          <div style={{ fontSize: 6, color: "#9CA3AF", marginTop: 2, textAlign: "right" }}>2:15 PM ✓✓</div>
        </div>
      ))}
    </div>
  );
}

function PlanScreen() {
  return (
    <div style={{ padding: 10, minHeight: 240 }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3AF", marginBottom: 8 }}>Your Plan</div>
      <div style={{ background: "#D4FF00", borderRadius: 10, padding: 9, marginBottom: 9 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "#0B0F1C" }}>Growth</div>
        <div style={{ fontSize: 7.5, color: "#0B0F1C", opacity: 0.65, marginTop: 2 }}>GHS 499 / month</div>
        <div style={{ fontSize: 8.5, fontWeight: 700, color: "#0B0F1C", marginTop: 3 }}>300 students</div>
      </div>
      {["WhatsApp Reports", "Fee Invoicing", "Exam Scheduling"].map((f) => (
        <div key={f} style={{ fontSize: 7.5, color: "#6B7280", marginBottom: 4 }}><span style={{ color: "#0B4F30", fontWeight: 700 }}>✓ </span>{f}</div>
      ))}
    </div>
  );
}

function AnalyticsScreen() {
  return (
    <div style={{ padding: 10, minHeight: 240 }}>
      <div style={{ fontSize: 7.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3AF", marginBottom: 8 }}>Analytics</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
        {[{ l: "Avg Attendance", v: "92%", t: "↑ +3%", up: true }, { l: "Fee Collection", v: "88%", t: "↑ +5%", up: true }, { l: "Exam Pass Rate", v: "78%", t: "↓ -2%", up: false }, { l: "Active Students", v: "297", t: "↑ +12", up: true }].map((m) => (
          <div key={m.l} style={{ background: "#F9FAFB", borderRadius: 8, padding: 7 }}>
            <div style={{ fontSize: 7, color: "#6B7280" }}>{m.l}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0B0F1C", margin: "2px 0 1px" }}>{m.v}</div>
            <div style={{ fontSize: 7, color: m.up ? "#0B4F30" : "#EF4444" }}>{m.t}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const PLANS = [
  { tier: "Free", amount: "₵0", period: "Forever free", features: ["Up to 50 students", "Basic attendance", "1 teacher account", "Basic reports", "Email support"], btn: "ghost", label: "Get Started Free", href: "/app/auth/signup", featured: false },
  { tier: "Starter", currency: "GHS", amount: "199", period: "/month · up to 100 students", features: ["Up to 100 students", "Full attendance system", "5 teacher accounts", "Fee management", "Basic WhatsApp reports"], btn: "ghost", label: "Start Starter", href: "/app/auth/signup", featured: false },
  { tier: "Growth", currency: "GHS", amount: "499", period: "/month · up to 300 students", features: ["Up to 300 students", "Unlimited teachers", "Full WhatsApp reports", "Fee invoicing & MoMo", "Exam scheduling & analytics"], btn: "lime", label: "Start Growth Plan", href: "/app/auth/signup", featured: true },
  { tier: "Pro", currency: "GHS", amount: "999", period: "/month · up to 1,000 students", features: ["Up to 1,000 students", "Multi-campus support", "Custom report templates", "Priority support & API", "WAEC results import"], btn: "ghost", label: "Start Pro", href: "/app/auth/signup", featured: false },
  { tier: "Enterprise", amount: "Custom", period: "Tailored for your district", features: ["Unlimited students", "District-wide rollout", "Dedicated account manager", "Custom integrations", "SLA & on-site training"], btn: "dark", label: "Contact Sales", href: "mailto:hello@getschoolos.me", featured: false },
];

const FEATURES = [
  { kicker: "Dashboard", title: "One Dashboard, Every Department", text: "Attendance, fees, exams, reports — all in one place. Your whole school runs from a single screen. No switching apps, no chasing data.", screen: <AttendanceScreen />, rev: false },
  { kicker: "WhatsApp Reports", title: "Seamless Parent Communication", text: "Now live across Ghana. Send attendance, fee reminders, and report cards to every parent automatically. No manual work, no missed updates — ever.", screen: <WAScreen />, rev: true },
  { kicker: "Flexible Plans", title: "Upgrade or Pause — Whenever You Want", text: "Need more features? Upgrade in a tap. Growing? Add students instantly. Not using it? Pause your plan and resume later — your data never expires.", screen: <PlanScreen />, rev: false },
  { kicker: "Analytics", title: "Real-Time School Insights", text: "Track attendance trends, fee collection rates, and academic performance from one dashboard. Export reports, identify issues, celebrate wins.", screen: <AnalyticsScreen />, rev: true },
];

const LOGOS = [
  { abbr: "GE", name: "Ghana Education Service", bg: "#006B3F", color: "#fff" },
  { abbr: "W", name: "WAEC", bg: "#1A3055", color: "#fff" },
  { abbr: "P", name: "Paystack", bg: "#011B33", color: "#fff" },
  { abbr: "M", name: "MTN MoMo", bg: "#FFCC00", color: "#333" },
  { abbr: "W", name: "WhatsApp", bg: "#25D366", color: "#fff" },
  { abbr: "N", name: "NaCCA", bg: "#003893", color: "#fff" },
];

function savings(students: number, campuses: number) {
  const base = students <= 100 ? 3 : students <= 300 ? 6 : students <= 600 ? 10 : 16;
  return base * campuses;
}

function recommended(students: number) {
  if (students <= 50) return "Free";
  if (students <= 100) return "Starter";
  if (students <= 300) return "Growth";
  if (students <= 1000) return "Pro";
  return "Enterprise";
}

export default function Home() {
  const [students, setStudents] = useState(100);
  const [campuses, setCampuses] = useState(1);

  return (
    <>
      <style>{CSS}</style>

      {/* HERO */}
      <section className="lp-hero" id="home">
        <div className="lp-grid" />
        <div className="lp-glow" style={{ width: 600, height: 600, background: "radial-gradient(circle, rgba(212,255,0,0.1) 0%, transparent 70%)", top: -200, left: -150 }} />
        <div className="lp-glow" style={{ width: 500, height: 500, background: "radial-gradient(circle, rgba(11,79,48,0.18) 0%, transparent 70%)", bottom: -150, right: -100 }} />
        <div className="lp-inner">
          <div className="lp-badge"><div className="lp-badge-dot" />Now live across Ghana &amp; West Africa</div>
          <h1 className="lp-h1">Run Your School<br /><span className="lp-lime">Without</span> the Paperwork</h1>
          <p className="lp-sub">The all-in-one platform for Ghanaian schools. Attendance, fees, WhatsApp reports — all automated.</p>
          <div className="lp-bullets">
            <div className="lp-bullet"><div className="lp-bullet-dot" />Attendance in 30 Seconds</div>
            <div className="lp-bullet"><div className="lp-bullet-dot" />Fees via MoMo, Automatically</div>
          </div>
          <div className="lp-actions">
            <a className="lp-btn-lime" href="/app/auth/signup">Start Free Trial</a>
            <a className="lp-btn-ghost" href="#features">Watch Demo →</a>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-section" id="pricing" style={{ background: "#fff" }}>
        <div className="lp-section-hdr">
          <span className="lp-eyebrow">Pricing</span>
          <h2 className="lp-section-h2">Choose Your Plan</h2>
          <p className="lp-section-p" style={{ margin: "0 auto" }}>Start free. Add features. Scale up. No commitments, no overpaying.</p>
        </div>
        <div className="lp-pricing-grid">
          {PLANS.map((p) => (
            <div key={p.tier} className={`lp-plan${p.featured ? " feat" : ""}`}>
              {p.featured && <div className="lp-popular">⚡ MOST POPULAR</div>}
              <div className="lp-plan-tier">{p.tier}</div>
              <div className="lp-plan-price">
                {p.currency && <span className="lp-plan-currency">{p.currency}</span>}
                <span className="lp-plan-amount" style={!p.currency ? { fontSize: p.amount === "Custom" ? 26 : 30, color: p.featured ? "#fff" : "#9CA3AF" } : {}}>{p.amount}</span>
              </div>
              <div className="lp-plan-period">{p.period}</div>
              <div className="lp-plan-divider" />
              <ul className="lp-plan-features">
                {p.features.map((f) => <li key={f} className="lp-plan-feat-item">{f}</li>)}
              </ul>
              <button className={`lp-plan-btn ${p.btn}`} onClick={() => { window.location.href = p.href; }}>{p.label}</button>
            </div>
          ))}
        </div>
      </section>

      {/* CALCULATOR */}
      <section className="lp-section" style={{ background: "#F5F5F4" }}>
        <div className="lp-section-hdr">
          <span className="lp-eyebrow">Time Savings</span>
          <h2 className="lp-section-h2">See how much time you could save</h2>
          <p className="lp-section-p" style={{ margin: "0 auto" }}>Schools using Managen report saving hours every week on admin work.</p>
        </div>
        <div className="lp-calc-box">
          <div className="lp-calc-row">
            <div>
              <label className="lp-calc-label">How many students?</label>
              <select className="lp-calc-select" value={students} onChange={(e) => setStudents(Number(e.target.value))}>
                <option value={50}>Up to 50</option>
                <option value={100}>Up to 100</option>
                <option value={300}>Up to 300</option>
                <option value={600}>Up to 600</option>
                <option value={1000}>Up to 1,000</option>
                <option value={2000}>1,000+</option>
              </select>
            </div>
            <div>
              <label className="lp-calc-label">How many campuses?</label>
              <select className="lp-calc-select" value={campuses} onChange={(e) => setCampuses(Number(e.target.value))}>
                <option value={1}>1 campus</option>
                <option value={2}>2 campuses</option>
                <option value={3}>3 campuses</option>
                <option value={5}>5+ campuses</option>
              </select>
            </div>
            <div>
              <label className="lp-calc-label">Recommended plan</label>
              <select className="lp-calc-select" disabled value={recommended(students)} style={{ background: "rgba(212,255,0,0.08)", borderColor: "#D4FF00", color: "#0B4F30", fontWeight: 700 }}>
                <option>{recommended(students)}</option>
              </select>
            </div>
          </div>
          <div className="lp-calc-result">
            <div className="lp-calc-result-lbl">You could save</div>
            <div className="lp-calc-result-val">{savings(students, campuses)} hours</div>
            <div className="lp-calc-result-sub">per week on admin work</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section" id="features" style={{ background: "#fff" }}>
        <div className="lp-section-hdr">
          <span className="lp-eyebrow">How It Works</span>
          <h2 className="lp-section-h2">Set up in 10 minutes. Run for years.</h2>
          <p className="lp-section-p" style={{ margin: "0 auto" }}>No spreadsheets. No paper registers. Add your school once — everything else runs automatically.</p>
        </div>
        <div className="lp-hiw-cards">
          {FEATURES.map((f, i) => (
            <div key={f.kicker} className="lp-hiw-card">
              <div className={`lp-hiw-row${f.rev ? " rev" : ""}`}>
                <div className="lp-hiw-text">
                  <div className="lp-hiw-num">{i + 1}</div>
                  <div className="lp-hiw-kicker">{f.kicker}</div>
                  <h3 className="lp-hiw-h3">{f.title}</h3>
                  <p className="lp-hiw-p">{f.text}</p>
                </div>
                <div className="lp-hiw-phone"><Phone>{f.screen}</Phone></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="lp-section" id="trust" style={{ background: "#F5F5F4" }}>
        <div className="lp-section-hdr">
          <span className="lp-eyebrow">Built For Ghana</span>
          <h2 className="lp-section-h2">Built with input from Ghanaian educators</h2>
          <p className="lp-section-p" style={{ margin: "0 auto" }}>We spent months interviewing headmasters, bursars, and teachers across Accra, Kumasi, and Cape Coast.</p>
        </div>
        <div className="lp-trust-grid">
          {LOGOS.map((l, i) => (
            <div key={i} className="lp-trust-logo">
              <div className="lp-trust-icon" style={{ background: l.bg, color: l.color }}>{l.abbr}</div>
              <div className="lp-trust-name">{l.name}</div>
            </div>
          ))}
        </div>
        <div className="lp-trust-quote-box">
          <p className="lp-trust-quote-txt">"Finally, a school management system that understands how Ghanaian schools actually work. The WhatsApp integration alone saves me two hours every Monday."</p>
          <div className="lp-trust-quote-attr">— Adjoa Owusu, Head Teacher · Accra Academy Primary</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-footer-grid">
            <div>
              <a className="lp-footer-logo" href="/"><div className="lp-footer-mark">M</div><span className="lp-footer-brand">Managen</span></a>
              <p className="lp-footer-tag">The school management platform built for Africa. Attendance, fees, and parent communication — all in one place.</p>
            </div>
            <div>
              <div className="lp-footer-col-title">Product</div>
              <ul className="lp-footer-links">
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#">Changelog</a></li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">Resources</div>
              <ul className="lp-footer-links">
                <li><a href="#">Documentation</a></li>
                <li><a href="#">API Reference</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
            <div>
              <div className="lp-footer-col-title">Company</div>
              <ul className="lp-footer-links">
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="lp-footer-bottom">
            <span className="lp-footer-copy">© 2026 Managen. All rights reserved.</span>
            <span className="lp-footer-love">Built with ❤️ in Ghana 🇬🇭</span>
          </div>
        </div>
      </footer>
    </>
  );
}
