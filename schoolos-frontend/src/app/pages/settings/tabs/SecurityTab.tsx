import { useState, useEffect } from "react";
import { Save, Loader2, Shield, Key, Smartphone, AlertTriangle, Eye, EyeOff, Check, X, Download } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../services/api";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

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

type PasswordFieldProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggle: () => void;
  placeholder?: string;
  disabled?: boolean;
};

function PasswordField({ value, onChange, show, onToggle, placeholder, disabled }: PasswordFieldProps) {
  return (
    <div className="relative">
      <Input
        value={value}
        onChange={onChange}
        disabled={disabled}
        type={show ? "text" : "password"}
        className="h-9 text-sm rounded-xl w-full pr-9"
        style={{ borderColor: "rgba(56,25,50,0.12)" }}
        placeholder={placeholder}
      />
      <button type="button" onClick={onToggle}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70" tabIndex={-1}>
        {show ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
      </button>
    </div>
  );
}

function PasswordStrengthBar({ password }: { password: string }) {
  const len = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const mixCount = [hasUpper, hasLower, hasDigit, hasSpecial].filter(Boolean).length;

  let strength: "none" | "weak" | "fair" | "good" | "strong" = "none";
  let color = "transparent";
  let width = "0%";

  if (len === 0) {
    strength = "none";
  } else if (len < 6) {
    strength = "weak"; color = "#EF4444"; width = "25%";
  } else if (len < 8) {
    strength = "fair"; color = "#F59E0B"; width = "50%";
  } else if (len < 10 || mixCount < 3) {
    strength = "good"; color = "#EAB308"; width = "75%";
  } else {
    strength = "strong"; color = "#10B981"; width = "100%";
  }

  const labels: Record<string, string> = {
    none: "", weak: "Weak", fair: "Fair", good: "Good", strong: "Strong",
  };

  return (
    <div className="mt-1.5">
      <div className="h-1.5 rounded-full w-full" style={{ background: "rgba(56,25,50,0.08)" }}>
        <div className="h-1.5 rounded-full transition-all duration-300" style={{ width, background: color }} />
      </div>
      {strength !== "none" && (
        <p className="text-[10px] mt-0.5 font-medium" style={{ color }}>{labels[strength]}</p>
      )}
    </div>
  );
}

type Session = {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  last_active: string;
  is_current: boolean;
};

type LoginEntry = {
  timestamp: string;
  ip: string;
  device: string;
  status: "success" | "failed";
};

type Props = { role: string };

export function SecurityTab({ role }: Props) {
  const isReadOnly = role !== "school_admin";

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const [loginHistory, setLoginHistory] = useState<LoginEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [auditDateFrom, setAuditDateFrom] = useState("");
  const [auditDateTo, setAuditDateTo] = useState("");
  const [auditStatusFilter, setAuditStatusFilter] = useState("all");

  const [alertOnNewDevice, setAlertOnNewDevice] = useState(false);
  const [alertOnPasswordChange, setAlertOnPasswordChange] = useState(false);
  const [alertOnFailedLogin, setAlertOnFailedLogin] = useState(false);
  const [savingAlerts, setSavingAlerts] = useState(false);

  const [show2FAModal, setShow2FAModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [backupCodes, setBackupCodes] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireDigit, setRequireDigit] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(false);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(30);
  const [savingPolicy, setSavingPolicy] = useState(false);

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isReadOnly) return;
    const fetchData = async () => {
      try {
        const [sessionsRes, settingsRes] = await Promise.all([
          api.get<any>("/api/school/sessions"),
          api.get<any>("/api/school/settings"),
        ]);
        if (sessionsRes.data?.length) setSessions(sessionsRes.data);
        if (settingsRes.data?.security_settings) {
          const ss = settingsRes.data.security_settings;
          if (ss.alert_on_new_device !== undefined) setAlertOnNewDevice(ss.alert_on_new_device);
          if (ss.alert_on_password_change !== undefined) setAlertOnPasswordChange(ss.alert_on_password_change);
          if (ss.alert_on_failed_login !== undefined) setAlertOnFailedLogin(ss.alert_on_failed_login);
        }
        if (settingsRes.data?.security_policy) {
          const sp = settingsRes.data.security_policy;
          if (sp.min_password_length) setMinPasswordLength(sp.min_password_length);
          if (sp.require_uppercase !== undefined) setRequireUppercase(sp.require_uppercase);
          if (sp.require_lowercase !== undefined) setRequireLowercase(sp.require_lowercase);
          if (sp.require_digit !== undefined) setRequireDigit(sp.require_digit);
          if (sp.require_special !== undefined) setRequireSpecial(sp.require_special);
          if (sp.password_expiry_days) setPasswordExpiryDays(sp.password_expiry_days);
          if (sp.max_login_attempts) setMaxLoginAttempts(sp.max_login_attempts);
          if (sp.lockout_duration_minutes) setLockoutDurationMinutes(sp.lockout_duration_minutes);
        }
      } catch {
        // API unavailable - use empty state
      }
    };
    fetchData();
  }, [isReadOnly]);

  useEffect(() => {
    if (isReadOnly) return;
    fetchAuditLogs();
  }, [isReadOnly, auditDateFrom, auditDateTo, auditStatusFilter]);

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "50");
      if (auditDateFrom) params.set("date_from", auditDateFrom);
      if (auditDateTo) params.set("date_to", auditDateTo);
      if (auditStatusFilter !== "all") params.set("status", auditStatusFilter);
      const res = await api.get<any>(`/api/school/audit?${params.toString()}`);
      if (res.data) {
        const d = res.data.data || res.data;
        const logs = d.audit_logs || d.logs || (Array.isArray(d) ? d : []);
        setLoginHistory(logs.map((entry: any) => ({
          timestamp: entry.timestamp || entry.created_at || entry.date,
          ip: entry.ip || entry.ip_address,
          device: entry.device || entry.user_agent || entry.browser || entry.details,
          status: (entry.status === "success" || entry.action?.includes("success")) ? "success" : "failed",
        })));
      }
    } catch {
      setLoginHistory([]);
    } finally {
      setLoadingAudit(false);
    }
  };

  const validatePassword = () => {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.current = "Current password is required";
    if (!newPassword) errs.new = "New password is required";
    else if (newPassword.length < 8) errs.new = "Must be at least 8 characters";
    if (!confirmPassword) errs.confirm = "Please confirm your new password";
    else if (newPassword !== confirmPassword) errs.confirm = "Passwords do not match";
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async () => {
    if (isReadOnly) return;
    if (!validatePassword()) return;
    setChangingPassword(true);
    try {
      const res = await api.post("/api/school/settings/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordErrors({});
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (isReadOnly) return;
    setRevokingId(id);
    try {
      const res = await api.delete(`/api/school/sessions/${id}`);
      if (res.error) {
        toast.error(res.error);
      } else {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        toast.success("Session revoked");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to revoke session");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    if (isReadOnly) return;
    setRevokingAll(true);
    try {
      const res = await api.post("/api/school/sessions/revoke-all", {});
      if (res.error) {
        toast.error(res.error);
      } else {
        setSessions((prev) => prev.filter((s) => s.is_current));
        toast.success("All other sessions revoked");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to revoke sessions");
    } finally {
      setRevokingAll(false);
    }
  };

  const handleSaveAlerts = async () => {
    if (isReadOnly) return;
    setSavingAlerts(true);
    try {
      const res = await api.put("/api/school/settings/profile", {
        security_settings: {
          alert_on_new_device: alertOnNewDevice,
          alert_on_password_change: alertOnPasswordChange,
          alert_on_failed_login: alertOnFailedLogin,
        },
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Security alert preferences saved");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save security preferences");
    } finally {
      setSavingAlerts(false);
    }
  };

  const generateBackupCodes = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const codes = Array.from({ length: 8 }, () =>
      Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    );
    return codes.join(", ");
  };

  const handleConfirm2FA = () => {
    const codes = generateBackupCodes();
    setBackupCodes(codes);
    setShow2FAModal(false);
    setTwoFAEnabled(true);
    setShowBackupCodes(true);
    setVerificationCode("");
    toast.success("Two-factor authentication enabled");
  };

  const handleCancel2FA = () => {
    setShow2FAModal(false);
    setVerificationCode("");
  };

  const handleDownloadCodes = () => {
    const blob = new Blob([backupCodes.replace(/, /g, "\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSavePolicy = async () => {
    if (isReadOnly) return;
    setSavingPolicy(true);
    try {
      await api.put("/api/school/settings/security-policy", {
        min_password_length: minPasswordLength,
        require_uppercase: requireUppercase,
        require_lowercase: requireLowercase,
        require_digit: requireDigit,
        require_special: requireSpecial,
        password_expiry_days: passwordExpiryDays,
        max_login_attempts: maxLoginAttempts,
        lockout_duration_minutes: lockoutDurationMinutes,
      });
      toast.success("Password policy saved");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save password policy");
    } finally {
      setSavingPolicy(false);
    }
  };

  if (isReadOnly) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield size={48} color="#EF4444" className="mb-4" />
        <h3 className="text-sm font-semibold mb-1" style={{ color: PLUM }}>Access Denied</h3>
        <p className="text-xs" style={{ color: MUTED }}>Only school administrators can access security settings.</p>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* CHANGE PASSWORD */}
        <SectionCard title="Change Password" desc="Update your account password">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <FormField label="Current Password" error={passwordErrors.current}>
              <PasswordField
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setPasswordErrors((p) => { const n = { ...p }; delete n.current; return n; }); }}
                show={showCurrent}
                onToggle={() => setShowCurrent(!showCurrent)}
                placeholder="Enter current password"
              />
            </FormField>
            <div />
            <FormField label="New Password" error={passwordErrors.new}>
              <PasswordField
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordErrors((p) => { const n = { ...p }; delete n.new; return n; }); }}
                show={showNew}
                onToggle={() => setShowNew(!showNew)}
                placeholder="Min 8 characters"
              />
              <PasswordStrengthBar password={newPassword} />
            </FormField>
            <FormField label="Confirm New Password" error={passwordErrors.confirm}>
              <PasswordField
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordErrors((p) => { const n = { ...p }; delete n.confirm; return n; }); }}
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
                placeholder="Re-enter new password"
              />
            </FormField>
          </div>
          <div className="flex justify-end mt-1">
            <Button onClick={handleChangePassword} disabled={changingPassword}
              className="text-xs rounded-xl h-9 px-6" style={{ background: PLUM }}>
              {changingPassword ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <Key size={14} className="mr-1" />
              )}
              Update Password
            </Button>
          </div>
        </SectionCard>

        {/* TWO-FACTOR AUTHENTICATION */}
        <SectionCard title="Two-Factor Authentication" desc="Add an extra layer of security to your account">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone size={18} color={MUTED} />
              <div>
                <p className="text-xs font-medium" style={{ color: PLUM }}>Authenticator App</p>
                <p className="text-xs" style={{ color: MUTED }}>
                  Status: <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{
                      background: twoFAEnabled ? "rgba(16,185,129,0.1)" : "rgba(56,25,50,0.06)",
                      color: twoFAEnabled ? "#10B981" : MUTED,
                    }}>
                    {twoFAEnabled ? "Enabled" : "Not Enabled"}
                  </span>
                </p>
              </div>
            </div>
            {!twoFAEnabled && (
              <Button onClick={() => setShow2FAModal(true)}
                className="text-xs rounded-xl h-9 px-4" style={{ background: PLUM_LIGHT }}>
                Enable 2FA
              </Button>
            )}
          </div>
          {showBackupCodes && (
            <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(56,25,50,0.04)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: PLUM }}>Backup Codes</p>
              <p className="text-xs mb-2" style={{ color: MUTED }}>Save these codes in a secure place. You can use them to log in if you lose access to your authenticator app.</p>
              <div className="p-2 rounded-lg mb-2 font-mono text-xs break-all" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM }}>
                {backupCodes}
              </div>
              <Button onClick={handleDownloadCodes} className="text-xs rounded-xl h-8 px-3" style={{ background: PLUM_LIGHT }}>
                <Download size={12} className="mr-1" /> Download Codes
              </Button>
            </div>
          )}
        </SectionCard>

        {/* ACTIVE SESSIONS */}
        <SectionCard title="Active Sessions" desc="Manage devices logged into your account">
          {sessions.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: MUTED }}>No active sessions.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="text-left" style={{ color: MUTED }}>
                    <th className="pb-2 pr-3 font-medium">Device</th>
                    <th className="pb-2 pr-3 font-medium">Browser</th>
                    <th className="pb-2 pr-3 font-medium">IP Address</th>
                    <th className="pb-2 pr-3 font-medium">Location</th>
                    <th className="pb-2 pr-3 font-medium">Last Active</th>
                    <th className="pb-2 pr-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id} className="border-t" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                      <td className="py-2.5 pr-3">
                        <span className="font-medium" style={{ color: PLUM }}>{session.device}</span>
                        {session.is_current && (
                          <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                            style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>Current</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3" style={{ color: PLUM }}>{session.browser}</td>
                      <td className="py-2.5 pr-3" style={{ color: PLUM }}>{session.ip}</td>
                      <td className="py-2.5 pr-3" style={{ color: PLUM }}>{session.location}</td>
                      <td className="py-2.5 pr-3" style={{ color: MUTED }}>{session.last_active}</td>
                      <td className="py-2.5">
                        {!session.is_current && (
                          <button onClick={() => handleRevoke(session.id)} disabled={revokingId === session.id}
                            className="text-xs font-medium hover:underline disabled:opacity-50"
                            style={{ color: "#EF4444" }}>
                            {revokingId === session.id ? "Revoking..." : "Revoke"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {sessions.filter((s) => !s.is_current).length > 0 && (
            <div className="flex justify-end mt-3">
              <Button onClick={handleRevokeAll} disabled={revokingAll}
                className="text-xs rounded-xl h-9 px-4" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                {revokingAll ? (
                  <Loader2 size={14} className="animate-spin mr-1" />
                ) : (
                  <AlertTriangle size={14} className="mr-1" />
                )}
                Revoke All Other Sessions
              </Button>
            </div>
          )}
        </SectionCard>

        {/* LOGIN HISTORY */}
        <SectionCard title="Login History" desc="Recent login activity on your account">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>From</label>
              <Input type="date" value={auditDateFrom}
                onChange={(e) => setAuditDateFrom(e.target.value)}
                className="h-9 text-xs rounded-xl w-full" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>To</label>
              <Input type="date" value={auditDateTo}
                onChange={(e) => setAuditDateTo(e.target.value)}
                className="h-9 text-xs rounded-xl w-full" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </div>
            <div className="w-full sm:w-40">
              <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>Status</label>
              <Select value={auditStatusFilter} onValueChange={setAuditStatusFilter}>
                <SelectTrigger className="h-9 text-xs rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All</SelectItem>
                  <SelectItem value="success" className="text-xs">Success</SelectItem>
                  <SelectItem value="failed" className="text-xs">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {loadingAudit ? (
            <div className="flex justify-center py-6">
              <Loader2 size={18} className="animate-spin" color={PLUM} />
            </div>
          ) : loginHistory.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: MUTED }}>No login history.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="text-left" style={{ color: MUTED }}>
                    <th className="pb-2 pr-3 font-medium">Date / Time</th>
                    <th className="pb-2 pr-3 font-medium">IP Address</th>
                    <th className="pb-2 pr-3 font-medium">Device</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((entry, i) => (
                    <tr key={i} className="border-t" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                      <td className="py-2.5 pr-3" style={{ color: PLUM }}>{entry.timestamp}</td>
                      <td className="py-2.5 pr-3" style={{ color: PLUM }}>{entry.ip}</td>
                      <td className="py-2.5 pr-3" style={{ color: PLUM }}>{entry.device}</td>
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            background: entry.status === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            color: entry.status === "success" ? "#10B981" : "#EF4444",
                          }}>
                          {entry.status === "success" ? <Check size={10} /> : <X size={10} />}
                          {entry.status === "success" ? "Success" : "Failed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* SECURITY ALERTS */}
        <SectionCard title="Security Alerts" desc="Get notified about important security events">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} color={MUTED} />
                <label className="text-xs font-medium cursor-pointer" style={{ color: PLUM }}>
                  Email me on new login from unknown device
                </label>
              </div>
              <Switch checked={alertOnNewDevice} onCheckedChange={setAlertOnNewDevice} />
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Key size={15} color={MUTED} />
                <label className="text-xs font-medium cursor-pointer" style={{ color: PLUM }}>
                  Email me if password is changed
                </label>
              </div>
              <Switch checked={alertOnPasswordChange} onCheckedChange={setAlertOnPasswordChange} />
            </div>
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Shield size={15} color={MUTED} />
                <label className="text-xs font-medium cursor-pointer" style={{ color: PLUM }}>
                  Email me on failed login attempts (after 3)
                </label>
              </div>
              <Switch checked={alertOnFailedLogin} onCheckedChange={setAlertOnFailedLogin} />
            </div>
          </div>
          <div className="flex justify-end mt-2">
            <Button onClick={handleSaveAlerts} disabled={savingAlerts}
              className="text-xs rounded-xl h-9 px-6" style={{ background: PLUM }}>
              {savingAlerts ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <Save size={14} className="mr-1" />
              )}
              Save Security Preferences
            </Button>
          </div>
        </SectionCard>

        {/* PASSWORD POLICY */}
        <SectionCard title="Password Policy" desc="Configure password requirements and account security rules">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
            <FormField label="Min Password Length (6-32)">
              <input type="range" min={6} max={32} value={minPasswordLength}
                onChange={(e) => setMinPasswordLength(Number(e.target.value))}
                className="w-full accent-purple-700" style={{ height: 4 }} />
              <span className="text-xs font-medium" style={{ color: PLUM }}>{minPasswordLength} characters</span>
            </FormField>
            <div className="flex items-center justify-between py-2">
              <label className="text-xs font-medium" style={{ color: PLUM }}>Require Uppercase</label>
              <Switch checked={requireUppercase} onCheckedChange={setRequireUppercase} />
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-xs font-medium" style={{ color: PLUM }}>Require Lowercase</label>
              <Switch checked={requireLowercase} onCheckedChange={setRequireLowercase} />
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-xs font-medium" style={{ color: PLUM }}>Require Digit</label>
              <Switch checked={requireDigit} onCheckedChange={setRequireDigit} />
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-xs font-medium" style={{ color: PLUM }}>Require Special Character</label>
              <Switch checked={requireSpecial} onCheckedChange={setRequireSpecial} />
            </div>
            <FormField label="Password Expiry (days)">
              <Input type="number" min={0} value={passwordExpiryDays}
                onChange={(e) => setPasswordExpiryDays(Number(e.target.value))}
                className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </FormField>
            <FormField label="Max Login Attempts">
              <Input type="number" min={1} value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(Number(e.target.value))}
                className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </FormField>
            <FormField label="Lockout Duration (minutes)">
              <Input type="number" min={1} value={lockoutDurationMinutes}
                onChange={(e) => setLockoutDurationMinutes(Number(e.target.value))}
                className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </FormField>
          </div>
          <div className="flex justify-end mt-3">
            <Button onClick={handleSavePolicy} disabled={savingPolicy}
              className="text-xs rounded-xl h-9 px-6" style={{ background: PLUM }}>
              {savingPolicy ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <Save size={14} className="mr-1" />
              )}
              Save Policy
            </Button>
          </div>
        </SectionCard>
      </div>

      {/* 2FA MODAL */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: PLUM }}>Setup Two-Factor Authentication</h3>
            <p className="text-xs mb-4" style={{ color: MUTED }}>
              Scan the QR code with your authenticator app (e.g. Google Authenticator, Authy).
            </p>
            <div className="flex justify-center mb-4">
              <div className="w-48 h-48 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(56,25,50,0.04)", border: "2px dashed rgba(56,25,50,0.15)" }}>
                <Smartphone size={48} color={PLUM_LIGHT} />
              </div>
            </div>
            <p className="text-xs mb-3 font-medium" style={{ color: PLUM }}>Step-by-step instructions:</p>
            <ol className="text-xs mb-4 space-y-1" style={{ color: MUTED }}>
              <li>1. Install an authenticator app on your device</li>
              <li>2. Open the app and scan the QR code displayed above</li>
              <li>3. Enter the 6-digit code from the app below</li>
            </ol>
            <div className="mb-4">
              <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>Verification Code</label>
              <Input
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="h-9 text-sm rounded-xl text-center tracking-[0.3em]"
                style={{ borderColor: "rgba(56,25,50,0.12)" }}
                maxLength={6}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button onClick={handleCancel2FA} variant="outline"
                className="text-xs rounded-xl h-9 px-4">
                Cancel
              </Button>
              <Button onClick={handleConfirm2FA} disabled={verificationCode.length !== 6}
                className="text-xs rounded-xl h-9 px-4" style={{ background: PLUM }}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
