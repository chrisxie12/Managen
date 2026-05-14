import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  ArrowRight,
  CheckCircle2,
  ArrowLeft,
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
  "GHS & NGN billing support",
];

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    school: "",
    email: "",
    password: "",
    subdomain: "", // Added for login/signup
  });

  useEffect(() => {
    const m = searchParams.get("mode");
    setMode(m === "signup" ? "signup" : "login");
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
              SchoolOS
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
              Join 340+ schools across Ghana and Nigeria managing fees,
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
              SchoolOS
            </span>
          </div>

          {/* Toggle tabs */}
          <div
            className="flex p-1 rounded-full mb-8"
            style={{
              background: "rgba(56,25,50,0.06)",
              border: `1px solid rgba(56,25,50,0.08)`,
            }}
          >
            {(["login", "signup"] as const).map((m) => (
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
                }}
              >
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

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
              {mode === "login" ? "Welcome back" : "Start your free trial"}
            </h1>
            <p style={{ color: MUTED, fontSize: "0.9rem" }}>
              {mode === "login"
                ? "Sign in to your school dashboard"
                : "Set up your school in under 10 minutes"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "login" && (
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
                  School Subdomain
                </label>
                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    color={MUTED}
                  />
                  <input
                    type="text"
                    placeholder="e.g. accra-ridge"
                    value={form.subdomain}
                    onChange={(e) => setField("subdomain", e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3.5 rounded-2xl outline-none text-sm"
                    style={{
                      background: "white",
                      border: `1.5px solid rgba(56,25,50,0.12)`,
                      color: PLUM,
                    }}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: MUTED }}>.schoolos.io</span>
                </div>
              </div>
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
                  placeholder="admin@yourschool.edu.gh"
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
                  <a
                    href="#"
                    style={{ color: PLUM_LIGHT, fontSize: "0.8rem" }}
                    className="hover:opacity-70"
                  >
                    Forgot password?
                  </a>
                </div>
              )}
            </div>

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
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                <>
                  {mode === "login" ? "Sign In" : "Create Free Account"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

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
        </div>
      </div>
    </div>
  );
}
