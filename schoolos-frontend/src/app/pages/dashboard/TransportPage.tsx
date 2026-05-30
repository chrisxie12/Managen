import { useState } from "react";
import { Plus, Bus, Route, Users, Banknote, Search, X } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const PRIMARY = "#031B4E";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const INFO = "#3B82F6";

type RouteStatus = "active" | "inactive";
type FeeStatus = "paid" | "partial" | "outstanding";

interface TransportRoute {
  id: string;
  name: string;
  bus: string;
  driver: string;
  stops: number;
  students: number;
  status: RouteStatus;
}

interface TransportStudent {
  id: string;
  name: string;
  admissionNo: string;
  class: string;
  route: string;
  pickupPoint: string;
  feeStatus: FeeStatus;
}

const mockRoutes: TransportRoute[] = [
  {
    id: "r1",
    name: "Accra Central → School",
    bus: "GR-1234-22",
    driver: "Mr. Kwabena Ofori",
    stops: 7,
    students: 42,
    status: "active",
  },
  {
    id: "r2",
    name: "Tema → School",
    bus: "GR-5678-21",
    driver: "Mr. Samuel Agyei",
    stops: 5,
    students: 35,
    status: "active",
  },
  {
    id: "r3",
    name: "Adenta → School",
    bus: "GR-9012-20",
    driver: "Mr. Emmanuel Boateng",
    stops: 6,
    students: 29,
    status: "active",
  },
  {
    id: "r4",
    name: "Madina → School",
    bus: "GR-3456-23",
    driver: "Mr. Joseph Amankwah",
    stops: 4,
    students: 21,
    status: "active",
  },
  {
    id: "r5",
    name: "Spintex → School",
    bus: "GR-7890-19",
    driver: "Mr. Daniel Quartey",
    stops: 3,
    students: 18,
    status: "inactive",
  },
];

const mockStudents: TransportStudent[] = [
  {
    id: "s1",
    name: "Ama Owusu",
    admissionNo: "2024/001",
    class: "Form 1A",
    route: "Accra Central → School",
    pickupPoint: "Kwame Nkrumah Circle",
    feeStatus: "paid",
  },
  {
    id: "s2",
    name: "Kofi Asante",
    admissionNo: "2024/002",
    class: "Form 2B",
    route: "Tema → School",
    pickupPoint: "Tema Community 1",
    feeStatus: "paid",
  },
  {
    id: "s3",
    name: "Abena Mensah",
    admissionNo: "2024/003",
    class: "Form 3A",
    route: "Adenta → School",
    pickupPoint: "Adenta Market",
    feeStatus: "partial",
  },
  {
    id: "s4",
    name: "Kwesi Boateng",
    admissionNo: "2024/004",
    class: "Form 1C",
    route: "Madina → School",
    pickupPoint: "Madina Zongo Junction",
    feeStatus: "outstanding",
  },
  {
    id: "s5",
    name: "Efua Darko",
    admissionNo: "2024/005",
    class: "Form 2A",
    route: "Accra Central → School",
    pickupPoint: "Osu Oxford Street",
    feeStatus: "paid",
  },
  {
    id: "s6",
    name: "Yaw Acheampong",
    admissionNo: "2024/006",
    class: "Form 3B",
    route: "Tema → School",
    pickupPoint: "Tema Community 9",
    feeStatus: "paid",
  },
  {
    id: "s7",
    name: "Akua Frimpong",
    admissionNo: "2024/007",
    class: "Form 1B",
    route: "Adenta → School",
    pickupPoint: "Adenta Housing Down",
    feeStatus: "paid",
  },
  {
    id: "s8",
    name: "Nana Ama Adjei",
    admissionNo: "2024/008",
    class: "Form 2C",
    route: "Accra Central → School",
    pickupPoint: "Accra Mall Junction",
    feeStatus: "partial",
  },
  {
    id: "s9",
    name: "Kojo Twum",
    admissionNo: "2024/009",
    class: "Form 3C",
    route: "Madina → School",
    pickupPoint: "Madina Total Station",
    feeStatus: "paid",
  },
  {
    id: "s10",
    name: "Adwoa Appiah",
    admissionNo: "2024/010",
    class: "Form 1A",
    route: "Tema → School",
    pickupPoint: "Tema Community 5",
    feeStatus: "outstanding",
  },
];

const feeStatusConfig: Record<FeeStatus, { label: string; color: string }> = {
  paid: { label: "Paid", color: SUCCESS },
  partial: { label: "Partial", color: WARNING },
  outstanding: { label: "Outstanding", color: DANGER },
};

const routeStatusConfig: Record<RouteStatus, { label: string; color: string }> = {
  active: { label: "Active", color: SUCCESS },
  inactive: { label: "Inactive", color: MUTED },
};

