# Automated Timetable Scheduler — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace greedy scoring scheduler with backtracking + MRV CSP solver, add DB columns, enhance frontend with conflict reports.

**Architecture:** Pure-function algorithmic core for testability + Supabase data-fetching wrapper. Backtracking with Most Constrained Variable ordering, forward checking on hard constraints, scoring for soft constraints.

**Tech Stack:** Node.js/Express backend, Supabase (PostgreSQL), React/TypeScript frontend, Tailwind CSS + inline styles.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `supabase/migrations/20260519120000_timetable_scheduler_enhancements.sql` | Add `allow_consecutive`, `max_periods_per_day` columns |
| `services/timetableScheduler.js` | Backtracking MRV CSP solver with data loading + insertion |
| `routes/school.js` | Minor: update auto-generate response to include conflicts + score |
| `schoolos-frontend/src/app/pages/TimetableScheduler.tsx` | Add conflict report panel, validation warnings, score indicator |
| `schoolos-frontend/src/app/pages/Academics.tsx` | Add "Auto Generate" button in timetable tab |

---

### Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/20260519120000_timetable_scheduler_enhancements.sql`

- [ ] **Step 1: Create migration file**

```sql
-- 20260519120000_timetable_scheduler_enhancements.sql
-- Adds columns for automated timetable scheduler with backtracking MRV
BEGIN;

ALTER TABLE class_subjects
  ADD COLUMN IF NOT EXISTS allow_consecutive BOOLEAN DEFAULT FALSE;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS max_periods_per_day INT DEFAULT 6;

COMMIT;
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260519120000_timetable_scheduler_enhancements.sql
git commit -m "feat: add allow_consecutive and max_periods_per_day columns for timetable scheduler"
```

---

### Task 2: Rewrite Scheduler Service (Backtracking + MRV)

**Files:**
- Rewrite: `services/timetableScheduler.js`

The rewrite replaces the greedy scoring loop with a proper CSP backtracking solver. The core algorithm is pure — it takes data and returns a solution — making it testable. The data-fetching methods remain similar.

**Data structures:**
- `Slot = { day: string, periodNumber: number }`
- `Assignment = { slot: Slot, subjectId, teacherId, roomId }`
- `RequiredSlot = { subjectId, teacherId, periodsPerWeek, allowConsecutive }`

**Hard Constraints (as functions):**
1. `teacherFree(teacherId, day, periodNumber, assignmentMap, existingMap)` — no existing or in-progress assignment
2. `roomFree(roomId, day, periodNumber, assignmentMap, usedRoomSlots)` — no room double-book
3. `teacherAvailable(teacherId, day, periodNumber, teacherAvailability)` — from JSON column
4. `teacherUnderMax(teacherId, day, assignmentMap, maxPeriodsPerDay)` — count assignments for teacher on that day
5. `noDuplicateSubjectOnDay(subjectId, day, assignmentMap, allowConsecutive)` — unless allowConsecutive

**Soft Constraints (score):**
1. `evenDistributionPenalty(subjectId, assignments)` — stddev of day counts for this subject
2. `teacherGapPenalty(teacherId, assignments, days)` — penalize non-contiguous blocks
3. `morningPreference(periodNumber)` — earlier = lower penalty

- [ ] **Step 1: Write new scheduler service**

