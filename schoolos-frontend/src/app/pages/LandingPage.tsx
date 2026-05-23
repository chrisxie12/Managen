import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight, Menu, X, Star, ChevronDown, Check, GraduationCap,
  Bell, Search, Moon, Users, BookOpen, Wallet, BarChart3,
  MessageSquare, Library, Home, Bus, UserPlus, Briefcase,
  Twitter, Linkedin, Facebook, Instagram, Settings, Upload,
  Settings2, Rocket, Cloud, HelpCircle,
} from "lucide-react";

const C = {
  bg1: "#DFE3F5", bg2: "#F4F5FC",
  glass: "rgba(255,255,255,0.82)",
  glassBorder: "rgba(255,255,255,0.65)",
  white: "#FFFFFF",
  blue: "#6B9FFF", purple: "#A78BFA", teal: "#4DD9C0", navy: "#1A1A2E",
  green: "#34D399", amber: "#FBBF24", pink: "#F472B6",
  muted: "#6B7280", dark: "#0F1729", dark2: "#111827",
  divider: "#F3F4F6", label: "#9CA3AF",
  progressFrom: "#60A5FA", progressTo: "#A78BFA",
};

const modules = [
  { icon: Users, title: "Attendance Management", desc: "QR-based daily tracking for students and staff with instant reports", cat: "Academic", catColor: C.blue },
  { icon: Wallet, title: "Fees Management", desc: "Invoicing, payments, receipts, and arrears tracking in one place", cat: "Finance", catColor: C.green },
  { icon: BookOpen, title: "Examinations", desc: "Schedule, grade, and publish results online with automated marksheets", cat: "Academic", catColor: C.purple },
  { icon: Library, title: "Library", desc: "Book catalog, issue and return tracking, and fine management", cat: "Academic", catColor: C.amber },
  { icon: Home, title: "Hostel Management", desc: "Room allocation, occupancy tracking, and resident management", cat: "Operations", catColor: C.teal },
  { icon: Bus, title: "Transport", desc: "Route management, vehicle tracking, and student bus allocation", cat: "Operations", catColor: C.blue },
  { icon: UserPlus, title: "Admissions", desc: "Online applications, shortlisting, and enrollment workflows", cat: "Operations", catColor: C.purple },
  { icon: MessageSquare, title: "Communication", desc: "In-app chat, announcements, and automated parent alerts", cat: "Academic", catColor: C.pink },
  { icon: Briefcase, title: "Payroll", desc: "Staff salary processing, deductions, and digital payslip generation", cat: "Finance", catColor: C.green },
];

const howItWorks = [
  { icon: Upload, title: "Import Your Data", desc: "Upload your existing student records, staff profiles, and class structures. We support Excel, CSV, and direct API imports.", time: "Day 1", color: C.blue },
  { icon: Settings2, title: "Configure Your Modules", desc: "Enable only the modules your school needs. Set permissions, fee structures, timetables, and grading scales.", time: "Day 2\u20133", color: C.purple },
  { icon: Rocket, title: "Go Live", desc: "Launch with full support from our onboarding team. Train your staff and start managing your school digitally.", time: "Day 4\u20137", color: C.teal },
];

const testimonials = [
  { quote: "SchoolSync cut our fee collection time by 60%. Parents pay directly from their phones and we get instant confirmation \u2014 no more long queues on payment day.", name: "Mrs. Adjoa Mensah", role: "Bursar, Accra Academy", initials: "AM" },
  { quote: "The QR attendance system completely eliminated proxy signing. Staff love how fast it is, and we have full verified records at the close of every school day.", name: "Mr. Kwame Asante", role: "Headmaster, Presec Legon", initials: "KA" },
  { quote: "Having payroll, hostel, and transport all in a single dashboard has completely transformed how we manage our school\u2019s daily operations.", name: "Dr. Efua Boateng", role: "Director, Aburi Girls", initials: "EB" },
];

const pricing = [
  { name: "Starter", price: "$49", sub: "Up to 300 students", badge: null, highlighted: false, features: ["Attendance, Fees, Exams, and Library modules", "3 admin accounts", "Email support", "Basic reports"], cta: "Get Started" },
  { name: "Growth", price: "$99", sub: "Up to 1,000 students", badge: "Most Popular", highlighted: true, features: ["Everything in Starter plus", "Hostel, Transport, Payroll, and Communication", "10 admin accounts", "Priority support", "Advanced analytics", "Parent portal access"], cta: "Start Free Trial" },
  { name: "Enterprise", price: "Custom", sub: "Unlimited students", badge: null, highlighted: false, features: ["Everything in Growth plus", "Custom module development", "Dedicated account manager", "Full API access", "SLA guarantee", "On-premise deployment option"], cta: "Contact Sales" },
];

const faqs = [
  { q: "How long does it take to set up SchoolSync?", a: "Most schools are fully set up within 7 days. Our onboarding team handles the technical setup, data migration, and staff training so you can go live quickly." },
  { q: "Can parents and students access the platform?", a: "Yes. Parents get a dedicated portal to view attendance, results, fee statements, and announcements. Students can access their academic records and timetables." },
  { q: "Is our student data secure and private?", a: "All data is encrypted at rest and in transit using AES-256 and TLS 1.3. We are GDPR compliant and your data is never shared with third parties." },
  { q: "Can we import our existing records from Excel?", a: "Absolutely. SchoolSync supports bulk import from Excel and CSV for students, staff, classes, and historical fee records with field mapping and validation." },
  { q: "Do you offer training and onboarding support?", a: "Yes. Every plan includes onboarding sessions, video tutorials, and a full documentation library. Growth and Enterprise plans include dedicated support managers." },
  { q: "What if we need a module that is not listed?", a: "Contact our team. We offer custom module development for Enterprise clients and regularly add new modules based on school feedback." },
];

