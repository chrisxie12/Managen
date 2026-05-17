import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Send,
  ShieldAlert,
  Smartphone,
  Wallet,
  X,
} from "lucide-react";

type Risk = "high" | "med" | "low";
type Channel = "whatsapp" | "sms" | "email" | "chain";
type ScheduleChoice = "now" | "6pm" | "tomorrow";

type Student = {
  id: number;
  name: string;
  className: string;
  parent: string;
  parentEmail: string;
  parentPhone: string;
  balance: number;
  days: number;
  risk: Risk;
  whatsapp: boolean;
  sms: boolean;
  email: boolean;
};

type Activity = {
  id: number;
  time: string;
  color: string;
  text: string;
};

type Toast = {
  id: number;
  title: string;
  subtitle: string;
  tone: "success" | "warning" | "info";
};

const students: Student[] = [];

const initialActivities: Activity[] = [];

const formatGhs = (value: number) => `GHS ${value.toLocaleString()}`;

const riskMeta: Record<Risk, { label: string; color: string; bg: string }> = {
  high: { label: "High", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  med: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  low: { label: "Low", color: "#00e5a0", bg: "rgba(0,229,160,0.12)" },
};

const channelLabel: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
  chain: "full reminder chain",
};

function daysBadge(days: number) {
  if (days <= 5) return { label: `${days} days`, color: "#00e5a0", bg: "rgba(0,229,160,0.12)" };
  if (days <= 14) return { label: `${days} days`, color: "#f59e0b", bg: "rgba(245,158,11,0.12)" };
  if (days <= 30) return { label: `${days} days`, color: "#ef4444", bg: "rgba(239,68,68,0.12)" };
  return { label: `${days} days`, color: "#fca5a5", bg: "rgba(239,68,68,0.25)" };
}

