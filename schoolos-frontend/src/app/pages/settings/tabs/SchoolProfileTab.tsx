import { useState, useEffect, useRef } from "react";
import { Upload, Image as ImageIcon, Save, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { api } from "../../../services/api";

const PLUM = "#381932";
const MUTED = "#7D6077";

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Volta", "Northern", "Upper East", "Upper West", "Brong-Ahafo",
  "Oti", "Ahafo", "Bono East", "North East", "Savannah", "Western North",
];

const SCHOOL_TYPES = [
  { value: "primary", label: "Primary" },
  { value: "jhs", label: "JHS" },
  { value: "shs", label: "SHS" },
  { value: "primary_jhs", label: "Primary+JHS" },
  { value: "primary_jhs_shs", label: "Primary+JHS+SHS" },
  { value: "vocational", label: "Vocational" },
  { value: "university", label: "University" },
];

const TIMEZONES = [
  "Africa/Accra", "Africa/Abidjan", "Africa/Cairo", "Africa/Casablanca",
  "Africa/Dar_es_Salaam", "Africa/Johannesburg", "Africa/Khartoum",
  "Africa/Lagos", "Africa/Nairobi", "Africa/Tripoli",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Moscow",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo",
  "Australia/Sydney", "Pacific/Auckland",
];

const PRESET_COLORS = [
  "#6366f1", "#3b82f6", "#10b981", "#ef4444",
  "#f59e0b", "#ec4899", "#14b8a6", "#1e293b",
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

function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}

const INITIAL_FORM = {
  name: "", motto: "", school_type: "", year_established: "", registration_number: "",
  email: "", phone: "+233", website: "", address: "", city: "", region: "", country: "Ghana",
  logo_url: "", primary_color: PLUM, timezone: "Africa/Accra",
};

