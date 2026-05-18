const crypto = require('crypto');
const supabase = require('../config/db');

class TimetableScheduler {
  async generateTimetable({ classId, schoolId, overwrite = false, termId = null }) {
    const settings = await this.loadSettings(schoolId);
    const periodsPerDay = settings?.periods_per_day || 8;
    const days = settings?.days_of_week || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const startTime = settings?.start_time || '08:00';
    const periodDuration = settings?.period_duration_minutes || 45;

    const classInfo = await this.loadClassInfo(classId, schoolId);
    const classSubjects = await this.loadClassSubjects(classId, schoolId);
    const rooms = await this.loadRooms(schoolId);
    const teacherAvailability = await this.loadTeacherAvailability(schoolId);

    if (overwrite) {
      await this.deleteClassTimetable(classId, schoolId);
    }

    const existingEntries = await this.loadExistingTimetable(classId, schoolId);
    const existingMap = this.buildExistingMap(existingEntries);

    const requiredAssignments = [];
    for (const cs of classSubjects) {
      for (let i = 0; i < cs.periods_per_week; i++) {
        requiredAssignments.push({
          subjectId: cs.subject_id,
          subjectName: cs.subject_name,
          teacherId: cs.teacher_id,
          teacherName: cs.teacher_name,
        });
      }
    }

    requiredAssignments.sort((a, b) => {
      const aFreq = classSubjects.find(cs => cs.subject_id === a.subjectId)?.periods_per_week || 0;
      const bFreq = classSubjects.find(cs => cs.subject_id === b.subjectId)?.periods_per_week || 0;
      return bFreq - aFreq;
    });

    const slots = [];
    for (const day of days) {
      for (let p = 1; p <= periodsPerDay; p++) {
        slots.push({ day, periodNumber: p });
      }
    }

    const assignmentMap = {};
    const usedSlotsByTeacher = {};
    const usedSlotsByRoom = {};
    const subjectDayCount = {};

    let success = true;

    for (let i = 0; i < requiredAssignments.length; i++) {
      const ra = requiredAssignments[i];
      const bestSlot = this.findBestSlot(
        ra, slots, assignmentMap, usedSlotsByTeacher, usedSlotsByRoom,
        existingMap, teacherAvailability, rooms, subjectDayCount, schoolId
      );

      if (!bestSlot) {
        success = false;
        continue;
      }

      const key = `${bestSlot.day}:${bestSlot.periodNumber}`;
      assignmentMap[key] = {
        subjectId: ra.subjectId,
        subjectName: ra.subjectName,
        teacherId: ra.teacherId,
        teacherName: ra.teacherName,
        roomId: bestSlot.roomId,
        roomName: bestSlot.roomName,
      };

      if (!usedSlotsByTeacher[ra.teacherId]) usedSlotsByTeacher[ra.teacherId] = {};
      usedSlotsByTeacher[ra.teacherId][key] = true;

      if (bestSlot.roomId) {
        if (!usedSlotsByRoom[bestSlot.roomId]) usedSlotsByRoom[bestSlot.roomId] = {};
        usedSlotsByRoom[bestSlot.roomId][key] = true;
      }

      if (!subjectDayCount[ra.subjectId]) subjectDayCount[ra.subjectId] = {};
      if (!subjectDayCount[ra.subjectId][bestSlot.day]) subjectDayCount[ra.subjectId][bestSlot.day] = 0;
      subjectDayCount[ra.subjectId][bestSlot.day]++;
    }

    const entries = this.buildEntries(
      assignmentMap, slots, classInfo, classSubjects, rooms,
      settings, startTime, periodDuration, termId, schoolId
    );

    if (entries.length > 0) {
      await this.insertEntries(entries);
    }

    return { entries, success, totalRequired: requiredAssignments.length, totalAssigned: entries.length };
  }

  findBestSlot(ra, slots, assignmentMap, usedSlotsByTeacher, usedSlotsByRoom,
               existingMap, teacherAvailability, rooms, subjectDayCount, schoolId) {
    const best = { slot: null, score: Infinity };

    // Check teacher availability config
    const avail = teacherAvailability[ra.teacherId] || {};

    for (const slot of slots) {
      const key = `${slot.day}:${slot.periodNumber}`;

      // Hard constraint: slot already taken
      if (assignmentMap[key]) continue;
      if (existingMap[key]) continue;

      // Hard constraint: teacher already busy at this slot
      if (usedSlotsByTeacher[ra.teacherId]?.[key]) continue;

      // Hard constraint: teacher unavailable at this slot
      if (Array.isArray(avail[slot.day]) && !avail[slot.day].includes(slot.periodNumber)) continue;

      // Find an available room
      const assignedRoom = this.pickRoom(rooms, key, usedSlotsByRoom);

      let score = 0;

      // Soft: prefer earlier periods (morning)
      score += slot.periodNumber * 0.5;

      // Soft: avoid late periods
      if (slot.periodNumber > 5) score += 1;

      // Soft: prefer even distribution across days
      const dayCount = Object.values(subjectDayCount[ra.subjectId] || {}).reduce((a, b) => a + b, 0);
      const totalSlots = Object.values(subjectDayCount[ra.subjectId] || {}).length || 1;
      const avgPerDay = dayCount / Math.max(totalSlots, 1);
      const currentDayCount = (subjectDayCount[ra.subjectId]?.[slot.day] || 0);
      if (currentDayCount >= avgPerDay) score += 2;

      // Soft: penalty for no room
      if (!assignedRoom) score += 3;

      if (slot.periodNumber >= 6) score += 2;

      if (score < best.score) {
        best.score = score;
        best.slot = {
          ...slot,
          roomId: assignedRoom?.id || null,
          roomName: assignedRoom?.name || null,
        };
      }
    }

    return best.slot;
  }

  pickRoom(rooms, slotKey, usedSlotsByRoom) {
    if (!rooms || rooms.length === 0) return null;
    for (const room of rooms) {
      if (!usedSlotsByRoom[room.id]?.[slotKey]) {
        return room;
      }
    }
    return rooms[0];
  }

  buildEntries(assignmentMap, slots, classInfo, classSubjects, rooms,
               settings, startTime, periodDuration, termId, schoolId) {
    const entries = [];

    for (const slot of slots) {
      const key = `${slot.day}:${slot.periodNumber}`;
      const assn = assignmentMap[key];
      if (!assn) continue;

      const start = this.computeTime(startTime, slot.periodNumber, periodDuration);
      const end = this.computeTime(start, 1, periodDuration);

      entries.push({
        id: crypto.randomUUID(),
        tenant_id: schoolId,
        day: slot.day,
        period: `${start}-${end}`,
        period_number: slot.periodNumber,
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
        id, subject_id, periods_per_week,
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
    return data
      .map(st => st.teacher)
      .filter(Boolean);
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
      if (u.availability) {
        map[u.id] = u.availability;
      }
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
      map[key] = true;
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
