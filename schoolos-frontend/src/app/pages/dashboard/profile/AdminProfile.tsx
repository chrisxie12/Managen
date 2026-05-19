import { useState, useEffect, useRef } from "react";
import {
  Save, Loader2, Camera, Key, Shield, Sun, Moon, Bell,
  Smartphone, Eye, EyeOff, Check, X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../contexts/AuthContext";
import { api } from "../../../services/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../../../components/ui/avatar";
import { Separator } from "../../../components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "../../../components/ui/alert";
import { Switch } from "../../../components/ui/switch";

const PLUM = "#381932";
const MUTED = "#7D6077";

function AdminProfile() {
  const { user, refresh } = useAuth();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarDataUri, setAvatarDataUri] = useState<string | null>(null);
  const [savingPersonal, setSavingPersonal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [dailySummaries, setDailySummaries] = useState(true);
  const [webhookAlerts, setWebhookAlerts] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setPhone("");
    setAvatarUrl("");
    (async () => {
      try {
        const res = await api.get<any>("/api/auth/me");
        if (res?.data?.user) {
          const u = res.data.user;
          setPhone(u.phone || "");
          setAvatarUrl(u.avatar_url || "");
        }
      } catch { /* ignore */ }
      try {
        const prefsRes = await api.get<any>(`/api/school/settings/kv/user_prefs_${user.id}`).catch(() => null);
        if (prefsRes?.data) {
          const p = prefsRes.data.data || prefsRes.data;
          if (p.theme) setTheme(p.theme);
          if (p.daily_summaries !== undefined) setDailySummaries(p.daily_summaries);
          if (p.webhook_alerts !== undefined) setWebhookAlerts(p.webhook_alerts);
        }
      } catch { /* ignore */ }
      try {
        const secRes = await api.get<any>("/api/school/settings").catch(() => null);
        if (secRes?.data?.security_policy?.two_factor_enabled) {
          setTwoFAEnabled(true);
        }
      } catch { /* ignore */ }
    })();
  }, [user]);

  const initials = user
    ? user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("File must be under 2MB"); return; }
    if (!["image/png", "image/jpeg", "image/svg+xml"].includes(file.type)) {
      toast.error("Only PNG, JPG, and SVG files are allowed"); return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUri = ev.target?.result as string;
      setAvatarUrl(dataUri);
      setAvatarDataUri(dataUri);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePersonal = async () => {
    if (!user) return;
    if (!fullName.trim()) { toast.error("Full name is required"); return; }
    setSavingPersonal(true);
    try {
      let newAvatarUrl = avatarUrl;
      if (avatarDataUri) {
        const uploadRes = await api.post<any>("/api/user/upload-avatar", {
          userId: user.id,
          imageDataUri: avatarDataUri,
        });
        newAvatarUrl = uploadRes.data?.avatar_url || avatarUrl;
      }
      const res = await api.put<any>(`/api/school/users/${user.id}`, {
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
      if (res.data) {
        setAvatarFile(null);
        toast.success("Profile updated");
        refresh();
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile");
    } finally { setSavingPersonal(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required"); return;
    }
    if (newPassword.length < 8) { toast.error("New password must be at least 8 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setChangingPassword(true);
    try {
      const res = await api.post("/api/school/settings/change-password", {
        current_password: currentPassword, new_password: newPassword,
      });
      if (res.error) { toast.error(res.error); }
      else {
        toast.success("Password changed successfully");
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      }
    } catch (err: any) { toast.error(err?.message || "Failed to change password"); }
    finally { setChangingPassword(false); }
  };

  const handleSavePreferences = async () => {
    if (!user) return;
    setSavingPreferences(true);
    try {
      await api.put("/api/school/settings/kv", {
        key: `user_prefs_${user.id}`,
        value: { theme, daily_summaries: dailySummaries, webhook_alerts: webhookAlerts },
      });
      toast.success("Preferences saved");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save preferences");
    } finally { setSavingPreferences(false); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-lg font-bold" style={{ color: PLUM }}>My Profile</h1>
        <p className="text-xs mt-0.5" style={{ color: MUTED }}>Manage your personal account settings and preferences</p>
      </div>

      {/* ─── Section 1: Personal Details ─── */}
      <Card className="border rounded-2xl" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold" style={{ color: PLUM }}>Personal Details</CardTitle>
          <CardDescription className="text-xs" style={{ color: MUTED }}>Update your name, contact information, and profile photo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <Avatar className="w-20 h-20 rounded-2xl" style={{ border: "3px solid rgba(56,25,50,0.1)" }}>
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="text-sm font-bold rounded-2xl" style={{ background: PLUM, color: "#FFF3E6" }}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} color="white" />
              </div>
              <input ref={avatarInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml"
                onChange={handleAvatarChange} className="hidden" />
            </div>
            <div className="text-xs leading-relaxed" style={{ color: MUTED }}>
              <p className="font-medium" style={{ color: PLUM }}>{user?.fullName}</p>
              <p>{user?.email}</p>
              <p className="capitalize">{user?.role?.replace(/_/g, " ")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: PLUM }}>Full Name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: PLUM }}>Email</Label>
              <Input value={user?.email || ""} disabled readOnly
                className="h-9 text-sm rounded-xl opacity-60" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: PLUM }}>Phone Number</Label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9+]/g, ""))}
                className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="+233 XX XXX XXXX" />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={handleSavePersonal} disabled={savingPersonal}
              className="text-xs rounded-xl h-9 px-6" style={{ background: PLUM }}>
              {savingPersonal ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Section 2: Account Security ─── */}
      <Card className="border rounded-2xl" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold" style={{ color: PLUM }}>Account Security</CardTitle>
          <CardDescription className="text-xs" style={{ color: MUTED }}>Change your password and review security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {twoFAEnabled && (
            <Alert className="rounded-xl border" style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.2)" }}>
              <Shield size={16} color="#10B981" />
              <AlertTitle className="text-xs font-medium" style={{ color: "#10B981" }}>
                <Check size={12} className="inline mr-1" />Two-factor authentication is active
              </AlertTitle>
              <AlertDescription className="text-xs" style={{ color: MUTED }}>
                Your account is protected with an additional verification step during sign-in.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: PLUM }}>Current Password</Label>
              <div className="relative">
                <Input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                  type={showCurrent ? "text" : "password"}
                  className="h-9 text-sm rounded-xl w-full pr-9"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="Enter current password" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
                  {showCurrent ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
                </button>
              </div>
            </div>
            <div />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: PLUM }}>New Password</Label>
              <div className="relative">
                <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                  type={showNew ? "text" : "password"}
                  className="h-9 text-sm rounded-xl w-full pr-9"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
                  {showNew ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium" style={{ color: PLUM }}>Confirm New Password</Label>
              <div className="relative">
                <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  className="h-9 text-sm rounded-xl w-full pr-9"
                  style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="Re-enter new password" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
                  {showConfirm ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={handleChangePassword} disabled={changingPassword}
              className="text-xs rounded-xl h-9 px-6" style={{ background: PLUM }}>
              {changingPassword ? <Loader2 size={14} className="animate-spin mr-1" /> : <Key size={14} className="mr-1" />}
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Section 3: App Preferences ─── */}
      <Card className="border rounded-2xl" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
        <CardHeader>
          <CardTitle className="text-sm font-semibold" style={{ color: PLUM }}>App Preferences</CardTitle>
          <CardDescription className="text-xs" style={{ color: MUTED }}>
            Customize your theme and personal notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              {theme === "dark" ? <Moon size={16} color={MUTED} /> : <Sun size={16} color={MUTED} />}
              <div>
                <p className="text-xs font-medium" style={{ color: PLUM }}>Theme</p>
                <p className="text-[11px]" style={{ color: MUTED }}>{theme === "dark" ? "Dark mode" : "Light mode"}</p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
          </div>

          <Separator />

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <Bell size={16} color={MUTED} />
              <div>
                <p className="text-xs font-medium" style={{ color: PLUM }}>Email me daily attendance summaries</p>
                <p className="text-[11px]" style={{ color: MUTED }}>Receive a daily digest of attendance records</p>
              </div>
            </div>
            <Switch checked={dailySummaries} onCheckedChange={setDailySummaries} />
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <Smartphone size={16} color={MUTED} />
              <div>
                <p className="text-xs font-medium" style={{ color: PLUM }}>SMS me on failed Paystack webhooks</p>
                <p className="text-[11px]" style={{ color: MUTED }}>Get an SMS alert when a payment webhook fails</p>
              </div>
            </div>
            <Switch checked={webhookAlerts} onCheckedChange={setWebhookAlerts} />
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={handleSavePreferences} disabled={savingPreferences}
              className="text-xs rounded-xl h-9 px-6" style={{ background: PLUM }}>
              {savingPreferences ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export { AdminProfile };