function Crosshair({ className }: { className?: string }) {
  return <svg className={className} width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="#9CA3AF" strokeWidth="1"/><line x1="7" y1="0" x2="7" y2="3" stroke="#9CA3AF" strokeWidth="1"/><line x1="7" y1="11" x2="7" y2="14" stroke="#9CA3AF" strokeWidth="1"/><line x1="0" y1="7" x2="3" y2="7" stroke="#9CA3AF" strokeWidth="1"/><line x1="11" y1="7" x2="14" y2="7" stroke="#9CA3AF" strokeWidth="1"/></svg>;
}

function Blob({ className, size = 400, color = "#C7CDEF", opacity = 0.06 }: { className?: string; size?: number; color?: string; opacity?: number }) {
  return <div className={className} style={{ width: size, height: size, background: `radial-gradient(ellipse at 30% 40%, ${color}, transparent 70%)`, opacity, filter: "blur(60px)", pointerEvents: "none", borderRadius: "50%" }} />;
}

function FaintRing({ className, size = 300 }: { className?: string; size?: number }) {
  return <svg className={className} width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ opacity: 0.07, pointerEvents: "none" }}><circle cx={size / 2} cy={size / 2} r={size * 0.4} stroke="#C7CDEF" strokeWidth="1.5"/><circle cx={size / 2} cy={size / 2} r={size * 0.28} stroke="#C7CDEF" strokeWidth="1"/></svg>;
}

