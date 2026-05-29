import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  GraduationCap, Mail, Lock, Eye, EyeOff, User, Building2,
  ArrowRight, CheckCircle2, ArrowLeft,
} from "lucide-react";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const AMBER = "#2563EB";
const AMBER_LIGHT = "#EFF6FF";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

import { useSignUp, useClerk } from "@clerk/react";
import { api } from "../services/api";
import { toast } from "sonner";
import { useAuth, storeSubdomain } from "../contexts/AuthContext";

const benefits = [
  "No credit card required for trial",
  "Set up in under 10 minutes",
  "WAEC & BECE report templates built-in",
  "Free WhatsApp integration",
  "GHS billing support",
];

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup" | "superadmin" | "forgot" | "reset-password" | "verify-email">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    school: "",
    email: "",
    password: "",
    subdomain: "",
  });

  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return null;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNum = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);
    const length = pwd.length >= 8;
    const strength = [hasUpper, hasLower, hasNum, hasSpecial, length].filter(Boolean).length;
    if (strength <= 2) return "weak";
    if (strength <= 3) return "medium";
    return "strong";
  };

  const emailPlaceholder = "admin@yourschool.edu.gh";

  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const resetToken = searchParams.get("token") || "";
  const [verified, setVerified] = useState(false);
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const { refresh, user, loading: authLoading } = useAuth();

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(form.password));
  }, [form.password]);

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "reset-password" && searchParams.get("token")) {
      setMode("reset-password");
    } else if (m === "verify-email" && searchParams.get("token")) {
      setMode("verify-email");
    } else {
      setMode(m === "signup" ? "signup" : "login");
    }
    const sub =
      searchParams.get("subdomain") || searchParams.get("slug") || "";
    if (sub) {
      const s = sub.trim().toLowerCase();
      setForm((f) => ({ ...f, subdomain: s }));
      storeSubdomain(s);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === "signup") {
        const res = await api.post<{ slug?: string; subdomain?: string; message: string; tenantId?: string }>("/api/onboard/signup", {
          schoolName: form.school,
          email: form.email,
          adminName: form.name,
          adminPassword: form.password,
          plan: "trial",
        });

        if (!res.data) throw new Error("Signup failed");

        const result = await signUp.create({
          emailAddress: form.email,
          password: form.password,
          firstName: form.name.split(" ")[0] || form.name,
          lastName: form.name.split(" ").slice(1).join(" ") || undefined,
        }) as any;

        if (result?.createdSessionId) {
          await clerk.setActive({ session: result.createdSessionId });
        }

        const token = await clerk.session?.getToken();
        if (token) {
          await api.post("/api/auth/clerk-sync", {
            clerkToken: token,
            email: form.email,
            subdomain: res.data!.slug,
          });
        }

        storeSubdomain(res.data!.slug || "");

        await refresh();
        if (!user) {
          window.location.href = "/dashboard";
          return;
        }
        toast.success("Account created! Welcome to SchoolOS.");
        navigate("/dashboard");
      } else if (mode === "superadmin") {
        await api.post("/api/superadmin/login", {
          email: form.email,
          password: form.password,
        });
        toast.success("Welcome, Super Admin!");
        navigate("/superadmin");
      } else if (mode === "forgot") {
        await api.post("/api/auth/forgot-password", {
          email: form.email,
          subdomain: form.subdomain || undefined,
        });
        setResetSent(true);
        toast.success("Check your email for the reset link.");
      } else if (mode === "reset-password") {
        await api.post("/api/auth/reset-password", {
          token: resetToken,
          password: form.password,
        });
        toast.success("Password reset! Please sign in.");
        setMode("login");
      } else if (mode === "verify-email") {
        await api.post("/api/auth/verify-email", {
          token: resetToken,
        });
        setVerified(true);
        toast.success("Email verified successfully!");
      } else {
        const tenant = form.subdomain.trim().toLowerCase();
        if (!tenant) {
          return toast.error("Please enter your school subdomain");
        }
        storeSubdomain(tenant);
        const headers: Record<string, string> = {};
        if (tenant) headers["x-tenant-subdomain"] = tenant;

        const loginRes = await api.post<{ data: { token: string } }>(
          "/api/auth/login",
          {
            email: form.email,
            password: form.password,
            subdomain: tenant,
          },
          { headers }
        );

        await refresh();

        if (!user) {
          const retryRes = await api.get<{ user: Record<string, any>; school: Record<string, any> }>("/api/auth/me", { headers });
          if (retryRes.data) {
            window.location.href = "/dashboard";
            return;
          }
          throw new Error("Session was created but could not be verified. Please try again.");
        }

        toast.success("Welcome back!");
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const setField = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── LEFT PANEL (Brand) ── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: CREAM }}
        />
        <div
          className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full opacity-10"
          style={{ background: CREAM }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(248,249,250,0.15)" }}
            >
              <GraduationCap size={20} color={CREAM} />
            </div>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                color: CREAM,
                fontSize: "1.3rem",
                fontWeight: 700,
              }}
            >
              SchoolOS
            </span>
          </div>

          {/* Mid content */}
          <div className="flex-1 flex flex-col justify-center">
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: CREAM,
                fontSize: "2.4rem",
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: "1rem",
              }}
            >
              The Operating System for African Schools
            </h2>
            <p
              style={{
                color: "rgba(248,249,250,0.7)",
                fontSize: "1rem",
                lineHeight: 1.75,
                marginBottom: "2rem",
              }}
            >
              Join 340+ schools across Ghana managing fees,
              academics, and parent communication — all in one place.
            </p>

            <div className="flex flex-col gap-3">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle2
                    size={16}
                    color="#86efac"
                    fill="rgba(134,239,172,0.2)"
                  />
                  <span
                    style={{
                      color: "rgba(248,249,250,0.85)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {b}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial at bottom */}
          <div
            className="p-5 rounded-2xl mt-auto"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p
              style={{
                color: "rgba(248,249,250,0.9)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                fontStyle: "italic",
                marginBottom: "0.75rem",
              }}
            >
              "Switching to SchoolOS was the best operational decision we made
              this academic year."
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1573496799436-5c34ef41818d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80"
                alt="Testimonial"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <div
                  style={{
                    color: CREAM,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  Mrs. Abena Asante
                </div>
                <div
                  style={{
                    color: "rgba(248,249,250,0.6)",
                    fontSize: "0.75rem",
                  }}
                >
                  Headmistress, Accra
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL (Form) ── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        style={{ background: CREAM }}
      >
        {/* Back link */}
        <div className="w-full max-w-md mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
            style={{ color: MUTED }}
          >
            <ArrowLeft size={14} /> Back to home
          </button>
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` }}
            >
              <GraduationCap size={16} color={CREAM} />
            </div>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                color: NAVY,
                fontWeight: 700,
                fontSize: "1.2rem",
              }}
            >
              SchoolOS
            </span>
          </div>

          {/* Toggle tabs */}
          {["login", "signup", "superadmin"].includes(mode) && (
          <div
            className="flex p-1 rounded-full mb-8"
            style={{
              background: "#F3F4F6",
            }}
          >
            {(["login", "signup", "superadmin"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2.5 rounded-full text-sm transition-all capitalize"
                style={{
                  background: mode === m ? NAVY : "transparent",
                  color: mode === m ? "white" : MUTED,
                  fontWeight: mode === m ? 600 : 400,
                  fontSize: m === "superadmin" ? "0.75rem" : "0.85rem",
                }}
              >
                {m === "login" ? "Sign In" : m === "signup" ? "Create Account" : "Super Admin"}
              </button>
            ))}
          </div>
          )}

          {/* Title */}
          <div className="mb-8">
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                color: NAVY,
                fontSize: "1.8rem",
                fontWeight: 700,
                marginBottom: "0.4rem",
              }}
            >
              {mode === "login" ? "Welcome back" : mode === "superadmin" ? "Platform Admin" : mode === "signup" ? "Start your free trial" : mode === "forgot" ? "Reset your password" : mode === "reset-password" ? "Choose a new password" : "Verify your email"}
            </h1>
            <p style={{ color: MUTED, fontSize: "0.9rem" }}>
              {mode === "login"
                ? "Sign in to your school dashboard"
                : mode === "superadmin"
                ? "Sign in to the platform admin panel"
                : mode === "signup"
                ? "Set up your school in under 10 minutes"
                : mode === "forgot"
                ? "Enter your email to receive a reset link"
                : mode === "reset-password"
                ? "Enter your new password below"
                : "Confirm your email address"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "forgot" && !resetSent && (
              <div>
                <label style={{ color: NAVY_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.4rem" }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={MUTED} />
                  <input type="email" placeholder="admin@yourschool.edu.gh" value={form.email}
                    onChange={(e) => setField("email", e.target.value)} required autoComplete="email"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                    style={{ background: "white", border: "1.5px solid rgba(10,36,114,0.12)", color: NAVY }} />
                </div>
                <div className="mt-4">
                  <label style={{ color: NAVY_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.4rem" }}>
                    School Subdomain <span style={{ color: MUTED, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={MUTED} />
                    <input type="text" placeholder="e.g. accra-ridge" value={form.subdomain}
                      onChange={(e) => setField("subdomain", e.target.value)} autoComplete="off"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                      style={{ background: "white", border: "1.5px solid rgba(10,36,114,0.12)", color: NAVY }} />
                  </div>
                </div>
              </div>
            )}

            {mode === "forgot" && resetSent && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#D1FAE5" }}>
                  <Mail size={28} color="#10B981" />
                </div>
                <p style={{ color: NAVY, fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>Check your email</p>
                <p style={{ color: MUTED, fontSize: "0.85rem" }}>We sent a reset link to <strong>{form.email}</strong></p>
                <button type="button" onClick={() => { setResetSent(false); setMode("login"); }}
                  className="mt-6 px-5 py-2.5 rounded-full text-sm"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                  Back to sign in
                </button>
              </div>
            )}

            {mode === "reset-password" && (
              <div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={MUTED} />
                  <input type={showPassword ? "text" : "password"} placeholder="New password (min 6 chars)"
                    value={form.password} onChange={(e) => setField("password", e.target.value)} required minLength={6} autoComplete="new-password"
                    className="w-full pl-10 pr-12 py-3.5 rounded-2xl outline-none text-sm"
                    style={{ background: "white", border: "1.5px solid rgba(10,36,114,0.12)", color: NAVY }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff size={16} color={MUTED} /> : <Eye size={16} color={MUTED} />}
                  </button>
                </div>
              </div>
            )}

            {mode === "verify-email" && !verified && (
              <div className="text-center py-8">
                <p style={{ color: MUTED, fontSize: "0.9rem" }}>Verifying your email...</p>
              </div>
            )}

            {mode === "verify-email" && verified && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#D1FAE5" }}>
                  <CheckCircle2 size={28} color="#10B981" />
                </div>
                <p style={{ color: NAVY, fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>Email verified!</p>
                <button type="button" onClick={() => navigate("/auth")}
                  className="mt-6 px-5 py-2.5 rounded-full text-sm"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                  Sign in to your account
                </button>
              </div>
            )}

            {mode === "login" && (
              <>
              <div>
                <label style={{ color: NAVY_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.4rem" }}>
                  School Subdomain
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={MUTED} />
                  <input type="text" placeholder="e.g. accra-ridge" value={form.subdomain}
                    onChange={(e) => setField("subdomain", e.target.value)} required autoComplete="off"
                    className="w-full pl-10 pr-28 py-3.5 rounded-2xl outline-none text-sm text-ellipsis"
                    style={{ background: "white", border: "1.5px solid rgba(10,36,114,0.12)", color: NAVY }} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold whitespace-nowrap" style={{ color: MUTED }}>.getschoolos.me</span>
                </div>
              </div>

              <div>
                <label style={{ color: NAVY_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.4rem" }}>
                  Your Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={MUTED} />
                  <input type="email" placeholder="admin@yourschool.edu.gh" value={form.email}
                    onChange={(e) => setField("email", e.target.value)} required autoComplete="email"
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                    style={{ background: "white", border: "1.5px solid rgba(10,36,114,0.12)", color: NAVY }} />
                </div>
              </div>

              <div>
                <label style={{ color: NAVY_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.4rem" }}>
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={MUTED} />
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••••" value={form.password}
                    onChange={(e) => setField("password", e.target.value)} required autoComplete="current-password"
                    className="w-full pl-10 pr-12 py-3.5 rounded-2xl outline-none text-sm"
                    style={{ background: "white", border: "1.5px solid rgba(10,36,114,0.12)", color: NAVY }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2">
                    {showPassword ? <EyeOff size={16} color={MUTED} /> : <Eye size={16} color={MUTED} />}
                  </button>
                </div>
                <div className="text-right mt-1.5">
                  <button type="button" onClick={() => setMode("forgot")} style={{ color: AMBER, fontSize: "0.8rem", fontWeight: 600 }} className="hover:opacity-70">Forgot password?</button>
                </div>
              </div>
              </>
            )}

            {mode === "signup" && (
              <>
                <div>
                  <label
                    style={{
                      color: NAVY_LIGHT,
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      color={MUTED}
                    />
                    <input
                      type="text"
                      placeholder="e.g. Kwame Mensah"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      required autoComplete="name"
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                      style={{
                        background: "white",
                        border: `1.5px solid rgba(10,36,114,0.12)`,
                        color: NAVY,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      color: NAVY_LIGHT,
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      display: "block",
                      marginBottom: "0.4rem",
                    }}
                  >
                    School Name
                  </label>
                  <div className="relative">
                    <Building2
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      color={MUTED}
                    />
                    <input
                      type="text"
                      placeholder="e.g. Accra Ridge School"
                      value={form.school}
                      onChange={(e) => setField("school", e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                      style={{
                        background: "white",
                        border: `1.5px solid rgba(10,36,114,0.12)`,
                        color: NAVY,
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            {(mode === "signup" || mode === "superadmin") && (<>
            <div>
              <label
                style={{
                  color: NAVY_LIGHT,
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  color={MUTED}
                />
                <input
                  type="email"
                  placeholder={emailPlaceholder}
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required autoComplete="email"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                  style={{
                    background: "white",
                    border: `1.5px solid rgba(10,36,114,0.12)`,
                    color: NAVY,
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  color: NAVY_LIGHT,
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  color={MUTED}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  required autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl outline-none text-sm"
                  style={{
                    background: "white",
                    border: `1.5px solid rgba(10,36,114,0.12)`,
                    color: NAVY,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff size={16} color={MUTED} />
                  ) : (
                    <Eye size={16} color={MUTED} />
                  )}
                </button>
              </div>
            </div>
            {mode === "signup" && form.password && (
              <div className="p-3 rounded-2xl text-sm" style={{
                background: passwordStrength === "weak" ? "#FEF2F2" : passwordStrength === "medium" ? "#FEF3C7" : "#ECFDF5",
                borderLeft: `3px solid ${passwordStrength === "weak" ? "#EF4444" : passwordStrength === "medium" ? "#F59E0B" : "#10B981"}`,
                color: NAVY,
              }}>
                Strength: <span style={{
                  fontWeight: 600,
                  color: passwordStrength === "weak" ? "#EF4444" : passwordStrength === "medium" ? "#F59E0B" : "#10B981",
                  textTransform: "capitalize",
                }}>{passwordStrength}</span>
              </div>
            )}
            </>)}

            <div id="clerk-captcha"></div>

            {mode !== "verify-email" && !(mode === "forgot" && resetSent) && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full flex items-center justify-center gap-2 mt-2 active:scale-95 transition-transform"
              style={{
                background: loading
                  ? "rgba(37,99,235,0.5)"
                  : AMBER,
                color: "#ffffff",
                fontSize: "0.95rem",
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(37,99,235,0.3)",
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                  />
                  {mode === "login" ? "Signing in..." : mode === "superadmin" ? "Signing in..." : mode === "signup" ? "Creating account..." : mode === "forgot" ? "Sending..." : "Resetting..."}
                </span>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : mode === "superadmin" ? "Open Dashboard" : mode === "signup" ? "Create Free Account" : mode === "forgot" ? "Send Reset Link" : "Reset Password"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
            )}
          </form>

          {["login", "signup", "superadmin"].includes(mode) && (
          <p
            className="text-center mt-6"
            style={{ color: MUTED, fontSize: "0.85rem" }}
          >
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  style={{ color: NAVY, fontWeight: 600 }}
                  className="hover:opacity-70"
                >
                  Sign up free
                </button>
              </>
            ) : mode === "superadmin" ? (
              <button
                onClick={() => setMode("login")}
                style={{ color: NAVY, fontWeight: 600, fontSize: "0.85rem" }}
                className="hover:opacity-70"
              >
                Back to school login
              </button>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  style={{ color: NAVY, fontWeight: 600 }}
                  className="hover:opacity-70"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
          )}
          {mode === "forgot" && !resetSent && (
            <p className="text-center mt-6" style={{ color: MUTED, fontSize: "0.85rem" }}>
              <button onClick={() => setMode("login")} style={{ color: NAVY, fontWeight: 600 }} className="hover:opacity-70">
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