export function SmartFeeReminders() {
  const selectAllRef = useRef<HTMLInputElement>(null);
  const sendNowButtonRef = useRef<HTMLButtonElement>(null);
  const modalCloseButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "high" | "overdue" | "due-soon">("all");
  const [search, setSearch] = useState("");
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleChoice>("now");
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activities, setActivities] = useState(initialActivities);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [autoChain, setAutoChain] = useState(true);
  const [portalBlock, setPortalBlock] = useState(true);
  const [excludePaid, setExcludePaid] = useState(true);

  const filteredStudents = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch =
        !needle ||
        student.name.toLowerCase().includes(needle) ||
        student.parent.toLowerCase().includes(needle);
      const matchesFilter =
        filter === "all" ||
        (filter === "high" && student.risk === "high") ||
        (filter === "overdue" && student.days > 14) ||
        (filter === "due-soon" && student.days <= 7);
      return matchesSearch && matchesFilter;
    });
  }, [filter, search]);

  const selectedCount = selectedIds.size;
  const visibleSelectedCount = filteredStudents.filter((student) => selectedIds.has(student.id)).length;
  const allVisibleSelected = filteredStudents.length > 0 && visibleSelectedCount === filteredStudents.length;
  const someVisibleSelected = visibleSelectedCount > 0 && !allVisibleSelected;
  const sendCount = selectedCount || students.length;
  const totalDue = students.reduce((sum, student) => sum + student.balance, 0);
  const highRiskCount = students.filter((student) => student.risk === "high").length;
  const overdueCount = students.filter((student) => student.days > 14).length;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, filteredStudents.length]);

  useEffect(() => {
    if (!sendModalOpen) return;

    modalCloseButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !sending) setSendModalOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      sendNowButtonRef.current?.focus();
    };
  }, [sendModalOpen, sending]);

  const pushToast = (title: string, subtitle: string, tone: Toast["tone"] = "success") => {
    const id = Date.now();
    setToasts((current) => [...current, { id, title, subtitle, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  };

  const addActivity = (text: string, color = "#00e5a0") => {
    setActivities((current) => [
      { id: Date.now(), time: "just now", color, text },
      ...current.slice(0, 7),
    ]);
  };

  const toggleStudent = (id: number) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAllFiltered = (checked: boolean) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      filteredStudents.forEach((student) => {
        if (checked) next.add(student.id);
        else next.delete(student.id);
      });
      return next;
    });
  };

  const sendOne = (student: Student) => {
    pushToast("Reminder sent", `${student.name} - ${formatGhs(student.balance)}`);
    addActivity(`WhatsApp reminder sent to ${student.parent} - ${student.name} - ${formatGhs(student.balance)}`, "#25d366");
  };

  const bulkAction = (channel: Channel) => {
    const count = selectedIds.size;
    if (!count) {
      pushToast("Select students first", "Choose at least one student before sending.", "warning");
      return;
    }

    pushToast(`Sending ${channelLabel[channel]}`, `To ${count} selected students`, "info");
    addActivity(`${channelLabel[channel]} reminder sent to ${count} students`);
    setSelectedIds(new Set());
  };

  const executeSend = () => {
    const countAtStart = sendCount;
    setSending(true);
    setProgress(0);

    const interval = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + 8, 100);
        if (next >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            setSending(false);
            setSendModalOpen(false);
            setProgress(0);
            setSelectedIds(new Set());
            pushToast("Reminders dispatched", `Chain started for ${countAtStart} students`);
            addActivity(`Bulk reminder chain started for ${countAtStart} students`);
          }, 120);
        }
        return next;
      });
    }, 80);
  };

  return (
    <div className="min-h-full rounded-[28px] bg-[#0d0f14] text-[#f0f2f8] shadow-2xl overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-white/10 bg-[#14171f] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Smart Fee Reminders</h2>
              <p className="text-xs text-[#8b90a8]">Fallback chains, MoMo links, and high-risk follow-up in one view.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => pushToast("Schedule configured", "Reminders will run daily at 6:00 PM", "info")} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-[#8b90a8] hover:bg-white/5">
                <Clock size={14} /> Schedule reminders
              </button>
              <button ref={sendNowButtonRef} type="button" onClick={() => setSendModalOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#00e5a0] px-3 py-2 text-xs font-bold text-black hover:bg-[#00ffb3]">
                <Send size={14} /> Send now
              </button>
            </div>
      </header>

      <div className="space-y-5 p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total fees due" value={formatGhs(totalDue)} sub={`${students.length} students in reminder queue`} tone="#00e5a0" icon={Wallet} />
              <StatCard label="Collected via MoMo" value="GHS 0" sub="No data yet" tone="#ffcc00" icon={CreditCard} />
              <StatCard label="Outstanding balance" value={formatGhs(totalDue)} sub={`${students.length} students pending`} tone="#f59e0b" icon={Bell} />
              <StatCard label="High-risk defaulters" value={String(highRiskCount)} sub={`${overdueCount} overdue 14+ days`} tone="#ef4444" icon={ShieldAlert} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
              <div className="space-y-3 min-w-0">
                {selectedCount > 0 && (
                  <div className="flex flex-col gap-3 rounded-xl border border-[#00e5a0]/25 bg-[#00e5a0]/10 p-3 sm:flex-row sm:items-center">
                    <div className="flex-1 text-sm text-[#8b90a8]">
                      <span className="font-bold text-[#00e5a0]">{selectedCount}</span> students selected
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <BulkButton onClick={() => bulkAction("whatsapp")} icon={MessageCircle} label="WhatsApp" />
                      <BulkButton onClick={() => bulkAction("sms")} icon={Smartphone} label="SMS" />
                      <BulkButton onClick={() => bulkAction("email")} icon={Mail} label="Email" />
                      <button type="button" onClick={() => bulkAction("chain")} className="inline-flex items-center gap-2 rounded-lg bg-[#00e5a0] px-3 py-2 text-xs font-bold text-black">
                        <Send size={13} /> Full chain
                      </button>
                    </div>
                  </div>
                )}

                <section className="overflow-hidden rounded-xl border border-white/10 bg-[#14171f]">
                  <div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h3 className="font-semibold">Outstanding fees</h3>
                      <p className="text-xs text-[#555a72]">{filteredStudents.length} of {students.length} students shown</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-white/10 bg-[#1c2030] px-3 py-2">
                        <Search size={14} className="text-[#555a72]" />
                        <input
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search student or parent..."
                          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[#555a72]"
                        />
                      </div>
                      {[
                        ["all", "All"],
                        ["high", "High risk"],
                        ["overdue", "Overdue"],
                        ["due-soon", "Due soon"],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setFilter(value as typeof filter)}
                          className={`rounded-full border px-3 py-2 text-xs transition ${
                            filter === value ? "border-[#00e5a0] bg-[#00e5a0]/10 text-[#00e5a0]" : "border-white/15 text-[#8b90a8] hover:bg-white/5"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-wider text-[#555a72]">
                          <th className="px-4 py-3">
                            <input
                              ref={selectAllRef}
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={(event) => toggleAllFiltered(event.target.checked)}
                              aria-label="Select all visible students"
                              className="h-4 w-4 accent-[#00e5a0]"
                            />
                          </th>
                          <th className="px-4 py-3">Student</th>
                          <th className="px-4 py-3">Balance</th>
                          <th className="px-4 py-3">Days overdue</th>
                          <th className="px-4 py-3">Risk</th>
                          <th className="px-4 py-3">Channels</th>
                          <th className="px-4 py-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                          <StudentRow
                            key={student.id}
                            student={student}
                            selected={selectedIds.has(student.id)}
                            onToggle={() => toggleStudent(student.id)}
                            onSend={() => sendOne(student)}
                          />
                        )) : (
                          <tr>
                            <td colSpan={7} className="px-4 py-10 text-center">
                              <div className="mx-auto max-w-sm">
                                <p className="font-semibold text-white">No students match this view</p>
                                <p className="mt-1 text-sm text-[#8b90a8]">Clear the search or switch filters to see the reminder queue again.</p>
                                <button type="button" onClick={() => {
                                  setSearch("");
                                  setFilter("all");
                                }} className="mt-4 rounded-lg border border-white/15 px-3 py-2 text-xs text-[#8b90a8] hover:bg-white/5">
                                  Reset filters
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-xl border border-white/10 bg-[#14171f]">
                  <div className="flex items-center justify-between border-b border-white/10 p-4">
                    <h3 className="font-semibold">Recent reminder activity</h3>
                    <span className="rounded-full bg-[#00e5a0]/10 px-2 py-1 text-xs text-[#00e5a0]">Live</span>
                  </div>
                  <div className="divide-y divide-white/10 px-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 py-3 text-sm">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: activity.color }} />
                        <p className="flex-1 text-[#8b90a8]">{activity.text}</p>
                        <span className="shrink-0 text-xs text-[#555a72]">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="space-y-4 min-w-0">
                <section className="rounded-xl border border-white/10 bg-[#14171f] p-5">
                  <h3 className="mb-4 font-semibold">Reminder fallback chain</h3>
                  <div className="space-y-4">
                    <ChainStep icon="W" color="#25d366" title="WhatsApp message + MoMo link" desc="Student name, balance, deadline, and one-tap payment link." trigger="Immediate if WhatsApp is active" />
                    <ChainStep icon="S" color="#f59e0b" title="SMS fallback" desc="Short message with payment shortcode if WhatsApp is not delivered." trigger="+2 hours if undelivered" />
                    <ChainStep icon="E" color="#6366f1" title="Email reminder" desc="Formal note with fee breakdown attached." trigger="+24 hours if SMS undelivered" />
                    <ChainStep icon="!" color="#ef4444" title="Portal access suspended" desc="Results viewing blocked with admin override available." trigger="Day 30 if unpaid" />
                  </div>

                  <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
                    <ToggleRow label="Auto-chain enabled" checked={autoChain} onChange={setAutoChain} />
                    <SettingRow label="Send time" value="6:00 PM daily" />
                    <ToggleRow label="Block portal at 30 days" checked={portalBlock} onChange={setPortalBlock} />
                    <ToggleRow label="Exclude paid this week" checked={excludePaid} onChange={setExcludePaid} />
                  </div>
                </section>

                <section className="rounded-xl border border-white/10 bg-[#14171f] p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#ffcc00]/25 bg-[#ffcc00]/10 text-[#ffcc00]">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold">MoMo payment link preview</h3>
                      <p className="text-xs text-[#555a72]">Paystack + MTN checkout</p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-[#1c2030] p-4 text-sm">
                    <p className="text-xs text-[#555a72] text-center py-6">Select a student above to preview their payment link.</p>
                  </div>
                </section>

                <section className="rounded-xl border border-[#25d366]/20 bg-[#0f1a14] p-4">
                  <div className="mb-3 flex items-center gap-3 border-b border-white/10 pb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#25d366] text-sm font-bold text-white">S</div>
                    <div>
                      <p className="text-sm font-semibold">WhatsApp preview</p>
                      <p className="text-xs text-[#25d366]">Select a student to preview</p>
                    </div>
                  </div>
                  <div className="rounded-xl rounded-tl-none bg-[#1f2d23] p-3 text-sm leading-6 text-[#8b90a8]">
                    <p className="py-4 text-center">No student selected.</p>
                  </div>
                </section>
              </aside>
            </div>
      </div>

      {sendModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !sending) setSendModalOpen(false);
        }}>
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="send-reminders-title"
            className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#14171f] p-6 text-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 id="send-reminders-title" className="text-lg font-bold">Send fee reminders</h3>
                <p className="mt-1 text-sm text-[#8b90a8]">Preview and start the fallback chain for {sendCount} students.</p>
              </div>
              <button ref={modalCloseButtonRef} type="button" disabled={sending} onClick={() => setSendModalOpen(false)} className="rounded-lg p-1 text-[#8b90a8] hover:bg-white/5 disabled:opacity-50" aria-label="Close send reminders dialog">
                <X size={18} />
              </button>
            </div>

            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wider text-[#555a72]">Channels</p>
                <div className="grid grid-cols-3 gap-2">
                  <ChannelButton active icon={MessageCircle} label="WhatsApp" color="#25d366" />
                  <ChannelButton active icon={Phone} label="SMS" color="#f59e0b" />
                  <ChannelButton active icon={Mail} label="Email" color="#6366f1" />
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wider text-[#555a72]">Message preview</p>
                <div className="whitespace-pre-line rounded-lg border border-white/10 bg-[#1c2030] p-4 text-sm leading-6 text-[#8b90a8]">
                  Dear [Parent name],

                  This is a reminder that [Student name] has an outstanding balance of GHS [Amount] due by [Deadline].

                  Pay instantly with MTN MoMo: pay.getschoolos.me/[unique-link]
                </div>
              </div>

              <div>
                <p className="mb-2 text-[11px] uppercase tracking-wider text-[#555a72]">Schedule</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["now", "Send now"],
                    ["6pm", "6PM today"],
                    ["tomorrow", "Tomorrow"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSchedule(value as ScheduleChoice)}
                      className={`rounded-lg border px-3 py-2 text-xs ${
                        schedule === value ? "border-[#00e5a0] bg-[#00e5a0]/10 text-[#00e5a0]" : "border-white/15 text-[#8b90a8]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {sending && (
                <div className="h-1 overflow-hidden rounded-full bg-[#242840]">
                  <div className="h-full rounded-full bg-[#00e5a0] transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <button type="button" disabled={sending} onClick={() => setSendModalOpen(false)} className="rounded-lg border border-white/15 px-3 py-3 text-sm text-[#8b90a8] disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" disabled={sending} onClick={executeSend} className="col-span-2 rounded-lg bg-[#00e5a0] px-3 py-3 text-sm font-bold text-black disabled:opacity-70">
                  {sending ? "Sending..." : `Send to ${sendCount} students`}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <div className="fixed bottom-5 right-5 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className="flex items-start gap-3 rounded-xl border border-white/15 bg-[#1c2030] p-4 text-sm text-white shadow-2xl">
            <ToastIcon tone={toast.tone} />
            <div>
              <p className="font-semibold">{toast.title}</p>
              <p className="mt-0.5 text-xs text-[#8b90a8]">{toast.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, tone, icon: Icon }: { label: string; value: string; sub: string; tone: string; icon: typeof Wallet }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#14171f] p-5">
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: tone }} />
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[#555a72]">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-[#555a72]">{sub}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `${tone}20`, color: tone }}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function StudentRow({ student, selected, onToggle, onSend }: { student: Student; selected: boolean; onToggle: () => void; onSend: () => void }) {
  const days = daysBadge(student.days);
  const risk = riskMeta[student.risk];

  return (
    <tr className={`border-b border-white/10 text-sm transition hover:bg-white/[0.03] ${selected ? "bg-[#00e5a0]/5" : ""}`} onClick={onToggle}>
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Select ${student.name}`}
          className="h-4 w-4 accent-[#00e5a0]"
        />
      </td>
      <td className="px-4 py-3">
        <p className="font-semibold text-white">{student.name}</p>
        <p className="text-xs text-[#555a72]">{student.className} - {student.parent}</p>
      </td>
      <td className={`px-4 py-3 font-bold ${student.days > 14 ? "text-[#ef4444]" : "text-white"}`}>{formatGhs(student.balance)}</td>
      <td className="px-4 py-3">
        <span className="rounded-full px-2 py-1 text-xs font-semibold" style={{ background: days.bg, color: days.color }}>{days.label}</span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-semibold" style={{ background: risk.bg, color: risk.color }}>
          <span className="h-2 w-2 rounded-full" style={{ background: risk.color }} />
          {risk.label}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-1">
          <ChannelMark active={student.whatsapp} label="W" color="#25d366" title="WhatsApp" />
          <ChannelMark active={student.sms} label="S" color="#f59e0b" title="SMS" />
          <ChannelMark active={student.email} label="E" color="#6366f1" title="Email" />
        </div>
      </td>
      <td className="px-4 py-3">
        <button type="button" onClick={(event) => {
          event.stopPropagation();
          onSend();
        }} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-[#8b90a8] hover:bg-white/5">
          Send
        </button>
      </td>
    </tr>
  );
}

function ChannelMark({ active, label, color, title }: { active: boolean; label: string; color: string; title: string }) {
  return (
    <span title={title} className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-bold" style={{ background: active ? `${color}20` : "#242840", color: active ? color : "#555a72", opacity: active ? 1 : 0.55 }}>
      {label}
    </span>
  );
}

function BulkButton({ onClick, icon: Icon, label }: { onClick: () => void; icon: typeof MessageCircle; label: string }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-[#8b90a8] hover:bg-white/5">
      <Icon size={13} /> {label}
    </button>
  );
}

function ChainStep({ icon, color, title, desc, trigger }: { icon: string; color: string; title: string; desc: string; trigger: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-sm font-bold" style={{ background: `${color}20`, borderColor: `${color}40`, color }}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#8b90a8]">{desc}</p>
        <span className="mt-2 inline-block rounded bg-[#242840] px-2 py-1 text-[10px] text-[#8b90a8]">{trigger}</span>
      </div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-[#8b90a8]">{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-[#00e5a0]" : "bg-[#242840]"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function SettingRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-[#8b90a8]">{label}</span>
      <span className={highlight ? "font-bold text-[#ffcc00]" : "font-semibold text-white"}>{value}</span>
    </div>
  );
}

function ChannelButton({ active, icon: Icon, label, color }: { active: boolean; icon: typeof MessageCircle; label: string; color: string }) {
  return (
    <button type="button" className="rounded-lg border px-3 py-3 text-xs font-semibold" style={{ borderColor: active ? color : "rgba(255,255,255,0.15)", background: active ? `${color}20` : "transparent", color: active ? color : "#8b90a8" }}>
      <Icon size={15} className="mx-auto mb-1" />
      {label}
    </button>
  );
}

function ToastIcon({ tone }: { tone: Toast["tone"] }) {
  if (tone === "warning") return <AlertTriangle size={18} className="shrink-0 text-[#f59e0b]" />;
  if (tone === "info") return <CheckCircle2 size={18} className="shrink-0 text-[#6366f1]" />;
  return <Check size={18} className="shrink-0 text-[#00e5a0]" />;
}