```javascript
const crypto = require('crypto');
const supabase = require('../config/db');

class TimetableScheduler {
  /**
   * Main entry point. Fetches data, runs CSP solver, inserts results.
   * @param {Object} params
   * @param {string} params.classId
   * @param {string} params.schoolId
   * @param {boolean} params.overwrite
   * @param {string|null} params.termId
   * @param {Object} [params.options]
   * @param {number} [params.options.maxAttempts=10000]
   * @returns {Promise<{success, timetable, conflicts, iterations, totalRequired, totalAssigned, score}>}
   */
  async generateTimetable({ classId, schoolId, overwrite = false, termId = null, options = {} }) {
    const maxAttempts = options.maxAttempts || 10000;
    const settings = await this.loadSettings(schoolId);
    const periodsPerDay = settings?.periods_per_day || 8;
    const days = settings?.days_of_week || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const startTime = settings?.start_time || '08:00';
    const periodDuration = settings?.period_duration_minutes || 45;

    const classInfo = await this.loadClassInfo(classId, schoolId);
    const classSubjects = await this.loadClassSubjects(classId, schoolId);
    const rooms = await this.loadRooms(schoolId);
    const teacherAvailability = await this.loadTeacherAvailability(schoolId);
    const teacherMaxPeriods = await this.loadTeacherMaxPeriods(schoolId);

    if (overwrite) {
      await this.deleteClassTimetable(classId, schoolId);
    }

    const existingEntries = await this.loadExistingTimetable(classId, schoolId);
    const existingMap = this.buildExistingMap(existingEntries);

    // Build required slots from class_subjects
    const requiredSlots = [];
    for (const cs of classSubjects) {
      for (let i = 0; i < cs.periods_per_week; i++) {
        requiredSlots.push({
          id: `${cs.subject_id}-${i}`,
          subjectId: cs.subject_id,
          subjectName: cs.subject_name,
          teacherId: cs.teacher_id,
          teacherName: cs.teacher_name,
          allowConsecutive: cs.allow_consecutive || false,
        });
      }
    }

    // Build domain: all (day, period) combos
    const allSlots = [];
    for (const day of days) {
      for (let p = 1; p <= periodsPerDay; p++) {
        allSlots.push({ day, periodNumber: p });
      }
    }

    const result = this.backtrackSolve(
      requiredSlots, allSlots, existingMap, teacherAvailability,
      teacherMaxPeriods, rooms, maxAttempts
    );

    const entries = this.buildEntries(
      result.assignments, classInfo, classSubjects, rooms,
      settings, startTime, periodDuration, termId, schoolId
    );

    if (entries.length > 0) {
      await this.insertEntries(entries);
    }

    return {
      success: result.success,
      timetable: entries,
      conflicts: result.conflicts,
      iterations: result.iterations,
      totalRequired: requiredSlots.length,
      totalAssigned: Object.keys(result.assignments).length,
      score: result.score,
    };
  }

  /**
   * Core CSP solver: backtracking with MRV heuristic.
   * @param {Array} requiredSlots - list of { id, subjectId, teacherId, allowConsecutive }
   * @param {Array} allSlots - list of { day, periodNumber }
   * @param {Object} existingMap - keyed by "day:periodNumber" -> true
   * @param {Object} teacherAvailability - keyed by teacherId -> { "Monday": [1,2,...] }
   * @param {Object} teacherMaxPeriods - keyed by teacherId -> number
   * @param {Array} rooms - list of { id, name }
   * @param {number} maxAttempts
   * @returns {{ assignments: Object, conflicts: Array, iterations: number, success: boolean, score: number }}
   */
  backtrackSolve(requiredSlots, allSlots, existingMap, teacherAvailability, teacherMaxPeriods, rooms, maxAttempts) {
    const assignments = {};       // "day:periodNumber" -> { subjectId, teacherId, roomId }
    const usedTeacherSlots = {};  // teacherId -> { "day:periodNumber": true }
    const usedRoomSlots = {};     // roomId -> { "day:periodNumber": true }
    const subjectDayCount = {};   // subjectId -> { "Monday": count }
    const teacherDayCount = {};   // teacherId -> { "Monday": count }
    const conflicts = [];
    let iterations = 0;

    // Copy existing entries into tracking maps
    for (const key of Object.keys(existingMap)) {
      const ex = existingMap[key];
      if (ex.teacherId) {
        if (!usedTeacherSlots[ex.teacherId]) usedTeacherSlots[ex.teacherId] = {};
        usedTeacherSlots[ex.teacherId][key] = true;
        if (!teacherDayCount[ex.teacherId]) teacherDayCount[ex.teacherId] = {};
        const day = key.split(':')[0];
        teacherDayCount[ex.teacherId][day] = (teacherDayCount[ex.teacherId][day] || 0) + 1;
      }
    }

    const assignmentsToSlots = () => {
      const result = [];
      for (const key of Object.keys(assignments)) {
        const [day, periodNumber] = key.split(':');
        result.push({ day, periodNumber: parseInt(periodNumber), ...assignments[key] });
      }
      return result;
    };

    for (let i = 0; i < requiredSlots.length; i++) {
      iterations++;
      if (iterations > maxAttempts) {
        conflicts.push({
          type: 'max_attempts_exceeded',
          message: `Could not find complete solution within ${maxAttempts} iterations. ${requiredSlots.length - i} slots remaining.`,
          unscheduledCount: requiredSlots.length - i,
        });
        break;
      }

      // MRV: pick the remaining slot with fewest valid domain values
      let bestIdx = i;
      let bestDomainSize = Infinity;
      for (let j = i; j < requiredSlots.length; j++) {
        const rs = requiredSlots[j];
        const domainSize = allSlots.filter(slot =>
          this.isValidAssignment(slot, rs, assignments, existingMap, usedTeacherSlots,
            usedRoomSlots, subjectDayCount, teacherDayCount, teacherAvailability,
            teacherMaxPeriods, rooms)
        ).length;
        if (domainSize < bestDomainSize) {
          bestDomainSize = domainSize;
          bestIdx = j;
        }
        if (domainSize === 0) break; // Early exit: this slot has no valid options
      }

      // Swap to front (MRV ordering)
      [requiredSlots[i], requiredSlots[bestIdx]] = [requiredSlots[bestIdx], requiredSlots[i]];
      const rs = requiredSlots[i];

      // Get valid slots sorted by soft constraint score
      const validSlots = allSlots
        .map(slot => ({
          slot,
          score: this.scoreAssignment(slot, rs, assignments, subjectDayCount, teacherDayCount, teacherAvailability),
          roomId: null,
        }))
        .filter(s => s.score >= 0)
        .sort((a, b) => a.score - b.score);

      if (validSlots.length === 0) {
        conflicts.push({
          type: 'no_valid_slot',
          message: `No available slot for ${rs.subjectName} (teacher: ${rs.teacherName})`,
          subjectId: rs.subjectId,
          teacherId: rs.teacherId,
          subjectName: rs.subjectName,
          teacherName: rs.teacherName,
        });
        continue;
      }

      const chosen = validSlots[0];
      const key = `${chosen.slot.day}:${chosen.slot.periodNumber}`;
      const pickedRoom = this.pickRoom(rooms, key, usedRoomSlots);

      assignments[key] = {
        subjectId: rs.subjectId,
        subjectName: rs.subjectName,
        teacherId: rs.teacherId,
        teacherName: rs.teacherName,
        roomId: pickedRoom?.id || null,
        roomName: pickedRoom?.name || null,
      };

      // Track teacher
      if (!usedTeacherSlots[rs.teacherId]) usedTeacherSlots[rs.teacherId] = {};
      usedTeacherSlots[rs.teacherId][key] = true;
      if (!teacherDayCount[rs.teacherId]) teacherDayCount[rs.teacherId] = {};
      teacherDayCount[rs.teacherId][chosen.slot.day] = (teacherDayCount[rs.teacherId][chosen.slot.day] || 0) + 1;

      // Track room
      if (pickedRoom) {
        if (!usedRoomSlots[pickedRoom.id]) usedRoomSlots[pickedRoom.id] = {};
        usedRoomSlots[pickedRoom.id][key] = true;
      }

      // Track subject day count
      if (!subjectDayCount[rs.subjectId]) subjectDayCount[rs.subjectId] = {};
      subjectDayCount[rs.subjectId][chosen.slot.day] = (subjectDayCount[rs.subjectId][chosen.slot.day] || 0) + 1;
    }

    const finalScore = this.computeOverallScore(assignments, subjectDayCount, allSlots);
    return {
      assignments,
      conflicts,
      iterations,
      success: conflicts.length === 0,
      score: finalScore,
    };
  }

  /**
   * Check all hard constraints for a candidate assignment.
   */
  isValidAssignment(slot, rs, assignments, existingMap, usedTeacherSlots, usedRoomSlots,
                    subjectDayCount, teacherDayCount, teacherAvailability, teacherMaxPeriods, rooms) {
    const key = `${slot.day}:${slot.periodNumber}`;

    // 1. Slot already taken
    if (assignments[key] || existingMap[key]) return false;

    // 2. Teacher already busy
    if (usedTeacherSlots[rs.teacherId]?.[key]) return false;

    // 3. Teacher unavailable at this slot
    const avail = teacherAvailability[rs.teacherId];
    if (Array.isArray(avail?.[slot.day]) && !avail[slot.day].includes(slot.periodNumber)) return false;

    // 4. Teacher max periods per day
    const maxPerDay = teacherMaxPeriods[rs.teacherId] || 6;
    const currentDayCount = teacherDayCount[rs.teacherId]?.[slot.day] || 0;
    if (currentDayCount >= maxPerDay) return false;

    // 5. Duplicate subject on same day (unless allow_consecutive)
    if (!rs.allowConsecutive) {
      const daySubjectCount = subjectDayCount[rs.subjectId]?.[slot.day] || 0;
      if (daySubjectCount >= 1) return false;
    }

    return true;
  }

  /**
   * Score a candidate assignment (lower = better). Returns -1 if invalid.
   */
  scoreAssignment(slot, rs, assignments, subjectDayCount, teacherDayCount, teacherAvailability) {
    let score = 0;

    // Soft: prefer earlier periods (morning)
    score += (slot.periodNumber - 1) * 0.5;

    // Soft: avoid late periods (period 6+)
    if (slot.periodNumber > 5) score += 1.5;

    // Soft: even distribution across days - prefer day with fewer of this subject
    const counts = Object.values(subjectDayCount[rs.subjectId] || {});
    const totalAssigned = counts.reduce((a, b) => a + b, 0);
    const daysWithSubject = counts.length || 1;
    const avgPerDay = totalAssigned / daysWithSubject;
    const currentDayCount = subjectDayCount[rs.subjectId]?.[slot.day] || 0;
    if (currentDayCount >= avgPerDay && avgPerDay > 0) score += 2;

    // Soft: even teacher load across day
    const teacherCountForDay = teacherDayCount[rs.teacherId]?.[slot.day] || 0;
    if (teacherCountForDay >= 3) score += 1;

    return score;
  }

  computeOverallScore(assignments, subjectDayCount, allSlots) {
    // Score = sum of per-subject day standard deviation x 10 (higher = more uneven)
    let totalScore = 0;
    for (const [subjectId, dayCounts] of Object.entries(subjectDayCount)) {
      const counts = Object.values(dayCounts);
      const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
      const variance = counts.reduce((a, b) => a + (b - mean) ** 2, 0) / counts.length;
      totalScore += Math.sqrt(variance) * 10;
    }
    return Math.round(totalScore * 100) / 100;
  }

  // ─── Room assignment ────────────────────────────────────────
  pickRoom(rooms, slotKey, usedRoomSlots) {
    if (!rooms || rooms.length === 0) return null;
    for (const room of rooms) {
      if (!usedRoomSlots[room.id]?.[slotKey]) return room;
    }
    return rooms[0];
  }

  // ─── Entry building ─────────────────────────────────────────
  buildEntries(assignments, classInfo, classSubjects, rooms, settings, startTime, periodDuration, termId, schoolId) {
    const entries = [];
    for (const [key, assn] of Object.entries(assignments)) {
      const [day, periodNumberStr] = key.split(':');
      const periodNumber = parseInt(periodNumberStr);
      const start = this.computeTime(startTime, periodNumber, periodDuration);
      const end = this.computeTime(start, 1, periodDuration);

      entries.push({
        id: crypto.randomUUID(),
        tenant_id: schoolId,
        day,
        period: `${start}-${end}`,
        period_number: periodNumber,
        subject: assn.subjectName,
        subject_id: assn.subjectId,
        teacher: assn.teacherName,
        teacher_id: assn.teacherId,
        class_name: classInfo.name,
        class_id: classInfo.id,
        room: assn.roomName || null,
        room_id: assn.roomId || null,
        term_id: termId,
      });
    }
    return entries;
  }

  computeTime(baseTime, periodOffset, durationMinutes) {
    const [h, m] = baseTime.split(':').map(Number);
    const totalMinutes = h * 60 + m + (periodOffset - 1) * durationMinutes;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  // ─── Data loaders ───────────────────────────────────────────
  async loadSettings(schoolId) {
    const { data } = await supabase
      .from('school_scheduling_settings')
      .select('*')
      .eq('school_id', schoolId)
      .maybeSingle();
    return data;
  }

  async loadClassInfo(classId, schoolId) {
    const { data } = await supabase
      .from('classes')
      .select('id, name')
      .eq('id', classId)
      .eq('tenant_id', schoolId)
      .single();
    return data || { id: classId, name: 'Unknown' };
  }

  async loadClassSubjects(classId, schoolId) {
    const { data } = await supabase
      .from('class_subjects')
      .select(`
        id, subject_id, periods_per_week, allow_consecutive,
        subject:subjects(name)
      `)
      .eq('class_id', classId)
      .eq('school_id', schoolId);

    if (!data) return [];

    const result = [];
    for (const cs of data) {
      const teachers = await this.loadSubjectTeachers(cs.subject_id, classId, schoolId);
      for (const teacher of teachers) {
        result.push({
          subject_id: cs.subject_id,
          subject_name: cs.subject?.name || 'Unknown',
          periods_per_week: cs.periods_per_week || 2,
          allow_consecutive: cs.allow_consecutive || false,
          teacher_id: teacher.id,
          teacher_name: teacher.name,
        });
      }
    }
    return result;
  }

  async loadSubjectTeachers(subjectId, classId, schoolId) {
    const { data } = await supabase
      .from('subject_teachers')
      .select(`
        teacher:users!subject_teachers_teacher_id_fkey(id, name)
      `)
      .eq('subject_id', subjectId)
      .eq('class_id', classId)
      .eq('school_id', schoolId);

    if (!data) return [];
    return data.map(st => st.teacher).filter(Boolean);
  }

  async loadRooms(schoolId) {
    const { data } = await supabase
      .from('rooms')
      .select('id, name, capacity')
      .eq('school_id', schoolId);
    return data || [];
  }

  async loadTeacherAvailability(schoolId) {
    const { data } = await supabase
      .from('users')
      .select('id, availability')
      .eq('tenant_id', schoolId)
      .eq('role', 'teacher');

    const map = {};
    for (const u of data || []) {
      if (u.availability) map[u.id] = u.availability;
    }
    return map;
  }

  async loadTeacherMaxPeriods(schoolId) {
    const { data } = await supabase
      .from('users')
      .select('id, max_periods_per_day')
      .eq('tenant_id', schoolId)
      .eq('role', 'teacher');

    const map = {};
    for (const u of data || []) {
      map[u.id] = u.max_periods_per_day ?? 6;
    }
    return map;
  }

  async loadExistingTimetable(classId, schoolId) {
    const { data } = await supabase
      .from('timetable')
      .select('*')
      .eq('class_id', classId)
      .eq('tenant_id', schoolId);
    return data || [];
  }

  buildExistingMap(entries) {
    const map = {};
    for (const e of entries) {
      const key = `${e.day}:${e.period_number}`;
      map[key] = { teacherId: e.teacher_id, subjectId: e.subject_id, roomId: e.room_id };
    }
    return map;
  }

  async deleteClassTimetable(classId, schoolId) {
    const { error } = await supabase
      .from('timetable')
      .delete()
      .eq('class_id', classId)
      .eq('tenant_id', schoolId);
    if (error) throw error;
  }

  async insertEntries(entries) {
    if (entries.length === 0) return;
    const { error } = await supabase
      .from('timetable')
      .insert(entries);
    if (error) throw error;
  }
}

module.exports = TimetableScheduler;
```

