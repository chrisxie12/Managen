import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  BookOpen,
  BarChart3,
  MessageSquare,
  Users,
  Shield,
  Zap,
  CheckCircle2,
  GraduationCap,
  Wallet,
  Bell,
  Star,
  Menu,
  X,
  TrendingUp,
  Clock,
  Award,
} from "lucide-react";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const features = [
  {
    icon: Users,
    title: "Student Management",
    desc: "Complete student lifecycle — enrollment, profiles, attendance, and academic history in one view.",
    color: "#10B981",
  },
  {
    icon: BookOpen,
    title: "Exam & Academics",
    desc: "Generate WAEC/BECE-style terminal reports, manage class schedules, and track grades effortlessly.",
    color: "#6366F1",
  },
  {
    icon: Wallet,
    title: "Finance & Payroll",
    desc: "Automate school fee collection, track paid/owed balances, and run payroll with Paystack or Flutterwave.",
    color: "#F59E0B",
  },
  {
    icon: MessageSquare,
    title: "WhatsApp Reports",
    desc: "Send terminal reports, fee reminders, and alerts directly to parents' phones via WhatsApp.",
    color: "#25D366",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Real-time metrics on enrollment, revenue, attendance trends — no spreadsheets needed.",
    color: "#EF4444",
  },
  {
    icon: Shield,
    title: "Multi-Tenant & Secure",
    desc: "Each school gets a private, branded workspace with role-based access and data isolation.",
    color: "#8B5CF6",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    tagline: "For small schools just getting started",
    priceGHS: "GHS 180",
    priceNGN: "₦15,000",
    period: "/ month",
    features: [
      "Up to 200 students",
      "Fee tracking & invoicing",
      "Basic attendance",
      "WhatsApp reports (100/mo)",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Growth",
    tagline: "The most popular plan for scaling institutions",
    priceGHS: "GHS 420",
    priceNGN: "₦35,000",
    period: "/ month",
    features: [
      "Up to 1,000 students",
      "Full fee & payroll module",
      "WAEC/BECE report cards",
      "Unlimited WhatsApp reports",
      "Paystack & Flutterwave integration",
      "Priority support",
    ],
    cta: "Get Started",
    highlighted: true,
  },
  {
    name: "Enterprise",
    tagline: "For school groups and large institutions",
    priceGHS: "Custom",
    priceNGN: "Custom",
    period: "",
    features: [
      "Unlimited students",
      "Multi-branch management",
      "Custom branding & domain",
      "Dedicated account manager",
      "SLA & on-site training",
      "API access",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const testimonials = [
  {
    name: "Mrs. Abena Asante",
    role: "Headmistress, Accra",
    text: "SchoolOS replaced three different apps we were using. Now everything — from fee collection to WhatsApp reports — is in one place. Our parents love it.",
    img: "https://images.unsplash.com/photo-1573496799436-5c34ef41818d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    stars: 5,
  },
  {
    name: "Mr. Chukwuemeka Obi",
    role: "Director, Lagos Prep School",
    text: "The terminal report generation alone saved us 2 weeks of work per term. The Flutterwave integration is seamless for our parents across Nigeria.",
    img: "https://images.unsplash.com/photo-1738963785992-dd0132bbac3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200",
    stars: 5,
  },
];

const stats = [
  { value: "340+", label: "Schools Active" },
  { value: "92,000+", label: "Students Managed" },
  { value: "GHS 8.4M", label: "Fees Collected" },
  { value: "99.7%", label: "Uptime SLA" },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currency, setCurrency] = useState<"GHS" | "NGN">("GHS");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: MILK }}
      className="min-h-screen"
    >
      {/* ── NAV ── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(255,243,230,0.85)"
            : "rgba(255,243,230,0.6)",
          backdropFilter: "blur(20px)",
          borderBottom: scrolled
            ? `1px solid rgba(56,25,50,0.08)`
            : "1px solid transparent",
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}
            >
              <GraduationCap size={18} color="#FFF3E6" />
            </div>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontSize: "1.25rem",
                fontWeight: 700,
              }}
            >
              SchoolOS
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "Pricing", "Testimonials", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{ color: PLUM_LIGHT, fontSize: "0.95rem" }}
                className="hover:opacity-70 transition-opacity"
              >
                {item}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              style={{ color: PLUM, fontSize: "0.9rem" }}
              className="px-4 py-2 hover:opacity-70 transition-opacity"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="px-5 py-2.5 rounded-full text-sm flex items-center gap-2 active:scale-95 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                color: MILK,
                boxShadow: "0 4px 14px rgba(56,25,50,0.3)",
              }}
            >
              Start Free <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile menu btn */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            style={{ color: PLUM }}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div
            className="md:hidden px-6 pb-6 flex flex-col gap-4"
            style={{ borderTop: `1px solid rgba(56,25,50,0.07)` }}
          >
            {["Features", "Pricing", "Testimonials", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{ color: PLUM_LIGHT }}
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </a>
            ))}
            <button
              onClick={() => navigate("/auth")}
              style={{ color: PLUM }}
              className="text-left"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="px-5 py-2.5 rounded-full text-sm active:scale-95 transition-transform w-fit"
              style={{
                background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                color: MILK,
              }}
            >
              Start Free Trial
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm"
                style={{
                  background: `rgba(56,25,50,0.06)`,
                  color: PLUM_LIGHT,
                  border: `1px solid rgba(56,25,50,0.12)`,
                }}
              >
                <Zap size={13} fill={PLUM_LIGHT} />
                Built for African Institutions
              </div>

              <h1
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: PLUM,
                  fontSize: "clamp(2.4rem, 5vw, 4rem)",
                  fontWeight: 700,
                  lineHeight: 1.15,
                }}
                className="mb-6"
              >
                Run Your Entire School.{" "}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  No Spreadsheets.
                </span>
              </h1>

              <p
                style={{ color: MUTED, fontSize: "1.1rem", lineHeight: 1.75 }}
                className="mb-8 max-w-lg"
              >
                SchoolOS is the all-in-one school management platform for Ghana
                and Nigeria — from fee tracking to WhatsApp reports, WAEC
                results to payroll. Everything automated.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="px-7 py-3.5 rounded-full flex items-center gap-2 active:scale-95 transition-transform"
                  style={{
                    background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                    color: MILK,
                    fontSize: "1rem",
                    boxShadow: "0 8px 28px rgba(56,25,50,0.28)",
                  }}
                >
                  Start for Free <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-7 py-3.5 rounded-full flex items-center gap-2 active:scale-95 transition-transform"
                  style={{
                    background: "white",
                    color: PLUM,
                    fontSize: "1rem",
                    border: `1.5px solid rgba(56,25,50,0.15)`,
                    boxShadow: "0 4px 16px rgba(56,25,50,0.06)",
                  }}
                >
                  View Demo
                </button>
              </div>

              {/* Trust strip */}
              <div className="mt-10 flex flex-wrap gap-6 items-center">
                <p style={{ color: MUTED, fontSize: "0.8rem" }}>
                  TRUSTED INTEGRATIONS
                </p>
                {["WAEC", "BECE", "Paystack", "Flutterwave", "WhatsApp"].map(
                  (name) => (
                    <div
                      key={name}
                      className="px-3 py-1 rounded-lg text-sm"
                      style={{
                        background: "white",
                        color: PLUM_LIGHT,
                        border: `1px solid rgba(56,25,50,0.10)`,
                        fontWeight: 600,
                        fontSize: "0.78rem",
                      }}
                    >
                      {name}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Right — hero image + floating cards */}
            <div className="relative hidden lg:block">
              <div
                className="rounded-[48px] overflow-hidden"
                style={{
                  boxShadow: "0 24px 80px rgba(56,25,50,0.18)",
                  border: `1px solid rgba(56,25,50,0.07)`,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1687794504223-8bdc02e25ef6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=700"
                  alt="Students"
                  className="w-full h-[480px] object-cover"
                />
              </div>

              {/* Floating metric card */}
              <div
                className="absolute -left-10 top-16 p-4 rounded-2xl"
                style={{
                  background: "white",
                  boxShadow: "0 8px 32px rgba(56,25,50,0.12)",
                  border: `1px solid rgba(56,25,50,0.07)`,
                  minWidth: 180,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} color="#10B981" />
                  <span style={{ color: MUTED, fontSize: "0.75rem" }}>
                    Fee collection
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: PLUM,
                    fontSize: "1.4rem",
                    fontWeight: 600,
                  }}
                >
                  GHS 24,800
                </div>
                <div style={{ color: "#10B981", fontSize: "0.75rem" }}>
                  +18% this term
                </div>
              </div>

              {/* Floating attendance badge */}
              <div
                className="absolute -right-6 bottom-24 p-4 rounded-2xl"
                style={{
                  background: "white",
                  boxShadow: "0 8px 32px rgba(56,25,50,0.12)",
                  border: `1px solid rgba(56,25,50,0.07)`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={13} color={PLUM_LIGHT} />
                  <span style={{ color: MUTED, fontSize: "0.75rem" }}>
                    Today's Attendance
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="text-2xl font-bold"
                    style={{
                      color: PLUM,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    94.2%
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ background: "#D1FAE5", color: "#065F46" }}
                  >
                    Present
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        className="py-14"
        style={{
          background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`,
        }}
      >
        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: MILK,
                  fontSize: "2.2rem",
                  fontWeight: 700,
                }}
              >
                {s.value}
              </div>
              <div style={{ color: "rgba(255,243,230,0.65)", fontSize: "0.9rem" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <p
              className="uppercase tracking-widest mb-3 text-sm"
              style={{ color: MUTED }}
            >
              Platform Modules
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                fontWeight: 700,
              }}
            >
              Everything a School Needs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="p-8 rounded-[24px] group hover:scale-[1.02] transition-transform"
                style={{
                  background: "white",
                  border: `1px solid rgba(56,25,50,0.07)`,
                  boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${f.color}15` }}
                >
                  <f.icon size={22} color={f.color} />
                </div>
                <h3
                  style={{
                    color: PLUM,
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ color: MUTED, fontSize: "0.9rem", lineHeight: 1.7 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="py-16 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="rounded-[48px] overflow-hidden relative"
            style={{
              background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`,
              padding: "3rem",
              boxShadow: "0 24px 80px rgba(56,25,50,0.25)",
            }}
          >
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p
                  className="text-sm uppercase tracking-widest mb-4"
                  style={{ color: "rgba(255,243,230,0.6)" }}
                >
                  Live Dashboard
                </p>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: MILK,
                    fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginBottom: "1rem",
                  }}
                >
                  A Command Center for Your Institution
                </h2>
                <p
                  style={{
                    color: "rgba(255,243,230,0.75)",
                    fontSize: "1rem",
                    lineHeight: 1.75,
                    marginBottom: "1.5rem",
                  }}
                >
                  Get instant visibility into every corner of your school — fee
                  collection, attendance rates, pending exam results — all from
                  a single bento dashboard.
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 rounded-full flex items-center gap-2 active:scale-95 transition-transform"
                  style={{
                    background: MILK,
                    color: PLUM,
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                >
                  Explore Dashboard <ArrowRight size={16} />
                </button>
              </div>

              {/* Mini dashboard preview */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Total Students", value: "1,248", icon: Users, color: "#6366F1" },
                  { label: "Term Revenue", value: "GHS 186K", icon: Wallet, color: "#10B981" },
                  { label: "Avg Attendance", value: "91.4%", icon: Clock, color: "#F59E0B" },
                  { label: "Reports Sent", value: "2,340", icon: Bell, color: "#EC4899" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="p-4 rounded-2xl"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                      style={{ background: `${card.color}25` }}
                    >
                      <card.icon size={16} color={card.color} />
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: MILK,
                        fontSize: "1.3rem",
                        fontWeight: 600,
                      }}
                    >
                      {card.value}
                    </div>
                    <div style={{ color: "rgba(255,243,230,0.6)", fontSize: "0.78rem" }}>
                      {card.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-6">
            <p className="uppercase tracking-widest mb-3 text-sm" style={{ color: MUTED }}>
              Surgical Pricing
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                fontWeight: 700,
                marginBottom: "1rem",
              }}
            >
              Pay Only for What You Need
            </h2>
          </div>

          {/* Currency toggle */}
          <div className="flex justify-center mb-12">
            <div
              className="flex rounded-full p-1"
              style={{ background: "white", border: `1px solid rgba(56,25,50,0.10)` }}
            >
              {(["GHS", "NGN"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className="px-5 py-2 rounded-full text-sm transition-all active:scale-95"
                  style={{
                    background: currency === c ? PLUM : "transparent",
                    color: currency === c ? MILK : MUTED,
                    fontWeight: currency === c ? 600 : 400,
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className="p-8 rounded-[32px] relative"
                style={{
                  background: plan.highlighted
                    ? `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`
                    : "white",
                  border: plan.highlighted
                    ? "none"
                    : `1px solid rgba(56,25,50,0.08)`,
                  boxShadow: plan.highlighted
                    ? "0 24px 60px rgba(56,25,50,0.3)"
                    : "0 4px 24px rgba(56,25,50,0.06)",
                  transform: plan.highlighted ? "scale(1.03)" : "none",
                }}
              >
                {plan.highlighted && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs"
                    style={{
                      background: "#10B981",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    Most Popular
                  </div>
                )}
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: plan.highlighted ? MILK : PLUM,
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    marginBottom: "0.3rem",
                  }}
                >
                  {plan.name}
                </h3>
                <p
                  style={{
                    color: plan.highlighted ? "rgba(255,243,230,0.65)" : MUTED,
                    fontSize: "0.85rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  {plan.tagline}
                </p>

                <div className="mb-6">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: plan.highlighted ? MILK : PLUM,
                      fontSize: "2.2rem",
                      fontWeight: 700,
                    }}
                  >
                    {currency === "GHS" ? plan.priceGHS : plan.priceNGN}
                  </span>
                  <span
                    style={{
                      color: plan.highlighted ? "rgba(255,243,230,0.6)" : MUTED,
                      fontSize: "0.85rem",
                    }}
                  >
                    {plan.period}
                  </span>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <CheckCircle2
                        size={15}
                        color={plan.highlighted ? "#86efac" : "#10B981"}
                        fill={plan.highlighted ? "rgba(134,239,172,0.2)" : "#D1FAE5"}
                      />
                      <span
                        style={{
                          color: plan.highlighted ? "rgba(255,243,230,0.85)" : PLUM_LIGHT,
                          fontSize: "0.9rem",
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate("/auth?mode=signup")}
                  className="w-full py-3 rounded-full active:scale-95 transition-transform text-sm"
                  style={{
                    background: plan.highlighted ? MILK : `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                    color: plan.highlighted ? PLUM : MILK,
                    fontWeight: 600,
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <p className="uppercase tracking-widest mb-3 text-sm" style={{ color: MUTED }}>
              Stories
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                fontWeight: 700,
              }}
            >
              Trusted by School Leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="p-8 rounded-[24px]"
                style={{
                  background: "white",
                  border: `1px solid rgba(56,25,50,0.07)`,
                  boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
                }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p
                  style={{
                    color: PLUM_LIGHT,
                    fontSize: "1rem",
                    lineHeight: 1.8,
                    marginBottom: "1.5rem",
                    fontStyle: "italic",
                  }}
                >
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div>
                    <div style={{ color: PLUM, fontWeight: 600, fontSize: "0.9rem" }}>
                      {t.name}
                    </div>
                    <div style={{ color: MUTED, fontSize: "0.8rem" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-6">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="text-center py-20 px-8 rounded-[48px]"
            style={{
              background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`,
              boxShadow: "0 24px 80px rgba(56,25,50,0.3)",
            }}
          >
            <Award size={36} color="rgba(255,243,230,0.7)" className="mx-auto mb-5" />
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: MILK,
                fontSize: "clamp(1.8rem, 4vw, 3rem)",
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: "1rem",
              }}
            >
              Your School Deserves Better Tools
            </h2>
            <p
              style={{
                color: "rgba(255,243,230,0.7)",
                fontSize: "1.05rem",
                maxWidth: 480,
                margin: "0 auto 2rem",
                lineHeight: 1.7,
              }}
            >
              Join 340+ institutions across Ghana and Nigeria that have
              eliminated spreadsheets forever.
            </p>
            <button
              onClick={() => navigate("/auth?mode=signup")}
              className="px-10 py-4 rounded-full text-base active:scale-95 transition-transform"
              style={{
                background: MILK,
                color: PLUM,
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              }}
            >
              Get Started Free — No Credit Card
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        id="contact"
        className="py-16 px-6"
        style={{ borderTop: `1px solid rgba(56,25,50,0.08)` }}
      >
        <div className="max-w-[1280px] mx-auto grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}
              >
                <GraduationCap size={15} color={MILK} />
              </div>
              <span
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: PLUM,
                  fontWeight: 700,
                }}
              >
                SchoolOS
              </span>
            </div>
            <p style={{ color: MUTED, fontSize: "0.85rem", lineHeight: 1.7 }}>
              Modern school management for Africa's finest institutions.
            </p>
          </div>
          {[
            {
              title: "Product",
              links: ["Features", "Pricing", "Changelog", "Roadmap"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Press"],
            },
            {
              title: "Contact",
              links: ["support@getschoolos.me", "+233 55 000 1234", "Accra, Ghana"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  color: PLUM,
                  fontWeight: 600,
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {col.title}
              </h4>
              <div className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <a
                    key={link}
                    href={link.includes("@") ? `mailto:${link}` : "#"}
                    style={{ color: MUTED, fontSize: "0.85rem" }}
                    className="hover:opacity-70 transition-opacity"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div
          className="max-w-[1280px] mx-auto mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: `1px solid rgba(56,25,50,0.07)` }}
        >
          <p style={{ color: MUTED, fontSize: "0.8rem" }}>
            © 2026 SchoolOS. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service"].map((link) => (
              <a
                key={link}
                href="#"
                style={{ color: MUTED, fontSize: "0.8rem" }}
                className="hover:opacity-70"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}