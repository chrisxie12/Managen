import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, Download, Users, User, UserCheck } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";

interface Student {
  id: string; name: string; admissionNo: string; gender: "M" | "F";
  parentPhone: string; attendanceRate: number; lastSeen: string; class: string;
}

const mockStudents: Record<string, Student[]> = {
  "Form 1A": [
    { id: "1", name: "Ama Owusu", admissionNo: "2024/001", gender: "F", parentPhone: "0244123456", attendanceRate: 95, lastSeen: "Today", class: "Form 1A" },
    { id: "2", name: "Kwesi Mensah", admissionNo: "2024/002", gender: "M", parentPhone: "0277654321", attendanceRate: 88, lastSeen: "Today", class: "Form 1A" },
    { id: "3", name: "Abena Boateng", admissionNo: "2024/003", gender: "F", parentPhone: "0201234567", attendanceRate: 92, lastSeen: "Yesterday", class: "Form 1A" },
    { id: "4", name: "Kofi Asante", admissionNo: "2024/004", gender: "M", parentPhone: "0559876543", attendanceRate: 79, lastSeen: "Today", class: "Form 1A" },
    { id: "5", name: "Akua Poku", admissionNo: "2024/005", gender: "F", parentPhone: "0244987654", attendanceRate: 98, lastSeen: "Today", class: "Form 1A" },
    { id: "6", name: "Yaw Darko", admissionNo: "2024/006", gender: "M", parentPhone: "0277111222", attendanceRate: 85, lastSeen: "2 days ago", class: "Form 1A" },
  ],
  "Form 1B": [
    { id: "7", name: "Efua Bonsu", admissionNo: "2024/007", gender: "F", parentPhone: "0244333444", attendanceRate: 91, lastSeen: "Today", class: "Form 1B" },
    { id: "8", name: "Kojo Frimpong", admissionNo: "2024/008", gender: "M", parentPhone: "0201555666", attendanceRate: 87, lastSeen: "Today", class: "Form 1B" },
    { id: "9", name: "Adwoa Amponsah", admissionNo: "2024/009", gender: "F", parentPhone: "0277777888", attendanceRate: 96, lastSeen: "Today", class: "Form 1B" },
    { id: "10", name: "Nana Adjei", admissionNo: "2024/010", gender: "M", parentPhone: "0559222333", attendanceRate: 82, lastSeen: "Today", class: "Form 1B" },
  ],
  "Form 2A": [
    { id: "11", name: "Serwaa Amoah", admissionNo: "2023/011", gender: "F", parentPhone: "0244444555", attendanceRate: 94, lastSeen: "Today", class: "Form 2A" },
    { id: "12", name: "Kwame Osei", admissionNo: "2023/012", gender: "M", parentPhone: "0201666777", attendanceRate: 89, lastSeen: "Today", class: "Form 2A" },
    { id: "13", name: "Esi Acheampong", admissionNo: "2023/013", gender: "F", parentPhone: "0277888999", attendanceRate: 97, lastSeen: "Today", class: "Form 2A" },
    { id: "14", name: "Fiifi Quaye", admissionNo: "2023/014", gender: "M", parentPhone: "0559444555", attendanceRate: 76, lastSeen: "3 days ago", class: "Form 2A" },
  ],
};

const classes = ["Form 1A", "Form 1B", "Form 2A"];

export function TeacherStudents() {
  const navigate = useNavigate();
  const [activeClass, setActiveClass] = useState("Form 1A");
  const [search, setSearch] = useState("");

  const students = mockStudents[activeClass] || [];
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(search.toLowerCase())
  );

  const boys = filtered.filter(s => s.gender === "M").length;
  const girls = filtered.filter(s => s.gender === "F").length;
  const avgAtt = filtered.length ? Math.round(filtered.reduce((a, s) => a + s.attendanceRate, 0) / filtered.length) : 0;

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
          <div className="text-center py-10 text-sm" style={{ color: MUTED }}>No students found</div>
        )}
      </div>
    </div>
  );
}
