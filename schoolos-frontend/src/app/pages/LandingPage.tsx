import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  Menu, X, Star, Check, GraduationCap,
  Bell, Search, Moon, Users, BookOpen, Wallet,
  MessageSquare, Library, Home, Bus, UserPlus, Briefcase,
  Twitter, Linkedin, Facebook, Instagram, Settings, Upload,
  Settings2, Rocket, ArrowRight, Zap, Shield, Cloud,
} from "lucide-react";

const C = {
  navy: "#0A0B1E", dark2: "#111827", dark: "#0F1729",
  blue: "#6366F1", purple: "#8B5CF6", teal: "#14B8A6",
  green: "#10B981", amber: "#F59E0B", pink: "#EC4899",
  muted: "#6B7280", label: "#9CA3AF", divider: "#F3F4F6",
  white: "#FFFFFF",
};

const modules = [
  { icon: Users, title: "Attendance", desc: "QR-based tracking with instant reports & real-time insights", cat: "Academic", catColor: C.blue },
  { icon: Wallet, title: "Fees", desc: "Invoicing, payments, receipts & arrears tracking", cat: "Finance", catColor: C.green },
  { icon: BookOpen, title: "Examinations", desc: "Schedule, grade & publish results with auto-marking", cat: "Academic", catColor: C.purple },
  { icon: Library, title: "Library", desc: "Catalog, issue/return tracking & fine management", cat: "Operations", catColor: C.amber },
  { icon: Home, title: "Hostel", desc: "Room allocation, occupancy & resident management", cat: "Operations", catColor: C.teal },
  { icon: Bus, title: "Transport", desc: "Route management, vehicle tracking & allocation", cat: "Operations", catColor: C.blue },
  { icon: UserPlus, title: "Admissions", desc: "Online applications, shortlisting & enrollment", cat: "Operations", catColor: C.purple },
  { icon: MessageSquare, title: "Communication", desc: "Chat, announcements & automated parent alerts", cat: "Academic", catColor: C.pink },
  { icon: Briefcase, title: "Payroll", desc: "Salary processing, deductions & digital payslips", cat: "Finance", catColor: C.green },
];

const howItWorks = [
  { icon: Upload, title: "Import Your Data", desc: "Upload existing records — students, staff, classes. We support Excel, CSV, and API imports.", time: "Day 1", color: C.blue },
  { icon: Settings2, title: "Configure Modules", desc: "Enable only what your school needs. Set permissions, fee structures, timetables.", time: "Day 2–3", color: C.purple },
  { icon: Rocket, title: "Go Live", desc: "Launch with full onboarding support. Train staff and start managing digitally.", time: "Day 4–7", color: C.teal },
];

const testimonials = [
  { quote: "SchoolSync cut our fee collection time by 60%. Parents pay from their phones and we get instant confirmation — no more queues.", name: "Mrs. Adjoa Mensah", role: "Bursar, Accra Academy", initials: "AM" },
  { quote: "The QR attendance system eliminated proxy signing completely. Staff love it, and we have full verified records every day.", name: "Mr. Kwame Asante", role: "Headmaster, Presec Legon", initials: "KA" },
  { quote: "Payroll, hostel, and transport in a single dashboard has completely transformed how we run our school operations.", name: "Dr. Efua Boateng", role: "Director, Aburi Girls", initials: "EB" },
];

const pricing = [
  { name: "Starter", price: "$49", sub: "Up to 300 students", badge: null, highlighted: false, features: ["Attendance, Fees, Exams, Library", "3 admin accounts", "Email support", "Basic reports"], cta: "Get Started" },
  { name: "Growth", price: "$99", sub: "Up to 1,000 students", badge: "Most Popular", highlighted: true, features: ["Everything in Starter +", "Hostel, Transport, Payroll, Chat", "10 admin accounts", "Priority support", "Advanced analytics", "Parent portal"], cta: "Start Free Trial" },
  { name: "Enterprise", price: "Custom", sub: "Unlimited students", badge: null, highlighted: false, features: ["Everything in Growth +", "Custom modules", "Dedicated manager", "Full API access", "SLA guarantee", "On-premise option"], cta: "Contact Sales" },
];

