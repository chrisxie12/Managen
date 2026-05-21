import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Edit2, Trash2, Users, BookOpen } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";

const NAVY = "#0A2472";
const MUTED = "#6B7280";
const PRIMARY = "#0A2472";
const INFO = "#3B82F6";
const SUCCESS = "#10B981";

interface ClassRecord {
  id: string;
  name: string;
  form: string;
  classTeacher: string;
  students: number;
  subjects: number;
  status: "active" | "inactive";
}

const mockClasses: ClassRecord[] = [
  {
    id: "1",
    name: "Form 1A",
    form: "Form 1",
    classTeacher: "Mr. Kofi Anane",
    students: 30,
    subjects: 8,
    status: "active",
  },
  {
    id: "2",
    name: "Form 1B",
    form: "Form 1",
    classTeacher: "Mrs. Ama Mensah",
    students: 28,
    subjects: 8,
    status: "active",
  },
  {
    id: "3",
    name: "Form 2A",
    form: "Form 2",
    classTeacher: "Mr. Kwesi Boateng",
    students: 32,
    subjects: 8,
    status: "active",
  },
];

export function ClassesPage() {
  const navigate = useNavigate();
  const [classes] = useState(mockClasses);

  const totalStudents = classes.reduce((sum, c) => sum + c.students, 0);
  const totalSubjects = classes.reduce((sum, c) => sum + c.subjects, 0);

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
          onClick={() => navigate("/dashboard/classes/add")}
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
    </PageTemplate>
  );
}
