import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Plus, X, Loader2, Search, Users, School,
  Trash2, Check, AlertCircle, Clock, Star, UserCheck,
  Briefcase, Layers, CalendarDays, AlertTriangle, UserPlus,
  GitBranch,
} from "lucide-react";
import { api } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type ClassItem = { id: string; name: string; [key: string]: any };
type Subject = { id: string; name: string; code?: string; is_core?: boolean; created_at?: string };
type Teacher = { id: string; name: string; email?: string };
type Stream = { id: string; name: string; class_id: string; class?: { name: string } };
type Session = { id: string; name: string; start_date: string; end_date: string; is_current: boolean };
type Term = { id: string; name: string; start_date: string; end_date: string; is_current: boolean };
type TimetableEntry = { id: string; day: string; period: string; subject: string; teacher: string; class_name: string; room?: string };
type ClassSubject = { id: string; class_id: string; subject_id: string; class?: { name: string }; subject?: { name: string; code?: string } };
type SubjectTeacher = { id: string; subject_id: string; teacher_id: string; class_id?: string; subject?: { name: string; code?: string }; teacher?: { name: string; email?: string }; class?: { name: string } };
type ClassTeacher = { id: string; class_id: string; teacher_id: string; role: string; class?: { name: string }; teacher?: { name: string; email?: string } };
type WorkloadItem = { teacher: Teacher; subjectCount: number; classCount: number; subjects: string[]; classes: string[]; timetableEntries: number; totalAssignments: number };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

function AlertBanner({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) {
  const bg = type === "error" ? "#FEF2F2" : "#D1FAE5";
  const color = type === "error" ? "#EF4444" : "#065F46";
  const border = type === "error" ? "#FECACA" : "#A7F3D0";
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: bg, color, border: `1px solid ${border}`, fontSize: "0.9rem" }}>
      {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-auto"><X size={14} /></button>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} color={color || MUTED} />
        <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ color: PLUM }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: MUTED }}>{sub}</p>}
    </div>
  );
}

function LoadingSpinner({ height = 48 }: { height?: number }) {
  return <div className="flex items-center justify-center" style={{ height }}><Loader2 className="animate-spin" size={24} color={PLUM} /></div>;
}

function EmptyState({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <Icon size={40} color={MUTED} className="mx-auto mb-3" />
      <p className="font-semibold" style={{ color: PLUM }}>{title}</p>
      <p className="text-sm mt-1" style={{ color: MUTED }}>{desc}</p>
    </div>
  );
}

function Modal({ title, onClose, saving, onSave, children, saveLabel = "Save" }: {
  title: string; onClose: () => void; saving?: boolean; onSave?: () => void; children: React.ReactNode; saveLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(56,25,50,0.6)", backdropFilter: "blur(4px)" }}
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <div className="w-full max-w-md rounded-[32px] p-8" style={{ background: "white", boxShadow: "0 32px 80px rgba(56,25,50,0.3)" }}
        onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: PLUM }}>{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:opacity-70" style={{ background: "rgba(56,25,50,0.06)" }}>
            <X size={16} color={MUTED} />
          </button>
        </div>
        <div className="flex flex-col gap-1">{children}</div>
        {onSave && (
          <button onClick={onSave} disabled={saving}
            className="w-full py-3 rounded-full flex items-center justify-center gap-2 mt-6 active:scale-95 transition-transform text-sm font-semibold"
            style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {saving ? "Saving..." : saveLabel}
          </button>
        )}
      </div>
    </div>
  );
}

const TABS = [
  { key: "classes", label: "Classes", icon: School },
  { key: "subjects", label: "Subjects", icon: BookOpen },
  { key: "terms", label: "Terms", icon: CalendarDays },
  { key: "timetable", label: "Timetable", icon: Clock },
  { key: "workload", label: "Workload", icon: Briefcase },
];

export function Academics() {
  const [tab, setTab] = useState("classes");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: PLUM }}>Academic Structure</h2>
          <p className="text-sm" style={{ color: MUTED }}>Manage classes, subjects, timetable and staffing</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
            style={{
              background: tab === t.key ? PLUM : "white",
              color: tab === t.key ? MILK : PLUM_LIGHT,
              border: tab === t.key ? "none" : "1px solid rgba(56,25,50,0.1)",
            }}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "classes" && <ClassesTab setError={setError} setSuccess={setSuccess} />}
      {tab === "subjects" && <SubjectsTab setError={setError} setSuccess={setSuccess} />}
      {tab === "terms" && <TermsTab setError={setError} setSuccess={setSuccess} />}
      {tab === "timetable" && <TimetableTab setError={setError} setSuccess={setSuccess} />}
      {tab === "workload" && <WorkloadTab setError={setError} />}
    </div>
  );
}

