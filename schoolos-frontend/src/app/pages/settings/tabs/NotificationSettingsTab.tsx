import { useState, useEffect } from "react";
import { Save, Loader2, Send, Bell, Smartphone, Mail, MessageSquare, Check, Eye, EyeOff, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import { Checkbox } from "../../../components/ui/checkbox";
import { api } from "../../../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

const TRIGGER_EVENTS = [
  { slug: "student-marked-absent", label: "Student marked absent" },
  { slug: "fee-payment-received", label: "Fee payment received" },
  { slug: "fee-overdue-reminder", label: "Fee overdue reminder" },
  { slug: "grade-approved", label: "Grade approved" },
  { slug: "new-announcement", label: "New announcement" },
  { slug: "term-report-ready", label: "Term report ready" },
  { slug: "new-student-enrolled", label: "New student enrolled" },
  { slug: "password-reset", label: "Password reset" },
];

const TRIGGER_CHANNELS = [
  { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { key: "sms", label: "SMS", icon: Smartphone },
  { key: "email", label: "Email", icon: Mail },
  { key: "push", label: "Push", icon: Bell },
  { key: "in_app", label: "In-App", icon: Check },
];

const FEE_REMINDER_DAYS = [1, 3, 7, 14];

function getDefaultEmailSubject(slug: string): string {
  const subjects: Record<string, string> = {
    "student-marked-absent": "Attendance Alert",
    "fee-payment-received": "Payment Received",
    "fee-overdue-reminder": "Fee Overdue Reminder",
    "grade-approved": "Grade Approved",
    "new-announcement": "New Announcement",
    "term-report-ready": "Term Report Ready",
    "new-student-enrolled": "New Student Enrolled",
    "password-reset": "Password Reset",
  };
  return subjects[slug] || "Notification";
}

function getDefaultEmailBody(slug: string): string {
  const bodies: Record<string, string> = {
    "student-marked-absent": "{{student_name}} was marked absent on {{date}}. Please check the attendance dashboard for details.",
    "fee-payment-received": "A payment of {{amount}} has been received from {{student_name}}. Thank you for your prompt payment.",
    "fee-overdue-reminder": "This is a reminder that the fee payment for {{student_name}} is overdue. Please arrange payment at your earliest convenience.",
    "grade-approved": "The grade for {{student_name}} in {{subject}} has been approved. You can view the results in the gradebook.",
    "new-announcement": "A new announcement has been posted: {{announcement_title}}. Please check the announcements section for details.",
    "term-report-ready": "The term report for {{student_name}} is now available. Please log in to view the full report.",
    "new-student-enrolled": "A new student {{student_name}} has been enrolled at {{school_name}}.",
    "password-reset": "Your password for {{school_name}} has been reset successfully. If you did not request this change, please contact support immediately.",
  };
  return bodies[slug] || "";
}

function getDefaultSmsMessage(slug: string): string {
  const messages: Record<string, string> = {
    "student-marked-absent": "{{student_name}} was marked absent today.",
    "fee-payment-received": "Payment of {{amount}} received from {{student_name}}.",
    "fee-overdue-reminder": "Reminder: Fee payment for {{student_name}} is overdue. Please pay immediately.",
    "grade-approved": "{{student_name}}'s {{subject}} grade has been approved.",
    "new-announcement": "New announcement: {{announcement_title}}",
    "term-report-ready": "Term report for {{student_name}} is ready.",
    "new-student-enrolled": "{{student_name}} has been enrolled at {{school_name}}.",
    "password-reset": "Your password has been reset successfully.",
  };
  return messages[slug] || "";
}

const DEFAULT_EMAIL_TEMPLATES = Object.fromEntries(
  TRIGGER_EVENTS.map((e) => [
    e.slug,
    { subject: getDefaultEmailSubject(e.slug), body: getDefaultEmailBody(e.slug) },
  ])
);

const DEFAULT_SMS_TEMPLATES = Object.fromEntries(
  TRIGGER_EVENTS.map((e) => [
    e.slug,
    { message: getDefaultSmsMessage(e.slug) },
  ])
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

type Props = {
  profile: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<boolean>;
  saving: boolean;
  role: string;
};

const DEFAULT_CHANNELS = {
  whatsapp: { enabled: false, twilio_whatsapp_number: "" },
  sms: { enabled: false, africastalking: { api_key: "", username: "", sender_id: "" } },
  email: { enabled: false, from_email: "", from_name: "" },
  push: { enabled: false },
  in_app: { enabled: true },
};

const DEFAULT_TRIGGERS = Object.fromEntries(
  TRIGGER_EVENTS.map((e) => [e.slug, [] as string[]])
);

const DEFAULT_SCHEDULE = {
  fee_reminder_days: [] as number[],
  reminder_time: "09:00",
  attendance_alert_time: "10:00",
};

export function NotificationSettingsTab({ profile, onSave, saving, role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "headmaster" && role !== "admin";

  const [form, setForm] = useState<Record<string, any>>({
    notification_settings: {
      channels: DEFAULT_CHANNELS,
      triggers: DEFAULT_TRIGGERS,
      schedule: DEFAULT_SCHEDULE,
      email_templates: DEFAULT_EMAIL_TEMPLATES,
      sms_templates: DEFAULT_SMS_TEMPLATES,
    },
  });

  const [showTwilioNumber, setShowTwilioNumber] = useState(false);
  const [showATApiKey, setShowATApiKey] = useState(false);
  const [showATUsername, setShowATUsername] = useState(false);
  const [showATSenderId, setShowATSenderId] = useState(false);
  const [testing, setTesting] = useState(false);
  const [expandedEmailTemplate, setExpandedEmailTemplate] = useState<string | null>(null);
  const [expandedSmsTemplate, setExpandedSmsTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      const ns = profile.notification_settings || {};
      const ch = ns.channels || {};
      const emailTemplates = { ...DEFAULT_EMAIL_TEMPLATES, ...(ns.email_templates || {}) };
      const smsTemplates = { ...DEFAULT_SMS_TEMPLATES, ...(ns.sms_templates || {}) };
      setForm({
        notification_settings: {
          channels: {
            whatsapp: { ...DEFAULT_CHANNELS.whatsapp, ...(ch.whatsapp || {}) },
            sms: {
              ...DEFAULT_CHANNELS.sms,
              ...(ch.sms || {}),
              africastalking: {
                ...DEFAULT_CHANNELS.sms.africastalking,
                ...((ch.sms && ch.sms.africastalking) || {}),
              },
            },
            email: { ...DEFAULT_CHANNELS.email, ...(ch.email || {}) },
            push: { ...DEFAULT_CHANNELS.push, ...(ch.push || {}) },
            in_app: { ...DEFAULT_CHANNELS.in_app, ...(ch.in_app || {}) },
          },
          triggers: { ...DEFAULT_TRIGGERS, ...(ns.triggers || {}) },
          schedule: { ...DEFAULT_SCHEDULE, ...(ns.schedule || {}) },
          email_templates: emailTemplates,
          sms_templates: smsTemplates,
        },
      });
    }
  }, [profile]);

  const ns = form.notification_settings || {};
  const channels = ns.channels || {};
  const triggers = ns.triggers || {};
  const schedule = ns.schedule || {};

  const toggleChannel = (channel: string) => (checked: boolean) => {
    if (channel === "in_app") return;
    setForm((prev) => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        channels: {
          ...prev.notification_settings.channels,
          [channel]: {
            ...prev.notification_settings.channels[channel],
            enabled: checked,
          },
        },
      },
    }));
  };

  const setChannelField = (channel: string, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        channels: {
          ...prev.notification_settings.channels,
          [channel]: {
            ...prev.notification_settings.channels[channel],
            [field]: e.target.value,
          },
        },
      },
    }));
  };

  const setATField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        channels: {
          ...prev.notification_settings.channels,
          sms: {
            ...prev.notification_settings.channels.sms,
            africastalking: {
              ...(prev.notification_settings.channels.sms?.africastalking || {}),
              [field]: e.target.value,
            },
          },
        },
      },
    }));
  };

  const toggleTrigger = (eventSlug: string, channel: string) => {
    if (isReadOnly || channel === "in_app") return;
    setForm((prev) => {
      const t = { ...prev.notification_settings.triggers };
      const current: string[] = t[eventSlug] || [];
      t[eventSlug] = current.includes(channel)
        ? current.filter((c: string) => c !== channel)
        : [...current, channel];
      return {
        ...prev,
        notification_settings: {
          ...prev.notification_settings,
          triggers: t,
        },
      };
    });
  };

  const toggleFeeReminderDay = (day: number) => {
    if (isReadOnly) return;
    setForm((prev) => {
      const current: number[] = prev.notification_settings.schedule.fee_reminder_days || [];
      const next = current.includes(day)
        ? current.filter((d: number) => d !== day)
        : [...current, day];
      return {
        ...prev,
        notification_settings: {
          ...prev.notification_settings,
          schedule: {
            ...prev.notification_settings.schedule,
            fee_reminder_days: next,
          },
        },
      };
    });
  };

  const setScheduleField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        schedule: {
          ...prev.notification_settings.schedule,
          [field]: e.target.value,
        },
      },
    }));
  };

  const setEmailTemplateField = (slug: string, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    setForm((prev) => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        email_templates: {
          ...(prev.notification_settings.email_templates || {}),
          [slug]: {
            ...((prev.notification_settings.email_templates || {})[slug] || {}),
            [field]: e.target.value,
          },
        },
      },
    }));
  };

  const setSmsTemplateField = (slug: string) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    setForm((prev) => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        sms_templates: {
          ...(prev.notification_settings.sms_templates || {}),
          [slug]: {
            message: e.target.value,
          },
        },
      },
    }));
  };

  const resetEmailTemplate = (slug: string) => {
    if (isReadOnly) return;
    setForm((prev) => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        email_templates: {
          ...(prev.notification_settings.email_templates || {}),
          [slug]: { subject: getDefaultEmailSubject(slug), body: getDefaultEmailBody(slug) },
        },
      },
    }));
  };

  const resetSmsTemplate = (slug: string) => {
    if (isReadOnly) return;
    setForm((prev) => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        sms_templates: {
          ...(prev.notification_settings.sms_templates || {}),
          [slug]: { message: getDefaultSmsMessage(slug) },
        },
      },
    }));
  };

  const sendTestNotification = async () => {
    if (isReadOnly) return;
    setTesting(true);
    try {
      const res = await api.post("/api/school/settings/test-notification", {});
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Test notification sent successfully");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to send test notification");
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    const ok = await onSave({ notification_settings: form.notification_settings });
    if (ok) toast.success("Notification settings saved");
  };

  const disabledClass = isReadOnly ? "opacity-60 cursor-not-allowed" : "";

  const renderMaskedInput = (
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    show: boolean,
    toggleShow: () => void,
    placeholder = "",
  ) => (
    <div className="relative">
      <Input
        value={value}
        onChange={onChange}
        disabled={isReadOnly}
        type={show ? "text" : "password"}
        className={`h-9 text-sm rounded-xl w-full pr-9 ${disabledClass}`}
        style={{ borderColor: "rgba(56,25,50,0.12)" }}
        placeholder={placeholder}
      />
      <button type="button" onClick={toggleShow}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70" tabIndex={-1}>
        {show ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
      </button>
    </div>
  );

  return (
    <div>
      {/* CHANNELS */}
      <SectionCard title="Notification Channels" desc="Enable and configure notification delivery channels">

        <div className="mb-4 pb-4 border-b" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <MessageSquare size={15} color={MUTED} />
              <label className="text-xs font-medium cursor-pointer" style={{ color: PLUM }}>WhatsApp Notifications</label>
            </div>
            <Switch
              checked={channels.whatsapp?.enabled || false}
              onCheckedChange={toggleChannel("whatsapp")}
              disabled={isReadOnly}
            />
          </div>
          {channels.whatsapp?.enabled && (
            <div className="ml-6 pl-3 border-l-2 mt-2" style={{ borderColor: "rgba(56,25,50,0.1)" }}>
              <FormField label="Twilio WhatsApp Number">
                {renderMaskedInput(
                  channels.whatsapp?.twilio_whatsapp_number || "",
                  setChannelField("whatsapp", "twilio_whatsapp_number"),
                  showTwilioNumber,
                  () => setShowTwilioNumber(!showTwilioNumber),
                  "+14155238886"
                )}
              </FormField>
            </div>
          )}
        </div>

        <div className="mb-4 pb-4 border-b" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Smartphone size={15} color={MUTED} />
              <label className="text-xs font-medium cursor-pointer" style={{ color: PLUM }}>SMS Notifications</label>
            </div>
            <Switch
              checked={channels.sms?.enabled || false}
              onCheckedChange={toggleChannel("sms")}
              disabled={isReadOnly}
            />
          </div>
          {channels.sms?.enabled && (
            <div className="ml-6 pl-3 border-l-2 mt-2 space-y-3" style={{ borderColor: "rgba(56,25,50,0.1)" }}>
              <FormField label="Africa's Talking API Key">
                {renderMaskedInput(
                  channels.sms?.africastalking?.api_key || "",
                  setATField("api_key"),
                  showATApiKey,
                  () => setShowATApiKey(!showATApiKey),
                  "atsk_..."
                )}
              </FormField>
              <FormField label="Africa's Talking Username">
                {renderMaskedInput(
                  channels.sms?.africastalking?.username || "",
                  setATField("username"),
                  showATUsername,
                  () => setShowATUsername(!showATUsername),
                  "sandbox"
                )}
              </FormField>
              <FormField label="Sender ID">
                {renderMaskedInput(
                  channels.sms?.africastalking?.sender_id || "",
                  setATField("sender_id"),
                  showATSenderId,
                  () => setShowATSenderId(!showATSenderId),
                  "SCHOOL"
                )}
              </FormField>
            </div>
          )}
        </div>

        <div className="mb-4 pb-4 border-b" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Mail size={15} color={MUTED} />
              <label className="text-xs font-medium cursor-pointer" style={{ color: PLUM }}>Email Notifications</label>
            </div>
            <Switch
              checked={channels.email?.enabled || false}
              onCheckedChange={toggleChannel("email")}
              disabled={isReadOnly}
            />
          </div>
          {channels.email?.enabled && (
            <div className="ml-6 pl-3 border-l-2 mt-2 space-y-3" style={{ borderColor: "rgba(56,25,50,0.1)" }}>
              <FormField label="From Email">
                <Input
                  value={channels.email?.from_email || ""}
                  onChange={setChannelField("email", "from_email")}
                  disabled={isReadOnly}
                  className={`h-9 text-sm rounded-xl ${disabledClass}`}
                  style={{ borderColor: "rgba(56,25,50,0.12)" }}
                  placeholder="noreply@school.com"
                />
              </FormField>
              <FormField label="From Name">
                <Input
                  value={channels.email?.from_name || ""}
                  onChange={setChannelField("email", "from_name")}
                  disabled={isReadOnly}
                  className={`h-9 text-sm rounded-xl ${disabledClass}`}
                  style={{ borderColor: "rgba(56,25,50,0.12)" }}
                  placeholder="School Name"
                />
              </FormField>
            </div>
          )}
        </div>

        <div className="mb-4 pb-4 border-b" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Bell size={15} color={MUTED} />
              <label className="text-xs font-medium cursor-pointer" style={{ color: PLUM }}>Push Notifications</label>
            </div>
            <Switch
              checked={channels.push?.enabled || false}
              onCheckedChange={toggleChannel("push")}
              disabled={isReadOnly}
            />
          </div>
          {channels.push?.enabled && (
            <div className="ml-6 pl-3 border-l-2 mt-2" style={{ borderColor: "rgba(56,25,50,0.1)" }}>
              <p className="text-xs" style={{ color: MUTED }}>
                Push notifications are sent to the mobile app. Configure push notification settings in the mobile app configuration.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Check size={15} color={PLUM_LIGHT} />
            <label className="text-xs font-medium" style={{ color: PLUM }}>In-App Notifications</label>
          </div>
          <Switch checked disabled className="opacity-50" />
        </div>
        <p className="text-xs mt-1 ml-7" style={{ color: MUTED }}>
          Always enabled. Notifications appear inside the application.
        </p>
      </SectionCard>

      {/* NOTIFICATION TRIGGERS */}
      <SectionCard title="Notification Triggers" desc="Choose which events trigger notifications on each channel">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="text-left" style={{ color: MUTED }}>
                <th className="pb-2 pr-3 font-medium min-w-[160px]">Event</th>
                {TRIGGER_CHANNELS.map((ch) => (
                  <th key={ch.key} className="pb-2 pr-3 font-medium text-center">
                    <div className="flex flex-col items-center gap-1">
                      <ch.icon size={14} />
                      <span>{ch.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRIGGER_EVENTS.map((evt) => (
                <tr key={evt.slug} className="border-t" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                  <td className="py-2.5 pr-3 text-xs font-medium" style={{ color: PLUM }}>{evt.label}</td>
                  {TRIGGER_CHANNELS.map((ch) => {
                    const enabled = ch.key === "in_app" ? true : (triggers[evt.slug] || []).includes(ch.key);
                    return (
                      <td key={ch.key} className="py-2.5 pr-3 text-center">
                        {ch.key === "in_app" ? (
                          <Checkbox checked disabled />
                        ) : (
                          <Checkbox
                            checked={enabled}
                            onCheckedChange={() => toggleTrigger(evt.slug, ch.key)}
                            disabled={isReadOnly}
                          />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* REMINDER SCHEDULE */}
      <SectionCard title="Reminder Schedule" desc="Configure when automated reminders are sent">
        <FormField label="Fee Reminder Days Before Due">
          <div className="flex flex-wrap gap-2">
            {FEE_REMINDER_DAYS.map((day) => {
              const selected = (schedule.fee_reminder_days || []).includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleFeeReminderDay(day)}
                  disabled={isReadOnly}
                  className="px-3 py-1.5 text-xs font-medium rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed"
                  style={{
                    background: selected ? PLUM : "rgba(56,25,50,0.06)",
                    color: selected ? "white" : PLUM,
                    border: selected ? "none" : "1px solid rgba(56,25,50,0.12)",
                  }}
                >
                  {day} {day === 1 ? "day" : "days"}
                </button>
              );
            })}
          </div>
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 mt-3">
          <FormField label="Reminder Time of Day">
            <Input
              type="time"
              value={schedule.reminder_time || "09:00"}
              onChange={setScheduleField("reminder_time")}
              disabled={isReadOnly}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }}
            />
          </FormField>
          <FormField label="Attendance Alert Time">
            <Input
              type="time"
              value={schedule.attendance_alert_time || "10:00"}
              onChange={setScheduleField("attendance_alert_time")}
              disabled={isReadOnly}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }}
            />
          </FormField>
        </div>
      </SectionCard>

      {/* EMAIL TEMPLATES */}
      <SectionCard title="Email Templates" desc="Customize email notification templates for each event">
        {TRIGGER_EVENTS.map((evt) => {
          const templates = ns.email_templates || {};
          const tpl = templates[evt.slug] || DEFAULT_EMAIL_TEMPLATES[evt.slug];
          const isOpen = expandedEmailTemplate === evt.slug;
          return (
            <div key={evt.slug} className="mb-2 border rounded-xl" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
              <button
                type="button"
                onClick={() => setExpandedEmailTemplate(isOpen ? null : evt.slug)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                style={{ color: PLUM }}
              >
                <span className="text-xs font-medium">{evt.label}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 space-y-2 border-t pt-2" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                  <FormField label="Subject">
                    <Input
                      value={tpl?.subject || ""}
                      onChange={setEmailTemplateField(evt.slug, "subject")}
                      disabled={isReadOnly}
                      className={`h-9 text-sm rounded-xl ${disabledClass}`}
                      style={{ borderColor: "rgba(56,25,50,0.12)" }}
                    />
                  </FormField>
                  <FormField label="Body">
                    <textarea
                      value={tpl?.body || ""}
                      onChange={setEmailTemplateField(evt.slug, "body")}
                      disabled={isReadOnly}
                      rows={4}
                      className={`w-full text-sm rounded-xl p-2.5 resize-y ${disabledClass}`}
                      style={{ border: "1px solid rgba(56,25,50,0.12)" }}
                    />
                    <p className="text-xs mt-1" style={{ color: MUTED }}>
                      {"Available variables: {{student_name}}, {{school_name}}, {{term_name}}, {{amount}}, {{date}}, {{subject}}, {{announcement_title}}"}
                    </p>
                  </FormField>
                  <Button
                    onClick={() => resetEmailTemplate(evt.slug)}
                    disabled={isReadOnly}
                    className="text-xs rounded-xl h-8 px-3"
                    style={{ background: "transparent", color: MUTED, border: "1px solid rgba(56,25,50,0.12)" }}
                  >
                    Reset to Default
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </SectionCard>

      {/* SMS TEMPLATES */}
      <SectionCard title="SMS Templates" desc="Customize SMS notification templates for each event">
        {TRIGGER_EVENTS.map((evt) => {
          const templates = ns.sms_templates || {};
          const tpl = templates[evt.slug] || DEFAULT_SMS_TEMPLATES[evt.slug];
          const isOpen = expandedSmsTemplate === evt.slug;
          return (
            <div key={evt.slug} className="mb-2 border rounded-xl" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
              <button
                type="button"
                onClick={() => setExpandedSmsTemplate(isOpen ? null : evt.slug)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                style={{ color: PLUM }}
              >
                <span className="text-xs font-medium">{evt.label}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-3 pb-3 space-y-2 border-t pt-2" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                  <FormField label="Message">
                    <textarea
                      value={tpl?.message || ""}
                      onChange={setSmsTemplateField(evt.slug)}
                      disabled={isReadOnly}
                      rows={3}
                      className={`w-full text-sm rounded-xl p-2.5 resize-y ${disabledClass}`}
                      style={{ border: "1px solid rgba(56,25,50,0.12)" }}
                    />
                    <p className="text-xs mt-1" style={{ color: MUTED }}>
                      {"Available variables: {{student_name}}, {{school_name}}, {{term_name}}, {{amount}}, {{date}}, {{subject}}, {{announcement_title}}"}
                    </p>
                  </FormField>
                  <Button
                    onClick={() => resetSmsTemplate(evt.slug)}
                    disabled={isReadOnly}
                    className="text-xs rounded-xl h-8 px-3"
                    style={{ background: "transparent", color: MUTED, border: "1px solid rgba(56,25,50,0.12)" }}
                  >
                    Reset to Default
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </SectionCard>

      {/* TEST NOTIFICATION */}
      <SectionCard title="Test Notification" desc="Send a test notification to verify your configuration">
        <Button
          onClick={sendTestNotification}
          disabled={isReadOnly || testing}
          className="text-xs rounded-xl h-9 px-6"
          style={{ background: PLUM_LIGHT }}
        >
          {testing ? (
            <Loader2 size={14} className="animate-spin mr-1" />
          ) : (
            <Send size={14} className="mr-1" />
          )}
          Send Test Notification
        </Button>
      </SectionCard>

      {/* SAVE */}
      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6"
            style={{ background: PLUM }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Notification Settings
          </Button>
        </div>
      )}
    </div>
  );
}
