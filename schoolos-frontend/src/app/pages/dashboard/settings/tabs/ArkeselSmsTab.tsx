import { useState, useEffect } from "react";
import { Save, Loader2, Eye, EyeOff, MessageSquare, Wallet, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { Badge } from "../../../../components/ui/badge";
import { api } from "../../../../services/api";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

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

type Props = { role: string };

export function ArkeselSmsTab({ role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "admin";
  const [apiKey, setApiKey] = useState("");
  const [senderId, setSenderId] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [paymentReceipts, setPaymentReceipts] = useState(true);
  const [absenceAlerts, setAbsenceAlerts] = useState(true);
  const [senderIdError, setSenderIdError] = useState<string | null>(null);
  const [smsBalance, setSmsBalance] = useState<number | null>(null);
  const [lowThreshold, setLowThreshold] = useState(100);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [cfgRes, balRes] = await Promise.all([
          api.get<any>("/api/school/settings/kv/arkesel_config").catch(() => null),
          api.get<any>("/api/school/settings/kv/sms_balance").catch(() => null),
        ]);
        if (cfgRes?.data) {
          const cfg = cfgRes.data.data || cfgRes.data;
          if (cfg.api_key) setApiKey(cfg.api_key);
          if (cfg.sender_id) setSenderId(cfg.sender_id);
          if (cfg.payment_receipts !== undefined) setPaymentReceipts(cfg.payment_receipts);
          if (cfg.absence_alerts !== undefined) setAbsenceAlerts(cfg.absence_alerts);
        }
        if (balRes?.data) {
          const bal = balRes.data.data || balRes.data;
          if (typeof bal === "number") {
            setSmsBalance(bal);
          } else {
            if (bal.balance !== undefined) setSmsBalance(Number(bal.balance));
            if (bal.low_balance_threshold !== undefined) setLowThreshold(Number(bal.low_balance_threshold));
          }
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const validateSenderId = (id: string): string | null => {
    if (id && !/^[a-zA-Z0-9]+$/.test(id)) return "Only letters and numbers allowed (no spaces or special characters)";
    return null;
  };

  const handleSenderIdChange = (value: string) => {
    const cleaned = value.slice(0, 11).replace(/[^a-zA-Z0-9]/g, "");
    setSenderId(cleaned);
    setSenderIdError(validateSenderId(cleaned));
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    const err = validateSenderId(senderId);
    if (err) { setSenderIdError(err); return; }
    setSaving(true);
    try {
      const payload = {
        key: "arkesel_config",
        value: { api_key: apiKey, sender_id: senderId, payment_receipts: paymentReceipts, absence_alerts: absenceAlerts },
      };
      const res = await api.put<any>("/api/school/settings/kv", payload);
      if (res.data) toast.success("SMS configuration saved");
      else toast.error(res.error || "Failed to save");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save SMS config");
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="animate-spin" size={24} color={NAVY} /></div>;
  }

  const isLowBalance = smsBalance !== null && smsBalance < lowThreshold;

  return (
    <div>
      <SectionCard title="Arkesel SMS Gateway" desc="Configure your Arkesel SMS integration">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="API Key">
            <div className="relative">
              <Input value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                type={showKey ? "text" : "password"}
                className="h-9 text-xs rounded-xl font-mono w-full pr-9"
                style={{ borderColor: "rgba(10,36,114,0.12)" }} placeholder="Enter Arkesel API key" />
              <button type="button" onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
                {showKey ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
              </button>
            </div>
          </FormField>
          <FormField label="Sender ID" error={senderIdError}>
            <Input value={senderId} onChange={(e) => handleSenderIdChange(e.target.value)}
              className="h-9 text-sm rounded-xl" maxLength={11}
              style={{ borderColor: senderIdError ? "#EF4444" : "rgba(10,36,114,0.12)" }} placeholder="e.g. MYSCHOOL (max 11 chars)" />
            <p className="text-[10px] mt-0.5" style={{ color: senderIdError ? "#EF4444" : MUTED }}>{senderId.length}/11 characters (letters and numbers only)</p>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="SMS Balance">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: isLowBalance ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)" }}>
            <Wallet size={22} color={isLowBalance ? "#EF4444" : "#10B981"} />
          </div>
          <div>
            <p className="text-lg font-bold font-mono" style={{ color: NAVY }}>
              {smsBalance !== null ? smsBalance.toLocaleString() : "—"}
            </p>
            <p className="text-xs" style={{ color: MUTED }}>
              {smsBalance !== null
                ? isLowBalance
                  ? <span className="flex items-center gap-1" style={{ color: "#EF4444" }}><AlertTriangle size={12} /> Low balance — top up soon</span>
                  : "Sufficient credits"
                : "Balance unknown"}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Automated Triggers" desc="Events that will automatically send SMS notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <MessageSquare size={16} color={MUTED} />
              <div>
                <p className="text-xs font-medium" style={{ color: NAVY }}>Payment Receipts</p>
                <p className="text-[11px]" style={{ color: MUTED }}>Send SMS receipt when a payment is confirmed</p>
              </div>
            </div>
            <Switch checked={paymentReceipts} onCheckedChange={setPaymentReceipts} disabled={isReadOnly} />
          </div>
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <AlertTriangle size={16} color={MUTED} />
              <div>
                <p className="text-xs font-medium" style={{ color: NAVY }}>Absence Alerts</p>
                <p className="text-[11px]" style={{ color: MUTED }}>Notify parents when a student is marked absent</p>
              </div>
            </div>
            <Switch checked={absenceAlerts} onCheckedChange={setAbsenceAlerts} disabled={isReadOnly} />
          </div>
        </div>
      </SectionCard>

      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6" style={{ background: NAVY }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save SMS Config
          </Button>
        </div>
      )}
    </div>
  );
}
