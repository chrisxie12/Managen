import { useState } from "react";
import { Users, Loader2 } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";

interface StaffPayroll {
  id: string; name: string; position: string; department: string;
  basic: number; allowances: number; ssnit: number; tax: number; net: number;
  status: "paid" | "pending";
}

const SSNIT_EMPLOYEE = 0.055;
const SSNIT_EMPLOYER = 0.135;

const mockPayroll: StaffPayroll[] = [
  { id: "1", name: "Mr. Kwame Asante", position: "Head Teacher", department: "Teaching", basic: 4200, allowances: 800, ssnit: Math.round(4200 * SSNIT_EMPLOYEE), tax: 420, net: 0, status: "paid" },
  { id: "2", name: "Mrs. Abena Boateng", position: "Class Teacher", department: "Teaching", basic: 3200, allowances: 400, ssnit: Math.round(3200 * SSNIT_EMPLOYEE), tax: 280, net: 0, status: "paid" },
  { id: "3", name: "Mr. Yaw Darko", position: "Class Teacher", department: "Teaching", basic: 2800, allowances: 300, ssnit: Math.round(2800 * SSNIT_EMPLOYEE), tax: 220, net: 0, status: "pending" },
  { id: "4", name: "Ms. Ama Mensah", position: "Secretary", department: "Admin", basic: 2200, allowances: 200, ssnit: Math.round(2200 * SSNIT_EMPLOYEE), tax: 160, net: 0, status: "paid" },
  { id: "5", name: "Mr. Kofi Frimpong", position: "Accountant", department: "Admin", basic: 2600, allowances: 250, ssnit: Math.round(2600 * SSNIT_EMPLOYEE), tax: 200, net: 0, status: "pending" },
  { id: "6", name: "Mr. Fiifi Quaye", position: "Security", department: "Support", basic: 900, allowances: 100, ssnit: Math.round(900 * SSNIT_EMPLOYEE), tax: 0, net: 0, status: "pending" },
  { id: "7", name: "Mrs. Efua Amponsah", position: "Cleaner", department: "Support", basic: 800, allowances: 0, ssnit: Math.round(800 * SSNIT_EMPLOYEE), tax: 0, net: 0, status: "pending" },
  { id: "8", name: "Mr. Nana Adjei", position: "Canteen Manager", department: "Support", basic: 1100, allowances: 150, ssnit: Math.round(1100 * SSNIT_EMPLOYEE), tax: 40, net: 0, status: "paid" },
].map(s => ({ ...s, net: s.basic + s.allowances - s.ssnit - s.tax }));

const months = ["January 2024", "February 2024", "March 2024", "April 2024", "May 2024", "June 2024"];

const fmt = (n: number) => `GHS ${n.toLocaleString()}`;

export function BursarPayroll() {
  const [month, setMonth] = useState("June 2024");
  const [processing, setProcessing] = useState(false);
  const [processDone, setProcessDone] = useState(false);

  const gross = mockPayroll.reduce((s, p) => s + p.basic + p.allowances, 0);
  const deductions = mockPayroll.reduce((s, p) => s + p.ssnit + p.tax, 0);
  const netPayroll = mockPayroll.reduce((s, p) => s + p.net, 0);
  const ssnitEmployer = mockPayroll.reduce((s, p) => s + Math.round(p.basic * SSNIT_EMPLOYER), 0);

  const paid = mockPayroll.filter(p => p.status === "paid").length;
  const total = mockPayroll.length;

  const handleProcess = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 1500));
    setProcessing(false);
    setProcessDone(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Payroll</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>Monthly staff salary processing</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(e.target.value)}
            className="h-9 px-3 rounded-xl text-sm border border-border bg-card appearance-none focus:outline-none">
            {months.map(m => <option key={m}>{m}</option>)}
          </select>
          <button onClick={handleProcess} disabled={processing || processDone}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: processDone ? SUCCESS : NAVY, opacity: (processing || processDone) ? 0.8 : 1 }}>
            {processing ? <Loader2 size={14} className="animate-spin" /> : null}
            {processDone ? "Payroll Processed ✓" : processing ? "Processing…" : "Run Payroll"}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: `${total}`, sub: `${paid} paid, ${total - paid} pending`, color: NAVY },
          { label: "Gross Payroll", value: fmt(gross), sub: "Before deductions", color: "#0080FF" },
          { label: "Net Payroll", value: fmt(netPayroll), sub: "After deductions", color: SUCCESS },
          { label: "SSNIT (Employer)", value: fmt(ssnitEmployer), sub: "13.5% contribution", color: "#8B5CF6" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: NAVY }}>{k.label}</p>
            <p className="text-xs" style={{ color: MUTED }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {["Staff", "Position", "Basic", "Allowances", "SSNIT (5.5%)", "Tax", "Net Pay", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold whitespace-nowrap" style={{ color: MUTED }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockPayroll.map(p => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium" style={{ color: NAVY }}>{p.name}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{p.department}</p>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{p.position}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: NAVY }}>{fmt(p.basic)}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: MUTED }}>{fmt(p.allowances)}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: "#DC2626" }}>-{fmt(p.ssnit)}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: "#DC2626" }}>-{fmt(p.tax)}</td>
                  <td className="px-4 py-3 text-xs font-bold font-mono" style={{ color: SUCCESS }}>{fmt(p.net)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: p.status === "paid" ? "#DCFCE7" : "#FEF3C7", color: p.status === "paid" ? SUCCESS : "#D97706" }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/10">
                <td colSpan={2} className="px-4 py-3 text-sm font-bold" style={{ color: NAVY }}>Total</td>
                <td className="px-4 py-3 text-xs font-bold font-mono" style={{ color: NAVY }}>{fmt(mockPayroll.reduce((s, p) => s + p.basic, 0))}</td>
                <td className="px-4 py-3 text-xs font-bold font-mono" style={{ color: NAVY }}>{fmt(mockPayroll.reduce((s, p) => s + p.allowances, 0))}</td>
                <td className="px-4 py-3 text-xs font-bold font-mono" style={{ color: "#DC2626" }}>-{fmt(deductions)}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-xs font-bold font-mono" style={{ color: SUCCESS }}>{fmt(netPayroll)}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
