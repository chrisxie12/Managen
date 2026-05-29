import { useState, useEffect, useCallback } from "react";
import { Clock, LogIn, LogOut, Loader2, Check, X, AlertCircle, Calendar, Users, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "../services/api";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type DailyLink = { id: string; link_type: string; link_code: string; date: string; active_from: string; active_until: string; is_active: boolean };
type DailyRecord = {
  id: string; user_id: string; date: string;
  sign_in_time: string | null; sign_out_time: string | null;
  sign_in_status: string; sign_out_status: string;
  override_reason: string | null;
  user?: { name: string; email: string; role_title?: string; department?: string };
};

function AlertBanner({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) {
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{
      background: type === "error" ? "#FEF2F2" : "#D1FAE5",
      color: type === "error" ? "#EF4444" : "#065F46",
      border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}`,
      fontSize: "0.9rem"
    }}>
      {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
}

function LoadingSpinner({ height = 48 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <Loader2 className="animate-spin" size={24} color={NAVY} />
    </div>
  );
}

function Pagination({ page, total, limit, onChange }: { page: number; total: number; limit: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm" style={{ borderTop: "1px solid rgba(10,36,114,0.07)" }}>
      <span style={{ color: MUTED }}>{total} record{total !== 1 ? "s" : ""}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: NAVY, border: "1px solid rgba(10,36,114,0.12)" }}>
          <ChevronLeft size={14} />
        </button>
        <span className="font-medium px-2" style={{ color: NAVY }}>{page} / {totalPages}</span>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: NAVY, border: "1px solid rgba(10,36,114,0.12)" }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    on_time: { bg: "#D1FAE5", color: "#065F46", label: "On Time" },
    late: { bg: "#FEF3C7", color: "#92400E", label: "Late" },
    early: { bg: "#FEF3C7", color: "#92400E", label: "Early" },
    manual: { bg: "#DBEAFE", color: "#1E40AF", label: "Manual" },
    none: { bg: "#F3F4F6", color: "#6B7280", label: "—" },
  };
  const c = config[status] || config.none;
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

export function DailySignIn() {
  const [tab, setTab] = useState("dashboard");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      {success && <AlertBanner type="success" message={success} onClose={() => setSuccess("")} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: NAVY }}>Daily Sign-In / Sign-Out</h2>
          <p className="text-sm" style={{ color: MUTED }}>Staff attendance with time-boxed links</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "dashboard", label: "My Attendance", icon: Clock },
            { key: "records", label: "All Records", icon: Users },
            { key: "override", label: "Override", icon: Edit3 },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{
                background: tab === t.key ? NAVY : "white",
                color: tab === t.key ? CREAM : NAVY_LIGHT,
                border: tab === t.key ? "none" : "1px solid rgba(10,36,114,0.1)",
              }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "dashboard" && <StaffDashboardTab setError={setError} setSuccess={setSuccess} />}
      {tab === "records" && <AllRecordsTab />}
      {tab === "override" && <OverrideTab setError={setError} setSuccess={setSuccess} />}
    </div>
  );
}

function StaffDashboardTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [links, setLinks] = useState<DailyLink[]>([]);
  const [todayRecord, setTodayRecord] = useState<DailyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const load = useCallback(async () => {
    try {
      const [linksRes, recordsRes] = await Promise.all([
        api.get<{ data: { links: DailyLink[] } }>("/api/school/features/daily-attendance/current-links"),
        api.get<{ data: { records: DailyRecord[]; total: number } }>("/api/school/features/daily-attendance"),
      ]);
      setLinks(linksRes.data?.data?.links || []);
      const records = recordsRes.data?.data?.records || [];
      const myRecord = records.find((r: any) => r.user_id === (window as any).__USER_ID__);
      if (myRecord) setTodayRecord(myRecord);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const signIn = async () => {
    const signInLink = links.find(l => l.link_type === "signin");
    if (!signInLink) return;
    setSigningIn(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/api/school/features/daily-attendance/signin", { linkCode: signInLink.link_code });
      setSuccess("Sign-in recorded successfully!");
      load();
    } catch (err: any) {
      setError(err.message || "Sign-in failed");
    } finally { setSigningIn(false); }
  };

  const signOut = async () => {
    const signOutLink = links.find(l => l.link_type === "signout");
    if (!signOutLink) return;
    setSigningOut(true);
    setError("");
    setSuccess("");
    try {
      await api.post("/api/school/features/daily-attendance/signout", { linkCode: signOutLink.link_code });
      setSuccess("Sign-out recorded successfully!");
      load();
    } catch (err: any) {
      setError(err.message || "Sign-out failed");
    } finally { setSigningOut(false); }
  };

  const isLinkActive = (link: DailyLink) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    return timeStr >= link.active_from && timeStr <= link.active_until;
  };

  if (loading) return <LoadingSpinner height={200} />;

  const signInLink = links.find(l => l.link_type === "signin");
  const signOutLink = links.find(l => l.link_type === "signout");
  const signInActive = signInLink && isLinkActive(signInLink);
  const signOutActive = signOutLink && isLinkActive(signOutLink);
  const alreadySignedIn = todayRecord?.sign_in_time;
  const alreadySignedOut = todayRecord?.sign_out_time;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="p-6 rounded-xl text-center" style={{
          background: alreadySignedIn ? "#D1FAE5" : signInActive ? "white" : "#F3F4F6",
          border: `1px solid ${alreadySignedIn ? "#A7F3D0" : signInActive ? NAVY : "rgba(10,36,114,0.07)"}`,
        }}>
          <LogIn size={32} className="mx-auto mb-3" style={{ color: alreadySignedIn ? "#065F46" : signInActive ? NAVY : MUTED }} />
          <h3 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>Sign In</h3>
          {signInLink && (
            <p className="text-xs mb-3" style={{ color: MUTED }}>
              {signInLink.active_from.slice(0, 5)} – {signInLink.active_until.slice(0, 5)}
            </p>
          )}
          {alreadySignedIn ? (
            <div>
              <span className="flex items-center justify-center gap-1 text-sm font-medium" style={{ color: "#065F46" }}>
                <Check size={14} /> Signed in at {new Date(todayRecord.sign_in_time!).toLocaleTimeString()}
              </span>
              <StatusBadge status={todayRecord.sign_in_status} />
            </div>
          ) : (
            <button onClick={signIn} disabled={!signInActive || signingIn}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: signInActive ? `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` : "#E5E7EB", color: signInActive ? CREAM : MUTED }}>
              {signingIn ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
              {signingIn ? "Signing in..." : signInActive ? "Tap to Sign In" : "Link not active yet"}
            </button>
          )}
        </div>

        <div className="p-6 rounded-xl text-center" style={{
          background: alreadySignedOut ? "#D1FAE5" : signOutActive ? "white" : "#F3F4F6",
          border: `1px solid ${alreadySignedOut ? "#A7F3D0" : signOutActive ? NAVY : "rgba(10,36,114,0.07)"}`,
        }}>
          <LogOut size={32} className="mx-auto mb-3" style={{ color: alreadySignedOut ? "#065F46" : signOutActive ? NAVY : MUTED }} />
          <h3 className="font-semibold text-sm mb-1" style={{ color: NAVY }}>Sign Out</h3>
          {signOutLink && (
            <p className="text-xs mb-3" style={{ color: MUTED }}>
              {signOutLink.active_from.slice(0, 5)} – {signOutLink.active_until.slice(0, 5)}
            </p>
          )}
          {alreadySignedOut ? (
            <div>
              <span className="flex items-center justify-center gap-1 text-sm font-medium" style={{ color: "#065F46" }}>
                <Check size={14} /> Signed out at {new Date(todayRecord.sign_out_time!).toLocaleTimeString()}
              </span>
              <StatusBadge status={todayRecord.sign_out_status} />
            </div>
          ) : (
            <button onClick={signOut} disabled={!signOutActive || signingOut}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold active:scale-95 transition-transform disabled:opacity-50"
              style={{ background: signOutActive ? `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})` : "#E5E7EB", color: signOutActive ? CREAM : MUTED }}>
              {signingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
              {signingOut ? "Signing out..." : signOutActive ? "Tap to Sign Out" : "Link not active yet"}
            </button>
          )}
        </div>
      </div>

      {todayRecord && (
        <div className="p-4 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
          <h3 className="font-semibold text-sm mb-2" style={{ color: NAVY }}>Today's Attendance</h3>
          <div className="flex items-center gap-4 text-sm" style={{ color: MUTED }}>
            <span>Date: {todayRecord.date}</span>
            <span>Sign In: {todayRecord.sign_in_time ? new Date(todayRecord.sign_in_time).toLocaleTimeString() : "—"}</span>
            <span>Sign Out: {todayRecord.sign_out_time ? new Date(todayRecord.sign_out_time).toLocaleTimeString() : "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AllRecordsTab() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateFilter) params.set("date", dateFilter);
      params.set("page", String(page));
      params.set("limit", String(limit));
      const res = await api.get<{ data: { records: DailyRecord[]; total: number } }>(`/api/school/features/daily-attendance?${params}`);
      setRecords(res.data?.data?.records || []);
      setTotal(res.data?.data?.total || 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [dateFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [dateFilter]);

  return (
    <div>
      <div className="flex gap-3 mb-4">
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }} />
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        {loading ? <LoadingSpinner height={200} /> : records.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={40} color={MUTED} className="mx-auto mb-3" />
            <p style={{ color: NAVY, fontWeight: 600 }}>No records for this date</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
                    <th className="px-4 py-3 font-medium">Staff</th>
                    <th className="px-4 py-3 font-medium">Department</th>
                    <th className="px-4 py-3 font-medium">Sign In</th>
                    <th className="px-4 py-3 font-medium">Sign Out</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="text-sm" style={{ borderBottom: "1px solid rgba(10,36,114,0.05)" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                            {(r.user?.name || "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <div>
                            <span className="font-medium" style={{ color: NAVY }}>{r.user?.name}</span>
                            <span className="text-xs ml-1" style={{ color: MUTED }}>({r.user?.role_title || r.user?.email})</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{r.user?.department || "—"}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>
                        {r.sign_in_time ? new Date(r.sign_in_time).toLocaleTimeString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>
                        {r.sign_out_time ? new Date(r.sign_out_time).toLocaleTimeString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <StatusBadge status={r.sign_in_status} />
                          <StatusBadge status={r.sign_out_status} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={total} limit={limit} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

function OverrideTab({ setError, setSuccess }: { setError: (s: string) => void; setSuccess: (s: string) => void }) {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<DailyRecord | null>(null);
  const [signInTime, setSignInTime] = useState("");
  const [signOutTime, setSignOutTime] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get<{ data: { records: DailyRecord[]; total: number } }>("/api/school/features/daily-attendance?limit=50")
      .then(res => setRecords(res.data?.data?.records || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openOverride = (record: DailyRecord) => {
    setSelectedRecord(record);
    setSignInTime(record.sign_in_time ? new Date(record.sign_in_time).toISOString().slice(0, 16) : "");
    setSignOutTime(record.sign_out_time ? new Date(record.sign_out_time).toISOString().slice(0, 16) : "");
    setReason(record.override_reason || "");
  };

  const saveOverride = async () => {
    if (!selectedRecord || !reason) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.put(`/api/school/features/daily-attendance/override/${selectedRecord.id}`, {
        sign_in_time: signInTime || null,
        sign_out_time: signOutTime || null,
        sign_in_status: signInTime ? "manual" : "none",
        sign_out_status: signOutTime ? "manual" : "none",
        reason,
      });
      setSuccess("Attendance record updated successfully.");
      setSelectedRecord(null);
    } catch (err: any) {
      setError(err.message || "Override failed");
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner height={200} />;

  return (
    <div className="space-y-6">
      <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
                <th className="px-4 py-3 font-medium">Staff</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Sign In</th>
                <th className="px-4 py-3 font-medium">Sign Out</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="text-sm" style={{ borderBottom: "1px solid rgba(10,36,114,0.05)" }}>
                  <td className="px-4 py-3 font-medium" style={{ color: NAVY }}>{r.user?.name || "—"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{r.date}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{r.sign_in_time ? new Date(r.sign_in_time).toLocaleTimeString() : "—"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{r.sign_out_time ? new Date(r.sign_out_time).toLocaleTimeString() : "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openOverride(r)}
                      className="px-3 py-1 rounded-lg text-xs font-medium"
                      style={{ background: NAVY, color: CREAM }}>
                      Override
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRecord && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRecord(null)}>
          <div className="w-full max-w-md p-6 rounded-2xl" style={{ background: CREAM }} onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-sm mb-4" style={{ color: NAVY }}>
              Override Attendance: {selectedRecord.user?.name}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Sign In Time</label>
                <input type="datetime-local" value={signInTime} onChange={(e) => setSignInTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl outline-none text-sm"
                  style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Sign Out Time</label>
                <input type="datetime-local" value={signOutTime} onChange={(e) => setSignOutTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl outline-none text-sm"
                  style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Reason for Override *</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-xl outline-none text-sm resize-none"
                  style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}
                  placeholder="Explain why this override is necessary..." />
              </div>
              <div className="flex gap-2">
                <button onClick={saveOverride} disabled={saving || !reason}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold active:scale-95 disabled:opacity-50"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                  {saving ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Save Override"}
                </button>
                <button onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2.5 rounded-xl text-sm"
                  style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
