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

    const timetable = this.buildEntries(
      result.assignments, classInfo, classSubjects, rooms,
      settings, startTime, periodDuration, termId, schoolId
    );

    if (timetable.length > 0) {
      await this.insertEntries(timetable);
    }

    return {
      success: result.success,
      timetable,
      conflicts: result.conflicts,
      iterations: result.iterations,
      totalRequired: requiredSlots.length,
      totalAssigned: Object.keys(result.assignments).length,
      score: result.score,
    };
  }

  /**
   * Core CSP solver: iterative backtracking with MRV heuristic.
   * @param {Array} requiredSlots - list of { id, subjectId, teacherId, allowConsecutive }
   * @param {Array} allSlots - list of { day, periodNumber }
   * @param {Object} existingMap - keyed by "day:periodNumber" -> { teacherId, subjectId, roomId }
   * @param {Object} teacherAvailability - keyed by teacherId -> { "Monday": [1,2,...] }
   * @param {Object} teacherMaxPeriods - keyed by teacherId -> number
   * @param {Array} rooms - list of { id, name }
   * @param {number} maxAttempts
   * @returns {{ assignments: Object, conflicts: Array, iterations: number, success: boolean, score: number }}
   */
  backtrackSolve(requiredSlots, allSlots, existingMap, teacherAvailability, teacherMaxPeriods, rooms, maxAttempts) {
    const assignments = {};
    const usedTeacherSlots = {};
    const usedRoomSlots = {};
    const subjectDayCount = {};
    const teacherDayCount = {};
    const conflicts = [];
    let iterations = 0;

    // Copy existing entries into tracking maps (e.g., entries from non-overwrite mode)
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

    // Stack for backtracking: each entry = { index, rs, validSlots, chosenIndex }
    const stack = [];
    const assigned = new Set();

    while (assigned.size < requiredSlots.length) {
      iterations++;
      if (iterations > maxAttempts) {
        // Record remaining count as a timeout conflict
        const remaining = requiredSlots.length - assigned.size;
        conflicts.push({
          type: 'max_attempts_exceeded',
          message: `Could not find complete solution within ${maxAttempts} iterations. ${remaining} slots remaining.`,
          unscheduledCount: remaining,
        });
        break;
      }

      // --- MRV: find the most constrained unassigned slot ---
      let bestIdx = -1;
      let bestDomainSize = Infinity;
      for (let j = 0; j < requiredSlots.length; j++) {
        if (assigned.has(j)) continue;
        const rs = requiredSlots[j];
        let domainSize = 0;
        for (const slot of allSlots) {
          if (this.isValidAssignment(slot, rs, assignments, existingMap, usedTeacherSlots,
              usedRoomSlots, subjectDayCount, teacherDayCount, teacherAvailability,
              teacherMaxPeriods, rooms)) {
            domainSize++;
          }
        }
        if (domainSize < bestDomainSize) {
          bestDomainSize = domainSize;
          bestIdx = j;
        }
        if (domainSize === 0) break; // no valid options for this one, want it first
      }

      if (bestIdx === -1) break; // safety: should not happen

      const rs = requiredSlots[bestIdx];

      // Compute valid slots sorted by soft constraint score
      const validSlots = [];
      for (const slot of allSlots) {
        if (this.isValidAssignment(slot, rs, assignments, existingMap, usedTeacherSlots,
            usedRoomSlots, subjectDayCount, teacherDayCount, teacherAvailability,
            teacherMaxPeriods, rooms)) {
          const score = this.scoreAssignment(slot, rs, assignments, subjectDayCount, teacherDayCount, teacherAvailability);
          validSlots.push({ slot, score });
        }
      }
      validSlots.sort((a, b) => a.score - b.score);

      if (validSlots.length > 0) {
        // Assign best option
        const chosen = validSlots[0];
        this.applyAssignment(assignments, usedTeacherSlots, usedRoomSlots, subjectDayCount, teacherDayCount, rs, chosen.slot, rooms);
        stack.push({ index: bestIdx, rs, validSlots, chosenIndex: 0, slot: chosen.slot });
        assigned.add(bestIdx);
      } else {
        // No valid slots for this variable — backtrack
        let found = false;
        while (stack.length > 0 && !found) {
          const prev = stack[stack.length - 1];
          if (prev.chosenIndex + 1 < prev.validSlots.length) {
            // Undo previous assignment
            const prevSlot = prev.validSlots[prev.chosenIndex].slot;
            this.undoAssignment(assignments, usedTeacherSlots, usedRoomSlots, subjectDayCount, teacherDayCount, prev.rs, prevSlot);
            // Try next option for previous slot
            prev.chosenIndex++;
            const newChoice = prev.validSlots[prev.chosenIndex];
            this.applyAssignment(assignments, usedTeacherSlots, usedRoomSlots, subjectDayCount, teacherDayCount, prev.rs, newChoice.slot, rooms);
            prev.slot = newChoice.slot;
            found = true;
          } else {
            // No more options for the previous assignment — pop it entirely
            const prevSlot = prev.validSlots[prev.chosenIndex].slot;
            this.undoAssignment(assignments, usedTeacherSlots, usedRoomSlots, subjectDayCount, teacherDayCount, prev.rs, prevSlot);
            assigned.delete(prev.index);
            stack.pop();
          }
        }

        if (!found) {
          // Even the root slot is impossible — record conflict and skip
          conflicts.push({
            type: 'no_valid_slot',
            message: `No available slot for ${rs.subjectName} (teacher: ${rs.teacherName})`,
            subjectId: rs.subjectId,
            teacherId: rs.teacherId,
            subjectName: rs.subjectName,
            teacherName: rs.teacherName,
          });
          assigned.add(bestIdx);
        }
      }
    }

    // Clean up max_attempts_exceeded if everything actually got assigned
    const realConflicts = conflicts.filter(c => c.type !== 'max_attempts_exceeded' || assigned.size < requiredSlots.length);

    const finalScore = this.computeOverallScore(assignments, subjectDayCount);
    return {
      assignments,
      conflicts: realConflicts,
      iterations,
      success: realConflicts.length === 0,
      score: finalScore,
    };
  }

  applyAssignment(assignments, usedTeacherSlots, usedRoomSlots, subjectDayCount, teacherDayCount, rs, slot, rooms) {
    const key = `${slot.day}:${slot.periodNumber}`;
    const pickedRoom = this.pickRoom(rooms, key, usedRoomSlots);

    assignments[key] = {
      subjectId: rs.subjectId,
      subjectName: rs.subjectName,
      teacherId: rs.teacherId,
      teacherName: rs.teacherName,
      roomId: pickedRoom?.id || null,
      roomName: pickedRoom?.name || null,
    };

    if (!usedTeacherSlots[rs.teacherId]) usedTeacherSlots[rs.teacherId] = {};
    usedTeacherSlots[rs.teacherId][key] = true;

    if (!teacherDayCount[rs.teacherId]) teacherDayCount[rs.teacherId] = {};
    teacherDayCount[rs.teacherId][slot.day] = (teacherDayCount[rs.teacherId][slot.day] || 0) + 1;

    if (pickedRoom) {
      if (!usedRoomSlots[pickedRoom.id]) usedRoomSlots[pickedRoom.id] = {};
      usedRoomSlots[pickedRoom.id][key] = true;
    }

    if (!subjectDayCount[rs.subjectId]) subjectDayCount[rs.subjectId] = {};
    subjectDayCount[rs.subjectId][slot.day] = (subjectDayCount[rs.subjectId][slot.day] || 0) + 1;
  }

  undoAssignment(assignments, usedTeacherSlots, usedRoomSlots, subjectDayCount, teacherDayCount, rs, slot) {
    const key = `${slot.day}:${slot.periodNumber}`;

    delete assignments[key];

    if (usedTeacherSlots[rs.teacherId]) {
      delete usedTeacherSlots[rs.teacherId][key];
    }

    if (teacherDayCount[rs.teacherId]) {
      teacherDayCount[rs.teacherId][slot.day] = (teacherDayCount[rs.teacherId][slot.day] || 1) - 1;
      if (teacherDayCount[rs.teacherId][slot.day] <= 0) {
        delete teacherDayCount[rs.teacherId][slot.day];
      }
    }

    // We don't track which room was used in the undo because pickRoom always
    // picks the first available; undoing room tracking is handled by removing
    // from usedRoomSlots — but we need the roomId. Look it up from the assignment
    // that we already deleted. For simplicity, we clear the slot from all rooms.
    for (const roomId of Object.keys(usedRoomSlots)) {
      delete usedRoomSlots[roomId][key];
    }

    if (subjectDayCount[rs.subjectId]) {
      subjectDayCount[rs.subjectId][slot.day] = (subjectDayCount[rs.subjectId][slot.day] || 1) - 1;
      if (subjectDayCount[rs.subjectId][slot.day] <= 0) {
        delete subjectDayCount[rs.subjectId][slot.day];
      }
    }
  }

  isValidAssignment(slot, rs, assignments, existingMap, usedTeacherSlots, usedRoomSlots,
                    subjectDayCount, teacherDayCount, teacherAvailability, teacherMaxPeriods, rooms) {
    const key = `${slot.day}:${slot.periodNumber}`;

    // 1. Slot already taken by an assignment or existing entry
    if (assignments[key]) return false;
    if (existingMap[key] && existingMap[key].teacherId) return false;

    // 2. Teacher already busy at this slot
    if (usedTeacherSlots[rs.teacherId]?.[key]) return false;

    // 3. Teacher unavailable at this slot (availability is a JSON like { "Monday": [1,2,3,4,5,6,7,8] })
    const avail = teacherAvailability[rs.teacherId];
    if (avail && Array.isArray(avail[slot.day]) && !avail[slot.day].includes(slot.periodNumber)) return false;

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

    // Soft: even teacher load across days
    const teacherCountForDay = teacherDayCount[rs.teacherId]?.[slot.day] || 0;
    if (teacherCountForDay >= 3) score += 1;

    return score;
  }

  computeOverallScore(assignments, subjectDayCount) {
    let totalScore = 0;
    for (const dayCounts of Object.values(subjectDayCount)) {
      const counts = Object.values(dayCounts);
      if (counts.length === 0) continue;
      const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
      const variance = counts.reduce((a, b) => a + (b - mean) ** 2, 0) / counts.length;
      totalScore += Math.sqrt(variance) * 10;
    }
    return Math.round(totalScore * 100) / 100;
  }

  pickRoom(rooms, slotKey, usedRoomSlots) {
    if (!rooms || rooms.length === 0) return null;
    for (const room of rooms) {
      if (!usedRoomSlots[room.id]?.[slotKey]) return room;
    }
    return rooms[0];
  }

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