function useCountUp(target: number, duration = 2000, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf: number;
    const t0 = performance.now();
    function frame(now: number) {
      const p = Math.min((now - t0) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(frame);
    }
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
    const onScroll = () => { setScrolled(window.scrollY > 80); if (window.scrollY > 50 && mobileOpen) setMobileOpen(false); };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  const [statsRef, statsVisible] = useOnScreen(0.4);
  const schools = useCountUp(500, 2200, statsVisible);
  const students = useCountUp(200, 2400, statsVisible);
  const modulesCount = useCountUp(40, 1800, statsVisible);
  const uptime = useCountUp(999, 2000, statsVisible);

  const scrollTo = useCallback((id: string) => {
    setMobileOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const navLinks = ["Home", "Features", "Modules", "Pricing", "Contact"];

  return (
    <div style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }} className="min-h-screen overflow-x-hidden">
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(-2deg); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes blobFloat { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(20px,-30px) scale(1.05); } 66% { transform: translate(-10px,20px) scale(0.95); } }
        .anim-fade { opacity: 0; }
        .anim-fade.show { animation: fadeUp 0.6s ease-out both; }
        .hover-lift { transition: all 0.2s ease; }
        .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(100,110,180,0.15); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(100,110,180,0.12); }
        .accordion-content { overflow: hidden; max-height: 0; transition: max-height 0.3s ease; }
        .accordion-content.open { max-height: 200px; }
        .glass { background: rgba(255,255,255,0.82); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,0.65); border-radius: 24px; box-shadow: 0 8px 32px rgba(100,110,180,0.10); }
        .glass-nav { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
        .glass-nav.scrolled { backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
        .mockup-sidebar-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 13px; color: #6B7280; border-radius: 8px; cursor: default; transition: all 0.15s; }
        .mockup-sidebar-item:hover { background: #F9FAFB; }
        .mockup-sidebar-item.active { color: #111827; font-weight: 600; background: #F8FAFF; border-left: 3px solid #4DD9C0; border-radius: 8px; }
        .stat-card { border-radius: 14px; padding: 14px 16px; color: white; display: flex; flex-direction: column; }
        .stat-card .label { font-size: 11px; opacity: 0.85; }
        .stat-card .value { font-size: 28px; font-weight: 800; margin-top: 4px; }
        .inner-card { background: white; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.055); }
        .faq-plus { transition: transform 0.3s ease; }
        .faq-plus.open { transform: rotate(45deg); }
        .integration-pill { background: #F3F4F6; border-radius: 999px; padding: 6px 14px; font-size: 12px; color: #6B7280; cursor: default; filter: grayscale(1) opacity(0.6); transition: all 0.3s ease; display: inline-flex; align-items: center; gap: 6px; }
        .integration-pill:hover { filter: none; opacity: 1; }
        .stat-divider { width: 1px; height: 60%; background: #F3F4F6; align-self: center; }
        @media (max-width: 640px) { .stat-card .value { font-size: 22px; } }
        @media (max-width: 768px) { .stat-divider { display: none; } }
      `}</style>

      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10" style={{ background: "radial-gradient(ellipse at 70% 30%, #DFE3F5, #F4F5FC 80%)" }}>
        <FaintRing className="absolute -top-20 -right-20" size={480} />
        <FaintRing className="absolute top-1/3 -left-36" size={640} />
        <FaintRing className="absolute bottom-1/4 right-1/4" size={300} />
        <Blob className="absolute top-1/4 left-1/6" size={500} color="#E8E6F8" opacity={0.15} style={{ animation: "blobFloat 20s ease-in-out infinite" }} />
        <Blob className="absolute bottom-1/3 right-1/5" size={400} color="#E8E6F8" opacity={0.15} style={{ animation: "blobFloat 25s ease-in-out infinite reverse" }} />
        <Crosshair className="absolute top-24 left-8" />
        <Crosshair className="absolute top-24 right-8" />
        <Crosshair className="absolute bottom-24 left-8" />
        <Crosshair className="absolute bottom-24 right-8" />
      </div>

      {/* SECTION 1 — NAV */}
      <nav className={`fixed top-0 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 glass-nav ${scrolled ? "scrolled" : ""}`} style={{ marginTop: 16 }}>
        <div className="flex items-center" style={{ background: C.navy, borderRadius: 999, padding: "10px 28px", boxShadow: "0 8px 32px rgba(26,26,46,0.18)", maxWidth: "90vw" }}>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer mr-8">
            <GraduationCap size={20} color={C.teal} />
            <span className="text-white font-bold whitespace-nowrap" style={{ fontSize: 15 }}>SchoolSync</span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const active = l === "Home";
              return (
                <button key={l} onClick={() => l === "Home" ? scrollTo("hero") : scrollTo(l.toLowerCase())}
                  className="px-3 py-1.5 transition-all whitespace-nowrap"
                  style={{
                    background: active ? C.white : "transparent",
                    color: active ? C.navy : "rgba(255,255,255,0.85)",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 500,
                    padding: active ? "6px 16px" : "6px 12px",
                    transition: "all 0.2s",
                  }}
                >{l}</button>
              );
            })}
          </div>
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <button onClick={() => navigate("/auth")} style={{ border: "1px solid rgba(255,255,255,0.6)", color: "white", borderRadius: 999, padding: "7px 18px", fontSize: 13, fontWeight: 500, background: "transparent", transition: "all 0.2s" }}
              className="hover-lift">Log In</button>
            <button onClick={() => navigate("/auth?mode=signup")} style={{ background: C.teal, color: C.navy, borderRadius: 999, padding: "7px 20px", fontSize: 13, fontWeight: 600, border: "none" }}
              className="hover-lift">Get Started Free</button>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden ml-auto" style={{ color: "white" }} aria-label="Menu">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {mobileOpen && (
          <div className="md:hidden mt-2" style={{ background: C.navy, borderRadius: 24, padding: 16, boxShadow: "0 8px 32px rgba(26,26,46,0.25)" }}>
            {navLinks.map((l) => (
              <button key={l} onClick={() => scrollTo(l === "Home" ? "hero" : l.toLowerCase())} className="block w-full text-left px-3 py-2 text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{l}</button>
            ))}
            <div className="mt-3 pt-3 flex flex-col gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <button onClick={() => navigate("/auth")} className="w-full py-2 rounded-full text-sm font-medium" style={{ border: "1px solid rgba(255,255,255,0.4)", color: "white" }}>Log In</button>
              <button onClick={() => navigate("/auth?mode=signup")} className="w-full py-2 rounded-full text-sm font-bold" style={{ background: C.teal, color: C.dark }}>Get Started Free</button>
            </div>
          </div>
        )}
      </nav>

      {/* SECTION 2 — HERO */}
      <section id="hero" className="relative pt-40 pb-20 px-6 overflow-hidden" style={{ minHeight: "90vh" }}>
        <FaintRing className="absolute top-1/4 right-0" size={520} />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[55fr_45fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider" style={{ background: C.teal, color: "white", marginBottom: 20, letterSpacing: "0.08em" }}>
              SCHOOL MANAGEMENT REIMAGINED
            </div>
            <h1 className="font-extrabold leading-tight" style={{ color: C.dark, fontSize: "clamp(42px, 5vw, 54px)", lineHeight: 1.15 }}>
              Manage Your School.<br />Effortlessly.
            </h1>
            <p className="mt-5" style={{ fontSize: 16, color: C.muted, maxWidth: 480, lineHeight: 1.75 }}>
              One powerful platform for attendance, exams, fees, hostel, payroll, transport, and 40+ more modules — built for modern schools and institutions.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button onClick={() => navigate("/auth?mode=signup")} style={{ background: C.navy, color: "white", borderRadius: 12, padding: "13px 28px", fontSize: 14, fontWeight: 600, border: "none" }} className="hover-lift">Request a Demo</button>
              <button onClick={() => scrollTo("features")} style={{ background: "white", color: "#374151", borderRadius: 12, padding: "13px 28px", fontSize: 14, fontWeight: 600, border: "1px solid #E5E7EB" }} className="hover-lift">Explore Features →</button>
            </div>
            <div className="flex flex-wrap gap-6 mt-7" style={{ fontSize: 12, color: C.muted }}>
              <span className="flex items-center gap-1.5"><Check size={14} color={C.teal} /> 40+ Modules</span>
              <span className="flex items-center gap-1.5"><Check size={14} color={C.teal} /> Role-Based Access</span>
              <span className="flex items-center gap-1.5"><Check size={14} color={C.teal} /> Cloud-Based</span>
            </div>
          </div>
          <div className="relative" style={{ animation: "float 3.5s ease-in-out infinite", transform: "rotate(-2deg) translateY(-12px)" }}>
            <div className="glass p-4" style={{ boxShadow: "0 24px 64px rgba(100,110,200,0.18)", borderRadius: 20 }}>
              <DashboardPreviewMini />
            </div>
            <svg className="absolute -bottom-8 -left-8" width="120" height="60" viewBox="0 0 120 60" fill="none" style={{ opacity: 0.3, pointerEvents: "none" }}>
              <path d="M10 50 Q 40 10, 70 40 T 110 10" stroke="#0F1729" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* SECTION 3 — STATS */}
      <section className="px-6 pb-20" ref={statsRef}>
        <div className="glass mx-auto flex items-stretch" style={{ maxWidth: 900, borderRadius: 20, padding: "0 40px" }}>
          {[
            { val: schools, label: "Schools Onboarded", sub: "Across 12 countries", suffix: "+" },
            { val: students, label: "Students Managed", sub: "Active profiles", suffix: "K+" },
            { val: modulesCount, label: "Modules Available", sub: "Fully integrated", suffix: "+" },
            { val: uptime, label: "Uptime Guaranteed", sub: "Cloud reliability", suffix: "%", decimal: true },
          ].map((s, i) => (
            <div key={i} className="flex-1 min-w-[140px] flex flex-col items-center" style={{ padding: "36px 16px" }}>
              <div className="font-extrabold text-center" style={{ color: C.dark2, fontSize: "clamp(28px, 3vw, 36px)" }}>
                {s.decimal ? <>{statsVisible ? (s.val / 10).toFixed(1) : "0"}<span style={{ fontSize: "0.6em", verticalAlign: "super" }}>%</span></>
                  : <>{s.val}{s.suffix}</>}
              </div>
              <div className="text-center" style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginTop: 4 }}>{s.label}</div>
              <div className="text-center" style={{ fontSize: 11, color: C.label, marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 — INTEGRATIONS */}
      <section className="px-6 pb-20">
        <div className="glass mx-auto p-8 relative" style={{ maxWidth: 1000 }}>
          <Crosshair className="absolute top-4 left-4" />
          <Crosshair className="absolute top-4 right-4" />
          <Crosshair className="absolute bottom-4 left-4" />
          <Crosshair className="absolute bottom-4 right-4" />
          <div className="inner-card p-8" style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
            <div style={{ flex: "0 0 40%", minWidth: 240 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.dark2 }}>Connects with tools your school already uses</h3>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 8 }}>Seamlessly sync with payment gateways, communication tools, and government portals</p>
            </div>
            <div style={{ flex: "1 1 55%", display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", alignItems: "center" }}>
              {["Paystack", "Flutterwave", "Google Workspace", "Zoom", "WhatsApp Business", "SMS Gateway"].map((name) => (
                <div key={name} className="integration-pill">
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.divider }} />
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — FEATURES */}
      <section id="features" className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.teal, color: "white", marginBottom: 16 }}>
              WHAT WE OFFER
            </div>
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 36px)" }}>Everything your school needs, in one place</h2>
            <p className="mt-4 mx-auto" style={{ fontSize: 15, color: C.muted, maxWidth: 540 }}>From admissions to graduation — every workflow is covered</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, i) => (
              <div key={i} className="inner-card p-6 card-hover anim-fade show" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${m.catColor}18`, color: m.catColor }}>
                  <m.icon size={22} />
                </div>
                <h3 className="font-semibold" style={{ fontSize: 15, color: C.dark2 }}>{m.title}</h3>
                <p className="mt-1.5" style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{m.desc}</p>
                <div className="mt-3 inline-flex px-2.5 py-0.5 rounded-full" style={{ fontSize: 11, fontWeight: 600, background: C.divider, color: C.muted }}>{m.cat}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => scrollTo("pricing")} style={{ fontSize: 14, color: C.teal, fontWeight: 600, cursor: "pointer", background: "none", border: "none", textDecoration: "underline", textUnderlineOffset: 3 }}>Explore All 40+ Modules →</button>
          </div>
        </div>
      </section>

      {/* SECTION 6 — HOW IT WORKS */}
      <section id="modules" className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.amber, color: C.dark, marginBottom: 16 }}>
              SIMPLE PROCESS
            </div>
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 36px)" }}>Up and running in 3 steps</h2>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>No technical expertise required — our team handles everything</p>
          </div>
          <div className="relative grid md:grid-cols-3 gap-6">
            <svg className="absolute top-16 left-[16%] right-[16%] hidden md:block" height="2" style={{ pointerEvents: "none" }}>
              <line x1="0" y1="1" x2="100%" y2="1" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="6 4" />
            </svg>
            {howItWorks.map((step, i) => (
              <div key={i} className="inner-card card-hover relative" style={{ padding: 32, borderRadius: 20 }}>
                <div style={{ position: "absolute", top: 12, left: 20, fontSize: 72, fontWeight: 900, color: "#F3F4F6", lineHeight: 1, pointerEvents: "none", zIndex: 0 }}>0{i + 1}</div>
                <div className="flex flex-col items-center text-center" style={{ position: "relative", zIndex: 1 }}>
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ background: `${step.color}15`, color: step.color }}>
                    <step.icon size={26} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: C.dark2 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.65, marginTop: 8 }}>{step.desc}</p>
                  <div className="mt-4 inline-flex px-3 py-1 rounded-full" style={{ fontSize: 11, fontWeight: 600, background: C.divider, color: C.muted }}>{step.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7 — DASHBOARD PREVIEW */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.purple, color: "white", marginBottom: 16 }}>
              LIVE PREVIEW
            </div>
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 36px)" }}>A dashboard built for clarity</h2>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>Real-time insights across every department — always one click away</p>
          </div>
          <div className="glass relative" style={{ borderRadius: 24, padding: 0, overflow: "hidden", maxWidth: 1000, margin: "0 auto" }}>
            <Crosshair className="absolute top-4 left-4 z-10" />
            <Crosshair className="absolute top-4 right-4 z-10" />
            <Crosshair className="absolute bottom-4 left-4 z-10" />
            <Crosshair className="absolute bottom-4 right-4 z-10" />
            <DashboardPreviewFull progressVisible={progressVisible} progressRef={progressRef} />
          </div>
        </div>
      </section>

      {/* SECTION 8 — TESTIMONIALS */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.amber, color: C.dark, marginBottom: 16 }}>
              TRUSTED BY SCHOOLS
            </div>
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 36px)" }}>What school administrators are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="inner-card p-7 card-hover">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill={C.amber} style={{ color: C.amber }} />)}
                </div>
                <div style={{ fontSize: 48, color: C.teal, fontWeight: 700, lineHeight: 1, opacity: 0.6 }}>"</div>
                <p style={{ fontSize: 14, color: "#374151", fontStyle: "italic", lineHeight: 1.75, marginTop: 4 }}>{t.quote}</p>
                <div style={{ height: 1, background: C.divider, margin: "16px 0" }} />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.purple})` }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.dark2 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: C.muted }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9 — PRICING */}
      <section id="pricing" className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.teal, color: "white", marginBottom: 16 }}>
              SIMPLE PRICING
            </div>
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 36px)" }}>Choose the plan that fits your school</h2>
            <div className="inline-flex items-center gap-3 mt-6 p-1 rounded-full" style={{ background: C.divider }}>
              <button onClick={() => setPricingAnnual(false)} className="px-5 py-1.5 rounded-full text-sm font-medium transition-all" style={{ background: pricingAnnual ? "transparent" : "white", color: pricingAnnual ? C.muted : C.dark2, boxShadow: pricingAnnual ? "none" : "0 2px 8px rgba(0,0,0,0.08)" }}>Monthly</button>
              <button onClick={() => setPricingAnnual(true)} className="px-5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2" style={{ background: pricingAnnual ? "white" : "transparent", color: pricingAnnual ? C.dark2 : C.muted, boxShadow: pricingAnnual ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}>
                Annual <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#ECFDF5", color: "#34D399" }}>Save 20%</span>
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {pricing.map((p, i) => (
              <div key={i} className="relative rounded-2xl p-8 card-hover" style={{
                background: p.highlighted ? "rgba(255,255,255,0.92)" : "white",
                border: p.highlighted ? "2px solid transparent" : "1px solid #F3F4F6",
                boxShadow: p.highlighted ? "0 8px 32px rgba(107,159,255,0.15)" : "0 4px 20px rgba(0,0,0,0.055)",
                backgroundClip: p.highlighted ? "padding-box" : "unset",
                marginTop: p.highlighted ? -12 : 0,
                marginBottom: p.highlighted ? -12 : 0,
                backdropFilter: p.highlighted ? "blur(12px)" : "none",
              }}>
                {p.highlighted && (
                  <div style={{ position: "absolute", inset: -2, borderRadius: "inherit", padding: 2, background: "linear-gradient(135deg, #6B9FFF, #A78BFA)", mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude", pointerEvents: "none" }} />
                )}
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: "linear-gradient(135deg, #6B9FFF, #A78BFA)", color: "white", whiteSpace: "nowrap" }}>{p.badge}</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 600, color: C.label, letterSpacing: "0.05em" }}>{p.name}</div>
                <div className="mt-4 flex items-baseline">
                  <span style={{ fontSize: 48, fontWeight: 800, color: C.dark2 }}>{p.price}</span>
                  {p.price !== "Custom" && <span style={{ fontSize: 16, color: "#9CA3AF", marginLeft: 4 }}>/mo</span>}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 24 }}>{p.sub}</div>
                <div style={{ height: 1, background: C.divider }} />
                <div className="mt-6 space-y-3">
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2" style={{ fontSize: 14, color: "#374151" }}>
                      <Check size={16} color={C.teal} className="flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/auth?mode=signup")} className="w-full mt-6 py-3 rounded-xl text-sm font-bold transition-all hover-lift" style={{
                  background: p.highlighted ? C.navy : "white",
                  color: p.highlighted ? "white" : "#374151",
                  border: p.highlighted ? "none" : "1.5px solid #E5E7EB",
                }}>{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10 — FAQ */}
      <section id="faq" className="px-6 pb-24">
        <div className="mx-auto" style={{ maxWidth: 700 }}>
          <div className="text-center mb-12">
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(28px, 3vw, 32px)" }}>Frequently asked questions</h2>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 8 }}>
              Can't find your answer?{" "}
              <span style={{ color: C.teal, fontWeight: 600, cursor: "pointer" }} className="hover:opacity-70 transition-opacity">Contact our support team</span>
            </p>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid #F3F4F6" : "none", padding: "20px 0" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between text-left" style={{ color: C.dark2, fontSize: 15, fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0 }}>
                <span style={{ flex: 1 }}>{faq.q}</span>
                <div className={`faq-plus ${openFaq === i ? "open" : ""}`} style={{ flexShrink: 0, marginLeft: 12 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><line x1="9" y1="0" x2="9" y2="18" stroke="#4DD9C0" strokeWidth="2" strokeLinecap="round"/><line x1="0" y1="9" x2="18" y2="9" stroke="#4DD9C0" strokeWidth="2" strokeLinecap="round"/></svg>
                </div>
              </button>
              <div className={`accordion-content ${openFaq === i ? "open" : ""}`}>
                <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginTop: 12 }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 11 — CTA BANNER */}
      <section className="px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl" style={{ padding: "80px 40px", textAlign: "center" }}>
          <svg className="absolute inset-0" style={{ width: "100%", height: "100%", zIndex: 0, filter: "blur(30px)", pointerEvents: "none" }} viewBox="0 0 800 300" preserveAspectRatio="none">
            <path d="M500,0 Q600,100 750,80 T800,200 Q700,250 600,200 T300,250 T0,150 Q100,300 400,250 Z" fill="#C4B5FD" opacity="0.4" />
            <path d="M400,0 Q500,50 650,30 T700,150 Q550,200 400,150 T100,200 Q0,100 200,50 T400,0 Z" fill="#93C5FD" opacity="0.35" />
          </svg>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider" style={{ background: C.teal, color: "white", marginBottom: 20, letterSpacing: "0.08em" }}>
              READY TO SCALE
            </div>
            <h2 className="font-extrabold mx-auto" style={{ color: C.dark, fontSize: "clamp(32px, 3.5vw, 44px)", maxWidth: 600, lineHeight: 1.15 }}>Ready to transform how your school operates?</h2>
            <p style={{ fontSize: 16, color: C.muted, marginTop: 12 }}>Join 500+ schools already running smarter with SchoolSync</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button onClick={() => navigate("/auth?mode=signup")} style={{ background: C.navy, color: "white", borderRadius: 12, padding: "14px 32px", fontSize: 14, fontWeight: 600, border: "none" }} className="hover-lift">Request a Free Demo</button>
              <button onClick={() => scrollTo("features")} style={{ background: "white", color: "#374151", borderRadius: 12, padding: "14px 32px", fontSize: 14, fontWeight: 600, border: "1px solid #E5E7EB" }} className="hover-lift">View All Modules</button>
            </div>
            <p style={{ fontSize: 12, color: C.label, marginTop: 20 }}>
              <span role="img" aria-label="lock">🔒</span> No credit card required · Setup in 24 hours · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 12 — FOOTER */}
      <footer style={{ background: "#FFFFFF", borderTop: "1px solid #F3F4F6" }}>
        <div className="max-w-7xl mx-auto" style={{ padding: "64px 80px 32px" }}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap size={22} color={C.teal} />
                <span style={{ fontSize: 16, fontWeight: 700, color: C.dark2 }}>SchoolSync</span>
              </div>
              <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, maxWidth: 260 }}>The all-in-one school management platform built for modern institutions.</p>
              <div className="flex gap-4 mt-5">
                {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                  <button key={i} style={{ color: C.label, cursor: "pointer", background: "none", border: "none", padding: 0, transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.teal)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = C.label)}>
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>
            {[
              { title: "PRODUCT", links: ["Features", "Modules", "Pricing", "Changelog", "Roadmap"] },
              { title: "COMPANY", links: ["About Us", "Blog", "Careers", "Press", "Contact"] },
              { title: "SUPPORT", links: ["Documentation", "Help Center", "API Reference", "Status Page", "Privacy Policy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 style={{ fontSize: 11, fontWeight: 600, color: C.label, letterSpacing: "0.1em", marginBottom: 20 }}>{col.title}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {col.links.map((l) => (
                    <li key={l} style={{ marginBottom: 10 }}>
                      <button onClick={() => {}} style={{ fontSize: 14, color: C.muted, cursor: "pointer", background: "none", border: "none", padding: 0, transition: "color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = C.dark2)}
                        onMouseLeave={(e) => (e.currentTarget.style.color = C.muted)}>{l}</button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #F3F4F6", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: C.label }}>© 2025 SchoolSync. All rights reserved.</span>
            <div style={{ display: "flex", gap: 8, fontSize: 12, color: C.label }}>
              <button style={{ color: "inherit", cursor: "pointer", background: "none", border: "none", padding: 0, transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.teal)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.label)}>Terms of Service</button>
              <span>·</span>
              <button style={{ color: "inherit", cursor: "pointer", background: "none", border: "none", padding: 0, transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.teal)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.label)}>Privacy Policy</button>
              <span>·</span>
              <button style={{ color: "inherit", cursor: "pointer", background: "none", border: "none", padding: 0, transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.teal)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.label)}>Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>

      {/* MOBILE CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #F3F4F6" }}>
        <button onClick={() => navigate("/auth?mode=signup")} className="w-full py-2.5 rounded-full text-sm font-bold" style={{ background: C.teal, color: C.dark }}>Get Started Free</button>
      </div>
      <div className="md:hidden h-16" />
    </div>
  );
}

/* DASHBOARD MOCKUP (MINI) */
function DashboardPreviewMini() {
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: "white", fontSize: 10 }}>
      <div className="flex items-center justify-between px-3 py-2" style={{ background: C.navy }}>
        <div className="flex items-center gap-1.5"><div style={{ width: 14, height: 14, borderRadius: 4, background: C.teal }} /><span className="text-white font-bold" style={{ fontSize: 10 }}>SchoolSync</span></div>
        <div style={{ width: 40, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.15)" }} />
      </div>
      <div className="p-3 space-y-2.5">
        <div style={{ fontSize: 12, fontWeight: 700, color: C.dark }}>Good morning, Admin 👋</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Students", value: "1,240", bg: "linear-gradient(135deg,#6B9FFF,#89B4FF)" },
            { label: "Present", value: "1,089", bg: "linear-gradient(135deg,#A78BFA,#C4B5FD)" },
            { label: "Fees", value: "₵84.2K", bg: "linear-gradient(135deg,#4DD9C0,#6EE7D9)" },
            { label: "Pending", value: "₵12.4K", bg: "linear-gradient(135deg,#FBBF24,#FCD34D)" },
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

/* DASHBOARD MOCKUP (FULL) */
function DashboardPreviewFull({ progressVisible, progressRef }: { progressVisible: boolean; progressRef: React.RefObject<HTMLDivElement | null> }) {
  const attendanceRows = [
    ["Class 7A", "38", "2", "95%"],
    ["Class 8B", "35", "5", "87%"],
    ["Class 9C", "30", "10", "75%"],
    ["Class 10A", "40", "1", "97%"],
    ["Class 11B", "33", "7", "82%"],
  ];

  return (
    <div style={{ borderRadius: 22, overflow: "hidden", background: "white", fontSize: 11 }}>
      <div style={{ display: "flex", minHeight: 420 }}>
        {/* Sidebar */}
        <div style={{ width: 180, background: "white", borderRight: "1px solid #F3F4F6", padding: "20px 16px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div className="flex items-center gap-1.5 mb-6"><div style={{ width: 16, height: 16, borderRadius: 4, background: C.teal }} /><span style={{ fontWeight: 700, color: C.dark, fontSize: 14 }}>SchoolSync</span></div>
          {[
            ["MENU", ["Dashboard", "Students", "Teachers", "Classes", "Timetable"]],
            ["ACADEMICS", ["Exams", "Attendance", "Library"]],
            ["FINANCE", ["Fees", "Payroll"]],
            ["OPERATIONS", ["Hostel", "Transport", "Admissions"]],
          ].map(([group, items]: any) => (
            <div key={group} style={{ marginTop: group === "MENU" ? 0 : 24 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: C.label, letterSpacing: "0.1em", marginBottom: 4, paddingLeft: 12 }}>{group}</div>
              {items.map((item: string) => (
                <div key={item} className={`mockup-sidebar-item ${item === "Dashboard" ? "active" : ""}`}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: item === "Dashboard" ? C.teal : C.divider, opacity: item === "Dashboard" ? 1 : 0.6 }} />
                  {item}
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", gap: 8 }}>
            <Moon size={14} style={{ color: C.muted }} />
            <div style={{ width: 32, height: 18, borderRadius: 999, background: C.navy, position: "relative", cursor: "default" }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "white", position: "absolute", top: 2, right: 2 }} />
            </div>
          </div>
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: "20px 24px", background: "#F8FAFC", overflow: "hidden" }}>
          {/* Top bar */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div style={{ background: "#EFF6FF", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 600, color: "#6B9FFF" }}>Notifications 3</div>
              <span style={{ fontSize: 11, color: C.teal, fontWeight: 600, cursor: "default", background: C.teal, color: C.dark, borderRadius: 999, padding: "4px 10px" }}>View All</span>
            </div>
            <div className="flex items-center gap-3">
              <div style={{ background: C.divider, borderRadius: 999, padding: "6px 14px", display: "flex", alignItems: "center", gap: 4 }}>
                <Search size={12} style={{ color: C.muted }} />
                <span style={{ fontSize: 12, color: C.label }}>Search</span>
              </div>
              <Bell size={20} style={{ color: C.label }} />
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #6B9FFF, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 700 }}>SA</div>
            </div>
          </div>
          {/* Greeting */}
          <div style={{ fontSize: 22, fontWeight: 700, color: "#0F1729", marginBottom: 16 }}>Good morning, Admin 👋</div>
          {/* Stats row */}
          <div className="flex gap-3 mb-4">
            {[
              { label: "Total Students", value: "1,240", bg: "linear-gradient(135deg,#6B9FFF,#89B4FF)" },
              { label: "Present Today", value: "1,089", bg: "linear-gradient(135deg,#A78BFA,#C4B5FD)" },
              { label: "Fee Collected", value: "₵84,200", bg: "linear-gradient(135deg,#4DD9C0,#6EE7D9)" },
              { label: "Pending Fees", value: "₵12,400", bg: "linear-gradient(135deg,#FBBF24,#FCD34D)" },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ flex: "0 0 23%", background: s.bg }}>
                <div className="label">{s.label}</div>
                <div className="value">{s.value}</div>
              </div>
            ))}
          </div>
          {/* Two-column layout */}
          <div className="flex gap-4 mb-4">
            {/* Attendance Table */}
            <div className="inner-card" style={{ flex: "0 0 45%", padding: 16 }}>
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 13, fontWeight: 600, color: C.dark2 }}>Today's Attendance</span>
                <span style={{ fontSize: 11, color: C.teal, fontWeight: 600, cursor: "default" }}>View All →</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ color: C.label, borderBottom: "1px solid #F3F4F6" }}>
                    <th style={{ textAlign: "left", padding: "4px 8px", fontWeight: 500, fontSize: 11 }}>Class</th>
                    <th style={{ textAlign: "right", padding: "4px 8px", fontWeight: 500, fontSize: 11 }}>Present</th>
                    <th style={{ textAlign: "right", padding: "4px 8px", fontWeight: 500, fontSize: 11 }}>Absent</th>
                    <th style={{ textAlign: "right", padding: "4px 8px", fontWeight: 500, fontSize: 11 }}>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row, i) => {
                    const rateVal = parseInt(row[3]);
                    let rateBg = "#ECFDF5";
                    let rateText = "#34D399";
                    if (rateVal < 90 && rateVal >= 75) { rateBg = "#FFFBEB"; rateText = "#FBBF24"; }
                    else if (rateVal < 75) { rateBg = "#FFF1F2"; rateText = "#F87171"; }
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td style={{ padding: "6px 8px", color: "#374151", fontSize: 12 }}>{row[0]}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", color: "#374151", fontSize: 12 }}>{row[1]}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", color: "#374151", fontSize: 12 }}>{row[2]}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right" }}>
                          <span style={{ background: rateBg, color: rateText, borderRadius: 999, padding: "1px 8px", fontSize: 10, fontWeight: 600 }}>{row[3]}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Fee Collection Chart */}
            <div className="inner-card" style={{ flex: "0 0 55%", padding: 16 }}>
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: 13, fontWeight: 600, color: C.dark2 }}>Fee Collection Trend</span>
                <div className="flex items-center gap-2">
                  <span style={{ background: C.divider, color: C.muted, borderRadius: 999, padding: "2px 10px", fontSize: 11, cursor: "default" }}>Monthly ▾</span>
                  <Settings size={14} style={{ color: C.muted }} />
                </div>
              </div>
              <svg viewBox="0 0 280 120" style={{ width: "100%", height: 120 }}>
                <defs>
                  <linearGradient id="collected" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#93C5FD" stopOpacity="0.4" /><stop offset="100%" stopColor="#93C5FD" stopOpacity="0" /></linearGradient>
                  <linearGradient id="pending" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.25" /><stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" /></linearGradient>
                </defs>
                <path d="M10,100 Q40,90 60,70 T100,50 T130,40 T160,35 T190,30 T220,32 T250,28 T270,30" fill="none" stroke="#93C5FD" strokeWidth="2" />
                <path d="M10,100 Q40,90 60,70 T100,50 T130,40 T160,35 T190,30 T220,32 T250,28 T270,30 L270,100 Z" fill="url(#collected)" />
                <path d="M10,105 Q40,98 60,85 T100,70 T130,55 T160,50 T190,45 T220,48 T250,40 T270,42" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeDasharray="3 2" />
                <path d="M10,105 Q40,98 60,85 T100,70 T130,55 T160,50 T190,45 T220,48 T250,40 T270,42 L270,105 Z" fill="url(#pending)" />
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                  <text key={i} x={10 + i * 22} y={118} fontSize="9" fill="#9CA3AF">{m}</text>
                ))}
              </svg>
              <div className="flex items-center gap-4" style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>
                <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 2, borderRadius: 1, background: "#93C5FD" }} /> Collected</span>
                <span className="flex items-center gap-1.5"><span style={{ width: 8, height: 2, borderRadius: 1, background: "#C4B5FD" }} /> Pending</span>
              </div>
            </div>
          </div>
          {/* Bottom row */}
          <div className="flex gap-4">
            {/* Term Progress */}
            <div className="inner-card" style={{ flex: "0 0 50%", padding: 16 }} ref={progressRef}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 13, fontWeight: 600, color: C.dark2 }}>Term Progress</span>
                <span style={{ background: C.navy, color: "white", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontWeight: 600, cursor: "default" }}>Check Schedule</span>
              </div>
              <div style={{ fontSize: 11, color: C.label, marginBottom: 8 }}>Week 8 of 14 — 57% complete</div>
              <div style={{ height: 8, borderRadius: 999, background: C.divider, overflow: "hidden" }}>
                <div style={{ width: progressVisible ? "57%" : "0%", height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${C.progressFrom}, ${C.progressTo})`, transition: "width 0.8s ease" }} />
              </div>
              <div className="flex justify-between" style={{ fontSize: 10, color: C.label, marginTop: 6 }}>
                <span>Week 1</span><span>Week 4</span><span>Week 8</span><span>Week 12</span><span>End of Term</span>
              </div>
            </div>
            {/* Promo CTA */}
            <div className="inner-card" style={{ flex: "0 0 50%", padding: 16, position: "relative", overflow: "hidden" }}>
              <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }} viewBox="0 0 300 120" preserveAspectRatio="none">
                <ellipse cx="200" cy="40" rx="120" ry="60" fill="#C4B5FD" opacity="0.35" />
                <ellipse cx="80" cy="80" rx="100" ry="50" fill="#93C5FD" opacity="0.3" />
              </svg>
              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1729" }}>Ready to go paperless?</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>Switch to digital records and save 10+ hours weekly</div>
                <div style={{ display: "inline-flex", padding: "5px 12px", borderRadius: 999, background: C.navy, color: "white", fontSize: 11, fontWeight: 600, cursor: "default", marginTop: 10 }}>Book a Demo →</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