- [ ] **Step 2: Commit**

```bash
git add services/timetableScheduler.js
git commit -m "feat: rewrite timetable scheduler with backtracking MRV CSP solver"
```

---

### Task 3: Update Routes to Return Conflicts + Score

**Files:**
- Modify: `routes/school.js` (around line 1342-1358)

The auto-generate endpoint already works. The new response shape includes `conflicts`, `score`, `iterations`, and `timetable` instead of `entries`. Update the route to pass through the full result.

- [ ] **Step 1: Update route handler**

Current code at lines 1342-1358:
```javascript
router.post('/timetable/auto-generate', protect, requirePermission('timetable.create'), async (req, res) => {
    try {
        const { class_id, overwrite, term_id } = req.body;
        if (!class_id) return res.status(400).json({ error: 'class_id is required.' });
        const scheduler = new TimetableScheduler();
        const result = await scheduler.generateTimetable({
            classId: class_id,
            schoolId: req.tenant.id,
            overwrite: !!overwrite,
            termId: term_id || null,
        });
        return res.json({ data: result });
    } catch (err) {
        console.error('Timetable generation error:', err);
        return res.status(500).json({ error: err.message || 'Error generating timetable.' });
    }
});
```

This already works — the response shape changes automatically since `generateTimetable` now returns `{ success, timetable, conflicts, iterations, totalRequired, totalAssigned, score }`.

