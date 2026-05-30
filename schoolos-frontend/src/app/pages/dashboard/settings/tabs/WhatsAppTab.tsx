import { useState, useEffect } from "react";
import { Save, Loader2, Eye, EyeOff, CheckCircle2, ExternalLink, Send, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { api } from "../../../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const GREEN = "#16A34A";

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: NAVY }}>{title}</h3>
      {desc && <p className="text-xs mb-4" style={{ color: MUTED }}>{desc}</p>}
      {children}
    </div>
  );
}

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>{label}</label>
      {children}
      {hint && <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>{hint}</p>}
    </div>
  );
}

type Props = { role: string };

export function WhatsAppTab({ role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "admin";

  const [phoneId, setPhoneId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [verifyToken, setVerifyToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);

  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const webhookUrl = `${window.location.origin.replace(/:\d+$/, "")}/webhooks/whatsapp`;

  useEffect(() => {
    (async () => {
      try {
        const [cfgRes, notifRes] = await Promise.all([
          api.get<any>("/api/school/settings/whatsapp-config").catch(() => null),
          api.get<any>("/api/school/settings").catch(() => null),
        ]);
        if (cfgRes?.data?.data) {
          const d = cfgRes.data.data;
          setPhoneId(d.phone_id || "");
          setBusinessAccountId(d.business_account_id || "");
          setVerifyToken(d.verify_token || "");
          setHasToken(d.has_access_token);
          if (d.access_token_hint) setAccessToken(d.access_token_hint);
        }
        if (notifRes?.data?.data?.settingsMap) {
          const s = notifRes.data.data.settingsMap;
          if (s.enable_whatsapp_notifications !== undefined) setEnableWhatsApp(s.enable_whatsapp_notifications);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const generateVerifyToken = () => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, "0")).join("");
    setVerifyToken(token);
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast.success("Webhook URL copied");
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        phone_id: phoneId,
        business_account_id: businessAccountId,
        verify_token: verifyToken,
      };
      // Only send access_token if the user typed a new one (not the masked hint)
      if (accessToken && !accessToken.startsWith("••••")) {
        payload.access_token = accessToken;
      }
      const [cfgRes] = await Promise.all([
        api.put<any>("/api/school/settings/whatsapp-config", payload),
        api.put<any>("/api/school/settings/notifications", { enable_whatsapp_notifications: enableWhatsApp }),
      ]);
      if (cfgRes?.data) {
        toast.success("WhatsApp configuration saved");
        setHasToken(true);
      } else {
        toast.error(cfgRes?.error || "Failed to save");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save WhatsApp config");
    } finally { setSaving(false); }
  };

  const handleTest = async () => {
    if (!testTo) { toast.error("Enter a phone number to test"); return; }
    setTesting(true);
    try {
      const res = await api.post<any>("/api/school/settings/test-whatsapp", {
        to: testTo,
        body: "✅ This is a test message from SchoolOS WhatsApp integration.",
      });
      if (res?.data?.data?.success) toast.success("Test message sent successfully!");
      else toast.error(res?.data?.data?.message || "Test failed — check your credentials");
    } catch (err: any) {
      toast.error(err?.message || "Test failed");
    } finally { setTesting(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="animate-spin" size={24} color={NAVY} /></div>;
  }

  return (
    <div>
      {/* Status */}
      <SectionCard title="WhatsApp Business API" desc="Send fee receipts, attendance alerts, and fee reminders directly via WhatsApp.">
        <div className="flex items-center justify-between py-1 mb-3">
          <div>
            <p className="text-xs font-medium" style={{ color: NAVY }}>Enable WhatsApp Notifications</p>
            <p className="text-[11px]" style={{ color: MUTED }}>Send automated messages to parents via WhatsApp</p>
          </div>
          <Switch checked={enableWhatsApp} onCheckedChange={setEnableWhatsApp} disabled={isReadOnly} />
        </div>
        {hasToken && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: `${GREEN}10`, border: `1px solid ${GREEN}30`, color: GREEN }}>
            <CheckCircle2 size={14} /> Connected to Meta WhatsApp Business API
          </div>
        )}
      </SectionCard>

      {/* API Credentials */}
      <SectionCard title="Meta API Credentials"
        desc="Get these from Meta Business Suite → WhatsApp → API Setup.">
        <a
          href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
          target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs mb-4 hover:underline"
          style={{ color: "#0080FF" }}
        >
          <ExternalLink size={12} /> Meta Cloud API setup guide
        </a>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Phone Number ID" hint="From WhatsApp → API Setup → Phone Number ID">
            <Input value={phoneId} onChange={e => setPhoneId(e.target.value)}
              className="h-9 text-xs rounded-xl font-mono"
              style={{ borderColor: "rgba(10,36,114,0.12)" }}
              placeholder="123456789012345"
              disabled={isReadOnly} />
          </FormField>

          <FormField label="WhatsApp Business Account ID" hint="From Meta Business Suite → Settings">
            <Input value={businessAccountId} onChange={e => setBusinessAccountId(e.target.value)}
              className="h-9 text-xs rounded-xl font-mono"
              style={{ borderColor: "rgba(10,36,114,0.12)" }}
              placeholder="987654321098765"
              disabled={isReadOnly} />
          </FormField>
        </div>

        <FormField label="Permanent Access Token" hint="Use a System User token (never expires). Leave blank to keep existing.">
          <div className="relative">
            <Input value={accessToken} onChange={e => setAccessToken(e.target.value)}
              type={showToken ? "text" : "password"}
              className="h-9 text-xs rounded-xl font-mono w-full pr-9"
              style={{ borderColor: "rgba(10,36,114,0.12)" }}
              placeholder={hasToken ? "Token saved — enter new to replace" : "EAAxxxxxxxx..."}
              disabled={isReadOnly} />
            <button type="button" onClick={() => setShowToken(!showToken)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
              {showToken ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
            </button>
          </div>
        </FormField>
      </SectionCard>

      {/* Webhook */}
      <SectionCard title="Webhook Configuration"
        desc="Register this URL in Meta Business Suite → WhatsApp → Configuration → Webhook.">
        <FormField label="Webhook URL">
          <div className="flex items-center gap-2">
            <Input value={webhookUrl} readOnly
              className="h-9 text-xs rounded-xl font-mono flex-1 bg-muted/30"
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
            <Button variant="outline" size="sm" onClick={copyWebhook} className="h-9 rounded-xl px-3 text-xs shrink-0">
              <Copy size={13} className="mr-1" /> Copy
            </Button>
          </div>
        </FormField>

        <FormField label="Verify Token" hint="Paste this exact token into Meta's webhook verify token field.">
          <div className="flex items-center gap-2">
            <Input value={verifyToken} onChange={e => setVerifyToken(e.target.value)}
              className="h-9 text-xs rounded-xl font-mono flex-1"
              style={{ borderColor: "rgba(10,36,114,0.12)" }}
              placeholder="Generate or enter a secret token"
              disabled={isReadOnly} />
            {!isReadOnly && (
              <Button variant="outline" size="sm" onClick={generateVerifyToken} className="h-9 rounded-xl px-3 text-xs shrink-0">
                <RefreshCw size={13} className="mr-1" /> Generate
              </Button>
            )}
          </div>
        </FormField>

        <div className="rounded-xl p-3 text-xs space-y-1" style={{ background: "rgba(10,36,114,0.03)", border: "1px solid rgba(10,36,114,0.07)" }}>
          <p className="font-semibold" style={{ color: NAVY }}>Webhook subscriptions to enable:</p>
          <p style={{ color: MUTED }}><span className="font-mono bg-white px-1 rounded">messages</span> — incoming parent messages</p>
          <p style={{ color: MUTED }}><span className="font-mono bg-white px-1 rounded">message_deliveries</span> — delivery receipts</p>
          <p style={{ color: MUTED }}><span className="font-mono bg-white px-1 rounded">message_reads</span> — read receipts</p>
        </div>
      </SectionCard>

      {/* Test message */}
      <SectionCard title="Test Connection" desc="Send a test message to verify the integration is working.">
        <div className="flex items-center gap-2">
          <Input value={testTo} onChange={e => setTestTo(e.target.value)}
            className="h-9 text-xs rounded-xl flex-1"
            style={{ borderColor: "rgba(10,36,114,0.12)" }}
            placeholder="+233201234567 (international format)" />
          <Button onClick={handleTest} disabled={testing || !hasToken} size="sm"
            className="h-9 rounded-xl px-4 text-xs shrink-0" style={{ background: NAVY, color: "white" }}>
            {testing ? <Loader2 size={13} className="animate-spin mr-1" /> : <Send size={13} className="mr-1" />}
            Send Test
          </Button>
        </div>
        {!hasToken && (
          <p className="text-[11px] mt-2" style={{ color: "#F59E0B" }}>
            Save your credentials first before sending a test message.
          </p>
        )}
      </SectionCard>

      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving}
            className="text-xs rounded-xl h-9 px-6" style={{ background: NAVY, color: "white" }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save WhatsApp Config
          </Button>
        </div>
      )}
    </div>
  );
}
