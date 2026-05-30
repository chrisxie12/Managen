import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, X, Loader2, Search, Mail, Phone,
  UserCheck, UserX, Copy, CheckCircle2, AlertCircle,
} from "lucide-react";
import { api } from "../services/api";

const NAVY = "#031B4E";
const NAVY_LIGHT = "#0069D9";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type SchoolUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  role_name: string;
  role_identifier: string;
  role_id: string | null;
  is_active: boolean;
  suspended_at: string | null;
  invited_at: string | null;
  last_login: string | null;
  created_at: string;
};

type Role = { id: string; name: string; label: string };

export function AdminUsers() {
  const [users, setUsers] = useState<SchoolUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ full_name: "", email: "", phone: "", role_id: "" });
  const [inviteResult, setInviteResult] = useState<{ tempPassword: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const limit = 20;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (search) params.set("search", search);
      if (filterRole) params.set("role", filterRole);
      if (filterStatus) params.set("status", filterStatus);

      const [usersRes, rolesRes] = await Promise.all([
        api.get<{ users: SchoolUser[]; total: number }>(`/api/school/users?${params}`),
        api.get<{ roles: Role[] }>("/api/school/roles"),
      ]);

      setUsers(usersRes.data?.users || []);
      setTotal(usersRes.data?.total || 0);
      setRoles(rolesRes.data?.roles || []);
    } catch (err: any) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, filterRole, filterStatus]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const inviteUser = async () => {
    if (!inviteForm.full_name || !inviteForm.email || !inviteForm.role_id) return;
    setSaving(true);
    setInviteResult(null);
    try {
      const res = await api.post<{ user: SchoolUser; tempPassword: string }>("/api/school/users/invite", inviteForm);
      setInviteResult({ tempPassword: res.data!.tempPassword });
      setInviteForm({ full_name: "", email: "", phone: "", role_id: "" });
      await loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to invite user");
    } finally {
      setSaving(false);
    }
  };

  const toggleUserStatus = async (user: SchoolUser) => {
    try {
      if (user.is_active) {
        await api.put(`/api/school/users/${user.id}/suspend`);
      } else {
        await api.put(`/api/school/users/${user.id}/activate`);
      }
      await loadUsers();
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const statusColors: Record<string, { bg: string; color: string; label: string }> = {
    active: { bg: "#D1FAE5", color: "#065F46", label: "Active" },
    suspended: { bg: "#FEF2F2", color: "#EF4444", label: "Suspended" },
    invited: { bg: "#FEF3C7", color: "#92400E", label: "Invited" },
  };

  const getStatus = (u: SchoolUser) => {
    if (!u.is_active && u.suspended_at) return "suspended";
    if (!u.is_active && u.invited_at) return "invited";
    if (u.is_active) return "active";
    return "suspended";
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", fontSize: "0.9rem" }}>
          <AlertCircle size={14} /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: NAVY }}>Users</h2>
          <p className="text-sm" style={{ color: MUTED }}>{total} user{total !== 1 ? "s" : ""} in your school</p>
        </div>
        <button onClick={() => { setShowInvite(true); setInviteResult(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
          <Plus size={16} /> Invite User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", maxWidth: 300 }}>
          <Search size={14} color={MUTED} />
          <input placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="bg-transparent outline-none text-sm flex-1" style={{ color: NAVY }} />
        </div>
        <select value={filterRole} onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
          <option value="">All roles</option>
          {roles.map(r => <option key={r.id} value={r.name}>{r.label}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin" size={32} color={NAVY} />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
          <Users size={40} color={MUTED} className="mx-auto mb-3" />
          <p className="font-semibold" style={{ color: NAVY }}>No users found</p>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Invite your first staff member to get started</p>
        </div>
      ) : (
        <>
          <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)", boxShadow: "0 2px 12px rgba(10,36,114,0.04)" }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Contact</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Last Login</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const status = getStatus(u);
                    const st = statusColors[status];
                    return (
                      <tr key={u.id} className="text-sm" style={{ borderBottom: "1px solid rgba(10,36,114,0.05)" }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                              {u.full_name?.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase() || "?"}
                            </div>
                            <div>
                              <p className="font-semibold" style={{ color: NAVY }}>{u.full_name}</p>
                              <p className="text-xs" style={{ color: MUTED }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{ background: "rgba(99,102,241,0.1)", color: "#6366F1" }}>
                            {u.role_name || u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                              <Mail size={12} /> {u.email}
                            </div>
                            {u.phone && (
                              <div className="flex items-center gap-1.5 text-xs" style={{ color: MUTED }}>
                                <Phone size={12} /> {u.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: st.bg, color: st.color }}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>
                          {u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleUserStatus(u)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all active:scale-95"
                            style={{ background: u.is_active ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", color: u.is_active ? "#EF4444" : "#16A34A" }}>
                            {u.is_active ? <UserX size={12} /> : <UserCheck size={12} />}
                            {u.is_active ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-2 rounded-lg text-sm disabled:opacity-40" style={{ border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
                Previous
              </button>
              <span className="text-sm px-3" style={{ color: MUTED }}>Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-2 rounded-lg text-sm disabled:opacity-40" style={{ border: "1px solid rgba(10,36,114,0.1)", color: NAVY }}>
                Next
              </button>
            </div>
          )}
        </>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,36,114,0.6)", backdropFilter: "blur(4px)" }}
          onMouseDown={(e) => e.target === e.currentTarget && !saving && (setShowInvite(false), setInviteResult(null))}>
          <div className="w-full max-w-md rounded-[32px] p-8" style={{ background: "white", boxShadow: "0 32px 80px rgba(10,36,114,0.3)" }}
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}>
                  {inviteResult ? "User Invited" : "Invite User"}
                </h2>
                <p className="text-sm" style={{ color: MUTED }}>
                  {inviteResult ? "Share the temporary password" : "Add a new staff member to your school"}
                </p>
              </div>
              <button onClick={() => { setShowInvite(false); setInviteResult(null); }} className="p-2 rounded-full hover:opacity-70" style={{ background: "rgba(10,36,114,0.06)" }}>
                <X size={16} color={MUTED} />
              </button>
            </div>

            {inviteResult ? (
              <div>
                <div className="p-4 rounded-2xl mb-4 flex items-start gap-3" style={{ background: "#D1FAE5", border: "1px solid #A7F3D0" }}>
                  <CheckCircle2 size={18} color="#065F46" className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#065F46" }}>User invited successfully</p>
                    <p className="text-xs mt-1" style={{ color: "#047857" }}>Share this temporary password with them. They'll be asked to change it on first login.</p>
                  </div>
                </div>
                <div className="p-4 rounded-2xl mb-4" style={{ background: CREAM, border: "1px solid rgba(10,36,114,0.1)" }}>
                  <p className="text-xs font-medium mb-1" style={{ color: MUTED }}>Temporary Password</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono font-bold" style={{ color: NAVY }}>{inviteResult.tempPassword}</code>
                    <button onClick={() => { navigator.clipboard.writeText(inviteResult.tempPassword); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ background: "rgba(10,36,114,0.06)" }}>
                      <Copy size={14} color={NAVY_LIGHT} />
                    </button>
                  </div>
                  {copied && <p className="text-xs mt-1" style={{ color: "#16A34A" }}>Copied!</p>}
                </div>
                <button onClick={() => { setShowInvite(false); setInviteResult(null); }}
                  className="w-full py-3 rounded-full text-sm font-semibold" style={{ background: NAVY, color: CREAM }}>
                  Done
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NAVY_LIGHT }}>Full Name</label>
                  <input value={inviteForm.full_name} onChange={(e) => setInviteForm(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="e.g. Kwame Mensah"
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NAVY_LIGHT }}>Email</label>
                  <input type="email" value={inviteForm.email} onChange={(e) => setInviteForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="staff@yourschool.edu"
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NAVY_LIGHT }}>Phone (optional)</label>
                  <input value={inviteForm.phone} onChange={(e) => setInviteForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+233 24 123 4567"
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: NAVY_LIGHT }}>Role</label>
                  <select value={inviteForm.role_id} onChange={(e) => setInviteForm(p => ({ ...p, role_id: e.target.value }))}
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }}>
                    <option value="">Select a role...</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                </div>
                <button onClick={inviteUser} disabled={saving || !inviteForm.full_name || !inviteForm.email || !inviteForm.role_id}
                  className="w-full py-3 rounded-full flex items-center justify-center gap-2 mt-2 active:scale-95 transition-transform text-sm font-semibold"
                  style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  {saving ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