export function TransportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [routes, setRoutes] = useState(mockRoutes);
  const [students] = useState(mockStudents);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", driver: "", driverPhone: "", vehicle: "", capacity: "", status: "active" as RouteStatus });

  const totalBuses = routes.length;
  const activeRoutes = routes.filter((r) => r.status === "active").length;
  const totalStudents = routes.reduce((sum, r) => sum + r.students, 0);
  const monthlyRevenue = 34500;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.route.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.pickupPoint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageTemplate
      title="Transport Management"
      description="Manage school bus routes, drivers and student transport"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Transport" },
      ]}
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white"
          style={{ background: PRIMARY }}
        >
          <Plus size={16} />
          Add Route
        </button>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Buses", value: totalBuses, icon: Bus, color: NAVY },
          { label: "Active Routes", value: activeRoutes, icon: Route, color: INFO },
          { label: "Students on Transport", value: totalStudents, icon: Users, color: SUCCESS },
          {
            label: "Monthly Revenue",
            value: `₵${(monthlyRevenue / 1000).toFixed(1)}K`,
            icon: Banknote,
            color: WARNING,
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-5 rounded-lg flex items-start gap-4"
            style={{ background: "white", border: `1px solid ${NAVY}20` }}
          >
            <div
              className="p-2.5 rounded-lg flex-shrink-0"
              style={{ background: `${color}15` }}
            >
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

      {/* Routes Table */}
      <div>
        <h3 className="font-semibold mb-3" style={{ color: NAVY }}>
          Routes
        </h3>
        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${NAVY}20` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `${NAVY}08`, borderBottom: `1px solid ${NAVY}20` }}>
                  {["Route", "Bus Plate", "Driver", "Stops", "Students", "Status"].map((h) => (
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
                {routes.map((route) => {
                  const { label, color } = routeStatusConfig[route.status];
                  return (
                    <tr
                      key={route.id}
                      className="hover:bg-gray-50 transition-colors"
                      style={{ borderBottom: `1px solid ${NAVY}10` }}
                    >
                      <td className="px-5 py-3.5">
                        <div style={{ color: NAVY, fontWeight: 600 }}>{route.name}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="font-mono text-xs px-2 py-0.5 rounded"
                          style={{ background: `${NAVY}08`, color: NAVY }}
                        >
                          {route.bus}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: MUTED }}>
                        {route.driver}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: MUTED }}>
                        {route.stops}
                      </td>
                      <td className="px-5 py-3.5">
                        <span style={{ color: INFO, fontWeight: 600 }}>{route.students}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: `${color}15`, color }}
                        >
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Students on Transport */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold" style={{ color: NAVY }}>
            Students on Transport
          </h3>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ background: "white", border: `1px solid ${NAVY}20` }}
          >
            <Search size={14} style={{ color: MUTED }} />
            <input
              type="text"
              placeholder="Search student or route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm outline-none w-48"
              style={{ color: NAVY }}
            />
          </div>
        </div>

        <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${NAVY}20` }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `${NAVY}08`, borderBottom: `1px solid ${NAVY}20` }}>
                  {["Student", "Class", "Route", "Pickup Point", "Fee Status"].map((h) => (
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
                      <td className="px-5 py-3.5" style={{ color: MUTED }}>
                        {student.class}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: MUTED }}>
                        {student.route}
                      </td>
                      <td className="px-5 py-3.5" style={{ color: MUTED }}>
                        {student.pickupPoint}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ background: `${color}15`, color }}
                        >
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredStudents.length === 0 && (
            <div className="py-10 text-center" style={{ color: MUTED }}>
              No students match your search.
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
          <strong>{students.length}</strong> transport students across{" "}
          <strong>{activeRoutes}</strong> active routes
        </p>
      </div>
      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold" style={{ color: NAVY }}>Add Bus Route</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={16} style={{ color: MUTED }} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Route Name *</label>
                <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="e.g. Tema Route" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Driver Name</label>
                <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="Full name" value={addForm.driver} onChange={e => setAddForm(f => ({ ...f, driver: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Vehicle / Bus Plate</label>
                <input className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} placeholder="e.g. GR-1234-20" value={addForm.vehicle} onChange={e => setAddForm(f => ({ ...f, vehicle: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: MUTED }}>Status</label>
                <select className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: `${NAVY}25`, color: NAVY }} value={addForm.status} onChange={e => setAddForm(f => ({ ...f, status: e.target.value as RouteStatus }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ color: MUTED, background: `${NAVY}08` }}>Cancel</button>
              <button
                disabled={!addForm.name}
                onClick={() => {
                  if (!addForm.name) return;
                  const newRoute: TransportRoute = { id: String(Date.now()), name: addForm.name, bus: addForm.vehicle || "—", driver: addForm.driver || "—", stops: 0, students: 0, status: addForm.status };
                  setRoutes(prev => [newRoute, ...prev]);
                  setAddForm({ name: "", driver: "", driverPhone: "", vehicle: "", capacity: "", status: "active" });
                  setShowAddModal(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: PRIMARY, opacity: !addForm.name ? 0.6 : 1 }}
              >
                Add Route
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTemplate>
  );
}
