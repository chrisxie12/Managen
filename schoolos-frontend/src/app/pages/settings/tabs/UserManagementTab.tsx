import { useState, useEffect } from "react";
import { Users, Search, Loader2, Mail, X, Check, Trash2, Ban, Download } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../services/api";
import { Input } from "../../../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MUTED = "#7D6077";

type User = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  status: "active" | "suspended" | "pending";
  last_login: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at?: string;
};

const ROLE_OPTIONS = ["Headmaster", "Accountant", "Teacher", "Parent"];

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="p-5 rounded-2xl mb-4" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: PLUM }}>{title}</h3>
      {desc && <p className="text-xs mb-4" style={{ color: MUTED }}>{desc}</p>}
      {children}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function exportToCsv(users: User[], filename: string) {
  const headers = ["Name", "Email", "Role", "Status", "Last Login"];
  const rows = users.map((u) => [
    u.full_name,
    u.email,
    u.role,
    u.status,
    u.last_login || "",
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

type Props = { role: string };

export function UserManagementTab({ role }: Props) {

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Teacher");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(false);

  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [resendingId, setResendingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [bulkDeactivating, setBulkDeactivating] = useState(false);
  const [resettingPwId, setResettingPwId] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (filterRole !== "all") params.set("role", filterRole);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (search) params.set("search", search);
      const res = await api.get<any>(`/school/users?${params.toString()}`);
      if (res.data) {
        const d = res.data.data || res.data;
        setUsers(Array.isArray(d) ? d : d.users || d.results || []);
        setTotal(d.total ?? d.count ?? (Array.isArray(d) ? d.length : 0));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchInvitations = async () => {
    setLoadingInvitations(true);
    try {
      const res = await api.get<any>("/school/users?status=pending&limit=50");
      if (res.data) {
        const d = res.data.data || res.data;
        setInvitations(Array.isArray(d) ? d : d.users || d.results || []);
      }
    } catch {
    } finally {
      setLoadingInvitations(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, filterRole, filterStatus, search]);

  useEffect(() => {
    if (role === "school_admin") {
      fetchInvitations();
    }
  }, [role]);

  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSendInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSendingInvite(true);
    try {
      const fullName = inviteEmail.split("@")[0];
      const res = await api.post<any>("/school/users/invite", {
        full_name: fullName,
        email: inviteEmail,
        role: inviteRole,
      });
      if (res.data) {
        const tempPw = res.data.temporary_password || res.data.password || "generated";
        toast.success(`Invitation sent! Temporary password: ${tempPw}`);
        setInviteEmail("");
        setInviteRole("Teacher");
        fetchInvitations();
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    } finally {
      setSendingInvite(false);
    }
  };

  const handleResendInvite = async (invitationId: string) => {
    setResendingId(invitationId);
    try {
      await api.post(`/school/users/${invitationId}/resend`, {});
      toast.success("Invitation resent");
      fetchInvitations();
    } catch (err: any) {
      toast.error(err.message || "Failed to resend invitation");
    } finally {
      setResendingId(null);
    }
  };

  const handleCancelInvite = async (invitationId: string) => {
    setCancellingId(invitationId);
    try {
      await api.delete(`/school/users/${invitationId}`);
      toast.success("Invitation cancelled");
      fetchInvitations();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel invitation");
    } finally {
      setCancellingId(null);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      await api.delete(`/school/users/${userId}`);
      toast.success("User removed");
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to remove user");
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    setTogglingStatusId(userId);
    try {
      const endpoint =
        currentStatus === "active"
          ? `/school/users/${userId}/suspend`
          : `/school/users/${userId}/activate`;
      await api.put(endpoint, {});
      toast.success(currentStatus === "active" ? "User suspended" : "User activated");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user status");
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleResetPassword = async (userId: string) => {
    setResettingPwId(userId);
    try {
      await api.post("/school/settings/change-password", { user_id: userId });
      toast.success("Password reset email sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setResettingPwId(null);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    setUpdatingRoleId(userId);
    try {
      await api.put(`/school/users/${userId}`, { role: newRole });
      toast.success("Role updated");
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.size === 0) return;
    setBulkDeactivating(true);
    try {
      await api.post("/school/users/bulk-deactivate", { user_ids: Array.from(selectedIds) });
      toast.success(`${selectedIds.size} user(s) deactivated`);
      setSelectedIds(new Set());
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to bulk deactivate");
    } finally {
      setBulkDeactivating(false);
    }
  };

  const handleExportSelected = () => {
    const selected = users.filter((u) => selectedIds.has(u.id));
    if (selected.length === 0) {
      toast.error("No users selected");
      return;
    }
    exportToCsv(selected, "selected-users.csv");
    toast.success(`Exported ${selected.length} user(s)`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fmtDate = (d: string | null) => {
    if (!d) return "\u2014";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const fmtDateTime = (d: string | null) => {
    if (!d) return "\u2014";
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (role !== "school_admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Ban size={40} color="#EF4444" />
        <p className="mt-3 text-sm font-medium" style={{ color: "#EF4444" }}>Access denied</p>
        <p className="text-xs mt-1" style={{ color: MUTED }}>Only school administrators can manage users.</p>
      </div>
    );
  }

  if (loadingUsers && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin" size={28} color={PLUM} />
      </div>
    );
  }

  return (
    <div>
      <SectionCard title="Invite Users" desc="Send invitations to new school members">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>Email</label>
            <div className="relative">
              <Input
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="h-9 text-sm rounded-xl pr-8"
                style={{ borderColor: "rgba(56,25,50,0.12)" }}
              />
              {inviteEmail && (
                <button
                  onClick={() => setInviteEmail("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  <X size={14} color={MUTED} />
                </button>
              )}
            </div>
          </div>
          <div className="w-full sm:w-44">
            <label className="text-xs font-medium mb-1 block" style={{ color: PLUM }}>Role</label>
            <Select value={inviteRole} onValueChange={setInviteRole}>
              <SelectTrigger className="h-9 text-xs rounded-xl"
                style={{ borderColor: "rgba(56,25,50,0.12)" }}>
                <SelectValue placeholder="Select role..." />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleSendInvite}
            disabled={sendingInvite || !inviteEmail}
            className="text-xs rounded-xl h-9 px-5 w-full sm:w-auto"
            style={{ background: PLUM }}
          >
            {sendingInvite ? (
              <Loader2 size={14} className="animate-spin mr-1" />
            ) : (
              <Mail size={14} className="mr-1" />
            )}
            Send Invite
          </Button>
        </div>
      </SectionCard>

      {invitations.length > 0 && (
        <SectionCard title="Pending Invitations" desc="Invitations that have been sent but not yet accepted">
          {loadingInvitations ? (
            <div className="flex justify-center py-4">
              <Loader2 size={18} className="animate-spin" color={PLUM} />
            </div>
          ) : (
            <div className="space-y-2">
              {invitations.map((inv) => {
                const sentDate = fmtDateTime(inv.created_at);
                const expiry = inv.expires_at
                  ? new Date(inv.expires_at)
                  : new Date(new Date(inv.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
                const expiresStr = fmtDate(expiry.toISOString());
                return (
                  <div key={inv.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                    style={{ background: "rgba(56,25,50,0.04)" }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Mail size={14} color={MUTED} className="flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-medium truncate block" style={{ color: PLUM }}>{inv.email}</span>
                        <span style={{ color: MUTED }}>{inv.role} &middot; Sent {sentDate} &middot; Expires {expiresStr}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 ml-3">
                      <button
                        onClick={() => handleResendInvite(inv.id)}
                        disabled={resendingId === inv.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        style={{ color: PLUM, background: "rgba(56,25,50,0.06)" }}
                      >
                        {resendingId === inv.id ? "..." : "Resend"}
                      </button>
                      <button
                        onClick={() => handleCancelInvite(inv.id)}
                        disabled={cancellingId === inv.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                        style={{ color: "#EF4444", background: "rgba(239,68,68,0.08)" }}
                      >
                        {cancellingId === inv.id ? "..." : "Cancel"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      <SectionCard title="Active Users" desc="Manage all users in the school">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" color={MUTED} />
            <Input
              placeholder="Search by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9 text-sm rounded-xl pl-9 pr-8"
              style={{ borderColor: "rgba(56,25,50,0.12)" }}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X size={14} color={MUTED} />
              </button>
            )}
          </div>
          <div className="w-full sm:w-40">
            <Select value={filterRole} onValueChange={(v) => { setFilterRole(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-xs rounded-xl"
                style={{ borderColor: "rgba(56,25,50,0.12)" }}>
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Roles</SelectItem>
                {ROLE_OPTIONS.map((r) => (
                  <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-36">
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-xs rounded-xl"
                style={{ borderColor: "rgba(56,25,50,0.12)" }}>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Status</SelectItem>
                <SelectItem value="active" className="text-xs">Active</SelectItem>
                <SelectItem value="suspended" className="text-xs">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-xl"
            style={{ background: "rgba(56,25,50,0.06)" }}>
            <span className="text-xs font-medium" style={{ color: PLUM }}>
              {selectedIds.size} selected
            </span>
            <button
              onClick={handleBulkDeactivate}
              disabled={bulkDeactivating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              style={{ color: "#EF4444", background: "rgba(239,68,68,0.08)" }}
            >
              {bulkDeactivating ? <Loader2 size={12} className="animate-spin" /> : <Ban size={12} />}
              Bulk Deactivate
            </button>
            <button
              onClick={handleExportSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{ color: PLUM, background: "rgba(56,25,50,0.06)" }}
            >
              <Download size={12} />
              Export Selected (CSV)
            </button>
          </div>
        )}

        {loadingUsers ? (
          <div className="flex justify-center py-10">
            <Loader2 size={22} className="animate-spin" color={PLUM} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10">
            <Users size={32} color={MUTED} className="mx-auto mb-2" />
            <p className="text-xs" style={{ color: MUTED }}>No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr className="text-left" style={{ color: MUTED }}>
                  <th className="pb-3 pr-2 w-8">
                    <input
                      type="checkbox"
                      checked={users.length > 0 && selectedIds.size === users.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-purple-700"
                    />
                  </th>
                  <th className="pb-3 pr-3 font-medium">Name</th>
                  <th className="pb-3 pr-3 font-medium">Email</th>
                  <th className="pb-3 pr-3 font-medium">Role</th>
                  <th className="pb-3 pr-3 font-medium">Status</th>
                  <th className="pb-3 pr-3 font-medium">Last Login</th>
                  <th className="pb-3 font-medium w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const isUpdatingRole = updatingRoleId === user.id;
                  return (
                    <tr key={user.id}
                      className="border-t"
                      style={{ borderColor: "rgba(56,25,50,0.06)" }}>
                      <td className="py-3 pr-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          className="rounded accent-purple-700"
                        />
                      </td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                            style={{ background: PLUM_LIGHT }}
                          >
                            {getInitials(user.full_name)}
                          </div>
                          <span className="font-medium" style={{ color: PLUM }}>{user.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3" style={{ color: MUTED }}>{user.email}</td>
                      <td className="py-3 pr-3">
                        <Select
                          value={user.role}
                          onValueChange={(v) => handleUpdateRole(user.id, v)}
                          disabled={isUpdatingRole}
                        >
                          <SelectTrigger className="h-7 text-xs rounded-lg min-w-[120px]"
                            style={{ borderColor: "rgba(56,25,50,0.12)" }}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ROLE_OPTIONS.map((r) => (
                              <SelectItem key={r} value={r} className="text-xs">{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-3 pr-3">
                        <Badge
                          variant={user.status === "active" ? "default" : "destructive"}
                          className="text-[10px] px-2 py-0.5 rounded-lg"
                          style={{
                            background: user.status === "active" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                            color: user.status === "active" ? "#16A34A" : "#DC2626",
                            border: "none",
                          }}
                        >
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3" style={{ color: MUTED }}>{fmtDateTime(user.last_login)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(user.id, user.status)}
                            disabled={togglingStatusId === user.id}
                            className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            style={{ background: "rgba(56,25,50,0.06)" }}
                            title={user.status === "active" ? "Suspend user" : "Activate user"}
                          >
                            {togglingStatusId === user.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : user.status === "active" ? (
                              <Ban size={13} color="#EF4444" />
                            ) : (
                              <Check size={13} color="#16A34A" />
                            )}
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            disabled={resettingPwId === user.id}
                            className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            style={{ background: "rgba(56,25,50,0.06)" }}
                            title="Reset password"
                          >
                            {resettingPwId === user.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={PLUM} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleRemoveUser(user.id)}
                            disabled={removingUserId === user.id}
                            className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            style={{ background: "rgba(239,68,68,0.08)" }}
                            title="Remove user"
                          >
                            {removingUserId === user.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Trash2 size={13} color="#EF4444" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-3"
                style={{ borderTop: "1px solid rgba(56,25,50,0.06)" }}>
                <span className="text-xs" style={{ color: MUTED }}>
                  Page {page} of {totalPages} ({total} users)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                    style={{ color: PLUM, background: "rgba(56,25,50,0.06)" }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                    style={{ color: PLUM, background: "rgba(56,25,50,0.06)" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
