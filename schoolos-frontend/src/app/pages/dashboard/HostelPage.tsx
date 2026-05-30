import { useState } from "react";
import { Plus, BedDouble, Users, DoorOpen, Banknote, X } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const PRIMARY = "#031B4E";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const INFO = "#3B82F6";

type FeeStatus = "paid" | "partial" | "outstanding";
type BlockFilter = "All" | "Block A" | "Block B" | "Block C";

interface HostelBlock {
  id: string;
  name: string;
  type: "Boys" | "Girls" | "Mixed";
  totalBeds: number;
  occupied: number;
  warden: string;
  wardenPhone: string;
}

interface HostelStudent {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
  room: string;
  block: string;
  feeStatus: FeeStatus;
  moveOutDate: string;
}

const feeStatusConfig: Record<FeeStatus, { label: string; color: string }> = {
  paid: { label: "Paid", color: SUCCESS },
  partial: { label: "Partial", color: WARNING },
  outstanding: { label: "Outstanding", color: DANGER },
};

const blockTypeColor: Record<"Boys" | "Girls" | "Mixed", string> = {
  Boys: INFO,
  Girls: "#EC4899",
  Mixed: WARNING,
};

export function HostelPage() {
  const [blockFilter, setBlockFilter] = useState<BlockFilter>("All");
  const [students, setStudents] = useState<HostelStudent[]>([]);
  const [blocks] = useState<HostelBlock[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({ name: "", admissionNo: "", block: "Block A" as Exclude<BlockFilter,"All">, room: "", moveInDate: new Date().toISOString().split("T")[0] });

  const totalBeds = blocks.reduce((s, b) => s + b.totalBeds, 0);
  const occupied = blocks.reduce((s, b) => s + b.occupied, 0);
  const vacant = totalBeds - occupied;
  const monthlyRevenue = 0;

  const filteredStudents =
    blockFilter === "All"
      ? students
      : students.filter((s) => s.block === blockFilter);

  const BLOCKS: BlockFilter[] = ["All", "Block A", "Block B", "Block C"];

  return (
    <PageTemplate
      title="Hostel Management"
      description="Manage boarding student accommodation and room assignments"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Hostel" },
      ]}
      actions={
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white"
          style={{ background: PRIMARY }}
        >
          <Plus size={16} />
          Assign Room
        </button>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Beds", value: totalBeds, icon: BedDouble, color: NAVY },
          { label: "Occupied", value: occupied, icon: Users, color: INFO },
          { label: "Vacant", value: vacant, icon: DoorOpen, color: SUCCESS },
          { label: "Monthly Revenue", value: `₵${(monthlyRevenue / 1000).toFixed(1)}K`, icon: Banknote, color: WARNING },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-5 rounded-lg flex items-start gap-4"
            style={{ background: "white", border: `1px solid ${NAVY}20` }}
          >
            <div className="p-2.5 rounded-lg flex-shrink-0" style={{ background: `${color}15` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <div>
              <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500 }}>{label}</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color,
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  marginTop: "0.25rem",
                }}
              >
                {value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hostel Blocks */}
      <div>
        <h3 className="font-semibold mb-3" style={{ color: NAVY }}>Hostel Blocks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {blocks.map((block) => {
            const occupancyPct = Math.round((block.occupied / block.totalBeds) * 100);
            const typeColor = blockTypeColor[block.type];
            return (
              <div
                key={block.id}
                className="p-5 rounded-lg"
                style={{ background: "white", border: `1px solid ${NAVY}20` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div style={{ color: NAVY, fontWeight: 700, fontSize: "1rem" }}>{block.name}</div>
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ background: `${typeColor}15`, color: typeColor }}
                    >
                      {block.type}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: occupancyPct >= 90 ? DANGER : occupancyPct >= 70 ? WARNING : SUCCESS,
                      fontSize: "1.4rem",
                      fontWeight: 700,
                    }}
                  >
                    {occupancyPct}%
                  </div>
                </div>

                {/* Occupancy Bar */}
                <div className="h-2 rounded-full mb-3" style={{ background: `${NAVY}10` }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${occupancyPct}%`,
                      background:
                        occupancyPct >= 90 ? DANGER : occupancyPct >= 70 ? WARNING : SUCCESS,
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs mb-3" style={{ color: MUTED }}>
                  <span>{block.occupied} occupied</span>
                  <span>{block.totalBeds - block.occupied} vacant</span>
                </div>

                <div style={{ color: MUTED, fontSize: "0.78rem" }}>
                  <div>Warden: <span style={{ color: NAVY, fontWeight: 500 }}>{block.warden}</span></div>
                  <div style={{ marginTop: "0.2rem" }}>{block.wardenPhone}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Student Occupancy Table */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold" style={{ color: NAVY }}>Student Occupancy</h3>
          <div className="flex items-center gap-1">
            {BLOCKS.map((b) => (
              <button
                key={b}
                onClick={() => setBlockFilter(b)}
                className="px-3 py-1 rounded text-xs font-medium transition-all"
                style={{
                  background: blockFilter === b ? `${PRIMARY}15` : "transparent",
                  color: blockFilter === b ? PRIMARY : MUTED,
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${NAVY}20` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `${NAVY}08`, borderBottom: `1px solid ${NAVY}20` }}>
                  {["Student", "Class", "Room", "Block", "Fee Status", "Move Out"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold"
                      style={{ color: NAVY, textTransform: "uppercase" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const { label, color } = feeStatusConfig[student.feeStatus];
                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{ borderBottom: `1px solid ${NAVY}10` }}
                    >
                      <td className="px-5 py-3.5">
                        <div style={{ color: NAVY, fontWeight: 500 }}>{student.name}</div>
                        <div style={{ color: MUTED, fontSize: "0.73rem" }}>{student.admissionNo}</div>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: MUTED }}>{student.class}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className="font-mono text-xs px-2 py-0.5 rounded"
                          style={{ background: `${NAVY}08`, color: NAVY }}
                        >
                          {student.room}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: MUTED }}>{student.block}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: `${color}15`, color }}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: MUTED, fontSize: "0.8rem" }}>
                        {student.moveOutDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="py-10 text-center" style={{ color: MUTED }}>
              No students in this block.
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="p-4 rounded-lg"
        style={{ background: `${NAVY}08`, border: `1px solid ${NAVY}20` }}
      >
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>
          Showing <strong>{filteredStudents.length}</strong> of{" "}
          <strong>{students.length}</strong> resident students
        </p>
      </div>
      {/* Assign Room Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: NAVY }}>Assign Hostel Room</h3>
              <button onClick={() => setShowAssignModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} style={{ color: MUTED }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Student Name *</label>
                <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="Full name" value={assignForm.name} onChange={e => setAssignForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Admission Number</label>
                <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="e.g. 2024/001" value={assignForm.admissionNo} onChange={e => setAssignForm(f => ({ ...f, admissionNo: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Block</label>
                  <select className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} value={assignForm.block} onChange={e => setAssignForm(f => ({ ...f, block: e.target.value as any }))}>
                    {(["Block A","Block B","Block C"] as Exclude<BlockFilter,"All">[]).map(b => <option key={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Room No.</label>
                  <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="e.g. A-101" value={assignForm.room} onChange={e => setAssignForm(f => ({ ...f, room: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Move-in Date</label>
                <input type="date" className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} value={assignForm.moveInDate} onChange={e => setAssignForm(f => ({ ...f, moveInDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: MUTED, background: `${NAVY}08` }}>Cancel</button>
              <button
                disabled={!assignForm.name}
                onClick={() => {
                  if (!assignForm.name) return;
                  const s: any = { id: String(Date.now()), name: assignForm.name, admissionNo: assignForm.admissionNo || "—", class: "—", block: assignForm.block, room: assignForm.room || "—", feeStatus: "outstanding" as const, monthlyFee: 0, moveInDate: assignForm.moveInDate, moveOutDate: "—" };
                  setStudents(prev => [s, ...prev]);
                  setAssignForm({ name: "", admissionNo: "", block: "Block A", room: "", moveInDate: new Date().toISOString().split("T")[0] });
                  setShowAssignModal(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: PRIMARY, opacity: !assignForm.name ? 0.6 : 1 }}
              >
                Assign Room
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
