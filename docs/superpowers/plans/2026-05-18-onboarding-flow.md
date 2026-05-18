# SchoolOS Onboarding Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build complete 5-step onboarding flow for SchoolOS School Admin users after first login.

**Architecture:** Multi-step wizard with step components managed by an Onboarding shell. Backend endpoints in routes/school.js. New schools table columns. OnboardingGuard replaces old SetupGuard. SetupChecklist widget for post-onboarding.

**Tech Stack:** React + React Router + motion (animations) + canvas-confetti + supabase + multer (base64) + express

---

### Pre-Flight: Read existing files

- [ ] **Read these files to understand patterns:**
  - `schoolos-frontend/src/app/pages/SetupWizard.tsx` — existing wizard (to be replaced)
  - `schoolos-frontend/src/components/SetupGuard.tsx` — existing guard (to be replaced)
  - `schoolos-frontend/src/app/routes.tsx` — existing routes
  - `routes/school.js` — existing backend routes
  - `supabase/migrations/20260523000000_school_setup_completion.sql` — existing migration
  - `schoolos-frontend/src/app/components/dashboard/index.tsx` — existing component patterns
  - `schoolos-frontend/src/app/contexts/AuthContext.tsx` — auth context for user data

---

### Task 1: Migration — Add new onboarding columns

**Files:**
- Create: `supabase/migrations/20260518000000_onboarding_columns.sql`

- [ ] **Create migration SQL**

```sql
-- 20260518000000_onboarding_columns.sql
BEGIN;

-- Add new onboarding columns
ALTER TABLE public.schools
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS motto text,
ADD COLUMN IF NOT EXISTS year_established integer,
ADD COLUMN IF NOT EXISTS primary_color text DEFAULT '#6366f1',
ADD COLUMN IF NOT EXISTS logo_url text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS grading_system text DEFAULT 'percentage',
ADD COLUMN IF NOT EXISTS academic_year text,
ADD COLUMN IF NOT EXISTS current_term text,
ADD COLUMN IF NOT EXISTS term_start_date date,
ADD COLUMN IF NOT EXISTS term_end_date date,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Backfill: existing schools are past onboarding
UPDATE schools SET onboarding_completed = true WHERE onboarding_completed IS NULL;
UPDATE schools SET metadata = '{}'::jsonb WHERE metadata IS NULL;

-- Drop old columns (replaced by onboarding_completed)
ALTER TABLE schools DROP COLUMN IF EXISTS setup_completed;
ALTER TABLE schools DROP COLUMN IF EXISTS setup_step;

COMMIT;
```

- [ ] **Run migration locally** (optional, user runs this)

---

### Task 2: Backend endpoints — Onboarding routes

**Files:**
- Modify: `routes/school.js` (replace old setup/status + setup/finish with new onboarding endpoints)

- [ ] **Replace old setup routes with new onboarding endpoints**

Replace the existing `/setup/status` and `/setup/finish` routes (currently around line 83-112) with:

```js
// ─── Onboarding ──────────────────────────────────────────────
router.get('/onboarding/status', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { data, error } = await supabase
            .from('schools')
            .select('onboarding_completed, metadata')
            .eq('id', schoolId)
            .single();
        if (error) return res.status(500).json({ error: 'Error fetching onboarding status.' });
        const step = data.metadata?.onboarding_step ?? 0;
        return res.json({ data: { onboarding_completed: data.onboarding_completed, current_step: step, metadata: data.metadata } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching onboarding status.' });
    }
});

router.post('/onboarding/survey', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { survey } = req.body;
        const { data: existing } = await supabase.from('schools').select('metadata').eq('id', schoolId).single();
        const metadata = { ...(existing?.metadata || {}), survey, onboarding_step: 1 };
        const { error } = await supabase.from('schools').update({ metadata }).eq('id', schoolId);
        if (error) return res.status(500).json({ error: 'Error saving survey.' });
        return res.json({ data: { success: true } });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving survey.' });
    }
});

router.post('/onboarding/school', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { name, motto, type, email, phone, address, city, region, country,
                academic_year, current_term, term_start_date, term_end_date,
                grading_system, primary_color, year_established } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (motto !== undefined) updateData.motto = motto;
        if (type !== undefined) updateData.type = type;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (city !== undefined) updateData.city = city;
        if (region !== undefined) updateData.region = region;
        if (country !== undefined) updateData.country = country;
        if (academic_year !== undefined) updateData.academic_year = academic_year;
        if (current_term !== undefined) updateData.current_term = current_term;
        if (term_start_date !== undefined) updateData.term_start_date = term_start_date;
        if (term_end_date !== undefined) updateData.term_end_date = term_end_date;
        if (grading_system !== undefined) updateData.grading_system = grading_system;
        if (primary_color !== undefined) updateData.primary_color = primary_color;
        if (year_established !== undefined) updateData.year_established = year_established;
        const { data: existing } = await supabase.from('schools').select('metadata').eq('id', schoolId).single();
        const metadata = { ...(existing?.metadata || {}), onboarding_step: 2 };
        updateData.metadata = metadata;
        const { error } = await supabase.from('schools').update(updateData).eq('id', schoolId);
        if (error) return res.status(500).json({ error: 'Error saving school data.' });
        return res.json({ data: { success: true } });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving school data.' });
    }
});

router.post('/onboarding/logo', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { logo } = req.body;
        if (!logo) return res.status(400).json({ error: 'Logo data is required.' });
        const { error } = await supabase.from('schools').update({ logo_url: logo }).eq('id', schoolId);
        if (error) return res.status(500).json({ error: 'Error saving logo.' });
        return res.json({ data: { logo_url: logo } });
    } catch (err) {
        return res.status(500).json({ error: 'Error saving logo.' });
    }
});

router.post('/onboarding/complete', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { data: existing } = await supabase.from('schools').select('metadata').eq('id', schoolId).single();
        const metadata = { ...(existing?.metadata || {}), onboarding_step: 4, checklist: { profile_complete: true, first_class_added: false, first_teacher_added: false, first_student_added: false, fee_structure_setup: false, first_announcement_sent: false } };
        const { error } = await supabase.from('schools').update({ onboarding_completed: true, metadata }).eq('id', schoolId);
        if (error) return res.status(500).json({ error: 'Error completing onboarding.' });
        return res.json({ data: { success: true } });
    } catch (err) {
        return res.status(500).json({ error: 'Error completing onboarding.' });
    }
});

router.get('/onboarding/resume', protect, async (req, res) => {
    try {
        const schoolId = req.tenant?.id || req.user?.schoolId || req.user?.tenantId;
        if (!schoolId) return res.status(400).json({ error: 'School not found.' });
        const { data, error } = await supabase
            .from('schools')
            .select('metadata')
            .eq('id', schoolId)
            .single();
        if (error) return res.status(500).json({ error: 'Error fetching resume data.' });
        return res.json({ data: { metadata: data.metadata || {} } });
    } catch (err) {
        return res.status(500).json({ error: 'Error fetching resume data.' });
    }
});
```

