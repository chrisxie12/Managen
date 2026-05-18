import { useState, useRef, useEffect } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../services/api";

const INDIGO = "#6366F1";
const PLUM = "#381932";
const MUTED = "#7D6077";

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Volta", "Northern", "Upper East", "Upper West", "Brong-Ahafo",
  "Oti", "Ahafo", "Bono East", "North East", "Savannah", "Western North",
];

const ACADEMIC_YEARS = ["2025/2026", "2026/2027"];
const TERMS = ["First Term", "Second Term", "Third Term"];
const GRADING_SYSTEMS = [
  { value: "percentage", label: "Percentage (0-100%)" },
  { value: "letter_grade", label: "Letter Grade (A, B, C, D, F)" },
  { value: "gpa", label: "GPA (4.0 scale)" },
];

const PRESET_COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981", "#EF4444"];

type SchoolFormData = {
  name: string; motto: string; type: string; year_established: string;
  email: string; phone: string; address: string; city: string;
  region: string; country: string;
  academic_year: string; current_term: string;
  term_start_date: string; term_end_date: string;
  grading_system: string; primary_color: string;
  logo: string;
};

function Input({ label, required, value, onChange, placeholder, type, error }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type || "text"} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: "#f9fafb", border: error ? "1px solid #ef4444" : "1px solid #e5e7eb", color: PLUM }}
      />
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
}

function Textarea({ label, required, value, onChange, placeholder, error }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
        style={{ background: "#f9fafb", border: error ? "1px solid #ef4444" : "1px solid #e5e7eb", color: PLUM }}
      />
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
}

function Select({ label, required, value, onChange, options, error }: any) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <select value={value} onChange={onChange}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: "#f9fafb", border: error ? "1px solid #ef4444" : "1px solid #e5e7eb", color: value ? PLUM : MUTED }}
      >
        <option value="" disabled>Select {label.toLowerCase()}...</option>
        {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-xs mt-1 text-red-500">{error}</p>}
    </div>
  );
}

