import { useState, useEffect } from "react";
import { Save, Loader2, Plus, Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../services/api";
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

const NAVY = "#031B4E";
const MUTED = "#6B7280";

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

type Props = {
  profile: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<boolean>;
  saving: boolean;
  role: string;
};

export function FeeSettingsTab({ profile, onSave, saving, role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "headmaster" && role !== "admin";

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

  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [loadingFeeStructures, setLoadingFeeStructures] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [newFeeStructure, setNewFeeStructure] = useState({ name: "", class_id: "", amount: 0, frequency: "termly", is_mandatory: false });
  const [creatingFeeStructure, setCreatingFeeStructure] = useState(false);
  const [deletingFeeStructureId, setDeletingFeeStructureId] = useState<string | null>(null);
  const [editingFeeStructureId, setEditingFeeStructureId] = useState<string | null>(null);
  const [editFeeData, setEditFeeData] = useState({ name: "", amount: 0, frequency: "termly", is_mandatory: false });

  const [reminderDays, setReminderDays] = useState<number[]>([]);
  const [reminderTime, setReminderTime] = useState("09:00");

  useEffect(() => {
    fetchFeeStructures();
    fetchClasses();
  }, []);

  const fetchFeeStructures = async () => {
    setLoadingFeeStructures(true);
    try {
      const res = await api.get<any>("/api/school/fee-structures");
      const data = res.data?.data || res.data;
      setFeeStructures(Array.isArray(data) ? data : data?.fee_structures || []);
    } catch { /* ignore */ }
    finally { setLoadingFeeStructures(false); }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get<any>("/api/school/classes");
      const data = res.data?.data?.classes || res.data?.classes || (Array.isArray(res.data) ? res.data : []);
      setClasses(data);
    } catch { /* ignore */ }
  };

  const handleCreateFeeStructure = async () => {
    if (!newFeeStructure.name || !newFeeStructure.class_id) return;
    setCreatingFeeStructure(true);
    try {
      await api.post("/api/school/fee-structures", newFeeStructure);
      toast.success("Fee structure created");
      setNewFeeStructure({ name: "", class_id: "", amount: 0, frequency: "termly", is_mandatory: false });
      fetchFeeStructures();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create fee structure");
    } finally {
      setCreatingFeeStructure(false);
    }
  };

  const handleUpdateFeeStructure = async (id: string) => {
    try {
      await api.put(`/api/school/fee-structures/${id}`, editFeeData);
      toast.success("Fee structure updated");
      setEditingFeeStructureId(null);
      fetchFeeStructures();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update fee structure");
    }
  };

  const handleDeleteFeeStructure = async (id: string) => {
    setDeletingFeeStructureId(id);
    try {
      await api.delete(`/api/school/fee-structures/${id}`);
      toast.success("Fee structure deleted");
      fetchFeeStructures();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete fee structure");
    } finally {
      setDeletingFeeStructureId(null);
    }
  };

  const toggleReminderDay = (day: number) => {
    setReminderDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const FEE_REMINDER_DAYS = [1, 3, 7, 14];

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
      metadata: {
        ...form.metadata,
        payment_gateways: form.metadata?.payment_gateways || {},
        reminder_settings: form.metadata?.reminder_settings || {},
      },
    };
    const ok = await onSave(data);
    if (ok) toast.success("Fee settings saved");
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
                  <label className="text-xs font-medium cursor-pointer" style={{ color: NAVY }}>
                    {opt.label}
                  </label>
                  <Switch
                    checked={selected}
                    onCheckedChange={() => togglePaymentMethod(opt.key)}
                    disabled={isReadOnly}
                  />
                </div>
                {opt.key === "paystack" && selected && (
                  <div className="ml-4 pl-3 border-l-2 mt-2 mb-2 space-y-3" style={{ borderColor: "rgba(10,36,114,0.1)" }}>
                    <FormField label="Paystack Public Key">
                      <div className="relative">
                        <Input
                          value={paystackKeys.public_key || ""}
                          onChange={setGatewayField("paystack", "public_key")}
                          disabled={isReadOnly}
                          type={showPaystackPub ? "text" : "password"}
                          className={`h-9 text-sm rounded-xl w-full pr-9 ${disabledClass}`}
                          style={{ borderColor: "rgba(10,36,114,0.12)" }}
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
                          style={{ borderColor: "rgba(10,36,114,0.12)" }}
                          placeholder="sk_..." />
                        <button type="button" onClick={() => setShowPaystackSec(!showPaystackSec)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70" tabIndex={-1}>
                          {showPaystackSec ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
                        </button>
                      </div>
                    </FormField>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium" style={{ color: NAVY }}>Test Mode</label>
                      <Switch
                        checked={paystackKeys.test_mode || false}
                        onCheckedChange={setGatewayToggle("paystack", "test_mode")}
                        disabled={isReadOnly} />
                    </div>
                  </div>
                )}
                {opt.key === "flutterwave" && selected && (
                  <div className="ml-4 pl-3 border-l-2 mt-2 mb-2 space-y-3" style={{ borderColor: "rgba(10,36,114,0.1)" }}>
                    <FormField label="Flutterwave Public Key">
                      <div className="relative">
                        <Input
                          value={flutterwaveKeys.public_key || ""}
                          onChange={setGatewayField("flutterwave", "public_key")}
                          disabled={isReadOnly}
                          type={showFlutterwavePub ? "text" : "password"}
                          className={`h-9 text-sm rounded-xl w-full pr-9 ${disabledClass}`}
                          style={{ borderColor: "rgba(10,36,114,0.12)" }}
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
                          style={{ borderColor: "rgba(10,36,114,0.12)" }}
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
                          style={{ borderColor: "rgba(10,36,114,0.12)" }}
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

      <SectionCard title="Fee Structures per Class" desc="Configure fee amounts per class">
        {loadingFeeStructures ? (
          <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin" color={NAVY} /></div>
        ) : (
          <div className="overflow-x-auto mb-3">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="text-left" style={{ color: MUTED }}>
                  <th className="pb-2 pr-2 font-medium">Class</th>
                  <th className="pb-2 pr-2 font-medium">Name</th>
                  <th className="pb-2 pr-2 font-medium">Amount (GHS)</th>
                  <th className="pb-2 pr-2 font-medium">Frequency</th>
                  <th className="pb-2 pr-2 font-medium">Mandatory</th>
                  <th className="pb-2 font-medium w-16" />
                </tr>
              </thead>
              <tbody>
                {feeStructures.length === 0 ? (
                  <tr><td colSpan={6} className="py-4 text-center" style={{ color: MUTED }}>No fee structures yet.</td></tr>
                ) : feeStructures.map((fs: any) => {
                  const isEditing = editingFeeStructureId === fs.id;
                  return (
                    <tr key={fs.id} className="border-t" style={{ borderColor: "rgba(10,36,114,0.07)" }}>
                      <td className="py-2 pr-2" style={{ color: NAVY }}>{fs.class?.name || "—"}</td>
                      <td className="py-2 pr-2">
                        {isEditing ? (
                          <Input value={editFeeData.name} onChange={(e) => setEditFeeData((p) => ({ ...p, name: e.target.value }))}
                            className="h-8 text-xs rounded-xl min-w-[120px]"
                            style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                        ) : (
                          <span style={{ color: NAVY }}>{fs.name}</span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        {isEditing ? (
                          <Input type="number" value={editFeeData.amount} onChange={(e) => setEditFeeData((p) => ({ ...p, amount: Number(e.target.value) }))}
                            className="h-8 text-xs rounded-xl w-24"
                            style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                        ) : (
                          <span style={{ color: NAVY }}>{fs.amount}</span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        {isEditing ? (
                          <Select value={editFeeData.frequency} onValueChange={(v) => setEditFeeData((p) => ({ ...p, frequency: v }))}>
                            <SelectTrigger className="h-8 text-xs rounded-xl w-24"
                              style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["termly", "yearly", "monthly"].map((f) => (
                                <SelectItem key={f} value={f} className="text-xs capitalize">{f}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="capitalize" style={{ color: NAVY }}>{fs.frequency}</span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        {isEditing ? (
                          <Switch checked={editFeeData.is_mandatory} onCheckedChange={(v) => setEditFeeData((p) => ({ ...p, is_mandatory: v }))} />
                        ) : (
                          <span style={{ color: fs.is_mandatory ? "#16A34A" : MUTED }}>{fs.is_mandatory ? "Yes" : "No"}</span>
                        )}
                      </td>
                      <td className="py-2">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button onClick={() => handleUpdateFeeStructure(fs.id)}
                              className="p-1.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)" }}>
                              <Save size={13} color="#16A34A" />
                            </button>
                            <button onClick={() => setEditingFeeStructureId(null)}
                              className="p-1.5 rounded-lg" style={{ background: "rgba(239,68,68,0.08)" }}>
                              <Trash2 size={13} color="#EF4444" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            {!isReadOnly && (
                              <button onClick={() => {
                                setEditingFeeStructureId(fs.id);
                                setEditFeeData({ name: fs.name, amount: fs.amount, frequency: fs.frequency, is_mandatory: fs.is_mandatory || false });
                              }}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ background: "rgba(10,36,114,0.06)" }}>
                                <Pencil size={13} color={NAVY} />
                              </button>
                            )}
                            {!isReadOnly && (
                              <button onClick={() => handleDeleteFeeStructure(fs.id)}
                                disabled={deletingFeeStructureId === fs.id}
                                className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                                style={{ background: "rgba(239,68,68,0.08)" }}>
                                {deletingFeeStructureId === fs.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} color="#EF4444" />}
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!isReadOnly && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-end">
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Class</label>
              <Select value={newFeeStructure.class_id} onValueChange={(v) => setNewFeeStructure((p) => ({ ...p, class_id: v }))}>
                <SelectTrigger className="h-9 text-xs rounded-xl"
                  style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                  <SelectValue placeholder="Select class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.id} value={cls.id} className="text-xs">{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Name</label>
              <Input value={newFeeStructure.name} onChange={(e) => setNewFeeStructure((p) => ({ ...p, name: e.target.value }))}
                placeholder="Fee name"
                className="h-9 text-sm rounded-xl"
                style={{ borderColor: "rgba(10,36,114,0.12)" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Amount</label>
              <Input type="number" value={newFeeStructure.amount} onChange={(e) => setNewFeeStructure((p) => ({ ...p, amount: Number(e.target.value) }))}
                className="h-9 text-sm rounded-xl"
                style={{ borderColor: "rgba(10,36,114,0.12)" }} />
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Frequency</label>
              <Select value={newFeeStructure.frequency} onValueChange={(v) => setNewFeeStructure((p) => ({ ...p, frequency: v }))}>
                <SelectTrigger className="h-9 text-xs rounded-xl"
                  style={{ borderColor: "rgba(10,36,114,0.12)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["termly", "yearly", "monthly"].map((f) => (
                    <SelectItem key={f} value={f} className="text-xs capitalize">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateFeeStructure} disabled={creatingFeeStructure || !newFeeStructure.name || !newFeeStructure.class_id}
              className="text-xs rounded-xl h-9 px-3" style={{ background: NAVY }}>
              {creatingFeeStructure ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} className="mr-1" />}
              Add
            </Button>
          </div>
        )}
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
                      style={{ borderColor: "rgba(10,36,114,0.12)" }}
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
                      style={{ borderColor: "rgba(10,36,114,0.12)" }} />
                  </td>
                  <td className="pb-2 pr-2">
                    <Select
                      value={cat.frequency || "termly"}
                      onValueChange={(v) => updateCategory(i, "frequency", v)}
                      disabled={isReadOnly}>
                      <SelectTrigger className="h-8 text-xs rounded-xl w-24"
                        style={{ borderColor: "rgba(10,36,114,0.12)" }}>
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
            style={{ color: NAVY, background: "rgba(10,36,114,0.06)" }}>
            <Plus size={14} /> Add Custom Category
          </button>
        )}
      </SectionCard>

      <SectionCard title="Late Payment Settings" desc="Configure late fee rules and grace periods">
        <div className="flex items-center justify-between mb-4">
          <label className="text-xs font-medium" style={{ color: NAVY }}>Enable Late Fee</label>
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
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
          <FormField label="Maximum Late Fee">
            <Input
              type="number"
              value={form.late_fee_settings?.max_amount ?? 0}
              onChange={setLateFee("max_amount")}
              disabled={isReadOnly}
              min={0}
              className={`h-9 text-sm rounded-xl ${disabledClass}`}
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
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
              <label htmlFor="fee-fixed" className="text-xs cursor-pointer" style={{ color: NAVY }}>Fixed Amount</label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="percentage" id="fee-percentage" disabled={isReadOnly} />
              <label htmlFor="fee-percentage" className="text-xs cursor-pointer" style={{ color: NAVY }}>Percentage</label>
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
            style={{ borderColor: "rgba(10,36,114,0.12)" }} />
        </FormField>
      </SectionCard>

      <SectionCard title="Receipt Settings" desc="Configure receipt generation preferences">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium" style={{ color: NAVY }}>Auto-generate Receipts</label>
          <Switch
            checked={form.receipt_settings?.auto_generate || false}
            onCheckedChange={setReceiptToggle("auto_generate")}
            disabled={isReadOnly} />
        </div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-medium" style={{ color: NAVY }}>Show School Logo on Receipt</label>
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
              style={{ borderColor: "rgba(10,36,114,0.12)" }} />
          </FormField>
        </div>
        <FormField label="Receipt Footer Message">
          <Textarea
            value={form.receipt_settings?.footer_message || ""}
            onChange={setReceipt("footer_message")}
            disabled={isReadOnly}
            rows={3}
            className={`text-sm rounded-xl resize-none ${disabledClass}`}
            style={{ borderColor: "rgba(10,36,114,0.12)" }}
            placeholder="Thank you for your payment..." />
        </FormField>

        <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(10,36,114,0.07)" }}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium" style={{ color: NAVY }}>Enable Automatic Payment Reminders</label>
            <Switch
              checked={form.metadata?.reminder_settings?.enabled || false}
              onCheckedChange={(checked) => {
                setForm((prev: Record<string, any>) => ({
                  ...prev,
                  metadata: {
                    ...prev.metadata,
                    reminder_settings: { ...(prev.metadata?.reminder_settings || {}), enabled: checked },
                  },
                }));
              }}
              disabled={isReadOnly} />
          </div>
          {(form.metadata?.reminder_settings?.enabled) && (
            <div className="space-y-3 pl-2">
              <FormField label="Reminder Days Before Due">
                <div className="flex flex-wrap gap-2">
                  {FEE_REMINDER_DAYS.map((day) => {
                    const selected = (form.metadata?.reminder_settings?.days || []).includes(day);
                    return (
                      <button key={day} type="button"
                        onClick={() => {
                          setForm((prev: Record<string, any>) => {
                            const current: number[] = prev.metadata?.reminder_settings?.days || [];
                            const next = current.includes(day) ? current.filter((d: number) => d !== day) : [...current, day];
                            return {
                              ...prev,
                              metadata: {
                                ...prev.metadata,
                                reminder_settings: { ...(prev.metadata?.reminder_settings || {}), days: next },
                              },
                            };
                          });
                        }}
                        disabled={isReadOnly}
                        className="px-3 py-1.5 text-xs font-medium rounded-xl transition-all active:scale-95 disabled:cursor-not-allowed"
                        style={{
                          background: selected ? NAVY : "rgba(10,36,114,0.06)",
                          color: selected ? "white" : NAVY,
                          border: selected ? "none" : "1px solid rgba(10,36,114,0.12)",
                        }}>
                        {day} {day === 1 ? "day" : "days"}
                      </button>
                    );
                  })}
                </div>
              </FormField>
              <FormField label="Reminder Time">
                <Input type="time"
                  value={form.metadata?.reminder_settings?.time || "09:00"}
                  onChange={(e) => {
                    setForm((prev: Record<string, any>) => ({
                      ...prev,
                      metadata: {
                        ...prev.metadata,
                        reminder_settings: { ...(prev.metadata?.reminder_settings || {}), time: e.target.value },
                      },
                    }));
                  }}
                  disabled={isReadOnly}
                  className={`h-9 text-sm rounded-xl max-w-[200px] ${disabledClass}`}
                  style={{ borderColor: "rgba(10,36,114,0.12)" }} />
              </FormField>
            </div>
          )}
        </div>
      </SectionCard>

      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6"
            style={{ background: NAVY }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Fee Settings
          </Button>
        </div>
      )}
    </div>
  );
}
