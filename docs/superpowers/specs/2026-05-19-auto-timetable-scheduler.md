# Automated Timetable Scheduler — Design Spec

## Context

Existing codebase has greedy scoring-based scheduler (`services/timetableScheduler.js`), full CRUD timetable routes, scheduling settings, rooms, teacher availability, and a `TimetableScheduler.tsx` frontend with Generate/Overwrite buttons and grid preview. The Academics tab also has a manual timetable CRUD sub-tab.

## Scope

Replace greedy scoring with backtracking + MRV (Most Constrained Variable) CSP solver. Add two DB columns. Enhance frontend with conflict reports.

## Changes

### 1. Database Migration

```sql
ALTER TABLE class_subjects ADD COLUMN IF NOT EXISTS allow_consecutive BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS max_periods_per_day INT DEFAULT 6;
```

### 2. Scheduler Service (`services/timetableScheduler.js`)

**Algorithm:** Backtracking with MRV heuristic + forward checking.

- **Variables:** Required slots = `class_subjects.periods_per_week` per subject
- **Domains:** All (day, period_number) combinations from `school_scheduling_settings.days_of_week × periods_per_day`
- **Hard constraints (MUST satisfy):**
  1. No teacher double-booked (same day+period across classes)
  2. No room double-booked (same day+period)
  3. Teacher available (from `users.availability` JSON)
  4. Teacher max periods per day (`users.max_periods_per_day`, default 6)
  5. No duplicate subject on same day (unless `class_subjects.allow_consecutive = TRUE`)
- **Soft constraints (score, optimize):**
  1. Spread subjects evenly across days (minimize stddev of day counts)
  2. Prefer contiguous teacher blocks (penalize gaps)
  3. Prefer earlier periods (morning slots score better)

**MRV heuristic:** Sort unassigned slots by domain size ascending (fewest valid day/period combos first) to fail fast.

**Return shape:**
```javascript
{
  success: boolean,
  timetable: Array<{ day, period_number, subject_id, teacher_id, room_id, ... }>,
  conflicts: Array<{ type: 'teacher_overlap'|'room_overlap'|'teacher_unavailable'|'exceeds_max_periods'|'duplicate_subject', message: string }>,
  iterations: number,
  totalRequired: number,
  totalAssigned: number,
  score: number  // sum of soft constraint penalties (lower = better)
}
```

### 3. API Endpoints (already exist, update auto-generate response shape)

- `POST /api/school/timetable/auto-generate` — already exists at `school.js:1342`, update to return `conflicts` + `score` in response
- `GET /api/school/timetable/constraints` — already exists at `school.js:1360`, add `max_periods_per_day` to teacher data
- `PUT /api/school/timetable/teacher-availability` — already exists

### 4. Frontend (`TimetableScheduler.tsx`)

Keep existing structure. Add:

- **Conflict report panel** — shown when generation is partial. Lists each conflict with type badge and message.
- **Score indicator** — show soft constraint score when generation succeeds.
- **Validation hints** — before generation, warn if total required slots > total available slots.
- Keep Generate Preview, Save, Generate & Overwrite buttons, teacher availability editor, grid view.

### 5. Academics Tab Integration

Add an "Auto Generate" button in the Academics timetable sub-tab that opens the conflict/generation modal, so teachers/ admins don't need to navigate away.

## Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/20260519120000_timetable_scheduler_enhancements.sql` | New migration |
| `services/timetableScheduler.js` | Full rewrite: greedy → backtracking MRV |
| `routes/school.js` | Minor: add `conflicts` + `score` to auto-generate response |
| `schoolos-frontend/src/app/pages/TimetableScheduler.tsx` | Add conflict report + validation warnings |
| `schoolos-frontend/src/app/pages/Academics.tsx` | Add "Auto Generate" button in timetable tab |

## Constraints Summary

| # | Constraint | Type | Source |
|---|-----------|------|--------|
| 1 | No teacher double-booked | Hard | `timetable` + in-progress assignments |
| 2 | No room double-booked | Hard | `rooms` + in-progress assignments |
| 3 | Teacher must be available | Hard | `users.availability` |
| 4 | Teacher ≤ max_periods_per_day | Hard | `users.max_periods_per_day` |
| 5 | No duplicate subject per day | Hard | `class_subjects.allow_consecutive` |
| 6 | Spread subjects evenly | Soft | Stddev of day counts |
| 7 | Avoid teacher gaps | Soft | Distance between periods |
| 8 | Prefer morning periods | Soft | Period number weighting |