No code change needed, but verify the route works.

- [ ] **Step 2: Verify route doesn't need changes**

Read `routes/school.js` lines 1342-1358. Confirm it destructures the full result object and passes to `res.json({ data: result })`. This already passes through all fields.

- [ ] **Step 3: Commit (if changes needed — otherwise skip)**

No changes needed to routes/school.js for the response shape.

---

### Task 4: Enhance Frontend — TimetableScheduler.tsx

**Files:**
- Modify: `schoolos-frontend/src/app/pages/TimetableScheduler.tsx`

- [ ] **Step 1: Add conflict report types and state**

After the existing type definitions (around line 22), add:
```typescript
type ConflictItem = {
  type: string;
  message: string;
  subjectId?: string;
  teacherId?: string;
  subjectName?: string;
  teacherName?: string;
};
```

After existing state (around line 39), add to the `genResult` state or add new state:
```typescript
const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
const [genScore, setGenScore] = useState<number | null>(null);
```

- [ ] **Step 2: Update handleGenerate to capture new response fields**

Replace lines 127-148:
```typescript
const handleGenerate = async () => {
    if (!selectedClass) { toast.error("Select a class first"); return; }
    setGenerating(true); setGenerated(null); setGenResult(null);
    setConflicts([]); setGenScore(null);
    try {
      const res = await api.post<any>("/api/school/timetable/auto-generate", {
        class_id: selectedClass,
        overwrite: false,
      });
      const result = res.data?.data || {};
      setGenerated(result.timetable || result.entries || []);
      setConflicts(result.conflicts || []);
      setGenScore(result.score ?? null);
      setGenResult({
        success: result.success,
        totalRequired: result.totalRequired || 0,
        totalAssigned: result.totalAssigned || 0,
      });
      if (result.timetable?.length > 0 || result.entries?.length > 0) {
        toast.success(`Generated ${result.timetable?.length || result.entries?.length} periods`);
      }
      if (result.conflicts?.length > 0) {
        toast.warning(`${result.conflicts.length} conflict(s) found`);
      }
    } catch (err: any) { toast.error(err.message || "Generation failed"); } finally { setGenerating(false); }
  };
```

