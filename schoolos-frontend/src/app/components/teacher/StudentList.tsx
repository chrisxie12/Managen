import { useState, useMemo } from "react";
import { Search, Users, Loader2 } from "lucide-react";
import type { ClassStudent } from "./types";

const NAVY = "#0A2472";
const NAVY_LIGHT = "#0C2D8A";
const CREAM = "#F8F9FA";
const MUTED = "#6B7280";

export function StudentList({ students, loading }: { students: ClassStudent[]; loading: boolean }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(q) || (s.admission_no || "").toLowerCase().includes(q)
    );
  }, [students, search]);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin" color={MUTED} /></div>;
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-12" style={{ color: MUTED }}>
        <Users size={36} className="mx-auto mb-3" color={MUTED} />
        <p className="font-semibold" style={{ color: NAVY }}>No Students</p>
        <p className="text-sm mt-1">No students assigned to this class.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 max-w-xs" style={{ background: "white", border: "1px solid rgba(10,36,114,0.1)" }}>
        <Search size={14} color={MUTED} />
        <input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-sm flex-1"
          style={{ color: NAVY }}
        />
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider" style={{ color: MUTED, borderBottom: "1px solid rgba(10,36,114,0.07)" }}>
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Admission No.</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-8 text-sm" style={{ color: MUTED }}>No students match your search.</td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.id} className="text-sm" style={{ borderBottom: "1px solid rgba(10,36,114,0.05)" }}>
                <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `linear-gradient(135deg, ${NAVY}, ${NAVY_LIGHT})`, color: CREAM }}>
                      {s.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: NAVY }}>{s.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{s.admission_no || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs mt-2" style={{ color: MUTED }}>{filtered.length} of {students.length} student{students.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