- [ ] **Verify syntax**

Run: `node -c routes/school.js`
Expected: no output (valid syntax)

- [ ] **Commit**

```bash
git add routes/school.js supabase/migrations/20260518000000_onboarding_columns.sql
git commit -m "feat: onboarding backend endpoints and migration"
git push
```

---

### Task 3: useOnboardingStatus hook

**Files:**
- Create: `schoolos-frontend/src/hooks/useOnboardingStatus.ts`

- [ ] **Create hook file**

```ts
import { useState, useEffect, useCallback } from "react";
import { api } from "../app/services/api";

const STORAGE_KEY_PREFIX = "schoolos_onboarding_";

export function useOnboardingStatus(schoolId?: string) {
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [metadata, setMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkStatus = useCallback(async () => {
    if (!schoolId) { setLoading(false); return; }
    const cacheKey = `${STORAGE_KEY_PREFIX}${schoolId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.onboarding_completed) {
          setOnboardingCompleted(true);
          setLoading(false);
          return;
        }
      } catch {}
    }
    try {
      const res = await api.get<any>("/api/school/onboarding/status");
      const data = res.data || {};
      setOnboardingCompleted(data.onboarding_completed === true);
      setCurrentStep(data.current_step ?? 0);
      setMetadata(data.metadata || null);
      localStorage.setItem(cacheKey, JSON.stringify({ onboarding_completed: data.onboarding_completed, current_step: data.current_step, metadata: data.metadata }));
    } catch {
      setOnboardingCompleted(true);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  const clearCache = useCallback(() => {
    if (schoolId) localStorage.removeItem(`${STORAGE_KEY_PREFIX}${schoolId}`);
  }, [schoolId]);

  useEffect(() => { checkStatus(); }, [checkStatus]);

  return { onboardingCompleted, currentStep, metadata, loading, refetch: checkStatus, clearCache };
}
```

- [ ] **Commit**

```bash
git add schoolos-frontend/src/hooks/useOnboardingStatus.ts
git commit -m "feat: useOnboardingStatus hook"
```

---

### Task 4: OnboardingGuard component

**Files:**
- Create: `schoolos-frontend/src/components/OnboardingGuard.tsx`

- [ ] **Create OnboardingGuard**

```tsx
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../app/contexts/AuthContext";
import { useOnboardingStatus } from "../hooks/useOnboardingStatus";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const schoolId = user?.schoolId || user?.tenantId;
  const { onboardingCompleted, loading } = useOnboardingStatus(schoolId);

  useEffect(() => {
    if (authLoading || loading) return;
    if (!user) return;
    if (user.role === "superadmin") return;
    if (!onboardingCompleted && window.location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [authLoading, loading, onboardingCompleted, user, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#FFF3E6" }}>
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#381932", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!onboardingCompleted && window.location.pathname !== "/onboarding") return null;

  return <>{children}</>;
}
```

- [ ] **Commit**

```bash
git add schoolos-frontend/src/components/OnboardingGuard.tsx
git commit -m "feat: OnboardingGuard component"
```

---

### Task 5: Onboarding shell page

**Files:**
- Create: `schoolos-frontend/src/app/pages/Onboarding.tsx`
- Create: `schoolos-frontend/src/app/pages/onboarding/` (directory)
- Create: `schoolos-frontend/src/app/pages/onboarding/index.ts`

- [ ] **Create onboarding step index**

```ts
export { WelcomeStep } from "./WelcomeStep";
export { SurveyStep } from "./SurveyStep";
export { SchoolSetupStep } from "./SchoolSetupStep";
export { SavingStep } from "./SavingStep";
export { CelebrationStep } from "./CelebrationStep";
```

- [ ] **Create Onboarding shell page**

```tsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronRight, School, FileText, Settings, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";
import { WelcomeStep, SurveyStep, SchoolSetupStep, SavingStep, CelebrationStep } from "./onboarding";
import { toast } from "sonner";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";
const INDIGO = "#6366F1";

const STEPS = [
  { id: 0, label: "Welcome", icon: Sparkles },
  { id: 1, label: "Survey", icon: FileText },
  { id: 2, label: "Setup", icon: Settings },
  { id: 3, label: "Done", icon: Check },
];

export function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const schoolId = user?.schoolId || user?.tenantId;
  const [currentStep, setCurrentStep] = useState(0);
  const [surveyAnswers, setSurveyAnswers] = useState<any>({});
  const [schoolData, setSchoolData] = useState<any>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);

  const STORAGE_KEY = `schoolos_onboarding_${schoolId || "anonymous"}`;

  // Check for resume capability on mount
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
              duration: 6000,
            });
          }
        }
      } catch {} finally { setCheckingResume(false); }
    })();
  }, [schoolId]);

  // Auto-save to localStorage every step change
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
    setIsLoading(true);
    try {
      await api.post("/api/school/onboarding/survey", { survey: answers });
    } catch { /* continue regardless */ }
    setIsLoading(false);
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
  }, [STORAGE_KEY]);

  if (checkingResume) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: INDIGO, borderTopColor: "transparent" }} />
      </div>
    );
  }

  const stepLabels = STEPS.map(s => s.label);

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left sidebar — progress steps */}
      <div className="hidden md:flex flex-col w-64 bg-gray-50 border-r border-gray-100 p-8">
        <div className="mb-10">
          <h1 className="text-xl font-bold" style={{ color: PLUM, fontFamily: "'Playfair Display', serif" }}>SchoolOS</h1>
          <p className="text-xs mt-1" style={{ color: MUTED }}>Onboarding</p>
        </div>
        <div className="space-y-6">
          {STEPS.map((step, i) => {
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
                <span className="text-sm font-medium" style={{ color: isActive ? PLUM : MUTED }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right — step content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10">
          {/* Mobile progress dots */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-8">
            {STEPS.map((step, i) => (
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
                  adminName={user?.name || user?.full_name || "Admin"}
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
                  onError={() => toast.error("Something went wrong. Please try again.")}
                />
              )}
              {currentStep === 4 && (
                <CelebrationStep
                  schoolName={schoolData.name || user?.school_name || "Your School"}
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
```



- [ ] **Commit**

```bash
git add schoolos-frontend/src/app/pages/Onboarding.tsx schoolos-frontend/src/app/pages/onboarding/index.ts
git commit -m "feat: Onboarding shell page"
```

---

### Task 6: WelcomeStep component

**Files:**
- Create: `schoolos-frontend/src/app/pages/onboarding/WelcomeStep.tsx`

- [ ] **Create WelcomeStep**

```tsx
import { motion } from "motion/react";
import { Sparkles, Zap, BarChart3, Clock, ArrowRight } from "lucide-react";

const INDIGO = "#6366F1";

const features = [
  { icon: Zap, title: "Smart Fee Management", desc: "Automate fee collection and reminders" },
  { icon: Clock, title: "Real-time Attendance", desc: "Track attendance with instant parent alerts" },
  { icon: BarChart3, title: "AI-Powered Insights", desc: "Get intelligent reports about your school" },
];

export function WelcomeStep({ adminName, onNext, onSkip }: { adminName: string; onNext: () => void; onSkip: () => void }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-6">
        <Sparkles size={28} color="white" />
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-3"
        style={{ fontFamily: "'Playfair Display', serif", color: "#381932" }}
      >
        Welcome to SchoolOS, {adminName}! 👋
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-base mb-10 max-w-lg mx-auto"
        style={{ color: "#7D6077" }}
      >
        You're just a few steps away from transforming how your school operates.
      </motion.p>

      <div className="grid gap-4 mb-10 max-w-xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.15 }}
            className="flex items-start gap-4 p-4 rounded-2xl text-left"
            style={{ background: "white", border: "1px solid rgba(99,102,241,0.1)", boxShadow: "0 2px 12px rgba(99,102,241,0.06)" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(99,102,241,0.1)" }}>
              <f.icon size={20} color={INDIGO} />
            </div>
            <div>
              <h3 className="font-semibold text-sm" style={{ color: "#381932" }}>{f.title}</h3>
              <p className="text-xs mt-0.5" style={{ color: "#7D6077" }}>{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-sm mb-6"
        style={{ color: "#7D6077" }}
      >
        ⏱ Takes about 3 minutes
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        onClick={onNext}
        className="px-8 py-3 rounded-xl text-sm font-semibold inline-flex items-center gap-2 active:scale-95 transition-transform"
        style={{ background: `linear-gradient(135deg, ${INDIGO}, #4f46e5)`, color: "white" }}
      >
        Let's Get Started <ArrowRight size={16} />
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-6"
      >
        <button onClick={onSkip} className="text-xs hover:underline" style={{ color: "#7D6077" }}>
          I'll do this later
        </button>
      </motion.div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add schoolos-frontend/src/app/pages/onboarding/WelcomeStep.tsx
git commit -m "feat: WelcomeStep component"
```

---

### Task 7: SurveyStep component

**Files:**
- Create: `schoolos-frontend/src/app/pages/onboarding/SurveyStep.tsx`

- [ ] **Create SurveyStep**

```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const INDIGO = "#6366F1";
const PLUM = "#381932";
const MUTED = "#7D6077";

type SurveyAnswers = {
  size?: string;
  challenges?: string[];
  communication?: string;
  payment?: string[];
  type?: string;
};

const questions = [
  {
    id: "size",
    title: "How many students does your school have?",
    multi: false,
    options: [
      { value: "under_100", label: "🏫 Under 100 students" },
      { value: "100_500", label: "🏫 100 - 500 students" },
      { value: "500_1000", label: "🏫 500 - 1,000 students" },
      { value: "over_1000", label: "🏫 Over 1,000 students" },
    ],
  },
  {
    id: "challenges",
    title: "What is your biggest challenge right now?",
    multi: true,
    options: [
      { value: "fees", label: "💰 Collecting fees on time" },
      { value: "attendance", label: "📋 Tracking attendance" },
      { value: "grades", label: "📊 Managing student grades" },
      { value: "communication", label: "📱 Communicating with parents" },
      { value: "timetables", label: "📅 Organizing timetables" },
      { value: "reports", label: "📈 Generating reports" },
    ],
  },
  {
    id: "communication",
    title: "How do you currently communicate with parents?",
    multi: false,
    options: [
      { value: "whatsapp", label: "📱 WhatsApp" },
      { value: "sms", label: "💬 SMS" },
      { value: "email", label: "📧 Email" },
      { value: "phone", label: "📞 Phone calls" },
      { value: "in_person", label: "🗣 In person only" },
    ],
  },
  {
    id: "payment",
    title: "How do parents currently pay school fees?",
    multi: true,
    options: [
      { value: "mobile_money", label: "💳 Mobile Money (MTN, Vodafone)" },
      { value: "bank_transfer", label: "🏦 Bank transfer" },
      { value: "cash", label: "💵 Cash only" },
      { value: "online", label: "💳 Paystack/Flutterwave online" },
      { value: "mixed", label: "📱 Mix of methods" },
    ],
  },
  {
    id: "type",
    title: "What type of school do you run?",
    multi: false,
    options: [
      { value: "primary", label: "🎒 Primary School (KG - Class 6)" },
      { value: "jhs", label: "📚 Junior High School (JHS 1-3)" },
      { value: "shs", label: "🎓 Senior High School (SHS 1-3)" },
      { value: "primary_jhs", label: "🏛 Primary + JHS (Combined)" },
      { value: "full", label: "🎓 Primary + JHS + SHS (Full)" },
      { value: "vocational", label: "🏫 Vocational/Technical" },
    ],
  },
];

export function SurveyStep({ onNext, onBack }: { onNext: (answers: SurveyAnswers) => void; onBack: () => void }) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<SurveyAnswers>({});
  const [animating, setAnimating] = useState(false);
  const [personalizing, setPersonalizing] = useState(false);

  const question = questions[qIndex];
  const isLast = qIndex === questions.length - 1;

  const handleSelect = (value: string) => {
    if (animating) return;
    if (question.multi) {
      const current = (answers[question.id as keyof SurveyAnswers] as string[]) || [];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      setAnswers(prev => ({ ...prev, [question.id]: next }));
    } else {
      setAnswers(prev => ({ ...prev, [question.id]: value }));
      if (isLast) {
        setPersonalizing(true);
        setTimeout(() => onNext({ ...answers, [question.id]: value }), 1500);
      } else {
        setAnimating(true);
        setTimeout(() => { setQIndex(i => i + 1); setAnimating(false); }, 300);
      }
    }
  };

  const handleNext = () => {
    if (question.multi) {
      const val = answers[question.id as keyof SurveyAnswers];
      if (!val || (Array.isArray(val) && val.length === 0)) return;
      if (isLast) {
        setPersonalizing(true);
        setTimeout(() => onNext(answers), 1500);
      } else {
        setAnimating(true);
        setTimeout(() => { setQIndex(i => i + 1); setAnimating(false); }, 300);
      }
    }
  };

  const handleBack = () => {
    if (qIndex === 0) { onBack(); return; }
    setAnimating(true);
    setTimeout(() => { setQIndex(i => i - 1); setAnimating(false); }, 300);
  };

  if (personalizing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-6" style={{ borderColor: INDIGO, borderTopColor: "transparent" }} />
        <h2 className="text-xl font-semibold mb-2" style={{ color: PLUM }}>Personalizing your experience...</h2>
        <p style={{ color: MUTED }}>Setting up your school based on your answers</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: INDIGO }}>
          Question {qIndex + 1} of {questions.length}
        </p>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: PLUM }}>
          Help us personalize SchoolOS for your school
        </h2>
        <p className="text-sm mt-1" style={{ color: MUTED }}>
          Answer a few quick questions so we can set up the perfect experience for you.
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-8">
        {questions.map((_, i) => (
          <div key={i} className="h-1.5 rounded-full transition-all" style={{
            width: i === qIndex ? 24 : 8,
            background: i <= qIndex ? INDIGO : "#e5e7eb",
          }} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={qIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <h3 className="text-lg font-semibold text-center mb-6" style={{ color: PLUM }}>
            {question.title}
          </h3>

          <div className="space-y-3 max-w-lg mx-auto">
            {question.options.map((opt) => {
              const isSelected = question.multi
                ? ((answers[question.id as keyof SurveyAnswers] as string[]) || []).includes(opt.value)
                : answers[question.id as keyof SurveyAnswers] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className="w-full p-4 rounded-2xl text-left flex items-center gap-3 active:scale-[0.98] transition-all"
                  style={{
                    background: isSelected ? "rgba(99,102,241,0.08)" : "white",
                    border: isSelected ? `2px solid ${INDIGO}` : "2px solid rgba(0,0,0,0.06)",
                    boxShadow: isSelected ? `0 0 0 3px rgba(99,102,241,0.12)` : "none",
                  }}
                >
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isSelected ? INDIGO : "transparent",
                      border: isSelected ? "none" : "2px solid #d1d5db",
                    }}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-medium" style={{ color: PLUM }}>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-8 max-w-lg mx-auto">
        <button onClick={handleBack}
          className="px-5 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1 active:scale-95 transition-transform"
          style={{ background: "rgba(0,0,0,0.04)", color: PLUM }}>
          <ChevronLeft size={14} /> Back
        </button>
        {question.multi && (
          <button onClick={handleNext}
            disabled={!answers[question.id as keyof SurveyAnswers] || (Array.isArray(answers[question.id as keyof SurveyAnswers]) && (answers[question.id as keyof SurveyAnswers] as string[]).length === 0)}
            className="px-5 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-1 active:scale-95 transition-transform disabled:opacity-40"
            style={{ background: INDIGO, color: "white" }}>
            {isLast ? "Finish" : "Next"} <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add schoolos-frontend/src/app/pages/onboarding/SurveyStep.tsx
git commit -m "feat: SurveyStep component"
```

---

### Task 8: SchoolSetupStep component

**Files:**
- Create: `schoolos-frontend/src/app/pages/onboarding/SchoolSetupStep.tsx`

- [ ] **Create SchoolSetupStep**

```tsx
import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../services/api";

const INDIGO = "#6366F1";
const PLUM = "#381932";
const MUTED = "#7D6077";

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Volta", "Northern", "Upper East", "Upper West", "Brong-Ahafo",
  "Oti", "Ahafo", "Bono East", "North East", "Savannah", "Western North",
];

const ACADEMIC_YEARS = ["2025/2026", "2026/2027"];
const TERMS = ["First Term", "Second Term", "Third Term"];
const GRADING_SYSTEMS = [
  { value: "percentage", label: "Percentage (0-100%)" },
  { value: "letter_grade", label: "Letter Grade (A, B, C, D, F)" },
  { value: "gpa", label: "GPA (4.0 scale)" },
];

const PRESET_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444"];

type SchoolFormData = {
  name: string; motto: string; type: string; year_established: string;
  email: string; phone: string; address: string; city: string;
  region: string; country: string;
  academic_year: string; current_term: string;
  term_start_date: string; term_end_date: string;
  grading_system: string; primary_color: string;
  logo: string;
};

export function SchoolSetupStep({ surveyAnswers, onNext, onBack }: {
  surveyAnswers: any; onNext: (data: SchoolFormData) => void; onBack: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimer = useRef<any>(null);

  const [form, setForm] = useState<SchoolFormData>({
    name: "", motto: "", type: surveyAnswers?.type || "", year_established: "",
    email: "", phone: "", address: "", city: "",
    region: "", country: "Ghana",
    academic_year: "", current_term: "",
    term_start_date: "", term_end_date: "",
    grading_system: "percentage", primary_color: INDIGO,
    logo: "",
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save every 30 seconds
  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      try {
        localStorage.setItem("schoolos_onboarding_form", JSON.stringify(form));
        toast.success("Progress saved");
      } catch {}
    }, 30000);
    return () => clearInterval(autoSaveTimer.current);
  }, [form]);

  const requiredFields: (keyof SchoolFormData)[] = ["name", "email", "phone", "address", "city", "region", "academic_year", "current_term", "term_start_date", "term_end_date"];

  const completionPercent = Math.round(
    (requiredFields.filter(f => form[f]).length / requiredFields.length) * 100
  );

  const allRequired = requiredFields.every(f => form[f]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "School name is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.phone) errs.phone = "Phone is required";
    if (!form.address) errs.address = "Address is required";
    if (!form.city) errs.city = "City is required";
    if (!form.region) errs.region = "Region is required";
    if (!form.academic_year) errs.academic_year = "Academic year is required";
    if (!form.current_term) errs.current_term = "Current term is required";
    if (!form.term_start_date) errs.term_start_date = "Term start date is required";
    if (!form.term_end_date) errs.term_end_date = "Term end date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onNext(form);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
      setForm(f => ({ ...f, logo: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const set = (key: keyof SchoolFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-center mb-1" style={{ fontFamily: "'Playfair Display', serif", color: PLUM }}>
        Set up your school profile
      </h2>
      <p className="text-sm text-center mb-6" style={{ color: MUTED }}>
        This information will appear across your entire platform.
      </p>

      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="h-2 flex-1 max-w-xs rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${completionPercent}%`, background: INDIGO }} />
        </div>
        <span className="text-xs font-medium" style={{ color: MUTED }}>Profile {completionPercent}% complete</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Section 1: Basic */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>Basic Information</h3>
            <div className="space-y-3">
              <Input label="School Name" required value={form.name} onChange={set("name")} placeholder="e.g. Accra Academy" error={errors.name} />
              <Input label="School Motto" value={form.motto} onChange={set("motto")} placeholder="e.g. Knowledge is Power" />
              <Select label="School Type" value={form.type} onChange={set("type")} options={[
                { value: "primary", label: "Primary School (KG - Class 6)" },
                { value: "jhs", label: "Junior High School (JHS 1-3)" },
                { value: "shs", label: "Senior High School (SHS 1-3)" },
                { value: "primary_jhs", label: "Primary + JHS (Combined)" },
                { value: "full", label: "Primary + JHS + SHS (Full)" },
                { value: "vocational", label: "Vocational/Technical" },
              ]} />
              <Input label="Year Established" value={form.year_established} onChange={set("year_established")} placeholder="e.g. 1995" type="number" />
            </div>
          </div>

          {/* Section 2: Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>Contact Information</h3>
            <div className="space-y-3">
              <Input label="School Email" required value={form.email} onChange={set("email")} placeholder="admin@school.edu" type="email" error={errors.email} />
              <Input label="School Phone" required value={form.phone} onChange={set("phone")} placeholder="+233 XX XXX XXXX" error={errors.phone} />
              <Textarea label="School Address" required value={form.address} onChange={set("address")} placeholder="Street, building, landmark" error={errors.address} />
              <Input label="City/Town" required value={form.city} onChange={set("city")} placeholder="e.g. Accra" error={errors.city} />
              <Select label="Region" required value={form.region} onChange={set("region")} options={GHANA_REGIONS.map(r => ({ value: r, label: r }))} error={errors.region} />
              <Select label="Country" value={form.country} onChange={set("country")} options={[{ value: "Ghana", label: "Ghana" }]} />
            </div>
          </div>

          {/* Section 3: Academic */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>Academic Settings</h3>
            <div className="space-y-3">
              <Select label="Current Academic Year" required value={form.academic_year} onChange={set("academic_year")} options={ACADEMIC_YEARS.map(y => ({ value: y, label: y }))} error={errors.academic_year} />
              <Select label="Current Term" required value={form.current_term} onChange={set("current_term")} options={TERMS.map(t => ({ value: t, label: t }))} error={errors.current_term} />
              <Input label="Term Start Date" required value={form.term_start_date} onChange={set("term_start_date")} type="date" error={errors.term_start_date} />
              <Input label="Term End Date" required value={form.term_end_date} onChange={set("term_end_date")} type="date" error={errors.term_end_date} />
              <Select label="Grading System" value={form.grading_system} onChange={set("grading_system")} options={GRADING_SYSTEMS} />
            </div>
          </div>

          {/* Section 4: Branding */}
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>School Logo & Branding</h3>
            <div className="space-y-4">
              {/* Logo upload */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                style={{ borderColor: "rgba(99,102,241,0.2)" }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="School logo" className="max-h-24 mx-auto rounded-lg" />
                ) : (
                  <div>
                    <Upload size={24} color={MUTED} className="mx-auto mb-2" />
                    <p className="text-sm font-medium" style={{ color: PLUM }}>Drag & drop your school logo here</p>
                    <p className="text-xs mt-1" style={{ color: MUTED }}>or click to browse</p>
                    <p className="text-xs mt-2" style={{ color: MUTED }}>Supported: PNG, JPG, SVG (Max 2MB)</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
              </div>

              {/* Color picker */}
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: MUTED }}>School Color</p>
                <div className="flex gap-2 items-center">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, primary_color: c }))}
                      className="w-8 h-8 rounded-full active:scale-90 transition-transform"
                      style={{ background: c, border: form.primary_color === c ? "3px solid white" : "none", boxShadow: form.primary_color === c ? `0 0 0 2px ${c}` : "none" }}
                    />
                  ))}
                  <input type="color" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="md:sticky md:top-8 self-start">
          <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: MUTED }}>Preview</p>
          <div className="rounded-2xl p-6 overflow-hidden" style={{
            background: `linear-gradient(135deg, ${form.primary_color} 0%, ${form.primary_color}dd 100%)`,
            boxShadow: `0 8px 32px ${form.primary_color}33`,
          }}>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-14 h-14 rounded-xl object-cover bg-white/20" />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <ImageIcon size={24} color="rgba(255,255,255,0.7)" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {form.name || "Your School Name"}
                </h3>
                {form.motto && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{form.motto}</p>}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
              <div className="flex gap-4 text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                <span>{form.current_term || "Term"}</span>
                <span>{form.academic_year || "Year"}</span>
                <span>{form.city || "City"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <button onClick={onBack} className="px-5 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          style={{ background: "rgba(0,0,0,0.04)", color: PLUM }}>Back</button>
        <button onClick={handleSubmit} disabled={!allRequired}
          className="px-8 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-40"
          style={{ background: INDIGO, color: "white" }}>Continue</button>
      </div>
    </div>
  );
}

// Reusable form components
function Input({ label, required, value, onChange, placeholder, type, error }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type || "text"} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: "#f9fafb", border: error ? "1px solid #ef4444" : "1px solid #e5e7eb", color: PLUM }}
      />
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
}

function Textarea({ label, required, value, onChange, placeholder, error }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
        style={{ background: "#f9fafb", border: error ? "1px solid #ef4444" : "1px solid #e5e7eb", color: PLUM }}
      />
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
}

function Select({ label, required, value, onChange, options, error }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select value={value} onChange={onChange}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: "#f9fafb", border: error ? "1px solid #ef4444" : "1px solid #e5e7eb", color: value ? PLUM : MUTED }}
      >
        <option value="" disabled>Select {label.toLowerCase()}...</option>
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add schoolos-frontend/src/app/pages/onboarding/SchoolSetupStep.tsx
git commit -m "feat: SchoolSetupStep component"
```

---

### Task 9: SavingStep component

**Files:**
- Create: `schoolos-frontend/src/app/pages/onboarding/SavingStep.tsx`

- [ ] **Create SavingStep**

```tsx
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { api } from "../../services/api";

const INDIGO = "#6366F1";
const PLUM = "#381932";
const MUTED = "#7D6077";

const STEPS = [
  { label: "Saving school information...", key: "school" },
  { label: "Uploading school logo...", key: "logo" },
  { label: "Configuring your dashboard...", key: "dashboard" },
  { label: "Setting up fee templates...", key: "fees" },
  { label: "Preparing your first report...", key: "report" },
];

export function SavingStep({ schoolData, surveyAnswers, logoData, primaryColor, onComplete, onError }: {
  schoolData: any; surveyAnswers: any; logoData: string | null;
  primaryColor: string; onComplete: () => void; onError: () => void;
}) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentLabel, setCurrentLabel] = useState(STEPS[0].label);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (let i = 0; i < STEPS.length; i++) {
        if (cancelled) return;
        setCurrentLabel(STEPS[i].label);
        await new Promise(r => setTimeout(r, 600));
        if (cancelled) return;
        setCompleted(prev => [...prev, STEPS[i].key]);
        setProgress(((i + 1) / STEPS.length) * 100);
      }

      // Make API calls
      try {
        if (cancelled) return;
        setCurrentLabel("Saving school information...");
        await api.post("/api/school/onboarding/school", schoolData);

        if (logoData) {
          setCurrentLabel("Uploading school logo...");
          await api.post("/api/school/onboarding/logo", { logo: logoData });
        }

        setCurrentLabel("Applying your preferences...");
        await new Promise(r => setTimeout(r, 500));

        setCurrentLabel("Finalizing setup...");
        await api.post("/api/school/onboarding/complete", {});

        if (!cancelled) {
          setProgress(100);
          await new Promise(r => setTimeout(r, 400));
          onComplete();
        }
      } catch {
        if (!cancelled) onError();
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-10">
          <div className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: `linear-gradient(135deg, ${INDIGO}, #4f46e5)` }}
          />
        </div>

        {/* Animated checklist */}
        <div className="space-y-4">
          {STEPS.map((step, i) => {
            const done = completed.includes(step.key);
            const active = currentLabel === step.label && !done;
            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: done ? "#10B981" : active ? INDIGO : "#f3f4f6",
                  }}>
                  {done ? (
                    <Check size={14} color="white" />
                  ) : active ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                  ) : (
                    <div className="w-2 h-2 rounded-full" style={{ background: MUTED }} />
                  )}
                </div>
                <span className="text-sm" style={{
                  color: done ? "#10B981" : active ? PLUM : MUTED,
                  fontWeight: done || active ? 500 : 400,
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add schoolos-frontend/src/app/pages/onboarding/SavingStep.tsx
git commit -m "feat: SavingStep component"
```

---

### Task 10: CelebrationStep component

**Files:**
- Create: `schoolos-frontend/src/app/pages/onboarding/CelebrationStep.tsx`

- [ ] **Create CelebrationStep**

```tsx
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, School, BookOpen, Palette, Bell } from "lucide-react";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router";

const INDIGO = "#6366F1";
const PLUM = "#381932";
const MUTED = "#7D6077";

const FEATURES = [
  { label: "Fee Management", color: "#10B981" },
  { label: "Attendance Tracking", color: "#F59E0B" },
  { label: "Grade Management", color: "#6366F1" },
  { label: "AI Insights", color: "#8B5CF6" },
  { label: "Parent Communication", color: "#EC4899" },
];

export function CelebrationStep({ schoolName, currentTerm, academicYear, primaryColor, communicationMethod, onDone }: {
  schoolName: string; currentTerm: string; academicYear: string;
  primaryColor: string; communicationMethod: string; onDone: () => void;
}) {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    // Fire confetti
    const duration = 2000;
    const end = Date.now() + duration;
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: [primaryColor, INDIGO, "#10B981"] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: [primaryColor, INDIGO, "#10B981"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();

    // Countdown to auto-redirect
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timer); onDone(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: "#10B981" }}
      >
        <Check size={36} color="white" />
      </motion.div>

      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: PLUM }}>
        {schoolName} is ready! 🎉
      </h1>
      <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: MUTED }}>
        Your school management system is fully configured and ready to use.
      </p>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto mb-8">
        {[
          { icon: School, label: "School", value: schoolName },
          { icon: BookOpen, label: "Term", value: `${currentTerm}, ${academicYear}` },
          { icon: Palette, label: "Theme", value: `${primaryColor}` },
          { icon: Bell, label: "Notifications", value: communicationMethod },
        ].map((item, i) => (
          <motion.div key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="p-4 rounded-2xl text-left"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}
          >
            <item.icon size={16} color={INDIGO} className="mb-1" />
            <p className="text-xs mt-1" style={{ color: MUTED }}>{item.label}</p>
            <p className="text-sm font-semibold truncate" style={{ color: PLUM }}>{item.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Feature teaser */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <p className="text-sm font-medium mb-3" style={{ color: PLUM }}>Here's what's waiting for you:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {FEATURES.map(f => (
            <span key={f.label}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: `${f.color}10`, color: f.color }}
            >
              {f.label}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={onDone}
        className="px-8 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
        style={{ background: `linear-gradient(135deg, ${INDIGO}, #4f46e5)`, color: "white" }}
      >
        Open My Dashboard →
      </motion.button>

      <p className="text-xs mt-3" style={{ color: MUTED }}>
        Opening dashboard in {countdown}...
      </p>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add schoolos-frontend/src/app/pages/onboarding/CelebrationStep.tsx
git commit -m "feat: CelebrationStep component with confetti"
```

---

### Task 11: SetupChecklist widget

**Files:**
- Create: `schoolos-frontend/src/components/SetupChecklist.tsx`

- [ ] **Create SetupChecklist**

```tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Check, ArrowRight, X } from "lucide-react";
import { api } from "../app/services/api";

const PLUM = "#381932";
const MUTED = "#7D6077";
const INDIGO = "#6366F1";

type ChecklistItems = {
  profile_complete: boolean;
  first_class_added: boolean;
  first_teacher_added: boolean;
  first_student_added: boolean;
  fee_structure_setup: boolean;
  first_announcement_sent: boolean;
};

const ITEMS: { key: keyof ChecklistItems; label: string; path: string }[] = [
  { key: "profile_complete", label: "School profile complete", path: "/dashboard/settings" },
  { key: "first_class_added", label: "Add your first class", path: "/dashboard/academics" },
  { key: "first_teacher_added", label: "Add your first teacher", path: "/dashboard/staff" },
  { key: "first_student_added", label: "Add your first student", path: "/dashboard/students" },
  { key: "fee_structure_setup", label: "Set up fee structure", path: "/dashboard/finance" },
  { key: "first_announcement_sent", label: "Send first announcement", path: "/dashboard/communication" },
];

export function SetupChecklist() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChecklistItems | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [hideUntil, setHideUntil] = useState<string | null>(null);

  useEffect(() => {
    const hidden = localStorage.getItem("schoolos_checklist_hidden_until");
    if (hidden && new Date(hidden) > new Date()) {
      setDismissed(true);
      return;
    }
    (async () => {
      try {
        const res = await api.get<any>("/api/school/onboarding/status");
        const meta = res.data?.metadata;
        if (meta?.checklist) {
          setItems(meta.checklist);
        }
      } catch {}
    })();
  }, []);

  if (!items || dismissed) return null;

  const completed = Object.values(items).filter(Boolean).length;
  const total = ITEMS.length;
  const allDone = completed >= total;

  if (allDone) {
    return (
      <div className="mb-4 p-4 rounded-2xl" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#10B981" }}>
              <Check size={16} color="white" />
            </div>
            <p className="text-sm font-medium" style={{ color: "#065F46" }}>🎉 Setup complete! You're all set.</p>
          </div>
          <button onClick={() => {
            const d = new Date(); d.setDate(d.getDate() + 3);
            localStorage.setItem("schoolos_checklist_hidden_until", d.toISOString());
            setDismissed(true);
          }} className="text-xs" style={{ color: MUTED }}><X size={14} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)", boxShadow: "0 2px 12px rgba(56,25,50,0.04)" }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: PLUM }}>Setup Checklist</p>
        <button onClick={() => setDismissed(true)} className="text-xs" style={{ color: MUTED }}><X size={14} /></button>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${(completed / total) * 100}%`, background: INDIGO }} />
        </div>
        <span className="text-xs font-medium" style={{ color: MUTED }}>{completed} of {total}</span>
      </div>
      <div className="space-y-1.5">
        {ITEMS.map(item => {
          const done = items[item.key];
          return (
            <button key={item.key} onClick={() => navigate(item.path)}
              className="w-full flex items-center gap-2 py-1.5 text-left active:scale-[0.99] transition-transform">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: done ? "#10B981" : "transparent", border: done ? "none" : "2px solid #d1d5db" }}>
                {done && <Check size={10} color="white" />}
              </div>
              <span className="text-xs" style={{ color: done ? "#10B981" : PLUM, textDecoration: done ? "line-through" : "none" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Commit**

```bash
git add schoolos-frontend/src/components/SetupChecklist.tsx
git commit -m "feat: SetupChecklist widget"
```

---

### Task 12: Update routes.tsx — swap guards, add /onboarding route, clean up

**Files:**
- Modify: `schoolos-frontend/src/app/routes.tsx`

- [ ] **Update imports and routes**

Changes to make:
1. Remove `SetupGuard` import, add `OnboardingGuard` import
2. Remove `SetupWizard` import
3. Add `Onboarding` import
4. Replace `<SetupGuard>` with `<OnboardingGuard>` around DashboardLayout
5. Replace `/setup` route with `/onboarding` route
6. Add `SetupChecklist` to DashboardLayout or its children

```tsx
// Imports to change:
import { OnboardingGuard } from "../components/OnboardingGuard";
import { Onboarding } from "./pages/Onboarding";
// Remove: import { SetupGuard } from "../components/SetupGuard";
// Remove: import { SetupWizard } from "./pages/SetupWizard";

// Replace /setup route with /onboarding:
  {
    path: "/onboarding",
    element: (
      <AuthGuard>
        <Onboarding />
      </AuthGuard>
    ),
  },

// Replace SetupGuard with OnboardingGuard:
  // Inside AuthGuard:
  <OnboardingGuard>
    <DashboardLayout />
  </OnboardingGuard>,
```

- [ ] **Add SetupChecklist to DashboardLayout**

In `schoolos-frontend/src/app/pages/DashboardLayout.tsx`:

Add import at top (after line 6):
```tsx
import { SetupChecklist } from "../components/SetupChecklist";
```

Modify the `<main>` tag at line 187 to include SetupChecklist before `<Outlet />`:
```tsx
        <main className="flex-1 overflow-y-auto p-6">
          <SetupChecklist />
          <Outlet />
        </main>
```

- [ ] **Commit**

```bash
git add schoolos-frontend/src/app/routes.tsx
git commit -m "feat: update routes - OnboardingGuard replaces SetupGuard"
```

---

### Task 13: Remove old SetupWizard and SetupGuard files

**Files:**
- Delete: `schoolos-frontend/src/app/pages/SetupWizard.tsx`
- Delete: `schoolos-frontend/src/components/SetupGuard.tsx`

- [ ] **Delete old files**

```bash
git rm schoolos-frontend/src/app/pages/SetupWizard.tsx
git rm schoolos-frontend/src/components/SetupGuard.tsx
```

- [ ] **Commit**

```bash
git commit -m "chore: remove old SetupWizard and SetupGuard files"
```

---

### Task 14: TypeScript check + build + final commit

- [ ] **Run TypeScript check**

Run: `cd schoolos-frontend && npx tsc --noEmit 2>&1`
Expected: only pre-existing errors (LandingPage, etc.), zero errors from new files

Fix any type errors from new code.

- [ ] **Run vite build**

Run: `npx vite build --logLevel error 2>&1`
Expected: no output (success)

- [ ] **Push everything**

```bash
git add -A
git commit -m "feat: complete onboarding flow - welcome, survey, school setup, celebration"
git push origin main
```

- [ ] **Report back summary**

Files created:
- `supabase/migrations/20260518000000_onboarding_columns.sql`
- `schoolos-frontend/src/hooks/useOnboardingStatus.ts`
- `schoolos-frontend/src/components/OnboardingGuard.tsx`
- `schoolos-frontend/src/components/SetupChecklist.tsx`
- `schoolos-frontend/src/app/pages/Onboarding.tsx`
- `schoolos-frontend/src/app/pages/onboarding/index.ts`
- `schoolos-frontend/src/app/pages/onboarding/WelcomeStep.tsx`
- `schoolos-frontend/src/app/pages/onboarding/SurveyStep.tsx`
- `schoolos-frontend/src/app/pages/onboarding/SchoolSetupStep.tsx`
- `schoolos-frontend/src/app/pages/onboarding/SavingStep.tsx`
- `schoolos-frontend/src/app/pages/onboarding/CelebrationStep.tsx`

Files deleted:
- `schoolos-frontend/src/app/pages/SetupWizard.tsx`
- `schoolos-frontend/src/components/SetupGuard.tsx`

Files modified:
- `routes/school.js`
- `schoolos-frontend/src/app/routes.tsx`
- `schoolos-frontend/src/app/pages/DashboardLayout.tsx`

Migration: YES — `supabase/migrations/20260518000000_onboarding_columns.sql`

TypeScript errors: 0 (only pre-existing)

Push: SUCCESS