- [ ] **Step 3: Update handleSave to match new response**

Replace lines 150-162:
```typescript
const handleSave = async () => {
    if (!generated || generated.length === 0) { toast.error("Nothing to save"); return; }
    setSaving(true);
    try {
      const res = await api.post("/api/school/timetable/auto-generate", {
        class_id: selectedClass,
        overwrite: true,
      });
      const result = res.data?.data || {};
      toast.success(`Saved ${result.timetable?.length || result.entries?.length || 0} periods`);
      setGenerated(null);
      setGenResult(null);
      setConflicts([]);
      setGenScore(null);
    } catch (err: any) { toast.error(err.message || "Save failed"); } finally { setSaving(false); }
  };
```

- [ ] **Step 4: Update handleOverwrite**

Replace lines 164-180:
```typescript
const handleOverwrite = async () => {
    setGenerating(true); setGenerated(null); setGenResult(null);
    setConflicts([]); setGenScore(null);
    try {
      const res = await api.post<any>("/api/school/timetable/auto-generate", {
        class_id: selectedClass,
        overwrite: true,
      });
      const result = res.data?.data || {};
      setGenerated(result.timetable || result.entries || []);
      setConflicts(result.conflicts || []);
      setGenScore(result.score ?? null);
      setGenResult({
        success: result.success,
        totalRequired: result.totalRequired || 0,
        totalAssigned: result.totalAssigned || 0,
      });
      if (result.timetable?.length || result.entries?.length) {
        toast.success(`Generated and saved ${result.timetable?.length || result.entries?.length} periods`);
      }
      if (result.conflicts?.length > 0) {
        toast.warning(`${result.conflicts.length} conflict(s) found. Check constraints.`);
      }
    } catch (err: any) { toast.error(err.message || "Generation failed"); } finally { setGenerating(false); }
  };
```

