import { useState, useEffect } from "react";
import { Search, Building2, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import { api } from "../services/api";

const ACCENT = "#ff6b35";

interface School {
  id: string;
  schoolName: string;
  email: string;
  phone: string;
  slug: string;
  plan: string;
  status: string;
  createdAt: string;
}

export function SuperAdminSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get<{ schools: School[]; total: number }>(`/api/superadmin/schools?page=${page}&limit=20`)
      .then((res) => {
        if (res.data) {
          setSchools(res.data.schools);
          setTotal(res.data.total);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = schools.filter((s) =>
    s.schoolName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontWeight: 700, fontSize: "1.2rem" }}>Schools ({total})</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Manage all schools on the platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 max-w-md" style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search size={15} color="#64748b" />
          <input placeholder="Search by name, email, or slug..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1" style={{ color: "#e2e8f0" }} />
        </div>
      </div>

      <div className="rounded-[24px] overflow-hidden" style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              {["School", "Email", "Plan", "Status", "Created", ""].map((h) => (
                <th key={h} className="text-left px-5 py-3" style={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.5px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((school) => (
              <tr key={school.id} className="cursor-pointer hover:opacity-80" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                onClick={() => setSelectedSchool(selectedSchool?.id === school.id ? null : school)}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${ACCENT}15` }}>
                      <Building2 size={15} color={ACCENT} />
                    </div>
                    <div>
                      <div style={{ color: "#e2e8f0", fontSize: "0.88rem", fontWeight: 500 }}>{school.schoolName}</div>
                      <div style={{ color: "#64748b", fontSize: "0.72rem" }}>{school.slug}.managen.io</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4" style={{ color: "#94a3b8", fontSize: "0.82rem" }}>{school.email}</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{
                    background: school.plan === "premium" ? "#8B5CF620" : school.plan === "standard" ? "#10B98120" : school.plan === "basic" ? "#6366F120" : "#F59E0B20",
                    color: school.plan === "premium" ? "#8B5CF6" : school.plan === "standard" ? "#10B981" : school.plan === "basic" ? "#6366F1" : "#F59E0B",
                  }}>
                    {school.plan.charAt(0).toUpperCase() + school.plan.slice(1)}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {school.status === "active" ? (
                    <div className="flex items-center gap-1.5" style={{ color: "#10B981", fontSize: "0.82rem" }}>
                      <CheckCircle size={13} /> Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5" style={{ color: "#EF4444", fontSize: "0.82rem" }}>
                      <XCircle size={13} /> Suspended
                    </div>
                  )}
                </td>
                <td className="px-5 py-4" style={{ color: "#64748b", fontSize: "0.78rem" }}>
                  {school.createdAt ? new Date(school.createdAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-4">
                  <button style={{ color: "#64748b" }}><MoreHorizontal size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && (
          <div className="text-center py-12" style={{ color: "#64748b" }}>No schools found</div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div style={{ color: "#64748b", fontSize: "0.82rem" }}>Page {page} of {Math.max(1, Math.ceil(total / 20))}</div>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-xl text-sm disabled:opacity-30"
            style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)", color: "#e2e8f0" }}>Previous</button>
          <button onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-xl text-sm"
            style={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.07)", color: "#e2e8f0" }}>Next</button>
        </div>
      </div>
    </div>
  );
}
