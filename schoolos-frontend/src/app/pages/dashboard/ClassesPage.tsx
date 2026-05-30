import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Plus, Edit2, Trash2, Users, BookOpen, X } from "lucide-react";
import { toast } from "sonner";
import { PageTemplate } from "../../components/layout/PageTemplate";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const PRIMARY = "#031B4E";
const INFO = "#3B82F6";
const SUCCESS = "#16A34A";

interface ClassRecord {
  id: string;
  name: string;
  form: string;
  classTeacher: string;
  students: number;
  subjects: number;
  status: "active" | "inactive";
}

export function ClassesPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Class modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassForm, setNewClassForm] = useState("");
  const [newClassTeacher, setNewClassTeacher] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ classes: any[] }>("/api/school/classes");
      const raw = res.data?.classes ?? [];
      const mapped: ClassRecord[] = raw.map((c: any) => ({
        id: String(c.id ?? c._id ?? ""),
        name: c.name ?? c.class_name ?? "",
        form: c.form ?? c.level ?? c.form_level ?? "",
        classTeacher: c.classTeacher ?? c.class_teacher ?? c.teacher ?? "",
        students: Number(c.students ?? c.student_count ?? 0),
        subjects: Number(c.subjects ?? c.subject_count ?? 0),
        status: c.status ?? "active",
      }));
      setClasses(mapped);
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async () => {
    if (!newClassName.trim()) return;
    setIsSaving(true);
    try {
      await api.post("/api/school/classes", {
        name: newClassName.trim(),
        form: newClassForm.trim(),
        class_teacher: newClassTeacher.trim(),
      });
      setShowAddModal(false);
      setNewClassName("");
      setNewClassForm("");
      setNewClassTeacher("");
      await fetchClasses();
    } catch (err) {
      console.error("Failed to create class:", err);
      toast.error("Failed to create class. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const totalStudents = classes.reduce((sum: number, c: ClassRecord) => sum + c.students, 0);
  const totalSubjects = classes.reduce((sum: number, c: ClassRecord) => sum + c.subjects, 0);

  return (
    <PageTemplate
      title="Classes & Subjects"
      description="Manage school classes and subjects"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Classes & Subjects" },
      ]}
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm text-white"
          style={{ background: PRIMARY }}
        >
          <Plus size={18} />
          Add Class
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-6 rounded-lg"
          style={{
            background: "white",
            border: `1px solid ${NAVY}20`,
          }}
        >
          <div style={{ color: MUTED, fontSize: "0.875rem", fontWeight: 500 }}>
            Total Classes
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: NAVY,
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            {classes.length}
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            background: "white",
            border: `1px solid ${NAVY}20`,
          }}
        >
          <div style={{ color: MUTED, fontSize: "0.875rem", fontWeight: 500 }}>
            Total Students
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: INFO,
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            {totalStudents}
          </div>
        </div>

        <div
          className="p-6 rounded-lg"
          style={{
            background: "white",
            border: `1px solid ${NAVY}20`,
          }}
        >
          <div style={{ color: MUTED, fontSize: "0.875rem", fontWeight: 500 }}>
            Total Subjects
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: SUCCESS,
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            {totalSubjects}
          </div>
        </div>
      </div>

      {/* Classes Table */}
      {loading ? (
        <div
          className="p-12 text-center rounded-lg"
          style={{ background: "white", border: `1px solid ${NAVY}20` }}
        >
          <p style={{ color: MUTED }}>Loading classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div
          className="p-12 text-center rounded-lg"
          style={{ background: "white", border: `1px dashed ${NAVY}40` }}
        >
          <p style={{ color: MUTED }}>No classes found. Add your first class to get started.</p>
        </div>
      ) : (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: `1px solid ${NAVY}20` }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    background: `${NAVY}08`,
                    borderBottom: `1px solid ${NAVY}20`,
                  }}
                >
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Class
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Class Teacher
                  </th>
                  <th
                    className="px-6 py-3 text-center text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Students
                  </th>
                  <th
                    className="px-6 py-3 text-center text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Subjects
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classRecord) => (
                  <tr
                    key={classRecord.id}
                    style={{ borderBottom: `1px solid ${NAVY}15` }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm" style={{ color: NAVY, fontWeight: 600 }}>
                      {classRecord.name}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: MUTED }}>
                      {classRecord.classTeacher}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2" style={{ color: NAVY }}>
                        <Users size={16} />
                        {classRecord.students}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <div className="flex items-center justify-center gap-2" style={{ color: NAVY }}>
                        <BookOpen size={16} />
                        {classRecord.subjects}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: `${SUCCESS}20`,
                          color: SUCCESS,
                        }}
                      >
                        {classRecord.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/classes/${classRecord.id}/edit`)
                          }
                          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} style={{ color: INFO }} />
                        </button>
                        <button
                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} style={{ color: "#EF4444" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Class</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} style={{ color: MUTED }} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Form 1A"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Form / Level
              </label>
              <input
                type="text"
                placeholder="e.g. Form 1"
                value={newClassForm}
                onChange={(e) => setNewClassForm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Teacher Name
              </label>
              <input
                type="text"
                placeholder="e.g. Mr. Kofi Anane"
                value={newClassTeacher}
                onChange={(e) => setNewClassTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded font-medium text-sm text-gray-600 hover:bg-gray-100"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleAddClass}
                disabled={isSaving || !newClassName.trim()}
                className="px-4 py-2 rounded font-medium text-sm text-white"
                style={{
                  background: PRIMARY,
                  opacity: isSaving || !newClassName.trim() ? 0.7 : 1,
                }}
              >
                {isSaving ? "Saving..." : "Add Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
