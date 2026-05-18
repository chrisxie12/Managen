import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";

const PLUM = "#381932";
const MUTED = "#7D6077";

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
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: PLUM }}>{title}</h3>
      {desc && <p className="text-xs mb-4" style={{ color: MUTED }}>{desc}</p>}
      {children}
    </div>
  );
}

function FormField({ label, error, children }: { label: string; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}

type GradeBoundary = { grade: string; min: number; max: number };

type Props = {
  profile: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  saving: boolean;
  role: string;
};

export function AcademicSettingsTab({ profile, onSave, saving, role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "headmaster";

  const [form, setForm] = useState<Record<string, any>>({
    academic_year: "", current_term: "", term_start_date: "", term_end_date: "",
    grading_system: "", pass_mark: 50,
    class_settings: { levels: 3, naming_convention: "Year-based", custom_prefix: "", max_students: 40 },
    attendance_settings: { cutoff_time: "08:00", weekend_days: ["Saturday", "Sunday"], late_threshold_minutes: 30 },
    grade_boundaries: DEFAULT_GRADE_BOUNDARIES,
    resume_date: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    await onSave(data);
    toast.success("Academic settings saved");
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
                style={{ borderColor: "rgba(56,25,50,0.12)" }}>
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
                style={{ borderColor: "rgba(56,25,50,0.12)" }}>
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
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Term End Date" error={errors.term_end_date}>
            <Input type="date" value={form.term_end_date || ""} onChange={set("term_end_date")} disabled={isReadOnly}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Next Term Resume Date (optional)">
            <Input type="date" value={form.resume_date || ""} onChange={set("resume_date")} disabled={isReadOnly}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
        </div>
        {daysRemaining !== null && (
          <div className="mt-3 px-3 py-2 rounded-xl text-xs font-medium inline-block"
            style={{ background: "rgba(56,25,50,0.06)", color: PLUM }}>
            {daysRemaining} days remaining in term
          </div>
        )}
      </SectionCard>

      <SectionCard title="Grading System" desc="Configure how student performance is evaluated">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Grading Type" error={errors.grading_system}>
            <Select value={form.grading_system || ""} onValueChange={setSelect("grading_system")} disabled={isReadOnly}>
              <SelectTrigger className={`h-9 text-xs rounded-xl ${disabledClass}`}
                style={{ borderColor: "rgba(56,25,50,0.12)" }}>
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
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium mb-2 block" style={{ color: PLUM }}>Grade Boundaries</label>
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
                        style={{ borderColor: "rgba(56,25,50,0.12)" }} />
                    </td>
                    <td className="pb-2 pr-2">
                      <Input type="number" value={row.min} onChange={(e) => updateBoundary(i, "min", e.target.value)}
                        disabled={isReadOnly} min={0} max={100}
                        className="h-8 text-xs rounded-xl w-20"
                        style={{ borderColor: "rgba(56,25,50,0.12)" }} />
                    </td>
                    <td className="pb-2 pr-2">
                      <Input type="number" value={row.max} onChange={(e) => updateBoundary(i, "max", e.target.value)}
                        disabled={isReadOnly} min={0} max={100}
                        className="h-8 text-xs rounded-xl w-20"
                        style={{ borderColor: "rgba(56,25,50,0.12)" }} />
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
              style={{ color: PLUM, background: "rgba(56,25,50,0.06)" }}>
              <Plus size={14} /> Add Grade Boundary
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Class Structure" desc="Define how classes are organized">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Number of Class Levels">
            <Input type="number" value={form.class_settings?.levels ?? 3}
              onChange={setClassSetting("levels")} disabled={isReadOnly} min={1} max={20}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Class Naming Convention">
            <Select value={form.class_settings?.naming_convention || "Year-based"}
              onValueChange={setClassSelect("naming_convention")} disabled={isReadOnly}>
              <SelectTrigger className={`h-9 text-xs rounded-xl ${disabledClass}`}
                style={{ borderColor: "rgba(56,25,50,0.12)" }}>
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
                style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="e.g. Grade" />
            </FormField>
          )}
          <FormField label="Maximum Students Per Class">
            <Input type="number" value={form.class_settings?.max_students ?? 40}
              onChange={setClassSetting("max_students")} disabled={isReadOnly} min={1} max={200}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Attendance Settings" desc="Configure attendance tracking rules">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Attendance Taking Time">
            <Input type="time" value={form.attendance_settings?.cutoff_time || "08:00"}
              onChange={setAttendance("cutoff_time")} disabled={isReadOnly}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Mark Late After (minutes)">
            <Input type="number" value={form.attendance_settings?.late_threshold_minutes ?? 30}
              onChange={setAttendance("late_threshold_minutes")} disabled={isReadOnly} min={0} max={120}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
        </div>

        <FormField label="Weekend Days">
          <div className="flex gap-3 mt-1">
            {WEEKEND_DAYS.map((day) => {
              const selected = (form.attendance_settings?.weekend_days || []).includes(day);
              return (
                <label key={day} className="flex items-center gap-1.5 text-xs cursor-pointer"
                  style={{ color: PLUM }}>
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

      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6"
            style={{ background: PLUM }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Academic Settings
          </Button>
        </div>
      )}
    </div>
  );
}
