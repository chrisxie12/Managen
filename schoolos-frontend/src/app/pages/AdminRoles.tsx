import { useState, useEffect, useCallback } from "react";
import {
  Shield, Plus, X, Check, Loader2, Search, Save,
  ChevronDown, ChevronRight, Pencil, Trash2, Users,
} from "lucide-react";
import { api } from "../services/api";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type Permission = { id: string; name: string; module: string; action: string; description: string };
type Role = { id: string; name: string; label: string; description: string; is_system: boolean; school_id: string | null; permission_ids?: string[] };

type ModulePermissions = { module: string; permissions: Permission[] };

export function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<ModulePermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [rolePerms, setRolePerms] = useState<Record<string, string[]>>({});
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newRole, setNewRole] = useState({ name: "", label: "", description: "" });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get<{ roles: Role[] }>("/api/school/roles"),
        api.get<{ permissions: Permission[]; grouped: Record<string, Permission[]> }>("/api/school/permissions"),
      ]);
      setRoles(rolesRes.data?.roles || []);

      const grouped: ModulePermissions[] = [];
      if (permsRes.data?.grouped) {
        for (const [mod, perms] of Object.entries(permsRes.data.grouped)) {
          grouped.push({ module: mod, permissions: perms });
        }
      }
      setPermissions(grouped);

      const initExpanded: Record<string, boolean> = {};
      grouped.forEach(g => { initExpanded[g.module] = true; });
      setExpandedModules(initExpanded);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const openRoleEditor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    setEditingRole(roleId);
    setSelectedPerms(rolePerms[roleId] || []);
  };

  const saveRolePermissions = async () => {
    if (!editingRole) return;
    setSaving(true);
    try {
      await api.put(`/api/school/roles/${editingRole}/permissions`, { permission_ids: selectedPerms });
      setRolePerms(prev => ({ ...prev, [editingRole!]: selectedPerms }));
      setEditingRole(null);
    } catch (err: any) {
      setError(err.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const createRole = async () => {
    if (!newRole.name || !newRole.label) return;
    setSaving(true);
    try {
      await api.post("/api/school/roles", newRole);
      setShowCreate(false);
      setNewRole({ name: "", label: "", description: "" });
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to create role");
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm("Delete this role? This cannot be undone.")) return;
    try {
      await api.delete(`/api/school/roles/${roleId}`);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete role");
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPerms(prev =>
      prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]
    );
  };

  const toggleModule = (_mod: string, modulePerms: Permission[]) => {
    const modIds = modulePerms.map(p => p.id);
    const allSelected = modIds.every(id => selectedPerms.includes(id));
    setSelectedPerms(prev =>
      allSelected ? prev.filter(p => !modIds.includes(p)) : [...new Set([...prev, ...modIds])]
    );
  };

  const filteredRoles = roles.filter(r =>
    !search || r.label.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={32} color={NAVY} />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-3 rounded-xl" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FECACA", fontSize: "0.9rem" }}>
          {error}
          <button onClick={() => setError("")} className="ml-2"><X size={14} /></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: NAVY }}>Roles & Permissions</h2>
          <p className="text-sm" style={{ color: MUTED }}>Manage roles and granular permissions for your school</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
          <Plus size={16} /> Create Role
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", maxWidth: 300 }}>
        <Search size={14} color={MUTED} />
        <input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1" style={{ color: NAVY }} />
      </div>

      <div className="grid gap-4">
        {filteredRoles.length === 0 ? (
          <div className="text-center py-12 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
            <Shield size={40} color={MUTED} className="mx-auto mb-3" />
            <p className="font-semibold" style={{ color: NAVY }}>No roles found</p>
            <p className="text-sm mt-1" style={{ color: MUTED }}>Create your first role to get started</p>
          </div>
        ) : filteredRoles.map(role => (
          <div key={role.id} className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)", boxShadow: "0 2px 12px rgba(10,36,114,0.04)" }}>
            <div className="flex items-center justify-between p-4" style={{ borderBottom: editingRole === role.id ? "none" : "1px solid rgba(10,36,114,0.07)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: role.is_system ? "rgba(99,102,241,0.12)" : "rgba(16,185,129,0.12)" }}>
                  <Shield size={18} color={role.is_system ? "#6366F1" : "#10B981"} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold" style={{ color: NAVY }}>{role.label}</h3>
                    {role.is_system && (
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "#EEF2FF", color: "#6366F1" }}>System</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: MUTED }}>{role.description || role.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!role.is_system && (
                  <>
                    <button onClick={() => openRoleEditor(role.id)} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: NAVY_LIGHT }}>
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => deleteRole(role.id)} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: "#EF4444" }}>
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
                <button onClick={() => setEditingRole(editingRole === role.id ? null : role.id)} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: MUTED }}>
                  {editingRole === role.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>

            {editingRole === role.id && (
              <div className="p-4" style={{ background: "#FAF8F6" }}>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-semibold" style={{ color: NAVY }}>Permissions for {role.label}</h4>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingRole(null)} className="px-3 py-1.5 rounded-lg text-xs" style={{ border: "1px solid rgba(10,36,114,0.15)", color: MUTED }}>
                      Cancel
                    </button>
                    <button onClick={saveRolePermissions} disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold active:scale-95 transition-transform"
                      style={{ background: NAVY, color: CREAM }}>
                      {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      Save
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {permissions.map(({ module, permissions: modPerms }) => (
                    <div key={module} className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
                      <button
                        onClick={() => setExpandedModules(prev => ({ ...prev, [module]: !prev[module] }))}
                        className="w-full flex items-center justify-between p-3 text-left active:scale-[0.99] transition-transform"
                        style={{ background: "rgba(10,36,114,0.03)" }}>
                        <div className="flex items-center gap-2">
                          {expandedModules[module] ? <ChevronDown size={14} color={MUTED} /> : <ChevronRight size={14} color={MUTED} />}
                          <span className="text-sm font-medium capitalize" style={{ color: NAVY }}>{module}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color: MUTED }}>{modPerms.filter(p => selectedPerms.includes(p.id)).length}/{modPerms.length}</span>
                          <button onClick={(e) => { e.stopPropagation(); toggleModule(module, modPerms); }}
                            className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(10,36,114,0.06)", color: NAVY_LIGHT }}>
                            Toggle all
                          </button>
                        </div>
                      </button>
                      {expandedModules[module] && (
                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {modPerms.map(perm => (
                            <button key={perm.id} onClick={() => togglePermission(perm.id)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all active:scale-95"
                              style={{
                                background: selectedPerms.includes(perm.id) ? "rgba(10,36,114,0.08)" : "transparent",
                                border: `1px solid ${selectedPerms.includes(perm.id) ? "rgba(10,36,114,0.2)" : "rgba(10,36,114,0.07)"}`,
                                color: selectedPerms.includes(perm.id) ? NAVY : NAVY_LIGHT,
                              }}>
                              {selectedPerms.includes(perm.id) ? <Check size={11} /> : <div className="w-[11px]" />}
                              {perm.description || perm.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,36,114,0.6)", backdropFilter: "blur(4px)" }}
          onMouseDown={(e) => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="w-full max-w-md rounded-[32px] p-8" style={{ background: "white", boxShadow: "0 32px 80px rgba(10,36,114,0.3)" }}
            onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}>Create Role</h2>
                <p className="text-sm" style={{ color: MUTED }}>Add a custom role for your school</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-full hover:opacity-70" style={{ background: "rgba(10,36,114,0.06)" }}>
                <X size={16} color={MUTED} />
              </button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NAVY_LIGHT }}>Role Name</label>
                <input value={newRole.name} onChange={(e) => setNewRole(p => ({ ...p, name: e.target.value.toLowerCase().replace(/[^a-z_]/g, "") }))}
                  placeholder="e.g. vice_principal"
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }} />
                <p className="text-xs mt-1" style={{ color: MUTED }}>Lowercase letters and underscores only</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NAVY_LIGHT }}>Display Label</label>
                <input value={newRole.label} onChange={(e) => setNewRole(p => ({ ...p, label: e.target.value }))}
                  placeholder="e.g. Vice Principal"
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: NAVY_LIGHT }}>Description</label>
                <textarea value={newRole.description} onChange={(e) => setNewRole(p => ({ ...p, description: e.target.value }))}
                  placeholder="What does this role do?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm resize-none" style={{ background: CREAM, border: "1.5px solid rgba(10,36,114,0.1)", color: NAVY }} />
              </div>
              <button onClick={createRole} disabled={saving || !newRole.name || !newRole.label}
                className="w-full py-3 rounded-full flex items-center justify-center gap-2 mt-2 active:scale-95 transition-transform text-sm font-semibold"
                style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
                {saving ? "Creating..." : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