// ─── Classes Tab ──────────────────────────────────────────────
function ClassesTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [classTeachers, setClassTeachers] = useState<ClassTeacher[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showCreateStream, setShowCreateStream] = useState(false);
  const [showAssignTeacher, setShowAssignTeacher] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classForm, setClassForm] = useState({ name: "" });
  const [streamForm, setStreamForm] = useState({ name: "", class_id: "" });
  const [teacherForm, setTeacherForm] = useState({ class_id: "", teacher_id: "", role: "form_teacher" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes, ctRes, tRes] = await Promise.all([
        api.get<any>("/api/school/classes"),
        api.get<any>("/api/school/streams"),
        api.get<any>("/api/school/class-teachers"),
        api.get<any>("/api/school/teachers"),
      ]);
      setClasses(cRes.data?.data?.classes || cRes.data?.classes || []);
      setStreams(sRes.data?.data?.streams || sRes.data?.streams || []);
      setClassTeachers(ctRes.data?.data?.assignments || ctRes.data?.assignments || []);
      setTeachers(tRes.data?.data?.teachers || tRes.data?.teachers || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = classes.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));

  const handleCreateClass = async () => {
    if (!classForm.name) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/classes", classForm);
      setClassForm({ name: "" });
      setShowCreateClass(false);
      setSuccess("Class created");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Delete this class? This cannot be undone.")) return;
    try {
      await api.delete(`/api/school/classes/${id}`);
      setSuccess("Class deleted");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleCreateStream = async () => {
    if (!streamForm.name || !streamForm.class_id) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/streams", streamForm);
      setStreamForm({ name: "", class_id: "" });
      setShowCreateStream(false);
      setSuccess("Stream created");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDeleteStream = async (id: string) => {
    if (!confirm("Delete this stream?")) return;
    try {
      await api.delete(`/api/school/streams/${id}`);
      await load();
    } catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleAssignTeacher = async () => {
    if (!teacherForm.class_id || !teacherForm.teacher_id) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/class-teachers", teacherForm);
      setTeacherForm({ class_id: "", teacher_id: "", role: "form_teacher" });
      setShowAssignTeacher(false);
      setSuccess("Teacher assigned");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleRemoveTeacher = async (id: string) => {
    if (!confirm("Remove this teacher assignment?")) return;
    try {
      await api.delete(`/api/school/class-teachers/${id}`);
      await load();
    } catch (err: any) { setError(err.message || "Failed"); }
  };

  if (loading) return <LoadingSpinner height={200} />;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <SummaryCard icon={School} label="Classes" value={classes.length} />
        <SummaryCard icon={GitBranch} label="Streams" value={streams.length} />
        <SummaryCard icon={UserCheck} label="Assigned Teachers" value={classTeachers.length} />
        <SummaryCard icon={Users} label="Available Teachers" value={teachers.length} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setShowCreateClass(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          <Plus size={14} /> Add Class
        </button>
        <button onClick={() => { setShowCreateStream(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          style={{ background: "white", color: PLUM_LIGHT, border: "1px solid rgba(56,25,50,0.1)" }}>
          <GitBranch size={14} /> Add Stream
        </button>
        <button onClick={() => { setShowAssignTeacher(true); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          style={{ background: "white", color: PLUM_LIGHT, border: "1px solid rgba(56,25,50,0.1)" }}>
          <UserPlus size={14} /> Assign Teacher
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px] max-w-[280px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
          <Search size={14} color={MUTED} />
          <input placeholder="Search classes..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={School} title="No classes yet" desc="Create your first class to get started" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => {
            const classStreams = streams.filter(s => s.class_id === c.id);
            const classTeacherAssignments = classTeachers.filter(ct => ct.class_id === c.id);
            return (
              <div key={c.id} className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                      <School size={16} color="#6366F1" />
                    </div>
                    <span className="font-semibold" style={{ color: PLUM }}>{c.name}</span>
                  </div>
                  <button onClick={() => handleDeleteClass(c.id)} className="p-1 rounded hover:opacity-70" style={{ color: MUTED }}>
                    <Trash2 size={13} />
                  </button>
                </div>

                {classStreams.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Streams</p>
                    <div className="flex flex-wrap gap-1.5">
                      {classStreams.map(s => (
                        <span key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                          style={{ background: "rgba(56,25,50,0.06)", color: PLUM_LIGHT }}>
                          {s.name}
                          <button onClick={() => handleDeleteStream(s.id)} className="hover:opacity-70"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {classTeacherAssignments.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Teachers</p>
                    {classTeacherAssignments.map(ct => (
                      <div key={ct.id} className="flex items-center justify-between text-xs" style={{ color: PLUM_LIGHT }}>
                        <span>{ct.teacher?.name || "Unknown"} <span className="italic" style={{ color: MUTED }}>({ct.role.replace("_", " ")})</span></span>
                        <button onClick={() => handleRemoveTeacher(ct.id)} className="hover:opacity-70" style={{ color: MUTED }}>
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {classStreams.length === 0 && classTeacherAssignments.length === 0 && (
                  <p className="text-xs" style={{ color: MUTED }}>No streams or teachers assigned</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreateClass && (
        <Modal title="Create Class" onClose={() => setShowCreateClass(false)} saving={saving} onSave={handleCreateClass}>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Class Name</label>
          <input value={classForm.name} onChange={(e) => setClassForm({ name: e.target.value })}
            placeholder="e.g. Grade 7A" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
        </Modal>
      )}

      {showCreateStream && (
        <Modal title="Create Stream" onClose={() => setShowCreateStream(false)} saving={saving} onSave={handleCreateStream}>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Stream Name</label>
          <input value={streamForm.name} onChange={(e) => setStreamForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. A, B, Science, Arts" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
          <label className="block text-sm font-medium mb-1 mt-3" style={{ color: PLUM_LIGHT }}>Class</label>
          <select value={streamForm.class_id} onChange={(e) => setStreamForm(p => ({ ...p, class_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Modal>
      )}

      {showAssignTeacher && (
        <Modal title="Assign Class Teacher" onClose={() => setShowAssignTeacher(false)} saving={saving} onSave={handleAssignTeacher}>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Class</label>
          <select value={teacherForm.class_id} onChange={(e) => setTeacherForm(p => ({ ...p, class_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="block text-sm font-medium mb-1 mt-3" style={{ color: PLUM_LIGHT }}>Teacher</label>
          <select value={teacherForm.teacher_id} onChange={(e) => setTeacherForm(p => ({ ...p, teacher_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select teacher...</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <label className="block text-sm font-medium mb-1 mt-3" style={{ color: PLUM_LIGHT }}>Role</label>
          <select value={teacherForm.role} onChange={(e) => setTeacherForm(p => ({ ...p, role: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="form_teacher">Form Teacher</option>
            <option value="assistant">Assistant Teacher</option>
            <option value="head_teacher">Head Teacher</option>
          </select>
        </Modal>
      )}
    </>
  );
}

// ─── Subjects Tab ─────────────────────────────────────────────
function SubjectsTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [subjectTeachers, setSubjectTeachers] = useState<SubjectTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCreateSubject, setShowCreateSubject] = useState(false);
  const [showAssignToClass, setShowAssignToClass] = useState(false);
  const [showAssignTeacher, setShowAssignTeacher] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", is_core: true });
  const [classSubjectForm, setClassSubjectForm] = useState({ class_id: "", subject_id: "" });
  const [teacherAssignForm, setTeacherAssignForm] = useState({ subject_id: "", teacher_id: "", class_id: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subRes, clsRes, tRes, csRes, stRes] = await Promise.all([
        api.get<any>("/api/school/subjects"),
        api.get<any>("/api/school/classes"),
        api.get<any>("/api/school/teachers"),
        api.get<any>("/api/school/class-subjects"),
        api.get<any>("/api/school/subject-teachers"),
      ]);
      setSubjects(subRes.data?.data?.subjects || subRes.data?.subjects || []);
      setClasses(clsRes.data?.data?.classes || clsRes.data?.classes || []);
      setTeachers(tRes.data?.data?.teachers || tRes.data?.teachers || []);
      setClassSubjects(csRes.data?.data?.associations || csRes.data?.associations || []);
      setSubjectTeachers(stRes.data?.data?.assignments || stRes.data?.assignments || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = subjects.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.code || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!subjectForm.name) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/subjects", subjectForm);
      setSubjectForm({ name: "", code: "", is_core: true });
      setShowCreateSubject(false);
      setSuccess("Subject created");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subject? This cannot be undone.")) return;
    try {
      await api.delete(`/api/school/subjects/${id}`);
      setSuccess("Subject deleted");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleAssignToClass = async () => {
    if (!classSubjectForm.class_id || !classSubjectForm.subject_id) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/class-subjects", classSubjectForm);
      setClassSubjectForm({ class_id: "", subject_id: "" });
      setShowAssignToClass(false);
      setSuccess("Subject assigned to class");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleRemoveFromClass = async (id: string) => {
    if (!confirm("Remove this subject from class?")) return;
    try { await api.delete(`/api/school/class-subjects/${id}`); await load(); }
    catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleAssignTeacher = async () => {
    if (!teacherAssignForm.subject_id || !teacherAssignForm.teacher_id) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/subject-teachers", teacherAssignForm);
      setTeacherAssignForm({ subject_id: "", teacher_id: "", class_id: "" });
      setShowAssignTeacher(false);
      setSuccess("Teacher assigned to subject");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleRemoveTeacher = async (id: string) => {
    if (!confirm("Remove this teacher assignment?")) return;
    try { await api.delete(`/api/school/subject-teachers/${id}`); await load(); }
    catch (err: any) { setError(err.message || "Failed"); }
  };

  if (loading) return <LoadingSpinner height={200} />;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <SummaryCard icon={BookOpen} label="Subjects" value={subjects.length} />
        <SummaryCard icon={School} label="Class-Subject Links" value={classSubjects.length} sub="Subjects assigned to classes" />
        <SummaryCard icon={UserCheck} label="Subject Teachers" value={subjectTeachers.length} sub="Teachers assigned to subjects" />
        <SummaryCard icon={Users} label="Teachers" value={teachers.length} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setShowCreateSubject(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          <Plus size={14} /> Add Subject
        </button>
        <button onClick={() => setShowAssignToClass(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "white", color: PLUM_LIGHT, border: "1px solid rgba(56,25,50,0.1)" }}>
          <Layers size={14} /> Link to Class
        </button>
        <button onClick={() => setShowAssignTeacher(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "white", color: PLUM_LIGHT, border: "1px solid rgba(56,25,50,0.1)" }}>
          <UserPlus size={14} /> Assign Teacher
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 min-w-[200px] max-w-[280px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
          <Search size={14} color={MUTED} />
          <input placeholder="Search subjects..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="sm:col-span-2 lg:col-span-3"><EmptyState icon={BookOpen} title="No subjects yet" desc="Create your first subject" /></div>
        ) : filtered.map(s => {
          const linkedClasses = classSubjects.filter(cs => cs.subject_id === s.id);
          const assignedTeachers = subjectTeachers.filter(st => st.subject_id === s.id);
          return (
            <div key={s.id} className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold" style={{ color: PLUM }}>{s.name}</span>
                  {s.is_core && <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{ background: "#D1FAE5", color: "#065F46" }}>Core</span>}
                </div>
                <button onClick={() => handleDelete(s.id)} className="p-1 rounded hover:opacity-70" style={{ color: MUTED }}>
                  <Trash2 size={13} />
                </button>
              </div>
              {s.code && <p className="text-xs mb-2" style={{ color: MUTED }}>Code: {s.code}</p>}
              {linkedClasses.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Taught in</p>
                  <div className="flex flex-wrap gap-1">
                    {linkedClasses.map(cs => (
                      <span key={cs.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}>
                        {cs.class?.name}
                        <button onClick={() => handleRemoveFromClass(cs.id)} className="hover:opacity-70"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {assignedTeachers.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Teachers</p>
                  <div className="flex flex-wrap gap-1">
                    {assignedTeachers.map(st => (
                      <span key={st.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs"
                        style={{ background: "rgba(16,185,129,0.1)", color: "#065F46" }}>
                        {st.teacher?.name}{st.class ? ` (${st.class.name})` : ""}
                        <button onClick={() => handleRemoveTeacher(st.id)} className="hover:opacity-70"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {linkedClasses.length === 0 && assignedTeachers.length === 0 && (
                <p className="text-xs" style={{ color: MUTED }}>Not linked to any classes yet</p>
              )}
            </div>
          );
        })}
      </div>

      {showCreateSubject && (
        <Modal title="Create Subject" onClose={() => setShowCreateSubject(false)} saving={saving} onSave={handleCreate}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Subject Name</label>
            <input value={subjectForm.name} onChange={(e) => setSubjectForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Mathematics" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
              style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Code (optional)</label>
            <input value={subjectForm.code} onChange={(e) => setSubjectForm(p => ({ ...p, code: e.target.value }))}
              placeholder="e.g. MATH" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
              style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={subjectForm.is_core} onChange={(e) => setSubjectForm(p => ({ ...p, is_core: e.target.checked }))}
              className="rounded accent-[#381932]" />
            <span className="text-sm" style={{ color: PLUM_LIGHT }}>Core subject</span>
          </label>
        </Modal>
      )}

      {showAssignToClass && (
        <Modal title="Link Subject to Class" onClose={() => setShowAssignToClass(false)} saving={saving} onSave={handleAssignToClass}>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Class</label>
          <select value={classSubjectForm.class_id} onChange={(e) => setClassSubjectForm(p => ({ ...p, class_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm mb-3"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select class...</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Subject</label>
          <select value={classSubjectForm.subject_id} onChange={(e) => setClassSubjectForm(p => ({ ...p, subject_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Modal>
      )}

      {showAssignTeacher && (
        <Modal title="Assign Teacher to Subject" onClose={() => setShowAssignTeacher(false)} saving={saving} onSave={handleAssignTeacher}>
                <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Subject</label>
          <select value={teacherAssignForm.subject_id} onChange={(e) => setTeacherAssignForm(p => ({ ...p, subject_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm mb-3"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select subject...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Teacher</label>
          <select value={teacherAssignForm.teacher_id} onChange={(e) => setTeacherAssignForm(p => ({ ...p, teacher_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm mb-3"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">Select teacher...</option>
            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Class (optional)</label>
          <select value={teacherAssignForm.class_id} onChange={(e) => setTeacherAssignForm(p => ({ ...p, class_id: e.target.value }))}
            className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
            style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
            <option value="">All classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Modal>
      )}
    </>
  );
}

// ─── Terms Tab ────────────────────────────────────────────────
function TermsTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showCreateTerm, setShowCreateTerm] = useState(false);
  const [sessionForm, setSessionForm] = useState({ name: "", start_date: "", end_date: "", is_current: false });
  const [termForm, setTermForm] = useState({ name: "", start_date: "", end_date: "", is_current: false });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sesRes, tRes] = await Promise.all([
        api.get<any>("/api/school/sessions"),
        api.get<any>("/api/school/terms"),
      ]);
      setSessions(sesRes.data?.data?.sessions || sesRes.data?.sessions || []);
      setTerms(tRes.data?.data?.terms || tRes.data?.terms || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreateSession = async () => {
    if (!sessionForm.name || !sessionForm.start_date || !sessionForm.end_date) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/sessions", sessionForm);
      setSessionForm({ name: "", start_date: "", end_date: "", is_current: false });
      setShowCreateSession(false);
      setSuccess("Session created");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm("Delete this session?")) return;
    try { await api.delete(`/api/school/sessions/${id}`); await load(); }
    catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleSetCurrentSession = async (id: string) => {
    try {
      await api.put(`/api/school/sessions/${id}`, { is_current: true });
      setSuccess("Session set as current");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleCreateTerm = async () => {
    if (!termForm.name || !termForm.start_date || !termForm.end_date) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/terms", termForm);
      setTermForm({ name: "", start_date: "", end_date: "", is_current: false });
      setShowCreateTerm(false);
      setSuccess("Term created");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDeleteTerm = async (id: string) => {
    if (!confirm("Delete this term?")) return;
    try { await api.delete(`/api/school/terms/${id}`); await load(); }
    catch (err: any) { setError(err.message || "Failed"); }
  };

  const handleSetCurrentTerm = async (id: string) => {
    try {
      await api.put(`/api/school/terms/${id}`, { is_current: true });
      setSuccess("Term set as current");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); }
  };

  if (loading) return <LoadingSpinner height={200} />;

  const currentTerm = terms.find(t => t.is_current);
  const currentSession = sessions.find(s => s.is_current);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <SummaryCard icon={CalendarDays} label="Sessions" value={sessions.length} />
        <SummaryCard icon={Star} label="Terms" value={terms.length} />
        <SummaryCard icon={Check} label="Current Session" value={currentSession?.name || "None"} color="#10B981" />
        <SummaryCard icon={Check} label="Current Term" value={currentTerm?.name || "None"} color="#10B981" />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setShowCreateSession(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          <Plus size={14} /> Add Session
        </button>
        <button onClick={() => setShowCreateTerm(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "white", color: PLUM_LIGHT, border: "1px solid rgba(56,25,50,0.1)" }}>
          <Plus size={14} /> Add Term
        </button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-semibold mb-3 text-sm" style={{ color: PLUM }}>Academic Sessions</h3>
          {sessions.length === 0 ? (
            <div className="p-8 rounded-xl text-center" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <CalendarDays size={32} color={MUTED} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: MUTED }}>No sessions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map(s => (
                <div key={s.id} className="p-3 rounded-xl flex items-center justify-between" style={{ background: s.is_current ? "#D1FAE5" : "white", border: `1px solid ${s.is_current ? "#A7F3D0" : "rgba(56,25,50,0.07)"}` }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: PLUM }}>{s.name} {s.is_current && <span className="text-xs" style={{ color: "#065F46" }}>(Current)</span>}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{new Date(s.start_date).toLocaleDateString()} – {new Date(s.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!s.is_current && (
                      <button onClick={() => handleSetCurrentSession(s.id)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#065F46" }}>Set Current</button>
                    )}
                    <button onClick={() => handleDeleteSession(s.id)} className="p-1 rounded hover:opacity-70" style={{ color: MUTED }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-3 text-sm" style={{ color: PLUM }}>Academic Terms</h3>
          {terms.length === 0 ? (
            <div className="p-8 rounded-xl text-center" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <Star size={32} color={MUTED} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: MUTED }}>No terms yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {terms.map(t => (
                <div key={t.id} className="p-3 rounded-xl flex items-center justify-between" style={{ background: t.is_current ? "#D1FAE5" : "white", border: `1px solid ${t.is_current ? "#A7F3D0" : "rgba(56,25,50,0.07)"}` }}>
                  <div>
                    <p className="font-medium text-sm" style={{ color: PLUM }}>{t.name} {t.is_current && <span className="text-xs" style={{ color: "#065F46" }}>(Current)</span>}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{new Date(t.start_date).toLocaleDateString()} – {new Date(t.end_date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {!t.is_current && (
                      <button onClick={() => handleSetCurrentTerm(t.id)} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#065F46" }}>Set Current</button>
                    )}
                    <button onClick={() => handleDeleteTerm(t.id)} className="p-1 rounded hover:opacity-70" style={{ color: MUTED }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateSession && (
        <Modal title="Create Academic Session" onClose={() => setShowCreateSession(false)} saving={saving} onSave={handleCreateSession}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Session Name</label>
            <input value={sessionForm.name} onChange={(e) => setSessionForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. 2025-2026" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
              style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Start Date</label>
              <input type="date" value={sessionForm.start_date} onChange={(e) => setSessionForm(p => ({ ...p, start_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>End Date</label>
              <input type="date" value={sessionForm.end_date} onChange={(e) => setSessionForm(p => ({ ...p, end_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
          </div>
        </Modal>
      )}

      {showCreateTerm && (
        <Modal title="Create Academic Term" onClose={() => setShowCreateTerm(false)} saving={saving} onSave={handleCreateTerm}>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Term Name</label>
            <input value={termForm.name} onChange={(e) => setTermForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Term 1" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
              style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Start Date</label>
              <input type="date" value={termForm.start_date} onChange={(e) => setTermForm(p => ({ ...p, start_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>End Date</label>
              <input type="date" value={termForm.end_date} onChange={(e) => setTermForm(p => ({ ...p, end_date: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── Timetable Tab ────────────────────────────────────────────
function TimetableTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [conflicts, setConflicts] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ day: "Monday", period: "", subject: "", teacher: "", class_name: "", room: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ttRes, cRes, sRes, tRes] = await Promise.all([
        api.get<any>("/api/school/timetable"),
        api.get<any>("/api/school/classes"),
        api.get<any>("/api/school/subjects"),
        api.get<any>("/api/school/teachers"),
      ]);
      setEntries(ttRes.data?.data?.timetable || ttRes.data?.timetable || []);
      setClasses(cRes.data?.data?.classes || cRes.data?.classes || []);
      setSubjects(sRes.data?.data?.subjects || sRes.data?.subjects || []);
      setTeachers(tRes.data?.data?.teachers || tRes.data?.teachers || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (form.day && form.period) {
      const conflicts = entries.filter(e =>
        e.day === form.day && e.period === form.period && (
          (form.teacher && e.teacher?.toLowerCase() === form.teacher.toLowerCase()) ||
          (form.class_name && e.class_name?.toLowerCase() === form.class_name.toLowerCase()) ||
          (form.room && e.room?.toLowerCase() === form.room.toLowerCase())
        )
      );
      setConflicts(conflicts);
    } else {
      setConflicts([]);
    }
  }, [form, entries]);

  const handleCreate = async () => {
    if (!form.day || !form.period || !form.subject || !form.teacher || !form.class_name) return;
    if (conflicts.length > 0 && !confirm(`${conflicts.length} conflict(s) detected. Create anyway?`)) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("/api/school/timetable", form);
      setForm({ day: "Monday", period: "", subject: "", teacher: "", class_name: "", room: "" });
      setShowCreate(false);
      setSuccess("Period added");
      await load();
    } catch (err: any) { setError(err.message || "Failed"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this timetable entry?")) return;
    try {
      await api.delete(`/api/school/timetable/${id}`);
      await load();
    } catch (err: any) { setError(err.message || "Failed"); }
  };

  if (loading) return <LoadingSpinner height={200} />;

  const groupedByDay: Record<string, TimetableEntry[]> = {};
  DAYS.forEach(d => { groupedByDay[d] = entries.filter(e => e.day === d).sort((a, b) => a.period.localeCompare(b.period)); });

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <SummaryCard icon={Clock} label="Total Periods" value={entries.length} />
        <SummaryCard icon={School} label="Days Covered" value={DAYS.filter(d => entries.some(e => e.day === d)).length} sub="/ 5 days" />
        <SummaryCard icon={Users} label="Teachers Scheduled" value={new Set(entries.map(e => e.teacher)).size} />
        <SummaryCard icon={BookOpen} label="Subjects Scheduled" value={new Set(entries.map(e => e.subject)).size} />
      </div>

      <button onClick={() => setShowCreate(true)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform mb-4"
        style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
        <Plus size={14} /> Add Period
      </button>

      {entries.length === 0 ? (
        <EmptyState icon={Clock} title="No timetable entries yet" desc="Add periods to build the schedule" />
      ) : (
        DAYS.map(day => {
          const dayEntries = groupedByDay[day] || [];
          if (dayEntries.length === 0) return null;
          return (
            <div key={day} className="mb-4">
              <h3 className="font-semibold text-sm mb-2" style={{ color: PLUM }}>{day}</h3>
              <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                      <th className="px-3 py-2 font-medium">Period</th>
                      <th className="px-3 py-2 font-medium">Subject</th>
                      <th className="px-3 py-2 font-medium">Teacher</th>
                      <th className="px-3 py-2 font-medium">Class</th>
                      <th className="px-3 py-2 font-medium">Room</th>
                      <th className="px-3 py-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dayEntries.map(t => (
                      <tr key={t.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                        <td className="px-3 py-2 font-medium" style={{ color: PLUM }}>{t.period || "—"}</td>
                        <td className="px-3 py-2" style={{ color: PLUM }}>{t.subject || "—"}</td>
                        <td className="px-3 py-2 text-xs" style={{ color: PLUM_LIGHT }}>{t.teacher || "—"}</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(16,185,129,0.1)", color: "#065F46" }}>{t.class_name || "—"}</span></td>
                        <td className="px-3 py-2 text-xs" style={{ color: MUTED }}>{t.room || "—"}</td>
                        <td className="px-3 py-2">
                          <button onClick={() => handleDelete(t.id)} className="p-1 rounded hover:opacity-70" style={{ color: MUTED }}><Trash2 size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      {showCreate && (
        <Modal title="Add Timetable Period" onClose={() => setShowCreate(false)} saving={saving} onSave={handleCreate} saveLabel="Add Period">
          {conflicts.length > 0 && (
            <div className="mb-4 p-3 rounded-xl flex items-start gap-2 text-sm" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA" }}>
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-medium mb-1">{conflicts.length} conflict(s) detected:</p>
                {conflicts.map(c => (
                  <p key={c.id} className="text-xs">• {c.subject} with {c.teacher} in {c.class_name}{c.room ? ` (${c.room})` : ""}</p>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Day</label>
              <select value={form.day} onChange={(e) => setForm(p => ({ ...p, day: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Period</label>
              <input value={form.period} onChange={(e) => setForm(p => ({ ...p, period: e.target.value }))}
                placeholder="e.g. 08:00-08:45" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Subject</label>
            <select value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
              style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
              <option value="">Select subject...</option>
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Teacher</label>
              <select value={form.teacher} onChange={(e) => setForm(p => ({ ...p, teacher: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                <option value="">Select teacher...</option>
                {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Class</label>
              <select value={form.class_name} onChange={(e) => setForm(p => ({ ...p, class_name: e.target.value }))}
                className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                <option value="">Select class...</option>
                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Room (optional)</label>
            <input value={form.room} onChange={(e) => setForm(p => ({ ...p, room: e.target.value }))}
              placeholder="e.g. Room 12" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
              style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
          </div>
        </Modal>
      )}
    </>
  );
}

// ─── Workload Tab ─────────────────────────────────────────────
function WorkloadTab({ setError }: { setError: (s: string) => void }) {
  const [workload, setWorkload] = useState<WorkloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api.get<any>("/api/school/teachers/workload")
      .then(res => setWorkload(res.data?.data?.workload || res.data?.workload || []))
      .catch(() => setError("Failed to load workload data"))
      .finally(() => setLoading(false));
  }, [setError]);

  const filtered = workload.filter(w =>
    !search || w.teacher.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner height={200} />;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-4 mb-6">
        <SummaryCard icon={Users} label="Teachers" value={workload.length} />
        <SummaryCard icon={BookOpen} label="Total Assignments" value={workload.reduce((a, b) => a + b.totalAssignments, 0)} />
        <SummaryCard icon={School} label="Covered Classes" value={new Set(workload.flatMap(w => w.classes)).size} />
        <SummaryCard icon={Clock} label="Timetable Periods" value={workload.reduce((a, b) => a + b.timetableEntries, 0)} />
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 max-w-[280px]" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
        <Search size={14} color={MUTED} />
        <input placeholder="Search teacher..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No workload data" desc={workload.length > 0 ? "No teachers match your search" : "Assign subjects to teachers to see workload"} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(w => (
            <div key={w.teacher.id} className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
                  {w.teacher.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: PLUM }}>{w.teacher.name}</p>
                  {w.teacher.email && <p className="text-xs" style={{ color: MUTED }}>{w.teacher.email}</p>}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg" style={{ background: "rgba(99,102,241,0.08)" }}>
                  <p className="text-lg font-bold" style={{ color: "#6366F1" }}>{w.subjectCount}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>Subjects</p>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: "rgba(16,185,129,0.08)" }}>
                  <p className="text-lg font-bold" style={{ color: "#065F46" }}>{w.classCount}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>Classes</p>
                </div>
                <div className="text-center p-2 rounded-lg" style={{ background: "rgba(245,158,11,0.08)" }}>
                  <p className="text-lg font-bold" style={{ color: "#B45309" }}>{w.timetableEntries}</p>
                  <p className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>Periods</p>
                </div>
              </div>
              {w.subjects.length > 0 && (
                <div className="mb-1">
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Subjects</p>
                  <div className="flex flex-wrap gap-1">
                    {w.subjects.map(s => <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}>{s}</span>)}
                  </div>
                </div>
              )}
              {w.classes.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: MUTED }}>Classes</p>
                  <div className="flex flex-wrap gap-1">
                    {w.classes.map(c => <span key={c} className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(16,185,129,0.1)", color: "#065F46" }}>{c}</span>)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
