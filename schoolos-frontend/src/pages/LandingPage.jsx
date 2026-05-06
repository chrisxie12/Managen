import { useState, useEffect, useMemo, useCallback } from "react";
import React from "react";
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
import { useLocalization, countryConfigs } from "../contexts/LocalizationContext";
import { buildUrl, handleApiError } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#64748b"; // Updated for WCAG AA compliance (slate-500)

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
    tagline: "For boutique schools getting started",
    priceGHS: "GHS 400",
    priceNGN: "₦40,000",
    period: "/ mo",
    features: [
      "Up to 200 scholars",
      "Unified Ledger & Invoicing",
      "Smart Attendance",
      "WhatsApp & SMS alerts",
      "Global Gateway Access",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    tagline: "The gold standard for scaling institutions",
    priceGHS: "GHS 1,200",
    priceNGN: "₦120,000",
    period: "/ mo",
    features: [
      "Up to 1,500 scholars",
      "Full Financial Citadel",
      "Global Results Engine",
      "Unlimited Broadcaster",
      "Stripe & MoMo Integration",
      "24/7 Concierge Support",
    ],
    cta: "Scale Now",
    highlighted: true,
  },
  {
    name: "Institution",
    tagline: "For school groups and networks",
    priceGHS: "Custom",
    priceNGN: "Custom",
    period: "",
    features: [
      "Unlimited scholars",
      "Multi-Campus Management",
      "White-label Branding",
      "Dedicated Success Lead",
      "Full API & Webhooks",
      "On-site Deployment",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

const AFRICAN_COUNTRY_KEYS = ["GH", "NG"];

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
  { value: "340+", label: "Global Schools" },
  { value: "92K+", label: "Scholars Managed" },
  { value: "$12.4M", label: "Volume Processed" },
  { value: "99.9%", label: "System Uptime" },
];

const differentiators = [
  {
    title: "WhatsApp-First Parent Communication",
    description:
      "Send attendance alerts, exam results, and fee reminders to where parents already are.",
    icon: MessageSquare,
  },
  {
    title: "Mobile Money Ready",
    description:
      "Support MoMo-oriented fee flows with payment links and instant confirmation records.",
    icon: Wallet,
  },
  {
    title: "WAEC/BECE-Aligned Academics",
    description:
      "Run grading and reports with regional standards out of the box.",
    icon: GraduationCap,
  },
];

const launchSteps = [
  "Create school workspace and admin access",
  "Import classes, staff, and students",
  "Enable fees, reminders, and payment channels",
  "Go live with parent communication",
];

const HERO_VARIANTS = {
  control: {
    headingPrefix: "Run Your Entire School.",
    headingAccent: "No Spreadsheets.",
    subtext:
      "SchoolOS helps schools run academics, finance, and communication in one operating system. Built for Ghana, Nigeria, and expansion markets.",
    primaryCta: "Start for Free",
    secondaryCta: "Book a Demo",
  },
  speed: {
    headingPrefix: "Launch in 30 Minutes.",
    headingAccent: "Scale with Confidence.",
    subtext:
      "Onboard your school fast, automate fees and reminders, and keep parents informed from day one.",
    primaryCta: "Start 30-Min Setup",
    secondaryCta: "Book a Fast Demo",
  },
};

const LANDING_METRICS_KEY = "schoolos_landing_metrics";

const faqs = [
  {
    question: "How fast can my school start using SchoolOS?",
    answer:
      "Most schools can complete setup in under 30 minutes with class, staff, and student imports.",
  },
  {
    question: "Does SchoolOS support local payment workflows?",
    answer:
      "Yes. SchoolOS is designed for mobile-money-oriented fee collection and payment-link experiences.",
  },
  {
    question: "Can we notify parents on WhatsApp?",
    answer:
      "Yes. Attendance, reminders, and key announcements can be sent through WhatsApp-compatible communication flows.",
  },
  {
    question: "Do you support WAEC/BECE-style reporting?",
    answer:
      "Yes. Academic and report structures are aligned with regional exam/reporting expectations.",
  },
];

export const LandingPage = React.memo(({ onNavigate }) => {
  const { config, changeCountry } = useLocalization();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currency, setCurrency] = useState("GH");
  const [scrolled, setScrolled] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState("");
  const [demoError, setDemoError] = useState("");
  const [demoForm, setDemoForm] = useState({
    name: "",
    email: "",
    schoolName: "",
    country: "Ghana",
    message: "",
  });

  useEffect(() => {
    changeCountry("GH");
  }, [changeCountry]);

  const heroVariantKey = useMemo(() => {
    if (typeof window === "undefined") return "control";

    const params = new URLSearchParams(window.location.search);
    const fromQuery = String(params.get("lp_variant") || "").toLowerCase();
    if (Object.prototype.hasOwnProperty.call(HERO_VARIANTS, fromQuery)) {
      try {
        window.localStorage.setItem("schoolos_lp_variant", fromQuery);
      } catch (err) {
        // ignore local storage errors
      }
      return fromQuery;
    }

    try {
      const fromStorage = String(window.localStorage.getItem("schoolos_lp_variant") || "").toLowerCase();
      if (Object.prototype.hasOwnProperty.call(HERO_VARIANTS, fromStorage)) {
        return fromStorage;
      }
    } catch (err) {
      // ignore local storage errors
    }

    return "control";
  }, []);

  const heroVariant = HERO_VARIANTS[heroVariantKey] || HERO_VARIANTS.control;

  const trackLandingEvent = useCallback((eventName, payload = {}) => {
    try {
      if (typeof window === "undefined") return;

      if (typeof window.gtag === "function") {
        window.gtag("event", eventName, payload);
      }

      if (window.dataLayer && typeof window.dataLayer.push === "function") {
        window.dataLayer.push({ event: eventName, ...payload });
      }

      window.dispatchEvent(
        new CustomEvent("schoolos:landing-analytics", {
          detail: { event: eventName, ...payload },
        })
      );
    } catch (err) {
      // Keep navigation resilient even if analytics hooks are unavailable.
    }
  }, []);

  const incrementConversionCounter = useCallback((counter) => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(LANDING_METRICS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      const current = Number(parsed[counter] || 0);
      const next = {
        ...parsed,
        [counter]: current + 1,
        updatedAt: new Date().toISOString(),
      };
      window.localStorage.setItem(LANDING_METRICS_KEY, JSON.stringify(next));
    } catch (err) {
      // ignore local storage errors
    }
  }, []);

  const handleNavigate = useCallback((v, source = "unknown") => {
    trackLandingEvent("landing_cta_click", { target: v, source });
    if (v === "signup") incrementConversionCounter("signupClicks");
    if (v === "login") incrementConversionCounter("loginClicks");
    onNavigate(v);
  }, [onNavigate, trackLandingEvent, incrementConversionCounter]);

  const openDemoModal = useCallback((source = "unknown") => {
    setDemoError("");
    setDemoSuccess("");
    setIsDemoModalOpen(true);
    incrementConversionCounter("demoOpenClicks");
    trackLandingEvent("landing_demo_open", { source });
  }, [incrementConversionCounter, trackLandingEvent]);

  const closeDemoModal = useCallback(() => {
    setIsDemoModalOpen(false);
    setDemoError("");
  }, []);

  const handleDemoFieldChange = useCallback((event) => {
    const { name, value } = event.target;
    setDemoForm((prev) => ({ ...prev, [name]: value }));
  }, []);

  const isValidEmail = useCallback((value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }, []);

  const submitDemoRequest = useCallback(async (event) => {
    event.preventDefault();
    setDemoError("");
    setDemoSuccess("");

    const payload = {
      name: demoForm.name.trim(),
      email: demoForm.email.trim().toLowerCase(),
      schoolName: demoForm.schoolName.trim(),
      country: demoForm.country,
      message: demoForm.message.trim(),
      createdAt: new Date().toISOString(),
      variant: heroVariantKey,
      source: "demo_modal",
    };

    if (!payload.name || !payload.email || !payload.schoolName) {
      setDemoError("Please fill your name, school name, and email.");
      return;
    }

    if (!isValidEmail(payload.email)) {
      setDemoError("Please enter a valid email address.");
      return;
    }

    setDemoSubmitting(true);
    trackLandingEvent("landing_demo_submit_attempt", { source: "demo_modal" });

    try {
      const response = await fetch(buildUrl("/api/onboard/demo-request"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await handleApiError(response));
      }

      incrementConversionCounter("demoSubmitSuccess");
      trackLandingEvent("landing_demo_submit_success", { source: "demo_modal" });
      setDemoSuccess("Thanks. We received your request and will reach out shortly.");
      setDemoForm({
        name: "",
        email: "",
        schoolName: "",
        country: "Ghana",
        message: "",
      });
    } catch (err) {
      incrementConversionCounter("demoSubmitFailed");
      trackLandingEvent("landing_demo_submit_failed", { source: "demo_modal" });
      setDemoError("We could not submit your demo request right now. Please try again.");
    } finally {
      setDemoSubmitting(false);
    }
  }, [demoForm, heroVariantKey, incrementConversionCounter, isValidEmail, trackLandingEvent]);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setShowStickyCta(y > 360);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll(".landing-reveal"));
    if (!revealNodes.length) return undefined;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      revealNodes.forEach((node) => node.classList.add("in-view"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    revealNodes.forEach((node, index) => {
      node.style.setProperty("--reveal-delay", `${Math.min(index * 45, 280)}ms`);
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: MILK }}
      className="min-h-screen pb-20 md:pb-0"
    >
      <div
        className="text-center text-xs md:text-sm py-2 px-4"
        style={{ background: PLUM, color: "rgba(255,243,230,0.95)" }}
      >
        Built for African schools: multi-tenant, WhatsApp alerts, and payment-ready operations.
      </div>

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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
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
              onClick={() => handleNavigate('login', 'nav_sign_in')}
              style={{ color: PLUM, fontSize: "0.9rem" }}
              className="px-4 py-2 hover:opacity-70 transition-opacity font-bold"
            >
              Sign in
            </button>
            <button
              onClick={() => handleNavigate('signup', 'nav_start_free')}
              className="px-5 py-2.5 rounded-full text-sm flex items-center gap-2 active:scale-95 transition-transform font-bold"
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
            aria-label="Toggle menu"
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
              onClick={() => handleNavigate('login', 'mobile_menu_sign_in')}
              style={{ color: PLUM }}
              className="text-left font-bold"
            >
              Sign in
            </button>
            <button
              onClick={() => handleNavigate('signup', 'mobile_menu_start_trial')}
              className="px-5 py-2.5 rounded-full text-sm active:scale-95 transition-transform w-fit font-bold"
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
      <section className="pt-32 pb-20 px-6 landing-reveal">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-bold"
                style={{
                  background: `rgba(56,25,50,0.06)`,
                  color: PLUM_LIGHT,
                  border: `1px solid rgba(56,25,50,0.12)`,
                }}
              >
                <Zap size={13} fill={PLUM_LIGHT} />
                Global Educational Infrastructure
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
                {heroVariant.headingPrefix}{" "}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {heroVariant.headingAccent}
                </span>
              </h1>

                <p
                style={{ color: MUTED, fontSize: "1.1rem", lineHeight: 1.75 }}
                className="mb-8 max-w-lg font-medium"
              >
                  {heroVariant.subtext}
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => handleNavigate('signup', 'hero_start_for_free')}
                  className="px-7 py-3.5 rounded-full flex items-center gap-2 active:scale-95 transition-transform font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                    color: MILK,
                    fontSize: "1rem",
                    boxShadow: "0 8px 28px rgba(56,25,50,0.28)",
                  }}
                >
                  {heroVariant.primaryCta} <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => openDemoModal('hero_book_demo')}
                  className="px-7 py-3.5 rounded-full flex items-center gap-2 active:scale-95 transition-transform font-bold"
                  style={{
                    background: "white",
                    color: PLUM,
                    fontSize: "1rem",
                    border: `1.5px solid rgba(56,25,50,0.15)`,
                    boxShadow: "0 4px 16px rgba(56,25,50,0.06)",
                  }}
                >
                  {heroVariant.secondaryCta}
                </button>
              </div>

              {/* Trust strip */}
              <div className="mt-10 flex flex-wrap gap-6 items-center">
                <p style={{ color: MUTED, fontSize: "0.8rem", fontWeight: "bold" }}>
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
            <div className="relative hidden lg:block landing-reveal">
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
                  loading="lazy"
                  className="w-full h-[480px] object-cover"
                />
              </div>

              {/* Floating metric card */}
              <div
                className="absolute -left-10 top-16 p-4 rounded-2xl landing-float"
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
                className="absolute -right-6 bottom-24 p-4 rounded-2xl landing-float"
                style={{
                  background: "white",
                  boxShadow: "0 8px 32px rgba(56,25,50,0.12)",
                  border: `1px solid rgba(56,25,50,0.07)`,
                  animationDelay: "1.3s",
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

      {/* ── DIFFERENTIATORS ── */}
      <section className="px-6 pb-20 landing-reveal">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-8 text-center">
            <p className="uppercase tracking-widest mb-3 text-sm font-bold" style={{ color: MUTED }}>
              Why Schools Switch
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontSize: "clamp(1.7rem, 2.8vw, 2.4rem)",
                fontWeight: 700,
              }}
            >
              Built for Local Reality, Not Generic Templates
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {differentiators.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-[20px] landing-card-hover"
                style={{
                  background: "white",
                  border: "1px solid rgba(56,25,50,0.07)",
                  boxShadow: "0 4px 18px rgba(56,25,50,0.05)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(56,25,50,0.08)" }}
                >
                  <item.icon size={18} color={PLUM_LIGHT} />
                </div>
                <h3 className="mb-2" style={{ color: PLUM, fontWeight: 700, fontSize: "1rem" }}>
                  {item.title}
                </h3>
                <p style={{ color: MUTED, fontSize: "0.92rem", lineHeight: 1.65 }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ONBOARDING FLOW ── */}
      <section className="px-6 pb-24 landing-reveal">
        <div
          className="max-w-[1280px] mx-auto rounded-[32px] p-8 md:p-10"
          style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
            <div>
              <p className="uppercase tracking-widest mb-2 text-sm font-bold" style={{ color: MUTED }}>
                Fast Launch
              </p>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: PLUM,
                  fontSize: "clamp(1.6rem, 2.8vw, 2.3rem)",
                  fontWeight: 700,
                }}
              >
                Go Live in 30 Minutes
              </h2>
            </div>
            <button
              onClick={() => handleNavigate('signup', 'launch_wizard')}
              className="px-6 py-3 rounded-full text-sm font-bold"
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}
            >
              Start Setup Wizard
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {launchSteps.map((step, index) => (
              <div
                key={step}
                className="p-4 rounded-2xl landing-card-hover"
                style={{ background: "rgba(56,25,50,0.03)", border: "1px solid rgba(56,25,50,0.06)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center mb-3"
                  style={{ background: PLUM, color: MILK, fontSize: "0.8rem", fontWeight: 700 }}
                >
                  {index + 1}
                </div>
                <p style={{ color: PLUM_LIGHT, fontSize: "0.9rem", lineHeight: 1.6 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section
        className="py-14 landing-reveal"
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
              <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.9rem" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-6 landing-reveal">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <p
              className="uppercase tracking-widest mb-3 text-sm font-bold"
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
                className="p-8 rounded-[24px] group transition-transform cursor-pointer landing-card-hover"
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
      <section className="py-16 px-6 landing-reveal">
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
                  className="text-sm uppercase tracking-widest mb-4 font-bold"
                  style={{ color: "rgba(255,255,255,0.9)" }}
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
                    color: "rgba(255,255,255,0.9)",
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
                  onClick={() => handleNavigate('login', 'dashboard_preview_explore')}
                  className="px-6 py-3 rounded-full flex items-center gap-2 active:scale-95 transition-transform font-bold"
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
                  { label: "Total Scholars", value: "1,248", icon: Users, color: "#6366F1" },
                  { label: "Revenue Volume", value: "$186K", icon: Wallet, color: "#10B981" },
                  { label: "Attendance Rate", value: "91.4%", icon: Clock, color: "#F59E0B" },
                  { label: "Alerts Dispatched", value: "2,340", icon: Bell, color: "#EC4899" },
                ].map((card) => (
                  <div
                    key={card.label}
                      className="p-4 rounded-2xl landing-card-hover"
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
                    <div style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.78rem" }}>
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
      <section id="pricing" className="py-24 px-6 landing-reveal">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-6">
            <p className="uppercase tracking-widest mb-3 text-sm font-bold" style={{ color: MUTED }}>
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

          {/* Country/System Preview Toggle */}
          <div className="flex flex-col items-center mb-12">
            <span className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: MUTED }}>Preview System For:</span>
            <div
              className="flex flex-wrap justify-center rounded-3xl p-1.5 gap-1"
              style={{ background: "white", border: `1px solid rgba(56,25,50,0.10)` }}
            >
              {AFRICAN_COUNTRY_KEYS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setCurrency(c);
                    changeCountry(c);
                  }}
                  className="px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
                  style={{
                    background: currency === c ? PLUM : "transparent",
                    color: currency === c ? MILK : MUTED,
                    boxShadow: currency === c ? "0 8px 20px rgba(56,25,50,0.15)" : "none"
                  }}
                >
                    {countryConfigs[c]?.name || c}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] font-bold" style={{ color: PLUM }}>
              <Zap size={10} className="inline mr-1" /> Auto-Configured: {config.currency} Finance + {config.terminology.results} Engine
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className="p-8 rounded-[32px] relative landing-card-hover"
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
                    color: plan.highlighted ? "rgba(255,255,255,0.9)" : MUTED,
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
                    {currency === 'NG' ? plan.priceNGN : plan.priceGHS}
                  </span>
                  <span
                    style={{
                      color: plan.highlighted ? "rgba(255,255,255,0.9)" : MUTED,
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
                          color: plan.highlighted ? "rgba(255,255,255,0.95)" : PLUM_LIGHT,
                          fontSize: "0.9rem",
                        }}
                      >
                        {f}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleNavigate('signup', `pricing_${plan.name.toLowerCase()}`)}
                  className="w-full py-3 rounded-full active:scale-95 transition-transform text-sm font-bold"
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
      <section id="testimonials" className="py-24 px-6 landing-reveal">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-16">
            <p className="uppercase tracking-widest mb-3 text-sm font-bold" style={{ color: MUTED }}>
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
                className="p-8 rounded-[24px] landing-card-hover"
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
                    loading="lazy"
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

      {/* ── FAQ ── */}
      <section className="pb-16 px-6 landing-reveal">
        <div className="max-w-[980px] mx-auto">
          <div className="text-center mb-10">
            <p className="uppercase tracking-widest mb-3 text-sm font-bold" style={{ color: MUTED }}>
              FAQs
            </p>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontSize: "clamp(1.6rem, 2.8vw, 2.3rem)",
                fontWeight: 700,
              }}
            >
              Questions School Leaders Ask First
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-2xl p-5"
                style={{ background: "white", border: "1px solid rgba(56,25,50,0.08)" }}
              >
                <summary
                  style={{ color: PLUM, fontWeight: 700, cursor: "pointer", listStyle: "none" }}
                  className="flex items-center justify-between"
                >
                  {faq.question}
                </summary>
                <p style={{ color: MUTED, marginTop: "0.8rem", lineHeight: 1.7, fontSize: "0.92rem" }}>
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-20 px-6 landing-reveal">
        <div className="max-w-[1280px] mx-auto">
          <div
            className="text-center py-20 px-8 rounded-[48px]"
            style={{
              background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`,
              boxShadow: "0 24px 80px rgba(56,25,50,0.3)",
            }}
          >
            <Award size={36} color="rgba(255,255,255,0.95)" className="mx-auto mb-5" />
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
                color: "rgba(255,255,255,0.9)",
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
              onClick={() => handleNavigate('signup', 'final_cta_banner')}
              className="px-10 py-4 rounded-full text-base active:scale-95 transition-transform font-bold"
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
              links: [
                { label: "Features", href: "/features.html" },
                { label: "Pricing", href: "/pricing.html" },
                { label: "Changelog", href: "/changelog.html" },
                { label: "Roadmap", href: "/roadmap.html" },
              ],
            },
            {
              title: "Company",
              links: [
                { label: "About", href: "/about.html" },
                { label: "Blog", href: "/blog.html" },
                { label: "Careers", href: "/careers.html" },
                { label: "Press", href: "/press.html" },
              ],
            },
            {
              title: "Contact",
              links: [
                { label: "support@schoolos.app", href: "mailto:support@schoolos.app" },
                { label: "+233532785149", href: "tel:+233532785149" },
                { label: "Accra, Ghana" },
              ],
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
                {col.links.map((link) =>
                  link.href ? (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{ color: MUTED, fontSize: "0.85rem" }}
                      className="hover:opacity-70 transition-opacity"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <span key={link.label} style={{ color: MUTED, fontSize: "0.85rem" }}>
                      {link.label}
                    </span>
                  )
                )}
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

      {/* Mobile sticky CTA for fast conversion while scrolling */}
      {showStickyCta && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 z-50" style={{ background: "rgba(255,243,230,0.92)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(56,25,50,0.12)" }}>
          <button
            onClick={() => handleNavigate('signup', 'mobile_sticky_cta')}
            className="w-full py-3.5 rounded-full text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}
          >
            Start Free Trial <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Demo modal */}
      {isDemoModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: "rgba(19,12,18,0.58)" }}>
          <div className="w-full max-w-lg rounded-3xl p-6 md:p-7" style={{ background: "white", border: "1px solid rgba(56,25,50,0.12)" }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 style={{ color: PLUM, fontSize: "1.25rem", fontWeight: 700 }}>Book a Live Demo</h3>
                <p style={{ color: MUTED, fontSize: "0.9rem", marginTop: "0.2rem" }}>
                  Share your details and we will schedule a walkthrough.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDemoModal}
                aria-label="Close demo form"
                className="p-1 rounded-lg"
                style={{ color: PLUM_LIGHT }}
              >
                <X size={18} />
              </button>
            </div>

            {demoError && (
              <div className="mb-3 p-3 rounded-xl" style={{ background: "#FEF2F2", color: "#B91C1C", fontSize: "0.85rem" }}>
                {demoError}
              </div>
            )}

            {demoSuccess && (
              <div className="mb-3 p-3 rounded-xl" style={{ background: "#ECFDF5", color: "#065F46", fontSize: "0.85rem" }}>
                {demoSuccess}
              </div>
            )}

            <form onSubmit={submitDemoRequest} className="space-y-3">
              <input
                name="name"
                value={demoForm.name}
                onChange={handleDemoFieldChange}
                placeholder="Your full name"
                className="w-full h-11 rounded-xl px-4"
                style={{ border: "1px solid rgba(56,25,50,0.18)", outline: "none" }}
              />
              <input
                name="email"
                value={demoForm.email}
                onChange={handleDemoFieldChange}
                placeholder="Work email"
                type="email"
                className="w-full h-11 rounded-xl px-4"
                style={{ border: "1px solid rgba(56,25,50,0.18)", outline: "none" }}
              />
              <input
                name="schoolName"
                value={demoForm.schoolName}
                onChange={handleDemoFieldChange}
                placeholder="School name"
                className="w-full h-11 rounded-xl px-4"
                style={{ border: "1px solid rgba(56,25,50,0.18)", outline: "none" }}
              />
              <select
                name="country"
                value={demoForm.country}
                onChange={handleDemoFieldChange}
                className="w-full h-11 rounded-xl px-4"
                style={{ border: "1px solid rgba(56,25,50,0.18)", outline: "none", background: "white" }}
              >
                <option>Ghana</option>
                <option>Nigeria</option>
                <option>Kenya</option>
                <option>Other</option>
              </select>
              <textarea
                name="message"
                value={demoForm.message}
                onChange={handleDemoFieldChange}
                placeholder="What would you like to see during the demo?"
                rows={3}
                className="w-full rounded-xl p-4"
                style={{ border: "1px solid rgba(56,25,50,0.18)", outline: "none", resize: "vertical" }}
              />

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeDemoModal}
                  className="flex-1 h-11 rounded-xl font-bold"
                  style={{ border: "1px solid rgba(56,25,50,0.18)", color: PLUM }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={demoSubmitting}
                  className="flex-1 h-11 rounded-xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK, opacity: demoSubmitting ? 0.75 : 1 }}
                >
                  {demoSubmitting ? "Submitting..." : "Request Demo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default LandingPage;

