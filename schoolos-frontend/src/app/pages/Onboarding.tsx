import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { GraduationCap, Check } from "lucide-react";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { WelcomeStep, SurveyStep, SchoolSetupStep, SavingStep, CelebrationStep } from "./onboarding/index";
import { toast } from "sonner";

const NAVY = "#0A2472";
const MUTED = "#6B7280";
const INDIGO = "#6366F1";

const STEPS = [
  { id: 0, label: "Welcome" },
  { id: 1, label: "Survey" },
  { id: 2, label: "Setup" },
  { id: 3, label: "Saving" },
  { id: 4, label: "Done" },
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
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#F8F9FA" }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: INDIGO, borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F8F9FA", fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <GraduationCap size={22} color={NAVY} />
            <span className="font-bold text-lg" style={{ color: NAVY }}>SchoolOS</span>
          </div>
          <div className="flex items-center gap-3">
            {STEPS.slice(0, -1).map((step, i) => (
              <div key={step.id} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{
                  background: currentStep >= step.id ? INDIGO : "#e5e7eb",
                  transition: "background 0.3s",
                }} />
                {i < STEPS.length - 2 && <div className="w-4 h-px" style={{ background: currentStep > step.id ? INDIGO : "#e5e7eb" }} />}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <div className="rounded-3xl bg-white p-8 md:p-10" style={{ boxShadow: "0 4px 24px rgba(10,36,114,0.06)" }}>
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
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
