import { useState, useEffect, useCallback } from "react";
import {
  Loader2, X, AlertCircle, Check, Save, Building2, Palette,
  BookOpen, GraduationCap, Bell, Link2, Plus, Trash2, Edit3,
  ChevronDown, ChevronRight, Send,
} from "lucide-react";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogClose,
} from "../components/ui/dialog";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

type SchoolProfile = {
  id: string; name: string; email: string; phone: string | null;
  address: string | null; website: string | null; country: string | null;
  slug: string; plan: string; logo_url: string | null;
  primary_color: string; accent_color: string;
  currency: string; currency_symbol: string;
  timezone: string; locale: string; date_format: string; week_starts_on: string;
  notification_email: string | null; notification_phone: string | null;
  enable_sms_notifications: boolean; enable_email_notifications: boolean;
  enable_whatsapp_notifications: boolean; enable_in_app_notifications: boolean;
  auto_publish_report_cards: boolean; enable_online_payments: boolean;
  enable_fee_reminders: boolean; enable_attendance_tracking: boolean;
  enable_parent_portal: boolean; enable_student_portal: boolean;
  is_active: boolean; created_at: string;
};

type AcademicTerm = { id: string; name: string; start_date: string; end_date: string; is_current: boolean };
type AcademicSession = AcademicTerm;
type GradeRule = { id: string; grading_scale_id: string; grade: string; min_percent: number; max_percent: number; points: number; remark: string | null };
type GradingScale = { id: string; name: string; is_default: boolean; rules?: GradeRule[] };
type IntegrationInfo = { provider: string; label: string; configured: boolean; fields: { key: string; masked: boolean; value?: string }[] };

