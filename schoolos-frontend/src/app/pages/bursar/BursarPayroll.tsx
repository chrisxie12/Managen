import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../services/api";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";

interface StaffPayroll {
  id: string; name: string; position: string; department: string;
  basic: number; allowances: number; ssnit: number; tax: number; net: number;
  status: "paid" | "pending";
}

const SSNIT_EMPLOYER = 0.135;

const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"]
  .map(m => `${m} ${new Date().getFullYear()}`);

const fmt = (n: number) => `GHS ${n.toLocaleString()}`;

export function BursarPayroll() {
  const [payroll, setPayroll] = useState<StaffPayroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(months[new Date().getMonth()]);
  const [processing, setProcessing] = useState(false);
  const [processDone, setProcessDone] = useState(false);

  useEffect(() => {
    setLoading(true);
    setProcessDone(false);
    api.get<any>(`/api/school/payroll?month=${encodeURIComponent(month)}`)
      .then((res) => {
        const raw = res.data?.payroll ?? res.data?.staff ?? res.data?.data ?? [];
        setPayroll(raw.map((p: any) => ({
          id: String(p.id ?? p.staff_id ?? Math.random()),
          name: p.name ?? p.staff_name ?? "",
          position: p.position ?? p.role ?? "",
          department: p.department ?? "",
          basic: Number(p.basic ?? p.basic_salary ?? 0),
          allowances: Number(p.allowances ?? 0),
          ssnit: Number(p.ssnit ?? p.ssnit_employee ?? 0),
          tax: Number(p.tax ?? p.income_tax ?? 0),
          net: Number(p.net ?? p.net_pay ?? 0),
          status: (p.status as StaffPayroll["status"]) ?? "pending",
        })));
      })
      .catch(() => setPayroll([]))
      .finally(() => setLoading(false));
  }, [month]);

  const gross = payroll.reduce((s, p) => s + p.basic + p.allowances, 0);
  const deductions = payroll.reduce((s, p) => s + p.ssnit + p.tax, 0);
  const netPayroll = payroll.reduce((s, p) => s + p.net, 0);
  const ssnitEmployer = payroll.reduce((s, p) => s + Math.round(p.basic * SSNIT_EMPLOYER), 0);

  const paid = payroll.filter(p => p.status === "paid").length;
  const total = payroll.length;

  const handleProcess = async () => {
    setProcessing(true);
    try {
      const res = await api.post<any>("/api/school/payroll/run", { month });
      const updated = res.data?.payroll ?? res.data?.staff ?? [];
      if (updated.length > 0) {
        setPayroll(updated.map((p: any) => ({
          id: String(p.id ?? p.staff_id ?? Math.random()),
          name: p.name ?? p.staff_name ?? "",
          position: p.position ?? p.role ?? "",
          department: p.department ?? "",
          basic: Number(p.basic ?? p.basic_salary ?? 0),
          allowances: Number(p.allowances ?? 0),
          ssnit: Number(p.ssnit ?? p.ssnit_employee ?? 0),
          tax: Number(p.tax ?? p.income_tax ?? 0),
          net: Number(p.net ?? p.net_pay ?? 0),
          status: (p.status as StaffPayroll["status"]) ?? "paid",
        })));
      } else {
        setPayroll(prev => prev.map(p => ({ ...p, status: "paid" as const })));
      }
      setProcessDone(true);
      toast.success(`Payroll processed for ${month}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to process payroll");
    } finally {
      setProcessing(false);
    }
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
          <button onClick={handleProcess} disabled={processing || processDone || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all active:scale-95"
            style={{ background: processDone ? SUCCESS : NAVY, opacity: (processing || processDone || loading) ? 0.8 : 1 }}>
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: MUTED }}>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Loading payroll…
                  </td>
                </tr>
              ) : payroll.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm" style={{ color: MUTED }}>
                    No payroll data available for {month}.
                  </td>
                </tr>
              ) : payroll.map(p => (
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
            {payroll.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/10">
                  <td colSpan={2} className="px-4 py-3 text-sm font-bold" style={{ color: NAVY }}>Total</td>
                  <td className="px-4 py-3 text-xs font-bold font-mono" style={{ color: NAVY }}>{fmt(payroll.reduce((s, p) => s + p.basic, 0))}</td>
                  <td className="px-4 py-3 text-xs font-bold font-mono" style={{ color: NAVY }}>{fmt(payroll.reduce((s, p) => s + p.allowances, 0))}</td>
                  <td className="px-4 py-3 text-xs font-bold font-mono" style={{ color: "#DC2626" }}>-{fmt(deductions)}</td>
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-xs font-bold font-mono" style={{ color: SUCCESS }}>{fmt(netPayroll)}</td>
                  <td className="px-4 py-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
