import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check, FileText, Settings, Sparkles } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { WelcomeStep, SurveyStep, SchoolSetupStep, SavingStep, CelebrationStep } from "./onboarding/index";
import { toast } from "sonner";

const NAVY = "#0A2472";
const MUTED = "#6B7280";
const INDIGO = "#6366F1";

const STEPS = [
  { id: 0, label: "Welcome", icon: Sparkles },
  { id: 1, label: "Survey", icon: FileText },
  { id: 2, label: "Setup", icon: Settings },
  { id: 3, label: "Done", icon: Check },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { user, school } = useAuth();
  const schoolId = school?.slug;
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<any>({});
  const [schoolData, setSchoolData] = useState<any>({});
  const [checkingResume, setCheckingResume] = useState(true);

  const STORAGE_KEY = `schoolos_onboarding_${schoolId || "anonymous"}`;

  useEffect(() => {
    if (!schoolId) { setCheckingResume(false); return; }
    (async () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.currentStep !== undefined && parsed.currentStep > 0) {
            setCurrentStep(parsed.currentStep);
            if (parsed.surveyAnswers) setSurveyAnswers(parsed.surveyAnswers);
            if (parsed.schoolData) setSchoolData(parsed.schoolData);
            toast("Welcome back! Continue where you left off?", {
              action: { label: "Continue", onClick: () => {} },
              cancel: { label: "Start Over", onClick: handleStartOver },
              duration: 6000,
            });
          }
        }
      } catch {} finally { setCheckingResume(false); }
    })();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStep,
      surveyAnswers,
      schoolData,
      updatedAt: new Date().toISOString(),
    }));
  }, [currentStep, surveyAnswers, schoolData, schoolId]);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSurveyComplete = useCallback(async (answers: any) => {
    setSurveyAnswers(answers);
    try {
      await api.post("/api/school/onboarding/survey", { survey: answers });
    } catch { /* continue regardless */ }
    handleStepChange(2);
  }, [handleStepChange]);

  const handleSchoolSetupComplete = useCallback((data: any) => {
    setSchoolData(data);
    handleStepChange(3);
  }, [handleStepChange]);

  const handleSavingComplete = useCallback(() => {
    handleStepChange(4);
    localStorage.removeItem(STORAGE_KEY);
  }, [handleStepChange, STORAGE_KEY]);

  const handleCelebrationDone = useCallback(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleStartOver = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentStep(0);
    setSurveyAnswers({});
    setSchoolData({});
    window.location.reload();
  }, [STORAGE_KEY]);

  if (checkingResume) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: INDIGO, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      <div className="hidden md:flex flex-col w-64 bg-gray-50 border-r border-gray-100 p-8">
        <div className="mb-10">
          <h1 className="text-xl font-bold" style={{ color: NAVY, fontFamily: "'Playfair Display', serif" }}>SchoolOS</h1>
          <p className="text-xs mt-1" style={{ color: MUTED }}>Onboarding</p>
        </div>
        <div className="space-y-6">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep >= step.id;
            const isCurrent = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: isActive ? `linear-gradient(135deg, ${INDIGO}, #4f46e5)` : "#f3f4f6",
                    color: isActive ? "white" : MUTED,
                    boxShadow: isCurrent ? `0 0 0 3px rgba(99,102,241,0.2)` : "none",
                  }}>
                  {currentStep > step.id ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span className="text-sm font-medium" style={{ color: isActive ? NAVY : MUTED }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="flex md:hidden items-center justify-center gap-2 mb-8">
            {STEPS.map((step) => (
              <div key={step.id}
                className="w-3 h-3 rounded-full transition-all"
                style={{
                  background: currentStep >= step.id ? INDIGO : "#e5e7eb",
                  transform: currentStep === step.id ? "scale(1.3)" : "scale(1)",
                }}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 0 && (
                <WelcomeStep
                  adminName={user?.fullName || "Admin"}
                  onNext={() => handleStepChange(1)}
                  onSkip={() => {
                    api.post("/api/school/onboarding/complete", {}).catch(() => {});
                    localStorage.removeItem(STORAGE_KEY);
                    navigate("/dashboard", { replace: true });
                  }}
                />
              )}
              {currentStep === 1 && (
                <SurveyStep
                  onNext={handleSurveyComplete}
                  onBack={() => handleStepChange(0)}
                />
              )}
              {currentStep === 2 && (
                <SchoolSetupStep
                  surveyAnswers={surveyAnswers}
                  onNext={handleSchoolSetupComplete}
                  onBack={() => handleStepChange(1)}
                />
              )}
              {currentStep === 3 && (
                <SavingStep
                  schoolData={schoolData}
                  surveyAnswers={surveyAnswers}
                  logoData={schoolData.logo || null}
                  primaryColor={schoolData.primary_color || INDIGO}
                  onComplete={handleSavingComplete}
                  onError={(msg) => toast.error(msg || "Something went wrong. Please try again.")}
                />
              )}
              {currentStep === 4 && (
                <CelebrationStep
                  schoolName={schoolData.name || school?.name || "Your School"}
                  currentTerm={schoolData.current_term || "First Term"}
                  academicYear={schoolData.academic_year || "2025/2026"}
                  primaryColor={schoolData.primary_color || INDIGO}
                  communicationMethod={surveyAnswers.communication || "Email"}
                  onDone={handleCelebrationDone}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
