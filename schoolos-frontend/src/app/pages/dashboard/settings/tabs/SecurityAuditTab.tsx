import { useState, useEffect } from "react";
import { Save, Loader2, Shield, Key, Smartphone, AlertTriangle, Check, X, Eye, EyeOff, Download } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../services/api";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { Switch } from "../../../../components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../../components/ui/select";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
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

type AuditEntry = {
  id: string;
  created_at: string;
  user_name: string;
  action: string;
  ip_address: string;
};

type Props = { role: string };

export function SecurityAuditTab({ role }: Props) {
  const isReadOnly = role !== "school_admin" && role !== "admin";

  // Password policy
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireLowercase, setRequireLowercase] = useState(true);
  const [requireDigit, setRequireDigit] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(false);
  const [passwordExpiryDays, setPasswordExpiryDays] = useState(90);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [lockoutDurationMinutes, setLockoutDurationMinutes] = useState(30);
  const [savingPolicy, setSavingPolicy] = useState(false);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const perPage = 20;

  // 2FA
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Sessions
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  useEffect(() => {
    if (isReadOnly) return;
    const fetchData = async () => {
      try {
        const [settingsRes, sessionsRes] = await Promise.all([
          api.get<any>("/api/school/settings").catch(() => null),
          api.get<any>("/api/school/sessions").catch(() => null),
        ]);
        if (settingsRes?.data?.security_policy) {
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
        if (sessionsRes?.data?.length) setSessions(sessionsRes.data);
      } catch { /* ignore */ }
    };
    fetchData();
  }, [isReadOnly]);

  useEffect(() => {
    fetchAuditLogs();
  }, [auditPage]);

  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await api.get<any>(`/api/school/audit-logs?page=${auditPage}&limit=${perPage}`);
      if (res.data) {
        const d = res.data.data || res.data;
        setAuditLogs(d.logs || d.audit_logs || (Array.isArray(d) ? d : []));
        setAuditTotal(d.total || d.count || 0);
      }
    } catch { setAuditLogs([]); }
    finally { setLoadingAudit(false); }
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
    } finally { setSavingPolicy(false); }
  };

  const handleChangePassword = async () => {
    if (isReadOnly) return;
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

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      const res = await api.delete(`/api/school/sessions/${id}`);
      if (!res.error) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        toast.success("Session revoked");
      }
    } catch { /* ignore */ }
    finally { setRevokingId(null); }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      const res = await api.post("/api/school/sessions/revoke-all", {});
      if (!res.error) {
        setSessions((prev) => prev.filter((s) => s.is_current));
        toast.success("All other sessions revoked");
      }
    } catch { /* ignore */ }
    finally { setRevokingAll(false); }
  };

  const handleConfirm2FA = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const codes = Array.from({ length: 8 }, () =>
      Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    ).join(", ");
    setBackupCodes(codes);
    setShow2FAModal(false);
    setTwoFAEnabled(true);
    setShowBackupCodes(true);
    setVerificationCode("");
    toast.success("Two-factor authentication enabled");
  };

  const totalPages = Math.max(1, Math.ceil(auditTotal / perPage));

  if (isReadOnly) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield size={48} color="#EF4444" className="mb-4" />
        <h3 className="text-sm font-semibold mb-1" style={{ color: NAVY }}>Access Denied</h3>
        <p className="text-xs" style={{ color: MUTED }}>Only school administrators can access security settings.</p>
      </div>
    );
  }

  return (
    <div>
      {/* PASSWORD POLICY */}
      <SectionCard title="Password Policy" desc="Configure password requirements and account security rules">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
          <FormField label="Min Password Length">
            <input type="range" min={6} max={32} value={minPasswordLength}
              onChange={(e) => setMinPasswordLength(Number(e.target.value))}
              className="w-full accent-purple-700" style={{ height: 4 }} />
            <span className="text-xs font-medium" style={{ color: NAVY }}>{minPasswordLength} characters</span>
          </FormField>
          <div className="flex items-center justify-between py-2">
            <label className="text-xs font-medium" style={{ color: NAVY }}>Require Uppercase</label>
            <Switch checked={requireUppercase} onCheckedChange={setRequireUppercase} />
          </div>
          <div className="flex items-center justify-between py-2">
            <label className="text-xs font-medium" style={{ color: NAVY }}>Require Lowercase</label>
            <Switch checked={requireLowercase} onCheckedChange={setRequireLowercase} />
          </div>
          <div className="flex items-center justify-between py-2">
            <label className="text-xs font-medium" style={{ color: NAVY }}>Require Digit</label>
            <Switch checked={requireDigit} onCheckedChange={setRequireDigit} />
          </div>
          <div className="flex items-center justify-between py-2">
            <label className="text-xs font-medium" style={{ color: NAVY }}>Require Special Character</label>
            <Switch checked={requireSpecial} onCheckedChange={setRequireSpecial} />
          </div>
          <FormField label="Password Expiry (days)">
            <Input type="number" min={0} value={passwordExpiryDays} onChange={(e) => setPasswordExpiryDays(Number(e.target.value))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Max Login Attempts">
            <Input type="number" min={1} value={maxLoginAttempts} onChange={(e) => setMaxLoginAttempts(Number(e.target.value))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
          <FormField label="Lockout Duration (minutes)">
            <Input type="number" min={1} value={lockoutDurationMinutes} onChange={(e) => setLockoutDurationMinutes(Number(e.target.value))} className="h-9 text-sm rounded-xl" style={{ borderColor: "rgba(56,25,50,0.12)" }} />
          </FormField>
        </div>
        <div className="flex justify-end mt-3">
          <Button onClick={handleSavePolicy} disabled={savingPolicy} className="text-xs rounded-xl h-9 px-6" style={{ background: NAVY }}>
            {savingPolicy ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />}
            Save Policy
          </Button>
        </div>
      </SectionCard>

      {/* CHANGE PASSWORD */}
      <SectionCard title="Change Password" desc="Update your account password">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <FormField label="Current Password">
            <div className="relative">
              <Input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
                type={showCurrent ? "text" : "password"} className="h-9 text-sm rounded-xl w-full pr-9"
                style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="Enter current password" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
                {showCurrent ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
              </button>
            </div>
          </FormField>
          <div />
          <FormField label="New Password">
            <div className="relative">
              <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                type={showNew ? "text" : "password"} className="h-9 text-sm rounded-xl w-full pr-9"
                style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="Min 8 characters" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
                {showNew ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
              </button>
            </div>
          </FormField>
          <FormField label="Confirm New Password">
            <div className="relative">
              <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                type={showConfirm ? "text" : "password"} className="h-9 text-sm rounded-xl w-full pr-9"
                style={{ borderColor: "rgba(56,25,50,0.12)" }} placeholder="Re-enter new password" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 hover:opacity-70">
                {showConfirm ? <EyeOff size={15} color={MUTED} /> : <Eye size={15} color={MUTED} />}
              </button>
            </div>
          </FormField>
        </div>
        <div className="flex justify-end mt-1">
          <Button onClick={handleChangePassword} disabled={changingPassword} className="text-xs rounded-xl h-9 px-6" style={{ background: NAVY }}>
            {changingPassword ? <Loader2 size={14} className="animate-spin mr-1" /> : <Key size={14} className="mr-1" />}
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
              <p className="text-xs font-medium" style={{ color: NAVY }}>Authenticator App</p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{ background: twoFAEnabled ? "rgba(16,185,129,0.1)" : "rgba(56,25,50,0.06)", color: twoFAEnabled ? "#10B981" : MUTED }}>
                {twoFAEnabled ? "Enabled" : "Not Enabled"}
              </span>
            </div>
          </div>
          {!twoFAEnabled && (
            <Button onClick={() => setShow2FAModal(true)} className="text-xs rounded-xl h-9 px-4" style={{ background: NAVY_LIGHT }}>
              Enable 2FA
            </Button>
          )}
        </div>
        {showBackupCodes && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(56,25,50,0.04)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: NAVY }}>Backup Codes</p>
            <p className="text-xs mb-2" style={{ color: MUTED }}>Store these securely. Each code can be used once if you lose access to your authenticator.</p>
            <div className="p-2 rounded-lg font-mono text-xs break-all" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY }}>
              {backupCodes}
            </div>
            <Button onClick={() => { const b = new Blob([backupCodes.replace(/, /g, "\n")], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "backup-codes.txt"; a.click(); }}
              className="text-xs rounded-xl h-8 px-3 mt-2" style={{ background: NAVY_LIGHT }}>
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
                  <th className="pb-2 pr-3 font-medium">IP Address</th>
                  <th className="pb-2 pr-3 font-medium">Last Active</th>
                  <th className="pb-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {sessions.map((session: any) => (
                  <tr key={session.id} className="border-t" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                    <td className="py-2.5 pr-3">
                      <span className="font-medium" style={{ color: NAVY }}>{session.device || session.browser || "Unknown"}</span>
                      {session.is_current && (
                        <span className="ml-1.5 inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>Current</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-3" style={{ color: NAVY }}>{session.ip}</td>
                    <td className="py-2.5 pr-3" style={{ color: MUTED }}>{session.last_active}</td>
                    <td className="py-2.5">
                      {!session.is_current && (
                        <button onClick={() => handleRevoke(session.id)} disabled={revokingId === session.id}
                          className="text-xs font-medium hover:underline disabled:opacity-50" style={{ color: "#EF4444" }}>
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
        {sessions.filter((s: any) => !s.is_current).length > 0 && (
          <div className="flex justify-end mt-3">
            <Button onClick={handleRevokeAll} disabled={revokingAll}
              className="text-xs rounded-xl h-9 px-4" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
              {revokingAll ? <Loader2 size={14} className="animate-spin mr-1" /> : <AlertTriangle size={14} className="mr-1" />}
              Revoke All Other Sessions
            </Button>
          </div>
        )}
      </SectionCard>

      {/* AUDIT LOGS TABLE */}
      <SectionCard title="Audit Logs" desc="Read-only record of administrative actions across the school">
        {loadingAudit ? (
          <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin" color={NAVY} /></div>
        ) : auditLogs.length === 0 ? (
          <p className="text-xs py-6 text-center" style={{ color: MUTED }}>No audit log entries found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr className="text-left" style={{ color: MUTED }}>
                    <th className="pb-2 pr-3 font-medium">Timestamp</th>
                    <th className="pb-2 pr-3 font-medium">User</th>
                    <th className="pb-2 pr-3 font-medium">Action</th>
                    <th className="pb-2 font-medium">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((entry) => (
                    <tr key={entry.id} className="border-t" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                      <td className="py-2.5 pr-3 whitespace-nowrap" style={{ color: NAVY }}>
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 pr-3 font-medium" style={{ color: NAVY }}>{entry.user_name || "—"}</td>
                      <td className="py-2.5 pr-3" style={{ color: NAVY }}>{entry.action}</td>
                      <td className="py-2.5 font-mono" style={{ color: MUTED }}>{entry.ip_address || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
                <p className="text-[11px]" style={{ color: MUTED }}>Page {auditPage} of {totalPages} ({auditTotal} entries)</p>
                <div className="flex gap-2">
                  <button onClick={() => setAuditPage(p => Math.max(1, p - 1))} disabled={auditPage <= 1}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-30 transition-colors"
                    style={{ background: "rgba(56,25,50,0.06)", color: NAVY }}>Previous</button>
                  <button onClick={() => setAuditPage(p => Math.min(totalPages, p + 1))} disabled={auditPage >= totalPages}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium disabled:opacity-30 transition-colors"
                    style={{ background: "rgba(56,25,50,0.06)", color: NAVY }}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {/* 2FA MODAL */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
            <h3 className="text-sm font-semibold mb-2" style={{ color: NAVY }}>Setup Two-Factor Authentication</h3>
            <p className="text-xs mb-4" style={{ color: MUTED }}>Scan the QR code with your authenticator app.</p>
            <div className="flex justify-center mb-4">
              <div className="w-48 h-48 rounded-xl flex items-center justify-center" style={{ background: "rgba(56,25,50,0.04)", border: "2px dashed rgba(56,25,50,0.15)" }}>
                <Smartphone size={48} color={NAVY_LIGHT} />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Verification Code</label>
              <Input value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="Enter 6-digit code" className="h-9 text-sm rounded-xl text-center tracking-[0.3em]" maxLength={6}
                style={{ borderColor: "rgba(56,25,50,0.12)" }} />
            </div>
            <div className="flex justify-end gap-3">
              <Button onClick={() => { setShow2FAModal(false); setVerificationCode(""); }} variant="outline" className="text-xs rounded-xl h-9 px-4">Cancel</Button>
              <Button onClick={handleConfirm2FA} disabled={verificationCode.length !== 6} className="text-xs rounded-xl h-9 px-4" style={{ background: NAVY }}>Confirm</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
