import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight, BookOpen, BarChart3, MessageSquare, CheckCircle2, GraduationCap,
  Wallet, Bell, Menu, X, Zap, Clock, Award, Lock, TrendingUp, Users, Globe,
  Sun, Moon, Shield, PlayCircle, Star, ChevronDown, ChevronUp,
} from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";
import { ROICalculator } from "../components/ROICalculator";

const COLORS = {
  NAVY: "#0A2472",
  NAVY_LIGHT: "#0C2D8A",
  AMBER: "#FFBA08",
  AMBER_LIGHT: "#FFF8E1",
  CREAM: "#F8F9FA",
  MUTED: "#6B7280",
  GREEN: "#10B981",
  RED: "#EF4444",
};

export function LandingPage() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [demoForm, setDemoForm] = useState({ name: "", email: "", schoolName: "" });
  const [stats, setStats] = useState({ schools: 340, uptime: 99.7 });
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (window.scrollY > 50 && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  const submitDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name || !demoForm.email || !demoForm.schoolName) {
      return toast.error("Please fill in all fields");
    }
    setSending(true);
    try {
      await api.post("/api/onboard/demo-request", demoForm);
      toast.success("Demo request sent! We'll contact you within 24 hours.");
      setDemoOpen(false);
      setDemoForm({ name: "", email: "", schoolName: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };

  const testimonials = [
    {
      quote: "Managen cut our administrative workload by 60%. Parents get real-time updates, and we have peace of mind.",
      author: "Mr. Kwaku Mensah",
      role: "Headmaster, Accra Academy",
      avatar: "KM",
      color: "#3B82F6",
    },
    {
      quote: "The fee collection system is incredible. We went from 40% collection rate to 92% in two terms.",
      author: "Mrs. Ama Osei",
      role: "Accountant, Sunshine Primary",
      avatar: "AO",
      color: "#10B981",
    },
    {
      quote: "Exam scheduling and result publishing that used to take a week now takes hours. Game changer.",
      author: "Dr. David Owusu",
      role: "Principal, Mfantsipim School",
      avatar: "DO",
      color: "#F59E0B",
    },
  ];

  const schoolLogos = [
    "Accra Academy", "Sunshine Primary", "Cape Coast Scholars",
    "Kumasi Prep", "Lincoln Community", "Ridge Church",
  ];

  // OUTCOME-FOCUSED FEATURES
  const features = [
    {
      icon: Users,
      title: "Stop Missing Attendance Patterns",
      desc: "One-tap daily attendance with automatic parent notifications and AI-powered absorbency alerts.",
      color: "#3B82F6",
    },
    {
      icon: Wallet,
      title: "Collect Fees, Not Excuses",
      desc: "Automated reminders turn 40% → 92% collection in two terms. Payment tracking & reconciliation in minutes.",
      color: "#10B981",
    },
    {
      icon: BarChart3,
      title: "Publish Results in Hours, Not Weeks",
      desc: "WAEC/BECE templates, automatic grading, instant WhatsApp reports to parents.",
      color: "#F59E0B",
    },
    {
      icon: MessageSquare,
      title: "Cut Admin Workload by 60%",
      desc: "Parents get real-time updates automatically. No manual emails or calls needed.",
      color: "#8B5CF6",
    },
    {
      icon: TrendingUp,
      title: "See What's Really Happening",
      desc: "Visual dashboards showing attendance trends, fee patterns, and academic performance in real-time.",
      color: "#EC4899",
    },
    {
      icon: Shield,
      title: "Sleep Soundly. Your Data is Safe.",
      desc: "Bank-grade encryption, isolated per school, daily backups. Comply with data regulations.",
      color: "#EF4444",
    },
  ];

  const pricing = [
    {
      name: "Free Trial",
      price: "Free",
      duration: "7 days",
      students: 50,
      cta: "Start Now",
      highlighted: false,
      features: ["Up to 50 students", "Attendance & fees", "Basic reports", "No credit card required"],
    },
    {
      name: "Growth",
      price: "GHS 499",
      priceMo: "GHS 399/yr",
      duration: "per month",
      students: 300,
      cta: "Get Started",
      highlighted: true,
      badge: "Most Popular",
      features: ["Up to 300 students", "Fee invoicing", "Exams", "WhatsApp reports", "Priority support"],
    },
    {
      name: "Pro",
      price: "GHS 999",
      priceMo: "GHS 799/yr",
      duration: "per month",
      students: 800,
      cta: "Get Started",
      highlighted: false,
      features: ["Up to 800 students", "Library & transport", "Payroll", "Unlimited reports", "API access"],
    },
    {
      name: "Enterprise",
      price: "Custom",
      duration: "",
      students: null,
      cta: "Contact Sales",
      highlighted: false,
      features: ["Unlimited students", "All modules", "Custom domain", "Account manager", "SLA guarantee"],
    },
  ];

  const workflow = [
    { step: 1, title: "Import your data", desc: "Bulk upload student list and staff in 5 minutes" },
    { step: 2, title: "Set up modules", desc: "Choose which features (attendance, fees, exams) to activate" },
    { step: 3, title: "Invite staff & parents", desc: "Send WhatsApp links for instant onboarding" },
    { step: 4, title: "Go live", desc: "Start taking attendance and collecting fees the same day" },
  ];

  const faqs = [
    {
      q: "Is there really no credit card required for the free trial?",
      a: "Correct. The 7-day Free Trial gives you full access with no payment details required. You only provide billing information when you upgrade.",
    },
    {
      q: "What happens when my free trial ends?",
      a: "Your account is paused—no data deleted. You can upgrade anytime to reactivate. We'll send reminders before and after the trial ends.",
    },
    {
      q: "Can I switch plans later?",
      a: "Yes. Upgrade or downgrade anytime from your dashboard. Changes take effect at the start of your next billing cycle.",
    },
    {
      q: "Does Managen support the Ghanaian curriculum?",
      a: "Yes. Built specifically for Ghanaian schools with full support for WAEC, BECE, and local curriculum structures. Pricing in GHS.",
    },
    {
      q: "How does the WhatsApp reporting work?",
      a: "Integrated with WhatsApp Business API to send automated reports—attendance summaries, fee reminders, exam results—directly to parents.",
    },
    {
      q: "Is our school data secure?",
      a: "Yes. End-to-end encryption, isolated per school, daily backups. No school can access another school's data. GDPR-ready infrastructure.",
    },
    {
      q: "What student limit on each plan?",
      a: "Free Trial: 50. Growth: 300. Pro: 800. Enterprise: Unlimited. Need a custom limit? Contact our team.",
    },
    {
      q: "Can I get a live demo?",
      a: "Absolutely. Click 'Request Demo' and our team will schedule a personalized walkthrough for your school.",
    },
  ];

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className={`min-h-screen transition-colors duration-300 ${
        dark ? "bg-gray-950 text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        .reveal { animation: fadeUp 0.6s ease-out both; }
        .reveal-1 { animation-delay: 0.1s; }
        .reveal-2 { animation-delay: 0.2s; }
        .reveal-3 { animation-delay: 0.3s; }
        .hover-lift { transition: all 0.3s ease; }
        .hover-lift:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
      `}</style>

      {/* NAV */}
      <nav
        className="fixed top-0 inset-x-0 z-40 transition-all duration-300"
        style={{
          background: dark
            ? scrolled
              ? "rgba(17,24,39,0.95)"
              : "rgba(17,24,39,0.4)"
            : scrolled
            ? "rgba(255,255,255,0.95)"
            : "rgba(255,255,255,0.4)",
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${dark ? "rgba(55,65,81,0.3)" : "rgba(0,0,0,0.05)"}`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer font-bold text-xl hover:opacity-70 transition-opacity"
            style={{ color: COLORS.NAVY }}
            aria-label="Managen home"
          >
            <GraduationCap size={28} />
            <span className="hidden sm:inline">Managen</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "Security", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{ color: COLORS.NAVY }}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 hover:opacity-70"
              style={{ color: COLORS.NAVY }}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate("/auth")}
              style={{ color: COLORS.NAVY }}
              className="px-4 py-2 text-sm font-medium hover:opacity-70"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="px-5 py-2 rounded-lg text-sm font-bold text-white"
              style={{ background: COLORS.AMBER }}
              aria-label="Start free trial"
            >
              Start Free
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{ color: COLORS.NAVY }}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileOpen && (
          <div
            className="md:hidden border-t"
            style={{ borderColor: `${COLORS.NAVY}10`, background: dark ? "rgba(17,24,39,0.8)" : "rgba(255,255,255,0.8)" }}
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {["Features", "Pricing", "Security", "FAQ"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} style={{ color: COLORS.NAVY }} className="text-sm font-medium">
                  {item}
                </a>
              ))}
              <button
                onClick={() => navigate("/auth?mode=signup")}
                className="px-5 py-2 rounded-lg text-sm font-bold text-white w-full"
                style={{ background: COLORS.AMBER }}
              >
                Start Free Trial
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO - OUTCOME FOCUSED */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="reveal reveal-1 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                style={{ background: `${COLORS.AMBER}20`, color: COLORS.AMBER }}>
                ✨ Built for Ghanaian schools
              </div>

              <h1 className="reveal reveal-1 text-5xl md:text-6xl font-bold leading-tight"
                style={{ color: COLORS.NAVY }}>
                Collect ₵50K More This Term
              </h1>

              <p className="reveal reveal-2 text-lg" style={{ color: COLORS.MUTED, maxWidth: "500px" }}>
                From 40% to 92% fee collection. Real results in two terms. Managen handles attendance, fees, exams, and parent updates—all automated. Trusted by 340+ schools.
              </p>

              <div className="reveal reveal-3 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="px-6 py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 hover-lift"
                  style={{ background: COLORS.AMBER }}
                >
                  Start Free Trial
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => setDemoOpen(true)}
                  className="px-6 py-3 rounded-lg font-bold border-2 flex items-center justify-center gap-2 hover-lift"
                  style={{ borderColor: COLORS.NAVY, color: COLORS.NAVY }}
                >
                  <PlayCircle size={18} />
                  Watch Demo
                </button>
              </div>

              <div className="reveal reveal-4 flex flex-wrap gap-4 text-sm pt-4"
                style={{ color: COLORS.MUTED }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} style={{ color: COLORS.GREEN }} />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} style={{ color: COLORS.GREEN }} />
                  Free forever tier
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} style={{ color: COLORS.GREEN }} />
                  7-day trial
                </div>
              </div>
            </div>

            <div className="reveal reveal-2 relative hidden lg:block">
              <div
                className="absolute inset-0 rounded-2xl opacity-20 blur-3xl"
                style={{ background: `radial-gradient(circle, ${COLORS.AMBER}, transparent)` }}
              />
              <div
                className="relative rounded-2xl p-8 border-2"
                style={{
                  background: dark ? "rgba(30,41,59,0.8)" : "rgba(248,249,250,1)",
                  borderColor: `${COLORS.AMBER}40`,
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div style={{ color: COLORS.NAVY }} className="font-bold">Dashboard</div>
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS.GREEN }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {["Students", "Fees Collected", "Attendance", "Pending"].map((label) => (
                      <div key={label} className="p-3 rounded-lg"
                        style={{ background: dark ? "rgba(55,65,81,0.5)" : "#F3F4F6" }}>
                        <div className="text-xs" style={{ color: COLORS.MUTED }}>{label}</div>
                        <div className="text-lg font-bold mt-1" style={{ color: COLORS.NAVY }}>
                          {label === "Students" ? "1,250" : label === "Fees Collected" ? "92%" : label === "Attendance" ? "94%" : "3"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-12 px-6 border-y"
        style={{ borderColor: dark ? "rgba(55,65,81,0.3)" : `${COLORS.NAVY}10` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold" style={{ color: COLORS.AMBER }}>TRUSTED BY SCHOOLS ACROSS GHANA</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {schoolLogos.map((logo) => (
              <div key={logo} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: `${COLORS.AMBER}20`, color: COLORS.AMBER }}>
                  {logo[0]}
                </div>
                <span className="text-sm font-medium" style={{ color: COLORS.NAVY }}>{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold" style={{ color: COLORS.AMBER }}>WHAT HEADMASTERS SAY</p>
            <h2 className="text-4xl font-bold mt-4" style={{ color: COLORS.NAVY }}>
              Loved by school leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-xl border hover-lift"
                style={{
                  background: dark ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,1)",
                  borderColor: `${t.color}30`,
                }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill={t.color} style={{ color: t.color }} />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed" style={{ color: COLORS.MUTED }}>"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm"
                    style={{ background: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: COLORS.NAVY }}>{t.author}</div>
                    <div className="text-sm" style={{ color: COLORS.MUTED }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES - OUTCOME FOCUSED */}
      <section id="features" className="py-24 px-6"
        style={{ background: dark ? "rgba(17,24,39,0.5)" : `${COLORS.AMBER}05` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold" style={{ color: COLORS.AMBER }}>SOLVE REAL PROBLEMS</p>
            <h2 className="text-4xl font-bold mt-4" style={{ color: COLORS.NAVY }}>
              Features that matter
            </h2>
            <p className="mt-4 text-lg" style={{ color: COLORS.MUTED, maxWidth: "600px", margin: "1rem auto" }}>
              Every feature designed around the actual pain points African schools face.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="p-6 rounded-xl border hover-lift reveal"
                style={{
                  animationDelay: `${i * 50}ms`,
                  background: dark ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,1)",
                  borderColor: `${f.color}20`,
                }}>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ background: `${f.color}15`, color: f.color }}>
                  <f.icon size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: COLORS.NAVY }}>{f.title}</h3>
                <p style={{ color: COLORS.MUTED }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI CALCULATOR */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold" style={{ color: COLORS.AMBER }}>QUICK MATH</p>
            <h2 className="text-4xl font-bold mt-4" style={{ color: COLORS.NAVY }}>
              What's your ROI?
            </h2>
          </div>
          <ROICalculator />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6"
        style={{ background: dark ? "rgba(17,24,39,0.5)" : `${COLORS.NAVY}08` }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold" style={{ color: COLORS.AMBER }}>SETUP IN 1 HOUR</p>
            <h2 className="text-4xl font-bold mt-4" style={{ color: COLORS.NAVY }}>
              Go live fast
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {workflow.map((w) => (
              <div key={w.step} className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg"
                  style={{ background: COLORS.AMBER, color: COLORS.NAVY }}>
                  {w.step}
                </div>
                <h3 className="font-bold mb-2" style={{ color: COLORS.NAVY }}>{w.title}</h3>
                <p className="text-sm" style={{ color: COLORS.MUTED }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold" style={{ color: COLORS.AMBER }}>TRANSPARENT PRICING</p>
            <h2 className="text-4xl font-bold mt-4" style={{ color: COLORS.NAVY }}>
              Choose your plan
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricing.map((plan, i) => (
              <div
                key={i}
                className="rounded-xl border relative hover-lift overflow-hidden"
                style={{
                  background: plan.highlighted
                    ? dark
                      ? `${COLORS.AMBER}15`
                      : `${COLORS.AMBER}08`
                    : dark
                    ? "rgba(30,41,59,0.8)"
                    : "rgba(255,255,255,1)",
                  borderColor: plan.highlighted ? COLORS.AMBER : `${COLORS.NAVY}15`,
                  borderWidth: plan.highlighted ? "2px" : "1px",
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute top-0 left-0 right-0 py-1.5 text-center text-xs font-bold"
                    style={{ background: COLORS.AMBER, color: COLORS.NAVY }}
                  >
                    ⭐ {plan.badge}
                  </div>
                )}
                <div className={`p-6 ${plan.badge ? "mt-6" : ""}`}>
                  <h3 className="font-bold text-lg" style={{ color: COLORS.NAVY }}>
                    {plan.name}
                  </h3>
                  <div className="mt-4">
                    <div className="text-4xl font-bold" style={{ color: COLORS.NAVY }}>
                      {plan.price}
                    </div>
                    <div className="text-sm mt-1" style={{ color: COLORS.MUTED }}>
                      {plan.duration}
                    </div>
                    {plan.priceMo && (
                      <div className="text-xs mt-2" style={{ color: COLORS.GREEN }}>
                        or {plan.priceMo}
                      </div>
                    )}
                  </div>
                  {plan.students && (
                    <div className="mt-4 text-sm" style={{ color: COLORS.MUTED }}>
                      Up to {plan.students.toLocaleString()} students
                    </div>
                  )}
                  <button
                    onClick={() => navigate("/auth?mode=signup")}
                    className="w-full mt-6 py-2.5 rounded-lg font-bold"
                    style={{
                      background: plan.highlighted ? COLORS.AMBER : `${COLORS.NAVY}10`,
                      color: plan.highlighted ? COLORS.NAVY : COLORS.NAVY,
                    }}
                  >
                    {plan.cta}
                  </button>
                  <div className="mt-6 space-y-3">
                    {plan.features.map((f, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 size={16} style={{ color: COLORS.GREEN, marginTop: "2px" }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="py-24 px-6"
        style={{ background: dark ? "rgba(17,24,39,0.5)" : `${COLORS.NAVY}08` }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold" style={{ color: COLORS.AMBER }}>YOUR DATA IS SAFE</p>
            <h2 className="text-4xl font-bold mt-4" style={{ color: COLORS.NAVY }}>
              Enterprise-grade security
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lock, title: "End-to-End Encryption", desc: "All data encrypted in transit and at rest" },
              { icon: Shield, title: "School Isolation", desc: "Each school's data completely isolated from others" },
              { icon: Clock, title: "Automatic Backups", desc: "Daily backups with point-in-time recovery" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4"
                  style={{ background: `${COLORS.AMBER}20`, color: COLORS.AMBER }}>
                  <item.icon size={32} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: COLORS.NAVY }}>{item.title}</h3>
                <p style={{ color: COLORS.MUTED }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold" style={{ color: COLORS.AMBER }}>COMMON QUESTIONS</p>
            <h2 className="text-4xl font-bold mt-4" style={{ color: COLORS.NAVY }}>
              Frequently asked
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border p-6"
                style={{
                  background: dark ? "rgba(30,41,59,0.8)" : "rgba(255,255,255,1)",
                  borderColor: `${COLORS.NAVY}10`,
                }}>
                <button
                  onClick={() => setOpenFaqId(openFaqId === i ? null : i)}
                  className="w-full flex items-start justify-between text-left font-semibold"
                  style={{ color: COLORS.NAVY }}
                  aria-expanded={openFaqId === i}
                >
                  <span>{faq.q}</span>
                  {openFaqId === i ? (
                    <ChevronUp size={20} className="flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown size={20} className="flex-shrink-0 ml-4" />
                  )}
                </button>
                {openFaqId === i && (
                  <p className="mt-4" style={{ color: COLORS.MUTED }}>
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FOOTER */}
      <section className="py-16 px-6" style={{ background: `linear-gradient(135deg, ${COLORS.NAVY}, ${COLORS.NAVY_LIGHT})` }}>
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold" style={{ color: COLORS.CREAM }}>
            Ready to collect more fees this term?
          </h2>
          <p className="text-lg" style={{ color: "rgba(248,249,250,0.8)" }}>
            Join 340+ schools already using Managen. 7-day free trial. No credit card required.
          </p>
          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="px-8 py-3.5 rounded-lg font-bold text-lg inline-flex items-center gap-2"
            style={{ background: COLORS.AMBER, color: COLORS.NAVY }}
          >
            Start Your Free Trial
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* MOBILE STICKY FOOTER CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 border-t z-30"
        style={{
          background: dark ? "rgba(17,24,39,0.95)" : "rgba(255,255,255,0.95)",
          borderColor: dark ? "rgba(55,65,81,0.3)" : "rgba(0,0,0,0.05)",
          backdropFilter: "blur(12px)",
        }}>
        <button
          onClick={() => navigate("/auth?mode=signup")}
          className="w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2"
          style={{ background: COLORS.AMBER }}
        >
          Start Free Trial
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Padding for mobile footer */}
      <div className="md:hidden h-20" />

      {/* DEMO MODAL */}
      {demoOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDemoOpen(false)}>
          <div
            className="rounded-2xl p-6 max-w-md w-full"
            style={{ background: dark ? "rgba(30,41,59,1)" : "rgba(255,255,255,1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: COLORS.NAVY }}>Request Demo</h2>
            <form onSubmit={submitDemo} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={demoForm.name}
                onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border outline-none"
                style={{
                  borderColor: `${COLORS.NAVY}15`,
                  background: dark ? "rgba(55,65,81,0.5)" : "#F3F4F6",
                }}
              />
              <input
                type="email"
                placeholder="Your email"
                value={demoForm.email}
                onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border outline-none"
                style={{
                  borderColor: `${COLORS.NAVY}15`,
                  background: dark ? "rgba(55,65,81,0.5)" : "#F3F4F6",
                }}
              />
              <input
                type="text"
                placeholder="School name"
                value={demoForm.schoolName}
                onChange={(e) => setDemoForm({ ...demoForm, schoolName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border outline-none"
                style={{
                  borderColor: `${COLORS.NAVY}15`,
                  background: dark ? "rgba(55,65,81,0.5)" : "#F3F4F6",
                }}
              />
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setDemoOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{ borderColor: `${COLORS.NAVY}15`, color: COLORS.NAVY }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex-1 px-4 py-2 rounded-lg font-bold text-white"
                  style={{ background: COLORS.AMBER, opacity: sending ? 0.7 : 1 }}
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
