import { useState, useEffect, useCallback } from "react";
import { Save, Loader2, Eye, EyeOff, GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "../../../../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import { api } from "../../../../services/api";

const NAVY = "#0A2472";
const MUTED = "#6B7280";

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
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

const DEFAULT_FEE_ITEMS = [
  { id: "1", label: "Tuition", enabled: true },
  { id: "2", label: "Development Levy", enabled: true },
  { id: "3", label: "ICT Fee", enabled: true },
  { id: "4", label: "Sports & Culture", enabled: true },
  { id: "5", label: "PTA Levy", enabled: true },
  { id: "6", label: "Library Fee", enabled: false },
  { id: "7", label: "Examination Fee", enabled: true },
  { id: "8", label: "Boarding Fee", enabled: false },
];

type FeeItem = { id: string; label: string; enabled: boolean };

type Props = { role: string };

export function PaystackConfigTab({ role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "admin";
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showPublic, setShowPublic] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [feeBurden, setFeeBurden] = useState("absorb_surcharge");
  const [feeItems, setFeeItems] = useState<FeeItem[]>(DEFAULT_FEE_ITEMS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get<any>("/api/school/settings/kv/paystack_config").catch(() => null);
        if (res?.data) {
          const cfg = res.data.data || res.data;
          if (cfg.public_key) setPublicKey(cfg.public_key);
          if (cfg.secret_key) setSecretKey(cfg.secret_key);
          if (cfg.fee_burden) setFeeBurden(cfg.fee_burden);
          if (cfg.fee_items?.length) setFeeItems(cfg.fee_items);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    if (isReadOnly) return;
    setSaving(true);
    try {
      const payload = {
        key: "paystack_config",
        value: { public_key: publicKey, secret_key: secretKey, fee_burden: feeBurden, fee_items: feeItems },
      };
      const res = await api.put<any>("/api/school/settings/kv", payload);
      if (res.data) toast.success("Paystack configuration saved");
      else toast.error(res.error || "Failed to save");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save Paystack config");
    } finally { setSaving(false); }
  };

  const moveItem = useCallback((index: number, direction: "up" | "down") => {
    setFeeItems(prev => {
      const next = [...prev];
      const swap = direction === "up" ? index - 1 : index + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setFeeItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));
  }, []);

  const addItem = useCallback(() => {
    const newId = String(Date.now());
    setFeeItems(prev => [...prev, { id: newId, label: "", enabled: true }]);
  }, []);

  const updateItemLabel = useCallback((id: string, label: string) => {
    setFeeItems(prev => prev.map(i => i.id === id ? { ...i, label } : i));
  }, []);

  const removeItem = useCallback((id: string) => {
    setFeeItems(prev => prev.filter(i => i.id !== id));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[30vh]"><Loader2 className="animate-spin" size={24} color={NAVY} /></div>;
  }

  return (
    <div>
      <SectionCard title="API Keys" desc="Your Paystack integration credentials">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Public Key">
            <div className="relative">
              <Input value={publicKey} onChange={(e) => setPublicKey(e.target.value)}
                type={showPublic ? "text" : "password"}
                className="h-9 text-xs rounded-xl font-mono w-full pr-9"
                style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="pk_live_..." />
              <button type="button" onClick={() => setShowPublic(!showPublic)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
                {showPublic ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
              </button>
            </div>
          </FormField>
          <FormField label="Secret Key">
            <div className="relative">
              <Input value={secretKey} onChange={(e) => setSecretKey(e.target.value)}
                type={showSecret ? "text" : "password"}
                className="h-9 text-xs rounded-xl font-mono w-full pr-9"
                style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="sk_live_..." />
              <button type="button" onClick={() => setShowSecret(!showSecret)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
                {showSecret ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
              </button>
            </div>
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Transaction Fee Handling" desc="Configure how Paystack transaction fees are managed">
        <FormField label="Transaction Fee Burden">
          <Select value={feeBurden} onValueChange={setFeeBurden} disabled={isReadOnly}>
            <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="absorb_surcharge" className="text-xs">Absorb Surcharge (School pays)</SelectItem>
              <SelectItem value="pass_to_parent" className="text-xs">Pass to Parent (Parent pays)</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
      </SectionCard>

      <SectionCard title="Fee Priority Ledger" desc="Drag to reorder. Priority determines allocation order when auto-applying payments.">
        <div className="space-y-1.5">
          {feeItems.map((item, index) => (
            <div key={item.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{ background: "rgba(56,25,50,0.04)", border: "1px solid rgba(56,25,50,0.06)" }}>
              <div className="flex flex-col gap-0.5">
                <button onClick={() => moveItem(index, "up")} disabled={index === 0 || isReadOnly}
                  className="text-[8px] leading-none hover:opacity-70 disabled:opacity-20" style={{ color: MUTED }}>▲</button>
                <button onClick={() => moveItem(index, "down")} disabled={index === feeItems.length - 1 || isReadOnly}
                  className="text-[8px] leading-none hover:opacity-70 disabled:opacity-20" style={{ color: MUTED }}>▼</button>
              </div>
              <GripVertical size={14} color={MUTED} className="shrink-0" />
              <Switch checked={item.enabled} onCheckedChange={() => toggleItem(item.id)} disabled={isReadOnly} />
              <Input value={item.label} onChange={(e) => updateItemLabel(item.id, e.target.value)}
                disabled={isReadOnly}
                className="h-7 text-xs rounded-xl flex-1 min-w-0"
                style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="Fee item name" />
              <span className="text-[10px] font-mono shrink-0" style={{ color: MUTED }}>#{index + 1}</span>
              {!isReadOnly && feeItems.length > 1 && (
                <button onClick={() => removeItem(item.id)} className="p-1 rounded-lg hover:bg-red-50 transition-colors">
                  <Trash2 size={13} color="#EF4444" />
                </button>
              )}
            </div>
          ))}
        </div>
        {!isReadOnly && (
          <button onClick={addItem} className="mt-2 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors"
            style={{ color: NAVY, background: "rgba(56,25,50,0.06)" }}>
            <Plus size={14} /> Add Fee Item
          </button>
        )}
      </SectionCard>

      {!isReadOnly && (
        <div className="flex justify-end mt-2">
          <Button onClick={handleSave} disabled={saving} className="text-xs rounded-xl h-9 px-6" style={{ background: NAVY }}>
            {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Paystack Config
          </Button>
        </div>
      )}
    </div>
  );
}