const faqs = [
  { q: "How long does setup take?", a: "Most schools go live within 7 days. Our team handles data migration, configuration, and staff training." },
  { q: "Can parents and students access the platform?", a: "Yes. Parents get a portal for attendance, results, fees, and announcements. Students access records and timetables." },
  { q: "Is our data secure?", a: "All data encrypted at rest (AES-256) and in transit (TLS 1.3). GDPR compliant. Never shared with third parties." },
  { q: "Can we import from Excel?", a: "Absolutely. Bulk import from Excel/CSV for students, staff, classes, and fee records with field mapping." },
  { q: "Do you offer training?", a: "Every plan includes onboarding sessions, video tutorials, and documentation. Growth+ gets dedicated support managers." },
  { q: "What if we need a custom module?", a: "Enterprise clients get custom development. We also add new modules regularly based on school feedback." },
];

function useCountUp(target: number, duration = 2000, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    const frame = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

function useOnScreen(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

function Orb({ className, size = 600, from = "#6366F1", to = "#8B5CF6" }: { className?: string; size?: number; from?: string; to?: string }) {
  return <div className={className} style={{ width: size, height: size, background: `radial-gradient(ellipse at 30% 30%, ${from}, transparent 60%)`, opacity: 0.2, filter: "blur(80px)", pointerEvents: "none", borderRadius: "50%" }} />;
}

function Grain() {
  return <div className="fixed inset-0 -z-5 pointer-events-none" style={{ opacity: 0.03, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "256px 256px", mixBlendMode: "overlay" }} />;
}

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [pricingAnnual, setPricingAnnual] = useState(false);

  const progressRef = useRef<HTMLDivElement>(null);
  const [progressVisible, setProgressVisible] = useState(false);
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setProgressVisible(true); obs.disconnect(); } }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const handler = () => { setScrolled(window.scrollY > 80); window.scrollY > 50 && mobileOpen && setMobileOpen(false); };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, [mobileOpen]);

  const [statsRef, statsVisible] = useOnScreen(0.4);
  const schools = useCountUp(500, 2200, statsVisible);
  const students = useCountUp(200, 2400, statsVisible);
  const modulesCount = useCountUp(40, 1800, statsVisible);
  const uptime = useCountUp(999, 2000, statsVisible);

  const scrollTo = useCallback((id: string) => {
    setMobileOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  const navLinks = ["Home", "Features", "Pricing", "FAQ", "Contact"];

  return (
    <div style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }} className="min-h-screen overflow-x-hidden">
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%,100% { opacity: 0.15; } 50% { opacity: 0.25; } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.7s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .glass { background: rgba(255,255,255,0.75); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 8px 32px rgba(99,102,241,0.08); }
        .card { background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
        .card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(99,102,241,0.12); }
        .btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 12px; font-weight: 600; transition: all 0.25s cubic-bezier(0.16,1,0.3,1); cursor: pointer; border: none; }
        .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(99,102,241,0.25); }
        .btn-ghost { background: transparent; border: 1.5px solid rgba(255,255,255,0.3); color: white; }
        .btn-ghost:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.5); }
        .btn-primary { background: linear-gradient(135deg,#6366F1,#8B5CF6); color: white; }
        .btn-secondary { background: white; color: #111827; border: 1.5px solid #E5E7EB; }
        .btn-secondary:hover { border-color: #6366F1; color: #6366F1; }
        .badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 600; letter-spacing: 0.04em; }
        .accordion-content { overflow: hidden; max-height: 0; transition: max-height 0.35s cubic-bezier(0.16,1,0.3,1); }
        .accordion-content.open { max-height: 200px; }
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
      `}</style>

      <Grain />

      {/* Dynamic mesh background */}
      <div className="fixed inset-0 -z-10" style={{ background: "radial-gradient(ellipse at 20% 20%, #EEF2FF, transparent 50%), radial-gradient(ellipse at 80% 20%, #F5F3FF, transparent 50%), radial-gradient(ellipse at 50% 80%, #ECFDF5, transparent 50%), #F8FAFC" }}>
        <Orb className="absolute top-0 right-0" size={700} from="#6366F1" to="#8B5CF6" style={{ animation: "pulseGlow 6s ease-in-out infinite" }} />
        <Orb className="absolute bottom-0 left-0" size={600} from="#14B8A6" to="#6366F1" style={{ animation: "pulseGlow 8s ease-in-out infinite reverse" }} />
        <Orb className="absolute top-1/2 left-1/3" size={400} from="#8B5CF6" to="#EC4899" style={{ animation: "pulseGlow 10s ease-in-out infinite" }} />
      </div>

      {/* NAV */}
      <nav className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${scrolled ? "mt-3" : "mt-5"}`}>
        <div className="flex items-center gap-6" style={{
          background: scrolled ? "rgba(10,11,30,0.92)" : "rgba(10,11,30,0.85)",
          borderRadius: 999, padding: "8px 24px", backdropFilter: "blur(24px)",
          boxShadow: scrolled ? "0 8px 40px rgba(0,0,0,0.25)" : "0 4px 20px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255,255,255,0.08)",
          transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer mr-4">
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366F1,#14B8A6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={16} color="white" />
            </div>
            <span className="text-white font-bold whitespace-nowrap" style={{ fontSize: 15, letterSpacing: "-0.02em" }}>SchoolSync</span>
          </button>
          <div className="hide-mobile flex items-center gap-1">
            {navLinks.map((l) => {
              const active = l === "Home";
              return (
                <button key={l} onClick={() => l === "Home" ? scrollTo("hero") : scrollTo(l.toLowerCase())}
                  style={{
                    padding: active ? "5px 14px" : "5px 10px",
                    borderRadius: 999,
                    background: active ? "rgba(255,255,255,0.12)" : "transparent",
                    color: active ? "white" : "rgba(255,255,255,0.7)",
                    fontSize: 13, fontWeight: 500, transition: "all 0.2s",
                    border: "none", cursor: "pointer",
                  }}
                  onMouseEnter={(e) => !active && (e.currentTarget.style.color = "white")}
                  onMouseLeave={(e) => !active && (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                >{l}</button>
              );
            })}
          </div>
          <div className="hide-mobile flex items-center gap-2 ml-4">
            <button className="btn btn-ghost" style={{ padding: "6px 16px", fontSize: 13 }}>Log In</button>
            <button className="btn btn-primary" style={{ padding: "6px 18px", fontSize: 13, boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }} onClick={() => navigate("/auth?mode=signup")}>Get Started</button>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" style={{ color: "white", background: "none", border: "none", cursor: "pointer", padding: 4 }} aria-label="Menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {mobileOpen && (
          <div style={{ animation: "slideDown 0.2s ease", marginTop: 8, background: "rgba(10,11,30,0.95)", borderRadius: 20, padding: 16, backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {navLinks.map((l) => (
              <button key={l} onClick={() => scrollTo(l === "Home" ? "hero" : l.toLowerCase())} className="block w-full text-left px-3 py-2" style={{ color: "rgba(255,255,255,0.8)", fontSize: 14, background: "none", border: "none", cursor: "pointer" }}>{l}</button>
            ))}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => navigate("/auth")} className="btn btn-ghost w-full" style={{ padding: "8px 16px", fontSize: 13 }}>Log In</button>
              <button onClick={() => navigate("/auth?mode=signup")} className="btn btn-primary w-full" style={{ padding: "8px 16px", fontSize: 13 }}>Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="hero" className="relative px-6 overflow-hidden flex items-center" style={{ minHeight: "100vh", paddingTop: 100 }}>
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
          <div style={{ animation: "fadeUp 0.8s ease-out" }}>
            <div className="badge" style={{ background: "rgba(20,184,166,0.12)", color: C.teal, marginBottom: 24, width: "fit-content" }}>
              <Zap size={12} /> SCHOOL MANAGEMENT REIMAGINED
            </div>
            <h1 style={{ fontSize: "clamp(40px, 5.5vw, 60px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#0A0B1E" }}>
              Manage Your School.<br />
              <span style={{ background: "linear-gradient(135deg,#6366F1,#14B8A6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Effortlessly.</span>
            </h1>
            <p style={{ fontSize: 17, color: C.muted, maxWidth: 480, lineHeight: 1.7, marginTop: 20 }}>
              One powerful platform for attendance, exams, fees, hostel, payroll, transport, and 40+ more modules — built for modern schools.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 15 }} onClick={() => navigate("/auth?mode=signup")}>Request a Demo</button>
              <button className="btn btn-secondary" style={{ padding: "14px 28px", fontSize: 15 }} onClick={() => scrollTo("features")}>Explore Features <ArrowRight size={16} style={{ marginLeft: 6 }} /></button>
            </div>
            <div className="flex flex-wrap gap-6 mt-8" style={{ fontSize: 13, color: C.muted }}>
              {[
                { icon: Zap, text: "40+ Modules" },
                { icon: Shield, text: "Role-Based Access" },
                { icon: Cloud, text: "Cloud-Based" },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2">
                  <span style={{ width: 20, height: 20, borderRadius: 6, background: "rgba(20,184,166,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={12} color={C.teal} />
                  </span>
                  {text}
                </span>
              ))}
            </div>
          </div>
          <div className="hide-mobile" style={{ animation: "fadeUp 0.8s ease-out 0.15s both" }}>
            <div style={{ animation: "float 4s ease-in-out infinite" }}>
              <DashboardPreviewMini />
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} className="px-6 pb-24">
        <div className="glass mx-auto" style={{ maxWidth: 900, borderRadius: 20, padding: "32px 24px" }}>
          <div className="flex flex-wrap justify-center">
            {[
              { val: schools, label: "Schools Onboarded", sub: "Across 12 countries", suffix: "+" },
              { val: students, label: "Students Managed", sub: "Active profiles", suffix: "K+" },
              { val: modulesCount, label: "Modules Available", sub: "Fully integrated", suffix: "+" },
              { val: uptime, label: "Uptime Guaranteed", sub: "Cloud reliability", suffix: "%", decimal: true },
            ].map((s, i) => (
              <div key={i} className="flex-1 min-w-[140px] text-center" style={{ padding: "20px 16px", borderRight: i < 3 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
                <div style={{ fontSize: "clamp(30px, 3vw, 38px)", fontWeight: 800, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.2 }}>
                  {s.decimal ? <>{statsVisible ? (s.val / 10).toFixed(1) : "0"}<span style={{ fontSize: "0.5em" }}>%</span></>
                    : <>{s.val}{s.suffix}</>}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: C.label, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="px-6 pb-24">
        <div className="glass mx-auto" style={{ maxWidth: 1000, borderRadius: 20, overflow: "hidden" }}>
          <div className="card" style={{ borderRadius: 0, padding: "28px 32px", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
            <div style={{ flex: "0 0 35%", minWidth: 220 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A0B1E" }}>Connects with tools you already use</h3>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Sync with payment gateways, communication tools & government portals</p>
            </div>
            <div style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {["Paystack", "Flutterwave", "Google", "Zoom", "WhatsApp", "SMS"].map((name) => (
                <div key={name} style={{ padding: "6px 14px", borderRadius: 999, background: "#F3F4F6", fontSize: 12, color: "#6B7280", display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s", opacity: 0.5, cursor: "default" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "#EEF2FF"; e.currentTarget.style.color = "#6366F1"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.color = "#6B7280"; }}
                >{name}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge" style={{ background: "rgba(99,102,241,0.1)", color: C.blue, margin: "0 auto 16px", width: "fit-content" }}>
              <Zap size={12} /> WHAT WE OFFER
            </div>
            <h2 style={{ fontSize: "clamp(30px, 3vw, 38px)", fontWeight: 700, color: "#0A0B1E", letterSpacing: "-0.02em" }}>Everything your school needs</h2>
            <p style={{ fontSize: 15, color: C.muted, maxWidth: 500, margin: "8px auto 0" }}>From admissions to graduation — every workflow covered in one place</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((m, i) => (
              <div key={i} className="card p-6 reveal" style={{ animationDelay: `${i * 50}ms`, transitionDelay: `${i * 50}ms` }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${m.catColor}12`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 14,
                }}>
                  <m.icon size={22} color={m.catColor} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0A0B1E" }}>{m.title}</h3>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginTop: 4 }}>{m.desc}</p>
                <div className="badge" style={{ background: "#F3F4F6", color: "#6B7280", marginTop: 12, width: "fit-content" }}>{m.cat}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button className="btn" style={{ background: "none", color: C.blue, fontSize: 14, gap: 4 }} onClick={() => scrollTo("pricing")}>
              Explore All 40+ Modules <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge" style={{ background: "rgba(245,158,11,0.1)", color: C.amber, margin: "0 auto 16px", width: "fit-content" }}>
              <Zap size={12} /> SIMPLE PROCESS
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3vw, 36px)", fontWeight: 700, color: "#0A0B1E", letterSpacing: "-0.02em" }}>Up and running in 3 steps</h2>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>No technical expertise required — our team handles everything</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((step, i) => (
              <div key={i} className="card relative" style={{ padding: 32, borderRadius: 20, overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -10, right: -10, fontSize: 96, fontWeight: 900, color: "rgba(0,0,0,0.03)", lineHeight: 1, pointerEvents: "none" }}>0{i + 1}</div>
                <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <div style={{ width: 60, height: 60, borderRadius: 16, background: `linear-gradient(135deg, ${step.color}15, ${step.color}08)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    <step.icon size={28} color={step.color} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0A0B1E" }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginTop: 8 }}>{step.desc}</p>
                  <div style={{ marginTop: 16, padding: "4px 14px", borderRadius: 999, background: "rgba(99,102,241,0.08)", color: C.blue, fontSize: 12, fontWeight: 600 }}>{step.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="badge" style={{ background: "rgba(139,92,246,0.1)", color: C.purple, margin: "0 auto 16px", width: "fit-content" }}>
              <Zap size={12} /> LIVE PREVIEW
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3vw, 36px)", fontWeight: 700, color: "#0A0B1E", letterSpacing: "-0.02em" }}>A dashboard built for clarity</h2>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>Real-time insights across every department — always one click away</p>
          </div>
          <div className="glass" style={{ borderRadius: 24, overflow: "hidden", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 20px 60px rgba(99,102,241,0.12)" }}>
            <DashboardPreviewFull progressVisible={progressVisible} progressRef={progressRef} />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge" style={{ background: "rgba(245,158,11,0.1)", color: C.amber, margin: "0 auto 16px", width: "fit-content" }}>
              <Zap size={12} /> TRUSTED BY SCHOOLS
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3vw, 36px)", fontWeight: 700, color: "#0A0B1E", letterSpacing: "-0.02em" }}>What administrators are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card p-8">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={15} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontSize: 14, color: "#374151", fontStyle: "italic", lineHeight: 1.75 }}>"{t.quote}"</p>
                <div style={{ height: 1, background: "#F3F4F6", margin: "16px 0" }} />
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#14B8A6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 13, fontWeight: 700 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#0A0B1E" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="badge" style={{ background: "rgba(20,184,166,0.1)", color: C.teal, margin: "0 auto 16px", width: "fit-content" }}>
              <Zap size={12} /> SIMPLE PRICING
            </div>
            <h2 style={{ fontSize: "clamp(28px, 3vw, 36px)", fontWeight: 700, color: "#0A0B1E", letterSpacing: "-0.02em" }}>Choose your plan</h2>
            <div style={{ display: "inline-flex", gap: 4, padding: 4, borderRadius: 999, background: "#F3F4F6", marginTop: 20 }}>
              <button onClick={() => setPricingAnnual(false)} style={{ padding: "8px 20px", borderRadius: 999, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", background: pricingAnnual ? "transparent" : "white", color: pricingAnnual ? "#6B7280" : "#111827", boxShadow: pricingAnnual ? "none" : "0 2px 8px rgba(0,0,0,0.06)", transition: "all 0.2s" }}>Monthly</button>
              <button onClick={() => setPricingAnnual(true)} style={{ padding: "8px 20px", borderRadius: 999, fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, background: pricingAnnual ? "white" : "transparent", color: pricingAnnual ? "#111827" : "#6B7280", boxShadow: pricingAnnual ? "0 2px 8px rgba(0,0,0,0.06)" : "none", transition: "all 0.2s" }}>
                Annual <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "rgba(16,185,129,0.1)", color: C.green }}>Save 20%</span>
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {pricing.map((p, i) => (
              <div key={i} className="relative" style={{ borderRadius: 20, overflow: "hidden" }}>
                {p.highlighted && (
                  <div style={{ position: "absolute", inset: 0, padding: 2, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", borderRadius: 20, pointerEvents: "none" }} />
                )}
                <div className="card" style={{
                  padding: 32, position: "relative", height: "100%",
                  background: p.highlighted ? "white" : "white",
                  border: p.highlighted ? "none" : "1.5px solid #F3F4F6",
                  boxShadow: p.highlighted ? "0 12px 48px rgba(99,102,241,0.15)" : "0 4px 20px rgba(0,0,0,0.04)",
                  transform: p.highlighted ? "scale(1.03)" : "none",
                }}>
                  {p.badge && (
                    <div className="badge" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)", color: "white", position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}>{p.badge}</div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.05em", marginTop: p.badge ? 8 : 0 }}>{p.name}</div>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "baseline" }}>
                    <span style={{ fontSize: 44, fontWeight: 800, color: "#0A0B1E" }}>{p.price}</span>
                    {p.price !== "Custom" && <span style={{ fontSize: 16, color: "#9CA3AF", marginLeft: 4 }}>/mo</span>}
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{p.sub}</div>
                  <div style={{ height: 1, background: "#F3F4F6", margin: "20px 0" }} />
                  <div className="space-y-3" style={{ minHeight: 200 }}>
                    {p.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-2" style={{ fontSize: 14, color: "#374151" }}>
                        <Check size={16} color="#14B8A6" style={{ flexShrink: 0, marginTop: 2 }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate("/auth?mode=signup")} className={`btn ${p.highlighted ? "btn-primary" : "btn-secondary"} w-full`} style={{ padding: "12px", fontSize: 14, marginTop: 24 }}>
                    {p.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 pb-24">
        <div className="mx-auto" style={{ maxWidth: 700 }}>
          <div className="text-center mb-12">
            <h2 style={{ fontSize: "clamp(26px, 3vw, 32px)", fontWeight: 700, color: "#0A0B1E", letterSpacing: "-0.02em" }}>Frequently asked questions</h2>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>Can't find your answer? <span style={{ color: C.blue, fontWeight: 600, cursor: "pointer" }}>Contact our team</span></p>
          </div>
          <div className="glass" style={{ borderRadius: 20, padding: "0 24px" }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "18px 0", background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: 15, fontWeight: 600, color: "#0A0B1E" }}>
                  <span>{faq.q}</span>
                  <div style={{ transform: openFaq === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: "50%", background: "rgba(99,102,241,0.08)" }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="7" y1="0" x2="7" y2="14" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/><line x1="0" y1="7" x2="14" y2="7" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/></svg>
                  </div>
                </button>
                <div className={`accordion-content ${openFaq === i ? "open" : ""}`}>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, paddingBottom: 18 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl" style={{ padding: "80px 40px", textAlign: "center", background: "linear-gradient(135deg, #0A0B1E 0%, #1E1B4B 50%, #0A0B1E 100%)" }}>
          <Orb className="absolute top-0 right-0" size={500} from="#6366F1" to="#8B5CF6" style={{ opacity: 0.15 }} />
          <Orb className="absolute bottom-0 left-0" size={400} from="#14B8A6" to="#6366F1" style={{ opacity: 0.1 }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="badge" style={{ background: "rgba(20,184,166,0.15)", color: C.teal, margin: "0 auto 20px", width: "fit-content" }}>
              <Zap size={12} /> READY TO SCALE
            </div>
            <h2 style={{ fontSize: "clamp(30px, 3.5vw, 44px)", fontWeight: 800, color: "white", maxWidth: 600, margin: "0 auto", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              Ready to transform your school?
            </h2>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginTop: 12 }}>Join 500+ schools already running smarter with SchoolSync</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 15, boxShadow: "0 8px 32px rgba(99,102,241,0.3)" }} onClick={() => navigate("/auth?mode=signup")}>Request a Free Demo</button>
              <button className="btn btn-ghost" style={{ padding: "14px 28px", fontSize: 15, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "white" }} onClick={() => scrollTo("features")}>View All Modules</button>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 20 }}>No credit card required · Setup in 24 hours · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#0A0B1E", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-7xl mx-auto" style={{ padding: "64px 40px 32px" }}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#6366F1,#14B8A6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <GraduationCap size={18} color="white" />
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: "white" }}>SchoolSync</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 260 }}>The all-in-one school management platform built for modern institutions.</p>
              <div className="flex gap-3 mt-5">
                {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                  <button key={i} style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.4)", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(99,102,241,0.2)"; e.currentTarget.style.color = "#6366F1"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}>
                    <Icon size={16} />
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: "PRODUCT", links: ["Features", "Modules", "Pricing", "Changelog", "Roadmap"] },
              { title: "COMPANY", links: ["About Us", "Blog", "Careers", "Press", "Contact"] },
              { title: "SUPPORT", links: ["Documentation", "Help Center", "API Reference", "Status", "Privacy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 20 }}>{col.title}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.links.map((l) => (
                    <li key={l} style={{ marginBottom: 10 }}>
                      <button style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", cursor: "pointer", background: "none", border: "none", padding: 0, transition: "color 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#6366F1"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.55)"}>{l}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2025 SchoolSync. All rights reserved.</span>
            <div style={{ display: "flex", gap: 12, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
              <button style={{ color: "inherit", cursor: "pointer", background: "none", border: "none", padding: 0, transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#6366F1"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>Terms</button>
              <span>·</span>
              <button style={{ color: "inherit", cursor: "pointer", background: "none", border: "none", padding: 0, transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#6366F1"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>Privacy</button>
              <span>·</span>
              <button style={{ color: "inherit", cursor: "pointer", background: "none", border: "none", padding: 0, transition: "color 0.2s" }}
                onMouseEnter={(e) => e.currentTarget.style.color = "#6366F1"}
                onMouseLeave={(e) => e.currentTarget.style.color = "rgba(255,255,255,0.3)"}>Cookies</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3" style={{ background: "rgba(10,11,30,0.95)", backdropFilter: "blur(16px)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => navigate("/auth?mode=signup")} className="btn btn-primary w-full" style={{ padding: "12px", fontSize: 14 }}>Get Started Free</button>
      </div>
      <div className="md:hidden h-16" />
    </div>
  );
}

function DashboardPreviewMini() {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: "white", fontSize: 10 }}>
      <div style={{ background: "linear-gradient(135deg,#0A0B1E,#1E1B4B)", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div className="flex items-center gap-2">
          <div style={{ width: 18, height: 18, borderRadius: 5, background: "linear-gradient(135deg,#6366F1,#14B8A6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <GraduationCap size={10} color="white" />
          </div>
          <span style={{ color: "white", fontWeight: 700, fontSize: 11 }}>SchoolSync</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#14B8A6" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
        </div>
      </div>
      <div style={{ padding: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0A0B1E", marginBottom: 10 }}>Good morning, Admin 👋</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Students", value: "1,240", bg: "linear-gradient(135deg,#6366F1,#818CF8)" },
            { label: "Present", value: "1,089", bg: "linear-gradient(135deg,#8B5CF6,#A78BFA)" },
            { label: "Fees", value: "₵84.2K", bg: "linear-gradient(135deg,#14B8A6,#2DD4BF)" },
            { label: "Pending", value: "₵12.4K", bg: "linear-gradient(135deg,#F59E0B,#FBBF24)" },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 8, padding: "8px 10px", color: "white" }}>
              <div style={{ fontSize: 8, opacity: 0.8 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardPreviewFull({ progressVisible, progressRef }: { progressVisible: boolean; progressRef: React.RefObject<HTMLDivElement | null> }) {
  const rows = [["Class 7A","38","2","95%"],["Class 8B","35","5","87%"],["Class 9C","30","10","75%"],["Class 10A","40","1","97%"],["Class 11B","33","7","82%"]];

  return (
    <div style={{ borderRadius: 22, overflow: "hidden", background: "white", fontSize: 11 }}>
      <div style={{ display: "flex", minHeight: 420 }}>
        <div style={{ width: 180, background: "white", borderRight: "1px solid #F3F4F6", padding: "20px 16px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div className="flex items-center gap-2 mb-6">
            <div style={{ width: 20, height: 20, borderRadius: 6, background: "linear-gradient(135deg,#6366F1,#14B8A6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <GraduationCap size={11} color="white" />
            </div>
            <span style={{ fontWeight: 700, color: "#0A0B1E", fontSize: 13 }}>SchoolSync</span>
          </div>
          {[["MENU",["Dashboard","Students","Teachers","Classes","Timetable"]],["ACADEMICS",["Exams","Attendance","Library"]],["FINANCE",["Fees","Payroll"]],["OPERATIONS",["Hostel","Transport","Admissions"]]].map(([g, items]: any) => (
            <div key={g} style={{ marginTop: g === "MENU" ? 0 : 20 }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: "#9CA3AF", letterSpacing: "0.1em", marginBottom: 4, paddingLeft: 10 }}>{g}</div>
              {(items as string[]).map((item: string) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", fontSize: 12, color: item === "Dashboard" ? "#6366F1" : "#6B7280", borderRadius: 8, fontWeight: item === "Dashboard" ? 600 : 400, background: item === "Dashboard" ? "rgba(99,102,241,0.06)" : "transparent", cursor: "default" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: item === "Dashboard" ? "#6366F1" : "#D1D5DB" }} />
                  {item}
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 8 }}>
            <Moon size={14} color="#6B7280" />
            <div style={{ width: 30, height: 16, borderRadius: 999, background: "#0A0B1E", position: "relative", cursor: "default" }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: "white", position: "absolute", top: 2, right: 2 }} />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, padding: "20px 24px", background: "#F8FAFC" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="badge" style={{ background: "rgba(99,102,241,0.08)", color: "#6366F1" }}>Notifications 3</div>
              <span style={{ fontSize: 11, color: "#14B8A6", fontWeight: 600, cursor: "default" }}>View All</span>
            </div>
            <div className="flex items-center gap-3">
              <div style={{ background: "#F3F4F6", borderRadius: 999, padding: "6px 14px", display: "flex", alignItems: "center", gap: 4 }}>
                <Search size={12} color="#9CA3AF" />
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>Search</span>
              </div>
              <Bell size={18} color="#9CA3AF" />
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700 }}>SA</div>
            </div>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0A0B1E", marginBottom: 16 }}>Good morning, Admin 👋</div>
          <div className="flex gap-3 mb-4">
            {[{label:"Total Students",v:"1,240",bg:"linear-gradient(135deg,#6366F1,#818CF8)"},{label:"Present Today",v:"1,089",bg:"linear-gradient(135deg,#8B5CF6,#A78BFA)"},{label:"Fee Collected",v:"₵84,200",bg:"linear-gradient(135deg,#14B8A6,#2DD4BF)"},{label:"Pending Fees",v:"₵12,400",bg:"linear-gradient(135deg,#F59E0B,#FBBF24)"}].map((s,i) => (
              <div key={i} style={{ flex: "0 0 23%", borderRadius: 12, padding: "12px 14px", background: s.bg, color: "white" }}>
                <div style={{ fontSize: 10, opacity: 0.85 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 2 }}>{s.v}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mb-4">
            <div className="card" style={{ flex: "0 0 45%", padding: 16, borderRadius: 12 }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0B1E" }}>Today's Attendance</span>
                <span style={{ fontSize: 11, color: "#14B8A6", fontWeight: 600, cursor: "default" }}>View All →</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ color: "#9CA3AF", borderBottom: "1px solid #F3F4F6" }}>
                  {["Class","Present","Absent","Rate"].map(h => <th key={h} style={{ textAlign: h === "Class" ? "left" : "right", padding: "4px 8px", fontWeight: 500, fontSize: 11 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {rows.map((row, i) => {
                    const r = parseInt(row[3]);
                    const c = r >= 90 ? "#10B981" : r >= 75 ? "#F59E0B" : "#EF4444";
                    const b = r >= 90 ? "#ECFDF5" : r >= 75 ? "#FFFBEB" : "#FFF1F2";
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "6px 8px", color: "#374151", fontSize: 12 }}>{row[0]}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", color: "#374151", fontSize: 12 }}>{row[1]}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", color: "#374151", fontSize: 12 }}>{row[2]}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}>
                          <span style={{ background: b, color: c, borderRadius: 999, padding: "1px 8px", fontSize: 10, fontWeight: 600 }}>{row[3]}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="card" style={{ flex: "0 0 55%", padding: 16, borderRadius: 12 }}>
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0B1E" }}>Fee Collection Trend</span>
                <div className="flex items-center gap-2">
                  <span style={{ background: "#F3F4F6", color: "#6B7280", borderRadius: 999, padding: "2px 10px", fontSize: 11, cursor: "default" }}>Monthly ▾</span>
                  <Settings size={14} color="#9CA3AF" />
                </div>
              </div>
              <svg viewBox="0 0 280 100" style={{ width: "100%", height: 100 }}>
                <defs>
                  <linearGradient id="c" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#818CF8" stopOpacity="0.35"/><stop offset="100%" stopColor="#818CF8" stopOpacity="0"/></linearGradient>
                  <linearGradient id="p" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.2"/><stop offset="100%" stopColor="#C4B5FD" stopOpacity="0"/></linearGradient>
                </defs>
                <path d="M10,85 Q40,75 60,55 T100,35 T130,30 T160,25 T190,20 T220,22 T250,18 T270,20" fill="none" stroke="#818CF8" strokeWidth="2.5"/>
                <path d="M10,85 Q40,75 60,55 T100,35 T130,30 T160,25 T190,20 T220,22 T250,18 T270,20 L270,85 Z" fill="url(#c)"/>
                <path d="M10,90 Q40,83 60,70 T100,58 T130,48 T160,42 T190,38 T220,40 T250,35 T270,37" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeDasharray="3 3"/>
                <path d="M10,90 Q40,83 60,70 T100,58 T130,48 T160,42 T190,38 T220,40 T250,35 T270,37 L270,90 Z" fill="url(#p)"/>
              </svg>
              <div className="flex items-center gap-4" style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 2, background: "#818CF8" }} /> Collected</span>
                <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 2, background: "#C4B5FD" }} /> Pending</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="card" style={{ flex: "0 0 50%", padding: 16, borderRadius: 12 }} ref={progressRef}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0B1E" }}>Term Progress</span>
                <span className="badge" style={{ background: "#0A0B1E", color: "white" }}>Check Schedule</span>
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 8 }}>Week 8 of 14 — 57% complete</div>
              <div style={{ height: 8, borderRadius: 999, background: "#F3F4F6", overflow: "hidden" }}>
                <div style={{ width: progressVisible ? "57%" : "0%", height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#6366F1,#8B5CF6)", transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)" }} />
              </div>
              <div className="flex justify-between" style={{ fontSize: 10, color: "#9CA3AF", marginTop: 6 }}>
                <span>Week 1</span><span>Week 4</span><span>Week 8</span><span>Week 12</span><span>End</span>
              </div>
            </div>
            <div className="card" style={{ flex: "0 0 50%", padding: 16, borderRadius: 12, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08), transparent)", pointerEvents: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0A0B1E" }}>Ready to go paperless?</div>
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>Switch to digital records & save 10+ hours weekly</div>
                <div className="badge" style={{ background: "#0A0B1E", color: "white", marginTop: 10, cursor: "default" }}>Book a Demo →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
