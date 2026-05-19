import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { Plus, GraduationCap } from "lucide-react";
import { api } from "../services/api";
import { DataTable, type Column } from "../components/ui/DataTable";
import { toast } from "sonner";

const PLUM = "#381932";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

type Student = {
  id: string; name: string; admission_no: string; class_name: string;
  gender: string; parent_name: string; parent_phone: string; parent_email: string;
  created_at: string;
};

type ClassOption = { id?: string; name: string };

const ITEMS_PER_PAGE = 50;

export function StudentsEnhanced() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overall");
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
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

  const columns: Column<Student>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: `linear-gradient(135deg, ${PLUM}, #512b4a)`, color: MILK }}>
            {s.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <span className="font-medium" style={{ color: PLUM }}>{s.name}</span>
        </div>
      ),
    },
    { key: "admission_no", label: "Roll No", sortable: true,
      render: (s) => <span className="text-xs" style={{ color: MUTED }}>{s.admission_no || "—"}</span>,
    },
    { key: "class_name", label: "Class", sortable: true,
      render: (s) => <span className="px-2 py-0.5 rounded text-xs" style={{ background: MILK, color: PLUM }}>{s.class_name}</span>,
    },
    { key: "gender", label: "Gender", hideable: true,
      render: (s) => <span className="text-xs" style={{ color: MUTED }}>{s.gender || "—"}</span>,
    },
    { key: "parent_name", label: "Parent", hideable: true,
      render: (s) => <span className="text-xs" style={{ color: MUTED }}>{s.parent_name || "—"}</span>,
    },
    { key: "parent_phone", label: "Parent Phone", hideable: true,
      render: (s) => <span className="text-xs" style={{ color: MUTED }}>{s.parent_phone || "—"}</span>,
    },
    { key: "created_at", label: "Date Added", sortable: true, hideable: true,
      render: (s) => <span className="text-xs" style={{ color: MUTED }}>{new Date(s.created_at).toLocaleDateString()}</span>,
    },
  ];

  const activeFilters = [];
  if (view === "by_class" && selectedClass) {
    activeFilters.push({
      key: "class",
      label: "Class",
      value: selectedClass,
      onRemove: () => { setView("overall"); setSelectedClass(""); },
    });
  }

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
      </div>

      <DataTable
        tableKey="students"
        columns={columns}
        data={students}
        total={total}
        page={page}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={(f, o) => { setSortBy(f); setSortOrder(o); }}
        loading={loading}
        searchable
        searchValue={search}
        onSearch={setSearch}
        filters={activeFilters}
        onRowClick={(s) => navigate(`/dashboard/student/details/${s.id}`)}
        rowKey={(s) => s.id}
        exportFilename="students"
        bulkActions={[
          {
            label: "Delete Selected",
            variant: "danger",
            onClick: async (ids) => {
              try {
                await api.post("/api/school/students/bulk-delete", { ids });
                toast.success(`${ids.length} student(s) deleted`);
                load();
              } catch (err: any) {
                toast.error(err.message || "Failed to delete");
              }
            },
          },
        ]}
        emptyState={
          <div className="text-center py-12">
            <GraduationCap size={40} color={MUTED} className="mx-auto mb-3" />
            <p style={{ color: PLUM, fontWeight: 600 }}>No students found</p>
            <p className="text-sm mt-1" style={{ color: MUTED }}>
              {search ? "Try a different search term." : "No students yet. Click the + button to add your first student."}
            </p>
          </div>
        }
      />
    </div>
  );
}
