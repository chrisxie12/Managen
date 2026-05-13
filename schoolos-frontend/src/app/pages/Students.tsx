import { useState } from "react";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const students = [
  { id: "GH-2024-001", name: "Ama Owusu", class: "JHS 3A", age: 15, gender: "Female", feeStatus: "paid", attendance: 96, phone: "+233 24 000 1234", email: "parent.owusu@gmail.com", address: "Cantonments, Accra", gpa: 96.4 },
  { id: "GH-2024-012", name: "Kwesi Boateng", class: "JHS 2B", age: 14, gender: "Male", feeStatus: "paid", attendance: 92, phone: "+233 20 111 5678", email: "boateng.family@gmail.com", address: "East Legon, Accra", gpa: 94.1 },
  { id: "GH-2024-034", name: "Efua Mensah", class: "JHS 3A", age: 15, gender: "Female", feeStatus: "partial", attendance: 88, phone: "+233 55 222 9012", email: "mensah.home@yahoo.com", address: "Tema, Greater Accra", gpa: 91.7 },
  { id: "GH-2024-047", name: "Yaw Darko", class: "JHS 1C", age: 13, gender: "Male", feeStatus: "paid", attendance: 94, phone: "+233 24 333 3456", email: "darko.parents@gmail.com", address: "Adenta, Accra", gpa: 90.2 },
  { id: "GH-2024-055", name: "Abena Asante", class: "JHS 2A", age: 14, gender: "Female", feeStatus: "overdue", attendance: 76, phone: "+233 20 444 7890", email: "asante.jnr@gmail.com", address: "Madina, Accra", gpa: 78.5 },
  { id: "GH-2024-067", name: "Kofi Adu", class: "JHS 3B", age: 15, gender: "Male", feeStatus: "paid", attendance: 98, phone: "+233 27 555 1234", email: "k.adu.parent@gmail.com", address: "Airport Res., Accra", gpa: 88.3 },
  { id: "GH-2024-078", name: "Akosua Frimpong", class: "JHS 1A", age: 13, gender: "Female", feeStatus: "partial", attendance: 82, phone: "+233 54 666 5678", email: "frimpong.family@outlook.com", address: "Spintex, Accra", gpa: 83.0 },
  { id: "GH-2024-089", name: "Kwame Nkrumah Jr", class: "JHS 2C", age: 14, gender: "Male", feeStatus: "overdue", attendance: 70, phone: "+233 24 777 9012", email: "nkrumah.jnr@gmail.com", address: "Nungua, Accra", gpa: 72.1 },
];

const classes = ["All Classes", "JHS 1A", "JHS 1C", "JHS 2A", "JHS 2B", "JHS 2C", "JHS 3A", "JHS 3B"];
const feeFilters = ["All", "Paid", "Partial", "Overdue"];

const FeeStatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string; label: string; icon: typeof CheckCircle2 }> = {
    paid: { bg: "#D1FAE5", color: "#065F46", label: "Paid", icon: CheckCircle2 },
    partial: { bg: "#FEF3C7", color: "#92400E", label: "Partial", icon: Clock },
    overdue: { bg: "#FEE2E2", color: "#991B1B", label: "Overdue", icon: AlertCircle },
  };
  const s = map[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color, fontSize: "0.72rem", fontWeight: 600 }}
    >
      <s.icon size={10} />
      {s.label}
    </span>
  );
};

