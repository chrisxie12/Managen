import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ArrowRight, BookOpen, BarChart3, MessageSquare,
  CheckCircle2, GraduationCap, Wallet, Bell, Menu, X,
  Zap, Clock, Award, XCircle, Send, Building2, Loader2,
  ChevronDown, Mail, MapPin, Globe, Phone, Sun, Moon,
} from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";
import { SadexLogo } from '../components/SadexLogo';
import { RoiCalculator } from './public/components/RoiCalculator';
import { EducationBackground } from '../components/ui/education-background';
import heroImg from '../../assets/hero.png';
import appLogo from '../../assets/app-logo.png';

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const NAVY_DARK = "#0C1A3A";
const AMBER = "#FFBA08";
const AMBER_LIGHT = "#FFF8E1";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";
const CHARCOAL = "#1a1a2e";

const pricingPlans = [
  { name: "Free Trial", tagline: "Get started with no commitment", price: "Free", period: " / 7-day trial", features: ["Up to 50 students", "Attendance & fee tracking", "Basic reports", "Email support", "No credit card required"], cta: "Start Free Trial", highlighted: false },
  { name: "Growth", tagline: "For growing schools and mid-size institutions", price: "GHS 499", priceAnnual: "GHS 399", annualBilled: "GHS 4,788/yr", period: "/ month", features: ["Up to 300 students", "Fee tracking & invoicing", "Exams & admissions", "WhatsApp reports", "Priority support"], cta: "Get Started", highlighted: true },
  { name: "Pro", tagline: "For large institutions and college prep", price: "GHS 999", priceAnnual: "GHS 799", annualBilled: "GHS 9,588/yr", period: "/ month", features: ["Up to 800 students", "Library, hostel & transport modules", "Payroll management", "Unlimited WhatsApp reports", "All integrations"], cta: "Get Started", highlighted: false },
  { name: "Enterprise", tagline: "For school groups and districts", price: "Custom", period: "", features: ["Unlimited students", "All modules included", "Custom branding & domain", "Dedicated account manager", "API access"], cta: "Contact Sales", highlighted: false },
];

