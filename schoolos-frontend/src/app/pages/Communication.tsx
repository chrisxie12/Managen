import { useState, useEffect, useCallback } from "react";
import {
  Loader2, X, AlertCircle, Check, Send, Save, Clock,
  MessageSquare, Mail, Phone, Globe, ChevronLeft, ChevronRight,
  Eye, Trash2, RefreshCw, FileText, Plus, Edit3, Megaphone,
  Search,
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

const NAVY = "#031B4E";
const MUTED = "#6B7280";

// ─── Types ────────────────────────────────────────────────────────
type Message = {
  id: string; school_id: string; subject: string; body: string;
  channel: string; sender_id: string | null; status: string;
  scheduled_at: string | null; sent_at: string | null;
  template_id: string | null; created_at: string;
  recipientSummary?: { total: number; sent: number; failed: number; pending: number; types: string[] };
  recipients?: MessageRecipient[];
};

type MessageRecipient = {
  id: string; message_id: string; recipient_type: string;
  recipient_id: string | null; recipient_name: string | null;
  recipient_contact: string | null; status: string;
  error_message: string | null; sent_at: string | null;
};

type Template = {
  id: string; school_id: string; name: string;
  subject: string | null; body: string; channel: string;
  category: string; created_at: string;
};

type Announcement = {
  id: string; school_id: string; title: string; body: string;
  channel: string; status: string; scheduled_at: string | null;
  published_at: string | null; created_at: string;
};

type RecipientOption = {
  classes: { id: string; name: string }[];
  roles: string[];
  students: { id: string; name: string; class_name: string; parent_name: string | null; parent_phone: string | null; parent_email: string | null }[];
};

type ComposeForm = {
  subject: string; body: string; channel: string;
  schedule: boolean; scheduled_at: string;
  targetType: "class" | "role" | "custom" | "";
  targetValue: string;
  customRecipients: string;
  template_id: string;
};

type Stats = {
  messages: { total: number; sent: number; draft: number; scheduled: number; failed: number; partial: number };
  templates: number;
  announcements: { total: number; published: number; draft: number };
};

const channelIcons: Record<string, any> = { email: Mail, sms: Phone, whatsapp: Globe, in_app: MessageSquare };
const channelLabels: Record<string, string> = { email: "Email", sms: "SMS", whatsapp: "WhatsApp", in_app: "In-App" };

const statusStyles: Record<string, string> = {
  sent: "bg-green-100 text-green-700", draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700", sending: "bg-yellow-100 text-yellow-700",
  partial: "bg-orange-100 text-orange-700", failed: "bg-red-100 text-red-700",
  published: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700",
};

const StatusBadge = ({ status }: { status: string }) => (
  <Badge className={statusStyles[status] || "bg-gray-100 text-gray-600"} variant="outline">
    {status.replace(/_/g, " ")}
  </Badge>
);

const AlertBanner = ({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) => (
  <div className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
    style={{ background: type === "error" ? "#FEF2F2" : "#D1FAE5", color: type === "error" ? "#EF4444" : "#065F46", border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}` }}>
    {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
    <span className="flex-1">{message}</span>
    <button onClick={onClose}><X size={14} /></button>
  </div>
);

const LoadingSpinner = ({ height = 48 }: { height?: number }) => (
  <div className="flex items-center justify-center" style={{ height }}><Loader2 className="animate-spin" size={24} color={NAVY} /></div>
);

const EmptyState = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(10,36,114,0.03)", border: "1px dashed rgba(10,36,114,0.1)" }}>
    <Icon size={40} color={MUTED} className="mx-auto mb-3" />
    <p className="font-semibold text-sm" style={{ color: NAVY }}>{title}</p>
    <p className="text-xs mt-1" style={{ color: MUTED }}>{desc}</p>
  </div>
);

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const MetricCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color?: string }) => (
  <div className="p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)", minWidth: 140 }}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} color={color || MUTED} />
      <span className="text-xs" style={{ color: MUTED }}>{label}</span>
    </div>
    <p className="text-lg font-bold" style={{ color: NAVY }}>{value}</p>
  </div>
);

// ─── Compose Tab ──────────────────────────────────────────────────
function ComposeTab({ onSent }: { onSent: () => void }) {
  const [form, setForm] = useState<ComposeForm>({
    subject: "", body: "", channel: "email", schedule: false,
    scheduled_at: "", targetType: "", targetValue: "",
    customRecipients: "", template_id: "",
  });
  const [options, setOptions] = useState<RecipientOption | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    api.get<RecipientOption>("/school/communications/recipient-options").then(r => { if (r.data) setOptions(r.data); });
    api.get<Template[]>("/school/communications/templates/list").then(r => { if (r.data) setTemplates(r.data); });
  }, []);

  const update = (k: keyof ComposeForm, v: any) => setForm(prev => ({ ...prev, [k]: v }));

  const buildRecipients = (): { type: string; id: string | null; name: string | null; contact: string }[] => {
    if (form.targetType === "custom") {
      return form.customRecipients.split(/[\n,]/).map(s => s.trim()).filter(Boolean).map(contact => ({
        type: "custom", id: null, name: null, contact,
      }));
    }
    if (!options) return [];
    if (form.targetType === "class" && form.targetValue) {
      const students = options.students.filter(s => s.class_name === form.targetValue);
      return students.flatMap(s => [
        ...(s.parent_email ? [{ type: "parent" as const, id: s.id, name: s.parent_name, contact: s.parent_email }] : []),
        ...(s.parent_phone ? [{ type: "parent" as const, id: s.id, name: s.parent_name, contact: s.parent_phone }] : []),
      ]);
    }
    return [];
  };

  const handleSend = async () => {
    if (!form.body.trim()) { setError("Message body is required."); return; }
    if (form.channel === "email" && !form.subject.trim()) { setError("Subject is required for email."); return; }
    const recipients = buildRecipients();
    if (recipients.length === 0) { setError("No recipients found for the selected group."); return; }

    setSending(true); setError(null); setSuccess(null);
    try {
      const res = await api.post("/school/communications/send", {
        subject: form.subject || "(no subject)", body: form.body, channel: form.channel,
        scheduled_at: form.schedule && form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
        recipients, template_id: form.template_id || undefined,
      });
      if (res.error) { setError(res.error); return; }
      setSuccess(`Message sent to ${recipients.length} recipient(s).`);
      setForm({ subject: "", body: "", channel: "email", schedule: false, scheduled_at: "", targetType: "", targetValue: "", customRecipients: "", template_id: "" });
      onSent();
    } catch (err: any) { setError(err.message || "Failed to send."); }
    finally { setSending(false); }
  };

  const handleSaveDraft = async () => {
    if (!form.body.trim()) { setError("Message body is required."); return; }
    setSaving(true); setError(null);
    try {
      const res = await api.post("/school/communications/drafts", {
        subject: form.subject || "(no subject)", body: form.body, channel: form.channel,
        template_id: form.template_id || undefined,
      });
      if (res.error) { setError(res.error); return; }
      setSuccess("Draft saved.");
      onSent();
    } catch (err: any) { setError(err.message || "Failed to save draft."); }
    finally { setSaving(false); }
  };

  const applyTemplate = (t: Template) => {
    setForm(prev => ({
      ...prev, subject: t.subject || prev.subject, body: t.body,
      channel: t.channel !== "any" ? t.channel : prev.channel, template_id: t.id,
    }));
  };

  const studentsInClass = options?.students.filter(s => s.class_name === form.targetValue) || [];
  const resolvedCount = form.targetType === "class" ? studentsInClass.reduce((sum, s) => sum + (s.parent_email ? 1 : 0) + (s.parent_phone ? 1 : 0), 0)
    : form.targetType === "custom" ? form.customRecipients.split(/[\n,]/).filter(Boolean).length : 0;

  return (
    <div className="max-w-3xl">
      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess(null)} />}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Channel</label>
          <Select value={form.channel} onValueChange={(v) => update("channel", v)}>
            <SelectTrigger className="h-10 text-sm rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(channelLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Template</label>
          <Select value={form.template_id} onValueChange={(v) => {
            const t = templates.find(t => t.id === v);
            update("template_id", v);
            if (t) applyTemplate(t);
          }}>
            <SelectTrigger className="h-10 text-sm rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {templates.map(t => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {form.channel === "email" && (
        <div className="mb-4">
          <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Subject</label>
          <Input value={form.subject} onChange={e => update("subject", e.target.value)}
            className="h-10 text-sm rounded-xl" placeholder="Email subject..." style={{ borderColor: "rgba(10,36,114,0.12)" }} />
        </div>
      )}

      <div className="mb-4">
        <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Message Body</label>
        <Textarea value={form.body} onChange={e => update("body", e.target.value)} rows={6}
          className="text-sm rounded-xl resize-y" placeholder="Type your message..."
          style={{ borderColor: "rgba(10,36,114,0.12)" }} />
        {form.channel === "sms" && (
          <p className="text-xs mt-1" style={{ color: MUTED }}>{form.body.length} characters (~{Math.ceil(form.body.length / 160)} SMS segments)</p>
        )}
      </div>

      <div className="mb-4 p-4 rounded-2xl" style={{ background: "rgba(10,36,114,0.03)", border: "1px solid rgba(10,36,114,0.07)" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: NAVY }}>Recipients</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: MUTED }}>Target By</label>
            <Select value={form.targetType} onValueChange={(v) => update("targetType", v)}>
              <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                <SelectValue placeholder="Select group..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class">Class</SelectItem>
                <SelectItem value="custom">Custom List</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.targetType === "class" && (
            <div>
              <label className="text-xs mb-1 block" style={{ color: MUTED }}>Class</label>
              <Select value={form.targetValue} onValueChange={(v) => update("targetValue", v)}>
                <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent>
                  {(options?.classes || []).map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {form.targetType === "custom" && (
          <div className="mt-3">
            <label className="text-xs mb-1 block" style={{ color: MUTED }}>Email addresses or phone numbers (one per line)</label>
            <Textarea value={form.customRecipients} onChange={e => update("customRecipients", e.target.value)} rows={3}
              className="text-xs rounded-xl resize-none" placeholder="parent@example.com&#10;+233501234567"
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </div>
        )}
        {form.targetType === "class" && form.targetValue && (
          <div className="mt-2">
            <p className="text-xs" style={{ color: MUTED }}>
              {studentsInClass.length} students in {form.targetValue} → ~{resolvedCount} parent contact(s)
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.schedule} onChange={e => update("schedule", e.target.checked)}
            className="rounded" style={{ accentColor: NAVY }} />
          <span className="text-xs font-medium" style={{ color: NAVY }}>Schedule for later</span>
        </label>
        {form.schedule && (
          <Input type="datetime-local" value={form.scheduled_at}
            onChange={e => update("scheduled_at", e.target.value)}
            className="h-9 text-xs rounded-xl flex-1 max-w-xs" style={{ borderColor: "rgba(10,36,114,0.12)" }} />
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSend} disabled={sending}
          className="text-xs rounded-xl h-9" style={{ background: NAVY }}>
          {sending ? <Loader2 size={14} className="animate-spin mr-1" /> : <Send size={14} className="mr-1" />}
          {sending ? "Sending..." : form.schedule ? "Schedule" : "Send"}
        </Button>
        <Button variant="outline" onClick={handleSaveDraft} disabled={saving}
          className="text-xs rounded-xl h-9">
          <Save size={14} className="mr-1" />
          {saving ? "Saving..." : "Save Draft"}
        </Button>
      </div>
    </div>
  );
}

// ─── Message Detail Drawer ────────────────────────────────────────
function MessageDetail({ msg, onClose, onResend }: { msg: Message | null; onClose: () => void; onResend?: (id: string) => void }) {
  if (!msg) return null;

  const ChannelIcon = channelIcons[msg.channel] || MessageSquare;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="fixed inset-0 bg-black/30" />
      <div className="relative bg-white w-full max-w-lg h-full overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: NAVY }}>Message Detail</h3>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={16} /></button>
          </div>

          <div className="flex gap-2 mb-4">
            <StatusBadge status={msg.status} />
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <ChannelIcon size={12} /> {channelLabels[msg.channel]}
            </Badge>
          </div>

          <div className="space-y-3 text-sm mb-4">
            <div><span className="text-xs font-medium block" style={{ color: MUTED }}>Subject</span><span style={{ color: NAVY }}>{msg.subject}</span></div>
            <div><span className="text-xs font-medium block" style={{ color: MUTED }}>Created</span><span style={{ color: NAVY }}>{formatDate(msg.created_at)}</span></div>
            {msg.scheduled_at && <div><span className="text-xs font-medium block" style={{ color: MUTED }}>Scheduled</span><span style={{ color: NAVY }}>{formatDate(msg.scheduled_at)}</span></div>}
            {msg.sent_at && <div><span className="text-xs font-medium block" style={{ color: MUTED }}>Sent</span><span style={{ color: NAVY }}>{formatDate(msg.sent_at)}</span></div>}
          </div>

          {msg.recipientSummary && (
            <div className="flex gap-3 mb-4">
              <div className="flex-1 p-3 rounded-xl text-center" style={{ background: "#D1FAE5" }}>
                <p className="text-lg font-bold text-green-700">{msg.recipientSummary.sent}</p>
                <p className="text-xs text-green-600">Sent</p>
              </div>
              <div className="flex-1 p-3 rounded-xl text-center" style={{ background: "#FEF2F2" }}>
                <p className="text-lg font-bold text-red-700">{msg.recipientSummary.failed}</p>
                <p className="text-xs text-red-600">Failed</p>
              </div>
              <div className="flex-1 p-3 rounded-xl text-center" style={{ background: "#FEF9C3" }}>
                <p className="text-lg font-bold text-yellow-700">{msg.recipientSummary.pending}</p>
                <p className="text-xs text-yellow-600">Pending</p>
              </div>
              <div className="flex-1 p-3 rounded-xl text-center" style={{ background: "rgba(10,36,114,0.05)" }}>
                <p className="text-lg font-bold" style={{ color: NAVY }}>{msg.recipientSummary.total}</p>
                <p className="text-xs" style={{ color: MUTED }}>Total</p>
              </div>
            </div>
          )}

          {onResend && msg.recipientSummary && msg.recipientSummary.failed > 0 && (
            <Button size="sm" variant="outline" onClick={() => onResend(msg.id)} className="text-xs mb-4 rounded-xl">
              <RefreshCw size={12} className="mr-1" /> Resend Failed ({msg.recipientSummary.failed})
            </Button>
          )}

          <div className="mb-4">
            <p className="text-xs font-medium mb-1" style={{ color: MUTED }}>Body</p>
            <div className="text-sm p-3 rounded-xl whitespace-pre-wrap" style={{ background: "rgba(10,36,114,0.03)", color: NAVY, border: "1px solid rgba(10,36,114,0.07)" }}>
              {msg.body}
            </div>
          </div>

          {msg.recipients && msg.recipients.length > 0 && (
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: MUTED }}>Recipients ({msg.recipients.length})</p>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {msg.recipients.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-2 rounded-lg text-xs"
                    style={{ background: "rgba(10,36,114,0.02)", border: "1px solid rgba(10,36,114,0.06)" }}>
                    <div>
                      <span style={{ color: NAVY }}>{r.recipient_name || r.recipient_contact || "—"}</span>
                      <span className="ml-2" style={{ color: MUTED }}>({r.recipient_type})</span>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Messages Tab ─────────────────────────────────────────────────
function MessagesTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const limit = 20;

  const fetch = useCallback(async (p: number) => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(limit) });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await api.get<{ records: Message[]; total: number }>(`/school/communications?${params}`);
      if (res.error) { setError(res.error); return; }
      if (res.data) { setMessages(res.data.records); setTotal(res.data.total); setPage(p); }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { fetch(1); }, []);

  useEffect(() => { const t = setTimeout(() => fetch(1), 400); return () => clearTimeout(t); }, [search, statusFilter]);

  const openDetail = async (msg: Message) => {
    const res = await api.get<Message>(`/school/communications/${msg.id}`);
    if (res.data) setSelected(res.data); else setSelected(msg);
  };

  const handleResend = async (id: string) => {
    const res = await api.post<Message>(`/school/communications/${id}/resend`, {});
    if (res.data) { setSelected(res.data); fetch(page); }
  };

  const totalPages = Math.ceil(total / limit);
  const pageNumbers: number[] = [];
  if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pageNumbers.push(i); }
  else if (page <= 4) { for (let i = 1; i <= 7; i++) pageNumbers.push(i); }
  else if (page >= totalPages - 3) { for (let i = totalPages - 6; i <= totalPages; i++) pageNumbers.push(i); }
  else { for (let i = page - 3; i <= page + 3; i++) pageNumbers.push(i); }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..."
            className="pl-9 h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[120px] h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <LoadingSpinner height={200} /> : error ? (
        <div className="text-center py-12">
          <AlertCircle size={32} color="#EF4444" className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => fetch(page)}>Retry</Button>
        </div>
      ) : messages.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No messages yet" desc="Sent messages and scheduled broadcasts will appear here." />
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "rgba(10,36,114,0.07)", background: "white" }}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>Subject</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>Channel</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>Status</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>Recipients</TableHead>
                  <TableHead className="text-xs font-semibold" style={{ color: NAVY }}>Date</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map(m => {
                  const ChIcon = channelIcons[m.channel] || MessageSquare;
                  const sum = m.recipientSummary;
                  return (
                    <TableRow key={m.id} className="cursor-pointer hover:bg-[rgba(10,36,114,0.02)]" onClick={() => openDetail(m)}>
                      <TableCell className="text-xs font-medium" style={{ color: NAVY }}>{m.subject}</TableCell>
                      <TableCell><Badge variant="outline" className="flex items-center gap-1 text-xs w-fit"><ChIcon size={11} /> {channelLabels[m.channel]}</Badge></TableCell>
                      <TableCell><StatusBadge status={m.status} /></TableCell>
                      <TableCell className="text-xs" style={{ color: MUTED }}>
                        {sum ? `${sum.sent}/${sum.total}` : "—"}
                      </TableCell>
                      <TableCell className="text-xs" style={{ color: MUTED }}>{formatDate(m.created_at)}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" className="h-7 w-7"><Eye size={14} style={{ color: MUTED }} /></Button></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs" style={{ color: MUTED }}>{(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetch(page - 1)} className="h-8 w-8 p-0"><ChevronLeft size={14} /></Button>
                {pageNumbers.map(pn => (
                  <Button key={pn} variant={pn === page ? "default" : "outline"} size="sm" onClick={() => fetch(pn)}
                    className="h-8 w-8 p-0 text-xs" style={pn === page ? { background: NAVY } : {}}>{pn}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => fetch(page + 1)} className="h-8 w-8 p-0"><ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </>
      )}

      {selected && <MessageDetail msg={selected} onClose={() => setSelected(null)} onResend={handleResend} />}
    </div>
  );
}

// ─── Templates Tab ─────────────────────────────────────────────────
function TemplatesTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ open: boolean; edit?: Template }>({ open: false });
  const [form, setForm] = useState({ name: "", subject: "", body: "", channel: "any", category: "general" });
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = categoryFilter !== "all" ? `?category=${categoryFilter}` : "";
      const res = await api.get<Template[]>(`/school/communications/templates/list${params}`);
      if (res.data) setTemplates(res.data);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, [categoryFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => { setForm({ name: "", subject: "", body: "", channel: "any", category: "general" }); setDialog({ open: true }); };
  const openEdit = (t: Template) => { setForm({ name: t.name, subject: t.subject || "", body: t.body, channel: t.channel, category: t.category }); setDialog({ open: true, edit: t }); };

  const handleSave = async () => {
    if (!form.name.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      if (dialog.edit) {
        await api.put(`/school/communications/templates/${dialog.edit.id}`, form);
      } else {
        await api.post("/school/communications/templates", form);
      }
      setDialog({ open: false });
      fetch();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    await api.delete(`/school/communications/templates/${id}`);
    fetch();
  };

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}
      <div className="flex items-center gap-2 mb-4">
        <Button size="sm" onClick={openCreate} className="text-xs rounded-xl h-9" style={{ background: NAVY }}>
          <Plus size={14} className="mr-1" /> New Template
        </Button>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[140px] h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="academic">Academic</SelectItem>
            <SelectItem value="fee">Fee</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? <LoadingSpinner height={200} /> : templates.length === 0 ? (
        <EmptyState icon={FileText} title="No templates" desc="Create a template to reuse message formats." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map(t => (
            <div key={t.id} className="p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold" style={{ color: NAVY }}>{t.name}</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                    <Badge variant="outline" className="text-[10px]">{t.channel === "any" ? "Multi" : channelLabels[t.channel]}</Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Edit3 size={12} /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(t.id)}><Trash2 size={12} style={{ color: "#EF4444" }} /></Button>
                </div>
              </div>
              {t.subject && <p className="text-xs mb-1" style={{ color: MUTED }}><span className="font-medium">Subject:</span> {t.subject}</p>}
              <p className="text-xs leading-relaxed line-clamp-3" style={{ color: MUTED }}>{t.body}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialog.open} onOpenChange={(v) => !v && setDialog({ open: false })}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ color: NAVY }}>{dialog.edit ? "Edit Template" : "New Template"}</DialogTitle>
            <DialogDescription style={{ color: MUTED }}>Create a reusable message template.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Name</label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Channel</label>
                <Select value={form.channel} onValueChange={v => setForm(p => ({ ...p, channel: v }))}>
                  <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Category</label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="fee">Fee</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Subject (for email)</label>
              <Input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Body</label>
              <Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={5}
                className="text-sm rounded-xl resize-y" style={{ borderColor: "rgba(10,36,114,0.12)" }} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm" className="text-xs rounded-xl">Cancel</Button></DialogClose>
            <Button size="sm" onClick={handleSave} disabled={saving}
              className="text-xs rounded-xl" style={{ background: NAVY }}>
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              {dialog.edit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Announcements Tab ────────────────────────────────────────────
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", channel: "in_app", schedule: false, scheduled_at: "" });
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<{ records: Announcement[] }>("/school/communications/announcements/list?limit=50");
      if (res.data) setAnnouncements(res.data.records);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setSaving(true);
    try {
      const body: any = { title: form.title, body: form.body, channel: form.channel };
      if (form.schedule && form.scheduled_at) body.scheduled_at = new Date(form.scheduled_at).toISOString();
      const res = await api.post("/school/communications/announcements", body);
      if (!res.error) { setShowCreate(false); setForm({ title: "", body: "", channel: "in_app", schedule: false, scheduled_at: "" }); fetch(); }
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handlePublish = async (id: string) => {
    await api.put(`/school/communications/announcements/${id}/publish`, {});
    fetch();
  };

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError(null)} />}

      <Button size="sm" onClick={() => setShowCreate(true)} className="text-xs rounded-xl h-9 mb-4" style={{ background: NAVY }}>
        <Megaphone size={14} className="mr-1" /> New Announcement
      </Button>

      {loading ? <LoadingSpinner height={200} /> : announcements.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" desc="Broadcast announcements to parents, staff, and students." />
      ) : (
        <div className="space-y-3">
          {announcements.map(a => (
            <div key={a.id} className="p-4 rounded-2xl flex items-start justify-between"
              style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold" style={{ color: NAVY }}>{a.title}</p>
                  <StatusBadge status={a.status} />
                  <Badge variant="outline" className="text-[10px]">{channelLabels[a.channel]}</Badge>
                </div>
                <p className="text-xs line-clamp-2" style={{ color: MUTED }}>{a.body}</p>
                <div className="flex gap-3 mt-1">
                  <span className="text-[10px]" style={{ color: MUTED }}>Created {formatDate(a.created_at)}</span>
                  {a.published_at && <span className="text-[10px]" style={{ color: MUTED }}>Published {formatDate(a.published_at)}</span>}
                  {a.scheduled_at && <span className="text-[10px]" style={{ color: MUTED }}>Scheduled {formatDate(a.scheduled_at)}</span>}
                </div>
              </div>
              {a.status === "draft" && (
                <Button size="sm" variant="outline" onClick={() => handlePublish(a.id)}
                  className="text-xs rounded-xl ml-3 shrink-0">
                  <Send size={12} className="mr-1" /> Publish
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ color: NAVY }}>New Announcement</DialogTitle>
            <DialogDescription style={{ color: MUTED }}>Broadcast to all parents, staff, and students.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Title</label>
              <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Channel</label>
              <Select value={form.channel} onValueChange={v => setForm(p => ({ ...p, channel: v }))}>
                <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_app">In-App</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Body</label>
              <Textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={5}
                className="text-sm rounded-xl resize-y" style={{ borderColor: "rgba(10,36,114,0.12)" }} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.schedule} onChange={e => setForm(p => ({ ...p, schedule: e.target.checked }))}
                className="rounded" style={{ accentColor: NAVY }} />
              <span className="text-xs font-medium" style={{ color: NAVY }}>Schedule</span>
            </label>
            {form.schedule && (
              <Input type="datetime-local" value={form.scheduled_at}
                onChange={e => setForm(p => ({ ...p, scheduled_at: e.target.value }))}
                className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(10,36,114,0.12)" }} />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline" size="sm" className="text-xs rounded-xl">Cancel</Button></DialogClose>
            <Button size="sm" onClick={handleCreate} disabled={saving}
              className="text-xs rounded-xl" style={{ background: NAVY }}>
              {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────
export function Communication() {
  const [stats, setStats] = useState<Stats | null>(null);

  const refreshStats = useCallback(async () => {
    const res = await api.get<Stats>("/school/communications/stats");
    if (res.data) setStats(res.data);
  }, []);

  useEffect(() => { refreshStats(); }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold" style={{ color: NAVY }}>Communication Center</h1>
          <p className="text-xs mt-1" style={{ color: MUTED }}>Send messages, manage templates, and broadcast announcements</p>
        </div>
      </div>

      {stats && (
        <div className="flex flex-wrap gap-3 mb-6">
          <MetricCard icon={Send} label="Sent" value={stats.messages.sent} color="#16A34A" />
          <MetricCard icon={Clock} label="Scheduled" value={stats.messages.scheduled} color="#3B82F6" />
          <MetricCard icon={FileText} label="Drafts" value={stats.messages.draft} color="#6B7280" />
          <MetricCard icon={FileText} label="Templates" value={stats.templates} color="#8B5CF6" />
          <MetricCard icon={Megaphone} label="Announcements" value={stats.announcements.total} color="#F59E0B" />
        </div>
      )}

      <div className="rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <Tabs defaultValue="compose" className="p-1">
          <TabsList className="mx-4 mt-3 mb-2 flex-wrap h-auto gap-1" style={{ background: "rgba(10,36,114,0.03)" }}>
            <TabsTrigger value="compose" className="text-xs rounded-lg data-[state=active]:bg-white">
              <Send size={14} className="mr-1" /> Compose
            </TabsTrigger>
            <TabsTrigger value="sent" className="text-xs rounded-lg data-[state=active]:bg-white">
              <MessageSquare size={14} className="mr-1" /> Sent
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs rounded-lg data-[state=active]:bg-white">
              <FileText size={14} className="mr-1" /> Templates
            </TabsTrigger>
            <TabsTrigger value="announcements" className="text-xs rounded-lg data-[state=active]:bg-white">
              <Megaphone size={14} className="mr-1" /> Announcements
            </TabsTrigger>
          </TabsList>

          <div className="p-4">
            <TabsContent value="compose"><ComposeTab onSent={refreshStats} /></TabsContent>
            <TabsContent value="sent"><MessagesTab /></TabsContent>
            <TabsContent value="templates"><TemplatesTab /></TabsContent>
            <TabsContent value="announcements"><AnnouncementsTab /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
