import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight, BookOpen, BarChart3, MessageSquare, Users,
  CheckCircle2, GraduationCap, Wallet, Bell, Menu, X,
  Zap, Clock, Award, XCircle, Send, Building2, Loader2,
  ChevronDown, Mail, MapPin, Globe, Linkedin, Twitter,
  Facebook, Youtube, Phone, Sun, Moon,
} from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

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

const InitialsAvatar = ({ name, color }: { name: string; color: string }) => {
  const initials = name.replace(/^(Mr|Mrs|Ms|Dr|Prof)\.?\s+/i, "").split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div style={{ backgroundColor: color }} className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      {initials}
    </div>
  );
};

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
  const [openFeature, setOpenFeature] = useState<number | null>(null);
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");
  const statsRef = useRef<HTMLDivElement>(null);
  const [countSchools, setCountSchools] = useState(0);
  const [countUptime, setCountUptime] = useState(0);
  const [countCountry, setCountCountry] = useState(0);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
    animateCount(setCountCountry, 1, 800);
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

  const featureItems = [
    { icon: Users, title: "Student Management", desc: "Maintain complete student profiles including attendance history, academic records, fee payment history, and parent contact details. Support for up to 800 students on the Pro plan.", subFeatures: ["Detailed student profiles and history", "Class and subject assignment", "Parent portal and contact management"], iconColor: "text-blue-500", bgColor: "bg-blue-100" },
    { icon: Wallet, title: "Fee Tracking & Payments", desc: "Create custom fee structures per class, track payments, generate invoices, and send automated reminders via WhatsApp. Integrated with Paystack for seamless online collection.", subFeatures: ["Custom fee structures per class/term", "Paystack payment integration", "Automated overdue fee reminders"], iconColor: "text-green-500", bgColor: "bg-green-100" },
    { icon: BookOpen, title: "Exams & Academics", desc: "Schedule exams, enter results, generate report cards, and track academic performance over time. Supports WAEC and BECE result formats.", subFeatures: ["Exam scheduling and timetabling", "Result entry and grade computation", "WAEC/BECE-compatible report cards"], iconColor: "text-purple-500", bgColor: "bg-purple-100" },
    { icon: MessageSquare, title: "WhatsApp Reports", desc: "Send automated attendance summaries, fee reminders, exam results, and custom announcements directly to parents and staff via WhatsApp Business API - without any manual effort.", subFeatures: ["Daily attendance notifications to parents", "Fee payment receipts and reminders", "Term results and report card delivery"], iconColor: "text-green-600", bgColor: "bg-green-100" },
    { icon: BarChart3, title: "Analytics Dashboard", desc: "Track school performance with real-time dashboards showing attendance trends, fee collection rates, academic performance, and staff activity - all in one command center.", subFeatures: ["Real-time attendance and fee dashboards", "Term-over-term performance comparison", "Export reports to PDF and CSV"], iconColor: "text-amber-500", bgColor: "bg-amber-100" },
    { icon: Building2, title: "Multi-School Management", desc: "Manage multiple campuses or school branches from a single superadmin dashboard. Each school gets its own isolated environment with custom branding and subdomain.", subFeatures: ["Centralized superadmin dashboard", "Per-school isolation and data security", "Custom subdomain per school"], iconColor: "text-custom", bgColor: "bg-custom" },
  ];

  const schoolTypes = [
    { icon: GraduationCap, title: "Primary Schools", desc: "Manage KG through Primary 6 with simple attendance, fee collection, and parent WhatsApp updates.", pills: ["Attendance", "Fees", "WhatsApp"], pillBg: "bg-green-50", pillText: "text-green-700", example: "Sunshine Primary, Accra", example2: "Little Stars Academy, Kumasi", iconColor: "text-green-500", bgColor: "bg-green-100", photo: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=400&q=80" },
    { icon: BookOpen, title: "JHS & SHS", desc: "Handle BECE and WASSCE preparation, exam scheduling, result management, and payroll for larger teaching staff.", pills: ["Exams", "Results", "Payroll"], pillBg: "bg-blue-50", pillText: "text-blue-700", example: "Accra Academy, Mfantsipim School", iconColor: "text-blue-500", bgColor: "bg-blue-100", photo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80" },
    { icon: Globe, title: "International Schools", desc: "Multi-currency fees, custom branding, and advanced analytics for premium institutions with higher expectations.", pills: ["Multi-currency", "Branding", "Analytics"], pillBg: "bg-amber-50", pillText: "text-amber-700", example: "Ghana International School, Lincoln Community School", iconColor: "text-amber-500", bgColor: "bg-amber-100", photo: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80" },
    { icon: Building2, title: "School Groups & Districts", desc: "One superadmin dashboard for multiple campuses. Each school keeps its own isolated data, subdomain, and branding.", pills: ["Multi-campus", "Superadmin", "Isolation"], pillBg: "bg-purple-50", pillText: "text-purple-700", example: "Adeyemi Group of Schools, Sapphire Education Group", iconColor: "text-custom", bgColor: "bg-custom", photo: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80" },
  ];

  const testimonials = [
    { quote: "Managen replaced three different tools we were using. Fee collection alone saves us hours every week - and parents actually get their receipts on WhatsApp now.", name: "Mrs. Abena Asante", role: "Headmistress, Sunrise Academy", location: "Accra, Ghana", avatarColor: "#7C3AED" },
    { quote: "The WhatsApp reports changed everything. Parents used to call us constantly asking about fees. Now they get automatic updates and the calls stopped completely.", name: "Ms. Efua Mensah", role: "Administrator, Cape Coast Academy", location: "Cape Coast, Ghana", avatarColor: "#10B981" },
    { quote: "We tried two other platforms before Managen. Nothing came close. The fee tracking and WhatsApp reports alone justified the switch.", name: "Mr. Kofi Boateng", role: "Headmaster, Kumasi Prep School", location: "Kumasi, Ghana", avatarColor: "#0EA5E9" },
    { quote: "Running three campuses from one dashboard seemed impossible before Managen. Now it is just how we work.", name: "Mrs. Akosua Darkwa", role: "Director, Darkwa Group of Schools", location: "Takoradi, Ghana", avatarColor: "#F59E0B" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className={`min-h-screen transition-colors duration-300 ${dark ? 'bg-gray-950 text-gray-100' : 'bg-[#FFF3E6] text-[#381932]'}`}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .reveal { animation: fadeUp 0.6s ease-out both; }
        .reveal-1 { animation-delay: 0.1s; }
        .reveal-2 { animation-delay: 0.2s; }
        .reveal-3 { animation-delay: 0.3s; }
        .reveal-4 { animation-delay: 0.4s; }
        .reveal-5 { animation-delay: 0.5s; }
        .reveal-6 { animation-delay: 0.6s; }
        .modal-overlay { animation: fadeIn 0.2s ease-out; }
        .modal-content { animation: fadeUp 0.3s ease-out; }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .hero-gradient {
          background: linear-gradient(
            135deg,
            #FFF3E6,
            #f9e8f5,
            #FFF3E6,
            #f0e8ff,
            #FFF3E6
          );
          background-size: 400% 400%;
          animation: gradientShift 12s ease infinite;
        }
        .dark .bg-white { background: #1f2937 !important; }
        .dark .bg-gray-50 { background: #111827 !important; }
        .dark [style*="color: #381932"] { color: #e5e7eb !important; }
        .dark [style*="color: #512b4a"] { color: #d1d5db !important; }
        .dark [style*="color: #7D6077"] { color: #9ca3af !important; }
        .dark .text-gray-500 { color: #d1d5db !important; }
        .dark .text-gray-600 { color: #e5e7eb !important; }
        .dark .border-gray-100 { border-color: #374151 !important; }
        .dark .border-gray-200 { border-color: #4B5563 !important; }
      `}</style>

      {/* NAV */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: dark ? (scrolled ? "rgba(17,24,39,0.95)" : "rgba(17,24,39,0.5)") : (scrolled ? "white" : "rgba(255,243,230,0.5)"),
          backdropFilter: "blur(20px)",
          borderBottom: dark ? (scrolled ? "1px solid rgba(55,65,81,0.5)" : "1px solid transparent") : (scrolled ? "1px solid rgba(56,25,50,0.08)" : "1px solid transparent"),
          boxShadow: scrolled ? (dark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(56,25,50,0.06)") : "none",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
              <GraduationCap size={18} color={MILK} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontSize: "1.25rem", fontWeight: 700 }}>Managen</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "Testimonials", "FAQ", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ color: PLUM_LIGHT, fontSize: "0.95rem" }} className="hover:opacity-70 transition-opacity">{item}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => setDark(!dark)} className="p-2 rounded-full hover:opacity-70 transition-opacity" style={{ color: PLUM }} title="Toggle theme">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => navigate("/auth")} style={{ color: PLUM, fontSize: "0.9rem" }} className="px-4 py-2 hover:opacity-70">Sign in</button>
            <button onClick={() => navigate("/auth?mode=signup")} className="px-5 py-2.5 rounded-full text-sm flex items-center gap-2 active:scale-95 transition-transform" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK, boxShadow: "0 4px 14px rgba(56,25,50,0.3)" }}>
              Start Free <ArrowRight size={14} />
            </button>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden" style={{ color: PLUM }}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? "max-h-96" : "max-h-0"}`}>
          <div className="px-6 pb-6 flex flex-col gap-4" style={{ borderTop: "1px solid rgba(56,25,50,0.07)" }}>
            {["Features", "Pricing", "Testimonials", "FAQ", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{ color: PLUM_LIGHT }} onClick={() => setMobileOpen(false)}>{item}</a>
            ))}
            <button onClick={() => navigate("/auth")} style={{ color: PLUM }} className="text-left">Sign in</button>
            <button onClick={() => navigate("/auth?mode=signup")} className="px-5 py-2.5 rounded-full text-sm active:scale-95 w-fit" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>Start Free Trial</button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="pt-32 pb-20 px-6 hero-gradient">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="reveal reveal-1">
                <div className="inline-flex rounded-full border px-3 py-1 text-xs mb-6" style={{ borderColor: PLUM, color: PLUM }}>
                  &#x1F1EC;&#x1F1ED; Built for Ghanaian Schools
                </div>
              </div>
              <h1 className="reveal reveal-1 text-4xl md:text-6xl font-bold leading-tight" style={{ color: PLUM }}>
                Run Your Entire<br />School Smarter.
              </h1>
              <p className="reveal reveal-2 text-gray-600 max-w-lg mt-4" style={{ fontSize: "1.1rem", lineHeight: 1.75 }}>
                From attendance and fees to exams and WhatsApp reports -- Managen puts everything in one place. No spreadsheets. No chaos.
              </p>
              <div className="reveal reveal-3 mt-8 flex gap-4 flex-wrap">
                <button onClick={() => navigate("/auth?mode=signup")} className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 active:scale-95 transition-transform" style={{ background: PLUM, color: "white" }}>
                  Start Free Trial <ArrowRight size={16} />
                </button>
                <button onClick={() => setDemoOpen(true)} className="px-6 py-3 rounded-xl font-semibold active:scale-95 transition-transform" style={{ background: "white", border: `1.5px solid ${PLUM}`, color: PLUM }}>
                  Request Demo
                </button>
              </div>
              <p className="reveal reveal-4 text-sm text-gray-500 mt-4">
                &#x2713; No credit card required  &#x2713; 7-day free trial  &#x2713; Setup in 10 minutes
              </p>
              <div className="reveal reveal-5 mt-8 flex items-center flex-wrap gap-2">
                <span className="text-xs text-gray-400 mr-1">Works with</span>
                {["WAEC", "BECE", "Paystack", "WhatsApp"].map((name) => (
                  <span key={name} className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs text-gray-600 shadow-sm">{name}</span>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ height: '480px' }}>
                <img
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80"
                  alt="Students in a Ghanaian classroom"
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 rounded-2xl"
                  style={{ background:
                    'linear-gradient(135deg, rgba(56,25,50,0.15) 0%, rgba(0,0,0,0.05) 100%)'
                  }}
                />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg px-4 py-3">
                <p className="text-sm font-semibold" style={{ color: PLUM }}>&#x2713; GHS 24,800 fees collected this term</p>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-3">
                <p className="text-sm font-semibold text-green-600">&#x1F4C8; 94.2% attendance rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-14" style={{ background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)` }} ref={statsRef}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-8">
          <div className="text-center reveal reveal-1">
            <div style={{ fontFamily: "'Playfair Display', serif", color: MILK, fontSize: "2.2rem", fontWeight: 700 }}>
              {stats.schools === null ? (
                <span style={{ animation: "pulse 1.5s ease-in-out infinite", opacity: 0.5 }}>--</span>
              ) : (
                `${countSchools}+`
              )}
            </div>
            <div style={{ color: "rgba(255,243,230,0.65)", fontSize: "0.9rem" }}>Schools Active</div>
          </div>
          <div className="text-center reveal reveal-2">
            <div style={{ fontFamily: "'Playfair Display', serif", color: MILK, fontSize: "2.2rem", fontWeight: 700 }}>{(countUptime / 10).toFixed(1)}%</div>
            <div style={{ color: "rgba(255,243,230,0.65)", fontSize: "0.9rem" }}>Uptime SLA</div>
          </div>
          <div className="text-center reveal reveal-3">
            <div style={{ fontFamily: "'Playfair Display', serif", color: MILK, fontSize: "2.2rem", fontWeight: 700 }}>
              <div style={{ opacity: statsVisible ? 1 : 0, transition: "opacity 0.8s ease" }}>
                {countCountry}
              </div>
            </div>
            <div style={{ color: "rgba(255,243,230,0.65)", fontSize: "0.9rem" }}>Country Supported</div>
          </div>
        </div>
      </section>

      {/* HOW MANAGEN WORKS */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20" data-reveal>
            <div className="inline-flex rounded-full border px-3 py-1 text-xs mb-4" style={{ borderColor: PLUM, color: PLUM }}>
              Simple by design
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: PLUM }}>How Managen Works</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Set up your school, track everything, and get insights -- all in one place.
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-[31px] top-12 bottom-12 w-0.5 bg-gray-200 hidden lg:block" />

            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-8 mb-24 relative" data-reveal>
              <div className="flex-1 lg:pl-20">
                <span className="font-bold text-5xl opacity-20 block mb-2" style={{ color: PLUM }}>01</span>
                <h3 className="text-2xl font-bold" style={{ color: PLUM }}>Set up your school in minutes</h3>
                <p className="text-gray-500 mt-2 mb-4 max-w-lg">
                  Add your students, teachers, classes, and fee structures. Import existing data or start fresh -- Managen guides you through every step.
                </p>
                <div className="space-y-2">
                  {["Add unlimited classes and subjects", "Import student data via CSV", "Set custom fee structures per class", "Invite staff with role-based access"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 hidden lg:block">
                <div className="rounded-2xl bg-white border border-gray-100 shadow-md overflow-hidden">
                  <svg viewBox="0 0 480 300" className="w-full h-auto">
                    <rect x="0" y="0" width="480" height="300" rx="16" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                    <rect x="0" y="0" width="480" height="40" rx="16" ry="16" fill={PLUM} />
                    <text x="24" y="26" fill="white" fontSize="12" fontWeight="600">Add School Details</text>
                    <rect x="24" y="60" width="432" height="32" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
                    <text x="36" y="79" fill="#9CA3AF" fontSize="10">School name</text>
                    <rect x="24" y="104" width="432" height="32" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
                    <text x="36" y="123" fill="#9CA3AF" fontSize="10">Admin email</text>
                    <rect x="24" y="148" width="208" height="32" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
                    <text x="36" y="167" fill="#9CA3AF" fontSize="10">Country</text>
                    <rect x="248" y="148" width="208" height="32" rx="8" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
                    <text x="260" y="167" fill="#9CA3AF" fontSize="10">Phone</text>
                    <rect x="24" y="200" width="432" height="36" rx="10" fill={PLUM} />
                    <text x="240" y="222" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Save School</text>
                    <circle cx="100" cy="260" r="14" fill="#6366F1" opacity="0.2" />
                    <text x="100" y="264" textAnchor="middle" fill="#6366F1" fontSize="8" fontWeight="bold">AM</text>
                    <circle cx="134" cy="260" r="14" fill="#10B981" opacity="0.2" />
                    <text x="134" y="264" textAnchor="middle" fill="#10B981" fontSize="8" fontWeight="bold">KM</text>
                    <circle cx="168" cy="260" r="14" fill="#F59E0B" opacity="0.2" />
                    <text x="168" y="264" textAnchor="middle" fill="#F59E0B" fontSize="8" fontWeight="bold">EA</text>
                    <text x="196" y="264" fill="#9CA3AF" fontSize="9">+ 3 more added</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row-reverse items-center gap-8 mb-24 relative" data-reveal>
              <div className="flex-1 lg:pl-20">
                <span className="font-bold text-5xl opacity-20 block mb-2" style={{ color: PLUM }}>02</span>
                <h3 className="text-2xl font-bold" style={{ color: PLUM }}>Track attendance, fees, and exams daily</h3>
                <p className="text-gray-500 mt-2 mb-4 max-w-lg">
                  Mark attendance in seconds, collect fee payments, schedule exams, and manage results -- all from one dashboard your staff will actually use.
                </p>
                <div className="space-y-2">
                  {["One-tap daily attendance marking", "Automated fee reminders via WhatsApp", "Exam scheduling and result entry", "Payroll and staff management"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 hidden lg:block">
                <div className="rounded-2xl bg-white border border-gray-100 shadow-md overflow-hidden">
                  <svg viewBox="0 0 480 300" className="w-full h-auto">
                    <rect x="0" y="0" width="480" height="300" rx="16" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                    <rect x="0" y="0" width="480" height="36" rx="16" ry="16" fill={PLUM} />
                    <text x="24" y="23" fill="white" fontSize="11" fontWeight="600">Attendance * Week 12</text>
                    <text x="132" y="55" textAnchor="middle" fill="#6B7280" fontSize="10">Mon</text>
                    <text x="202" y="55" textAnchor="middle" fill="#6B7280" fontSize="10">Tue</text>
                    <text x="272" y="55" textAnchor="middle" fill="#6B7280" fontSize="10">Wed</text>
                    <text x="342" y="55" textAnchor="middle" fill="#6B7280" fontSize="10">Thu</text>
                    <text x="412" y="55" textAnchor="middle" fill="#6B7280" fontSize="10">Fri</text>
                    <text x="24" y="80" fill={PLUM} fontSize="9" fontWeight="500">Kwame Mensah</text>
                    <text x="132" y="80" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="202" y="80" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="272" y="80" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="342" y="80" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="412" y="80" textAnchor="middle" fill="#EF4444" fontSize="12">&#x2717;</text>
                    <text x="24" y="104" fill={PLUM} fontSize="9" fontWeight="500">Ama Serwaa</text>
                    <text x="132" y="104" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="202" y="104" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="272" y="104" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="342" y="104" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="412" y="104" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="24" y="128" fill={PLUM} fontSize="9" fontWeight="500">Yaw Asante</text>
                    <text x="132" y="128" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="202" y="128" textAnchor="middle" fill="#EF4444" fontSize="12">&#x2717;</text>
                    <text x="272" y="128" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="342" y="128" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="412" y="128" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="24" y="152" fill={PLUM} fontSize="9" fontWeight="500">Efua Mensah</text>
                    <text x="132" y="152" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="202" y="152" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="272" y="152" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="342" y="152" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="412" y="152" textAnchor="middle" fill="#10B981" fontSize="12">&#x2713;</text>
                    <text x="24" y="190" fill="#374151" fontSize="10" fontWeight="600">Fee Collection Progress</text>
                    <rect x="24" y="196" width="432" height="16" rx="8" fill="#E5E7EB" />
                    <rect x="24" y="196" width="302" height="16" rx="8" fill="#10B981" />
                    <text x="240" y="207" textAnchor="middle" fill="white" fontSize="8" fontWeight="600">GHS 8,400 / GHS 12,000</text>
                  </svg>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-8 relative" data-reveal>
              <div className="flex-1 lg:pl-20">
                <span className="font-bold text-5xl opacity-20 block mb-2" style={{ color: PLUM }}>03</span>
                <h3 className="text-2xl font-bold" style={{ color: PLUM }}>Get insights and reports automatically</h3>
                <p className="text-gray-500 mt-2 mb-4 max-w-lg">
                  Managen generates attendance summaries, fee collection reports, and exam results -- then sends them directly to parents via WhatsApp. No manual work required.
                </p>
                <div className="space-y-2">
                  {["WhatsApp reports sent to parents automatically", "Term-end report card generation", "Fee collection analytics", "Multi-school performance overview"].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 hidden lg:block">
                <div className="rounded-2xl bg-white border border-gray-100 shadow-md overflow-hidden">
                  <svg viewBox="0 0 480 300" className="w-full h-auto">
                    <rect x="0" y="0" width="480" height="300" rx="16" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                    <rect x="24" y="24" width="200" height="160" rx="16" fill="#25D366" />
                    <rect x="24" y="24" width="200" height="28" rx="16" ry="16" fill="#1DA851" />
                    <text x="40" y="42" fill="white" fontSize="9" fontWeight="600">WhatsApp Report</text>
                    <rect x="40" y="62" width="170" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
                    <rect x="40" y="74" width="140" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
                    <rect x="40" y="90" width="170" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
                    <rect x="40" y="102" width="100" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
                    <rect x="40" y="118" width="170" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
                    <rect x="40" y="130" width="120" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
                    <rect x="40" y="150" width="170" height="4" rx="2" fill="rgba(255,255,255,0.6)" />
                    <text x="124" y="170" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="7">Attendance Summary</text>
                    <text x="260" y="42" fill="#374151" fontSize="10" fontWeight="600">Weekly Attendance</text>
                    <rect x="264" y="50" width="192" height="200" rx="8" fill="#F9FAFB" />
                    <rect x="278" y="140" width="20" height="60" rx="3" fill={PLUM} opacity="0.15" />
                    <rect x="308" y="120" width="20" height="80" rx="3" fill={PLUM} opacity="0.25" />
                    <rect x="338" y="160" width="20" height="40" rx="3" fill={PLUM} opacity="0.15" />
                    <rect x="368" y="100" width="20" height="100" rx="3" fill="#10B981" />
                    <rect x="398" y="130" width="20" height="70" rx="3" fill={PLUM} opacity="0.25" />
                    <text x="288" y="220" textAnchor="middle" fill="#9CA3AF" fontSize="7">Mon</text>
                    <text x="318" y="220" textAnchor="middle" fill="#9CA3AF" fontSize="7">Tue</text>
                    <text x="348" y="220" textAnchor="middle" fill="#9CA3AF" fontSize="7">Wed</text>
                    <text x="378" y="220" textAnchor="middle" fill="#9CA3AF" fontSize="7">Thu</text>
                    <text x="408" y="220" textAnchor="middle" fill="#9CA3AF" fontSize="7">Fri</text>
                    <text x="264" y="256" fill="#10B981" fontSize="9" fontWeight="600">&uarr; +5.2% this week</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES ACCORDION */}
      <section id="features" className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" data-reveal>
            <div className="inline-flex rounded-full border px-3 py-1 text-xs mb-4" style={{ borderColor: PLUM, color: PLUM }}>
              Everything your school needs
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: PLUM }}>Everything your school needs</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Built for how African schools actually work -- not adapted from software made elsewhere.
            </p>
          </div>
          <div className="lg:grid lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-0" data-reveal>
              {featureItems.map((item, i) => (
                <div key={item.title} className="border-b border-gray-100">
                  <button
                    onClick={() => setOpenFeature(openFeature === i ? null : i)}
                    className="w-full flex items-center justify-between py-5 px-2 text-left active:scale-[0.99] transition-transform"
                    style={{ color: PLUM }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bgColor}`}>
                        <item.icon size={20} className={item.iconColor === "text-custom" ? "" : item.iconColor} style={item.iconColor === "text-custom" ? { color: PLUM } : {}} />
                      </div>
                      <span className="font-semibold text-sm" style={{ color: PLUM }}>{item.title}</span>
                    </div>
                    <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 ${openFeature === i ? "rotate-180" : ""}`} style={{ color: MUTED }} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFeature === i ? "max-h-96" : "max-h-0"}`}>
                    <div className="px-2 pb-5 space-y-3">
                      <p className="text-sm" style={{ color: MUTED, lineHeight: 1.7 }}>{item.desc}</p>
                      <div className="space-y-1.5">
                        {item.subFeatures.map((sf) => (
                          <div key={sf} className="flex items-center gap-2 text-sm" style={{ color: MUTED }}>
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PLUM }} />
                            {sf}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden lg:block sticky top-24" data-reveal>
              <div className="rounded-2xl bg-white border border-gray-100 shadow-md overflow-hidden">
                <svg viewBox="0 0 400 500" className="w-full h-auto">
                  <rect x="0" y="0" width="400" height="500" rx="16" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="1" />
                  <rect x="0" y="0" width="400" height="36" rx="16" ry="16" fill={PLUM} />
                  <text x="20" y="23" fill="white" fontSize="10" fontWeight="600">School Dashboard</text>
                  <rect x="16" y="48" width="116" height="56" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                  <rect x="16" y="48" width="4" height="20" rx="2" fill="#10B981" />
                  <text x="28" y="68" fill="#111827" fontSize="13" fontWeight="bold">247</text>
                  <text x="28" y="84" fill="#6B7280" fontSize="8">Students</text>
                  <rect x="142" y="48" width="116" height="56" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                  <rect x="142" y="48" width="4" height="20" rx="2" fill="#6366F1" />
                  <text x="154" y="68" fill="#111827" fontSize="13" fontWeight="bold">GHS 12.4K</text>
                  <text x="154" y="84" fill="#6B7280" fontSize="8">Fees</text>
                  <rect x="268" y="48" width="116" height="56" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                  <rect x="268" y="48" width="4" height="20" rx="2" fill="#F59E0B" />
                  <text x="280" y="68" fill="#111827" fontSize="13" fontWeight="bold">94.2%</text>
                  <text x="280" y="84" fill="#6B7280" fontSize="8">Attendance</text>
                  <rect x="16" y="116" width="368" height="140" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                  <text x="28" y="134" fill="#374151" fontSize="10" fontWeight="600">Monthly Performance</text>
                  <rect x="36" y="158" width="12" height="30" rx="2" fill={PLUM} opacity="0.15" />
                  <rect x="56" y="148" width="12" height="40" rx="2" fill={PLUM} opacity="0.25" />
                  <rect x="76" y="168" width="12" height="20" rx="2" fill={PLUM} opacity="0.15" />
                  <rect x="96" y="138" width="12" height="50" rx="2" fill="#10B981" />
                  <rect x="116" y="158" width="12" height="30" rx="2" fill={PLUM} opacity="0.25" />
                  <rect x="136" y="128" width="12" height="60" rx="2" fill={PLUM} opacity="0.35" />
                  <polyline points="42,180 62,165 82,185 102,155 122,175 142,145" fill="none" stroke={PLUM} strokeWidth="1.5" strokeDasharray="3 2" />
                  <rect x="16" y="272" width="178" height="100" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                  <text x="28" y="290" fill="#374151" fontSize="9" fontWeight="600">Recent Students</text>
                  <rect x="28" y="298" width="158" height="4" rx="2" fill="#F3F4F6" />
                  <rect x="28" y="308" width="140" height="4" rx="2" fill="#F3F4F6" />
                  <rect x="28" y="318" width="120" height="4" rx="2" fill="#F3F4F6" />
                  <rect x="28" y="328" width="150" height="4" rx="2" fill="#F3F4F6" />
                  <rect x="28" y="338" width="130" height="4" rx="2" fill="#F3F4F6" />
                  <rect x="206" y="272" width="178" height="100" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                  <text x="218" y="290" fill="#374151" fontSize="9" fontWeight="600">Payment Status</text>
                  <circle cx="260" cy="318" r="18" fill="none" stroke="#E5E7EB" strokeWidth="5" />
                  <circle cx="260" cy="318" r="18" fill="none" stroke="#10B981" strokeWidth="5" strokeDasharray="85 28" transform="rotate(-90 260 318)" />
                  <text x="260" y="322" textAnchor="middle" fill={PLUM} fontSize="9" fontWeight="bold">78%</text>
                  <rect x="286" y="306" width="6" height="6" rx="1" fill="#10B981" />
                  <text x="296" y="312" fill="#6B7280" fontSize="7">Paid</text>
                  <rect x="286" y="320" width="6" height="6" rx="1" fill="#E5E7EB" />
                  <text x="296" y="326" fill="#6B7280" fontSize="7">Outstanding</text>
                  <rect x="16" y="388" width="368" height="36" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                  <circle cx="56" cy="406" r="4" fill={PLUM} opacity="0.3" />
                  <circle cx="152" cy="406" r="6" fill={PLUM} />
                  <circle cx="248" cy="406" r="4" fill={PLUM} opacity="0.3" />
                  <circle cx="344" cy="406" r="4" fill={PLUM} opacity="0.3" />
                  <rect x="16" y="440" width="368" height="40" rx="8" fill={PLUM} opacity="0.05" />
                  <text x="200" y="465" textAnchor="middle" fill={PLUM} fontSize="9" fontWeight="500">All data synced in real-time</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-[48px] overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`, padding: "3rem", boxShadow: "0 24px 80px rgba(56,25,50,0.25)" }}>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div className="reveal">
                <p className="text-sm uppercase tracking-widest mb-4" style={{ color: "rgba(255,243,230,0.6)" }}>Live Dashboard</p>
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: MILK, fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem" }}>
                  A Command Center for Your Institution
                </h2>
                <p style={{ color: "rgba(255,243,230,0.75)", fontSize: "1rem", lineHeight: 1.75, marginBottom: "1.5rem" }}>
                  Get instant visibility into every corner of your school -- fee collection, attendance rates, pending exam results -- all from a single bento dashboard.
                </p>
                <button onClick={() => setDemoOpen(true)} className="px-6 py-3 rounded-full flex items-center gap-2 active:scale-95 transition-transform" style={{ background: MILK, color: PLUM, fontWeight: 600, fontSize: "0.95rem" }}>
                  See It In Action <ArrowRight size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", color: MILK, fontSize: "1.1rem", fontWeight: 600 }}>{card.value}</div>
                    <div style={{ color: "rgba(255,243,230,0.6)", fontSize: "0.75rem" }}>{card.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCHOOL TYPES */}
      <section id="testimonials" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16" data-reveal>
            <div className="inline-flex rounded-full border px-3 py-1 text-xs mb-4" style={{ borderColor: PLUM, color: PLUM }}>
              Trusted by schools across Africa
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: PLUM }}>Built for every type of school</h2>
            <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
              Whether you run a single classroom or a network of campuses, Managen scales with you.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" data-reveal>
            {schoolTypes.map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition bg-white overflow-hidden">
                <div className="h-36 overflow-hidden relative">
                  <img
                    src={s.photo}
                    alt={s.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0"
                    style={{ background:
                      'linear-gradient(to bottom, transparent 40%, rgba(56,25,50,0.4) 100%)'
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${s.bgColor} -mt-8 relative z-10 shadow-md border-2 border-white`}>
                    <s.icon size={24} className={s.iconColor === "text-custom" ? "" : s.iconColor} style={s.iconColor === "text-custom" ? { color: PLUM } : {}} />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: PLUM }}>{s.title}</h3>
                  <p className="text-sm mb-4" style={{ color: MUTED, lineHeight: 1.6 }}>{s.desc}</p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {s.pills.map((pill) => (
                      <span key={pill} className={`text-xs rounded-full px-2 py-0.5 ${s.pillBg} ${s.pillText}`}>{pill}</span>
                    ))}
                  </div>
                  <div className="text-xs" style={{ color: "#9CA3AF" }}>
                    <p>{s.example}</p>
                    <p>{s.example2}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 py-8 bg-gray-50 rounded-2xl flex justify-center items-center gap-4 flex-wrap" data-reveal>
            <span className="text-sm text-gray-500">Join schools across Ghana managing their institutions with Managen</span>
            <button onClick={() => navigate("/auth?mode=signup")} className="text-sm font-semibold flex items-center gap-1" style={{ color: PLUM }}>
              Start Free Trial <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials-quotes" className="py-24 px-6 relative overflow-hidden">
        {/* Background photo with overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=1200&q=80"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            aria-hidden="true"
          />
          <div className="absolute inset-0"
            style={{ background:
              'rgba(56,25,50,0.88)'
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16" data-reveal>
            <div className="inline-flex rounded-full border px-3 py-1 text-xs mb-4"
              style={{ borderColor: 'rgba(255,243,230,0.4)', color: 'rgba(255,243,230,0.8)' }}>
              What schools say
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2 text-white">
              Trusted by school leaders
            </h2>
            <p className="mt-3 max-w-2xl mx-auto"
              style={{ color: 'rgba(255,243,230,0.65)' }}>
              Hear from administrators who switched to Managen.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" data-reveal>
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl p-6"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.12)'
                }}>
                <div className="text-amber-400 text-sm mb-3">&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;</div>
                <p className="text-sm mb-6 italic"
                  style={{ color: 'rgba(255,243,230,0.85)', lineHeight: 1.7 }}>
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={t.name} color={t.avatarColor} />
                  <div>
                    <p className="font-semibold text-sm text-white">{t.name}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,243,230,0.6)' }}>{t.role}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,243,230,0.45)' }}>{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 reveal">
            <div className="inline-flex rounded-full border px-3 py-1 text-xs mb-4" style={{ borderColor: PLUM, color: PLUM }}>
              Simple pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mt-2" style={{ color: PLUM }}>Plans that grow with your school</h2>
            <p className="text-gray-500 mt-3">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="flex justify-center mb-12">
            <div className="flex rounded-full p-1" style={{ background: "white", border: "1px solid rgba(56,25,50,0.10)" }}>
              {(["monthly", "annual"] as const).map((b) => (
                <button key={b} onClick={() => setBilling(b)} className="px-5 py-2 rounded-full text-sm transition-all active:scale-95" style={{ background: billing === b ? PLUM : "transparent", color: billing === b ? MILK : MUTED, fontWeight: billing === b ? 600 : 400 }}>{b}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, i) => {
              const isAnnual = billing === "annual";
              const showSaveBadge = isAnnual && (plan.name === "Growth" || plan.name === "Pro");
              const displayPrice = isAnnual && (plan as any).priceAnnual ? (plan as any).priceAnnual : plan.price;
              const billedText = isAnnual ? (plan as any).annualBilled || "" : "";
              return (
              <div key={plan.name} className={`p-8 rounded-[32px] relative reveal reveal-${i + 1}`} style={{
                background: plan.highlighted ? `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` : "white",
                border: plan.highlighted ? "none" : "1px solid rgba(56,25,50,0.08)",
                boxShadow: plan.highlighted ? "0 24px 60px rgba(56,25,50,0.3)" : "0 4px 24px rgba(56,25,50,0.06)",
                transform: plan.highlighted ? "scale(1.03)" : "none",
              }}>
                {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs" style={{ background: "#10B981", color: "white", fontWeight: 600 }}>Most Popular</div>}
                {showSaveBadge && <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs" style={{ background: "#F59E0B", color: "white", fontWeight: 600 }}>Save 20%</div>}
                <h3 style={{ fontFamily: "'Playfair Display', serif", color: plan.highlighted ? MILK : PLUM, fontSize: "1.4rem", fontWeight: 700, marginBottom: "0.3rem" }}>{plan.name}</h3>
                <p style={{ color: plan.highlighted ? "rgba(255,243,230,0.65)" : MUTED, fontSize: "0.85rem", marginBottom: "1.5rem" }}>{plan.tagline}</p>
                <div className="mb-6">
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", color: plan.highlighted ? MILK : PLUM, fontSize: "2.2rem", fontWeight: 700 }}>{displayPrice}</span>
                  <span style={{ color: plan.highlighted ? "rgba(255,243,230,0.6)" : MUTED, fontSize: "0.85rem" }}>{plan.period}</span>
                  {billedText && <div style={{ color: plan.highlighted ? "rgba(255,243,230,0.5)" : MUTED, fontSize: "0.7rem", marginTop: "0.15rem" }}>Billed as {billedText}</div>}
                </div>
                <div className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <CheckCircle2 size={15} color={plan.highlighted ? "#86efac" : "#10B981"} fill={plan.highlighted ? "rgba(134,239,172,0.2)" : "#D1FAE5"} />
                      <span style={{ color: plan.highlighted ? "rgba(255,243,230,0.85)" : PLUM_LIGHT, fontSize: "0.9rem" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={() => navigate("/auth?mode=signup")} className="w-full py-3 rounded-full active:scale-95 transition-transform text-sm" style={{ background: plan.highlighted ? MILK : `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: plan.highlighted ? PLUM : MILK, fontWeight: 600 }}>{plan.cta}</button>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-gray-50">
        <div className="max-w-[768px] mx-auto">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex rounded-full border px-3 py-1 text-xs mb-4" style={{ borderColor: PLUM, color: PLUM }}>
              Questions and answers
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 700, marginBottom: "0.5rem" }}>Frequently asked questions</h2>
            <p style={{ color: MUTED, fontSize: "0.9rem" }}>Everything you need to know before getting started</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.08)", boxShadow: "0 2px 12px rgba(56,25,50,0.04)" }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left active:scale-[0.99] transition-transform"
                    style={{ color: PLUM }}
                  >
                    <span style={{ fontWeight: 600, fontSize: "0.95rem", lineHeight: 1.4, paddingRight: "1rem" }}>{faq.q}</span>
                    <ChevronDown size={16} className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} style={{ color: MUTED }} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
                    <div className="px-5 pb-5" style={{ color: MUTED, fontSize: "0.88rem", lineHeight: 1.7 }}>{faq.a}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20 px-8 rounded-[48px]" style={{ background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`, boxShadow: "0 24px 80px rgba(56,25,50,0.3)" }}>
            <Award size={36} color="rgba(255,243,230,0.7)" className="mx-auto mb-5" />
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: MILK, fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 700, lineHeight: 1.2, marginBottom: "1rem" }}>
              Your School Deserves Better Tools
            </h2>
            <p style={{ color: "rgba(255,243,230,0.7)", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto 1.5rem", lineHeight: 1.7 }}>
              Join schools across Ghana who have eliminated spreadsheets forever.
            </p>
            <button onClick={() => navigate("/auth?mode=signup")} className="px-10 py-4 rounded-full text-base active:scale-95 transition-transform" style={{ background: MILK, color: PLUM, fontWeight: 700, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}>
              Get Started Free -- No Credit Card
            </button>
            <div className="mt-4">
              <button onClick={() => setDemoOpen(true)} className="text-sm underline" style={{ color: "rgba(255,243,230,0.8)" }}>
                Or request a free demo &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-gray-50 py-12 px-6">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 px-10 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
                <GraduationCap size={15} color="white" />
              </div>
              <span style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700 }}>Managen</span>
            </div>
            <span className="text-gray-500 text-sm">School management that actually works.</span>
          </div>
          <hr className="border-gray-100 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-4">Company</h4>
              <div className="flex flex-col gap-2.5">
                {["About", "Blog", "Careers", "Press"].map((link) => (
                  <span key={link} className="text-sm cursor-default opacity-50" style={{ color: MUTED }}>{link}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-4">Product</h4>
              <div className="flex flex-col gap-2.5">
                {[{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }].map((link) => (
                  <a key={link.label} href={link.href} className="text-sm hover:opacity-70 transition-opacity" style={{ color: MUTED }}>{link.label}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-4">Contact</h4>
              <div className="flex flex-col gap-3">
                {[
                  { icon: Mail, text: "support@schoolos.me" },
                  { icon: Phone, text: "WhatsApp: wa.me/233XXXXXXXXX" },
                  { icon: MapPin, text: "Accra, Ghana" },
                  { icon: MessageSquare, text: "WhatsApp Support" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2.5">
                    <item.icon size={15} color={PLUM} className="flex-shrink-0" />
                    <span className="text-sm text-gray-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 border border-gray-200 rounded-full px-3 py-1 text-xs text-gray-500 mb-6">
                <Globe size={13} />
                Ghana
              </div>
              <div className="flex gap-2">
                {[
                  { icon: Linkedin, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Facebook, href: "#" },
                  { icon: Youtube, href: "#" },
                ].map((s) => (
                  <a key={s.icon.name} href={s.href} className="rounded-full border border-gray-200 p-2 hover:bg-gray-50 transition-colors">
                    <s.icon size={16} className="text-gray-500" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-400">&copy; 2025 Managen. All rights reserved.</span>
            <span className="text-xs text-gray-400">Made for African schools &#x1F30D;</span>
            <div className="flex gap-4 text-xs text-gray-400">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* DEMO MODAL */}
      {demoOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 modal-overlay" style={{ background: "rgba(56,25,50,0.6)", backdropFilter: "blur(4px)" }} onClick={() => !sending && setDemoOpen(false)}>
          <div className="w-full max-w-md rounded-[32px] p-8 modal-content" style={{ background: "white", boxShadow: "0 32px 80px rgba(56,25,50,0.3)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 700, fontSize: "1.4rem" }}>Request a Demo</h2>
                <p style={{ color: MUTED, fontSize: "0.85rem" }}>See Managen in action</p>
              </div>
              <button onClick={() => !sending && setDemoOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70" style={{ background: "rgba(56,25,50,0.06)" }}>
                <XCircle size={16} color={MUTED} />
              </button>
            </div>
            <form onSubmit={submitDemo} className="flex flex-col gap-4">
              <div>
                <label style={{ color: PLUM_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Full Name</label>
                <input type="text" placeholder="e.g. Kwame Mensah" value={demoForm.name} onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} required />
              </div>
              <div>
                <label style={{ color: PLUM_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Email</label>
                <input type="email" placeholder="admin@yourschool.edu" value={demoForm.email} onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} required />
              </div>
              <div>
                <label style={{ color: PLUM_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>School Name</label>
                <input type="text" placeholder="e.g. Accra Ridge School" value={demoForm.schoolName} onChange={(e) => setDemoForm({ ...demoForm, schoolName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} required />
              </div>
              <div>
                <label style={{ color: PLUM_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>Country</label>
                <select value={demoForm.country} onChange={(e) => setDemoForm({ ...demoForm, country: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                  <option value="Ghana">Ghana</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <button type="submit" disabled={sending}
                className="w-full py-4 rounded-full flex items-center justify-center gap-2 mt-2 active:scale-95 transition-transform text-sm"
                style={{ background: sending ? "rgba(56,25,50,0.5)" : `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK, fontWeight: 600, boxShadow: "0 8px 24px rgba(56,25,50,0.25)" }}>
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
                {sending ? "Sending..." : "Send Demo Request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