const faqs = [
  { q: "Is there really no credit card required for the free trial?", a: "Correct. The 7-day Free Trial gives you full access to the platform with no payment details required. You only provide billing information when you choose to upgrade to a paid plan." },
  { q: "What happens when my free trial ends?", a: "Your account is paused - no data is deleted. You can upgrade to Growth, Pro, or Enterprise at any time to reactivate. We'll send you reminders before and after the trial ends." },
  { q: "Can I switch plans later?", a: "Yes. You can upgrade or downgrade your plan at any time from your school dashboard. Changes take effect at the start of your next billing cycle." },
  { q: "Does Managen support the Ghanaian curriculum?", a: "Yes. Managen is built specifically for Ghanaian schools and fully supports the local curriculum including WAEC and BECE structures. Pricing is displayed in GHS." },
  { q: "How does the WhatsApp reporting work?", a: "Managen integrates directly with WhatsApp Business API to send automated reports - attendance summaries, fee reminders, and exam results - to parents and staff without any manual effort from administrators." },
  { q: "Is our school's data secure?", a: "Yes. All data is encrypted in transit and at rest. Each school operates in its own isolated environment - no school can access another school's data. We use Supabase (PostgreSQL) hosted on secure infrastructure with regular backups." },
  { q: "What is the student limit on each plan?", a: "Free Trial supports up to 50 students. Growth supports up to 300. Pro supports up to 800. Enterprise has no student limit. If you need a custom limit, contact us." },
  { q: "Can I get a live demo before committing?", a: "Absolutely. Click on Request Demo on this page and our team will schedule a personalised walkthrough of the platform for your school." },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [scrolled, setScrolled] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<{ schools: number | null }>({ schools: null });
  const [demoForm, setDemoForm] = useState({ name: "", email: "", schoolName: "", country: "Ghana" });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const statsRef = useRef<HTMLDivElement>(null);
  const [countSchools, setCountSchools] = useState(0);
  const [countUptime, setCountUptime] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      if (window.scrollY > 50 && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [mobileOpen]);

  useEffect(() => {
    api.get<{ totalSchools: number }>("/api/superadmin/stats")
      .then((res) => {
        if (res.data) setStats({ schools: res.data.totalSchools });
      })
      .catch(() => {});
  }, []);

  // Scroll animations now handled by motion's whileInView

  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const animateCount = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    target: number,
    duration: number
  ) => {
    if (target <= 5) {
      setter(target);
      return;
    }
    const start = performance.now();
    const raf = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setter(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  };

  useEffect(() => {
    if (!statsVisible) return;
    animateCount(setCountUptime, 997, 2000);
  }, [statsVisible]);

  useEffect(() => {
    if (statsVisible && stats.schools !== null && countSchools === 0) {
      animateCount(setCountSchools, stats.schools, 1500);
    }
  }, [statsVisible, stats.schools]);

  const submitDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.name || !demoForm.email || !demoForm.schoolName) return toast.error("Please fill in all fields");
    setSending(true);
    try {
      await api.post("/api/onboard/demo-request", demoForm);
      toast.success("Demo request sent! We'll be in touch soon.");
      setDemoOpen(false);
      setDemoForm({ name: "", email: "", schoolName: "", country: "Ghana" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  };



  const schoolTypes = [
    { icon: GraduationCap, title: "Primary Schools", desc: "Manage KG through Primary 6 with simple attendance, fee collection, and parent WhatsApp updates.", pills: ["Attendance", "Fees", "WhatsApp"], example: "Sunshine Primary, Accra", example2: "Little Stars Academy, Kumasi", gradient: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` },
    { icon: BookOpen, title: "JHS & SHS", desc: "Handle BECE and WASSCE preparation, exam scheduling, result management, and payroll for larger teaching staff.", pills: ["Exams", "Results", "Payroll"], example: "Accra Academy, Mfantsipim School", gradient: `linear-gradient(135deg, ${NAVY_LIGHT}, ${NAVY})` },
    { icon: Globe, title: "International Schools", desc: "Multi-currency fees, custom branding, and advanced analytics for premium institutions with higher expectations.", pills: ["Multi-currency", "Branding", "Analytics"], example: "Ghana International School, Lincoln Community School", gradient: `linear-gradient(135deg, ${NAVY}, #0C1A3A)` },
    { icon: Building2, title: "School Groups & Districts", desc: "One superadmin dashboard for multiple campuses. Each school keeps its own isolated data, subdomain, and branding.", pills: ["Multi-campus", "Superadmin", "Isolation"], example: "Adeyemi Group of Schools, Sapphire Education Group", gradient: `linear-gradient(135deg, ${CHARCOAL}, ${NAVY_DARK})` },
  ];

  return (
    <>
      <EducationBackground />
      <div style={{ fontFamily: "'DM Sans', sans-serif" }} className={`min-h-screen transition-colors duration-300 relative z-0 ${dark ? 'bg-gray-950 text-gray-100' : 'bg-transparent text-[#0A2472]'}`}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
        @keyframes iconFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .modal-overlay { animation: fadeIn 0.2s ease-out; }
        .modal-content { animation: fadeUp 0.3s ease-out; }
        .hero-icon { animation: iconFloat 3s ease-in-out infinite; }
        .hero-dot {
          background-image: radial-gradient(circle, #0A2472 1px, transparent 1px);
          background-size: 24px 24px;
          opacity: 0.04;
        }
        .card-amber-border { border-color: #E5E7EB; }
        .card-amber-border:hover { border-color: #FFBA08 !important; }
        .hover-amber { transition: color 0.2s ease; }
        .hover-amber:hover { color: #FFBA08 !important; }
        .amber-focus-ring:focus-visible { outline: none; box-shadow: 0 0 0 3px rgba(255,186,8,0.4); }
        .dark [style*="color: #0A2472"] { color: #e5e7eb !important; }
        .dark [style*="color: #0C2D8A"] { color: #d1d5db !important; }
        .dark [style*="color: #6B7280"] { color: #9ca3af !important; }
        .dark .hero-dot { opacity: 0.06; }
        .dark .modal-content { background: #1f2937 !important; }
        .dark .card-amber-border { border-color: #374151 !important; }
        .dark .card-amber-border:hover { border-color: #FFBA08 !important; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: dark ? (scrolled ? "rgba(17,24,39,0.95)" : "rgba(17,24,39,0.5)") : (scrolled ? "white" : "rgba(248,249,250,0.5)"),
          backdropFilter: "blur(20px)",
          borderBottom: dark ? (scrolled ? "1px solid rgba(55,65,81,0.5)" : "1px solid transparent") : (scrolled ? "1px solid rgba(10,36,114,0.08)" : "1px solid transparent"),
          boxShadow: scrolled ? (dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(10,36,114,0.06)") : "none",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <img src={appLogo} alt="Managen" className="w-9 h-9 rounded-xl object-cover" />
            <span style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: "1.25rem", fontWeight: 700 }}>Managen</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "School Types", href: "#school-types" }, { label: "FAQ", href: "#faq" }, { label: "Contact", href: "#contact" }].map((item) => (
              <a key={item.label} href={item.href} style={{ color: NAVY_LIGHT, fontSize: "0.95rem" }} className="hover:opacity-70 transition-opacity">{item.label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:opacity-70 transition-opacity" style={{ color: NAVY }} title="Toggle theme">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => navigate("/auth")} style={{ color: NAVY, fontSize: "0.9rem" }} className="px-4 py-2 hover:opacity-70">Sign in</button>
            <button onClick={() => navigate("/auth?mode=signup")} className="px-5 py-2.5 rounded-full text-sm flex items-center gap-2 active:scale-95 transition-transform font-semibold" style={{ background: AMBER, color: NAVY, boxShadow: "0 4px 14px rgba(255,186,8,0.3)" }}>
              Start Free <ArrowRight size={14} />
            </button>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" style={{ color: NAVY }}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-96" : "max-h-0"}`}>
          <div className="px-6 pb-6 flex flex-col gap-4" style={{ borderTop: "1px solid rgba(10,36,114,0.07)" }}>
            {[{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "School Types", href: "#school-types" }, { label: "FAQ", href: "#faq" }, { label: "Contact", href: "#contact" }].map((item) => (
              <a key={item.label} href={item.href} style={{ color: NAVY_LIGHT }} onClick={() => setMobileOpen(false)}>{item.label}</a>
            ))}
            <button onClick={() => navigate("/auth")} style={{ color: NAVY }} className="text-left">Sign in</button>
            <button onClick={() => navigate("/auth?mode=signup")} className="px-5 py-2.5 rounded-full text-sm font-semibold active:scale-95 w-fit" style={{ background: AMBER, color: NAVY }}>Start Free Trial</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-white">
        <div className="hero-dot absolute inset-0 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-6" style={{ background: AMBER_LIGHT, color: NAVY }}>
                  &#x1F1EC;&#x1F1ED; Built for Ghanaian Schools
                </div>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold leading-tight"
                style={{ color: NAVY }}
              >
                The All-in-One School Management<br />System Built for Ghana
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="mt-4 max-w-lg"
                style={{ fontSize: "1.1rem", lineHeight: 1.75, color: "#6B7280" }}
              >
                From attendance and fees to exams and WhatsApp reports -- Managen puts everything in one place. No spreadsheets. No chaos. Trusted by 50+ schools across Ghana.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
              >
                <button onClick={() => navigate("/auth?mode=signup")} className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform w-full sm:w-auto" style={{ background: AMBER, color: NAVY, boxShadow: "0 4px 14px rgba(255,186,8,0.3)" }}>
                  Start Free Trial <ArrowRight size={16} />
                </button>
                <button onClick={() => setDemoOpen(true)} className="px-6 py-3 rounded-xl font-semibold active:scale-95 transition-transform w-full sm:w-auto flex items-center justify-center" style={{ background: "white", border: `1.5px solid ${NAVY}`, color: NAVY }}>
                  Request Demo
                </button>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
                className="text-sm mt-4"
                style={{ color: "#9CA3AF" }}
              >
                &#x2713; No credit card required  &#x2713; 7-day free trial  &#x2713; Setup in 10 minutes
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
                className="mt-8 flex items-center flex-wrap gap-2"
              >
                <span className="text-xs mr-1" style={{ color: "#9CA3AF" }}>Works with</span>
                {["WAEC", "BECE", "Paystack", "WhatsApp"].map((name) => (
                  <span key={name} className="rounded-full bg-white border px-3 py-1 text-xs shadow-sm" style={{ borderColor: "#E5E7EB", color: "#6B7280" }}>{name}</span>
                ))}
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ height: '480px' }}>
                <img
                  src={heroImg}
                  alt="Students in a Ghanaian classroom"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 rounded-2xl"
                  style={{ background:
                    'linear-gradient(135deg, rgba(10,36,114,0.15) 0%, rgba(0,0,0,0.05) 100%)'
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SCHOOL EMBLEM MARQUEE */}
      <section className="overflow-hidden py-6" style={{ background: "#F9FAFB", borderTop: "2px solid #FFBA08", borderBottom: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex items-center gap-12 shrink-0">
              {["Sunshine Primary", "Accra Academy", "Cape Coast Scholars", "Kumasi Prep", "Sapphire Group", "Lincoln Community", "Mfantsipim School", "Darkwa Education", "Ridge Church", "Faith Montessori"].map((name) => (
                <div key={`${setIdx}-${name}`} className="flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: AMBER_LIGHT, color: NAVY }}>
                    {name[0]}
                  </div>
                  <span className="text-sm font-medium" style={{ color: NAVY }}>{name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 bg-white border-y" style={{ borderColor: "#F3F4F6" }} ref={statsRef}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold" style={{ color: NAVY }}>Trusted by Schools Across Ghana</h2>
          </motion.div>
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            <motion.div
              className="rounded-2xl p-4 sm:p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0 }}
              style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 4px 24px rgba(10,36,114,0.06)" }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ background: AMBER_LIGHT }}>
                <GraduationCap size={20} color={AMBER} />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl" style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontWeight: 700 }}>
                {stats.schools === null ? (
                  <span style={{ animation: "pulse 1.5s ease-in-out infinite", opacity: 0.5 }}>--</span>
                ) : (
                  `${countSchools}+`
                )}
              </div>
              <div className="text-sm sm:text-base" style={{ color: MUTED }}>Schools Active Across Ghana</div>
            </motion.div>
            <motion.div
              className="rounded-2xl p-4 sm:p-6 md:p-8 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              style={{ background: "white", border: "1px solid #E5E7EB", boxShadow: "0 4px 24px rgba(10,36,114,0.06)" }}
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4" style={{ background: AMBER_LIGHT }}>
                <Clock size={20} color={AMBER} />
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl" style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontWeight: 700 }}>{(countUptime / 10).toFixed(1)}%</div>
              <div className="text-sm sm:text-base" style={{ color: MUTED }}>Guaranteed Uptime</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW MANAGEN WORKS */}
      <section className="py-24 px-6" style={{ background: "#F3F4F6" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-4" style={{ background: AMBER_LIGHT, color: NAVY }}>
              Simple by design
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: NAVY }}>How Managen Works</h2>
            <p className="mt-3 max-w-2xl mx-auto" style={{ color: "#6B7280" }}>
              Set up your school, track everything, and get insights -- all in one place.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 relative">
            <div className="hidden md:block absolute top-1/3 left-[16.67%] right-[16.67%] h-0.5" style={{ background: AMBER, opacity: 0.3 }} />
            {[
              {
                num: "01", icon: Zap, title: "Set up your school in minutes",
                desc: "Add your students, teachers, classes, and fee structures. Import existing data or start fresh -- Managen guides you through every step.",
                items: ["Add unlimited classes and subjects", "Import student data via CSV", "Set custom fee structures per class", "Invite staff with role-based access"]
              },
              {
                num: "02", icon: BarChart3, title: "Track attendance, fees, and exams daily",
                desc: "Mark attendance in seconds, collect fee payments, schedule exams, and manage results -- all from one dashboard your staff will actually use.",
                items: ["One-tap daily attendance marking", "Automated fee reminders via WhatsApp", "Exam scheduling and result entry", "Payroll and staff management"]
              },
              {
                num: "03", icon: MessageSquare, title: "Get insights and reports automatically",
                desc: "Managen generates attendance summaries, fee collection reports, and exam results -- then sends them directly to parents via WhatsApp. No manual work required.",
                items: ["WhatsApp reports sent to parents automatically", "Term-end report card generation", "Fee collection analytics", "Multi-school performance overview"]
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                className="rounded-2xl overflow-hidden bg-white border hover:shadow-lg transition-all duration-300 group relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                style={{ borderColor: "#E5E7EB" }}
              >
                <div className="h-36 relative flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)` }}>
                  <span className="absolute select-none font-bold leading-none" style={{ fontSize: "8rem", color: "white", opacity: 0.08, top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>{step.num}</span>
                  <div className="w-16 h-16 rounded-xl flex items-center justify-center relative z-10" style={{ background: AMBER }}>
                    <step.icon size={28} className="text-white group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <div className="p-6 lg:p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: AMBER, color: NAVY }}>{step.num}</div>
                    <span className="text-xs font-semibold" style={{ color: MUTED }}>Step {step.num}</span>
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold mb-2" style={{ color: NAVY }}>{step.title}</h3>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: "#6B7280" }}>{step.desc}</p>
                  <div className="space-y-2">
                    {step.items.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <CheckCircle2 size={15} className="text-green-500 shrink-0 mt-0.5" />
                        <span className="text-sm" style={{ color: "#4B5563" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section id="features" className="py-24 px-6" style={{ background: "white" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-4" style={{ background: AMBER_LIGHT, color: NAVY }}>
              Everything your school needs
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: NAVY }}>Built for how African schools actually work</h2>
            <p className="mt-3 max-w-2xl mx-auto" style={{ color: "#6B7280" }}>
              Not adapted from software made elsewhere. Every feature designed for Ghanaian classrooms.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: NaCCA Compliance Core (2 cols) */}
            <motion.div
              className="md:col-span-2 rounded-2xl border bg-white p-4 sm:p-5 md:p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden card-amber-border"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: AMBER_LIGHT, color: NAVY }}>
                    <Award className="size-3" /> NaCCA Compliant
                  </span>
                  <h3 className="mt-3 text-xl font-bold tracking-tight" style={{ color: NAVY }}>Continuous Assessment Core</h3>
                  <p className="mt-1 text-sm text-slate-500">Automated grade computation, competency bands, and terminal report cards aligned to Ghana's NaCCA standards.</p>
                </div>
              </div>
              {/* Mini Structural Mockup */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${NAVY}12`, color: NAVY }}>KM</div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: NAVY }}>Kofi Mensah</div>
                    <div className="text-xs text-slate-400">JHS 2 · Mathematics</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {[
                    { label: "Quiz 1", score: "18/20", pct: 90 },
                    { label: "Mid-Term", score: "42/50", pct: 84 },
                    { label: "Project", score: "27/30", pct: 90 },
                    { label: "Exam", score: "68/80", pct: 85 },
                  ].map((a) => (
                    <div key={a.label} className="rounded-lg bg-white border border-slate-100 p-1.5 sm:p-2.5 text-center">
                      <div className="text-xs text-slate-400 mb-1">{a.label}</div>
                      <div className="text-sm font-bold tabular-nums" style={{ color: NAVY }}>{a.score}</div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white border border-slate-100 px-4 py-2.5">
                  <span className="text-xs font-medium text-slate-500">Final Grade</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: AMBER_LIGHT, color: NAVY }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: AMBER }} />
                    EE — Exceeding Expectations
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Instant MoMo Rails (1 col) */}
            <motion.div
              className="rounded-2xl border bg-white p-4 sm:p-5 md:p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col card-amber-border"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold w-fit" style={{ background: AMBER_LIGHT, color: NAVY }}>
                <Wallet className="size-3" /> Payments
              </span>
              <h3 className="mt-3 text-xl font-bold tracking-tight" style={{ color: NAVY }}>Instant MoMo Rails</h3>
              <p className="mt-1 text-sm text-slate-500 mb-5">Real-time mobile money collections with automatic receipt generation.</p>
              {/* Notification Bubble Simulation */}
              <div className="mt-auto space-y-3">
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 animate-pulse" style={{ animationDuration: "3s" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <Bell className="size-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-amber-800">Payment Received</div>
                      <div className="text-sm font-bold text-amber-900 mt-0.5">GHS 1,200.00</div>
                      <div className="text-xs text-amber-600 mt-0.5">MTN MoMo · Class Fee · JHS 2</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Today's Collections</span>
                    <span className="text-sm font-bold tabular-nums" style={{ color: NAVY }}>GHS 24,800</span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: "78%" }} />
                  </div>
                  <div className="mt-1 text-xs text-slate-400 text-right">78% of daily target</div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Arkesel Automated SMS (1 col) */}
            <motion.div
              className="rounded-2xl border bg-white p-4 sm:p-5 md:p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col card-amber-border"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold w-fit" style={{ background: AMBER_LIGHT, color: NAVY }}>
                <MessageSquare className="size-3" /> Communications
              </span>
              <h3 className="mt-3 text-xl font-bold tracking-tight" style={{ color: NAVY }}>Arkesel Automated SMS</h3>
              <p className="mt-1 text-sm text-slate-500 mb-5">Zero-effort parent notifications for fees, attendance, and emergencies.</p>
              {/* SMS Screen Mockup */}
              <div className="mt-auto rounded-xl border border-slate-100 bg-slate-50/60 overflow-hidden">
                <div className="px-4 py-2.5 text-xs font-semibold text-slate-400 border-b border-slate-100" style={{ background: "white" }}>
                  Automated Alerts Queue
                </div>
                <div className="p-3 space-y-2">
                  {[
                    { to: "Mrs. Asante", msg: "Balance alert: GHS 450.00 outstanding for Kofi M.", status: "sent" },
                    { to: "Mr. Boateng", msg: "Attendance: Ama was absent today.", status: "sent" },
                    { to: "Ms. Serwaa", msg: "Term report card is ready for download.", status: "queued" },
                  ].map((sms, i) => (
                    <div key={i} className="rounded-lg bg-white border border-slate-100 p-2.5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold" style={{ color: NAVY }}>→ {sms.to}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${sms.status === "sent" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                          {sms.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">{sms.msg}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 4: ROI Calculator (2 cols) */}
            <motion.div
              className="md:col-span-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <RoiCalculator />
            </motion.div>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="rounded-2xl sm:rounded-[48px] overflow-hidden relative p-5 sm:p-8 lg:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`, boxShadow: "0 24px 80px rgba(10,36,114,0.25)" }}
          >
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-sm uppercase tracking-widest mb-4" style={{ color: "rgba(248,249,250,0.6)" }}>Live Dashboard</p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: CREAM, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem" }}>
                  A Command Center for Your Institution
                </h2>
                <p style={{ color: "rgba(248,249,250,0.75)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                  Get instant visibility into every corner of your school -- fee collection, attendance rates, pending exam results -- all from a single bento dashboard.
                </p>
                <button onClick={() => setDemoOpen(true)} className="px-6 py-3 rounded-full flex items-center gap-2 active:scale-95 transition-transform font-bold" style={{ background: AMBER, color: NAVY, fontSize: "0.95rem" }}>
                  See It In Action <ArrowRight size={16} />
                </button>
              </motion.div>
              <motion.div
                className="grid grid-cols-2 gap-3"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {[
                  { label: "Schools Managed", value: stats.schools ? `${stats.schools}` : "--", icon: Building2, color: "#6366F1" },
                  { label: "Automated Tasks", value: "Track fees, grades, attendance", icon: Zap, color: "#10B981" },
                  { label: "Avg Attendance", value: "94%+", icon: Clock, color: "#F59E0B" },
                  { label: "Reports Generated", value: "Automated", icon: Bell, color: "#EC4899" },
                ].map((card) => (
                  <div key={card.label} className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${card.color}25` }}>
                      <card.icon size={16} color={card.color} />
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", color: CREAM, fontSize: "1.1rem", fontWeight: 600 }}>{card.value}</div>
                    <div style={{ color: "rgba(248,249,250,0.6)", fontSize: "0.75rem" }}>{card.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SCHOOL TYPES */}
      <section id="school-types" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-4" style={{ background: AMBER_LIGHT, color: NAVY }}>
              Trusted by schools across Africa
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: NAVY }}>Built for every type of school</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Whether you run a single classroom or a network of campuses, Managen scales with you.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolTypes.map((s, i) => (
              <motion.div
                key={s.title}
                className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="h-36 overflow-hidden relative flex items-center justify-center"
                  style={{ background: s.gradient }}>
                  <s.icon size={56} className="text-white opacity-30" />
                </div>
                <div className="p-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 -mt-8 relative z-10 shadow-md border-2 border-white" style={{ background: AMBER_LIGHT }}>
                    <s.icon size={24} style={{ color: NAVY }} />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: NAVY }}>{s.title}</h3>
                  <p className="text-sm mb-4" style={{ color: MUTED, lineHeight: 1.6 }}>{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {s.pills.map((pill) => (
                      <span key={pill} className="text-xs rounded-full px-2 py-0.5" style={{ background: AMBER_LIGHT, color: NAVY }}>{pill}</span>
                    ))}
                  </div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>
                    <p>{s.example}</p>
                    {s.example2 && <p>{s.example2}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="mt-12 py-8 bg-gray-50 rounded-2xl flex justify-center items-center gap-4 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-sm text-gray-500">Join schools across Ghana managing their institutions with Managen</span>
            <button onClick={() => navigate("/auth?mode=signup")} className="text-sm font-bold flex items-center gap-1 px-4 py-2 rounded-full" style={{ background: AMBER, color: NAVY }}>
              Start Free Trial <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-24 px-6" style={{ background: NAVY_DARK }}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
              style={{ background: 'rgba(255,186,8,0.15)', color: AMBER }}>
              Growing fast
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-white">
              Join schools across Ghana transforming their operations
            </h2>
            <p className="mt-3 max-w-2xl mx-auto" style={{ color: 'rgba(248,249,250,0.65)' }}>
              From primary schools to large school groups, Managen is the platform Ghanaian educators trust.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {[
              { icon: GraduationCap, count: "12+", label: "Primary Schools" },
              { icon: BookOpen, count: "18+", label: "JHS & SHS" },
              { icon: Globe, count: "5+", label: "International Schools" },
              { icon: Building2, count: "3+", label: "School Groups" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                className="rounded-2xl p-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  background: '#0C1A3A',
                  border: '1px solid rgba(255,186,8,0.2)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
                }}
              >
                <item.icon size={32} className="mx-auto mb-3" style={{ color: AMBER }} />
                <div style={{ fontFamily: "'Playfair Display', serif", color: AMBER, fontSize: "2rem", fontWeight: 700 }}>{item.count}</div>
                <div style={{ color: 'rgba(248,249,250,0.6)', fontSize: "0.85rem" }}>{item.label}</div>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <button onClick={() => navigate("/auth?mode=signup")} className="px-8 py-4 rounded-full font-bold active:scale-95 transition-transform" style={{ background: AMBER, color: NAVY, fontSize: "1rem", boxShadow: "0 8px 24px rgba(255,186,8,0.3)" }}>
              Join Them -- Start Free Trial <ArrowRight size={16} className="inline ml-1" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6" style={{ background: "#F9FAFB" }}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-4" style={{ background: AMBER_LIGHT, color: NAVY }}>
              Simple, transparent pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: NAVY }}>Plans that grow with your school</h2>
            <p className="mt-3" style={{ color: "#6B7280" }}>Start free. Upgrade when you're ready.</p>
          </motion.div>
          <div className="flex justify-center mb-12">
            <div className="flex rounded-full p-1" style={{ background: "white", border: "1px solid #E5E7EB" }}>
              {(["monthly", "annual"] as const).map((b) => (
                <button key={b} onClick={() => setBilling(b)} className="px-5 py-2 rounded-full text-sm transition-all active:scale-95 font-semibold" style={{ background: billing === b ? AMBER : "transparent", color: billing === b ? NAVY : MUTED }}>{b}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, i) => {
              const isAnnual = billing === "annual";
              const showSaveBadge = isAnnual && (plan.name === "Growth" || plan.name === "Pro");
              const displayPrice = isAnnual && (plan as any).priceAnnual ? (plan as any).priceAnnual : plan.price;
              const billedText = isAnnual ? (plan as any).annualBilled || "" : "";
              const isFree = plan.price === "Free";
              const isCustom = plan.price === "Custom";
              return (
              <motion.div
                key={plan.name}
                className="p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  background: "white",
                  border: plan.highlighted ? `2px solid ${AMBER}` : "1px solid #E5E7EB",
                  boxShadow: plan.highlighted ? `0 24px 60px rgba(255,186,8,0.15)` : "0 4px 24px rgba(10,36,114,0.06)",
                }}
              >
                {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold" style={{ background: AMBER, color: NAVY }}>Most Popular</div>}
                {showSaveBadge && <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "#10B981", color: "white" }}>Save 20%</div>}
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.3rem" }}>{plan.name}</h3>
                <p style={{ color: MUTED, fontSize: "0.85rem", marginBottom: "1.5rem" }}>{plan.tagline}</p>
                <div className="mb-6">
                  {!isFree && !isCustom && <span style={{ color: AMBER, fontSize: "0.9rem", fontWeight: 600, verticalAlign: "super" }}>GHS </span>}
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: NAVY, fontSize: "2.2rem", fontWeight: 700 }}>{displayPrice}</span>
                  <span style={{ color: MUTED, fontSize: "0.85rem" }}>{plan.period}</span>
                  {billedText && <div style={{ color: MUTED, fontSize: "0.7rem", marginTop: "0.15rem" }}>Billed as {billedText}</div>}
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <CheckCircle2 size={15} color={plan.highlighted ? AMBER : "#10B981"} fill={plan.highlighted ? `${AMBER}30` : "#D1FAE5"} />
                      <span style={{ color: plan.highlighted ? NAVY : NAVY_LIGHT, fontSize: "0.9rem" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/auth?mode=signup")} className="w-full py-3 rounded-full active:scale-95 transition-transform text-sm font-bold" style={{ background: plan.highlighted ? AMBER : NAVY, color: plan.highlighted ? NAVY : "white" }}>{plan.cta}</button>
              </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-[768px] mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold mb-4" style={{ background: AMBER_LIGHT, color: NAVY }}>
              Questions and answers
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, marginBottom: "0.5rem" }}>Frequently asked questions</h2>
            <p style={{ color: MUTED, fontSize: "0.9rem" }}>Everything you need to know before getting started</p>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <motion.div
                  key={i}
                  className="rounded-2xl overflow-hidden transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  style={{
                    background: isOpen ? AMBER_LIGHT : "white",
                    border: isOpen ? `1px solid ${AMBER}` : "1px solid #E5E7EB",
                    boxShadow: isOpen ? "0 4px 20px rgba(255,186,8,0.1)" : "0 2px 12px rgba(10,36,114,0.04)",
                    borderLeft: isOpen ? `4px solid ${AMBER}` : "4px solid transparent"
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left active:scale-[0.99] transition-transform"
                    style={{ color: NAVY }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.4, paddingRight: "1rem" }}>{faq.q}</span>
                    <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} style={{ color: isOpen ? AMBER : MUTED }} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
                    <div className="px-5 pb-5" style={{ color: MUTED, fontSize: "0.88rem", lineHeight: 1.7 }}>{faq.a}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-12 sm:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center py-12 sm:py-20 px-5 sm:px-8 rounded-2xl sm:rounded-[48px]"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            style={{ background: `linear-gradient(135deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`, boxShadow: "0 24px 80px rgba(10,36,114,0.3)" }}
          >
            <Award size={36} color="rgba(248,249,250,0.7)" className="mx-auto mb-5" />
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: CREAM, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem" }}>
              Your School Deserves Better Tools
            </h2>
            <p style={{ color: "rgba(248,249,250,0.7)", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto 1.5rem", lineHeight: 1.7 }}>
              Join schools across Ghana who have eliminated spreadsheets forever.
            </p>
            <button onClick={() => navigate("/auth?mode=signup")} className="px-10 py-4 rounded-full text-base font-bold active:scale-95 transition-transform" style={{ background: AMBER, color: NAVY, boxShadow: "0 8px 24px rgba(255,186,8,0.3)" }}>
              Get Started Free -- No Credit Card
            </button>
            <div className="mt-4">
              <button onClick={() => setDemoOpen(true)} className="text-sm underline" style={{ color: "rgba(248,249,250,0.8)" }}>
                Or request a free demo &rarr;
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="py-12 px-4 sm:px-6" style={{ background: CHARCOAL }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: AMBER }}>
                <GraduationCap size={15} color={NAVY} />
              </div>
              <span style={{ fontFamily: "'Playfair Display', serif", color: "white", fontWeight: 700 }}>Managen</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm hidden sm:inline" style={{ color: "#9CA3AF" }}>School management that actually works.</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: "#6B7280" }}>A Product of</span>
                <SadexLogo size={18} variant="dark" />
              </div>
            </div>
          </motion.div>
          <hr className="mb-8" style={{ borderColor: "rgba(255,255,255,0.08)" }} />
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <h4 className="font-semibold text-sm mb-4" style={{ color: "#9CA3AF" }}>Product</h4>
              <div className="flex flex-col gap-2.5">
                {[{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }].map((link) => (
                  <a key={link.label} href={link.href} className="text-sm transition-colors" style={{ color: "#D1D5DB" }} onMouseEnter={(e) => e.currentTarget.style.color = AMBER} onMouseLeave={(e) => e.currentTarget.style.color = "#D1D5DB"}>{link.label}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-4" style={{ color: "#9CA3AF" }}>Contact</h4>
              <div className="flex flex-col gap-3" style={{ color: "#D1D5DB" }}>
                {[
                  { icon: Mail, text: "support@getschoolos.me" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5">
                    <item.icon size={15} color={AMBER} className="flex-shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2.5 mt-2">
                  <MapPin size={15} color={AMBER} className="flex-shrink-0" />
                  <span className="text-sm">Accra, Ghana</span>
                </div>
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs mb-6" style={{ background: "rgba(255,186,8,0.15)", color: AMBER, border: "1px solid rgba(255,186,8,0.3)" }}>
                <Globe size={13} />
                Ghana
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>
                Built by SADEX Innovations.<br />
                Accra, Ghana.
              </p>
            </div>
          </motion.div>
          <motion.div
            className="mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5 }}
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="text-xs" style={{ color: "#6B7280" }}>&copy; 2026 Managen. All rights reserved.</span>
            <span className="text-xs" style={{ color: "#6B7280" }}>Made for African schools &#x1F30D;</span>
            <div className="flex gap-4 text-xs">
              <a href="/privacy" style={{ color: "#9CA3AF" }} className="hover-amber">Privacy Policy</a>
              <a href="/terms" style={{ color: "#9CA3AF" }} className="hover-amber">Terms of Service</a>
            </div>
          </motion.div>
        </div>
      </footer>

      {/* DEMO MODAL */}
      {demoOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 modal-overlay" style={{ background: "rgba(10,36,114,0.6)", backdropFilter: "blur(4px)" }} onClick={() => !sending && setDemoOpen(false)}>
          <div className="w-full max-w-md rounded-[32px] p-8 modal-content" style={{ background: "white", boxShadow: "0 32px 80px rgba(10,36,114,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: NAVY, fontWeight: 700, fontSize: "1.4rem" }}>Request a Demo</h2>
                <p style={{ color: MUTED, fontSize: "0.85rem" }}>See Managen in action</p>
              </div>
              <button onClick={() => !sending && setDemoOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70" style={{ background: "rgba(10,36,114,0.06)" }}>
                <XCircle size={16} color={MUTED} />
              </button>
            </div>
            <form onSubmit={submitDemo} className="flex flex-col gap-4">
              <div>
                <label style={{ color: NAVY_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Full Name</label>
                <input type="text" placeholder="e.g. Kwame Mensah" value={demoForm.name} onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }} required />
              </div>
              <div>
                <label style={{ color: NAVY_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Email</label>
                <input type="email" placeholder="admin@yourschool.edu" value={demoForm.email} onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }} required />
              </div>
              <div>
                <label style={{ color: NAVY_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>School Name</label>
                <input type="text" placeholder="e.g. Accra Ridge School" value={demoForm.schoolName} onChange={(e) => setDemoForm({ ...demoForm, schoolName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }} required />
              </div>
              <div>
                <label style={{ color: NAVY_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Country</label>
                <select value={demoForm.country} onChange={(e) => setDemoForm({ ...demoForm, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }}>
                  <option value="Ghana">Ghana</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" disabled={sending}
                className="w-full py-4 rounded-full flex items-center justify-center gap-2 mt-2 active:scale-95 transition-transform text-sm font-bold"
                style={{ background: sending ? "rgba(255,186,8,0.5)" : AMBER, color: NAVY, boxShadow: "0 8px 24px rgba(255,186,8,0.25)" }}>
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                {sending ? "Sending..." : "Send Demo Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