const AlertBanner = ({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) => (
  <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
    style={{ background: type === "error" ? "#FEF2F2" : "#D1FAE5", color: type === "error" ? "#EF4444" : "#065F46", border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}` }}>
    {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
    <span className="flex-1">{message}</span>
    <button onClick={onClose}><X size={14} /></button>
  </div>
);

const LoadingSpinner = ({ height = 48 }: { height?: number }) => (
  <div className="flex items-center justify-center" style={{ height }}><Loader2 className="animate-spin" size={24} color={PLUM} /></div>
);

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

// ─── Profile Tab ──────────────────────────────────────────────────
function ProfileTab({ profile, onSave, saving }: { profile: SchoolProfile; onSave: (d: Partial<SchoolProfile>) => Promise<void>; saving: boolean }) {
  const [form, setForm] = useState({ ...profile });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setForm({ ...profile }); }, [profile]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "School name is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => { if (validate()) await onSave(form); };

  return (
    <div>
      <SectionCard title="General Information" desc="Basic details about your school">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="School Name" error={errors.name}>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Phone">
            <Input value={form.phone || ""} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Website">
            <Input value={form.website || ""} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Country">
            <Input value={form.country || ""} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Slug (subdomain)">
            <Input value={form.slug} disabled className="h-9 text-sm rounded-xl bg-gray-50" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
        </div>
        <FormField label="Address">
          <Textarea value={form.address || ""} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} className="text-sm rounded-xl resize-none" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
        </FormField>
      </SectionCard>

      <SectionCard title="Regional Settings" desc="Currency, timezone, and date format">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
          <FormField label="Currency">
            <Select value={form.currency} onValueChange={v => setForm(p => ({ ...p, currency: v }))}>
              <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="GHS">GHS (₵)</SelectItem>
                <SelectItem value="NGN">NGN (₦)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="KES">KES (KSh)</SelectItem>
                <SelectItem value="ZAR">ZAR (R)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Symbol">
            <Input value={form.currency_symbol} onChange={e => setForm(p => ({ ...p, currency_symbol: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} maxLength={5} />
          </FormField>
          <FormField label="Timezone">
            <Select value={form.timezone} onValueChange={v => setForm(p => ({ ...p, timezone: v }))}>
              <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Accra">Africa/Accra (GMT)</SelectItem>
                <SelectItem value="Africa/Lagos">Africa/Lagos (WAT)</SelectItem>
                <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                <SelectItem value="Africa/Cairo">Africa/Cairo (EET)</SelectItem>
                <SelectItem value="Africa/Johannesburg">Africa/Johannesburg (SAST)</SelectItem>
                <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Date Format">
            <Select value={form.date_format} onValueChange={v => setForm(p => ({ ...p, date_format: v }))}>
              <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                <SelectItem value="DD MMM YYYY">DD MMM YYYY</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-x-4">
          <FormField label="Week Starts On">
            <Select value={form.week_starts_on} onValueChange={v => setForm(p => ({ ...p, week_starts_on: v }))}>
              <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monday">Monday</SelectItem>
                <SelectItem value="sunday">Sunday</SelectItem>
                <SelectItem value="saturday">Saturday</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Locale">
            <Select value={form.locale} onValueChange={v => setForm(p => ({ ...p, locale: v }))}>
              <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="en-GB">English (UK)</SelectItem>
                <SelectItem value="fr-FR">French</SelectItem>
                <SelectItem value="pt-BR">Portuguese (BR)</SelectItem>
                <SelectItem value="es-ES">Spanish</SelectItem>
                <SelectItem value="ar-SA">Arabic</SelectItem>
                <SelectItem value="sw-KE">Swahili (KE)</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9" style={{ background: PLUM }}>
          {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
          Save Changes
        </Button>
      </div>
    </div>
  );
}

// ─── Branding Tab ─────────────────────────────────────────────────
function BrandingTab({ profile, onSave, saving }: { profile: SchoolProfile; onSave: (d: Partial<SchoolProfile>) => Promise<void>; saving: boolean }) {
  const [form, setForm] = useState({ logo_url: profile.logo_url || "", primary_color: profile.primary_color || PLUM, accent_color: profile.accent_color || PLUM_LIGHT });

  useEffect(() => { setForm({ logo_url: profile.logo_url || "", primary_color: profile.primary_color || PLUM, accent_color: profile.accent_color || PLUM_LIGHT }); }, [profile]);

  const handleSave = async () => { await onSave(form); };

  return (
    <div>
      <SectionCard title="Brand Colors" desc="Customize your school's appearance">
        <div className="grid grid-cols-2 gap-6">
          <FormField label="Primary Color">
            <div className="flex gap-3 items-center">
              <input type="color" value={form.primary_color} onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))} className="w-12 h-10 rounded-xl cursor-pointer" style={{ border: "1px solid rgba(56,25,50,0.12)" }} />
              <Input value={form.primary_color} onChange={e => setForm(p => ({ ...p, primary_color: e.target.value }))} className="h-9 text-xs rounded-xl font-mono flex-1" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </div>
          </FormField>
          <FormField label="Accent Color">
            <div className="flex gap-3 items-center">
              <input type="color" value={form.accent_color} onChange={e => setForm(p => ({ ...p, accent_color: e.target.value }))} className="w-12 h-10 rounded-xl cursor-pointer" style={{ border: "1px solid rgba(56,25,50,0.12)" }} />
              <Input value={form.accent_color} onChange={e => setForm(p => ({ ...p, accent_color: e.target.value }))} className="h-9 text-xs rounded-xl font-mono flex-1" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </div>
          </FormField>
        </div>
        <div className="mt-4 p-4 rounded-xl flex items-center gap-4" style={{ background: form.primary_color, color: "white" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: form.accent_color }}><Building2 size={20} /></div>
          <div>
            <p className="font-semibold text-sm">{profile.name || "School Name"}</p>
            <p className="text-xs opacity-80">Preview of your brand colors</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Logo" desc="URL to your school logo">
        <FormField label="Logo URL">
          <Input value={form.logo_url} onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="https://example.com/logo.png" />
        </FormField>
        {form.logo_url && (
          <div className="mt-3 p-4 rounded-xl flex items-center gap-4" style={{ background: "rgba(56,25,50,0.03)", border: "1px solid rgba(56,25,50,0.07)" }}>
            <img src={form.logo_url} alt="Logo preview" className="w-16 h-16 object-contain rounded-xl" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <span className="text-xs" style={{ color: MUTED }}>Logo preview</span>
          </div>
        )}
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9" style={{ background: PLUM }}>
          {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
          Save Branding
        </Button>
      </div>
    </div>
  );
}

// ─── Academic Terms Tab ───────────────────────────────────────────
function AcademicTab() {
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<{ open: boolean; type?: "term" | "session"; edit?: any }>({ open: false });
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "", is_current: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const [tRes, sRes] = await Promise.all([
      api.get<AcademicTerm[]>("/school/settings/terms"),
      api.get<AcademicSession[]>("/school/settings/sessions"),
    ]);
    if (tRes.data) setTerms(tRes.data);
    if (sRes.data) setSessions(sRes.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = (type: "term" | "session") => { setForm({ name: "", start_date: "", end_date: "", is_current: false }); setDialog({ open: true, type }); };
  const openEdit = (type: "term" | "session", item: any) => { setForm(item); setDialog({ open: true, type, edit: item }); };

  const handleSave = async () => {
    if (!form.name || !form.start_date || !form.end_date) return;
    setSaving(true); setError(null);
    const isTerm = dialog.type === "term";
    try {
      if (dialog.edit) {
        await api.put(`/school/settings/${isTerm ? "terms" : "sessions"}/${dialog.edit.id}`, form);
      } else {
        await api.post(`/school/settings/${isTerm ? "terms" : "sessions"}`, form);
      }
      setDialog({ open: false });
      fetch();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string, type: "term" | "session") => {
    if (!confirm("Delete this item?")) return;
    await api.delete(`/school/settings/${type === "term" ? "terms" : "sessions"}/${id}`);
    fetch();
  };

  const renderTable = (items: (AcademicTerm | AcademicSession)[], type: "term" | "session") => (
    <div className="rounded-xl overflow-hidden border mt-2" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-semibold" style={{ color: PLUM }}>Name</TableHead>
            <TableHead className="text-xs font-semibold" style={{ color: PLUM }}>Start</TableHead>
            <TableHead className="text-xs font-semibold" style={{ color: PLUM }}>End</TableHead>
            <TableHead className="text-xs font-semibold" style={{ color: PLUM }}>Status</TableHead>
            <TableHead className="w-20"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell className="text-xs font-medium" style={{ color: PLUM }}>{item.name}</TableCell>
              <TableCell className="text-xs" style={{ color: MUTED }}>{item.start_date}</TableCell>
              <TableCell className="text-xs" style={{ color: MUTED }}>{item.end_date}</TableCell>
              <TableCell>
                {item.is_current ? <Badge className="bg-green-100 text-green-700" variant="outline">Current</Badge> : <Badge variant="outline" className="text-xs">Inactive</Badge>}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(type, item)}><Edit3 size={12} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(item.id, type)}><Trash2 size={12} style={{ color: "#EF4444" }} /></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
      <SectionCard title="Academic Terms" desc="Define school terms">
        <Button size="sm" onClick={() => openCreate("term")} className="text-xs rounded-xl h-8 mb-3" style={{ background: PLUM }}>
          <Plus size={12} className="mr-1" /> Add Term
        </Button>
        {loading ? <LoadingSpinner height={100} /> : terms.length === 0 ? <p className="text-xs" style={{ color: MUTED }}>No terms defined yet.</p> : renderTable(terms, "term")}
      </SectionCard>

      <SectionCard title="Academic Sessions" desc="Define academic years/sessions">
        <Button size="sm" onClick={() => openCreate("session")} className="text-xs rounded-xl h-8 mb-3" style={{ background: PLUM }}>
          <Plus size={12} className="mr-1" /> Add Session
        </Button>
        {loading ? <LoadingSpinner height={100} /> : sessions.length === 0 ? <p className="text-xs" style={{ color: MUTED }}>No sessions defined yet.</p> : renderTable(sessions, "session")}
      </SectionCard>

      <Dialog open={dialog.open} onOpenChange={(v) => !v && setDialog({ open: false })}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ color: PLUM }}>{dialog.edit ? "Edit" : "Add"} {dialog.type === "term" ? "Term" : "Session"}</DialogTitle>
            <DialogDescription style={{ color: MUTED }}>Set the name and date range.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <FormField label="Name">
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Start Date">
                <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
              </FormField>
              <FormField label="End Date">
                <Input type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
              </FormField>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_current} onChange={e => setForm(p => ({ ...p, is_current: e.target.checked }))} className="rounded" style={{ accentColor: PLUM }} />
              <span className="text-xs font-medium" style={{ color: PLUM }}>Set as current</span>
            </label>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm" className="text-xs rounded-xl">Cancel</Button></DialogClose>
            <Button size="sm" onClick={handleSave} disabled={saving} className="text-xs rounded-xl" style={{ background: PLUM }}>
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
              {dialog.edit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Grading Tab ──────────────────────────────────────────────────
function GradingTab() {
  const [scales, setScales] = useState<GradingScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; scaleId?: string }>({ open: false });
  const [ruleForm, setRuleForm] = useState<{ grade: string; min_percent: string; max_percent: string; points: string; remark: string }>({ grade: "", min_percent: "", max_percent: "", points: "", remark: "" });

  const fetch = useCallback(async () => {
    setLoading(true);
    const res = await api.get<GradingScale[]>("/school/settings/grading-scales");
    if (res.data) setScales(res.data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreateScale = async () => {
    const name = prompt("Grading scale name:");
    if (!name) return;
    await api.post("/school/settings/grading-scales", { name });
    fetch();
  };

  const handleDeleteScale = async (id: string) => {
    if (!confirm("Delete this grading scale?")) return;
    await api.delete(`/school/settings/grading-scales/${id}`);
    fetch();
  };

  const handleAddRule = async () => {
    if (!ruleForm.grade || !ruleForm.min_percent || !ruleForm.max_percent || !dialog.scaleId) return;
    try {
      await api.post("/school/settings/grade-rules", {
        grading_scale_id: dialog.scaleId,
        grade: ruleForm.grade,
        min_percent: Number(ruleForm.min_percent),
        max_percent: Number(ruleForm.max_percent),
        points: Number(ruleForm.points) || 0,
        remark: ruleForm.remark || undefined,
      });
      setDialog({ open: false });
      setRuleForm({ grade: "", min_percent: "", max_percent: "", points: "", remark: "" });
      fetch();
    } catch (err: any) { setError(err.message); }
  };

  const handleDeleteRule = async (ruleId: string) => {
    await api.delete(`/school/settings/grade-rules/${ruleId}`);
    fetch();
  };

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
      <SectionCard title="Grading Scales" desc="Define grade boundaries for assessments">
        <Button size="sm" onClick={handleCreateScale} className="text-xs rounded-xl h-8 mb-3" style={{ background: PLUM }}>
          <Plus size={12} className="mr-1" /> New Scale
        </Button>
        {loading ? <LoadingSpinner height={100} /> : scales.length === 0 ? <p className="text-xs" style={{ color: MUTED }}>No grading scales defined.</p> : (
          <div className="space-y-2">
            {scales.map(s => (
              <div key={s.id} className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                <button onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  className="w-full flex items-center justify-between p-3 text-left hover:bg-[rgba(56,25,50,0.02)]">
                  <div className="flex items-center gap-2">
                    {expanded === s.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <span className="text-sm font-medium" style={{ color: PLUM }}>{s.name}</span>
                    {s.is_default && <Badge className="bg-green-100 text-green-700 text-[10px]" variant="outline">Default</Badge>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDeleteScale(s.id); }}><Trash2 size={12} style={{ color: "#EF4444" }} /></Button>
                </button>
                {expanded === s.id && (
                  <div className="p-3 border-t" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                    {(s.rules || []).length === 0 ? <p className="text-xs" style={{ color: MUTED }}>No grade rules. Add one below.</p> : (
                      <div className="space-y-1 mb-3">
                        {(s.rules || []).sort((a, b) => b.min_percent - a.min_percent).map(r => (
                          <div key={r.id} className="flex items-center justify-between p-2 rounded-lg text-xs" style={{ background: "rgba(56,25,50,0.03)" }}>
                            <span className="font-semibold w-12" style={{ color: PLUM }}>{r.grade}</span>
                            <span style={{ color: MUTED }}>{r.min_percent}% – {r.max_percent}%</span>
                            <span style={{ color: MUTED }}>Points: {r.points}</span>
                            <span style={{ color: MUTED }}>{r.remark || ""}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteRule(r.id)}><X size={10} /></Button>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { setDialog({ open: true, scaleId: s.id }); setRuleForm({ grade: "", min_percent: "", max_percent: "", points: "", remark: "" }); }} className="text-xs rounded-xl h-7">
                      <Plus size={10} className="mr-1" /> Add Grade
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Dialog open={dialog.open} onOpenChange={(v) => !v && setDialog({ open: false })}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle style={{ color: PLUM }}>Add Grade Rule</DialogTitle>
            <DialogDescription style={{ color: MUTED }}>Define a grade boundary.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Grade">
                <Input value={ruleForm.grade} onChange={e => setRuleForm(p => ({ ...p, grade: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="A" />
              </FormField>
              <FormField label="Points">
                <Input type="number" value={ruleForm.points} onChange={e => setRuleForm(p => ({ ...p, points: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="4.0" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Min %">
                <Input type="number" value={ruleForm.min_percent} onChange={e => setRuleForm(p => ({ ...p, min_percent: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} min={0} max={100} />
              </FormField>
              <FormField label="Max %">
                <Input type="number" value={ruleForm.max_percent} onChange={e => setRuleForm(p => ({ ...p, max_percent: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} min={0} max={100} />
              </FormField>
            </div>
            <FormField label="Remark (optional)">
              <Input value={ruleForm.remark} onChange={e => setRuleForm(p => ({ ...p, remark: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="Excellent" />
            </FormField>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm" className="text-xs rounded-xl">Cancel</Button></DialogClose>
            <Button size="sm" onClick={handleAddRule} className="text-xs rounded-xl" style={{ background: PLUM }}>Add Rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────
function NotificationsTab({ profile, onSave, saving }: { profile: SchoolProfile; onSave: (d: Partial<SchoolProfile>) => Promise<void>; saving: boolean }) {
  const [form, setForm] = useState({ ...profile });
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => { setForm({ ...profile }); }, [profile]);

  const handleSave = async () => { await onSave(form); };

  const runTest = async (channel: string) => {
    setTesting(true); setTestResult(null);
    try {
      let res: any;
      if (channel === "email") {
        res = await api.post<{ success: boolean; message: string }>("/school/settings/test-email", { to: form.notification_email || form.email, subject: "Test from Managen", text: "This is a test email from your school settings." });
      } else if (channel === "sms") {
        res = await api.post<{ success: boolean; message: string }>("/school/settings/test-sms", { to: form.notification_phone || form.phone, message: "This is a test SMS from your school." });
      } else {
        res = await api.post<{ success: boolean; message: string }>("/school/settings/test-whatsapp", { to: form.notification_phone || form.phone, body: "This is a test WhatsApp from your school." });
      }
      if (res.data) setTestResult(`${channel}: ${res.data.success ? "Sent successfully" : "Failed — " + res.data.message}`);
    } catch (err: any) { setTestResult(`${channel}: ${err.message}`); }
    finally { setTesting(false); }
  };

  return (
    <div>
      {testResult && <AlertBanner type={testResult.includes("success") ? "success" : "error"} message={testResult} onClose={() => setTestResult(null)} />}

      <SectionCard title="Contact Details" desc="Notification sender contact info">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Notification Email">
            <Input type="email" value={form.notification_email || ""} onChange={e => setForm(p => ({ ...p, notification_email: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Notification Phone">
            <Input value={form.notification_phone || ""} onChange={e => setForm(p => ({ ...p, notification_phone: e.target.value }))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Channel Toggles" desc="Enable or disable notification channels">
        <div className="space-y-3">
          {[
            { key: "enable_email_notifications", label: "Email Notifications", icon: Send },
            { key: "enable_sms_notifications", label: "SMS Notifications", icon: Send },
            { key: "enable_whatsapp_notifications", label: "WhatsApp Notifications", icon: Send },
            { key: "enable_in_app_notifications", label: "In-App Notifications", icon: Bell },
            { key: "auto_publish_report_cards", label: "Auto-Publish Report Cards", icon: GraduationCap },
            { key: "enable_fee_reminders", label: "Fee Reminders", icon: Bell },
          ].map(({ key, label, icon: Icon }) => (
            <label key={key} className="flex items-center justify-between p-3 rounded-xl cursor-pointer" style={{ background: "rgba(56,25,50,0.03)", border: "1px solid rgba(56,25,50,0.06)" }}>
              <div className="flex items-center gap-2">
                <Icon size={14} style={{ color: MUTED }} />
                <span className="text-sm" style={{ color: PLUM }}>{label}</span>
              </div>
              <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} className="rounded" style={{ accentColor: PLUM }} />
            </label>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Test Channels" desc="Send a test message to verify your configuration">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => runTest("email")} disabled={testing} className="text-xs rounded-xl">
            {testing ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
            Test Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => runTest("sms")} disabled={testing} className="text-xs rounded-xl">
            Test SMS
          </Button>
          <Button variant="outline" size="sm" onClick={() => runTest("whatsapp")} disabled={testing} className="text-xs rounded-xl">
            Test WhatsApp
          </Button>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9" style={{ background: PLUM }}>
          {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
          Save Preferences
        </Button>
      </div>
    </div>
  );
}

// ─── Integrations Tab ─────────────────────────────────────────────
function IntegrationsTab() {
  const [systemInt, setSystemInt] = useState<IntegrationInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ system: IntegrationInfo[] }>("/school/settings/integrations").then(r => {
      if (r.data) setSystemInt(r.data.system);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <SectionCard title="System Integrations" desc="Configured providers and their current status">
        {loading ? <LoadingSpinner height={100} /> : (
          <div className="space-y-3">
            {systemInt.map(int => (
              <div key={int.provider} className="p-4 rounded-xl flex items-center justify-between" style={{ background: "rgba(56,25,50,0.03)", border: "1px solid rgba(56,25,50,0.07)" }}>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold" style={{ color: PLUM }}>{int.label}</span>
                    {int.configured ? (
                      <Badge className="bg-green-100 text-green-700 text-[10px]" variant="outline">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 text-[10px]" variant="outline">Not Configured</Badge>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs" style={{ color: MUTED }}>
                    {int.fields.map(f => (
                      <span key={f.key}><span className="font-medium">{f.key}:</span> {f.masked ? "••••••••" : f.value || "—"}</span>
                    ))}
                  </div>
                </div>
                <Link2 size={18} color={int.configured ? "#10B981" : MUTED} />
              </div>
            ))}
            {systemInt.length === 0 && <p className="text-xs" style={{ color: MUTED }}>No integrations configured.</p>}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export function SchoolSettings() {
  const [profile, setProfile] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ profile: SchoolProfile }>("/school/settings");
      if (res.data) setProfile(res.data.profile);
    } catch (err: any) { setAlert({ type: "error", message: err.message }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleProfileSave = async (data: Partial<SchoolProfile>) => {
    setSaving(true); setAlert(null);
    try {
      const res = await api.put<SchoolProfile>("/school/settings/profile", data);
      if (res.data) { setProfile(res.data); setAlert({ type: "success", message: "Settings saved." }); }
    } catch (err: any) { setAlert({ type: "error", message: err.message }); }
    finally { setSaving(false); }
  };

  const handleBrandingSave = async (data: Partial<SchoolProfile>) => {
    setSaving(true); setAlert(null);
    try {
      const res = await api.put<Partial<SchoolProfile>>("/school/settings/branding", data);
      if (res.data) { setProfile(prev => prev ? { ...prev, ...res.data } : null); setAlert({ type: "success", message: "Branding saved." }); }
    } catch (err: any) { setAlert({ type: "error", message: err.message }); }
    finally { setSaving(false); }
  };

  const handleNotifSave = async (data: Partial<SchoolProfile>) => {
    setSaving(true); setAlert(null);
    try {
      const res = await api.put<Partial<SchoolProfile>>("/school/settings/notifications", data);
      if (res.data) { setProfile(prev => prev ? { ...prev, ...res.data } : null); setAlert({ type: "success", message: "Notification preferences saved." }); }
    } catch (err: any) { setAlert({ type: "error", message: err.message }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-6 max-w-7xl mx-auto"><LoadingSpinner height={400} /></div>;
  if (!profile) return <div className="p-6 max-w-7xl mx-auto text-center py-16"><p className="text-sm" style={{ color: "#EF4444" }}>Failed to load settings.</p></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: PLUM }}>School Settings</h1>
          <p className="text-xs mt-1" style={{ color: MUTED }}>Configure your school environment</p>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <Tabs defaultValue="profile" className="p-1">
          <TabsList className="mx-4 mt-3 mb-2 flex-wrap h-auto gap-1" style={{ background: "rgba(56,25,50,0.03)" }}>
            <TabsTrigger value="profile" className="text-xs rounded-lg data-[state=active]:bg-white">
              <Building2 size={14} className="mr-1" /> Profile
            </TabsTrigger>
            <TabsTrigger value="branding" className="text-xs rounded-lg data-[state=active]:bg-white">
              <Palette size={14} className="mr-1" /> Branding
            </TabsTrigger>
            <TabsTrigger value="academic" className="text-xs rounded-lg data-[state=active]:bg-white">
              <BookOpen size={14} className="mr-1" /> Academic
            </TabsTrigger>
            <TabsTrigger value="grading" className="text-xs rounded-lg data-[state=active]:bg-white">
              <GraduationCap size={14} className="mr-1" /> Grading
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs rounded-lg data-[state=active]:bg-white">
              <Bell size={14} className="mr-1" /> Notifications
            </TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs rounded-lg data-[state=active]:bg-white">
              <Link2 size={14} className="mr-1" /> Integrations
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="profile"><ProfileTab profile={profile} onSave={handleProfileSave} saving={saving} /></TabsContent>
            <TabsContent value="branding"><BrandingTab profile={profile} onSave={handleBrandingSave} saving={saving} /></TabsContent>
            <TabsContent value="academic"><AcademicTab /></TabsContent>
            <TabsContent value="grading"><GradingTab /></TabsContent>
            <TabsContent value="notifications"><NotificationsTab profile={profile} onSave={handleNotifSave} saving={saving} /></TabsContent>
            <TabsContent value="integrations"><IntegrationsTab /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