export function Students() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All Classes");
  const [feeFilter, setFeeFilter] = useState("All");
  const [selected, setSelected] = useState<typeof students[0] | null>(null);

  const filtered = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase());
    const matchClass = classFilter === "All Classes" || s.class === classFilter;
    const matchFee =
      feeFilter === "All" || s.feeStatus === feeFilter.toLowerCase();
    return matchSearch && matchClass && matchFee;
  });

  return (
    <div className="flex gap-5 h-full" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Left Panel: Student List ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 min-w-[180px]"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.08)`,
              boxShadow: "0 2px 8px rgba(56,25,50,0.04)",
            }}
          >
            <Search size={14} color={MUTED} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students or IDs..."
              className="bg-transparent outline-none text-sm flex-1"
              style={{ color: PLUM }}
            />
            {search && (
              <button onClick={() => setSearch("")}>
                <X size={13} color={MUTED} />
              </button>
            )}
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl outline-none text-sm"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.08)`,
              color: PLUM,
            }}
          >
            {classes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>

          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: `1px solid rgba(56,25,50,0.08)` }}
          >
            {feeFilters.map((f) => (
              <button
                key={f}
                onClick={() => setFeeFilter(f)}
                className="px-3 py-2.5 text-sm transition-colors"
                style={{
                  background: feeFilter === f ? PLUM : "white",
                  color: feeFilter === f ? MILK : MUTED,
                }}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm active:scale-95 transition-transform ml-auto"
            style={{
              background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
              color: MILK,
              boxShadow: "0 4px 14px rgba(56,25,50,0.25)",
            }}
          >
            <Plus size={15} /> Add Student
          </button>
        </div>

        {/* Table */}
        <div
          className="rounded-[24px] overflow-hidden flex-1"
          style={{
            background: "white",
            border: `1px solid rgba(56,25,50,0.07)`,
            boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid rgba(56,25,50,0.06)` }}>
                  {["Student", "Class", "Attendance", "Fee Status", "GPA", ""].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left"
                      style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr
                    key={s.id}
                    onClick={() => setSelected(s)}
                    className="cursor-pointer hover:bg-[#FFF3E6]/60 transition-colors"
                    style={{
                      borderBottom: `1px solid rgba(56,25,50,0.04)`,
                      background: selected?.id === s.id ? `rgba(56,25,50,0.04)` : undefined,
                    }}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${PLUM}20, ${PLUM_LIGHT}30)`,
                            color: PLUM_LIGHT,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                          }}
                        >
                          {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p style={{ color: PLUM, fontSize: "0.9rem", fontWeight: 500 }}>
                            {s.name}
                          </p>
                          <p
                            style={{
                              color: MUTED,
                              fontSize: "0.72rem",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            {s.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{
                          background: `rgba(56,25,50,0.07)`,
                          color: PLUM_LIGHT,
                          fontWeight: 500,
                        }}
                      >
                        {s.class}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-1.5 w-20 rounded-full overflow-hidden"
                          style={{ background: "rgba(56,25,50,0.08)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${s.attendance}%`,
                              background:
                                s.attendance >= 90
                                  ? "#10B981"
                                  : s.attendance >= 80
                                  ? "#F59E0B"
                                  : "#EF4444",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: PLUM,
                            fontSize: "0.8rem",
                          }}
                        >
                          {s.attendance}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <FeeStatusBadge status={s.feeStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: PLUM,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {s.gpa}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <ChevronRight size={14} color={MUTED} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: `1px solid rgba(56,25,50,0.06)` }}
          >
            <p style={{ color: MUTED, fontSize: "0.8rem" }}>
              Showing {filtered.length} of {students.length} students
            </p>
            <button
              className="flex items-center gap-1.5 text-sm hover:opacity-70 transition-opacity"
              style={{ color: PLUM_LIGHT }}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Student Profile ── */}
      {selected ? (
        <div
          className="w-80 flex-shrink-0 rounded-[24px] overflow-hidden flex flex-col"
          style={{
            background: "white",
            border: `1px solid rgba(56,25,50,0.07)`,
            boxShadow: "0 4px 24px rgba(56,25,50,0.08)",
          }}
        >
          {/* Profile header */}
          <div
            className="p-6 pb-8"
            style={{
              background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`,
            }}
          >
            <div className="flex justify-between items-start mb-5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(255,243,230,0.15)",
                  color: MILK,
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {selected.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <button onClick={() => setSelected(null)}>
                <X size={18} color="rgba(255,243,230,0.6)" />
              </button>
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: MILK,
                fontSize: "1.2rem",
                fontWeight: 700,
              }}
            >
              {selected.name}
            </h3>
            <p
              style={{
                color: "rgba(255,243,230,0.65)",
                fontSize: "0.8rem",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {selected.id} · {selected.class}
            </p>
            <div className="flex gap-2 mt-3">
              <FeeStatusBadge status={selected.feeStatus} />
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{
                  background: "rgba(255,243,230,0.12)",
                  color: "rgba(255,243,230,0.85)",
                  fontSize: "0.72rem",
                }}
              >
                {selected.gender}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div
            className="grid grid-cols-2 gap-px"
            style={{ background: `rgba(56,25,50,0.07)` }}
          >
            {[
              { label: "GPA", value: `${selected.gpa}%` },
              { label: "Attendance", value: `${selected.attendance}%` },
              { label: "Age", value: `${selected.age} yrs` },
              { label: "Class", value: selected.class },
            ].map((m) => (
              <div
                key={m.label}
                className="p-4 text-center"
                style={{ background: "#FAFAFA" }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: PLUM,
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                >
                  {m.value}
                </div>
                <div style={{ color: MUTED, fontSize: "0.72rem" }}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="p-5 flex-1">
            <p
              className="mb-3 uppercase tracking-widest"
              style={{ color: MUTED, fontSize: "0.65rem" }}
            >
              Parent Contact
            </p>
            <div className="space-y-3">
              {[
                { icon: Phone, label: selected.phone },
                { icon: Mail, label: selected.email },
                { icon: MapPin, label: selected.address },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `rgba(56,25,50,0.06)` }}
                  >
                    <Icon size={13} color={PLUM_LIGHT} />
                  </div>
                  <span style={{ color: PLUM_LIGHT, fontSize: "0.82rem" }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 flex flex-col gap-2">
            <button
              className="w-full py-2.5 rounded-full text-sm active:scale-95 transition-transform"
              style={{
                background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                color: MILK,
                fontWeight: 600,
              }}
            >
              Send WhatsApp Report
            </button>
            <button
              className="w-full py-2.5 rounded-full text-sm active:scale-95 transition-transform"
              style={{
                background: "white",
                color: PLUM,
                border: `1.5px solid rgba(56,25,50,0.15)`,
                fontWeight: 500,
              }}
            >
              Record Fee Payment
            </button>
          </div>
        </div>
      ) : (
        <div
          className="w-80 flex-shrink-0 hidden lg:flex flex-col items-center justify-center rounded-[24px] p-8 text-center"
          style={{
            background: "white",
            border: `1.5px dashed rgba(56,25,50,0.12)`,
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: `rgba(56,25,50,0.05)` }}
          >
            <CheckCircle2 size={24} color={MUTED} />
          </div>
          <p style={{ color: PLUM, fontWeight: 600, marginBottom: "0.4rem" }}>
            Select a student
          </p>
          <p style={{ color: MUTED, fontSize: "0.85rem", lineHeight: 1.6 }}>
            Click any row to view the full student profile and contact details.
          </p>
        </div>
      )}
    </div>
  );
}
