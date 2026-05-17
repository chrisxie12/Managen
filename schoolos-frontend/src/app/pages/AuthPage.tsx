import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  GraduationCap, Mail, Lock, Eye, EyeOff, User, Building2,
  ArrowRight, CheckCircle2, ArrowLeft, ChevronDown,
  BookOpen, Wallet, Users, ShieldCheck, HeartHandshake,
} from "lucide-react";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

import { api } from "../services/api";
import { toast } from "sonner";

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
    role: "admin",
  });

  const roleOptions = [
    { value: "admin", label: "School Admin", desc: "Full school management", icon: ShieldCheck, color: "#7c3aed" },
    { value: "teacher", label: "Teacher", desc: "Classes, grades & attendance", icon: BookOpen, color: "#d97706" },
    { value: "student", label: "Student", desc: "Timetable, grades & portal", icon: GraduationCap, color: "#6366f1" },
    { value: "parent", label: "Parent", desc: "Child progress & payments", icon: HeartHandshake, color: "#db2777" },
    { value: "headmaster", label: "Headmaster", desc: "Academic oversight", icon: Users, color: "#0891b2" },
    { value: "accountant", label: "Accountant", desc: "Finance & invoicing", icon: Wallet, color: "#059669" },
  ];

  const RoleIcon = ({ value, size = 20 }: { value: string; size?: number }) => {
    const opt = roleOptions.find(r => r.value === value);
    if (!opt) return null;
    const Icon = opt.icon;
    return <Icon size={size} color={opt.color} />;
  };

  const roleEmailPlaceholders: Record<string, string> = {
    admin: "admin@yourschool.edu.gh",
    teacher: "teacher@yourschool.edu.gh",
    student: "student@yourschool.edu.gh",
    parent: "parent@example.com",
    headmaster: "headmaster@yourschool.edu.gh",
    accountant: "accountant@yourschool.edu.gh",
  };

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const resetToken = searchParams.get("token") || "";
  const [verified, setVerified] = useState(false);

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
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === "signup") {
        const res = await api.post<{ slug?: string; subdomain?: string; message: string }>("/api/onboard/signup", {
          schoolName: form.school,
          email: form.email,
          adminName: form.name,
          adminPassword: form.password,
          plan: "trial",
        });

        const slug = res.data?.subdomain || res.data?.slug;
        if (slug) {
          toast.success("School created! Redirecting to dashboard...");
          await api.post(
            "/api/auth/login",
            { email: form.email, password: form.password, subdomain: slug }
          );
          navigate("/dashboard");
        } else {
          toast.success("School created! Please sign in.");
          setMode("login");
          setForm((f) => ({ ...f, subdomain: slug || "" }));
        }
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
        const headers: Record<string, string> = {};
        if (tenant) headers["x-tenant-subdomain"] = tenant;

        await api.post(
          "/api/auth/login",
          {
            email: form.email,
            password: form.password,
            subdomain: tenant,
          },
          { headers }
        );

        toast.success("Welcome back!");
        setTimeout(() => navigate("/dashboard"), 1000);
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
          background: `linear-gradient(160deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`,
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-10"
          style={{ background: MILK }}
        />
        <div
          className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full opacity-10"
          style={{ background: MILK }}
        />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,243,230,0.15)" }}
            >
              <GraduationCap size={20} color={MILK} />
            </div>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                color: MILK,
                fontSize: "1.3rem",
                fontWeight: 700,
              }}
            >
              Managen
            </span>
          </div>

          {/* Mid content */}
          <div className="flex-1 flex flex-col justify-center">
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: MILK,
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
                color: "rgba(255,243,230,0.7)",
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
                      color: "rgba(255,243,230,0.85)",
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
                color: "rgba(255,243,230,0.9)",
                fontSize: "0.9rem",
                lineHeight: 1.7,
                fontStyle: "italic",
                marginBottom: "0.75rem",
              }}
            >
              "Switching to Managen was the best operational decision we made
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
                    color: MILK,
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  Mrs. Abena Asante
                </div>
                <div
                  style={{
                    color: "rgba(255,243,230,0.6)",
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
        style={{ background: MILK }}
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
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}
            >
              <GraduationCap size={16} color={MILK} />
            </div>
            <span
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontWeight: 700,
                fontSize: "1.2rem",
              }}
            >
              Managen
            </span>
          </div>

          {/* Toggle tabs */}
          {["login", "signup", "superadmin"].includes(mode) && (
          <div
            className="flex p-1 rounded-full mb-8"
            style={{
              background: "rgba(56,25,50,0.06)",
              border: `1px solid rgba(56,25,50,0.08)`,
            }}
          >
            {(["login", "signup", "superadmin"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2.5 rounded-full text-sm transition-all active:scale-95 capitalize"
                style={{
                  background: mode === m ? PLUM : "transparent",
                  color: mode === m ? MILK : MUTED,
                  fontWeight: mode === m ? 600 : 400,
                  boxShadow:
                    mode === m ? "0 4px 14px rgba(56,25,50,0.25)" : "none",
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
                color: PLUM,
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
                <label style={{ color: PLUM_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.4rem" }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={MUTED} />
                  <input type="email" placeholder="admin@yourschool.edu.gh" value={form.email}
                    onChange={(e) => setField("email", e.target.value)} required
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                    style={{ background: "white", border: "1.5px solid rgba(56,25,50,0.12)", color: PLUM }} />
                </div>
                <div className="mt-4">
                  <label style={{ color: PLUM_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.4rem" }}>
                    School Subdomain <span style={{ color: MUTED, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={MUTED} />
                    <input type="text" placeholder="e.g. accra-ridge" value={form.subdomain}
                      onChange={(e) => setField("subdomain", e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                      style={{ background: "white", border: "1.5px solid rgba(56,25,50,0.12)", color: PLUM }} />
                  </div>
                </div>
              </div>
            )}

            {mode === "forgot" && resetSent && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#D1FAE5" }}>
                  <Mail size={28} color="#10B981" />
                </div>
                <p style={{ color: PLUM, fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>Check your email</p>
                <p style={{ color: MUTED, fontSize: "0.85rem" }}>We sent a reset link to <strong>{form.email}</strong></p>
                <button type="button" onClick={() => { setResetSent(false); setMode("login"); }}
                  className="mt-6 px-5 py-2.5 rounded-full text-sm"
                  style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
                  Back to sign in
                </button>
              </div>
            )}

            {mode === "reset-password" && (
              <div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={MUTED} />
                  <input type={showPassword ? "text" : "password"} placeholder="New password (min 6 chars)"
                    value={form.password} onChange={(e) => setField("password", e.target.value)} required minLength={6}
                    className="w-full pl-10 pr-12 py-3.5 rounded-2xl outline-none text-sm"
                    style={{ background: "white", border: "1.5px solid rgba(56,25,50,0.12)", color: PLUM }} />
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
                <p style={{ color: PLUM, fontSize: "1rem", fontWeight: 600, marginBottom: "0.3rem" }}>Email verified!</p>
                <button type="button" onClick={() => navigate("/auth")}
                  className="mt-6 px-5 py-2.5 rounded-full text-sm"
                  style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
                  Sign in to your account
                </button>
              </div>
            )}

            {mode === "login" && (
              <>
              <div>
                <label style={{ color: PLUM_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.4rem" }}>
                  School Subdomain
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2" color={MUTED} />
                  <input type="text" placeholder="e.g. accra-ridge" value={form.subdomain}
                    onChange={(e) => setField("subdomain", e.target.value)} required
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                    style={{ background: "white", border: "1.5px solid rgba(56,25,50,0.12)", color: PLUM }} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: MUTED }}>.getschoolos.me</span>
                </div>
              </div>

              <div className="relative">
                <label style={{ color: PLUM_LIGHT, fontSize: "0.85rem", fontWeight: 500, display: "block", marginBottom: "0.4rem" }}>
                  I am a
                </label>
                <button type="button" onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm text-left transition-all duration-200 active:scale-[0.98]"
                  style={{ background: "white", border: `1.5px solid ${showRoleDropdown ? PLUM : "rgba(56,25,50,0.12)"}`, color: PLUM, boxShadow: showRoleDropdown ? `0 0 0 3px rgba(56,25,50,0.08)` : "none" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${roleOptions.find(r => r.value === form.role)?.color}12` }}>
                    <RoleIcon value={form.role} size={18} />
                  </div>
                  <div className="flex-1">
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{roleOptions.find(r => r.value === form.role)?.label}</div>
                    <div style={{ color: MUTED, fontSize: "0.72rem" }}>{roleOptions.find(r => r.value === form.role)?.desc}</div>
                  </div>
                  <ChevronDown size={16} color={MUTED} style={{
                    transform: showRoleDropdown ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }} />
                </button>
                {showRoleDropdown && (
                  <div className="absolute z-20 w-full mt-1.5 rounded-2xl overflow-hidden animate-slide-up"
                    style={{
                      background: "white",
                      border: "1px solid rgba(56,25,50,0.1)",
                      boxShadow: "0 12px 40px rgba(56,25,50,0.15)",
                    }}>
                    {roleOptions.map((r, i) => {
                      const Icon = r.icon;
                      const isSelected = form.role === r.value;
                      return (
                        <button key={r.value} type="button"
                          onClick={() => { setField("role", r.value); setShowRoleDropdown(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-left transition-all duration-150"
                          style={{
                            color: isSelected ? PLUM : PLUM_LIGHT,
                            background: isSelected ? `${r.color}08` : "transparent",
                            borderBottom: i < roleOptions.length - 1 ? "1px solid rgba(56,25,50,0.04)" : "none",
                          }}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-150"
                            style={{ background: `${r.color}12`, transform: isSelected ? "scale(1.1)" : "scale(1)" }}>
                            <Icon size={17} color={r.color} />
                          </div>
                          <div className="flex-1">
                            <div style={{ fontWeight: isSelected ? 600 : 500, fontSize: "0.88rem" }}>{r.label}</div>
                            <div style={{ color: MUTED, fontSize: "0.72rem" }}>{r.desc}</div>
                          </div>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full" style={{ background: PLUM }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              </>
            )}

            {mode === "signup" && (
              <>
                <div>
                  <label
                    style={{
                      color: PLUM_LIGHT,
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
                      required
                      className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                      style={{
                        background: "white",
                        border: `1.5px solid rgba(56,25,50,0.12)`,
                        color: PLUM,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    style={{
                      color: PLUM_LIGHT,
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
                        border: `1.5px solid rgba(56,25,50,0.12)`,
                        color: PLUM,
                      }}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label
                style={{
                  color: PLUM_LIGHT,
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
                  placeholder={roleEmailPlaceholders[form.role] || "admin@yourschool.edu.gh"}
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                  style={{
                    background: "white",
                    border: `1.5px solid rgba(56,25,50,0.12)`,
                    color: PLUM,
                  }}
                />
              </div>
            </div>

            <div>
              <label
                style={{
                  color: PLUM_LIGHT,
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
                  required
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl outline-none text-sm"
                  style={{
                    background: "white",
                    border: `1.5px solid rgba(56,25,50,0.12)`,
                    color: PLUM,
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
              {mode === "login" && (
                <div className="text-right mt-1.5">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    style={{ color: PLUM_LIGHT, fontSize: "0.8rem" }}
                    className="hover:opacity-70"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {mode !== "verify-email" && !(mode === "forgot" && resetSent) && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-full flex items-center justify-center gap-2 mt-2 active:scale-95 transition-transform"
              style={{
                background: loading
                  ? "rgba(56,25,50,0.5)"
                  : `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                color: MILK,
                fontSize: "0.95rem",
                fontWeight: 600,
                boxShadow: "0 8px 24px rgba(56,25,50,0.25)",
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
                  style={{ color: PLUM, fontWeight: 600 }}
                  className="hover:opacity-70"
                >
                  Sign up free
                </button>
              </>
            ) : mode === "superadmin" ? (
              <button
                onClick={() => setMode("login")}
                style={{ color: PLUM, fontWeight: 600, fontSize: "0.85rem" }}
                className="hover:opacity-70"
              >
                Back to school login
              </button>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  style={{ color: PLUM, fontWeight: 600 }}
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
              <button onClick={() => setMode("login")} style={{ color: PLUM, fontWeight: 600 }} className="hover:opacity-70">
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
