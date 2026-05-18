import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2, ArrowUpDown, Plus, GraduationCap } from "lucide-react";
import { api } from "../services/api";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type Student = {
  id: string; name: string; admission_no: string; class_name: string;
  gender: string; parent_name: string; parent_phone: string; parent_email: string;
  created_at: string;
};

type ClassOption = { id?: string; name: string };

const ITEMS_PER_PAGE = 50;

function LoadingSpinner({ height = 48 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <Loader2 className="animate-spin" size={24} color={PLUM} />
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
          className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: PLUM, border: "1px solid rgba(56,25,50,0.12)" }}>
          <ChevronLeft size={14} />
        </button>
        <span className="font-medium px-2" style={{ color: PLUM }}>{page} / {totalPages}</span>
        <button onClick={() => onChange(page + 1)} disabled={page >= totalPages}
          className="p-1.5 rounded-lg disabled:opacity-30" style={{ color: PLUM, border: "1px solid rgba(56,25,50,0.12)" }}>
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
        <ArrowUpDown size={12} style={{ color: isActive ? PLUM : MUTED, opacity: isActive ? 1 : 0.4 }} />
      </div>
    </th>
  );
}

export function StudentsEnhanced() {
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overall");
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (view === "by_class" && selectedClass) params.set("className", selectedClass);
      if (search) params.set("search", search);
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", String(page));
      params.set("limit", String(ITEMS_PER_PAGE));
      const res = await api.get<{ data: { students: Student[]; total: number } }>(`/api/school/features/students?${params}`);
      setStudents(res.data?.data?.students || []);
      setTotal(res.data?.data?.total || 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [view, selectedClass, search, sortBy, sortOrder, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, view, selectedClass]);

  useEffect(() => {
    api.get<{ data: { classes: ClassOption[] } }>("/api/school/classes")
      .then(res => setClasses(res.data?.data?.classes || []))
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: PLUM }}>Students</h2>
          <p className="text-sm" style={{ color: MUTED }}>Manage student records</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: PLUM, color: MILK }}>
          <Plus size={15} /> Add Student
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={view} onChange={(e) => { setView(e.target.value); setSelectedClass(""); }}
          className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM, minWidth: 160 }}>
          <option value="overall">Overall View</option>
          <option value="by_class">By Class</option>
        </select>
        {view === "by_class" && (
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", color: PLUM, minWidth: 180 }}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
          </select>
        )}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1" style={{ background: "white", border: "1px solid rgba(56,25,50,0.1)", maxWidth: 300 }}>
          <Search size={14} color={MUTED} />
          <input placeholder="Search by name, roll number, or parent contact..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1" style={{ color: PLUM }} />
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(56,25,50,0.07)" }}>
        {loading ? <LoadingSpinner height={200} /> : students.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap size={40} color={MUTED} className="mx-auto mb-3" />
            <p style={{ color: PLUM, fontWeight: 600 }}>No students found</p>
            <p className="text-sm mt-1" style={{ color: MUTED }}>Add your first student to get started.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(56,25,50,0.07)" }}>
                    <SortHeader label="Name" field="name" currentField={sortBy} order={sortOrder} onChange={(f, o) => { setSortBy(f); setSortOrder(o); }} />
                    <SortHeader label="Roll No" field="admission_no" currentField={sortBy} order={sortOrder} onChange={(f, o) => { setSortBy(f); setSortOrder(o); }} />
                    <SortHeader label="Class" field="class_name" currentField={sortBy} order={sortOrder} onChange={(f, o) => { setSortBy(f); setSortOrder(o); }} />
                    <th className="px-4 py-3 font-medium">Gender</th>
                    <th className="px-4 py-3 font-medium">Parent Contact</th>
                    <SortHeader label="Date Added" field="created_at" currentField={sortBy} order={sortOrder} onChange={(f, o) => { setSortBy(f); setSortOrder(o); }} />
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id} className="text-sm" style={{ borderBottom: "1px solid rgba(56,25,50,0.05)" }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`, color: MILK }}>
                            {s.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                          </div>
                          <span className="font-medium" style={{ color: PLUM }}>{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{s.admission_no || "—"}</td>
                      <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-xs" style={{ background: MILK, color: PLUM }}>{s.class_name}</span></td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{s.gender || "—"}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>
                        {s.parent_name && <div>{s.parent_name}</div>}
                        {s.parent_phone && <div>{s.parent_phone}</div>}
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={total} limit={ITEMS_PER_PAGE} onChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
