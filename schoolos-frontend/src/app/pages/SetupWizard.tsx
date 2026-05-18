import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Check, ChevronRight, GraduationCap, Building2, BookOpen, Users, Wallet } from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const steps = [
  { id: 1, label: "School Profile", icon: Building2 },
  { id: 2, label: "Academic Setup", icon: BookOpen },
  { id: 3, label: "Staff & Classes", icon: Users },
  { id: 4, label: "Fee Configuration", icon: Wallet },
  { id: 5, label: "Done", icon: Check },
];

export function SetupWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>("/api/school/setup/status");
        if (res.data?.setup_completed === true) {
          navigate("/dashboard", { replace: true });
          return;
        }
        const stepVal = res.data?.setup_step || 1;
        setStep(stepVal);
      } catch {
        // If endpoint fails, let them proceed through wizard
      } finally {
        setCheckingStatus(false);
      }
    })();
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        const infoRes = await api.get<any>("/api/school/info");
        const school = infoRes.data?.school;
        if (school) {
          setSchoolName(school.name || "");
        }
      } catch { /* ignore */ }
    })();
  }, []);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await api.post("/api/school/setup/finish", {});
      toast.success("Setup complete! Welcome to your dashboard.");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Failed to complete setup");
    } finally {
      setSaving(false);
    }
  };

  const goToStep = (s: number) => {
    if (s > step) return;
    setStep(s);
  };

  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: MILK }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: PLUM, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: MILK }}>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` }}>
            <GraduationCap size={28} color={MILK} />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: PLUM }}>
            Welcome to {schoolName || "Your School"}
          </h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>
            Let's get your school set up in a few steps.
          </p>
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <button onClick={() => goToStep(s.id)}
                  className="flex flex-col items-center gap-1 disabled:opacity-50"
                  disabled={s.id > step}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                    style={{
                      background: s.id <= step ? `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})` : "rgba(56,25,50,0.08)",
                      color: s.id <= step ? MILK : MUTED,
                    }}>
                    {s.id < step ? <Check size={16} /> : s.id}
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight" style={{ color: s.id <= step ? PLUM : MUTED, maxWidth: 64 }}>
                    {s.label}
                  </span>
                </button>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px mx-2" style={{ background: s.id < step ? PLUM : "rgba(56,25,50,0.08)" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 4px 24px rgba(56,25,50,0.06)" }}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                  <Building2 size={20} color="#6366F1" />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: PLUM }}>School Profile</h2>
                  <p className="text-xs" style={{ color: MUTED }}>Confirm your school details</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: PLUM_LIGHT }}>
                Your school <strong>{schoolName || "—"}</strong> has been created. You can update your profile and contact details later in Settings.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
                  <BookOpen size={20} color="#10B981" />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: PLUM }}>Academic Setup</h2>
                  <p className="text-xs" style={{ color: MUTED }}>Configure academic terms and subjects</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: PLUM_LIGHT }}>
                Set up your academic calendar (terms, sessions) and define subjects for each class. You can do this in the <strong>Academics</strong> section after setup.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
                  <Users size={20} color="#F59E0B" />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: PLUM }}>Staff & Classes</h2>
                  <p className="text-xs" style={{ color: MUTED }}>Add teachers and set up classes</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: PLUM_LIGHT }}>
                Add teachers, create classes, and assign form teachers. You can manage all of this from the <strong>Staff Directory</strong> and <strong>Academics</strong> sections.
              </p>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(37,211,102,0.1)" }}>
                  <Wallet size={20} color="#25D366" />
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: PLUM }}>Fee Configuration</h2>
                  <p className="text-xs" style={{ color: MUTED }}>Set up fee structures</p>
                </div>
              </div>
              <p className="text-sm" style={{ color: PLUM_LIGHT }}>
                Configure fee structures, discounts, and payment terms for your school. You can manage fees in the <strong>Finance</strong> section later.
              </p>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(16,185,129,0.1)" }}>
                <Check size={32} color="#10B981" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: PLUM }}>
                You're All Set!
              </h2>
              <p className="text-sm mb-6" style={{ color: MUTED }}>
                Your school is ready to go. Click the button below to start managing {schoolName || "your school"}.
              </p>
              <button onClick={handleFinish} disabled={saving}
                className="px-8 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
                {saving ? "Completing..." : "Go to Dashboard"}
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={() => step > 1 && setStep(s => s - 1)}
            disabled={step <= 1}
            className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30 active:scale-95 transition-transform"
            style={{ background: "rgba(56,25,50,0.06)", color: PLUM }}>
            Back
          </button>
          {step < 5 && (
            <button onClick={() => setStep(s => s + 1)}
              className="px-5 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-1 active:scale-95 transition-transform"
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
              Continue
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