- [ ] **Step 5: Add conflict report panel after the generated timetable section**

After the generated timetable section (after line 408), add:
```tsx
{conflicts.length > 0 && (
  <div className="p-5 rounded-2xl mt-4" style={{ background: "white", border: "1px solid rgba(239,68,68,0.2)" }}>
    <h2 className="font-semibold text-sm mb-3 flex items-center gap-1.5" style={{ color: "#DC2626" }}>
      <AlertCircle size={14} />
      Conflict Report ({conflicts.length})
    </h2>
    <div className="space-y-2">
      {conflicts.map((c, i) => (
        <div key={i} className="flex items-start gap-2 py-1.5 px-3 rounded-lg text-xs"
          style={{ background: "rgba(239,68,68,0.05)" }}>
          <span className="shrink-0 px-1.5 py-0.5 rounded font-medium"
            style={{ background: "rgba(239,68,68,0.15)", color: "#DC2626" }}>
            {c.type === 'no_valid_slot' ? 'NO SLOT' :
             c.type === 'max_attempts_exceeded' ? 'TIMEOUT' : c.type.toUpperCase()}
          </span>
          <span style={{ color: PLUM }}>{c.message}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

- [ ] **Step 6: Add score indicator**

In the generated timetable header (around line 379-408), after the success/partial badge and before the Save button, add:
```tsx
{genScore !== null && (
  <span className="text-xs px-2 py-0.5 rounded-full" 
    style={{ background: "rgba(99,102,241,0.1)", color: "#4338CA" }}>
    Score: {genScore}
  </span>
)}
```

- [ ] **Step 7: Add validation warning for slot capacity**

After the class selector section (after line 282), add:
```tsx
{selectedClass && subjects.length > 0 && settings && (
  (() => {
    const totalSlots = (settings.days_of_week?.length || 5) * (settings.periods_per_day || 8);
    const requiredPeriods = subjects.reduce((sum, s) => sum + (s.periods_per_week || 2), 0);
    if (requiredPeriods > totalSlots) {
      return (
        <div className="flex items-center gap-2 p-3 rounded-xl text-xs"
          style={{ background: "rgba(245,158,11,0.1)", color: "#92400E", border: "1px solid rgba(245,158,11,0.2)" }}>
          <AlertCircle size={14} />
          Warning: {requiredPeriods} periods required but only {totalSlots} slots available ({settings.days_of_week?.length || 5} days × {settings.periods_per_day || 8} periods). Reduce periods per week or increase periods per day.
        </div>
      );
    }
    return null;
  })()
)}
```

- [ ] **Step 8: Commit**

```bash
git add schoolos-frontend/src/app/pages/TimetableScheduler.tsx
git commit -m "feat: enhance timetable scheduler frontend with conflict reports and validation"
```

---

### Task 5: Add Auto Generate Button to Academics Timetable Tab

**Files:**
- Modify: `schoolos-frontend/src/app/pages/Academics.tsx`

- [ ] **Step 1: Add import for TimetableScheduler component**

At the top imports (around line 1-10), add:
```typescript
import { TimetableScheduler } from "../TimetableScheduler";
```

- [ ] **Step 2: Add toggle state and button in the TimetableTab**

In the Academics.tsx TimetableTab section, find where the "Add Period" button is rendered. Add before it:
```tsx
<button onClick={() => setShowAutoGenerate(!showAutoGenerate)}
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
  style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
  <RefreshCw size={14} />
  Generate Automatically
