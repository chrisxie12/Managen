import { useState, useEffect, useCallback } from "react";
import { Users, Search, ChevronLeft, ChevronRight, Loader2, ArrowUpDown, Briefcase } from "lucide-react";
import { api } from "../services/api";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type StaffMember = {
  id: string; name: string; full_name: string; email: string; phone: string;
  employee_id: string; department: string; role_title: string; role: string;
  is_active: boolean; created_at: string;
};

const ITEMS_PER_PAGE = 50;

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
    <div className="flex items-center justify-between px-4 py-3 text-sm" style={{ borderTop: "1px solid rgba(56,25,50,0.07)" }}>
      <span style={{ color: MUTED }}>{total} record{total !== 1 ? "s" : ""}</span>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(page - 1)} disabled={page <= 1}
          className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: NAVY, border: "1px solid rgba(56,25,50,0.12)" }}>
          <ChevronLeft size={14} />
        </button>
        <span className="font-medium px-2" style={{ color: NAVY }}>{page} / {totalPages}</span>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: NAVY, border: "1px solid rgba(56,25,50,0.12)" }}>
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function SortHeader({ label, field, currentField, order, onChange }: {
  label: string; field: string; currentField: string; order: string; onChange: (f: string, o: string) => void;
}) {
  const isActive = currentField === field;
  return (
    <th className="px-4 py-3 font-medium cursor-pointer select-none" onClick={() => onChange(field, isActive && order === 'asc' ? 'desc' : 'asc')}>
      <div className="flex items-center gap-1">
        <span>{label}</span>
        <ArrowUpDown size={12} style={{ color: isActive ? NAVY : MUTED, opacity: isActive ? 1 : 0.4 }} />
      </div>
    </th>
  );
}

