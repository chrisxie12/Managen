import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Filter, Download, Upload, Trash2 } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const PRIMARY = "#031B4E";
const INFO = "#3B82F6";

interface Student {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
  gender: string;
  parentPhone: string;
  status: "active" | "inactive" | "left";
}

const mockStudents: Student[] = [
  {
    id: "1",
    name: "Ama Owusu",
    admissionNo: "2024/001",
    class: "Form 1A",
    gender: "Female",
    parentPhone: "+233 54 123 4567",
    status: "active",
  },
  {
    id: "2",
    name: "Kwesi Mensah",
    admissionNo: "2024/002",
    class: "Form 1A",
    gender: "Male",
    parentPhone: "+233 54 234 5678",
    status: "active",
  },
  {
    id: "3",
    name: "Abena Boateng",
    admissionNo: "2024/003",
    class: "Form 2B",
    gender: "Female",
    parentPhone: "+233 54 345 6789",
    status: "active",
  },
];

export function StudentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [students] = useState(mockStudents);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTemplate
      title="Students"
      description="Manage all students in your school"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Students" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard/students/import")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm"
            style={{
              background: "white",
              color: PRIMARY,
              border: `1px solid ${PRIMARY}30`,
            }}
          >
            <Upload size={18} />
            Import
          </button>
          <button
            onClick={() => navigate("/dashboard/students/add")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm text-white"
            style={{ background: PRIMARY }}
          >
            <Plus size={18} />
            Add Student
          </button>
        </div>
      }
    >
      {/* Toolbar */}
      <div
        className="p-4 rounded-lg flex items-center gap-3"
        style={{ background: "white", border: `1px solid ${NAVY}20` }}
      >
        <Search size={18} style={{ color: MUTED }} />
        <input
          type="text"
          placeholder="Search by name or admission number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-sm outline-none"
          style={{ color: NAVY }}
        />
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Filter size={18} style={{ color: MUTED }} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Download size={18} style={{ color: MUTED }} />
        </button>
      </div>

      {/* Students Table or Empty State */}
      {students.length === 0 ? (
        <div
          className="p-12 text-center rounded-lg"
          style={{ background: "white", border: `1px dashed ${NAVY}40` }}
        >
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: `${PRIMARY}15` }}>
            <Upload size={24} style={{ color: PRIMARY }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: NAVY }}>No Students Found</h3>
          <p style={{ color: MUTED }} className="max-w-md mx-auto mb-6">
            Get started by importing your students using the official NaCCA CSV template or adding them manually.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/dashboard/students/import")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-white"
              style={{ background: PRIMARY }}
            >
              <Upload size={18} />
              Import CSV
            </button>
            <button
              onClick={() => navigate("/dashboard/students/add")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all"
              style={{
                background: "white",
                color: PRIMARY,
                border: `1px solid ${PRIMARY}40`,
              }}
            >
              <Plus size={18} />
              Add Manually
            </button>
          </div>
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
                    Name
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold"
                    style={{ color: NAVY, textTransform: "uppercase" }}
                  >
                    Admission No.
                  </th>
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
                    Parent Phone
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
                {filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    style={{ borderBottom: `1px solid ${NAVY}15` }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm" style={{ color: NAVY, fontWeight: 500 }}>
                      {student.name}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: MUTED }}>
                      {student.admissionNo}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: MUTED }}>
                      {student.class}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: MUTED }}>
                      {student.parentPhone}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: `${INFO}20`,
                          color: INFO,
                        }}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/students/${student.id}`)
                          }
                          className="text-xs font-medium px-3 py-1 rounded transition-colors"
                          style={{
                            color: INFO,
                            background: `${INFO}15`,
                          }}
                        >
                          View
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

      {/* Stats Footer */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: `${NAVY}08`,
          border: `1px solid ${NAVY}20`,
        }}
      >
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>
          Showing <strong>{filteredStudents.length}</strong> of{" "}
          <strong>{students.length}</strong> students
        </p>
      </div>
    </PageTemplate>
  );
}