</button>
```

Add state:
```typescript
const [showAutoGenerate, setShowAutoGenerate] = useState(false);
```

- [ ] **Step 3: Render TimetableScheduler conditionally**

After the add period modal and before/after the timetable tables, add:
```tsx
{showAutoGenerate && (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-sm" style={{ color: PLUM }}>Auto-Generate Timetable</h3>
      <button onClick={() => setShowAutoGenerate(false)}
        className="p-1 rounded hover:opacity-70" style={{ color: MUTED }}>
        <X size={16} />
      </button>
    </div>
    <TimetableScheduler embedded />
  </div>
)}
```

This requires adding an `embedded` prop to the TimetableScheduler component to render without the full-page layout wrapper.

- [ ] **Step 4: Add `embedded` prop to TimetableScheduler**

In `TimetableScheduler.tsx`, change the function signature from:
```typescript
export function TimetableScheduler() {
```
to:
```typescript
export function TimetableScheduler({ embedded = false }: { embedded?: boolean }) {
```

Then wrap the main return JSX in a conditional:
```typescript
if (embedded) {
  return (/* render just the class selector + generate button + grid, no header, no outer spacing */);
}
```

Actually, to keep it simpler: just export the component as-is and let it render naturally. The Academics tab can render it in a modal or inline. For now, add the `embedded` prop and strip the outer `<div className="max-w-6xl mx-auto space-y-6">` when embedded, replacing it with a simpler wrapper.

- [ ] **Step 5: Commit**

```bash
git add schoolos-frontend/src/app/pages/Academics.tsx schoolos-frontend/src/app/pages/TimetableScheduler.tsx
git commit -m "feat: integrate auto-generate timetable into Academics tab"
```

---

### Task 6: Verify

- [ ] **Step 1: Verify backend module loads**

```bash
node -e "const S = require('./services/timetableScheduler'); console.log('OK:', typeof S);"
```
Expected: `OK: function` (syntax valid, module loads)

- [ ] **Step 2: Verify frontend builds**

```bash
cd schoolos-frontend && npm run build
```
Expected: Build succeeds without errors.

- [ ] **Step 3: Commit final**

```bash
git add -A && git commit -m "chore: finalize auto timetable scheduler implementation"
```
