import { useState, useEffect } from "react";
import {
  Loader2, Calendar, BookOpen, Users, MapPin,
  Save, RefreshCw, CheckCircle, AlertCircle, X, ChevronDown, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../services/api";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type ClassItem = { id: string; name: string };
type SubjectItem = { id: string; subject_id: string; subject: { name: string; code?: string }; periods_per_week: number; teachers: { id: string; name: string }[] };
type TeacherItem = { id: string; name: string; email?: string; availability?: Record<string, number[]> };
type RoomItem = { id: string; name: string; capacity?: number };
type SettingsType = { periods_per_day: number; period_duration_minutes: number; start_time: string; days_of_week: string[] };
type TimetableEntry = { id: string; day: string; period: string; period_number: number; subject: string; teacher: string; class_name: string; room?: string };
type GeneratedEntry = { id: string; day: string; period: string; period_number: number; subject: string; teacher: string; class_name: string; room?: string };
type ConflictItem = {
  type: string;
  message: string;
  subjectId?: string;
  teacherId?: string;
  subjectName?: string;
  teacherName?: string;
};

function LoadingSpinner({ size = 16 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin" />;
}

export function TimetableScheduler({ embedded = false }: { embedded?: boolean }) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [constraintsLoading, setConstraintsLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generated, setGenerated] = useState<GeneratedEntry[] | null>(null);
  const [existingEntries, setExistingEntries] = useState<TimetableEntry[]>([]);
  const [showExisting, setShowExisting] = useState(false);
  const [showAvailEditor, setShowAvailEditor] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<string | null>(null);
  const [editAvail, setEditAvail] = useState<Record<string, number[]>>({});
  const [genResult, setGenResult] = useState<{ success: boolean; totalRequired: number; totalAssigned: number } | null>(null);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [genScore, setGenScore] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          api.get<any>("/api/school/classes"),
          api.get<any>("/api/school/scheduling-settings"),
        ]);
        setClasses(cRes.data?.data?.classes || cRes.data?.classes || []);
        const settingsData = sRes.data?.data?.settings || null;
        setSettings(settingsData);
        if (!settingsData) {
          await api.put("/api/school/scheduling-settings", {});
          const s2 = await api.get<any>("/api/school/scheduling-settings");
          setSettings(s2.data?.data?.settings || null);
        }
      } catch { /* ignore */ } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!selectedClass) { setSubjects([]); setTeachers([]); setRooms([]); setExistingEntries([]); setGenerated(null); setGenResult(null); return; }
    (async () => {
      setConstraintsLoading(true); setGenerated(null); setGenResult(null);
      try {
        const [conRes, ttRes] = await Promise.all([
          api.get<any>(`/api/school/timetable/constraints?class_id=${selectedClass}`),
          api.get<any>("/api/school/timetable"),
        ]);
        const d = conRes.data?.data || {};
        setSubjects(d.subjects || []);
        setTeachers(d.teachers || []);
        setRooms(d.rooms || []);

        const allEntries = ttRes.data?.data?.timetable || ttRes.data?.timetable || [];
        setExistingEntries(allEntries.filter((e: TimetableEntry) => e.class_name === classes.find(c => c.id === selectedClass)?.name));
      } catch { toast.error("Failed to load constraint data"); } finally { setConstraintsLoading(false); }
    })();
  }, [selectedClass, classes]);

  const updatePeriods = async (id: string, val: number) => {
    try {
      await api.put(`/api/school/class-subjects/${id}/periods`, { periods_per_week: Math.max(1, val) });
      setSubjects(prev => prev.map(s => s.id === id ? { ...s, periods_per_week: Math.max(1, val) } : s));
      toast.success("Periods updated");
    } catch { toast.error("Failed to update periods"); }
  };

  const openAvailEditor = (teacher: TeacherItem) => {
    const periodsPerDay = settings?.periods_per_day || 8;
    const avail: Record<string, number[]> = {};
    for (const day of DAYS) {
      avail[day] = teacher.availability?.[day] || Array.from({ length: periodsPerDay }, (_, i) => i + 1);
    }
    setEditAvail(avail);
    setEditingTeacher(teacher.id);
  };

  const toggleAvailSlot = (day: string, period: number) => {
    setEditAvail(prev => {
      const current = prev[day] || [];
      const next = current.includes(period)
        ? current.filter(p => p !== period)
        : [...current, period].sort((a, b) => a - b);
      return { ...prev, [day]: next };
    });
  };

  const saveAvailability = async () => {
    if (!editingTeacher) return;
    try {
      await api.put("/api/school/timetable/teacher-availability", {
        teacher_id: editingTeacher,
        availability: editAvail,
      });
      setTeachers(prev => prev.map(t => t.id === editingTeacher ? { ...t, availability: editAvail } : t));
      toast.success("Availability saved");
      setEditingTeacher(null);
    } catch { toast.error("Failed to save availability"); }
  };

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
      const entries = result.timetable || result.entries || [];
      setGenerated(entries);
      setConflicts(result.conflicts || []);
      setGenScore(result.score ?? null);
      setGenResult({
        success: result.success,
        totalRequired: result.totalRequired || 0,
        totalAssigned: result.totalAssigned || 0,
      });
      if (entries.length > 0) {
        toast.success(`Generated ${entries.length} periods`);
      }
      if (result.conflicts?.length > 0) {
        toast.warning(`${result.conflicts.length} conflict(s) found`);
      }
      if (entries.length === 0 && (!result.conflicts || result.conflicts.length === 0)) {
        toast.error("No periods could be generated. Check constraints.");
      }
    } catch (err: any) { toast.error(err.message || "Generation failed"); } finally { setGenerating(false); }
  };

  const handleSave = async () => {
    if (!generated || generated.length === 0) { toast.error("Nothing to save"); return; }
    setSaving(true);
    try {
      const res = await api.post<any>("/api/school/timetable/auto-generate", {
        class_id: selectedClass,
        overwrite: true,
      });
      const result = res.data?.data || {};
      const count = result.timetable?.length || result.entries?.length || 0;
      toast.success(`Saved ${count} periods`);
      setGenerated(null);
      setGenResult(null);
      setConflicts([]);
      setGenScore(null);
    } catch (err: any) { toast.error(err.message || "Save failed"); } finally { setSaving(false); }
  };

  const handleOverwrite = async () => {
    setGenerating(true); setGenerated(null); setGenResult(null);
    setConflicts([]); setGenScore(null);
    try {
      const res = await api.post<any>("/api/school/timetable/auto-generate", {
        class_id: selectedClass,
        overwrite: true,
      });
      const result = res.data?.data || {};
      const entries = result.timetable || result.entries || [];
      setGenerated(entries);
      setConflicts(result.conflicts || []);
      setGenScore(result.score ?? null);
      setGenResult({
        success: result.success,
        totalRequired: result.totalRequired || 0,
        totalAssigned: result.totalAssigned || 0,
      });
      if (entries.length > 0) {
        toast.success(`Generated and saved ${entries.length} periods`);
      } else {
        toast.error("No periods could be generated. Check constraints.");
      }
      if (result.conflicts?.length > 0) {
        toast.warning(`${result.conflicts.length} conflict(s) found. Check constraints.`);
      }
    } catch (err: any) { toast.error(err.message || "Generation failed"); } finally { setGenerating(false); }
  };

  const renderGrid = (entries: TimetableEntry[]) => {
    const periodsPerDay = settings?.periods_per_day || 8;
    const grid: Record<string, Record<number, TimetableEntry[]>> = {};
    for (const day of DAYS) {
      grid[day] = {};
      for (let p = 1; p <= periodsPerDay; p++) {
        grid[day][p] = [];
      }
    }
    for (const e of entries) {
      if (grid[e.day] && grid[e.day][e.period_number]) {
        grid[e.day][e.period_number].push(e);
      }
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]" style={{ borderCollapse: "separate", borderSpacing: "2px" }}>
          <thead>
            <tr>
              <th className="px-2 py-1.5 text-xs font-semibold text-left" style={{ color: MUTED, width: 60 }}>Period</th>
              {DAYS.map(day => (
                <th key={day} className="px-2 py-1.5 text-xs font-semibold text-center" style={{ color: NAVY }}>{day.slice(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map(pn => (
              <tr key={pn}>
                <td className="px-2 py-1 text-xs font-medium" style={{ color: MUTED }}>{pn}</td>
                {DAYS.map(day => {
                  const cells = grid[day]?.[pn] || [];
                  return (
                    <td key={day} className="px-1 py-1 align-top" style={{ minWidth: 120 }}>
                      {cells.length === 0 ? (
                        <div className="h-6" />
                      ) : (
                        cells.map((cell, i) => (
                          <div key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] leading-tight mb-0.5"
                            style={{ background: "rgba(99,102,241,0.1)", color: "#4338CA", borderLeft: "2px solid #6366F1" }}>
                            <div className="font-medium truncate">{cell.subject}</div>
                            <div className="truncate opacity-70">{cell.teacher}{cell.room ? ` · ${cell.room}` : ""}</div>
                          </div>
                        ))
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size={24} />
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-4" : "max-w-6xl mx-auto space-y-6"}>
      {!embedded && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}>Timetable Scheduler</h1>
            <p className="text-sm" style={{ color: MUTED }}>Automatically generate class timetables</p>
          </div>
        </div>
      )}

      <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <div className="flex items-end gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1.5" style={{ color: NAVY_LIGHT }}>Class</label>
            <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl outline-none text-sm"
              style={{ background: CREAM, border: "1.5px solid rgba(56,25,50,0.1)", color: NAVY }}>
              <option value="">Select a class...</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleGenerate} disabled={!selectedClass || generating || constraintsLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
              {generating ? <LoadingSpinner size={14} /> : <RefreshCw size={14} />}
              {generating ? "Generating..." : "Generate Preview"}
            </button>
            <button onClick={handleOverwrite} disabled={!selectedClass || generating}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: "rgba(239,68,68,0.1)", color: "#DC2626", border: "1px solid rgba(239,68,68,0.2)" }}>
              <RefreshCw size={14} />
              Generate & Overwrite
            </button>
          </div>
        </div>
      </div>

      {selectedClass && subjects.length > 0 && settings && (() => {
        const totalSlots = (settings.days_of_week?.length || 5) * (settings.periods_per_day || 8);
        const requiredPeriods = subjects.reduce((sum: number, s: SubjectItem) => sum + (s.periods_per_week || 2), 0);
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
      })()}

      {constraintsLoading && (
        <div className="flex items-center justify-center py-10">
          <LoadingSpinner size={20} />
        </div>
      )}

      {!constraintsLoading && selectedClass && subjects.length === 0 && (
        <div className="p-10 rounded-2xl text-center" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <BookOpen size={32} className="mx-auto mb-2" style={{ color: MUTED }} />
          <p className="text-sm font-medium" style={{ color: NAVY_LIGHT }}>No subjects assigned to this class</p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>Add subjects via Academics page first</p>
        </div>
      )}

      {!constraintsLoading && selectedClass && subjects.length > 0 && (
        <>
          <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <h2 className="font-semibold text-sm mb-3" style={{ color: NAVY }}>
              <BookOpen size={14} className="inline mr-1.5" />
              Subjects & Periods per Week
            </h2>
            <div className="space-y-2">
              {subjects.map(cs => (
                <div key={cs.id} className="flex items-center justify-between py-1.5 px-3 rounded-xl" style={{ background: CREAM }}>
                  <div>
                    <span className="text-sm font-medium" style={{ color: NAVY }}>{cs.subject?.name || "Unknown"}</span>
                    {cs.subject?.code && <span className="ml-2 text-xs" style={{ color: MUTED }}>({cs.subject.code})</span>}
                    <div className="text-xs" style={{ color: MUTED }}>
                      {cs.teachers?.map((t: any) => t?.name).filter(Boolean).join(", ") || "No teacher assigned"}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updatePeriods(cs.id, (cs.periods_per_week || 2) - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold active:scale-90"
                      style={{ background: "rgba(56,25,50,0.06)", color: NAVY }}>−</button>
                    <span className="w-8 text-center text-sm font-bold" style={{ color: NAVY }}>{cs.periods_per_week || 2}</span>
                    <button onClick={() => updatePeriods(cs.id, (cs.periods_per_week || 2) + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold active:scale-90"
                      style={{ background: "rgba(56,25,50,0.06)", color: NAVY }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm" style={{ color: NAVY }}>
                <Users size={14} className="inline mr-1.5" />
                Teacher Availability
              </h2>
              <button onClick={() => setShowAvailEditor(!showAvailEditor)}
                className="text-xs font-medium active:scale-95 transition-transform px-3 py-1 rounded-lg"
                style={{ color: NAVY, background: "rgba(56,25,50,0.06)" }}>
                {showAvailEditor ? "Done" : "Edit"}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {teachers.map(t => (
                <div key={t.id}
                  onClick={() => showAvailEditor && openAvailEditor(t)}
                  className="px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-all"
                  style={{
                    background: showAvailEditor ? "rgba(99,102,241,0.1)" : "rgba(56,25,50,0.05)",
                    color: NAVY,
                    border: showAvailEditor ? "1px solid rgba(99,102,241,0.3)" : "none",
                  }}>
                  {t.name}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm" style={{ color: NAVY }}>
                <MapPin size={14} className="inline mr-1.5" />
                Rooms ({rooms.length})
              </h2>
            </div>
            {rooms.length === 0 ? (
              <p className="text-xs" style={{ color: MUTED }}>No rooms configured. Add rooms for room scheduling.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {rooms.map(r => (
                  <span key={r.id} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "rgba(16,185,129,0.1)", color: "#065F46" }}>
                    {r.name}{r.capacity ? ` (${r.capacity})` : ""}
                  </span>
                ))}
              </div>
            )}
          </div>

          {generated && genResult && (
            <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="font-semibold text-sm" style={{ color: NAVY }}>
                    <Calendar size={14} className="inline mr-1.5" />
                    Generated Timetable
                  </h2>
                  {genResult.success ? (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", color: "#065F46" }}>
                      <CheckCircle size={11} /> Success
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", color: "#DC2626" }}>
                      <AlertCircle size={11} /> Partial
                    </span>
                  )}
                  {genScore !== null && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(99,102,241,0.1)", color: "#4338CA" }}>
                      Score: {genScore}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: MUTED }}>
                    {genResult.totalAssigned}/{genResult.totalRequired} periods
                  </span>
                  <button onClick={handleSave} disabled={saving || generated.length === 0}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold active:scale-95 transition-transform disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                    {saving ? <LoadingSpinner size={12} /> : <Save size={12} />}
                    Save
                  </button>
                </div>
              </div>
              {renderGrid(generated)}
            </div>
          )}

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
                    <span className="shrink-0 px-1.5 py-0.5 rounded font-medium whitespace-nowrap"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#DC2626" }}>
                      {c.type === 'no_valid_slot' ? 'NO SLOT' :
                       c.type === 'max_attempts_exceeded' ? 'TIMEOUT' : c.type.toUpperCase()}
                    </span>
                    <span style={{ color: NAVY }}>{c.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {existingEntries.length > 0 && (
            <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <button onClick={() => setShowExisting(!showExisting)}
                className="flex items-center gap-1.5 text-sm font-semibold mb-2"
                style={{ color: NAVY }}>
                {showExisting ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Existing Saved Timetable ({existingEntries.length} periods)
              </button>
              {showExisting && renderGrid(existingEntries)}
            </div>
          )}
        </>
      )}

      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setEditingTeacher(null)}>
          <div className="w-full max-w-lg rounded-2xl p-5" style={{ background: "white" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: NAVY }}>
                Edit Availability: {teachers.find(t => t.id === editingTeacher)?.name}
              </h3>
              <button onClick={() => setEditingTeacher(null)} className="p-1 rounded hover:opacity-70" style={{ color: MUTED }}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {DAYS.map(day => (
                <div key={day}>
                  <p className="text-xs font-medium mb-1" style={{ color: NAVY_LIGHT }}>{day}</p>
                  <div className="flex flex-wrap gap-1">
                    {Array.from({ length: settings?.periods_per_day || 8 }, (_, i) => i + 1).map(pn => (
                      <button key={pn} onClick={() => toggleAvailSlot(day, pn)}
                        className="w-8 h-8 rounded-lg text-xs font-medium active:scale-90 transition-all"
                        style={{
                          background: (editAvail[day] || []).includes(pn) ? NAVY : CREAM,
                          color: (editAvail[day] || []).includes(pn) ? CREAM : NAVY,
                          border: `1px solid ${(editAvail[day] || []).includes(pn) ? NAVY : 'rgba(56,25,50,0.1)'}`,
                        }}>
                        {pn}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium"
                style={{ background: CREAM, color: NAVY }}>Cancel</button>
              <button onClick={saveAvailability}
                className="px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
                style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                Save Availability
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
