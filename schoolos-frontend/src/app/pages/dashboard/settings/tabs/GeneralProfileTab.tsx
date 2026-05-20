import { useState, useEffect, useRef } from "react";
import { Upload, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { api } from "../../../../services/api";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

const GHANA_REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central",
  "Volta", "Northern", "Upper East", "Upper West", "Brong-Ahafo",
  "Oti", "Ahafo", "Bono East", "North East", "Savannah", "Western North",
];

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: NAVY }}>{title}</h3>
      {desc && <p className="text-xs mb-4" style={{ color: MUTED }}>{desc}</p>}
      {children}
    </div>
  );
}

function FormField({ label, required, error, children }: { label: string; required?: boolean; error?: string | null; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color: "#EF4444" }}>{error}</p>}
    </div>
  );
}

type Props = { role: string };

export function GeneralProfileTab({ role }: Props) {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const isReadOnly = role !== "school_admin" && role !== "admin";

  const [form, setForm] = useState<Record<string, any>>({
    name: "", registration_number: "", email: "", phone: "+233",
    address: "", city: "", region: "", country: "Ghana",
    website: "", motto: "", logo_url: "", favicon_url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>("/api/school");
        if (res.data) {
          const d = res.data;
          setForm({
            name: d.name || "", registration_number: d.registration_number || "",
            email: d.email || "", motto: d.motto || "",
            phone: d.phone ? (d.phone.startsWith("+233") ? d.phone : "+233" + d.phone.replace(/^0?/, "")) : "+233",
            address: d.address || "", city: d.city || "", region: d.region || "",
            country: d.country || "Ghana", website: d.website || "",
            logo_url: d.logo_url || "", favicon_url: d.favicon_url || "",
          });
        }
      } catch { toast.error("Could not load school profile."); }
      finally { setLoading(false); }
    })();
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name?.trim()) errs.name = "School name is required";
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
    if (isReadOnly) return;
    if (!validate()) return;
    setSaving(true);
    try {
      let logoUrl = form.logo_url;
      let faviconUrl = form.favicon_url;

      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        const uploadRes = await api.upload<any>('/api/school/upload-logo', fd);
        logoUrl = uploadRes.data?.logo_url || logoUrl;
      }
      if (faviconFile) {
        const fd = new FormData();
        fd.append('favicon', faviconFile);
        const uploadRes = await api.upload<any>('/api/school/upload-logo', fd);
        faviconUrl = uploadRes.data?.favicon_url || faviconUrl;
      }

      const payload = { ...form, logo_url: logoUrl, favicon_url: faviconUrl };
      const res = await api.patch<any>("/api/school", payload);
      if (res.data) {
        setLogoFile(null);
        setFaviconFile(null);
        toast.success("School profile updated!");
      } else {
        toast.error(res.error || "Failed to update school profile");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update school profile");
    } finally { setSaving(false); }
  };

  const handleFileUpload = (type: "logo" | "favicon") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("File must be under 2MB"); return; }
    if (!["image/png", "image/jpeg", "image/svg+xml", "image/x-icon"].includes(file.type) && type === "favicon") {
      if (!file.name.endsWith(".ico")) { toast.error("Only PNG, JPG, SVG, and ICO files are allowed"); return; }
    } else if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      toast.error("Only PNG, JPG, and SVG files are allowed");
      return;
    }
    if (type === "logo") setLogoFile(file);
    else setFaviconFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((prev: Record<string, any>) => ({ ...prev, [type === "logo" ? "logo_url" : "favicon_url"]: dataUrl }));
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
    return <div className="flex items-center justify-center min-h-[40vh]"><Loader2 className="animate-spin" size={24} color={NAVY} /></div>;
  }

  return (
    <div>
      <SectionCard title="School Identity" desc="Basic information including GES registration code">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="School Name" required error={errors.name}>
            <Input value={form.name} onChange={set("name")} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="GES Code / Registration Number">
            <Input value={form.registration_number || ""} onChange={set("registration_number")} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="School Motto">
            <Input value={form.motto || ""} onChange={set("motto")} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Website">
            <Input type="url" value={form.website || ""} onChange={set("website")} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="https://" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Email" required error={errors.email}>
            <Input type="email" value={form.email} onChange={set("email")} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Phone" required error={errors.phone}>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none" style={{ color: MUTED }}>+233</span>
              <Input type="tel" value={form.phone?.replace("+233", "") || ""}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, "");
                  setForm((prev: Record<string, any>) => ({ ...prev, phone: "+233" + val }));
                  if (errors.phone) setErrors((prev) => { const n = { ...prev }; delete n.phone; return n; });
                }}
                className="h-9 text-sm rounded-xl pl-12" style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="XX XXX XXXX" />
            </div>
          </FormField>
          <FormField label="City/Town" required error={errors.city}>
            <Input value={form.city || ""} onChange={set("city")} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Region" required error={errors.region}>
            <Select value={form.region || ""} onValueChange={setSelect("region")}>
              <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }}>
                <SelectValue placeholder="Select region..." />
              </SelectTrigger>
              <SelectContent>
                {GHANA_REGIONS.map((r) => (<SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>))}
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <FormField label="Address" required error={errors.address}>
          <Textarea value={form.address || ""} onChange={set("address")} rows={3} className="text-sm rounded-xl resize-none" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
        </FormField>
      </SectionCard>

      <SectionCard title="Branding Assets">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField label="Primary Logo">
            <div onClick={() => logoInputRef.current?.click()}
              className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors hover:border-purple-400"
              style={{ borderColor: "rgba(99,102,241,0.2)" }}>
              {form.logo_url ? (
                <img src={form.logo_url} alt="Logo" className="w-[120px] h-[120px] rounded-full object-cover mx-auto" style={{ border: "3px solid rgba(56,25,50,0.1)" }} />
              ) : (
                <div>
                  <Upload size={24} color={MUTED} className="mx-auto mb-2" />
                  <p className="text-xs font-medium" style={{ color: NAVY }}>Upload Logo</p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>PNG, JPG, SVG (Max 2MB)</p>
                </div>
              )}
              <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={handleFileUpload("logo")} className="hidden" />
            </div>
          </FormField>

          <FormField label="Favicon">
            <div onClick={() => faviconInputRef.current?.click()}
              className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors hover:border-purple-400"
              style={{ borderColor: "rgba(99,102,241,0.2)" }}>
              {form.favicon_url ? (
                <img src={form.favicon_url} alt="Favicon" className="w-12 h-12 object-contain mx-auto" style={{ border: "2px solid rgba(56,25,50,0.1)", borderRadius: 8 }} />
              ) : (
                <div>
                  <Upload size={24} color={MUTED} className="mx-auto mb-2" />
                  <p className="text-xs font-medium" style={{ color: NAVY }}>Upload Favicon</p>
                  <p className="text-xs mt-1" style={{ color: MUTED }}>PNG, ICO, SVG (Max 2MB)</p>
                </div>
              )}
              <input ref={faviconInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/x-icon,.ico" onChange={handleFileUpload("favicon")} className="hidden" />
            </div>
          </FormField>
        </div>
      </SectionCard>

      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6" style={{ background: NAVY }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Profile
          </Button>
        </div>
      )}
    </div>
  );
}
