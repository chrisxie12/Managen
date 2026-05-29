import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, ArrowUp, ArrowDown, Check, X, BookOpen, Pencil } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../services/api";
import { Input } from "../../../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

const ACADEMIC_YEARS = ["2025/2026", "2026/2027", "2027/2028"];
const TERMS = ["First Term", "Second Term", "Third Term"];
const GRADING_TYPES = ["Percentage 0-100%", "Letter Grade A-F", "GPA 4.0", "Custom"];
const CLASS_NAMING = ["Year-based", "Form-based", "Class-based", "Custom prefix"];
const WEEKEND_DAYS = ["Saturday", "Sunday"];

const DEFAULT_GRADE_BOUNDARIES = [
  { grade: "A", min: 80, max: 100 },
  { grade: "B", min: 70, max: 79 },
  { grade: "C", min: 60, max: 69 },
  { grade: "D", min: 50, max: 59 },
  { grade: "F", min: 0, max: 49 },
];

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: NAVY }}>{title}</h3>
      {desc && <p className="text-xs mb-4" style={{ color: MUTED }}>{desc}</p>}
      {children}
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}

type GradeBoundary = { grade: string; min: number; max: number };

type Props = {
  profile: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<boolean>;
  saving: boolean;
  role: string;
};

export function AcademicSettingsTab({ profile, onSave, saving, role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "headmaster" && role !== "admin";

  const [form, setForm] = useState<Record<string, any>>({
    academic_year: "", current_term: "", term_start_date: "", term_end_date: "",
    grading_system: "", pass_mark: 50,
    class_settings: { levels: 3, naming_convention: "Year-based", custom_prefix: "", max_students: 40 },
    attendance_settings: { cutoff_time: "08:00", weekend_days: ["Saturday", "Sunday"], late_threshold_minutes: 30 },
    grade_boundaries: DEFAULT_GRADE_BOUNDARIES,
    resume_date: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [academicTerms, setAcademicTerms] = useState<any[]>([]);
  const [loadingTerms, setLoadingTerms] = useState(false);
  const [settingTerm, setSettingTerm] = useState<string | null>(null);
  const [editingTermId, setEditingTermId] = useState<string | null>(null);
  const [editTermData, setEditTermData] = useState({ name: "", start_date: "", end_date: "" });
  const [deletingTermId, setDeletingTermId] = useState<string | null>(null);

  const [classes, setClasses] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [reordering, setReordering] = useState(false);

  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [selectedClassForSubjects, setSelectedClassForSubjects] = useState("");
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [loadingClassSubjects, setLoadingClassSubjects] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [gradingScales, setGradingScales] = useState<any[]>([]);
  const [loadingScales, setLoadingScales] = useState(false);
  const [newScaleName, setNewScaleName] = useState("");
  const [creatingScale, setCreatingScale] = useState(false);
  const [deletingScaleId, setDeletingScaleId] = useState<string | null>(null);
  const [editingScaleId, setEditingScaleId] = useState<string | null>(null);
  const [editScaleName, setEditScaleName] = useState("");

  const [assessmentTypes, setAssessmentTypes] = useState<any[]>([]);
  const [newAssessmentTypeName, setNewAssessmentTypeName] = useState("");
  const [newAssessmentTypeWeight, setNewAssessmentTypeWeight] = useState(50);
  const [creatingAssessmentType, setCreatingAssessmentType] = useState(false);
  const [editingAssessmentTypeId, setEditingAssessmentTypeId] = useState<string | null>(null);
  const [editAssessmentTypeData, setEditAssessmentTypeData] = useState({ name: "", weight: 50, is_active: true });
  const [deletingAssessmentTypeId, setDeletingAssessmentTypeId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      const cs = profile.class_settings || { levels: 3, naming_convention: "Year-based", custom_prefix: "", max_students: 40 };
      const att = profile.attendance_settings || { cutoff_time: "08:00", weekend_days: ["Saturday", "Sunday"], late_threshold_minutes: 30 };
      const meta = profile.metadata || {};
      setForm({
        academic_year: profile.academic_year || "",
        current_term: profile.current_term || "",
        term_start_date: profile.term_start_date || "",
        term_end_date: profile.term_end_date || "",
        grading_system: profile.grading_system || "",
        pass_mark: profile.pass_mark ?? 50,
        class_settings: cs,
        attendance_settings: att,
        grade_boundaries: profile.grade_boundaries || DEFAULT_GRADE_BOUNDARIES,
        resume_date: meta.resume_date || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    fetchTerms();
    fetchClasses();
    fetchSubjects();
    fetchGradingScales();
    fetchAssessmentTypes();
  }, []);

  const fetchTerms = async () => {
    setLoadingTerms(true);
    try {
      const res = await api.get<any>("/api/school/terms");
      if (res.data?.data?.terms) setAcademicTerms(res.data.data.terms);
      else if (res.data?.terms) setAcademicTerms(res.data.terms);
      else if (Array.isArray(res.data)) setAcademicTerms(res.data);
    } catch { /* ignore */ }
    finally { setLoadingTerms(false); }
  };

  const handleSetCurrentTerm = async (termId: string) => {
    setSettingTerm(termId);
    try {
      await api.put(`/api/school/terms/${termId}/set-current`, {});
      toast.success("Current term updated");
      fetchTerms();
    } catch (err: any) {
      toast.error(err?.message || "Failed to set current term");
    } finally {
      setSettingTerm(null);
    }
  };

  const handleUpdateTerm = async (id: string) => {
    try {
      await api.put(`/api/school/settings/terms/${id}`, editTermData);
      toast.success("Term updated");
      setEditingTermId(null);
      fetchTerms();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update term");
    }
  };

  const handleDeleteTerm = async (id: string) => {
    setDeletingTermId(id);
    try {
      await api.delete(`/api/school/settings/terms/${id}`);
      toast.success("Term deleted");
      fetchTerms();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete term");
    } finally {
      setDeletingTermId(null);
    }
  };

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const res = await api.get<any>("/api/school/classes");
      const data = res.data?.data?.classes || res.data?.classes || (Array.isArray(res.data) ? res.data : []);
      setClasses(data);
    } catch { /* ignore */ }
    finally { setLoadingClasses(false); }
  };

  const moveClass = async (index: number, direction: "up" | "down") => {
    const newClasses = [...classes];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newClasses.length) return;
    [newClasses[index], newClasses[swapIndex]] = [newClasses[swapIndex], newClasses[index]];
    setClasses(newClasses);
    setReordering(true);
    try {
      const order = newClasses.map((c: any, i: number) => ({ id: c.id, sort_order: i }));
      await api.put("/api/school/classes/reorder", { order });
      toast.success("Classes reordered");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reorder");
      fetchClasses();
    } finally {
      setReordering(false);
    }
  };

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    try {
      const res = await api.get<any>("/api/school/subjects");
      const data = res.data?.data?.subjects || res.data?.subjects || (Array.isArray(res.data) ? res.data : []);
      setAllSubjects(data);
    } catch { /* ignore */ }
    finally { setLoadingSubjects(false); }
  };

  const fetchClassSubjects = async (classId: string) => {
    if (!classId) { setClassSubjects([]); return; }
    setLoadingClassSubjects(true);
    try {
      const res = await api.get<any>(`/api/school/class-subjects/${classId}`);
      const data = res.data?.data?.subjects || (Array.isArray(res.data) ? res.data : []);
      setClassSubjects(data);
    } catch { /* ignore */ }
    finally { setLoadingClassSubjects(false); }
  };

  useEffect(() => {
    fetchClassSubjects(selectedClassForSubjects);
  }, [selectedClassForSubjects]);

  const isSubjectAssigned = (subjectId: string) =>
    classSubjects.some((cs: any) => cs.subject_id === subjectId || cs.subject?.id === subjectId);

  const toggleSubjectAssignment = async (subjectId: string) => {
    if (!selectedClassForSubjects || isReadOnly) return;
    setAssigning(true);
    try {
      if (isSubjectAssigned(subjectId)) {
        await api.delete(`/api/school/class-subjects/${selectedClassForSubjects}/${subjectId}`);
      } else {
        await api.post("/api/school/class-subjects/assign", {
          class_id: selectedClassForSubjects,
          subject_ids: [subjectId],
        });
      }
      fetchClassSubjects(selectedClassForSubjects);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update subject assignment");
    } finally {
      setAssigning(false);
    }
  };

  const fetchGradingScales = async () => {
    setLoadingScales(true);
    try {
      const res = await api.get<any>("/api/school/grading-scales");
      const data = res.data?.data?.scales || res.data?.scales || (Array.isArray(res.data) ? res.data : []);
      setGradingScales(data);
    } catch { /* ignore */ }
    finally { setLoadingScales(false); }
  };

  const handleCreateScale = async () => {
    if (!newScaleName.trim()) return;
    setCreatingScale(true);
    try {
      await api.post("/api/school/grading-scales", { name: newScaleName.trim() });
      toast.success("Grading scale created");
      setNewScaleName("");
      fetchGradingScales();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create grading scale");
    } finally {
      setCreatingScale(false);
    }
  };

  const handleUpdateScale = async (id: string) => {
    if (!editScaleName.trim()) return;
    try {
      await api.put(`/api/school/grading-scales/${id}`, { name: editScaleName.trim() });
      toast.success("Grading scale updated");
      setEditingScaleId(null);
      setEditScaleName("");
      fetchGradingScales();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update grading scale");
    }
  };

  const handleDeleteScale = async (id: string) => {
    setDeletingScaleId(id);
    try {
      await api.delete(`/api/school/grading-scales/${id}`);
      toast.success("Grading scale deleted");
      fetchGradingScales();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete grading scale");
    } finally {
      setDeletingScaleId(null);
    }
  };

  const fetchAssessmentTypes = async () => {
    try {
      const res = await api.get<any>("/api/school/assessment-types");
      const list = res.data?.data?.types || res.data?.types || (Array.isArray(res.data) ? res.data : []);
      setAssessmentTypes(list);
    } catch { /* ignore */ }
  };

  const handleCreateAssessmentType = async () => {
    if (!newAssessmentTypeName.trim()) return;
    setCreatingAssessmentType(true);
    try {
      await api.post("/api/school/assessment-types", { name: newAssessmentTypeName.trim(), weight: newAssessmentTypeWeight, is_active: true });
      toast.success("Assessment type created");
      setNewAssessmentTypeName("");
      setNewAssessmentTypeWeight(50);
      fetchAssessmentTypes();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create assessment type");
    } finally {
      setCreatingAssessmentType(false);
    }
  };

  const handleUpdateAssessmentType = async (id: string) => {
    if (!editAssessmentTypeData.name.trim()) return;
    try {
      await api.put(`/api/school/assessment-types/${id}`, editAssessmentTypeData);
      toast.success("Assessment type updated");
      setEditingAssessmentTypeId(null);
      fetchAssessmentTypes();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update assessment type");
    }
  };

  const handleDeleteAssessmentType = async (id: string) => {
    setDeletingAssessmentTypeId(id);
    try {
      await api.delete(`/api/school/assessment-types/${id}`);
      toast.success("Assessment type deleted");
      fetchAssessmentTypes();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete assessment type");
    } finally {
      setDeletingAssessmentTypeId(null);
    }
  };

  const daysRemaining = (() => {
    if (!form.term_start_date || !form.term_end_date) return null;
    const start = new Date(form.term_start_date);
    const end = new Date(form.term_end_date);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : 0;
  })();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.academic_year) errs.academic_year = "Academic year is required";
    if (!form.current_term) errs.current_term = "Current term is required";
    if (!form.term_start_date) errs.term_start_date = "Term start date is required";
    if (!form.term_end_date) errs.term_end_date = "Term end date is required";
    if (!form.grading_system) errs.grading_system = "Grading system is required";
    if (form.pass_mark === "" || form.pass_mark == null) errs.pass_mark = "Pass mark is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    if (!validate()) return;
    const data: Record<string, any> = {
      academic_year: form.academic_year,
      current_term: form.current_term,
      term_start_date: form.term_start_date,
      term_end_date: form.term_end_date,
      grading_system: form.grading_system,
      pass_mark: Number(form.pass_mark),
      class_settings: form.class_settings,
      attendance_settings: form.attendance_settings,
      grade_boundaries: form.grade_boundaries,
      metadata: { resume_date: form.resume_date || null },
    };
    const ok = await onSave(data);
    if (ok) toast.success("Academic settings saved");
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev: Record<string, any>) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const setSelect = (key: string) => (value: string) => {
    setForm((prev: Record<string, any>) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const setClassSetting = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = key === "levels" || key === "max_students" ? Number(e.target.value) : e.target.value;
    setForm((prev: Record<string, any>) => ({
      ...prev,
      class_settings: { ...prev.class_settings, [key]: val },
    }));
  };

  const setClassSelect = (key: string) => (value: string) => {
    setForm((prev: Record<string, any>) => ({
      ...prev,
      class_settings: { ...prev.class_settings, [key]: value },
    }));
  };

  const setAttendance = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = key === "late_threshold_minutes" ? Number(e.target.value) : e.target.value;
    setForm((prev: Record<string, any>) => ({
      ...prev,
      attendance_settings: { ...prev.attendance_settings, [key]: val },
    }));
  };

  const toggleWeekendDay = (day: string) => {
    setForm((prev: Record<string, any>) => {
      const current: string[] = prev.attendance_settings.weekend_days || [];
      const next = current.includes(day)
        ? current.filter((d: string) => d !== day)
        : [...current, day];
      return {
        ...prev,
        attendance_settings: { ...prev.attendance_settings, weekend_days: next },
      };
    });
  };

  const updateBoundary = (index: number, field: keyof GradeBoundary, value: string) => {
    setForm((prev: Record<string, any>) => {
      const boundaries = [...(prev.grade_boundaries || [])];
      const row = { ...boundaries[index] };
      if (field === "grade") {
        row.grade = value;
      } else {
        row[field] = Number(value);
      }
      boundaries[index] = row;
      return { ...prev, grade_boundaries: boundaries };
    });
  };

  const addBoundary = () => {
    setForm((prev: Record<string, any>) => ({
      ...prev,
      grade_boundaries: [...(prev.grade_boundaries || []), { grade: "", min: 0, max: 100 }],
    }));
  };

  const removeBoundary = (index: number) => {
    setForm((prev: Record<string, any>) => {
      const boundaries = [...(prev.grade_boundaries || [])];
      boundaries.splice(index, 1);
      return { ...prev, grade_boundaries: boundaries };
    });
  };

  const disabledClass = isReadOnly ? "opacity-60 cursor-not-allowed" : "";

  return (
    <div>
      <SectionCard title="Current Term" desc="Set the active academic term and dates">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Academic Year" error={errors.academic_year}>
            <Select value={form.academic_year || ""} onValueChange={setSelect("academic_year")} disabled={isReadOnly}>
              <SelectTrigger className={`h-9 text-xs rounded-xl ${disabledClass}`}
                style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                <SelectValue placeholder="Select year..." />
              </SelectTrigger>
              <SelectContent>
                {ACADEMIC_YEARS.map((y) => (
                  <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Current Term" error={errors.current_term}>
            <Select value={form.current_term || ""} onValueChange={setSelect("current_term")} disabled={isReadOnly}>
              <SelectTrigger className={`h-9 text-xs rounded-xl ${disabledClass}`}
                style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                <SelectValue placeholder="Select term..." />
              </SelectTrigger>
              <SelectContent>
                {TERMS.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Term Start Date" error={errors.term_start_date}>
            <Input type="date" value={form.term_start_date || ""} onChange={set("term_start_date")} disabled={isReadOnly}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
          <FormField label="Term End Date" error={errors.term_end_date}>
            <Input type="date" value={form.term_end_date || ""} onChange={set("term_end_date")} disabled={isReadOnly}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
          <FormField label="Next Term Resume Date (optional)">
            <Input type="date" value={form.resume_date || ""} onChange={set("resume_date")} disabled={isReadOnly}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
        </div>
        {daysRemaining !== null && (
          <div className="mt-3 px-3 py-2 rounded-xl text-xs font-medium inline-block"
            style={{ background: "rgba(10,36,114,0.06)", color: NAVY }}>
            {daysRemaining} days remaining in term
          </div>
        )}
      </SectionCard>

      <SectionCard title="Academic Terms" desc="Manage all academic terms and set the current active term">
        {loadingTerms ? (
          <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin" color={NAVY} /></div>
        ) : academicTerms.length === 0 ? (
          <p className="text-xs py-4 text-center" style={{ color: MUTED }}>No terms found. Create terms from the academic setup.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="text-left" style={{ color: MUTED }}>
                  <th className="pb-2 pr-3 font-medium">Term Name</th>
                  <th className="pb-2 pr-3 font-medium">Start Date</th>
                  <th className="pb-2 pr-3 font-medium">End Date</th>
                  <th className="pb-2 pr-3 font-medium">Status</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {academicTerms.map((term: any) => {
                  const isEditing = editingTermId === term.id;
                  return (
                    <tr key={term.id} className="border-t" style={{ borderColor: "rgba(10,36,114,0.07)" }}>
                      <td className="py-2.5 pr-3">
                        {isEditing ? (
                          <Input value={editTermData.name} onChange={(e) => setEditTermData((p) => ({ ...p, name: e.target.value }))}
                            className="h-8 text-xs rounded-xl min-w-[100px]"
                            style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                        ) : (
                          <span className="font-medium" style={{ color: NAVY }}>{term.name}</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        {isEditing ? (
                          <Input type="date" value={editTermData.start_date} onChange={(e) => setEditTermData((p) => ({ ...p, start_date: e.target.value }))}
                            className="h-8 text-xs rounded-xl w-[130px]"
                            style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                        ) : (
                          <span style={{ color: NAVY }}>{term.start_date}</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        {isEditing ? (
                          <Input type="date" value={editTermData.end_date} onChange={(e) => setEditTermData((p) => ({ ...p, end_date: e.target.value }))}
                            className="h-8 text-xs rounded-xl w-[130px]"
                            style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                        ) : (
                          <span style={{ color: NAVY }}>{term.end_date}</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        {term.is_current ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>
                            <Check size={10} /> Current
                          </span>
                        ) : (
                          <span style={{ color: MUTED }}>Inactive</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleUpdateTerm(term.id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ background: "rgba(16,185,129,0.1)" }}>
                              <Check size={13} color="#16A34A" />
                            </button>
                            <button onClick={() => { setEditingTermId(null); }}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ background: "rgba(239,68,68,0.08)" }}>
                              <X size={13} color="#EF4444" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            {!term.is_current && !isReadOnly && (
                              <Button onClick={() => handleSetCurrentTerm(term.id)}
                                disabled={settingTerm === term.id}
                                className="text-xs rounded-lg h-7 px-3"
                                style={{ background: NAVY }}>
                                {settingTerm === term.id ? <Loader2 size={12} className="animate-spin" /> : "Set Current"}
                              </Button>
                            )}
                            {!isReadOnly && (
                              <button onClick={() => {
                                setEditingTermId(term.id);
                                setEditTermData({ name: term.name, start_date: term.start_date, end_date: term.end_date });
                              }}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ background: "rgba(10,36,114,0.06)" }}>
                                <Pencil size={13} color={NAVY} />
                              </button>
                            )}
                            {!isReadOnly && (
                              <button onClick={() => handleDeleteTerm(term.id)}
                                disabled={deletingTermId === term.id}
                                className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                                style={{ background: "rgba(239,68,68,0.08)" }}>
                                {deletingTermId === term.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} color="#EF4444" />}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Grading System" desc="Configure how student performance is evaluated">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Grading Type" error={errors.grading_system}>
            <Select value={form.grading_system || ""} onValueChange={setSelect("grading_system")} disabled={isReadOnly}>
              <SelectTrigger className={`h-9 text-xs rounded-xl ${disabledClass}`}
                style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                <SelectValue placeholder="Select grading..." />
              </SelectTrigger>
              <SelectContent>
                {GRADING_TYPES.map((g) => (
                  <SelectItem key={g} value={g} className="text-xs">{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Pass Mark" error={errors.pass_mark}>
            <Input type="number" value={form.pass_mark ?? ""} onChange={set("pass_mark")} disabled={isReadOnly} min={0} max={100}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium mb-2 block" style={{ color: NAVY }}>Grade Boundaries</label>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="text-left" style={{ color: MUTED }}>
                  <th className="pb-2 pr-2 font-medium">Grade</th>
                  <th className="pb-2 pr-2 font-medium">Min %</th>
                  <th className="pb-2 pr-2 font-medium">Max %</th>
                  <th className="pb-2 font-medium w-8"></th>
                </tr>
              </thead>
              <tbody>
                {(form.grade_boundaries || []).map((row: GradeBoundary, i: number) => (
                  <tr key={i}>
                    <td className="pb-2 pr-2">
                      <Input value={row.grade} onChange={(e) => updateBoundary(i, "grade", e.target.value)}
                        disabled={isReadOnly}
                        className="h-8 text-xs rounded-xl w-16"
                        style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                    </td>
                    <td className="pb-2 pr-2">
                      <Input type="number" value={row.min} onChange={(e) => updateBoundary(i, "min", e.target.value)}
                        disabled={isReadOnly} min={0} max={100}
                        className="h-8 text-xs rounded-xl w-20"
                        style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                    </td>
                    <td className="pb-2 pr-2">
                      <Input type="number" value={row.max} onChange={(e) => updateBoundary(i, "max", e.target.value)}
                        disabled={isReadOnly} min={0} max={100}
                        className="h-8 text-xs rounded-xl w-20"
                        style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                    </td>
                    <td className="pb-2">
                      {!isReadOnly && (form.grade_boundaries || []).length > 1 && (
                        <button type="button" onClick={() => removeBoundary(i)}
                          className="p-1 rounded-lg hover:bg-red-50 transition-colors">
                          <Trash2 size={14} color="#EF4444" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!isReadOnly && (
            <button type="button" onClick={addBoundary}
              className="mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
              style={{ color: NAVY, background: "rgba(10,36,114,0.06)" }}>
              <Plus size={14} /> Add Grade Boundary
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Grading Scales" desc="Manage named grading scales for different purposes">
        {loadingScales ? (
          <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin" color={NAVY} /></div>
        ) : (
          <>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="text-left" style={{ color: MUTED }}>
                    <th className="pb-2 pr-3 font-medium">Scale Name</th>
                    <th className="pb-2 font-medium w-32" />
                  </tr>
                </thead>
                <tbody>
                  {gradingScales.length === 0 ? (
                    <tr><td colSpan={2} className="py-4 text-center" style={{ color: MUTED }}>No grading scales yet.</td></tr>
                  ) : gradingScales.map((scale: any) => (
                    <tr key={scale.id} className="border-t" style={{ borderColor: "rgba(10,36,114,0.07)" }}>
                      <td className="py-2.5 pr-3">
                        {editingScaleId === scale.id ? (
                          <Input value={editScaleName} onChange={(e) => setEditScaleName(e.target.value)}
                            className="h-8 text-xs rounded-xl"
                            style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                        ) : (
                          <span className="font-medium" style={{ color: NAVY }}>{scale.name}</span>
                        )}
                      </td>
                      <td className="py-2.5">
                        <div className="flex gap-1.5">
                          {editingScaleId === scale.id ? (
                            <>
                              <button onClick={() => handleUpdateScale(scale.id)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ background: "rgba(16,185,129,0.1)" }}>
                                <Check size={13} color="#16A34A" />
                              </button>
                              <button onClick={() => { setEditingScaleId(null); setEditScaleName(""); }}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ background: "rgba(239,68,68,0.08)" }}>
                                <X size={13} color="#EF4444" />
                              </button>
                            </>
                          ) : (
                            <>
                              {!isReadOnly && (
                                <button onClick={() => { setEditingScaleId(scale.id); setEditScaleName(scale.name); }}
                                  className="text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                                  style={{ color: NAVY, background: "rgba(10,36,114,0.06)" }}>
                                  Edit
                                </button>
                              )}
                              {!isReadOnly && (
                                <button onClick={() => handleDeleteScale(scale.id)}
                                  disabled={deletingScaleId === scale.id}
                                  className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                                  style={{ background: "rgba(239,68,68,0.08)" }}>
                                  {deletingScaleId === scale.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} color="#EF4444" />}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!isReadOnly && (
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>New Scale Name</label>
                  <Input value={newScaleName} onChange={(e) => setNewScaleName(e.target.value)}
                    placeholder="e.g. Main Grading Scale"
                    className="h-9 text-sm rounded-xl"
                    style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                </div>
                <Button onClick={handleCreateScale} disabled={creatingScale || !newScaleName.trim()}
                  className="text-xs rounded-xl h-9 px-4" style={{ background: NAVY }}>
                  {creatingScale ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} className="mr-1" />}
                  Add Scale
                </Button>
              </div>
            )}
          </>
        )}
      </SectionCard>

      <SectionCard title="Class Structure" desc="Define how classes are organized">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Number of Class Levels">
            <Input type="number" value={form.class_settings?.levels ?? 3}
              onChange={setClassSetting("levels")} disabled={isReadOnly} min={1} max={20}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
          <FormField label="Class Naming Convention">
            <Select value={form.class_settings?.naming_convention || "Year-based"}
              onValueChange={setClassSelect("naming_convention")} disabled={isReadOnly}>
              <SelectTrigger className={`h-9 text-xs rounded-xl ${disabledClass}`}
                style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                <SelectValue placeholder="Select naming..." />
              </SelectTrigger>
              <SelectContent>
                {CLASS_NAMING.map((n) => (
                  <SelectItem key={n} value={n} className="text-xs">{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
          {form.class_settings?.naming_convention === "Custom prefix" && (
            <FormField label="Custom Prefix">
              <Input value={form.class_settings?.custom_prefix || ""}
                onChange={setClassSetting("custom_prefix")} disabled={isReadOnly}
                className={`h-9 text-sm rounded-xl ${disabledClass}`}
                style={{ borderColor: "rgba(10,36,114,0.12)" }} placeholder="e.g. Grade" />
            </FormField>
          )}
          <FormField label="Maximum Students Per Class">
            <Input type="number" value={form.class_settings?.max_students ?? 40}
              onChange={setClassSetting("max_students")} disabled={isReadOnly} min={1} max={200}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
        </div>

        {!loadingClasses && classes.length > 0 && (
          <div className="mt-4">
            <label className="text-xs font-medium mb-2 block" style={{ color: NAVY }}>Reorder Classes</label>
            <div className="space-y-1">
              {classes.map((cls: any, index: number) => (
                <div key={cls.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                  style={{ background: "rgba(10,36,114,0.04)" }}>
                  <span className="font-medium" style={{ color: NAVY }}>{cls.name}</span>
                  {!isReadOnly && (
                    <div className="flex gap-1">
                      <button onClick={() => moveClass(index, "up")} disabled={index === 0 || reordering}
                        className="p-1 rounded hover:bg-white/50 disabled:opacity-30 transition-colors">
                        <ArrowUp size={14} color={NAVY} />
                      </button>
                      <button onClick={() => moveClass(index, "down")} disabled={index === classes.length - 1 || reordering}
                        className="p-1 rounded hover:bg-white/50 disabled:opacity-30 transition-colors">
                        <ArrowDown size={14} color={NAVY} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Subject Assignment" desc="Assign subjects to classes">
        <FormField label="Select Class">
          <Select value={selectedClassForSubjects} onValueChange={setSelectedClassForSubjects} disabled={isReadOnly}>
            <SelectTrigger className={`h-9 text-xs rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(10,36,114,0.12)" }}>
              <SelectValue placeholder="Choose a class..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls: any) => (
                <SelectItem key={cls.id} value={cls.id} className="text-xs">{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {selectedClassForSubjects && (
          <>
            {loadingSubjects || loadingClassSubjects ? (
              <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin" color={NAVY} /></div>
            ) : allSubjects.length === 0 ? (
              <p className="text-xs py-4 text-center" style={{ color: MUTED }}>No subjects available. Create subjects first.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {allSubjects.map((subj: any) => {
                  const assigned = isSubjectAssigned(subj.id);
                  return (
                    <label key={subj.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${isReadOnly ? "opacity-60 cursor-not-allowed" : ""}`}
                      style={{
                        background: assigned ? "rgba(16,185,129,0.08)" : "rgba(10,36,114,0.04)",
                        border: assigned ? "1px solid rgba(16,185,129,0.2)" : "1px solid transparent",
                      }}>
                      <input type="checkbox" checked={assigned}
                        disabled={isReadOnly || assigning}
                        onChange={() => toggleSubjectAssignment(subj.id)}
                        className="rounded accent-purple-700" />
                      <div className="min-w-0">
                        <span className="font-medium block truncate" style={{ color: NAVY }}>{subj.name}</span>
                        {subj.code && <span style={{ color: MUTED }}>{subj.code}</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </>
        )}
      </SectionCard>

      <SectionCard title="Attendance Settings" desc="Configure attendance tracking rules">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Attendance Taking Time">
            <Input type="time" value={form.attendance_settings?.cutoff_time || "08:00"}
              onChange={setAttendance("cutoff_time")} disabled={isReadOnly}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
          <FormField label="Mark Late After (minutes)">
            <Input type="number" value={form.attendance_settings?.late_threshold_minutes ?? 30}
              onChange={setAttendance("late_threshold_minutes")} disabled={isReadOnly} min={0} max={120}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
        </div>

        <FormField label="Weekend Days">
          <div className="flex gap-3 mt-1">
            {WEEKEND_DAYS.map((day) => {
              const selected = (form.attendance_settings?.weekend_days || []).includes(day);
              return (
                <label key={day} className="flex items-center gap-1.5 text-xs cursor-pointer"
                  style={{ color: NAVY }}>
                  <input type="checkbox" checked={selected} disabled={isReadOnly}
                    onChange={() => toggleWeekendDay(day)}
                    className="rounded accent-purple-700" />
                  {day}
                </label>
              );
            })}
          </div>
        </FormField>
      </SectionCard>

      <SectionCard title="Assessment Types" desc="Configure weighted assessment categories for grading">
        {loadingSubjects ? (
          <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin" color={NAVY} /></div>
        ) : (<>
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="text-left" style={{ color: MUTED }}>
                  <th className="pb-2 pr-3 font-medium">Name</th>
                  <th className="pb-2 pr-3 font-medium">Weight (%)</th>
                  <th className="pb-2 pr-3 font-medium">Active</th>
                  <th className="pb-2 font-medium w-16" />
                </tr>
              </thead>
              <tbody>
                {assessmentTypes.length === 0 ? (
                  <tr><td colSpan={4} className="py-4 text-center" style={{ color: MUTED }}>No assessment types yet.</td></tr>
                ) : assessmentTypes.map((at: any) => {
                  const isEditing = editingAssessmentTypeId === at.id;
                  return (
                    <tr key={at.id} className="border-t" style={{ borderColor: "rgba(10,36,114,0.07)" }}>
                      <td className="py-2.5 pr-3">
                        {isEditing ? (
                          <Input value={editAssessmentTypeData.name}
                            onChange={(e) => setEditAssessmentTypeData((p) => ({ ...p, name: e.target.value }))}
                            className="h-8 text-xs rounded-xl min-w-[120px]"
                            style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                        ) : (
                          <span className="font-medium" style={{ color: NAVY }}>{at.name}</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        {isEditing ? (
                          <Input type="number" min={0} max={100} value={editAssessmentTypeData.weight}
                            onChange={(e) => setEditAssessmentTypeData((p) => ({ ...p, weight: Number(e.target.value) }))}
                            className="h-8 text-xs rounded-xl w-20"
                            style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                        ) : (
                          <span style={{ color: NAVY }}>{at.weight}%</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        {isEditing ? (
                          <Switch checked={editAssessmentTypeData.is_active}
                            onCheckedChange={(v) => setEditAssessmentTypeData((p) => ({ ...p, is_active: v }))} />
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            at.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}>
                            {at.is_active ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleUpdateAssessmentType(at.id)}
                              className="p-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)" }}>
                              <Check size={13} color="#16A34A" />
                            </button>
                            <button onClick={() => { setEditingAssessmentTypeId(null); }}
                              className="p-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)" }}>
                              <X size={13} color="#EF4444" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            {!isReadOnly && (
                              <button onClick={() => {
                                setEditingAssessmentTypeId(at.id);
                                setEditAssessmentTypeData({ name: at.name, weight: at.weight, is_active: at.is_active ?? true });
                              }}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ background: "rgba(10,36,114,0.06)" }}>
                                <Pencil size={13} color={NAVY} />
                              </button>
                            )}
                            {!isReadOnly && (
                              <button onClick={() => handleDeleteAssessmentType(at.id)}
                                disabled={deletingAssessmentTypeId === at.id}
                                className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                                style={{ background: "rgba(239,68,68,0.08)" }}>
                                {deletingAssessmentTypeId === at.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} color="#EF4444" />}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!isReadOnly && (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>New Assessment Type</label>
                <Input value={newAssessmentTypeName}
                  onChange={(e) => setNewAssessmentTypeName(e.target.value)}
                  placeholder="e.g. Midterm Exam"
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(10,36,114,0.12)" }} />
              </div>
              <div className="w-24">
                <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Weight %</label>
                <Input type="number" min={0} max={100} value={newAssessmentTypeWeight}
                  onChange={(e) => setNewAssessmentTypeWeight(Number(e.target.value))}
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(10,36,114,0.12)" }} />
              </div>
              <Button onClick={handleCreateAssessmentType}
                disabled={creatingAssessmentType || !newAssessmentTypeName.trim()}
                className="text-xs rounded-xl h-9 px-4" style={{ background: NAVY }}>
                {creatingAssessmentType ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} className="mr-1" />}
                Add
              </Button>
            </div>
          )}
        </>)}
      </SectionCard>

      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6"
            style={{ background: NAVY }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Academic Settings
          </Button>
        </div>
      )}
    </div>
  );
}
