import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, GraduationCap } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../services/api";
import { DataTable, type Column } from "../components/ui/DataTable";
import { useStudents, useClasses } from "../hooks/useStudents";

const NAVY = "#031B4E";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

type Student = {
  id: string; name: string; admission_no: string; class_name: string;
  gender: string; parent_name: string; parent_phone: string; parent_email: string;
  created_at: string;
};

const ITEMS_PER_PAGE = 50;

export function StudentsEnhanced() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [view, setView] = useState("overall");
  const [selectedClass, setSelectedClass] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search, view, selectedClass]);

  const { data: studentsData, isLoading } = useStudents({ view, selectedClass, search, sortBy, sortOrder, page });
  const { data: classes = [] } = useClasses();

  const students = studentsData?.students ?? [];
  const total = studentsData?.total ?? 0;

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await api.post("/api/school/students/bulk-delete", { ids });
    },
    onSuccess: (_data, ids) => {
      toast.success(`${ids.length} student(s) deleted`);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete");
    },
  });

  const columns: Column<Student>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (s) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: `linear-gradient(135deg, ${NAVY}, #0069D9)`, color: CREAM }}>
            {s.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <span className="font-medium" style={{ color: NAVY }}>{s.name}</span>
        </div>
      ),
    },
    { key: "admission_no", label: "Roll No", sortable: true,
      render: (s) => <span className="text-xs" style={{ color: MUTED }}>{s.admission_no || "\u2014"}</span>,
    },
    { key: "class_name", label: "Class", sortable: true,
      render: (s) => <span className="px-2 py-0.5 rounded text-xs" style={{ background: CREAM, color: NAVY }}>{s.class_name}</span>,
    },
    { key: "gender", label: "Gender", hideable: true,
      render: (s) => <span className="text-xs" style={{ color: MUTED }}>{s.gender || "\u2014"}</span>,
    },
    { key: "parent_name", label: "Parent", hideable: true,
      render: (s) => <span className="text-xs" style={{ color: MUTED }}>{s.parent_name || "\u2014"}</span>,
    },
    { key: "parent_phone", label: "Parent Phone", hideable: true,
      render: (s) => <span className="text-xs" style={{ color: MUTED }}>{s.parent_phone || "\u2014"}</span>,
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
          <h2 className="text-xl font-bold" style={{ color: NAVY }}>Students</h2>
          <p className="text-sm" style={{ color: MUTED }}>Manage student records</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold" style={{ background: NAVY, color: CREAM }}>
          <Plus size={15} /> Add Student
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={view} onChange={(e) => { setView(e.target.value); setSelectedClass(""); }}
          className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY, minWidth: 160 }}>
          <option value="overall">Overall View</option>
          <option value="by_class">By Class</option>
        </select>
        {view === "by_class" && (
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
            className="px-4 py-2.5 rounded-xl outline-none text-sm" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)", color: NAVY, minWidth: 180 }}>
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
        loading={isLoading}
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
            onClick: async (ids) => { deleteMutation.mutate(ids); },
          },
        ]}
        emptyState={
          <div className="text-center py-12">
            <GraduationCap size={40} color={MUTED} className="mx-auto mb-3" />
            <p style={{ color: NAVY, fontWeight: 600 }}>No students found</p>
            <p className="text-sm mt-1" style={{ color: MUTED }}>
              {search ? "Try a different search term." : "No students yet. Click the + button to add your first student."}
            </p>
          </div>
        }
      />
    </div>
  );
}
