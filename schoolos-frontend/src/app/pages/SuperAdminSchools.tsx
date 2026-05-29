import { useState, useEffect, useCallback } from "react";
import { Search, Building2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, AlertTriangle, Trash2, Key, Copy, RefreshCw } from "lucide-react";
import { api } from "../services/api";
import { Badge, LoadingSkeleton, EmptyState, ErrorState, planColors, CARD_BG_C as CARD_BG, BORDER_C as BORDER, TEXT_C as TEXT, MUTED_C as MUTED, ACCENT_C as ACCENT } from "./superadmin/Components";

interface School {
  id: string; schoolName: string; email: string; phone: string; slug: string;
  plan: string; status: string; createdAt: string;
}

interface SchoolDetail extends School {
  payments: { id: string; amount: number; paidAt: string }[];
}

export function SuperAdminSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SchoolDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [credentials, setCredentials] = useState<{ adminEmail: string; adminName: string | null; tempPassword: string | null } | null>(null);
  const [credentialsLoading, setCredentialsLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (planFilter) params.set("plan", planFilter);
      const res = await api.get<{ schools: School[]; total: number; pages: number }>(`/api/superadmin/schools?${params}`);
      if (res.data) { setSchools(res.data.schools); setTotal(res.data.total); setPages(res.data.pages); }
    } catch (err: any) {
      setError(err.message || "Failed to load schools");
    } finally { setLoading(false); }
  }, [page, statusFilter, planFilter]);

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  const fetchDetail = async (id: string) => {
    setDetailLoading(true);
    setSelectedId(id);
    try {
      const res = await api.get<{ school: School; payments: { id: string; amount: number; paidAt: string }[] }>(`/api/superadmin/schools/${id}`);
      if (res.data) setDetail({ ...res.data.school, payments: res.data.payments || [] });
    } catch { setDetail(null); }
    finally { setDetailLoading(false); }
  };

  const fetchCredentials = async (id: string, generate = false) => {
    setCredentialsLoading(true);
    try {
      const params = generate ? "?generate=true" : "";
      const res = await api.get<{ schoolName: string; adminEmail: string; adminName: string | null; tempPassword: string | null }>(`/api/superadmin/schools/${id}/credentials${params}`);
      if (res.data) setCredentials(res.data);
    } catch {
      setCredentials(null);
    } finally {
      setCredentialsLoading(false);
    }
  };

  const handleViewCredentials = (id: string) => {
    if (credentials && !credentials.tempPassword) {
      setCredentials(null);
    } else {
      fetchCredentials(id);
    }
  };

  const handleGeneratePassword = (id: string) => {
    fetchCredentials(id, true);
  };

  const handleDeleteSchool = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?\n\nThis will permanently remove the school, all users, and all payment records. This action cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.delete(`/api/superadmin/schools/${id}`);
      setSelectedId(null);
      setDetail(null);
      setCredentials(null);
      fetchSchools();
    } catch (err: any) {
      setError(err.message || "Failed to delete school");
    } finally {
      setDeleting(false);
    }
  };

  const handleAction = async (id: string, action: "suspend" | "reactivate") => {
    try {
      await api.put(`/api/superadmin/schools/${id}/${action}`, { ...(action === "reactivate" ? { plan: "growth" } : {}) });
      fetchSchools();
      if (selectedId === id) fetchDetail(id);
    } catch (err: any) {
      setError(err.message || `Failed to ${action} school`);
    }
  };

  const filtered = schools.filter((s) =>
    s.schoolName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  const sortedPlans = Object.keys(planColors);

  return (
    <div className="space-y-6" style={{ color: TEXT }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "1.5rem" }}>Schools ({total})</h1>
          <p style={{ color: MUTED, fontSize: "0.85rem" }}>Manage all schools on the platform</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-[240px] max-w-md" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <Search size={15} color={MUTED} />
          <input aria-label="Search schools by name, email, or slug" placeholder="Search by name, email, or slug..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1" style={{ color: TEXT }} />
        </div>
        <select aria-label="Filter by status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
        <select aria-label="Filter by plan" value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT }}>
          <option value="">All Plans</option>
          {sortedPlans.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        {search && filtered.length === 0 && !loading && !error && (
          <span style={{ color: MUTED, fontSize: "0.78rem" }}>No results on this page — try a different search or navigation.</span>
        )}
      </div>

      {/* Table or empty/error */}
      {loading ? <LoadingSkeleton /> : error ? <ErrorState message={error} onRetry={fetchSchools} /> : filtered.length === 0 ? (
        <EmptyState icon={Building2} title={search || statusFilter || planFilter ? "No schools match your filters" : "No schools registered yet"} desc={search || statusFilter || planFilter ? "Try adjusting your search or filters." : "Schools will appear here once they register on the platform."} />
      ) : (
        <div className="rounded-[24px] overflow-x-auto" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["School", "Email", "Plan", "Status", "Created", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3" style={{ color: MUTED, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.5px" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((school) => (
                <tr key={school.id} className="transition-colors" style={{ borderBottom: `1px solid ${BORDER}`, background: selectedId === school.id ? "rgba(255,107,53,0.06)" : "transparent" }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                        <Building2 size={15} color={ACCENT} />
                      </div>
                      <div>
                        <div style={{ color: TEXT, fontSize: "0.88rem", fontWeight: 500 }}>{school.schoolName}</div>
                        <div style={{ color: MUTED, fontSize: "0.72rem" }}>{school.slug}.getschoolos.me</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4" style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{school.email}</td>
                  <td className="px-5 py-4"><Badge text={school.plan.charAt(0).toUpperCase() + school.plan.slice(1)} color={planColors[school.plan] || MUTED} /></td>
                  <td className="px-5 py-4">
                    {school.status === "active" ? (
                      <div className="flex items-center gap-1.5" aria-label="Status: Active" style={{ color: "#10B981", fontSize: "0.82rem" }}><CheckCircle size={13} aria-hidden="true" /> Active</div>
                    ) : (
                      <div className="flex items-center gap-1.5" aria-label="Status: Suspended" style={{ color: "#EF4444", fontSize: "0.82rem" }}><XCircle size={13} aria-hidden="true" /> Suspended</div>
                    )}
                  </td>
                  <td className="px-5 py-4" style={{ color: MUTED, fontSize: "0.78rem" }}>{school.createdAt ? new Date(school.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => selectedId === school.id ? setSelectedId(null) : fetchDetail(school.id)} className="p-2 rounded-lg hover:opacity-70" style={{ color: MUTED }}>
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex items-center justify-between">
          <div style={{ color: MUTED, fontSize: "0.82rem" }}>Page {page} of {Math.max(1, pages)}</div>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl text-sm disabled:opacity-30 flex items-center gap-1" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT }}>
              <ChevronLeft size={14} /> Previous
            </button>
            <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl text-sm disabled:opacity-30 flex items-center gap-1" style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* School Detail Panel */}
      {selectedId && (
        <div className="rounded-[24px] p-6" style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}>
          {detailLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-6 w-48 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="h-4 w-32 rounded" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>
          ) : detail ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "1.1rem", color: TEXT }}>{detail.schoolName}</h3>
                  <p style={{ color: MUTED, fontSize: "0.82rem" }}>{detail.email} · {detail.slug}.getschoolos.me</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleViewCredentials(detail.id)} className="px-4 py-2 rounded-full text-xs flex items-center gap-1.5" style={{ background: "rgba(255,107,53,0.15)", color: ACCENT }}>
                    <Key size={12} /> Credentials
                  </button>
                  {detail.status === "active" ? (
                    <button onClick={() => handleAction(detail.id, "suspend")} className="px-4 py-2 rounded-full text-xs" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>Suspend</button>
                  ) : (
                    <button onClick={() => handleAction(detail.id, "reactivate")} className="px-4 py-2 rounded-full text-xs flex items-center gap-1.5" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>Reactivate</button>
                  )}
                  <button onClick={() => handleDeleteSchool(detail.id, detail.schoolName)} disabled={deleting} className="px-4 py-2 rounded-full text-xs flex items-center gap-1.5" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444", opacity: deleting ? 0.5 : 1 }}>
                    {deleting ? "Deleting..." : <><Trash2 size={12} /> Delete</>}
                  </button>
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 style={{ fontWeight: 600, fontSize: "0.9rem", color: TEXT }}>Information</h4>
                  {[
                    { label: "Plan", value: detail.plan, color: planColors[detail.plan] || MUTED },
                    { label: "Status", value: detail.status === "active" ? "Active" : "Suspended", color: detail.status === "active" ? "#10B981" : "#EF4444" },
                    { label: "Phone", value: detail.phone || "—" },
                    { label: "Slug", value: detail.slug },
                    { label: "Created", value: detail.createdAt ? new Date(detail.createdAt).toLocaleDateString() : "—" },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ color: MUTED, fontSize: "0.82rem" }}>{f.label}</span>
                      <span style={{ color: (f as any).color || TEXT, fontSize: "0.82rem", fontWeight: 500 }}>{f.value}</span>
                    </div>
                  ))}
                  {credentials && (
                    <div className="p-3 rounded-xl" style={{ background: "rgba(255,107,53,0.08)", border: `1px solid rgba(255,107,53,0.2)` }}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 style={{ fontWeight: 600, fontSize: "0.85rem", color: ACCENT }}>Admin Credentials</h4>
                        <button onClick={() => handleGeneratePassword(detail.id)} disabled={credentialsLoading} className="text-xs flex items-center gap-1 px-2 py-1 rounded-lg" style={{ color: ACCENT, background: "rgba(255,107,53,0.12)" }}>
                          <RefreshCw size={11} /> {credentials.tempPassword ? "Regenerate" : "Generate Password"}
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span style={{ color: MUTED, fontSize: "0.78rem" }}>Email</span>
                          <span style={{ color: TEXT, fontSize: "0.82rem" }}>{credentials.adminEmail}</span>
                        </div>
                        {credentials.adminName && (
                          <div className="flex items-center justify-between">
                            <span style={{ color: MUTED, fontSize: "0.78rem" }}>Admin</span>
                            <span style={{ color: TEXT, fontSize: "0.82rem" }}>{credentials.adminName}</span>
                          </div>
                        )}
                        {credentials.tempPassword && (
                          <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,107,53,0.15)" }}>
                            <span style={{ color: "#10B981", fontSize: "0.78rem", fontWeight: 600 }}>Temporary Password</span>
                            <div className="flex items-center gap-2">
                              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: TEXT, fontSize: "0.82rem", fontWeight: 600, letterSpacing: "1px" }}>{credentials.tempPassword}</span>
                              <button onClick={() => { navigator.clipboard.writeText(credentials.tempPassword!); }} className="p-1 rounded" style={{ color: MUTED }}>
                                <Copy size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <p style={{ color: MUTED, fontSize: "0.7rem", marginTop: "0.5rem" }}>
                        Share credentials securely with the school admin. They can change their password after signing in.
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: "0.9rem", color: TEXT, marginBottom: "0.75rem" }}>Payments ({detail.payments?.length || 0})</h4>
                  {detail.payments && detail.payments.length > 0 ? (
                    <div className="space-y-2">
                      {detail.payments.slice(0, 10).map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#10B981", fontSize: "0.82rem", fontWeight: 600 }}>GHS {p.amount.toLocaleString()}</span>
                          <span style={{ color: MUTED, fontSize: "0.75rem" }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—"}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: MUTED, fontSize: "0.82rem" }}>No payments recorded for this school.</p>
                  )}
                </div>
              </div>
            </>
          ) : <EmptyState icon={AlertTriangle} title="Could not load school details" desc="The school may have been removed or there was a network error." />}
        </div>
      )}
    </div>
  );
}
