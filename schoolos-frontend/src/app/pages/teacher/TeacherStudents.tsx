import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, Download, Users, User, UserCheck } from "lucide-react";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";

interface Student {
  id: string; name: string; admissionNo: string; gender: "M" | "F";
  parentPhone: string; attendanceRate: number; lastSeen: string; class: string;
}

export function TeacherStudents() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<string[]>([]);
  const [activeClass, setActiveClass] = useState("");
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ classes: any[] }>('/api/school/my-classes')
      .then(res => {
        const raw = res.data?.classes ?? [];
        const names = raw.map((c: any) => c.name ?? c.class_name ?? "");
        setClasses(names);
        if (names.length > 0) setActiveClass(names[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeClass) return;
    if (studentsByClass[activeClass]) return;
    api.get<{ students: any[] }>(`/api/school/students?className=${encodeURIComponent(activeClass)}`)
      .then(res => {
        const raw = res.data?.students ?? [];
        const mapped: Student[] = raw.map((s: any) => ({
          id: String(s.id ?? ""),
          name: s.name ?? s.full_name ?? "",
          admissionNo: s.admissionNo ?? s.admission_number ?? "",
          gender: (s.gender === "Female" || s.gender === "F") ? "F" : "M",
          parentPhone: s.parentPhone ?? s.parent_phone ?? s.phone ?? "",
          attendanceRate: Number(s.attendanceRate ?? s.attendance_rate ?? 0),
          lastSeen: s.lastSeen ?? s.last_seen ?? "—",
          class: activeClass,
        }));
        setStudentsByClass(prev => ({ ...prev, [activeClass]: mapped }));
      })
      .catch(() => {
        setStudentsByClass(prev => ({ ...prev, [activeClass]: [] }));
      });
  }, [activeClass]);

  const students = studentsByClass[activeClass] ?? [];
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(search.toLowerCase())
  );

  const boys = filtered.filter(s => s.gender === "M").length;
  const girls = filtered.filter(s => s.gender === "F").length;
  const avgAtt = filtered.length ? Math.round(filtered.reduce((a, s) => a + s.attendanceRate, 0) / filtered.length) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm" style={{ color: MUTED }}>Loading classes…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>My Students</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Class roster for your assigned classes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border bg-card hover:bg-muted/50 transition-colors" style={{ color: MUTED }}>
          <Download size={15} /> Export
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Users size={40} className="mx-auto mb-3" style={{ color: MUTED }} />
          <p className="text-sm font-medium" style={{ color: NAVY }}>No classes assigned</p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>Your class assignments will appear here once configured.</p>
        </div>
      ) : (
        <>
          {/* Class tabs */}
          <div className="flex gap-2 flex-wrap">
            {classes.map(c => (
              <button key={c} onClick={() => setActiveClass(c)}
                className="px-4 py-1.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: activeClass === c ? NAVY : "transparent",
                  color: activeClass === c ? "white" : MUTED,
                  border: `1px solid ${activeClass === c ? NAVY : "var(--border)"}`,
                }}>
                {c}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Users, label: "Total", value: filtered.length, color: NAVY },
              { icon: User, label: "Boys", value: boys, color: "#0080FF" },
              { icon: UserCheck, label: "Girls", value: girls, color: "#EC4899" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={18} color={color} />
                </div>
                <div>
                  <p className="text-lg font-bold" style={{ color: NAVY }}>{value}</p>
                  <p className="text-xs" style={{ color: MUTED }}>{label} · {avgAtt}% att.</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl text-sm border border-border bg-card focus:outline-none"
              placeholder="Search by name or admission no…" />
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: MUTED }}>Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: MUTED }}>Adm. No</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden md:table-cell" style={{ color: MUTED }}>Parent Phone</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: MUTED }}>Attendance</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold hidden sm:table-cell" style={{ color: MUTED }}>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.id}
                    onClick={() => navigate(`/dashboard/student/details/${s.id}`)}
                    className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors"
                    style={{ background: i % 2 === 0 ? undefined : "var(--muted)/5" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: s.gender === "F" ? "#FCE7F3" : "#DBEAFE", color: s.gender === "F" ? "#EC4899" : "#0080FF" }}>
                          {s.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium" style={{ color: NAVY }}>{s.name}</p>
                          <p className="text-xs" style={{ color: MUTED }}>{s.gender === "M" ? "Male" : "Female"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs font-mono" style={{ color: MUTED }}>{s.admissionNo}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs" style={{ color: MUTED }}>{s.parentPhone}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: s.attendanceRate >= 90 ? "#DCFCE7" : s.attendanceRate >= 75 ? "#FEF3C7" : "#FEE2E2",
                          color: s.attendanceRate >= 90 ? SUCCESS : s.attendanceRate >= 75 ? "#D97706" : "#DC2626",
                        }}>
                        {s.attendanceRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs" style={{ color: MUTED }}>{s.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-sm" style={{ color: MUTED }}>
                {students.length === 0 ? "No students in this class yet." : "No students match your search."}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
