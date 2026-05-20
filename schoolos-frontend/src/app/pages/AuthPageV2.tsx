import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Loader } from "lucide-react";
import { useSignUp, useClerk } from "@clerk/react";
import { api } from "../services/api";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";

const COLORS = {
  NAVY: "#0A2472",
  NAVY_LIGHT: "#0C2D8A",
  AMBER: "#FFBA08",
  CREAM: "#F8F9FA",
  MUTED: "#6B7280",
  GREEN: "#10B981",
  RED: "#EF4444",
};

export function AuthPageV2() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const { refresh } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subdomain, setSubdomain] = useState("");
  const [form, setForm] = useState({ name: "", school: "", email: "", password: "", confirmPassword: "" });
  const [passwordStrength, setPasswordStrength] = useState<"weak" | "medium" | "strong" | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "signup") setMode("signup");
    else if (m === "forgot") setMode("forgot");
    const sub = searchParams.get("subdomain") || "";
    if (sub) setSubdomain(sub.toLowerCase().trim());
  }, [searchParams]);

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

  useEffect(() => {
    const strength = calculatePasswordStrength(form.password);
    setPasswordStrength(strength);

    // Suggest subdomain as user types school name
    if (form.school && mode === "signup") {
      const suggested = form.school
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      setSuggestions(suggested ? [suggested] : []);
    }
  }, [form.password, form.school, mode]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (mode === "signup") {
      if (!form.name.trim()) newErrors.name = "Name required";
      if (!form.school.trim()) newErrors.school = "School name required";
      if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
        newErrors.email = "Valid email required";
      if (form.password.length < 8) newErrors.password = "Min 8 characters";
      if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = "Passwords don't match";
      if (passwordStrength === "weak")
        newErrors.password = "Password too weak";
    } else if (mode === "login") {
      if (!subdomain.trim()) newErrors.subdomain = "School subdomain required";
      if (!form.email) newErrors.email = "Email required";
      if (!form.password) newErrors.password = "Password required";
    } else if (mode === "forgot") {
      if (!form.email) newErrors.email = "Email required";
      if (!subdomain.trim()) newErrors.subdomain = "School subdomain required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === "signup") {
        // Create account
        const res = await api.post<{ slug?: string }>(
          "/api/onboard/signup",
          {
            schoolName: form.school,
            email: form.email,
            adminName: form.name,
            adminPassword: form.password,
            plan: "trial",
          }
        );

        // Create Clerk account
        const clerkRes = await signUp.create({
          emailAddress: form.email,
          password: form.password,
          firstName: form.name.split(" ")[0],
          lastName: form.name.split(" ").slice(1).join(" ") || undefined,
        }) as any;

        if (clerkRes?.createdSessionId) {
          await clerk.setActive({ session: clerkRes.createdSessionId });
        }

        const token = await clerk.session?.getToken();
        if (token) {
          await api.post("/api/auth/clerk-sync", {
            clerkToken: token,
            email: form.email,
            subdomain: res.data?.slug,
          });
        }

        toast.success("Account created! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else if (mode === "login") {
        const headers: Record<string, string> = {};
        if (subdomain) headers["x-tenant-subdomain"] = subdomain;

        await api.post(
          "/api/auth/login",
          {
            email: form.email,
            password: form.password,
            subdomain,
          },
          { headers }
        );

        await refresh();
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else if (mode === "forgot") {
        await api.post("/api/auth/forgot-password", {
          email: form.email,
          subdomain,
        });
        toast.success("Check your email for reset link");
        setMode("login");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return COLORS.MUTED;
    if (passwordStrength === "weak") return COLORS.RED;
    if (passwordStrength === "medium") return "#F59E0B";
    return COLORS.GREEN;
  };

  const benefits = [
    "✓ No credit card required",
    "✓ 7-day full access trial",
    "✓ All features included",
    "✓ WAEC templates built-in",
    "✓ Free WhatsApp integration",
    "✓ Export data anytime",
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen flex bg-gray-50">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col relative overflow-hidden p-12"
        style={{
          background: `linear-gradient(135deg, ${COLORS.NAVY} 0%, ${COLORS.NAVY_LIGHT} 100%)`,
        }}
      >
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10" style={{ background: COLORS.CREAM }} />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full opacity-10" style={{ background: COLORS.CREAM }} />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Header */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <GraduationCap size={20} color={COLORS.CREAM} />
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", color: COLORS.CREAM, fontSize: "1.3rem", fontWeight: 700 }}>
              Managen
            </span>
          </div>

          {/* Middle */}
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                color: COLORS.CREAM,
                fontSize: "2.2rem",
                fontWeight: 700,
                lineHeight: 1.2,
                marginBottom: "1.5rem",
              }}
            >
              {mode === "signup"
                ? "Join 340+ Schools"
                : mode === "forgot"
                ? "Forgot Password?"
                : "Welcome Back"}
            </h2>
            <p style={{ color: "rgba(248,249,250,0.8)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              {mode === "signup"
                ? "Get your school on Managen in less than 10 minutes. Full access, no credit card needed."
                : mode === "forgot"
                ? "We'll send you a link to reset your password."
                : "Sign in to access your school dashboard."}
            </p>

            {mode === "signup" && (
              <div className="space-y-2">
                {benefits.map((b) => (
                  <div key={b} style={{ color: "rgba(248,249,250,0.85)", fontSize: "0.9rem" }}>
                    {b}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer testimonial */}
          {mode === "signup" && (
            <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }} className="rounded-lg p-4">
              <p style={{ color: "rgba(248,249,250,0.9)", fontSize: "0.9rem", fontStyle: "italic", marginBottom: "0.75rem" }}>
                "Managen cut our admin work by 60% and improved fee collection to 92%."
              </p>
              <div style={{ color: "rgba(248,249,250,0.8)", fontSize: "0.85rem", fontWeight: 600 }}>
                — Mrs. Ama Osei, Sunshine Primary
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mode switcher */}
          {(mode === "login" || mode === "signup") && (
            <div className="flex gap-2 mb-8 p-1 rounded-lg" style={{ background: "#F3F4F6" }}>
              <button
                onClick={() => { setMode("login"); setErrors({}); }}
                className={`flex-1 py-2 rounded font-semibold transition-all ${
                  mode === "login"
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{ background: mode === "login" ? COLORS.NAVY : "transparent" }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode("signup"); setErrors({}); }}
                className={`flex-1 py-2 rounded font-semibold transition-all ${
                  mode === "signup"
                    ? "text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                style={{ background: mode === "signup" ? COLORS.NAVY : "transparent" }}
              >
                Sign Up
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* SIGNUP FIELDS */}
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.NAVY }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Kwaku Mensah"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border outline-none transition"
                    style={{
                      borderColor: errors.name ? COLORS.RED : "#E5E7EB",
                      background: "#F9FAFB",
                    }}
                  />
                  {errors.name && <p style={{ color: COLORS.RED, fontSize: "0.85rem", marginTop: "0.5rem" }}>{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.NAVY }}>
                    School Name
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., Accra Academy"
                    value={form.school}
                    onChange={(e) => setForm({ ...form, school: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border outline-none transition"
                    style={{
                      borderColor: errors.school ? COLORS.RED : "#E5E7EB",
                      background: "#F9FAFB",
                    }}
                  />
                  {errors.school && <p style={{ color: COLORS.RED, fontSize: "0.85rem", marginTop: "0.5rem" }}>{errors.school}</p>}
                  {suggestions.length > 0 && (
                    <div className="mt-2 p-2 rounded text-sm" style={{ background: `${COLORS.AMBER}10`, color: COLORS.NAVY }}>
                      <p className="text-xs opacity-75 mb-1">Your school URL will be:</p>
                      <p className="font-semibold">{suggestions[0]}.getschoolos.me</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* LOGIN: SUBDOMAIN */}
            {mode === "login" && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.NAVY }}>
                  School Subdomain
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="yourschool"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border outline-none transition"
                    style={{
                      borderColor: errors.subdomain ? COLORS.RED : "#E5E7EB",
                      background: "#F9FAFB",
                      borderRight: "none",
                    }}
                  />
                  <div className="px-4 py-2.5 rounded-r-lg border" style={{ borderColor: "#E5E7EB", background: "#F9FAFB", borderLeft: "none", color: COLORS.MUTED }}>
                    .getschoolos.me
                  </div>
                </div>
                {errors.subdomain && <p style={{ color: COLORS.RED, fontSize: "0.85rem", marginTop: "0.5rem" }}>{errors.subdomain}</p>}
              </div>
            )}

            {/* FORGOT: SUBDOMAIN */}
            {mode === "forgot" && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.NAVY }}>
                  School Subdomain
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="yourschool"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                    className="flex-1 px-4 py-2.5 rounded-l-lg border outline-none transition"
                    style={{
                      borderColor: errors.subdomain ? COLORS.RED : "#E5E7EB",
                      background: "#F9FAFB",
                      borderRight: "none",
                    }}
                  />
                  <div className="px-4 py-2.5 rounded-r-lg border" style={{ borderColor: "#E5E7EB", background: "#F9FAFB", borderLeft: "none", color: COLORS.MUTED }}>
                    .getschoolos.me
                  </div>
                </div>
                {errors.subdomain && <p style={{ color: COLORS.RED, fontSize: "0.85rem", marginTop: "0.5rem" }}>{errors.subdomain}</p>}
              </div>
            )}

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.NAVY }}>
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3" style={{ color: COLORS.MUTED }} />
                <input
                  type="email"
                  placeholder="admin@yourschool.edu.gh"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 pl-10 rounded-lg border outline-none transition"
                  style={{
                    borderColor: errors.email ? COLORS.RED : "#E5E7EB",
                    background: "#F9FAFB",
                  }}
                />
              </div>
              {errors.email && <p style={{ color: COLORS.RED, fontSize: "0.85rem", marginTop: "0.5rem" }}>{errors.email}</p>}
            </div>

            {/* PASSWORD */}
            {mode !== "forgot" && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.NAVY }}>
                  {mode === "signup" ? "Create Password" : "Password"}
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3" style={{ color: COLORS.MUTED }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2.5 pl-10 pr-10 rounded-lg border outline-none transition"
                    style={{
                      borderColor: errors.password ? COLORS.RED : "#E5E7EB",
                      background: "#F9FAFB",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                    style={{ color: COLORS.MUTED }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={{ color: COLORS.RED, fontSize: "0.85rem", marginTop: "0.5rem" }}>{errors.password}</p>}

                {mode === "signup" && form.password && (
                  <div className="mt-2 p-2 rounded text-sm"
                    style={{
                      background: `${getPasswordStrengthColor()}15`,
                      borderLeft: `3px solid ${getPasswordStrengthColor()}`,
                      color: COLORS.NAVY,
                    }}>
                    Strength: <span style={{ color: getPasswordStrengthColor(), fontWeight: 600 }}>{passwordStrength}</span>
                  </div>
                )}
              </div>
            )}

            {/* CONFIRM PASSWORD */}
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: COLORS.NAVY }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-3" style={{ color: COLORS.MUTED }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2.5 pl-10 pr-10 rounded-lg border outline-none transition"
                    style={{
                      borderColor: errors.confirmPassword ? COLORS.RED : form.confirmPassword && form.password === form.confirmPassword ? COLORS.GREEN : "#E5E7EB",
                      background: "#F9FAFB",
                    }}
                  />
                  {form.confirmPassword && form.password === form.confirmPassword && (
                    <CheckCircle2 size={16} className="absolute right-3 top-3" style={{ color: COLORS.GREEN }} />
                  )}
                </div>
                {errors.confirmPassword && <p style={{ color: COLORS.RED, fontSize: "0.85rem", marginTop: "0.5rem" }}>{errors.confirmPassword}</p>}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{
                background: COLORS.AMBER,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  {mode === "signup" ? "Creating Account..." : mode === "forgot" ? "Sending Reset..." : "Signing In..."}
                </>
              ) : (
                <>
                  {mode === "signup" ? "Create Account" : mode === "forgot" ? "Send Reset Link" : "Sign In"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* MODE SWITCHER FOOTER */}
            <div className="text-center text-sm" style={{ color: COLORS.MUTED }}>
              {mode === "login" && (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("signup"); setErrors({}); }}
                    style={{ color: COLORS.AMBER }}
                    className="font-semibold hover:underline"
                  >
                    Sign up
                  </button>
                  {" "}·{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("forgot"); setErrors({}); }}
                    style={{ color: COLORS.AMBER }}
                    className="font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </>
              )}
              {mode === "signup" && (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setErrors({}); }}
                    style={{ color: COLORS.AMBER }}
                    className="font-semibold hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
              {mode === "forgot" && (
                <>
                  <button
                    type="button"
                    onClick={() => { setMode("login"); setErrors({}); }}
                    style={{ color: COLORS.AMBER }}
                    className="font-semibold hover:underline"
                  >
                    Back to sign in
                  </button>
                </>
              )}
            </div>
          </form>

          {/* Security note */}
          <div className="mt-6 p-3 rounded-lg text-xs"
            style={{ background: `${COLORS.GREEN}10`, color: COLORS.GREEN }}>
            <div className="flex items-center gap-2">
              <Shield size={14} />
              <span>Your data is encrypted and never shared with third parties.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