export function StaffDirectory() {
  const [tab, setTab] = useState("teachers");
  // Teachers
  const [teachers, setTeachers] = useState<StaffMember[]>([]);
  const [teacherTotal, setTeacherTotal] = useState(0);
  const [departments, setDepartments] = useState<string[]>([]);
  const [teacherView, setTeacherView] = useState("overall");
  const [teacherDept, setTeacherDept] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherSort, setTeacherSort] = useState("name");
  const [teacherOrder, setTeacherOrder] = useState("asc");
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherLoading, setTeacherLoading] = useState(true);
  // Staff
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffTotal, setStaffTotal] = useState(0);
  const [roles, setRoles] = useState<string[]>([]);
  const [staffView, setStaffView] = useState("overall");
  const [staffRole, setStaffRole] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [staffSort, setStaffSort] = useState("name");
  const [staffOrder, setStaffOrder] = useState("asc");
  const [staffPage, setStaffPage] = useState(1);
  const [staffLoading, setStaffLoading] = useState(true);

  const loadTeachers = useCallback(async () => {
    setTeacherLoading(true);
    try {
      const params = new URLSearchParams();
      if (teacherView === "by_department" && teacherDept) params.set("department", teacherDept);
      if (teacherSearch) params.set("search", teacherSearch);
      params.set("sortBy", teacherSort);
      params.set("sortOrder", teacherOrder);
      params.set("page", String(teacherPage));
      params.set("limit", String(ITEMS_PER_PAGE));
      const res = await api.get<{ data: { teachers: StaffMember[]; total: number } }>(`/api/school/features/teachers?${params}`);
      setTeachers(res.data?.data?.teachers || []);
      setTeacherTotal(res.data?.data?.total || 0);
    } catch { /* ignore */ } finally { setTeacherLoading(false); }
  }, [teacherView, teacherDept, teacherSearch, teacherSort, teacherOrder, teacherPage]);

  const loadStaff = useCallback(async () => {
    setStaffLoading(true);
    try {
      const params = new URLSearchParams();
      if (staffView === "by_role" && staffRole) params.set("role_title", staffRole);
      if (staffSearch) params.set("search", staffSearch);
      params.set("sortBy", staffSort);
      params.set("sortOrder", staffOrder);
      params.set("page", String(staffPage));
      params.set("limit", String(ITEMS_PER_PAGE));
      const res = await api.get<{ data: { staff: StaffMember[]; total: number } }>(`/api/school/features/non-teaching-staff?${params}`);
      setStaff(res.data?.data?.staff || []);
      setStaffTotal(res.data?.data?.total || 0);
    } catch { /* ignore */ } finally { setStaffLoading(false); }
  }, [staffView, staffRole, staffSearch, staffSort, staffOrder, staffPage]);

  useEffect(() => { loadTeachers(); }, [loadTeachers]);
  useEffect(() => { loadStaff(); }, [loadStaff]);
  useEffect(() => { setTeacherPage(1); }, [teacherSearch, teacherView, teacherDept]);
  useEffect(() => { setStaffPage(1); }, [staffSearch, staffView, staffRole]);

  useEffect(() => {
    api.get<{ data: { teachers: StaffMember[] } }>("/api/school/features/teachers?limit=500")
      .then(res => {
        const depts = [...new Set((res.data?.data?.teachers || []).map(t => t.department).filter(Boolean))] as string[];
        setDepartments(depts);
      }).catch(() => {});
    api.get<{ data: { staff: StaffMember[] } }>("/api/school/features/non-teaching-staff?limit=500")
      .then(res => {
        const rls = [...new Set((res.data?.data?.staff || []).map(s => s.role_title).filter(Boolean))] as string[];
        setRoles(rls);
      }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: NAVY }}>Staff Directory</h2>
          <p className="text-sm" style={{ color: MUTED }}>Manage teaching and non-teaching staff</p>
        </div>
        <div className="flex gap-2">
          {[
            { key: "teachers", label: "Teachers", icon: Users },
            { key: "staff", label: "Non-Teaching", icon: Briefcase },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{
                background: tab === t.key ? NAVY : "white",
                color: tab === t.key ? CREAM : NAVY_LIGHT,
                border: tab === t.key ? "none" : "1px solid rgba(56,25,50,0.1)",
              }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "teachers" && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select value={teacherView} onChange={(e) => { setTeacherView(e.target.value); setTeacherDept(""); }}
              className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY, minWidth: 160 }}>
              <option value="overall">Overall View</option>
              <option value="by_department">By Department</option>
            </select>
            {teacherView === "by_department" && (
              <select value={teacherDept} onChange={(e) => setTeacherDept(e.target.value)}
                className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY, minWidth: 160 }}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", maxWidth: 300 }}>
              <Search size={14} color={MUTED} />
              <input placeholder="Search by name, email, employee ID..." value={teacherSearch} onChange={(e) => setTeacherSearch(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1" style={{ color: NAVY }} />
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            {teacherLoading ? <LoadingSpinner height={200} /> : teachers.length === 0 ? (
              <div className="text-center py-12">
                <Users size={40} color={MUTED} className="mx-auto mb-3" />
                <p style={{ color: NAVY, fontWeight: 600 }}>No teachers found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                        <SortHeader label="Name" field="name" currentField={teacherSort} order={teacherOrder} onChange={(f, o) => { setTeacherSort(f); setTeacherOrder(o); }} />
                        <SortHeader label="Employee ID" field="employee_id" currentField={teacherSort} order={teacherOrder} onChange={(f, o) => { setTeacherSort(f); setTeacherOrder(o); }} />
                        <SortHeader label="Email" field="email" currentField={teacherSort} order={teacherOrder} onChange={(f, o) => { setTeacherSort(f); setTeacherOrder(o); }} />
                        <SortHeader label="Department" field="department" currentField={teacherSort} order={teacherOrder} onChange={(f, o) => { setTeacherSort(f); setTeacherOrder(o); }} />
                        <SortHeader label="Phone" field="phone" currentField={teacherSort} order={teacherOrder} onChange={(f, o) => { setTeacherSort(f); setTeacherOrder(o); }} />
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map(t => (
                        <tr key={t.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                                {(t.name || t.full_name || "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                              </div>
                              <span className="font-medium" style={{ color: NAVY }}>{t.name || t.full_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{t.employee_id || "—"}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{t.email || "—"}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{t.department || "—"}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{t.phone || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={teacherPage} total={teacherTotal} limit={ITEMS_PER_PAGE} onChange={setTeacherPage} />
              </>
            )}
          </div>
        </div>
      )}

      {tab === "staff" && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <select value={staffView} onChange={(e) => { setStaffView(e.target.value); setStaffRole(""); }}
              className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY, minWidth: 160 }}>
              <option value="overall">Overall View</option>
              <option value="by_role">By Role</option>
            </select>
            {staffView === "by_role" && (
              <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)}
                className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: NAVY, minWidth: 160 }}>
                <option value="">All Roles</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            )}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", maxWidth: 300 }}>
              <Search size={14} color={MUTED} />
              <input placeholder="Search by name, employee ID, role..." value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1" style={{ color: NAVY }} />
            </div>
          </div>

          <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
            {staffLoading ? <LoadingSpinner height={200} /> : staff.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase size={40} color={MUTED} className="mx-auto mb-3" />
                <p style={{ color: NAVY, fontWeight: 600 }}>No non-teaching staff found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                        <SortHeader label="Name" field="name" currentField={staffSort} order={staffOrder} onChange={(f, o) => { setStaffSort(f); setStaffOrder(o); }} />
                        <SortHeader label="Employee ID" field="employee_id" currentField={staffSort} order={staffOrder} onChange={(f, o) => { setStaffSort(f); setStaffOrder(o); }} />
                        <SortHeader label="Role" field="role_title" currentField={staffSort} order={staffOrder} onChange={(f, o) => { setStaffSort(f); setStaffOrder(o); }} />
                        <SortHeader label="Phone" field="phone" currentField={staffSort} order={staffOrder} onChange={(f, o) => { setStaffSort(f); setStaffOrder(o); }} />
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map(s => (
                        <tr key={s.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                                style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                                {(s.name || s.full_name || "?").split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                              </div>
                              <span className="font-medium" style={{ color: NAVY }}>{s.name || s.full_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{s.employee_id || "—"}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{s.role_title || s.role || "—"}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{s.phone || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={staffPage} total={staffTotal} limit={ITEMS_PER_PAGE} onChange={setStaffPage} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
