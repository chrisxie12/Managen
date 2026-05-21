import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Filter, Download, DollarSign, AlertCircle } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";

const NAVY = "#0A2472";
const MUTED = "#6B7280";
const PRIMARY = "#0A2472";
const SUCCESS = "#10B981";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";

interface FeeRecord {
  id: string;
  studentName: string;
  admissionNo: string;
  class: string;
  totalBilled: number;
  amountPaid: number;
  balance: number;
  paymentMethod?: "Cash" | "MoMo" | "Bank Transfer";
  lastPaymentDate?: string;
  status: "paid" | "partial" | "outstanding";
}

const mockFees: FeeRecord[] = [
  {
    id: "1",
    studentName: "Ama Owusu",
    admissionNo: "2024/001",
    class: "Form 1A",
    totalBilled: 5000,
    amountPaid: 5000,
    balance: 0,
    paymentMethod: "MoMo",
    lastPaymentDate: "2024-05-15",
    status: "paid",
  },
  {
    id: "2",
    studentName: "Kwesi Mensah",
    admissionNo: "2024/002",
    class: "Form 1A",
    totalBilled: 5000,
    amountPaid: 2500,
    balance: 2500,
    paymentMethod: "MoMo",
    lastPaymentDate: "2024-05-10",
    status: "partial",
  },
  {
    id: "3",
    studentName: "Abena Boateng",
    admissionNo: "2024/003",
    class: "Form 2B",
    totalBilled: 6000,
    amountPaid: 0,
    balance: 6000,
    status: "outstanding",
  },
];

export function FeesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [fees] = useState(mockFees);
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "partial" | "outstanding">("all");

  const filteredFees = fees.filter(
    (fee) =>
      (fee.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fee.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (filterStatus === "all" || fee.status === filterStatus)
  );

  const stats = {
    totalBilled: fees.reduce((sum, f) => sum + f.totalBilled, 0),
    totalCollected: fees.reduce((sum, f) => sum + f.amountPaid, 0),
    outstanding: fees.reduce((sum, f) => sum + f.balance, 0),
  };

  const collectionRate = stats.totalBilled > 0
    ? Math.round((stats.totalCollected / stats.totalBilled) * 100)
    : 0;

  return (
    <PageTemplate
      title="Fees & Finance"
      description="Collect and manage student fees"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Fees & Finance" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/dashboard/fees/collect")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm text-white"
            style={{ background: PRIMARY }}
          >
            <Plus size={18} />
            Collect Payment
          </button>
        </div>
      }
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="p-6 rounded-lg"
          style={{
            background: "white",
            border: `1px solid ${NAVY}20`,
          }}
        >
          <div style={{ color: MUTED, fontSize: "0.875rem", fontWeight: 500 }}>
            Total Billed
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
            ₵{(stats.totalBilled / 1000).toFixed(1)}K
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
            Total Collected
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
            ₵{(stats.totalCollected / 1000).toFixed(1)}K
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
            Outstanding
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: DANGER,
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            ₵{(stats.outstanding / 1000).toFixed(1)}K
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
            Collection Rate
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: collectionRate >= 75 ? SUCCESS : WARNING,
              fontSize: "1.5rem",
              fontWeight: 700,
              marginTop: "0.5rem",
            }}
          >
            {collectionRate}%
          </div>
        </div>
      </div>

      {/* Outstanding Alert */}
      {stats.outstanding > 0 && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{
            background: `${DANGER}15`,
            border: `1px solid ${DANGER}30`,
          }}
        >
          <AlertCircle size={20} style={{ color: DANGER, flexShrink: 0 }} />
          <div>
            <div style={{ color: DANGER, fontWeight: 600, fontSize: "0.95rem" }}>
              Outstanding Fees: ₵{(stats.outstanding / 1000).toFixed(1)}K
            </div>
            <div style={{ color: MUTED, fontSize: "0.875rem", marginTop: "0.25rem" }}>
              {fees.filter((f) => f.status === "outstanding").length} students have not paid their fees
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div
        className="p-4 rounded-lg flex items-center gap-3"
        style={{ background: "white", border: `1px solid ${NAVY}20` }}
      >
        <Search size={18} style={{ color: MUTED }} />
        <input
          type="text"
          placeholder="Search by name or admission number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-sm outline-none"
          style={{ color: NAVY }}
        />
        <div className="flex items-center gap-2">
          {["all", "paid", "partial", "outstanding"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className="px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{
                background: filterStatus === status ? `${PRIMARY}20` : "transparent",
                color: filterStatus === status ? PRIMARY : MUTED,
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Download size={18} style={{ color: MUTED }} />
        </button>
      </div>

      {/* Fees Table */}
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
                  Student
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-semibold"
                  style={{ color: NAVY, textTransform: "uppercase" }}
                >
                  Class
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-semibold"
                  style={{ color: NAVY, textTransform: "uppercase" }}
                >
                  Billed
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-semibold"
                  style={{ color: NAVY, textTransform: "uppercase" }}
                >
                  Paid
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-semibold"
                  style={{ color: NAVY, textTransform: "uppercase" }}
                >
                  Balance
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
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map((fee) => (
                <tr
                  key={fee.id}
                  style={{ borderBottom: `1px solid ${NAVY}15` }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm" style={{ color: NAVY, fontWeight: 500 }}>
                    {fee.studentName}
                    <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>
                      {fee.admissionNo}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: MUTED }}>
                    {fee.class}
                  </td>
                  <td className="px-6 py-4 text-sm text-right" style={{ color: MUTED }}>
                    ₵{fee.totalBilled}
                  </td>
                  <td className="px-6 py-4 text-sm text-right" style={{ color: SUCCESS, fontWeight: 600 }}>
                    ₵{fee.amountPaid}
                  </td>
                  <td
                    className="px-6 py-4 text-sm text-right"
                    style={{
                      color: fee.balance > 0 ? DANGER : SUCCESS,
                      fontWeight: 600,
                    }}
                  >
                    ₵{fee.balance}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background:
                          fee.status === "paid"
                            ? `${SUCCESS}20`
                            : fee.status === "partial"
                            ? `${WARNING}20`
                            : `${DANGER}20`,
                        color:
                          fee.status === "paid"
                            ? SUCCESS
                            : fee.status === "partial"
                            ? WARNING
                            : DANGER,
                      }}
                    >
                      {fee.status.charAt(0).toUpperCase() +
                        fee.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() =>
                        navigate(`/dashboard/fees/collect/${fee.id}`)
                      }
                      className="text-xs font-medium px-3 py-1 rounded transition-colors"
                      style={{
                        color: PRIMARY,
                        background: `${PRIMARY}15`,
                      }}
                    >
                      Pay
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Footer */}
      <div
        className="p-4 rounded-lg"
        style={{
          background: `${NAVY}08`,
          border: `1px solid ${NAVY}20`,
        }}
      >
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>
          Showing <strong>{filteredFees.length}</strong> of <strong>{fees.length}</strong> fee records
        </p>
      </div>
    </PageTemplate>
  );
}
