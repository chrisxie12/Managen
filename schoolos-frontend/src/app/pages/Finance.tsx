import { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Download,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Users,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const monthlyRevenue = [
  { month: "Sep", collected: 42000, target: 52000 },
  { month: "Oct", collected: 58000, target: 52000 },
  { month: "Nov", collected: 49000, target: 52000 },
  { month: "Dec", collected: 63000, target: 65000 },
  { month: "Jan", collected: 71000, target: 70000 },
  { month: "Feb", collected: 86000, target: 80000 },
  { month: "Mar", collected: 94000, target: 88000 },
];

const feeRecords = [
  { id: "TXN-8821", student: "Ama Owusu", class: "JHS 3A", amount: 1800, paid: 1800, balance: 0, method: "Paystack", date: "Mar 28, 2026", status: "paid" },
  { id: "TXN-8820", student: "Kwesi Boateng", class: "JHS 2B", amount: 1650, paid: 825, balance: 825, method: "Cash", date: "Mar 25, 2026", status: "partial" },
  { id: "TXN-8819", student: "Efua Mensah", class: "JHS 3A", amount: 1800, paid: 1800, balance: 0, method: "Flutterwave", date: "Mar 22, 2026", status: "paid" },
  { id: "TXN-8818", student: "Yaw Darko", class: "JHS 1C", amount: 1500, paid: 0, balance: 1500, method: "—", date: "Feb 01, 2026", status: "overdue" },
  { id: "TXN-8817", student: "Kofi Adu", class: "JHS 3B", amount: 1800, paid: 1800, balance: 0, method: "Paystack", date: "Mar 20, 2026", status: "paid" },
  { id: "TXN-8816", student: "Abena Asante", class: "JHS 2A", amount: 1650, paid: 500, balance: 1150, method: "Cash", date: "Jan 15, 2026", status: "overdue" },
  { id: "TXN-8815", student: "Akosua Frimpong", class: "JHS 1A", amount: 1500, paid: 1500, balance: 0, method: "Flutterwave", date: "Mar 19, 2026", status: "paid" },
  { id: "TXN-8814", student: "Kwame Nkrumah Jr", class: "JHS 2C", amount: 1650, paid: 0, balance: 1650, method: "—", date: "Jan 10, 2026", status: "overdue" },
];

const payrollData = [
  { name: "Mrs. Akua Boateng", role: "Mathematics Teacher", salary: 4200, paid: true },
  { name: "Mr. Kofi Osei", role: "English Teacher", salary: 3800, paid: true },
  { name: "Mrs. Esi Appiah", role: "Science Teacher", salary: 4000, paid: false },
  { name: "Mr. Yaw Mensah", role: "ICT Teacher", salary: 3600, paid: true },
  { name: "Mrs. Abena Kumi", role: "Deputy Head", salary: 5500, paid: false },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    paid: { bg: "#D1FAE5", color: "#065F46", label: "Paid" },
    partial: { bg: "#FEF3C7", color: "#92400E", label: "Partial" },
    overdue: { bg: "#FEE2E2", color: "#991B1B", label: "Overdue" },
  };
  const s = map[status];
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

export function Finance() {
  const [activeTab, setActiveTab] = useState<"fees" | "payroll" | "analytics">("fees");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filtered = feeRecords.filter((r) => {
    const matchSearch =
      r.student.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All" || r.status === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const totalCollected = feeRecords.reduce((acc, r) => acc + r.paid, 0);
  const totalOwed = feeRecords.reduce((acc, r) => acc + r.balance, 0);
  const totalPayroll = payrollData.reduce((acc, p) => acc + p.salary, 0);
  const paidPayroll = payrollData.filter((p) => p.paid).reduce((acc, p) => acc + p.salary, 0);

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Collected",
            value: `GHS ${totalCollected.toLocaleString()}`,
            icon: ArrowUpRight,
            color: "#10B981",
            sub: "This term",
          },
          {
            label: "Total Owed",
            value: `GHS ${totalOwed.toLocaleString()}`,
            icon: ArrowDownLeft,
            color: "#EF4444",
            sub: `${feeRecords.filter((r) => r.status !== "paid").length} students`,
          },
          {
            label: "Payroll This Month",
            value: `GHS ${paidPayroll.toLocaleString()}`,
            icon: Users,
            color: "#6366F1",
            sub: `of GHS ${totalPayroll.toLocaleString()}`,
          },
          {
            label: "Collection Rate",
            value: `${((totalCollected / (totalCollected + totalOwed)) * 100).toFixed(1)}%`,
            icon: TrendingUp,
            color: "#F59E0B",
            sub: "+4.2% vs last term",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="p-5 rounded-[24px]"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.07)`,
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${card.color}15` }}
            >
              <card.icon size={16} color={card.color} />
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: PLUM,
                fontSize: "clamp(0.95rem, 2vw, 1.3rem)",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {card.value}
            </div>
            <div style={{ color: MUTED, fontSize: "0.72rem", marginTop: "0.2rem" }}>
              {card.label}
            </div>
            <div style={{ color: card.color, fontSize: "0.7rem", marginTop: "0.25rem" }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: `1px solid rgba(56,25,50,0.08)` }}
        >
          {(["fees", "payroll", "analytics"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-2.5 text-sm capitalize transition-colors"
              style={{
                background: activeTab === tab ? PLUM : "white",
                color: activeTab === tab ? MILK : MUTED,
                fontWeight: activeTab === tab ? 600 : 400,
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "fees" && (
          <>
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl flex-1 min-w-[160px]"
              style={{ background: "white", border: `1px solid rgba(56,25,50,0.08)` }}
            >
              <Search size={13} color={MUTED} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or ID..."
                className="bg-transparent outline-none text-sm flex-1"
                style={{ color: PLUM }}
              />
            </div>
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: `1px solid rgba(56,25,50,0.08)` }}
            >
              {["All", "Paid", "Partial", "Overdue"].map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className="px-3 py-2.5 text-sm transition-colors"
                  style={{
                    background: statusFilter === f ? PLUM : "white",
                    color: statusFilter === f ? MILK : MUTED,
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm ml-auto active:scale-95 transition-transform"
          style={{
            background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
            color: MILK,
            boxShadow: "0 4px 14px rgba(56,25,50,0.25)",
          }}
        >
          <Plus size={15} />
          {activeTab === "payroll" ? "Run Payroll" : "Record Payment"}
        </button>
      </div>

      {/* ── Fees Tab ── */}
      {activeTab === "fees" && (
        <div
          className="rounded-[24px] overflow-hidden"
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
                  {["Transaction", "Student", "Class", "Amount (GHS)", "Paid", "Balance", "Method", "Date", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left"
                      style={{ color: MUTED, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", whiteSpace: "nowrap" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: `1px solid rgba(56,25,50,0.04)` }}
                    className="hover:bg-[#FFF3E6]/50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: MUTED,
                          fontSize: "0.75rem",
                        }}
                      >
                        {r.id}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span style={{ color: PLUM, fontSize: "0.88rem", fontWeight: 500 }}>
                        {r.student}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: `rgba(56,25,50,0.07)`, color: PLUM_LIGHT }}
                      >
                        {r.class}
                      </span>
                    </td>
                    {[r.amount, r.paid, r.balance].map((v, i) => (
                      <td key={i} className="px-5 py-3.5">
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: i === 2 && v > 0 ? "#EF4444" : PLUM,
                            fontSize: "0.85rem",
                            fontWeight: i === 2 && v > 0 ? 700 : 500,
                          }}
                        >
                          {v.toLocaleString()}
                        </span>
                      </td>
                    ))}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={11} color={MUTED} />
                        <span style={{ color: MUTED, fontSize: "0.8rem" }}>{r.method}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span style={{ color: MUTED, fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                        {r.date}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={r.status} />
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
              Showing {filtered.length} transactions
            </p>
            <button
              className="flex items-center gap-1.5 text-sm hover:opacity-70"
              style={{ color: PLUM_LIGHT }}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      )}

      {/* ── Payroll Tab ── */}
      {activeTab === "payroll" && (
        <div
          className="rounded-[24px] overflow-hidden"
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
                  {["Staff Member", "Role", "Salary (GHS)", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left"
                      style={{ color: MUTED, fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payrollData.map((p) => (
                  <tr
                    key={p.name}
                    style={{ borderBottom: `1px solid rgba(56,25,50,0.04)` }}
                    className="hover:bg-[#FFF3E6]/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, ${PLUM}20, ${PLUM_LIGHT}30)`,
                            color: PLUM_LIGHT,
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ color: PLUM, fontSize: "0.9rem", fontWeight: 500 }}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ color: MUTED, fontSize: "0.85rem" }}>{p.role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          color: PLUM,
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        {p.salary.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={
                          p.paid
                            ? { background: "#D1FAE5", color: "#065F46" }
                            : { background: "#FEE2E2", color: "#991B1B" }
                        }
                      >
                        {p.paid ? "Disbursed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs active:scale-95 transition-transform"
                        style={{
                          background: p.paid ? `rgba(56,25,50,0.06)` : `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                          color: p.paid ? MUTED : MILK,
                          fontWeight: 600,
                        }}
                      >
                        {p.paid ? "View Slip" : "Pay Now"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{
              borderTop: `1px solid rgba(56,25,50,0.06)`,
              background: `rgba(56,25,50,0.02)`,
            }}
          >
            <span style={{ color: MUTED, fontSize: "0.85rem" }}>
              Total payroll budget:{" "}
              <strong style={{ color: PLUM }}>GHS {totalPayroll.toLocaleString()}</strong>
            </span>
            <span style={{ color: "#10B981", fontSize: "0.85rem" }}>
              Disbursed: GHS {paidPayroll.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === "analytics" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div
            className="p-6 rounded-[24px]"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.07)`,
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontWeight: 700,
                fontSize: "1rem",
                marginBottom: "0.3rem",
              }}
            >
              Revenue vs Target
            </h3>
            <p style={{ color: MUTED, fontSize: "0.78rem", marginBottom: "1.2rem" }}>
              Academic year 2025/2026
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: `1px solid rgba(56,25,50,0.1)`,
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(v: number) => [`GHS ${v.toLocaleString()}`]}
                />
                <Bar dataKey="target" fill="rgba(56,25,50,0.08)" radius={[4, 4, 0, 0]} barSize={18} name="Target" />
                <Bar dataKey="collected" fill={PLUM} radius={[4, 4, 0, 0]} barSize={18} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            className="p-6 rounded-[24px]"
            style={{
              background: "white",
              border: `1px solid rgba(56,25,50,0.07)`,
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                color: PLUM,
                fontWeight: 700,
                fontSize: "1rem",
                marginBottom: "0.3rem",
              }}
            >
              Collection Trend
            </h3>
            <p style={{ color: MUTED, fontSize: "0.78rem", marginBottom: "1.2rem" }}>
              Monthly GHS collected
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyRevenue}>
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PLUM} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={PLUM} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.05)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: MUTED }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: `1px solid rgba(56,25,50,0.1)`,
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  formatter={(v: number) => [`GHS ${v.toLocaleString()}`, "Collected"]}
                />
                <Line
                  type="monotone"
                  dataKey="collected"
                  stroke={PLUM}
                  strokeWidth={2.5}
                  dot={{ fill: PLUM, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Integration badges */}
          <div
            className="lg:col-span-2 p-6 rounded-[24px] flex flex-wrap gap-4 items-center"
            style={{
              background: `linear-gradient(135deg, ${PLUM} 0%, ${PLUM_LIGHT} 100%)`,
              boxShadow: "0 8px 28px rgba(56,25,50,0.2)",
            }}
          >
            <div className="flex-1">
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: MILK,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  marginBottom: "0.3rem",
                }}
              >
                Payment Integrations Active
              </h3>
              <p style={{ color: "rgba(255,243,230,0.65)", fontSize: "0.85rem" }}>
                Accept fees directly via Paystack or Flutterwave
              </p>
            </div>
            {["Paystack", "Flutterwave", "Mobile Money", "Bank Transfer"].map((p) => (
              <div
                key={p}
                className="px-4 py-2 rounded-full flex items-center gap-2"
                style={{
                  background: "rgba(255,243,230,0.12)",
                  border: "1px solid rgba(255,243,230,0.2)",
                }}
              >
                <CheckCircle2 size={13} color="#86efac" />
                <span style={{ color: MILK, fontSize: "0.85rem", fontWeight: 500 }}>
                  {p}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick payment modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div
            className="relative w-full max-w-md rounded-[24px] p-8"
            style={{
              background: "white",
              boxShadow: "0 24px 80px rgba(56,25,50,0.3)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: PLUM,
                  fontWeight: 700,
                  fontSize: "1.2rem",
                }}
              >
                Record Fee Payment
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X size={18} color={MUTED} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Student Name / ID", placeholder: "e.g. Ama Owusu or GH-2024-001" },
                { label: "Amount Received (GHS)", placeholder: "e.g. 1800" },
                { label: "Payment Reference", placeholder: "e.g. PAY-82192" },
              ].map((f) => (
                <div key={f.label}>
                  <label
                    style={{ color: PLUM_LIGHT, fontSize: "0.82rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}
                  >
                    {f.label}
                  </label>
                  <input
                    placeholder={f.placeholder}
                    className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                    style={{
                      background: "#FAFAFA",
                      border: `1.5px solid rgba(56,25,50,0.10)`,
                      color: PLUM,
                    }}
                  />
                </div>
              ))}
              <div>
                <label style={{ color: PLUM_LIGHT, fontSize: "0.82rem", fontWeight: 500, display: "block", marginBottom: "0.3rem" }}>
                  Payment Method
                </label>
                <select
                  className="w-full px-4 py-3 rounded-2xl outline-none text-sm"
                  style={{
                    background: "#FAFAFA",
                    border: `1.5px solid rgba(56,25,50,0.10)`,
                    color: PLUM,
                  }}
                >
                  {["Cash", "Paystack", "Flutterwave", "Mobile Money", "Bank Transfer"].map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3.5 rounded-full text-sm active:scale-95 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
                  color: MILK,
                  fontWeight: 600,
                  marginTop: "0.5rem",
                }}
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