export function SchoolSetupStep({ surveyAnswers, onNext, onBack }: {
  surveyAnswers: any; onNext: (data: SchoolFormData) => void; onBack: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimer = useRef<any>(null);

  const [form, setForm] = useState<SchoolFormData>({
    name: "", motto: "", type: surveyAnswers?.type || "", year_established: "",
    email: "", phone: "", address: "", city: "",
    region: "", country: "Ghana",
    academic_year: "", current_term: "",
    term_start_date: "", term_end_date: "",
    grading_system: "percentage", primary_color: INDIGO,
    logo: "",
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    autoSaveTimer.current = setInterval(() => {
      try {
        localStorage.setItem("schoolos_onboarding_form", JSON.stringify(form));
        toast.success("Progress saved");
      } catch {}
    }, 30000);
    return () => clearInterval(autoSaveTimer.current);
  }, [form]);

  const requiredFields: (keyof SchoolFormData)[] = ["name", "email", "phone", "address", "city", "region", "academic_year", "current_term", "term_start_date", "term_end_date"];

  const completionPercent = Math.round(
    (requiredFields.filter(f => form[f]).length / requiredFields.length) * 100
  );

  const allRequired = requiredFields.every(f => form[f]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "School name is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.phone) errs.phone = "Phone is required";
    if (!form.address) errs.address = "Address is required";
    if (!form.city) errs.city = "City is required";
    if (!form.region) errs.region = "Region is required";
    if (!form.academic_year) errs.academic_year = "Academic year is required";
    if (!form.current_term) errs.current_term = "Current term is required";
    if (!form.term_start_date) errs.term_start_date = "Term start date is required";
    if (!form.term_end_date) errs.term_end_date = "Term end date is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onNext(form);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
      setForm(f => ({ ...f, logo: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const set = (key: keyof SchoolFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  return (
    <div className="py-4">
      <h2 className="text-2xl font-bold text-center mb-1" style={{ fontFamily: "'Playfair Display', serif", color: PLUM }}>
        Set up your school profile
      </h2>
      <p className="text-sm text-center mb-6" style={{ color: MUTED }}>
        This information will appear across your entire platform.
      </p>

      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="h-2 flex-1 max-w-xs rounded-full bg-gray-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${completionPercent}%`, background: INDIGO }} />
        </div>
        <span className="text-xs font-medium" style={{ color: MUTED }}>Profile {completionPercent}% complete</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>Basic Information</h3>
            <div className="space-y-3">
              <Input label="School Name" required value={form.name} onChange={set("name")} placeholder="e.g. Accra Academy" error={errors.name} />
              <Input label="School Motto" value={form.motto} onChange={set("motto")} placeholder="e.g. Knowledge is Power" />
              <Select label="School Type" value={form.type} onChange={set("type")} options={[
                { value: "primary", label: "Primary School (KG - Class 6)" },
                { value: "jhs", label: "Junior High School (JHS 1-3)" },
                { value: "shs", label: "Senior High School (SHS 1-3)" },
                { value: "primary_jhs", label: "Primary + JHS (Combined)" },
                { value: "full", label: "Primary + JHS + SHS (Full)" },
                { value: "vocational", label: "Vocational/Technical" },
              ]} />
              <Input label="Year Established" value={form.year_established} onChange={set("year_established")} placeholder="e.g. 1995" type="number" />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>Contact Information</h3>
            <div className="space-y-3">
              <Input label="School Email" required value={form.email} onChange={set("email")} placeholder="admin@school.edu" type="email" error={errors.email} />
              <Input label="School Phone" required value={form.phone} onChange={set("phone")} placeholder="+233 XX XXX XXXX" error={errors.phone} />
              <Textarea label="School Address" required value={form.address} onChange={set("address")} placeholder="Street, building, landmark" error={errors.address} />
              <Input label="City/Town" required value={form.city} onChange={set("city")} placeholder="e.g. Accra" error={errors.city} />
              <Select label="Region" required value={form.region} onChange={set("region")} options={GHANA_REGIONS.map(r => ({ value: r, label: r }))} error={errors.region} />
              <Select label="Country" value={form.country} onChange={set("country")} options={[{ value: "Ghana", label: "Ghana" }]} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>Academic Settings</h3>
            <div className="space-y-3">
              <Select label="Current Academic Year" required value={form.academic_year} onChange={set("academic_year")} options={ACADEMIC_YEARS.map(y => ({ value: y, label: y }))} error={errors.academic_year} />
              <Select label="Current Term" required value={form.current_term} onChange={set("current_term")} options={TERMS.map(t => ({ value: t, label: t }))} error={errors.current_term} />
              <Input label="Term Start Date" required value={form.term_start_date} onChange={set("term_start_date")} type="date" error={errors.term_start_date} />
              <Input label="Term End Date" required value={form.term_end_date} onChange={set("term_end_date")} type="date" error={errors.term_end_date} />
              <Select label="Grading System" value={form.grading_system} onChange={set("grading_system")} options={GRADING_SYSTEMS} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: MUTED }}>School Logo & Branding</h3>
            <div className="space-y-4">
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                style={{ borderColor: "rgba(99,102,241,0.2)" }}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="School logo" className="max-h-24 mx-auto rounded-lg" />
                ) : (
                  <div>
                    <Upload size={24} color={MUTED} className="mx-auto mb-2" />
                    <p className="text-sm font-medium" style={{ color: PLUM }}>Drag & drop your school logo here</p>
                    <p className="text-xs mt-1" style={{ color: MUTED }}>or click to browse</p>
                    <p className="text-xs mt-2" style={{ color: MUTED }}>Supported: PNG, JPG, SVG (Max 2MB)</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleLogoUpload} className="hidden" />
              </div>

              <div>
                <p className="text-xs font-medium mb-2" style={{ color: MUTED }}>School Color</p>
                <div className="flex gap-2 items-center">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, primary_color: c }))}
                      className="w-8 h-8 rounded-full active:scale-90 transition-transform"
                      style={{ background: c, border: form.primary_color === c ? "3px solid white" : "none", boxShadow: form.primary_color === c ? `0 0 0 2px ${c}` : "none" }}
                    />
                  ))}
                  <input type="color" value={form.primary_color} onChange={e => setForm(f => ({ ...f, primary_color: e.target.value }))}
                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:sticky md:top-8 self-start">
          <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: MUTED }}>Preview</p>
          <div className="rounded-2xl p-6 overflow-hidden" style={{
            background: `linear-gradient(135deg, ${form.primary_color} 0%, ${form.primary_color}dd 100%)`,
            boxShadow: `0 8px 32px ${form.primary_color}33`,
          }}>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-14 h-14 rounded-xl object-cover bg-white/20" />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                  <ImageIcon size={24} color="rgba(255,255,255,0.7)" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {form.name || "Your School Name"}
                </h3>
                {form.motto && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>{form.motto}</p>}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.15)" }}>
              <div className="flex gap-4 text-xs" style={{ color: "rgba(255,255,255,0.75)" }}>
                <span>{form.current_term || "Term"}</span>
                <span>{form.academic_year || "Year"}</span>
                <span>{form.city || "City"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <button onClick={onBack} className="px-5 py-2 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          style={{ background: "rgba(0,0,0,0.04)", color: PLUM }}>Back</button>
        <button onClick={handleSubmit} disabled={!allRequired}
          className="px-8 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-40"
          style={{ background: INDIGO, color: "white" }}>Continue</button>
      </div>
    </div>
  );
}
