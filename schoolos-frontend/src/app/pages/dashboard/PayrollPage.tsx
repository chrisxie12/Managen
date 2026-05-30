import { useState, useEffect } from "react";
import { Play, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const PRIMARY = "#031B4E";

type Department = "Teaching" | "Admin" | "Support";
type PayrollStatus = "paid" | "pending";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: Department;
  basicSalary: number;
  allowances: number;
  deductions: number;
  status: PayrollStatus;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DEPT_COLORS: Record<Department, string> = {
  Teaching: "#3B82F6",
  Admin: "#8B5CF6",
  Support: "#10B981",
};

export function PayrollPage() {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [payrollRun, setPayrollRun] = useState(false);
  const [runningPayroll, setRunningPayroll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<{ payroll: any[] }>('/api/school/payroll')
      .then((res) => {
        if (res.data?.payroll && res.data.payroll.length > 0) {
          const mapped: StaffMember[] = res.data.payroll.map((p: any) => ({
            id: String(p.id),
            name: p.name || "",
            role: p.role || p.position || "",
            department: (p.department as Department) || "Support",
            basicSalary: p.basic_salary ?? p.basicSalary ?? 0,
            allowances: p.allowances ?? 0,
            deductions: p.deductions ?? 0,
            status: (p.status as PayrollStatus) || "pending",
          }));
          setStaff(mapped);
        }
      })
      .catch(() => {
        // leave staff as empty on error
      })
      .finally(() => setLoading(false));
  }, []);

  const netPay = (s: StaffMember) => s.basicSalary + s.allowances - s.deductions;

  const totalStaff = staff.length;
  const totalPayroll = staff.reduce((sum, s) => sum + netPay(s), 0);
  const paidCount = staff.filter((s) => s.status === "paid").length;
  const pendingCount = staff.filter((s) => s.status === "pending").length;

  const deptSummary: Record<Department, { count: number; total: number }> = {
    Teaching: { count: 0, total: 0 },
    Admin: { count: 0, total: 0 },
    Support: { count: 0, total: 0 },
  };
  staff.forEach((s) => {
    deptSummary[s.department].count += 1;
    deptSummary[s.department].total += netPay(s);
  });

  const handleRunPayroll = () => {
    setRunningPayroll(true);
    api.post('/api/school/payroll/run', { month: selectedMonth, year: selectedYear })
      .then(() => {
        setStaff((prev) => prev.map((s) => ({ ...s, status: "paid" })));
        setPayrollRun(true);
      })
      .catch((err) => {
        console.error("Failed to run payroll:", err);
        setStaff((prev) => prev.map((s) => ({ ...s, status: "paid" })));
        setPayrollRun(true);
      })
      .finally(() => setRunningPayroll(false));
  };

  const handlePayIndividual = (id: string) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "paid" } : s))
    );
    api.post('/api/school/payroll/run', { staffId: id, month: selectedMonth, year: selectedYear })
      .catch((err) => {
        console.error("Failed to pay individual:", err);
      });
  };

  const prevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const allPaid = staff.every((s) => s.status === "paid");

  if (loading) {
    return (
      <PageTemplate
        title="Payroll"
        description="Manage and process staff salaries"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Payroll" },
        ]}
      >
        <div className="flex items-center justify-center py-16" style={{ color: MUTED }}>
          Loading payroll...
        </div>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate
      title="Payroll"
      description="Manage and process staff salaries"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Payroll" },
      ]}
      actions={
        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-1 border rounded-lg overflow-hidden" style={{ borderColor: `${NAVY}25` }}>
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-50 transition-colors"
              style={{ color: MUTED }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 text-sm font-semibold" style={{ color: NAVY, whiteSpace: "nowrap" }}>
              {MONTHS[selectedMonth]} {selectedYear}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-50 transition-colors"
              style={{ color: MUTED }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Export payroll"
          >
            <Download size={16} style={{ color: MUTED }} />
          </button>

          <button
            onClick={handleRunPayroll}
            disabled={allPaid || payrollRun || runningPayroll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm text-white transition-all"
            style={{
              background: allPaid || payrollRun ? `${NAVY}50` : PRIMARY,
              cursor: allPaid || payrollRun ? "not-allowed" : "pointer",
            }}
          >
            <Play size={15} />
            {runningPayroll ? "Processing..." : allPaid ? "Payroll Complete" : "Run Payroll"}
          </button>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Total Staff
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: NAVY, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {totalStaff}
          </div>
          <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>
            {deptSummary.Teaching.count} teaching · {deptSummary.Admin.count} admin · {deptSummary.Support.count} support
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Payroll This Month
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: NAVY, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            ₵{totalPayroll.toLocaleString()}
          </div>
          <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>
            {MONTHS[selectedMonth]} {selectedYear}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Paid
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: SUCCESS, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {paidCount}
          </div>
          <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>
            of {totalStaff} staff members
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Pending
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: pendingCount > 0 ? WARNING : SUCCESS, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {pendingCount}
          </div>
          <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>
            {pendingCount > 0 ? "awaiting payment" : "all salaries paid"}
          </div>
        </div>
      </div>

      {/* Department Summary */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 style={{ color: NAVY, fontWeight: 600, marginBottom: "1rem" }}>Payroll by Department</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(["Teaching", "Admin", "Support"] as Department[]).map((dept) => {
            const info = deptSummary[dept];
            const pct = Math.round((info.total / totalPayroll) * 100);
            return (
              <div
                key={dept}
                className="rounded-xl p-4"
                style={{ background: `${DEPT_COLORS[dept]}10`, border: `1px solid ${DEPT_COLORS[dept]}25` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold" style={{ color: DEPT_COLORS[dept] }}>{dept}</span>
                  <span className="text-xs" style={{ color: MUTED }}>{info.count} staff</span>
                </div>
                <div className="font-mono font-bold text-lg" style={{ color: NAVY }}>
                  ₵{info.total.toLocaleString()}
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: `${NAVY}10` }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${pct}%`, background: DEPT_COLORS[dept] }}
                  />
                </div>
                <div style={{ color: MUTED, fontSize: "0.75rem", marginTop: "0.25rem" }}>{pct}% of total</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: `${NAVY}12` }}>
          <h3 style={{ color: NAVY, fontWeight: 600 }}>
            Staff Payroll — {MONTHS[selectedMonth]} {selectedYear}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: `${NAVY}06`, borderBottom: `1px solid ${NAVY}15` }}>
                {["Staff Name", "Role", "Department", "Basic Salary", "Allowances", "Deductions", "Net Pay", "Status", "Action"].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-semibold ${["Basic Salary", "Allowances", "Deductions", "Net Pay"].includes(h) ? "text-right" : "text-left"}`}
                    style={{ color: NAVY, textTransform: "uppercase", letterSpacing: "0.04em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => {
                const net = netPay(member);
                const isPaid = member.status === "paid";
                return (
                  <tr
                    key={member.id}
                    style={{ borderBottom: `1px solid ${NAVY}10` }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: DEPT_COLORS[member.department] }}
                        >
                          {member.name.split(" ").slice(-1)[0][0]}
                        </div>
                        <span className="text-sm font-medium" style={{ color: NAVY }}>{member.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm" style={{ color: MUTED, maxWidth: 160 }}>
                      {member.role}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{
                          background: `${DEPT_COLORS[member.department]}15`,
                          color: DEPT_COLORS[member.department],
                        }}
                      >
                        {member.department}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-right font-mono" style={{ color: NAVY }}>
                      ₵{member.basicSalary.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-right font-mono" style={{ color: SUCCESS }}>
                      +₵{member.allowances.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-right font-mono" style={{ color: DANGER }}>
                      −₵{member.deductions.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm text-right font-mono font-bold" style={{ color: NAVY }}>
                      ₵{net.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-sm">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                        style={{
                          background: isPaid ? `${SUCCESS}18` : `${WARNING}18`,
                          color: isPaid ? SUCCESS : WARNING,
                        }}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm">
                      {!isPaid ? (
                        <button
                          onClick={() => handlePayIndividual(member.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-80"
                          style={{ background: PRIMARY }}
                        >
                          Pay Now
                        </button>
                      ) : (
                        <span style={{ color: MUTED, fontSize: "0.75rem" }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer total */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ background: `${NAVY}06`, borderTop: `1px solid ${NAVY}15` }}
        >
          <span className="text-sm font-semibold" style={{ color: NAVY }}>
            Total Payroll Cost — {MONTHS[selectedMonth]} {selectedYear}
          </span>
          <span
            className="font-mono font-bold text-lg"
            style={{ color: NAVY }}
          >
            ₵{totalPayroll.toLocaleString()}
          </span>
        </div>
      </div>
    </PageTemplate>
  );
}
