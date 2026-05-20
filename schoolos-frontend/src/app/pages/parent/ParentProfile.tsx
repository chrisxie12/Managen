import { useState, useEffect } from "react";
import { Bell, Phone, Mail, User, Loader2, RotateCcw } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

export function ParentProfile() {
  const { user, school, logout } = useAuth();
  const [phone, setPhone] = useState("");
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ data: { phone?: string; preferences?: Record<string, boolean> } }>("/api/school/settings/notifications")
      .then((res) => {
        setPhone(res.data?.data?.phone || "");
        setNotifySms(res.data?.data?.preferences?.sms ?? true);
        setNotifyWhatsApp(res.data?.data?.preferences?.whatsapp ?? false);
        setNotifyPush(res.data?.data?.preferences?.push ?? true);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/api/school/settings/notifications", {
        phone,
        preferences: { sms: notifySms, whatsapp: notifyWhatsApp, push: notifyPush },
      });
      toast.success("Preferences saved");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Subscribe to push notifications on mount
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    const sub = async () => {
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (existing) return;
        const res = await fetch("/api/school/push/vapid-public-key");
        const { publicKey } = await res.json();
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey,
        });
        await api.post("/api/school/push/subscribe", { subscription });
      } catch {}
    };
    sub();
  }, []);

  return (
    <div className="space-y-5">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
          {user?.fullName?.charAt(0) || "P"}
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ color: PLUM, fontFamily: "'Playfair Display', serif" }}>{user?.fullName}</h2>
          <p className="text-xs" style={{ color: MUTED }}>{school?.name}</p>
          <p className="text-[10px]" style={{ color: MUTED }}>Parent</p>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <Mail size={16} color={PLUM_LIGHT} />
          <div className="min-w-0">
            <p className="text-[10px] font-medium" style={{ color: MUTED }}>Email</p>
            <p className="text-sm" style={{ color: PLUM }}>{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
          <Phone size={16} color={PLUM_LIGHT} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium" style={{ color: MUTED }}>Phone (for alerts)</p>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              style={{ color: PLUM }}
              placeholder="+233 XX XXX XXXX"
            />
          </div>
        </div>
      </div>

      {/* Notification preferences */}
      <div className="p-4 rounded-2xl" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-3" style={{ color: PLUM }}>
          <Bell size={15} /> Notification Preferences
        </h3>
        <div className="space-y-3">
          {[
            { key: "sms", label: "SMS Alerts", desc: "Fee reminders, attendance alerts via SMS", value: notifySms, set: setNotifySms },
            { key: "whatsapp", label: "WhatsApp Updates", desc: "Report cards, exam results via WhatsApp", value: notifyWhatsApp, set: setNotifyWhatsApp },
            { key: "push", label: "Push Notifications", desc: "Real-time updates on your device", value: notifyPush, set: setNotifyPush },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium" style={{ color: PLUM }}>{item.label}</p>
                <p className="text-[11px]" style={{ color: MUTED }}>{item.desc}</p>
              </div>
              <div
                onClick={() => item.set(!item.value)}
                className="w-10 h-6 rounded-full relative cursor-pointer transition-colors"
                style={{ background: item.value ? "#10B981" : "rgba(56,25,50,0.15)" }}
              >
                <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm"
                  style={{ left: item.value ? "22px" : "4px" }} />
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-2xl text-sm font-semibold active:scale-95 transition-all disabled:opacity-50"
        style={{ background: PLUM, color: MILK }}
      >
        {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save Preferences"}
      </button>

      <button onClick={() => logout()} className="w-full py-3 rounded-2xl text-sm font-medium" 
        style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: MUTED }}>
        Sign Out
      </button>
    </div>
  );
}
