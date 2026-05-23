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
  { icon: Users, title: "Attendance Management", desc: "QR-based daily tracking for students and staff", cat: "Academic", catColor: C.blue },
  { icon: Wallet, title: "Fees Management", desc: "Invoicing, payments, receipts, and arrears", cat: "Finance", catColor: C.green },
  { icon: BookOpen, title: "Examinations", desc: "Schedule, grade, and publish results online", cat: "Academic", catColor: C.purple },
  { icon: Library, title: "Library", desc: "Book catalog, issue/return, and fine management", cat: "Academic", catColor: C.amber },
  { icon: Home, title: "Hostel", desc: "Room allocation, occupancy, and resident tracking", cat: "Operations", catColor: C.teal },
  { icon: Bus, title: "Transport", desc: "Route management and student bus allocation", cat: "Operations", catColor: C.blue },
  { icon: UserPlus, title: "Admissions", desc: "Online applications, shortlisting, and enrollment", cat: "Operations", catColor: C.purple },
  { icon: MessageSquare, title: "Communication", desc: "In-app chat, announcements, and parent alerts", cat: "Academic", catColor: C.pink },
  { icon: Briefcase, title: "Payroll", desc: "Staff salary, deductions, and payslip generation", cat: "Finance", catColor: C.green },
];

const howItWorks = [
  { icon: Upload, title: "Import Your Data", desc: "Upload your existing student records, staff profiles, and class structures. We support Excel, CSV, and direct API imports.", time: "Day 1", color: C.blue },
  { icon: Settings2, title: "Configure Your Modules", desc: "Enable only the modules your school needs. Set permissions, fee structures, timetables, and grading scales.", time: "Day 2–3", color: C.purple },
  { icon: Rocket, title: "Go Live", desc: "Launch with full support from our onboarding team. Train your staff and start managing your school digitally.", time: "Day 4–7", color: C.teal },
];

const testimonials = [
  { quote: "SchoolSync cut our fee collection time by 60%. Parents pay from their phones and we get instant confirmation — no more long queues on payment day.", name: "Mrs. Adjoa Mensah", role: "Bursar, Accra Academy" },
  { quote: "The QR attendance system eliminated proxy signing completely. Staff love how fast it is, and we have full records at the end of every day.", name: "Mr. Kwame Asante", role: "Headmaster, Presec Legon" },
  { quote: "Having payroll, hostel, and transport all in one dashboard has completely transformed how we run our school's operations.", name: "Dr. Efua Boateng", role: "Director, Aburi Girls" },
];

const pricing = [
  { name: "Starter", price: "$49", sub: "Up to 300 students", badge: null, highlighted: false, features: ["Core modules (Attendance, Fees, Exams, Library)", "3 admin accounts", "Email support", "Basic reports"], cta: "Get Started" },
  { name: "Growth", price: "$99", sub: "Up to 1,000 students", badge: "Most Popular", highlighted: true, features: ["Everything in Starter +", "Hostel, Transport, Payroll, Communication", "10 admin accounts", "Priority support", "Advanced analytics", "Parent portal"], cta: "Start Free Trial" },
  { name: "Enterprise", price: "Custom", sub: "Unlimited students", badge: null, highlighted: false, features: ["Everything in Growth +", "Custom module development", "Dedicated account manager", "Full API access", "SLA guarantee", "On-premise deployment option"], cta: "Contact Sales" },
];

