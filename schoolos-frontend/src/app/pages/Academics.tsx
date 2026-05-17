import { useState, useEffect, useCallback } from "react";
import {
  BookOpen, Plus, X, Loader2, Search, Users,
  Trash2, Check, AlertCircle, Clock, Star,
} from "lucide-react";
import { api } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type ClassItem = { id: string; name: string; [key: string]: any };
type Subject = { id: string; name: string; code?: string; is_core?: boolean; created_at?: string };
type Exam = { id: string; name: string; subject: string; class_name: string; date: string; total_marks: number };
type TimetableEntry = { id: string; [key: string]: any };

type Tab = "classes" | "subjects" | "exams" | "timetable";

export function Academics() {
  const [tab, setTab] = useState<Tab>("classes");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState<Tab | "exam">("classes");
  const [saving, setSaving] = useState(false);

  const [classForm, setClassForm] = useState({ name: "" });
  const [subjectForm, setSubjectForm] = useState({ name: "", code: "", is_core: true });
  const [examForm, setExamForm] = useState({ name: "", subject: "", class_name: "", date: "", total_marks: 100 });
  const [timetableForm, setTimetableForm] = useState({ day: "", period: "", subject: "", teacher: "", class_name: "", room: "" });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, sRes, eRes, tRes] = await Promise.all([
        api.get<{ classes: ClassItem[] }>("/api/school/classes"),
        api.get<{ subjects: Subject[] }>("/api/school/subjects").catch(() => ({ data: { subjects: [] } })),
        api.get<{ exams: Exam[] }>("/api/school/exams"),
        api.get<{ timetable: TimetableEntry[] }>("/api/school/timetable"),
      ]);
      setClasses(cRes.data?.classes || []);
      setSubjects(sRes.data?.subjects || []);
      setExams(eRes.data?.exams || []);
      setTimetable(tRes.data?.timetable || []);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openCreate = (type: Tab) => {
    setCreateType(type);
    setShowCreate(true);
    setError("");
    setSuccess("");
  };

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (createType === "classes") {
        await api.post("/api/school/classes", classForm);
        setClassForm({ name: "" });
      } else if (createType === "subjects") {
        await api.post("/api/school/subjects", subjectForm);
        setSubjectForm({ name: "", code: "", is_core: true });
      } else if (createType === "exams") {
        await api.post("/api/school/exams", examForm);
        setExamForm({ name: "", subject: "", class_name: "", date: "", total_marks: 100 });
      } else if (createType === "timetable") {
        await api.post("/api/school/timetable", timetableForm);
        setTimetableForm({ day: "", period: "", subject: "", teacher: "", class_name: "", room: "" });
      }
      setSuccess("Created successfully");
      setShowCreate(false);
      await loadAll();
    } catch (err: any) {
      setError(err.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      if (type === "class") await api.delete(`/api/school/classes/${id}`);
      else if (type === "subject") await api.delete(`/api/school/subjects/${id}`);
      else if (type === "exam") await api.delete(`/api/school/exams/${id}`);
      else if (type === "timetable") await api.delete(`/api/school/timetable/${id}`);
      setSuccess("Deleted successfully");
      await loadAll();
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    }
  };

  const filteredClasses = classes.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()));
  const filteredSubjects = subjects.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.code || "").toLowerCase().includes(search.toLowerCase()));
  const filteredExams = exams.filter(e => !search ||
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.subject.toLowerCase().includes(search.toLowerCase()) ||
    e.class_name.toLowerCase().includes(search.toLowerCase()));

  const renderForm = () => {
    switch (createType) {
      case "classes":
        return (
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Class Name</label>
            <input value={classForm.name} onChange={(e) => setClassForm({ name: e.target.value })}
              placeholder="e.g. Grade 7A" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
              style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
          </div>
        );
      case "subjects":
        return (
          <>
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
          </>
        );
      case "exams":
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Exam Name</label>
              <input value={examForm.name} onChange={(e) => setExamForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Term 1 Exams" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Subject</label>
                <select value={examForm.subject} onChange={(e) => setExamForm(p => ({ ...p, subject: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                  <option value="">Select...</option>
                  {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Class</label>
                <select value={examForm.class_name} onChange={(e) => setExamForm(p => ({ ...p, class_name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                  <option value="">Select...</option>
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Date</label>
                <input type="date" value={examForm.date} onChange={(e) => setExamForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Total Marks</label>
                <input type="number" value={examForm.total_marks} onChange={(e) => setExamForm(p => ({ ...p, total_marks: Number(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
              </div>
            </div>
          </>
        );
      case "timetable":
        return (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Day</label>
                <select value={timetableForm.day} onChange={(e) => setTimetableForm(p => ({ ...p, day: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                  {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Period</label>
                <input value={timetableForm.period} onChange={(e) => setTimetableForm(p => ({ ...p, period: e.target.value }))}
                  placeholder="e.g. 08:00-08:45" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Subject</label>
              <input value={timetableForm.subject} onChange={(e) => setTimetableForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="e.g. Mathematics" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Teacher</label>
                <input value={timetableForm.teacher} onChange={(e) => setTimetableForm(p => ({ ...p, teacher: e.target.value }))}
                  placeholder="Teacher name" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Class</label>
                <select value={timetableForm.class_name} onChange={(e) => setTimetableForm(p => ({ ...p, class_name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }}>
                  <option value="">Select...</option>
                  {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: PLUM_LIGHT }}>Room (optional)</label>
              <input value={timetableForm.room} onChange={(e) => setTimetableForm(p => ({ ...p, room: e.target.value }))}
                placeholder="e.g. Room 12" className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                style={{ background: MILK, border: "1.5px solid rgba(56,25,50,0.1)", color: PLUM }} />
            </div>
          </>
        );
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-48"><Loader2 className="animate-spin" size={28} color={PLUM} /></div>;
    }

    switch (tab) {
      case "classes":
        return (
          <>
            <div className="flex items-center gap-2 mb-4">
              <Search size={14} color={MUTED} />
              <input placeholder="Search classes..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
            </div>
            {filteredClasses.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <Users size={40} color={MUTED} className="mx-auto mb-3" />
                <p className="font-semibold" style={{ color: PLUM }}>No classes yet</p>
                <p className="text-sm mt-1" style={{ color: MUTED }}>Create your first class</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredClasses.map(c => (
                  <div key={c.id} className="p-4 rounded-xl flex items-center justify-between" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)" }}>
                        <Users size={17} color="#6366F1" />
                      </div>
                      <span className="font-semibold" style={{ color: PLUM }}>{c.name}</span>
                    </div>
                    <button onClick={() => handleDelete("class", c.id)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: MUTED }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        );

      case "subjects":
        return (
          <>
            <div className="flex items-center gap-2 mb-4" style={{ maxWidth: 300 }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-full" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
                <Search size={14} color={MUTED} />
                <input placeholder="Search subjects..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
              </div>
            </div>
            {filteredSubjects.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <BookOpen size={40} color={MUTED} className="mx-auto mb-3" />
                <p className="font-semibold" style={{ color: PLUM }}>No subjects yet</p>
                <p className="text-sm mt-1" style={{ color: MUTED }}>Create your first subject</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSubjects.map(s => (
                  <div key={s.id} className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold" style={{ color: PLUM }}>{s.name}</span>
                      <button onClick={() => handleDelete("subject", s.id)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: MUTED }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs" style={{ color: MUTED }}>
                      {s.code && <span>{s.code}</span>}
                      {s.is_core && (
                        <span className="px-2 py-0.5 rounded-full" style={{ background: "#D1FAE5", color: "#065F46" }}>Core</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        );

      case "exams":
        return (
          <>
            <div className="flex items-center gap-2 mb-4" style={{ maxWidth: 300 }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl w-full" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)" }}>
                <Search size={14} color={MUTED} />
                <input placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
              </div>
            </div>
            {filteredExams.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <Star size={40} color={MUTED} className="mx-auto mb-3" />
                <p className="font-semibold" style={{ color: PLUM }}>No exams yet</p>
                <p className="text-sm mt-1" style={{ color: MUTED }}>Create your first exam</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Subject</th>
                        <th className="px-4 py-3 font-medium">Class</th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Total Marks</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.map(e => (
                        <tr key={e.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                          <td className="px-4 py-3 font-medium" style={{ color: PLUM }}>{e.name}</td>
                          <td className="px-4 py-3" style={{ color: PLUM_LIGHT }}>{e.subject}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}>{e.class_name}</span></td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{new Date(e.date).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-mono text-sm" style={{ color: PLUM }}>{e.total_marks}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDelete("exam", e.id)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: MUTED }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        );

      case "timetable":
        return (
          <>
            {timetable.length === 0 ? (
              <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <Clock size={40} color={MUTED} className="mx-auto mb-3" />
                <p className="font-semibold" style={{ color: PLUM }}>No timetable entries yet</p>
                <p className="text-sm mt-1" style={{ color: MUTED }}>Add timetable periods</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                        <th className="px-4 py-3 font-medium">Day</th>
                        <th className="px-4 py-3 font-medium">Period</th>
                        <th className="px-4 py-3 font-medium">Subject</th>
                        <th className="px-4 py-3 font-medium">Teacher</th>
                        <th className="px-4 py-3 font-medium">Class</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timetable.map(t => (
                        <tr key={t.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                          <td className="px-4 py-3 font-medium" style={{ color: PLUM }}>{t.day || "—"}</td>
                          <td className="px-4 py-3" style={{ color: PLUM_LIGHT }}>{t.period || "—"}</td>
                          <td className="px-4 py-3" style={{ color: PLUM }}>{t.subject || "—"}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{t.teacher || "—"}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(16,185,129,0.1)", color: "#065F46" }}>{t.class_name || "—"}</span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleDelete("timetable", t.id)} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: MUTED }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        );
    }
  };

  const tabLabels: { key: Tab; label: string; icon: any }[] = [
    { key: "classes", label: "Classes", icon: Users },
    { key: "subjects", label: "Subjects", icon: BookOpen },
    { key: "exams", label: "Exams", icon: Star },
    { key: "timetable", label: "Timetable", icon: Clock },
  ];

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", fontSize: "0.9rem" }}>
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#D1FAE5", color: "#065F46", border: "1px solid #A7F3D0", fontSize: "0.9rem" }}>
          <Check size={14} /> {success}
          <button onClick={() => setSuccess("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: PLUM }}>Academics</h2>
          <p className="text-sm" style={{ color: MUTED }}>Manage academic structure, exams and schedule</p>
        </div>
        <button onClick={() => openCreate(tab)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          <Plus size={16} /> Add {tab === "classes" ? "Class" : tab === "subjects" ? "Subject" : tab === "exams" ? "Exam" : "Period"}
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabLabels.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all"
              style={{ background: tab === t.key ? PLUM : "white", color: tab === t.key ? MILK : PLUM_LIGHT, border: tab === t.key ? "none" : "1px solid rgba(56,25,50,0.1)" }}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {renderContent()}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(56,25,50,0.6)", backdropFilter: "blur(4px)" }}
          onMouseDown={(e) => e.target === e.currentTarget && !saving && setShowCreate(false)}>
          <div className="w-full max-w-md rounded-[32px] p-8" style={{ background: "white", boxShadow: "0 32px 80px rgba(56,25,50,0.3)" }}
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: PLUM }}>
                  Create {createType === "classes" ? "Class" : createType === "subjects" ? "Subject" : createType === "exams" ? "Exam" : "Timetable Period"}
                </h2>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-full hover:opacity-70" style={{ background: "rgba(56,25,50,0.06)" }}>
                <X size={16} color={MUTED} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {renderForm()}
            </div>
            <button onClick={handleCreate} disabled={saving}
              className="w-full py-3 rounded-full flex items-center justify-center gap-2 mt-6 active:scale-95 transition-transform text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
