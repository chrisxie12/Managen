import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, BedDouble, Users, DoorOpen, Banknote } from "lucide-react";
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

const mockBlocks: HostelBlock[] = [
  {
    id: "A",
    name: "Block A",
    type: "Boys",
    totalBeds: 120,
    occupied: 108,
    warden: "Mr. Emmanuel Asante",
    wardenPhone: "+233 24 501 2233",
  },
  {
    id: "B",
    name: "Block B",
    type: "Girls",
    totalBeds: 100,
    occupied: 94,
    warden: "Mrs. Grace Mensah",
    wardenPhone: "+233 24 601 3344",
  },
  {
    id: "C",
    name: "Block C",
    type: "Mixed",
    totalBeds: 80,
    occupied: 61,
    warden: "Mr. Isaac Appiah",
    wardenPhone: "+233 24 701 4455",
  },
];

const mockStudents: HostelStudent[] = [
  {
    id: "1",
    name: "Kofi Asante",
    admissionNo: "2024/011",
    class: "Form 2A",
    room: "A-14",
    block: "Block A",
    feeStatus: "paid",
    moveOutDate: "2024-08-30",
  },
  {
    id: "2",
    name: "Kwame Adjei",
    admissionNo: "2024/012",
    class: "Form 3B",
    room: "A-07",
    block: "Block A",
    feeStatus: "partial",
    moveOutDate: "2024-08-30",
  },
  {
    id: "3",
    name: "Abena Owusu",
    admissionNo: "2024/013",
    class: "Form 1C",
    room: "B-03",
    block: "Block B",
    feeStatus: "paid",
    moveOutDate: "2024-08-30",
  },
  {
    id: "4",
    name: "Ama Boateng",
    admissionNo: "2024/014",
    class: "Form 2B",
    room: "B-11",
    block: "Block B",
    feeStatus: "outstanding",
    moveOutDate: "2024-08-30",
  },
  {
    id: "5",
    name: "Efua Darko",
    admissionNo: "2024/015",
    class: "Form 3A",
    room: "B-22",
    block: "Block B",
    feeStatus: "paid",
    moveOutDate: "2024-08-30",
  },
  {
    id: "6",
    name: "Yaw Acheampong",
    admissionNo: "2024/016",
    class: "Form 1A",
    room: "C-05",
    block: "Block C",
    feeStatus: "partial",
    moveOutDate: "2024-08-30",
  },
  {
    id: "7",
    name: "Nana Ama Frimpong",
    admissionNo: "2024/017",
    class: "Form 2C",
    room: "C-09",
    block: "Block C",
    feeStatus: "paid",
    moveOutDate: "2024-08-30",
  },
  {
    id: "8",
    name: "Kojo Twum",
    admissionNo: "2024/018",
    class: "Form 3C",
    room: "A-18",
    block: "Block A",
    feeStatus: "outstanding",
    moveOutDate: "2024-08-30",
  },
];

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
  const navigate = useNavigate();
  const [blockFilter, setBlockFilter] = useState<BlockFilter>("All");
  const [students] = useState(mockStudents);
  const [blocks] = useState(mockBlocks);

  const totalBeds = blocks.reduce((s, b) => s + b.totalBeds, 0);
  const occupied = blocks.reduce((s, b) => s + b.occupied, 0);
  const vacant = totalBeds - occupied;
  const monthlyRevenue = 78400;

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
          onClick={() => navigate("/dashboard/hostel/assign")}
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
    </PageTemplate>
  );
}
