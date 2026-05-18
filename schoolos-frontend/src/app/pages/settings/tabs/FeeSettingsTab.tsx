import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Button } from "../../../components/ui/button";
import {
  RadioGroup, RadioGroupItem,
} from "../../../components/ui/radio-group";

const PLUM = "#381932";
const MUTED = "#7D6077";

const DEFAULT_FEE_CATEGORIES = [
  { name: "School Fees", amount: 0, frequency: "termly", mandatory: true },
  { name: "PTA Levy", amount: 0, frequency: "yearly", mandatory: true },
  { name: "Examination Fees", amount: 0, frequency: "termly", mandatory: false },
  { name: "Sports Levy", amount: 0, frequency: "termly", mandatory: false },
  { name: "Library Fees", amount: 0, frequency: "yearly", mandatory: false },
];

const FREQUENCIES = ["termly", "yearly", "monthly"];

const PAYMENT_OPTIONS = [
  { key: "mobile_money", label: "Mobile Money" },
  { key: "bank_transfer", label: "Bank Transfer" },
  { key: "cash", label: "Cash" },
  { key: "paystack", label: "Paystack Online" },
  { key: "flutterwave", label: "Flutterwave Online" },
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

type Props = {
  profile: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  saving: boolean;
  role: string;
};

export function FeeSettingsTab({ profile, onSave, saving, role }: Props) {
  const isReadOnly = role !== "school_admin";

  const [form, setForm] = useState<Record<string, any>>({
    payment_methods: [],
    metadata: { payment_gateways: {} },
    fee_categories: DEFAULT_FEE_CATEGORIES,
    late_fee_settings: { enabled: false, grace_days: 14, type: "fixed", amount: 0, max_amount: 0 },
    receipt_settings: { auto_generate: false, prefix: "RCP-", show_logo: false, footer_message: "" },
  });

  const [showPaystackPub, setShowPaystackPub] = useState(false);
  const [showPaystackSec, setShowPaystackSec] = useState(false);
  const [showFlutterwavePub, setShowFlutterwavePub] = useState(false);
  const [showFlutterwaveSec, setShowFlutterwaveSec] = useState(false);
  const [showFlutterwaveEnc, setShowFlutterwaveEnc] = useState(false);

  useEffect(() => {
    if (profile) {
      const meta = profile.metadata || {};
      setForm({
        payment_methods: profile.payment_methods || [],
        metadata: {
          payment_gateways: meta.payment_gateways || {},
        },
        fee_categories: profile.fee_categories || DEFAULT_FEE_CATEGORIES,
        late_fee_settings: {
          enabled: false, grace_days: 14, type: "fixed", amount: 0, max_amount: 0,
          ...(profile.late_fee_settings || {}),
        },
        receipt_settings: {
          auto_generate: false, prefix: "RCP-", show_logo: false, footer_message: "",
          ...(profile.receipt_settings || {}),
        },
      });
    }
  }, [profile]);

  const togglePaymentMethod = (key: string) => {
    if (isReadOnly) return;
    setForm((prev: Record<string, any>) => {
      const current: string[] = prev.payment_methods || [];
      const next = current.includes(key)
        ? current.filter((k: string) => k !== key)
        : [...current, key];
      return { ...prev, payment_methods: next };
    });
  };

  const setGatewayField = (gateway: string, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev: Record<string, any>) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        payment_gateways: {
          ...prev.metadata?.payment_gateways,
          [gateway]: {
            ...(prev.metadata?.payment_gateways?.[gateway] || {}),
            [field]: e.target.value,
          },
        },
      },
    }));
  };

  const setGatewayToggle = (gateway: string, field: string) => (checked: boolean) => {
    setForm((prev: Record<string, any>) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        payment_gateways: {
          ...prev.metadata?.payment_gateways,
          [gateway]: {
            ...(prev.metadata?.payment_gateways?.[gateway] || {}),
            [field]: checked,
          },
        },
      },
    }));
  };

  const updateCategory = (index: number, field: string, value: any) => {
    setForm((prev: Record<string, any>) => {
      const categories = [...(prev.fee_categories || [])];
      categories[index] = { ...categories[index], [field]: value };
      return { ...prev, fee_categories: categories };
    });
  };

  const addCategory = () => {
    setForm((prev: Record<string, any>) => ({
      ...prev,
      fee_categories: [...(prev.fee_categories || []), { name: "", amount: 0, frequency: "termly", mandatory: false }],
    }));
  };

  const removeCategory = (index: number) => {
    setForm((prev: Record<string, any>) => {
      const categories = [...(prev.fee_categories || [])];
      categories.splice(index, 1);
      return { ...prev, fee_categories: categories };
    });
  };

  const setLateFee = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = field === "grace_days" || field === "amount" || field === "max_amount" ? Number(e.target.value) : e.target.value;
    setForm((prev: Record<string, any>) => ({
      ...prev,
      late_fee_settings: { ...prev.late_fee_settings, [field]: val },
    }));
  };

  const setLateFeeToggle = (field: string) => (checked: boolean) => {
    setForm((prev: Record<string, any>) => ({
      ...prev,
      late_fee_settings: { ...prev.late_fee_settings, [field]: checked },
    }));
  };

  const setLateFeeType = (value: string) => {
    setForm((prev: Record<string, any>) => ({
      ...prev,
      late_fee_settings: { ...prev.late_fee_settings, type: value },
    }));
  };

  const setReceipt = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev: Record<string, any>) => ({
      ...prev,
      receipt_settings: { ...prev.receipt_settings, [field]: e.target.value },
    }));
  };

  const setReceiptToggle = (field: string) => (checked: boolean) => {
    setForm((prev: Record<string, any>) => ({
      ...prev,
      receipt_settings: { ...prev.receipt_settings, [field]: checked },
    }));
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    const data: Record<string, any> = {
      payment_methods: form.payment_methods,
      fee_categories: form.fee_categories,
      late_fee_settings: form.late_fee_settings,
      receipt_settings: form.receipt_settings,
      metadata: form.metadata,
    };
    await onSave(data);
    toast.success("Fee settings saved");
  };

  const disabledClass = isReadOnly ? "opacity-60 cursor-not-allowed" : "";

  const paystackKeys = form.metadata?.payment_gateways?.paystack || {};
  const flutterwaveKeys = form.metadata?.payment_gateways?.flutterwave || {};

  return (
    <div>
      <SectionCard title="Payment Methods" desc="Configure accepted payment methods for fee collection">
        <div className="space-y-3">
          {PAYMENT_OPTIONS.map((opt) => {
            const selected = (form.payment_methods || []).includes(opt.key);
            return (
              <div key={opt.key}>
                <div className="flex items-center justify-between py-1.5">
                  <label className="text-xs font-medium cursor-pointer" style={{ color: PLUM }}>
                    {opt.label}
                  </label>
                  <Switch
                    checked={selected}
                    onCheckedChange={() => togglePaymentMethod(opt.key)}
                    disabled={isReadOnly}
                  />
                </div>
                {opt.key === "paystack" && selected && (
                  <div className="ml-4 pl-3 border-l-2 mt-2 mb-2 space-y-3" style={{ borderColor: "rgba(56,25,50,0.1)" }}>
                    <FormField label="Paystack Public Key">
                      <div className="relative">
                        <Input
                          value={paystackKeys.public_key || ""}
                          onChange={setGatewayField("paystack", "public_key")}
                          disabled={isReadOnly}
                          type={showPaystackPub ? "text" : "password"}
                          className={`h-9 text-sm rounded-xl w-full pr-9 ${disabledClass}`}
                          style={{ borderColor: "rgba(56,25,50,0.12)" }}
                          placeholder="pk_..." />
                        <button type="button" onClick={() => setShowPaystackPub(!showPaystackPub)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70" tabIndex={-1}>
                          {showPaystackPub ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
                        </button>
                      </div>
                    </FormField>
                    <FormField label="Paystack Secret Key">
                      <div className="relative">
                        <Input
                          value={paystackKeys.secret_key || ""}
                          onChange={setGatewayField("paystack", "secret_key")}
                          disabled={isReadOnly}
                          type={showPaystackSec ? "text" : "password"}
                          className={`h-9 text-sm rounded-xl w-full pr-9 ${disabledClass}`}
                          style={{ borderColor: "rgba(56,25,50,0.12)" }}
                          placeholder="sk_..." />
                        <button type="button" onClick={() => setShowPaystackSec(!showPaystackSec)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70" tabIndex={-1}>
                          {showPaystackSec ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
                        </button>
                      </div>
                    </FormField>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium" style={{ color: PLUM }}>Test Mode</label>
                      <Switch
                        checked={paystackKeys.test_mode || false}
                        onCheckedChange={setGatewayToggle("paystack", "test_mode")}
                        disabled={isReadOnly} />
                    </div>
                  </div>
                )}
                {opt.key === "flutterwave" && selected && (
                  <div className="ml-4 pl-3 border-l-2 mt-2 mb-2 space-y-3" style={{ borderColor: "rgba(56,25,50,0.1)" }}>
                    <FormField label="Flutterwave Public Key">
                      <div className="relative">
                        <Input
                          value={flutterwaveKeys.public_key || ""}
                          onChange={setGatewayField("flutterwave", "public_key")}
                          disabled={isReadOnly}
                          type={showFlutterwavePub ? "text" : "password"}
                          className={`h-9 text-sm rounded-xl w-full pr-9 ${disabledClass}`}
                          style={{ borderColor: "rgba(56,25,50,0.12)" }}
                          placeholder="FLWPUBK-..." />
                        <button type="button" onClick={() => setShowFlutterwavePub(!showFlutterwavePub)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70" tabIndex={-1}>
                          {showFlutterwavePub ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
                        </button>
                      </div>
                    </FormField>
                    <FormField label="Flutterwave Secret Key">
                      <div className="relative">
                        <Input
                          value={flutterwaveKeys.secret_key || ""}
                          onChange={setGatewayField("flutterwave", "secret_key")}
                          disabled={isReadOnly}
                          type={showFlutterwaveSec ? "text" : "password"}
                          className={`h-9 text-sm rounded-xl w-full pr-9 ${disabledClass}`}
                          style={{ borderColor: "rgba(56,25,50,0.12)" }}
                          placeholder="FLWSECK-..." />
                        <button type="button" onClick={() => setShowFlutterwaveSec(!showFlutterwaveSec)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70" tabIndex={-1}>
                          {showFlutterwaveSec ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
                        </button>
                      </div>
                    </FormField>
                    <FormField label="Flutterwave Encryption Key">
                      <div className="relative">
                        <Input
                          value={flutterwaveKeys.encryption_key || ""}
                          onChange={setGatewayField("flutterwave", "encryption_key")}
                          disabled={isReadOnly}
                          type={showFlutterwaveEnc ? "text" : "password"}
                          className={`h-9 text-sm rounded-xl w-full pr-9 ${disabledClass}`}
                          style={{ borderColor: "rgba(56,25,50,0.12)" }}
                          placeholder="FLWSECK-..." />
                        <button type="button" onClick={() => setShowFlutterwaveEnc(!showFlutterwaveEnc)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70" tabIndex={-1}>
                          {showFlutterwaveEnc ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
                        </button>
                      </div>
                    </FormField>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Default Fee Categories" desc="Set up default fee categories and amounts">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="text-left" style={{ color: MUTED }}>
                <th className="pb-2 pr-2 font-medium">Category Name</th>
                <th className="pb-2 pr-2 font-medium">Amount (GHS)</th>
                <th className="pb-2 pr-2 font-medium">Frequency</th>
                <th className="pb-2 pr-2 font-medium">Mandatory</th>
                <th className="pb-2 font-medium w-8" />
              </tr>
            </thead>
            <tbody>
              {(form.fee_categories || []).map((cat: any, i: number) => (
                <tr key={i}>
                  <td className="pb-2 pr-2">
                    <Input
                      value={cat.name}
                      onChange={(e) => updateCategory(i, "name", e.target.value)}
                      disabled={isReadOnly}
                      className="h-8 text-xs rounded-xl min-w-[130px]"
                      style={{ borderColor: "rgba(56,25,50,0.12)" }}
                      placeholder="Category name" />
                  </td>
                  <td className="pb-2 pr-2">
                    <Input
                      type="number"
                      value={cat.amount}
                      onChange={(e) => updateCategory(i, "amount", Number(e.target.value))}
                      disabled={isReadOnly}
                      min={0}
                      className="h-8 text-xs rounded-xl w-24"
                      style={{ borderColor: "rgba(56,25,50,0.12)" }} />
                  </td>
                  <td className="pb-2 pr-2">
                    <Select
                      value={cat.frequency || "termly"}
                      onValueChange={(v) => updateCategory(i, "frequency", v)}
                      disabled={isReadOnly}>
                      <SelectTrigger className="h-8 text-xs rounded-xl w-24"
                        style={{ borderColor: "rgba(56,25,50,0.12)" }}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f} value={f} className="text-xs capitalize">{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="pb-2 pr-2">
                    <Switch
                      checked={cat.mandatory || false}
                      onCheckedChange={(v) => updateCategory(i, "mandatory", v)}
                      disabled={isReadOnly} />
                  </td>
                  <td className="pb-2">
                    {!isReadOnly && (
                      <button type="button" onClick={() => removeCategory(i)}
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
          <button type="button" onClick={addCategory}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
            style={{ color: PLUM, background: "rgba(56,25,50,0.06)" }}>
            <Plus size={14} /> Add Custom Category
          </button>
        )}
      </SectionCard>

      <SectionCard title="Late Payment Settings" desc="Configure late fee rules and grace periods">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-medium" style={{ color: PLUM }}>Enable Late Fee</label>
          <Switch
            checked={form.late_fee_settings?.enabled || false}
            onCheckedChange={setLateFeeToggle("enabled")}
            disabled={isReadOnly} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Grace Period (days)">
            <Input
              type="number"
              value={form.late_fee_settings?.grace_days ?? 14}
              onChange={setLateFee("grace_days")}
              disabled={isReadOnly}
              min={0}
              max={365}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Maximum Late Fee">
            <Input
              type="number"
              value={form.late_fee_settings?.max_amount ?? 0}
              onChange={setLateFee("max_amount")}
              disabled={isReadOnly}
              min={0}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
        </div>
        <FormField label="Late Fee Type">
          <RadioGroup
            value={form.late_fee_settings?.type || "fixed"}
            onValueChange={setLateFeeType}
            className="flex gap-6"
            disabled={isReadOnly}>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="fixed" id="fee-fixed" disabled={isReadOnly} />
              <label htmlFor="fee-fixed" className="text-xs cursor-pointer" style={{ color: PLUM }}>Fixed Amount</label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="percentage" id="fee-percentage" disabled={isReadOnly} />
              <label htmlFor="fee-percentage" className="text-xs cursor-pointer" style={{ color: PLUM }}>Percentage</label>
            </div>
          </RadioGroup>
        </FormField>
        <FormField label={form.late_fee_settings?.type === "percentage" ? "Percentage (%)" : "Amount (GHS)"}>
          <Input
            type="number"
            value={form.late_fee_settings?.amount ?? 0}
            onChange={setLateFee("amount")}
            disabled={isReadOnly}
            min={0}
            className={`h-9 text-sm rounded-xl max-w-[200px] ${disabledClass}`}
            style={{ borderColor: "rgba(56,25,50,0.12)" }} />
        </FormField>
      </SectionCard>

      <SectionCard title="Receipt Settings" desc="Configure receipt generation preferences">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium" style={{ color: PLUM }}>Auto-generate Receipts</label>
          <Switch
            checked={form.receipt_settings?.auto_generate || false}
            onCheckedChange={setReceiptToggle("auto_generate")}
            disabled={isReadOnly} />
        </div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium" style={{ color: PLUM }}>Show School Logo on Receipt</label>
          <Switch
            checked={form.receipt_settings?.show_logo || false}
            onCheckedChange={setReceiptToggle("show_logo")}
            disabled={isReadOnly} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Receipt Prefix">
            <Input
              value={form.receipt_settings?.prefix || "RCP-"}
              onChange={setReceipt("prefix")}
              disabled={isReadOnly}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
        </div>
        <FormField label="Receipt Footer Message">
          <Textarea
            value={form.receipt_settings?.footer_message || ""}
            onChange={setReceipt("footer_message")}
            disabled={isReadOnly}
            rows={3}
            className={`text-sm rounded-xl resize-none ${disabledClass}`}
            style={{ borderColor: "rgba(56,25,50,0.12)" }}
            placeholder="Thank you for your payment..." />
        </FormField>
      </SectionCard>

      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6"
            style={{ background: PLUM }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Fee Settings
          </Button>
        </div>
      )}
    </div>
  );
}
