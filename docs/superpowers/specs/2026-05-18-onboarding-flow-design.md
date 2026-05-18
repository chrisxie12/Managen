# SchoolOS Onboarding Flow — Design Spec

## Overview
Multi-step onboarding experience for SchoolOS School Admin users after first login, before the dashboard is accessible.

## Architecture

### Flow
Login → OnboardingGuard → (onboarding_completed?) → /onboarding (5 steps) → Dashboard + SetupChecklist

### Data Model
`schools` table gets new columns:
- `onboarding_completed boolean DEFAULT false` (replaces `setup_completed`)
- `motto text`, `year_established integer`, `primary_color text`, `logo_url text` (base64)
- `region text`, `city text`, `grading_system text`, `academic_year text`
- `current_term text`, `term_start_date date`, `term_end_date date`
- `metadata jsonb DEFAULT '{}'` (stores survey answers, checklist state)

Old columns `setup_completed`, `setup_step` are dropped.

### Backend Endpoints (routes/school.js)
- `GET /onboarding/status` — returns onboarding_completed + current_step + metadata
- `POST /onboarding/survey` — saves survey responses to metadata
- `POST /onboarding/school` — saves school profile to columns
- `POST /onboarding/logo` — saves base64 logo to logo_url
- `POST /onboarding/complete` — sets onboarding_completed = true
- `GET /onboarding/resume` — returns saved step/progress

### Frontend Components
- `hooks/useOnboardingStatus.ts` — fetches status, caches in localStorage
- `components/OnboardingGuard.tsx` — wraps dashboard, redirects to /onboarding
- `components/SetupChecklist.tsx` — post-onboarding task list widget
- `pages/Onboarding.tsx` — shell with step management
- `pages/onboarding/WelcomeStep.tsx` — step 0
- `pages/onboarding/SurveyStep.tsx` — step 1 (5 questions)
- `pages/onboarding/SchoolSetupStep.tsx` — step 2 (form + preview)
- `pages/onboarding/SavingStep.tsx` — step 3 (animated save)
- `pages/onboarding/CelebrationStep.tsx` — step 4 (confetti)

### Data Flow
1. Login → OnboardingGuard calls `GET /onboarding/status`
2. If `onboarding_completed = false` → navigate to `/onboarding`
3. Steps 0-4 each save to localStorage (key: `schoolos_onboarding_{schoolId}`)
4. Step 3 calls API endpoints sequentially
5. Step 4 calls `POST /onboarding/complete` → redirects to dashboard
6. Dashboard shows SetupChecklist widget until all 6 tasks done
7. On next login, OnboardingGuard checks `onboarding_completed = true` → pass through

### Resume Capability
- Current step + answers saved to localStorage after each step
- On mount, Onboarding.tsx checks localStorage for saved progress
- Shows toast "Welcome back! Continue where you left off?"
- Options: Continue Setup | Start Over

### Logo Upload
- Base64 encoded image stored in `logo_url` column
- Frontend: FileReader → readAsDataURL → send as string to POST /onboarding/logo
- Backend: validates base64, stores in logo_url column

### metadata JSONB Shape
```json
{
  "survey": {
    "size": "under_100|100_500|500_1000|over_1000",
    "challenges": ["fees", "attendance", "grades", "communication", "timetables", "reports"],
    "communication": "whatsapp|sms|email|phone|in_person",
    "payment": ["mobile_money", "bank_transfer", "cash", "online", "mixed"],
    "type": "primary|jhs|shs|primary_jhs|full|vocational|tertiary"
  },
  "checklist": {
    "profile_complete": true,
    "first_class_added": false,
    "first_teacher_added": false,
    "first_student_added": false,
    "fee_structure_setup": false,
    "first_announcement_sent": false
  },
  "onboarding_step": 0
}
```

### Migration Strategy
1. Add all new columns
2. Set `onboarding_completed = true` for existing schools (they're past onboarding)
3. Pre-fill `metadata = '{}'` for all rows
4. Drop `setup_completed`, `setup_step` columns (ALTER TABLE DROP COLUMN IF EXISTS)

### Dependencies
- `canvas-confetti` — already installed
- `motion` — already installed (for animations)
- `react-day-picker` — already installed
- Multer — already available in backend

### Order of Implementation
1. Migration SQL
2. Backend endpoints
3. useOnboardingStatus hook + OnboardingGuard
4. Onboarding shell page
5. WelcomeStep
6. SurveyStep
7. SchoolSetupStep
8. SavingStep
9. CelebrationStep
10. SetupChecklist
11. Routes update
12. Remove old SetupWizard/SetupGuard
13. TypeScript check + build