const faqs = [
  { q: "How long does it take to set up SchoolSync?", a: "Most schools go live within 24 hours. Our onboarding team helps you import data, configure modules, and train staff in a single session." },
  { q: "Can parents and students access the platform?", a: "Yes. Parents and students receive dedicated portals. Parents can view attendance, fees, report cards, and communicate with teachers." },
  { q: "Is our student data secure and private?", a: "Absolutely. All data is encrypted in transit and at rest. Each school's data is fully isolated. We follow industry best practices for security and compliance." },
  { q: "Can we import our existing records from Excel?", a: "Yes. We provide bulk import templates for students, staff, classes, and fee structures. Our support team can assist with migration at no extra cost." },
  { q: "Do you offer training and onboarding support?", a: "Yes. Every plan includes onboarding training. We provide video tutorials, documentation, and live training sessions for your entire team." },
  { q: "What happens if we need a module that isn't listed?", a: "We offer custom module development for Enterprise plans. Contact our team and we'll build what you need." },
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
        .mockup-sidebar-item { display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 12px; color: #6B7280; border-radius: 6px; cursor: default; transition: all 0.15s; }
        .mockup-sidebar-item.active { color: #1A1A2E; font-weight: 600; background: rgba(77,217,192,0.08); border-left: 2px solid #4DD9C0; border-radius: 0 6px 6px 0; padding-left: 10px; }
        .stat-card { border-radius: 16px; padding: 16px; color: white; display: flex; flex-direction: column; justify-content: space-between; }
        .stat-card .label { font-size: 11px; opacity: 0.85; }
        .stat-card .value { font-size: 24px; font-weight: 800; margin-top: 4px; }
        .inner-card { background: white; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.055); }
        @media (max-width: 640px) { .stat-card .value { font-size: 20px; } }
      `}</style>

      {/* BACKGROUND */}
      <div className="fixed inset-0 -z-10" style={{ background: "radial-gradient(ellipse at 70% 30%, #DFE3F5, #F4F5FC 80%)" }}>
        <FaintRing className="absolute -top-20 -right-20" size={480} />
        <FaintRing className="absolute top-1/3 -left-32" size={620} />
        <FaintRing className="absolute bottom-1/4 right-1/4" size={300} />
        <Blob className="absolute top-1/4 left-1/6" size={500} color="#A78BFA" opacity={0.05} style={{ animation: "blobFloat 20s ease-in-out infinite" }} />
        <Blob className="absolute bottom-1/3 right-1/5" size={400} color="#6B9FFF" opacity={0.04} style={{ animation: "blobFloat 25s ease-in-out infinite reverse" }} />
        <Crosshair className="absolute top-24 left-8" />
        <Crosshair className="absolute top-24 right-8" />
        <Crosshair className="absolute bottom-24 left-8" />
        <Crosshair className="absolute bottom-24 right-8" />
      </div>

      {/* ─── NAV ─────────── */}
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-40 transition-all duration-300" style={{ marginTop: scrolled ? 8 : 16 }}>
        <div className="flex items-center" style={{ background: C.navy, borderRadius: 999, padding: "10px 28px", boxShadow: "0 8px 32px rgba(26,26,46,0.18)", maxWidth: "90vw" }}>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer mr-8">
            <GraduationCap size={22} color={C.teal} />
            <span className="text-white font-bold text-sm whitespace-nowrap">SchoolSync</span>
          </button>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => {
              const active = l === "Home";
              return (
                <button key={l} onClick={() => l === "Home" ? scrollTo("hero") : scrollTo(l.toLowerCase())}
                  className="px-3 py-1.5 text-sm font-medium transition-all whitespace-nowrap"
                  style={{
                    background: active ? C.white : "transparent",
                    color: active ? C.navy : "rgba(255,255,255,0.8)",
                    borderRadius: 999,
                  }}
                >{l}</button>
              );
            })}
          </div>
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <button onClick={() => navigate("/auth")} style={{ border: "1px solid rgba(255,255,255,0.6)", color: "white", borderRadius: 999, padding: "6px 16px", fontSize: 13, fontWeight: 500 }} className="hover-lift">Log In</button>
            <button onClick={() => navigate("/auth?mode=signup")} style={{ background: C.teal, color: C.dark, borderRadius: 999, padding: "6px 16px", fontSize: 13, fontWeight: 700, border: "none" }} className="hover-lift">Get Started Free</button>
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

      {/* ─── HERO ─────────── */}
      <section id="hero" className="relative pt-40 pb-16 px-6 overflow-hidden">
        <FaintRing className="absolute top-1/4 right-0" size={520} />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[55fr_45fr] gap-12 items-center">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider" style={{ background: C.teal, color: "white", marginBottom: 20 }}>
              SCHOOL MANAGEMENT REIMAGINED
            </div>
            <h1 className="font-extrabold leading-tight" style={{ color: C.dark, fontSize: "clamp(42px, 5vw, 60px)" }}>
              Manage Your School.<br />Effortlessly.
            </h1>
            <p className="mt-5 text-base leading-relaxed" style={{ color: C.muted, maxWidth: 480, lineHeight: 1.7 }}>
              One powerful platform for attendance, exams, fees, hostel, payroll, transport, and 40+ more modules — built for modern schools.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <button onClick={() => navigate("/auth?mode=signup")} style={{ background: C.navy, color: "white", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 700, border: "none" }} className="hover-lift">Request a Demo</button>
              <button onClick={() => scrollTo("features")} style={{ background: "white", color: C.dark, borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600, border: "1px solid #E5E7EB" }} className="hover-lift">Explore Features →</button>
            </div>
            <div className="flex flex-wrap gap-5 mt-8 text-xs" style={{ color: C.muted }}>
              <span className="flex items-center gap-1.5"><Check size={12} color={C.teal} /> 40+ Modules</span>
              <span className="flex items-center gap-1.5"><Check size={12} color={C.teal} /> Role-Based Access</span>
              <span className="flex items-center gap-1.5"><Check size={12} color={C.teal} /> Cloud-Based</span>
            </div>
          </div>
          <div className="relative" style={{ animation: "float 3.5s ease-in-out infinite" }}>
            <div className="glass p-4" style={{ transform: "rotate(-2deg)", boxShadow: "0 24px 64px rgba(100,110,200,0.18)" }}>
              <DashboardPreviewMini />
            </div>
            <svg className="absolute -bottom-8 -left-8" width="120" height="60" viewBox="0 0 120 60" fill="none" style={{ opacity: 0.3, pointerEvents: "none" }}>
              <path d="M10 50 Q 40 10, 70 40 T 110 10" stroke="#0F1729" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>

      {/* ─── STATS ─────────── */}
      <section className="px-6 pb-20" ref={statsRef}>
        <div className="glass mx-auto" style={{ maxWidth: 900, borderRadius: 20, padding: "32px 16px" }}>
          <div className="flex flex-wrap justify-center">
            {[
              { val: schools, label: "Schools Onboarded", sub: "Across 12 countries", suffix: "+" },
              { val: students, label: "Students Managed", sub: "Active profiles", suffix: "K+" },
              { val: modulesCount, label: "Modules Available", sub: "Fully integrated", suffix: "+" },
              { val: uptime, label: "Uptime Guaranteed", sub: "Cloud reliability", suffix: "%", decimal: true },
            ].map((s, i) => (
              <div key={i} className="flex-1 min-w-[140px] text-center px-4" style={{ borderRight: i < 3 ? "1px solid #F3F4F6" : "none", padding: "28px 16px" }}>
                <div className="font-extrabold" style={{ color: C.dark2, fontSize: "clamp(28px, 3vw, 36px)" }}>
                  {s.decimal ? <>{statsVisible ? (s.val / 10).toFixed(1) : "0"}<span style={{ fontSize: "0.5em", verticalAlign: "super" }}>%</span></>
                    : <>{s.val}{s.suffix}</>}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{s.label}</div>
                <div style={{ fontSize: 11, color: C.label, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── INTEGRATION ─────────── */}
      <section className="px-6 pb-20">
        <div className="glass mx-auto p-8 relative" style={{ maxWidth: 1000 }}>
          <Crosshair className="absolute top-4 left-4" />
          <Crosshair className="absolute top-4 right-4" />
          <Crosshair className="absolute bottom-4 left-4" />
          <Crosshair className="absolute bottom-4 right-4" />
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-2/5">
              <h3 className="text-xl font-bold" style={{ color: C.dark2 }}>Connects with tools your school already uses</h3>
              <p className="text-sm mt-2" style={{ color: C.muted }}>Seamlessly sync with payment gateways, communication tools, and government portals</p>
            </div>
            <div className="md:w-3/5 flex flex-wrap items-center justify-center gap-8">
              {["Paystack", "Flutterwave", "Google Workspace", "Zoom", "WhatsApp Business", "SMS Gateway"].map((name) => (
                <div key={name} className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-all duration-300 cursor-default">
                  <div className="w-7 h-7 rounded" style={{ background: C.divider }} />
                  <span className="text-xs font-medium" style={{ color: C.muted }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────── */}
      <section id="features" className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.teal, color: "white", marginBottom: 16 }}>
              WHAT WE OFFER
            </div>
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 38px)" }}>Everything your school needs, in one place</h2>
            <p className="text-sm mt-4 mx-auto" style={{ color: C.muted, maxWidth: 540 }}>From admissions to graduation — every workflow is covered</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, i) => (
              <div key={i} className="inner-card p-6 card-hover anim-fade show" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${m.catColor}18`, color: m.catColor }}>
                  <m.icon size={20} />
                </div>
                <h3 className="text-base font-semibold" style={{ color: C.dark2 }}>{m.title}</h3>
                <p className="text-sm mt-1.5" style={{ color: C.muted }}>{m.desc}</p>
                <div className="mt-3 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: `${m.catColor}12`, color: m.catColor }}>{m.cat}</div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => scrollTo("pricing")} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: C.teal }}>Explore All 40+ Modules →</button>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────── */}
      <section id="modules" className="px-6 pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.amber, color: C.dark, marginBottom: 16 }}>
              SIMPLE PROCESS
            </div>
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 38px)" }}>Up and running in 3 steps</h2>
            <p className="text-sm mt-2" style={{ color: C.muted }}>No technical expertise required — our team handles everything</p>
          </div>
          <div className="relative grid md:grid-cols-3 gap-8">
            <svg className="absolute top-16 left-[16%] right-[16%] hidden md:block" height="2" style={{ pointerEvents: "none" }}>
              <line x1="0" y1="1" x2="100%" y2="1" stroke="#D1D5DB" strokeWidth="1" strokeDasharray="6 4" />
            </svg>
            {howItWorks.map((step, i) => (
              <div key={i} className="relative inner-card p-8 card-hover text-center">
                <div style={{ position: "absolute", top: 0, left: 16, fontSize: 64, fontWeight: 900, color: "#F3F4F6", lineHeight: 1, pointerEvents: "none" }}>0{i + 1}</div>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `${step.color}15`, color: step.color }}>
                  <step.icon size={26} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: C.dark2 }}>{step.title}</h3>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: C.muted }}>{step.desc}</p>
                <div className="mt-4 inline-flex px-3 py-1 rounded-full text-[11px] font-semibold" style={{ background: `${step.color}12`, color: step.color }}>{step.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DASHBOARD PREVIEW ─────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.purple, color: "white", marginBottom: 16 }}>
              LIVE PREVIEW
            </div>
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 38px)" }}>A dashboard built for clarity</h2>
            <p className="text-sm mt-2" style={{ color: C.muted }}>Real-time insights across every department — always one click away</p>
          </div>
          <div className="glass relative p-1" style={{ borderRadius: 24 }}>
            <Crosshair className="absolute top-3 left-3 z-10" />
            <Crosshair className="absolute top-3 right-3 z-10" />
            <Crosshair className="absolute bottom-3 left-3 z-10" />
            <Crosshair className="absolute bottom-3 right-3 z-10" />
            <DashboardPreviewFull />
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────── */}
      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.amber, color: C.dark, marginBottom: 16 }}>
              TRUSTED BY SCHOOLS
            </div>
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 38px)" }}>What school administrators are saying</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="inner-card p-7 card-hover">
                <div className="text-5xl leading-none mb-3" style={{ color: C.teal, opacity: 0.4 }}>"</div>
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill={C.amber} style={{ color: C.amber }} />)}
                </div>
                <p className="text-sm italic leading-relaxed mb-5" style={{ color: "#374151", lineHeight: 1.7 }}>"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: C.blue }}>{t.name.split(" ").map(w => w[0]).join("")}</div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: C.dark2 }}>{t.name}</div>
                    <div className="text-xs" style={{ color: C.muted }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────── */}
      <section id="pricing" className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold" style={{ background: C.teal, color: "white", marginBottom: 16 }}>
              SIMPLE PRICING
            </div>
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 38px)" }}>Choose the plan that fits your school</h2>
            <div className="inline-flex items-center gap-3 mt-6 p-1 rounded-full" style={{ background: C.divider }}>
              <button onClick={() => setPricingAnnual(false)} className="px-5 py-1.5 rounded-full text-sm font-medium transition-all" style={{ background: pricingAnnual ? "transparent" : "white", color: pricingAnnual ? C.muted : C.dark2, boxShadow: pricingAnnual ? "none" : "0 2px 8px rgba(0,0,0,0.08)" }}>Monthly</button>
              <button onClick={() => setPricingAnnual(true)} className="px-5 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-2" style={{ background: pricingAnnual ? "white" : "transparent", color: pricingAnnual ? C.dark2 : C.muted, boxShadow: pricingAnnual ? "0 2px 8px rgba(0,0,0,0.08)" : "none" }}>
                Annual <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: C.green, color: "white" }}>Save 20%</span>
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((p, i) => (
              <div key={i} className="relative rounded-2xl p-8 card-hover" style={{
                background: p.highlighted ? `linear-gradient(135deg, ${C.blue}08, ${C.purple}08)` : "white",
                border: p.highlighted ? "2px solid transparent" : "1px solid #F3F4F6",
                boxShadow: p.highlighted ? "0 8px 32px rgba(107,159,255,0.15)" : "0 4px 20px rgba(0,0,0,0.055)",
                backgroundClip: p.highlighted ? "padding-box" : "unset",
              }}>
                {p.badge && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: C.teal, color: "white", whiteSpace: "nowrap" }}>{p.badge}</div>}
                <h3 className="text-lg font-bold" style={{ color: C.dark2 }}>{p.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold" style={{ color: C.dark2 }}>{p.price}</span>
                  {p.price !== "Custom" && <span className="text-sm ml-1" style={{ color: C.muted }}>/mo</span>}
                </div>
                <div className="text-sm mt-1" style={{ color: C.muted }}>{p.sub}</div>
                <button onClick={() => navigate("/auth?mode=signup")} className="w-full mt-6 py-2.5 rounded-xl text-sm font-bold transition-all hover-lift" style={{
                  background: p.highlighted ? C.navy : "white",
                  color: p.highlighted ? "white" : C.dark2,
                  border: p.highlighted ? "none" : "1px solid #E5E7EB",
                }}>{p.cta}</button>
                <div className="mt-6 space-y-3">
                  {p.features.map((f, j) => (
                    <div key={j} className="flex items-start gap-2 text-xs" style={{ color: C.muted }}>
                      <Check size={14} color={C.teal} className="flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────── */}
      <section id="faq" className="px-6 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(30px, 3vw, 38px)" }}>Frequently asked questions</h2>
            <p className="text-sm mt-2" style={{ color: C.muted }}>
              Can't find your answer?{" "}
              <span style={{ color: C.teal, fontWeight: 600, cursor: "pointer" }} className="hover:opacity-70 transition-opacity">Contact Support →</span>
            </p>
          </div>
          <div className="glass p-2" style={{ borderRadius: 20 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < faqs.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between text-left px-5 py-4 text-sm font-semibold transition-all" style={{ color: C.dark2 }}>
                  <span>{faq.q}</span>
                  <ChevronDown size={16} color={C.teal} style={{ transform: openFaq === i ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s ease", flexShrink: 0, marginLeft: 12 }} />
                </button>
                <div className={`accordion-content ${openFaq === i ? "open" : ""}`}>
                  <p className="px-5 pb-4 text-sm" style={{ color: C.muted, lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─────────── */}
      <section className="px-6 pb-24">
        <div className="relative overflow-hidden rounded-3xl p-16 text-center" style={{ background: "radial-gradient(ellipse at 50% 40%, #A78BFA20, #6B9FFF10)" }}>
          <Blob className="absolute inset-0" size={800} color="#A78BFA" opacity={0.08} />
          <div className="relative">
            <h2 className="font-bold" style={{ color: C.dark2, fontSize: "clamp(32px, 3.5vw, 44px)" }}>Ready to transform how your school operates?</h2>
            <p className="mt-4 text-base" style={{ color: C.muted }}>Join 500+ schools already running smarter with SchoolSync</p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <button onClick={() => navigate("/auth?mode=signup")} style={{ background: C.navy, color: "white", borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 700, border: "none" }} className="hover-lift">Request a Free Demo</button>
              <button onClick={() => scrollTo("features")} style={{ background: "white", color: C.dark, borderRadius: 12, padding: "12px 28px", fontSize: 14, fontWeight: 600, border: "1px solid #E5E7EB" }} className="hover-lift">View All Modules</button>
            </div>
            <p className="mt-6 text-xs" style={{ color: C.muted }}>
              <span role="img" aria-label="lock">🔒</span> No credit card required · Setup in 24 hours · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─────────── */}
      <footer style={{ background: "#FFFFFF", borderTop: "1px solid #F3F4F6" }}>
        <div className="max-w-7xl mx-auto px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={20} color={C.teal} />
              <span className="font-bold text-sm" style={{ color: C.dark2 }}>SchoolSync</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: C.muted, maxWidth: 260 }}>The all-in-one school management platform built for modern institutions.</p>
            <div className="flex gap-3 mt-5">
              {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
                <button key={i} className="p-1.5 rounded-lg transition-all hover:opacity-60" style={{ color: C.muted }}><Icon size={20} /></button>
              ))}
            </div>
          </div>
          {[
            { title: "PRODUCT", links: ["Features", "Modules", "Pricing", "Changelog", "Roadmap"] },
            { title: "COMPANY", links: ["About Us", "Blog", "Careers", "Press", "Contact"] },
            { title: "SUPPORT", links: ["Documentation", "Help Center", "API Reference", "Status Page", "Privacy Policy"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold mb-5" style={{ color: C.label, letterSpacing: 1.5 }}>{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}><button onClick={() => scrollTo(l.toLowerCase())} className="text-sm transition-all hover:opacity-60" style={{ color: C.muted }}>{l}</button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderTop: "1px solid #F3F4F6" }}>
          <span className="text-xs" style={{ color: C.label }}>© 2025 SchoolSync. All rights reserved.</span>
          <div className="flex gap-4 text-xs" style={{ color: C.label }}>
            <button className="hover:opacity-60 transition-opacity">Terms of Service</button>
            <button className="hover:opacity-60 transition-opacity">Privacy Policy</button>
            <button className="hover:opacity-60 transition-opacity">Cookie Policy</button>
          </div>
        </div>
      </footer>

      {/* ─── MOBILE CTA ─────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3" style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid #F3F4F6" }}>
        <button onClick={() => navigate("/auth?mode=signup")} className="w-full py-2.5 rounded-full text-sm font-bold" style={{ background: C.teal, color: C.dark }}>Get Started Free</button>
      </div>
      <div className="md:hidden h-16" />
    </div>
  );
}

/* ─── DASHBOARD MOCKUP (MINI) ─────────── */
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

/* ─── DASHBOARD MOCKUP (FULL) ─────────── */
function DashboardPreviewFull() {
  return (
    <div style={{ borderRadius: 22, overflow: "hidden", background: "white", fontSize: 11 }}>
      <div style={{ display: "flex", minHeight: 420 }}>
        {/* Sidebar */}
        <div style={{ width: 180, background: "#FAFBFC", borderRight: "1px solid #F3F4F6", padding: 16, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div className="flex items-center gap-1.5 mb-6"><div style={{ width: 16, height: 16, borderRadius: 4, background: C.teal }} /><span style={{ fontWeight: 700, color: C.dark, fontSize: 12 }}>SchoolSync</span></div>
          {[
            ["MENU", ["Dashboard", "Students", "Teachers", "Classes", "Timetable"]],
            ["ACADEMICS", ["Exams", "Attendance", "Library"]],
            ["FINANCE", ["Fees", "Payroll"]],
            ["OPERATIONS", ["Hostel", "Transport", "Admissions"]],
          ].map(([group, items]: any) => (
            <div key={group} className="mb-4">
              <div style={{ fontSize: 9, fontWeight: 600, color: C.label, letterSpacing: 0.5, marginBottom: 4, paddingLeft: 12 }}>{group}</div>
              {items.map((item: string) => (
                <div key={item} className={`mockup-sidebar-item ${item === "Dashboard" ? "active" : ""}`}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: item === "Dashboard" ? C.teal : "#D1D5DB" }} />
                  {item}
                </div>
              ))}
            </div>
          ))}
          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid #F3F4F6" }}>
            <div className="mockup-sidebar-item" style={{ background: C.navy, color: "white", borderRadius: 999, padding: "4px 12px" }}><Moon size={11} /> Dark Mode</div>
          </div>
        </div>
        {/* Main */}
        <div style={{ flex: 1, padding: 16, overflow: "hidden" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div style={{ background: "#E0F2FE", borderRadius: 999, padding: "3px 10px", fontSize: 10, fontWeight: 600, color: "#0369A1" }}>Notifications 3</div>
              <span style={{ fontSize: 10, color: C.teal, fontWeight: 600, cursor: "default" }}>View All</span>
            </div>
            <div className="flex items-center gap-2">
              <div style={{ background: C.divider, borderRadius: 6, padding: "4px 10px", display: "flex", alignItems: "center", gap: 4 }}>
                <Search size={10} style={{ color: C.muted }} />
                <span style={{ fontSize: 10, color: C.label }}>Search...</span>
              </div>
              <Bell size={12} style={{ color: C.muted }} />
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 8, fontWeight: 700 }}>A</div>
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.dark, marginBottom: 10 }}>Good morning, Admin 👋</div>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: "Total Students", value: "1,240", bg: "linear-gradient(135deg,#6B9FFF,#89B4FF)" },
              { label: "Present Today", value: "1,089", bg: "linear-gradient(135deg,#A78BFA,#C4B5FD)" },
              { label: "Fee Collected", value: "₵84,200", bg: "linear-gradient(135deg,#4DD9C0,#6EE7D9)" },
              { label: "Pending Fees", value: "₵12,400", bg: "linear-gradient(135deg,#FBBF24,#FCD34D)" },
            ].map((s, i) => (
              <div key={i} className="stat-card" style={{ background: s.bg }}>
                <div className="label">{s.label}</div>
                <div className="value">{s.value}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <div style={{ fontSize: 12, fontWeight: 600, color: C.dark, marginBottom: 5 }}>Today's Attendance <span style={{ color: C.teal, fontWeight: 500, cursor: "default" }}>View All →</span></div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
                <thead><tr style={{ color: C.label, borderBottom: "1px solid #F3F4F6" }}>
                  <th style={{ textAlign: "left", padding: "4px 6px", fontWeight: 500 }}>Class</th>
                  <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 500 }}>Present</th>
                  <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 500 }}>Absent</th>
                  <th style={{ textAlign: "right", padding: "4px 6px", fontWeight: 500 }}>Rate</th>
                </tr></thead>
                <tbody>
                  {[
                    ["JHS 1A", "38", "2", "95%"],
                    ["JHS 2B", "35", "5", "88%"],
                    ["SHS 1 Science", "42", "1", "98%"],
                    ["SHS 2 General", "29", "8", "78%"],
                    ["SHS 3 Business", "33", "3", "92%"],
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      {row.map((c, j) => {
                        const isRate = j === 3;
                        const rateVal = parseInt(c);
                        let rateColor = C.green;
                        if (rateVal < 90 && rateVal >= 75) rateColor = C.amber;
                        else if (rateVal < 75) rateColor = "#EF4444";
                        return <td key={j} style={{ padding: "5px 6px", textAlign: j === 0 ? "left" : "right", color: isRate ? "white" : C.muted, fontWeight: isRate ? 600 : 400 }}>
                          {isRate ? <span style={{ background: rateColor, borderRadius: 999, padding: "1px 8px", fontSize: 9 }}>{c}</span> : c}
                        </td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>Term Progress</span>
                  <span style={{ fontSize: 9, fontWeight: 600, background: C.navy, color: "white", borderRadius: 999, padding: "2px 8px", cursor: "default" }}>Check Schedule</span>
                </div>
                <div style={{ fontSize: 10, color: C.muted, marginBottom: 4 }}>Week 8 of 14 — 57% complete</div>
                <div style={{ height: 8, borderRadius: 999, background: C.divider, overflow: "hidden" }}>
                  <div style={{ width: "57%", height: "100%", borderRadius: 999, background: `linear-gradient(90deg, ${C.progressFrom}, ${C.progressTo})` }} />
                </div>
                <div className="flex justify-between mt-1 text-[9px]" style={{ color: C.label }}>
                  <span>Week 1</span><span>Week 4</span><span>Week 8</span><span>Week 12</span><span>End</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <span style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>Fee Collection Trend</span>
                <div className="flex items-center gap-1">
                  <span style={{ fontSize: 9, color: C.muted }}>Monthly ▾</span>
                  <Settings size={10} style={{ color: C.muted }} />
                </div>
              </div>
              <svg viewBox="0 0 280 120" style={{ width: "100%", height: 100 }}>
                <defs>
                  <linearGradient id="collected" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#93C5FD" stopOpacity="0.4" /><stop offset="100%" stopColor="#93C5FD" stopOpacity="0" /></linearGradient>
                  <linearGradient id="pending" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.4" /><stop offset="100%" stopColor="#C4B5FD" stopOpacity="0" /></linearGradient>
                </defs>
                <path d="M10,100 Q40,90 60,70 T100,50 T130,40 T160,35 T190,30 T220,32 T250,28 T270,30" fill="none" stroke="#93C5FD" strokeWidth="2" />
                <path d="M10,100 Q40,90 60,70 T100,50 T130,40 T160,35 T190,30 T220,32 T250,28 T270,30 L270,100 Z" fill="url(#collected)" />
                <path d="M10,105 Q40,98 60,85 T100,70 T130,55 T160,50 T190,45 T220,48 T250,40 T270,42" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeDasharray="3 2" />
                <path d="M10,105 Q40,98 60,85 T100,70 T130,55 T160,50 T190,45 T220,48 T250,40 T270,42 L270,105 Z" fill="url(#pending)" />
              </svg>
              <div className="flex items-center gap-4 text-[9px] mb-3" style={{ color: C.label }}>
                <span className="flex items-center gap-1"><span style={{ width: 8, height: 2, borderRadius: 1, background: "#93C5FD" }} /> Collected</span>
                <span className="flex items-center gap-1"><span style={{ width: 8, height: 2, borderRadius: 1, background: "#C4B5FD" }} /> Pending</span>
              </div>
              <div style={{ background: "radial-gradient(ellipse at 60% 40%, #A78BFA15, #6B9FFF08)", borderRadius: 14, padding: 14, position: "relative", overflow: "hidden" }}>
                <Blob className="absolute -right-8 -top-8" size={120} color="#A78BFA" opacity={0.1} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.dark, marginBottom: 4 }}>Ready to go paperless?</div>
                  <div style={{ fontSize: 9, color: C.muted, marginBottom: 8, lineHeight: 1.5 }}>Switch to digital records and save 10+ hours weekly</div>
                  <div style={{ display: "inline-flex", padding: "5px 12px", borderRadius: 999, background: C.navy, color: "white", fontSize: 9, fontWeight: 600, cursor: "default" }}>Book a Demo →</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