export function SchoolProfileTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Record<string, any>>({ ...INITIAL_FORM });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>("/api/school");
        if (res.data) {
          const d = res.data;
          setForm({
            name: d.name || "", motto: d.motto || "",
            school_type: d.school_type || "", year_established: d.year_established || "",
            registration_number: d.registration_number || "",
            email: d.email || "",
            phone: d.phone
              ? (d.phone.startsWith("+233") ? d.phone : "+233" + d.phone.replace(/^0?/, ""))
              : "+233",
            website: d.website || "", address: d.address || "",
            city: d.city || "", region: d.region || "",
            country: d.country || "Ghana",
            logo_url: d.logo_url || "", primary_color: d.primary_color || PLUM,
            timezone: d.timezone || "Africa/Accra",
          });
        }
      } catch {
        toast.error("Could not load school profile. Fill in your details and save.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = "School name is required";
    if (!form.school_type) errs.school_type = "School type is required";
    if (!form.email?.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email";
    if (!form.phone?.trim() || form.phone === "+233") errs.phone = "Phone is required";
    if (!form.address?.trim()) errs.address = "Address is required";
    if (!form.city?.trim()) errs.city = "City is required";
    if (!form.region) errs.region = "Region is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await api.patch<any>("/api/school", form);
      if (res.data) {
        toast.success("School profile updated!");
      } else {
        const msg = res.error || "Failed to update school profile";
        console.error("Save error response:", res);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error("Save threw:", err);
      toast.error(err?.message || "Failed to update school profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      toast.error("Only PNG, JPG, and SVG files are allowed");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((prev: Record<string, any>) => ({ ...prev, logo_url: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev: Record<string, any>) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const setSelect = (key: string) => (value: string) => {
    setForm((prev: Record<string, any>) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin" size={24} color={PLUM} />
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">

          {/* ─── SECTION 1: SCHOOL IDENTITY ────────────────────── */}
          <SectionCard title="School Identity" desc="Basic information about your school">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <FormField label="School Name" required error={errors.name}>
                <Input value={form.name} onChange={set("name")}
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} />
              </FormField>
              <FormField label="School Motto">
                <Input value={form.motto || ""} onChange={set("motto")}
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} />
              </FormField>
              <FormField label="School Type" required error={errors.school_type}>
                <Select value={form.school_type || ""} onValueChange={setSelect("school_type")}>
                  <SelectTrigger className="h-9 text-xs rounded-xl"
                    style={{ borderColor: "rgba(56,25,50,0.12)" }}>
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Year Established">
                <Input type="number" value={form.year_established || ""} onChange={set("year_established")}
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} min={1900} max={new Date().getFullYear()} />
              </FormField>
              <FormField label="School Registration Number">
                <Input value={form.registration_number || ""} onChange={set("registration_number")}
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} />
              </FormField>
            </div>
          </SectionCard>

          {/* ─── SECTION 2: CONTACT INFORMATION ────────────────── */}
          <SectionCard title="Contact Information" desc="How people can reach your school">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <FormField label="School Email" required error={errors.email}>
                <Input type="email" value={form.email} onChange={set("email")}
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} />
              </FormField>
              <FormField label="School Phone" required error={errors.phone}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none"
                    style={{ color: MUTED }}>+233</span>
                  <Input type="tel" value={form.phone?.replace("+233", "") || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, "");
                      setForm((prev: Record<string, any>) => ({ ...prev, phone: "+233" + val }));
                      if (errors.phone) setErrors((prev) => { const n = { ...prev }; delete n.phone; return n; });
                    }}
                    className="h-9 text-sm rounded-xl pl-12"
                    style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="XX XXX XXXX" />
                </div>
              </FormField>
              <FormField label="School Website">
                <Input type="url" value={form.website || ""} onChange={set("website")}
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="https://" />
              </FormField>
              <FormField label="City/Town" required error={errors.city}>
                <Input value={form.city || ""} onChange={set("city")}
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} />
              </FormField>
              <FormField label="Region" required error={errors.region}>
                <Select value={form.region || ""} onValueChange={setSelect("region")}>
                  <SelectTrigger className="h-9 text-xs rounded-xl"
                    style={{ borderColor: "rgba(56,25,50,0.12)" }}>
                    <SelectValue placeholder="Select region..." />
                  </SelectTrigger>
                  <SelectContent>
                    {GHANA_REGIONS.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Country">
                <Input value={form.country || "Ghana"} onChange={set("country")}
                  className="h-9 text-sm rounded-xl"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} />
              </FormField>
              <FormField label="Timezone">
                <Select value={form.timezone || "Africa/Accra"} onValueChange={setSelect("timezone")}>
                  <SelectTrigger className="h-9 text-xs rounded-xl"
                    style={{ borderColor: "rgba(56,25,50,0.12)" }}>
                    <SelectValue placeholder="Select timezone..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz} className="text-xs font-mono">{tz}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField label="School Address" required error={errors.address}>
              <Textarea value={form.address || ""} onChange={set("address")}
                rows={3}
                className="text-sm rounded-xl resize-none"
                style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </FormField>
          </SectionCard>

        </div>

        {/* ─── SECTION 3: SCHOOL BRANDING ─────────────────────── */}
        <div className="space-y-4">
          <SectionCard title="School Branding" desc="Logo and color scheme">
            <FormField label="School Logo">
              <div onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors hover:border-purple-400"
                style={{ borderColor: "rgba(99,102,241,0.2)" }}>
                {form.logo_url ? (
                  <img src={form.logo_url} alt="School logo"
                    className="w-[120px] h-[120px] rounded-full object-cover mx-auto"
                    style={{ border: "3px solid rgba(56,25,50,0.1)" }} />
                ) : (
                  <div>
                    <Upload size={24} color={MUTED} className="mx-auto mb-2" />
                    <p className="text-xs font-medium" style={{ color: PLUM }}>Upload Logo</p>
                    <p className="text-xs mt-1" style={{ color: MUTED }}>PNG, JPG, SVG (Max 2MB)</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml"
                  onChange={handleLogoUpload} className="hidden" />
              </div>
            </FormField>

            <FormField label="Primary Color">
              <div className="flex flex-wrap gap-2 mb-2">
                {PRESET_COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setForm((prev: Record<string, any>) => ({ ...prev, primary_color: c }))}
                    className="w-7 h-7 rounded-full active:scale-90 transition-transform relative"
                    style={{
                      background: c,
                      border: form.primary_color === c ? "3px solid white" : "2px solid transparent",
                      boxShadow: form.primary_color === c ? `0 0 0 2px ${c}` : "0 1px 3px rgba(0,0,0,0.15)",
                    }}>
                    {form.primary_color === c && (
                      <Check size={12} className="absolute inset-0 m-auto"
                        style={{ color: "#fff", filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }} />
                    )}
                  </button>
                ))}
                <input type="color" value={form.primary_color || PLUM}
                  onChange={(e) => setForm((prev: Record<string, any>) => ({ ...prev, primary_color: e.target.value }))}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 p-0" />
              </div>
              <Input value={form.primary_color || PLUM} onChange={set("primary_color")}
                className="h-8 text-xs rounded-xl font-mono"
                style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </FormField>
          </SectionCard>

          <SectionCard title="Live Preview">
            <div className="rounded-xl overflow-hidden shadow-lg"
              style={{ background: "white" }}>
              <div className="p-4"
                style={{
                  background: `linear-gradient(135deg, ${form.primary_color || PLUM} 0%, ${(form.primary_color || PLUM) + "dd"} 100%)`,
                  boxShadow: `0 4px 20px ${(form.primary_color || PLUM)}33`,
                }}>
                <div className="flex items-center gap-3">
                  {form.logo_url ? (
                    <img src={form.logo_url} alt="Logo"
                      className="w-10 h-10 rounded-full object-cover"
                      style={{ border: "2px solid rgba(255,255,255,0.3)" }} />
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.15)" }}>
                      <ImageIcon size={18} color="rgba(255,255,255,0.7)" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">
                      {form.name || "School Name"}
                    </h4>
                    {form.motto && (
                      <p className="text-[10px] truncate italic" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {form.motto}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-3 border-t" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                <div className="flex gap-3 text-[10px]" style={{ color: MUTED }}>
                  <span className="truncate">{form.email || "email@school.com"}</span>
                  <span className="truncate">{form.phone || "+233 XX XXX XXXX"}</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] mt-2" style={{ color: MUTED }}>
              Preview updates in real-time as you edit
            </p>
          </SectionCard>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6"
          style={{ background: PLUM }}>
          {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
          Save School Profile
        </Button>
      </div>
    </div>
  );
}
