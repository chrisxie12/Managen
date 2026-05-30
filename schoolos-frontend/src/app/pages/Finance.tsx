import { useState, useEffect, useCallback } from "react";
import {
  Loader2, X, AlertCircle, Check, Plus, Wallet, TrendingUp,
  DollarSign, Receipt, CreditCard, FileText, Percent, Gift,
  Download, Calendar, Users, XCircle, AlertTriangle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { api } from "../services/api";
import { Button } from "../components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const CREAM = "#F8F9FA";

const COLORS = ["#6366F1", "#16A34A", "#F59E0B", "#EF4444", "#EC4899", "#8B5CF6", "#14B8A6", "#F97316"];

// ─── Types ──────────────────────────────────────────────────────
type FeeStructure = { id: string; name: string; category: string; amount: number; class_id: string | null; term_id: string | null; is_optional: boolean; description: string | null; is_active: boolean; class?: { name: string } | null; term?: { name: string } | null };
type Invoice = { id: string; invoice_number: string; student_id: string; class_id: string; term_id: string; session_id: string | null; issue_date: string; due_date: string; status: string; total_amount: number; paid_amount: number; notes: string | null; student?: { name: string; admission_no: string; class_name: string } | null; class?: { name: string } | null; term?: { name: string } | null };
type Payment = { id: string; invoice_id: string; student_id: string; amount: number; payment_method: string; reference: string | null; transaction_id: string | null; payment_date: string; status: string; notes: string | null; student?: { name: string; admission_no: string } | null; invoice?: { invoice_number: string } | null; receiver?: { name: string } | null };
type Waiver = { id: string; student_id: string; fee_structure_id: string | null; invoice_id: string | null; reason: string; amount: number; status: string; student?: { name: string; admission_no: string; class_name: string } | null; fee_structure?: { name: string } | null; invoice?: { invoice_number: string } | null; approver?: { name: string } | null };
type Discount = { id: string; name: string; type: string; value: number; applicable_to: string; applicable_id: string | null; is_active: boolean };
type Student = { id: string; name: string; admission_no: string; class_name: string };
type ClassOption = { id: string; name: string };
type TermOption = { id: string; name: string; is_current?: boolean };
type FinanceSummary = { totalBilled: number; totalPaid: number; totalOutstanding: number; overdueAmount: number; totalCollected: number; invoiceCount: number; overdueCount: number; paymentCount: number };

type MonthlyRevenue = { month: string; label: string; amount: number; count: number };
type PaymentBreakdown = { status: string; amount: number; count: number };
type FailedPayment = Payment & { student?: { name: string; admission_no: string; class_name: string } | null; invoice?: { invoice_number: string; total_amount: number } | null };
type Defaulter = {
  student: { name: string; admission_no: string; class_name: string; parent_name?: string; parent_phone?: string } | null;
  class: { name: string } | null;
  totalBalance: number;
  invoiceCount: number;
  daysSinceFirstDue: number;
  invoices: { id: string; invoice_number: string; due_date: string; balance: number; term?: string }[];
};

// ─── Helpers ────────────────────────────────────────────────────
const formatCedi = (amount: number) =>
  `GHS ${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  issued: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
  refunded: "bg-purple-100 text-purple-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const StatusBadge = ({ status }: { status: string }) => (
  <Badge className={statusStyles[status] || "bg-gray-100 text-gray-600"} variant="outline">
    {status.replace("_", " ")}
  </Badge>
);

const AlertBanner = ({ type, message, onClose }: { type: "error" | "success"; message: string; onClose: () => void }) => {
  const bg = type === "error" ? "#FEF2F2" : "#D1FAE5";
  const color = type === "error" ? "#EF4444" : "#065F46";
  return (
    <div className="mb-4 p-3 rounded-xl flex items-center gap-2" style={{ background: bg, color, border: `1px solid ${type === "error" ? "#FECACA" : "#A7F3D0"}`, fontSize: "0.9rem" }}>
      {type === "error" ? <AlertCircle size={14} /> : <Check size={14} />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-auto"><X size={14} /></button>
    </div>
  );
};

const LoadingSpinner = ({ height = 48 }: { height?: number }) => (
  <div className="flex items-center justify-center" style={{ height }}><Loader2 className="animate-spin" size={24} color={NAVY} /></div>
);

const EmptyState = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="text-center py-10 rounded-2xl" style={{ background: "rgba(10,36,114,0.03)", border: "1px dashed rgba(10,36,114,0.1)" }}>
    <Icon size={36} color={MUTED} className="mx-auto mb-2" />
    <p className="font-semibold text-sm" style={{ color: NAVY }}>{title}</p>
    <p className="text-xs mt-1" style={{ color: MUTED }}>{desc}</p>
  </div>
);

const MetricCard = ({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color?: string;
}) => (
  <div className="p-5 rounded-2xl relative overflow-hidden" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
    <div className="absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full opacity-10" style={{ background: color || NAVY }} />
    <div className="flex items-center gap-3 mb-2">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color || NAVY}15` }}>
        <Icon size={18} color={color || NAVY} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider" style={{ color: MUTED }}>{label}</p>
        <p className="text-2xl font-bold" style={{ color: NAVY }}>{value}</p>
      </div>
    </div>
    {sub && <p className="text-xs" style={{ color: MUTED }}>{sub}</p>}
  </div>
);

const ChartCard = ({ title, subtitle, children, action }: {
  title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode;
}) => (
  <div className="p-5 rounded-2xl" style={{ background: "white", border: "1px solid rgba(10,36,114,0.07)" }}>
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-semibold text-sm" style={{ color: NAVY }}>{title}</h3>
        {subtitle && <p className="text-xs" style={{ color: MUTED }}>{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ─── Overview Tab (Enterprise Dashboard) ────────────────────────
function OverviewTab() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([]);
  const [failedP, setFailedP] = useState<FailedPayment[]>([]);
  const [defaulters, setDefaulters] = useState<Defaulter[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthsFilter, setMonthsFilter] = useState(12);
  const [defThreshold, setDefThreshold] = useState(30);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, monthlyRes, failedRes, defRes, breakdownRes] = await Promise.all([
        api.get<FinanceSummary>("/api/school/finance/summary"),
        api.get<{ monthly: MonthlyRevenue[] }>(`/api/school/finance/monthly?months=${monthsFilter}`),
        api.get<{ payments: FailedPayment[]; total: number }>("/api/school/finance/failed-payments?limit=50"),
        api.get<{ defaulters: Defaulter[] }>(`/api/school/finance/defaulters?threshold=${defThreshold}&min_balance=0`),
        api.get<{ breakdown: PaymentBreakdown[] }>("/api/school/finance/payment-status-breakdown"),
      ]);
      setSummary(sumRes.data!);
      setMonthly(monthlyRes.data?.monthly || []);
      setFailedP(failedRes.data?.payments || []);
      setDefaulters(defRes.data?.defaulters || []);
      setPaymentBreakdown(breakdownRes.data?.breakdown || []);
    } catch {
      setError("Failed to load finance overview");
    } finally {
      setLoading(false);
    }
  }, [monthsFilter, defThreshold]);

  useEffect(() => { load(); }, [load]);

  const currentMonthMRR = monthly.length > 0
    ? monthly[monthly.length - 1].amount
    : 0;
  const prevMonthMRR = monthly.length > 1
    ? monthly[monthly.length - 2].amount
    : 0;
  const mrrTrend = prevMonthMRR > 0
    ? ((currentMonthMRR - prevMonthMRR) / prevMonthMRR * 100).toFixed(1)
    : null;

  const failedCount = failedP.length;
  const defaulterCount = defaulters.length;

  const handleExport = async (type: "invoices" | "payments") => {
    try {
      const token = document.cookie
        .split("; ")
        .find(r => r.startsWith("schoolos_token="))
        ?.split("=")[1];
      const base = import.meta.env.VITE_API_BASE_URL;
      const url = `${base}/api/school/finance/export?type=${type}&token=${encodeURIComponent(token || "")}`;
      window.open(url, "_blank");
    } catch {
      setError("Export failed");
    }
  };

  if (loading) return <LoadingSpinner height={400} />;
  if (!summary) return <EmptyState icon={Wallet} title="No financial data" desc="Start by setting up fee structures" />;

  return (
    <div className="space-y-6">
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      {/* ── Filter & Export Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2" style={{ color: MUTED }}>
            <Calendar size={14} />
            <Select value={String(monthsFilter)} onValueChange={v => setMonthsFilter(Number(v))}>
              <SelectTrigger className="w-[120px] h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
                <SelectItem value="24">24 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2" style={{ color: MUTED }}>
            <AlertTriangle size={14} />
            <Select value={String(defThreshold)} onValueChange={v => setDefThreshold(Number(v))}>
              <SelectTrigger className="w-[140px] h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">Default &gt;15d</SelectItem>
                <SelectItem value="30">Default &gt;30d</SelectItem>
                <SelectItem value="60">Default &gt;60d</SelectItem>
                <SelectItem value="90">Default &gt;90d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport("invoices")}
            className="rounded-full text-xs h-9" style={{ borderColor: "rgba(10,36,114,0.15)", color: NAVY }}>
            <Download size={13} className="mr-1" /> Invoices CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport("payments")}
            className="rounded-full text-xs h-9" style={{ borderColor: "rgba(10,36,114,0.15)", color: NAVY }}>
            <Download size={13} className="mr-1" /> Payments CSV
          </Button>
        </div>
      </div>

      {/* ── Metric Cards (6) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard icon={TrendingUp} label="Monthly Collection"
          value={formatCedi(currentMonthMRR)}
          sub={mrrTrend ? `${mrrTrend}% vs prev month` : "Current month"}
          color="#6366F1" />
        <MetricCard icon={DollarSign} label="Total Collected"
          value={formatCedi(summary.totalCollected)}
          sub={`${summary.paymentCount} payment(s)`}
          color="#16A34A" />
        <MetricCard icon={Receipt} label="Total Billed"
          value={formatCedi(summary.totalBilled)}
          sub={`${summary.invoiceCount} invoice(s)`}
          color="#3B82F6" />
        <MetricCard icon={AlertCircle} label="Outstanding Balance"
          value={formatCedi(summary.totalOutstanding)}
          sub={summary.overdueCount > 0 ? `${summary.overdueCount} overdue` : "All paid"}
          color={summary.overdueCount > 0 ? "#F59E0B" : "#16A34A"} />
        <MetricCard icon={XCircle} label="Failed Payments"
          value={failedCount}
          sub={failedCount === 0 ? "No failures" : "Requires attention"}
          color={failedCount > 0 ? "#EF4444" : "#16A34A"} />
        <MetricCard icon={Users} label="Fee Defaulters"
          value={defaulterCount}
          sub={defaulterCount === 0 ? "All current" : `${defThreshold}d+ overdue`}
          color={defaulterCount > 0 ? "#EF4444" : "#16A34A"} />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Collection Trend */}
        <ChartCard title="Collection Trend" subtitle={monthly.length > 0 ? `${monthsFilter}-month view` : "No data"}>
          {monthly.length === 0 ? (
            <EmptyState icon={TrendingUp} title="No monthly data" desc="Record payments to see trends" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(10,36,114,0.06)" />
                <XAxis dataKey="label" tick={{ fontSize: 9, fill: MUTED }} interval={Math.max(1, Math.floor(monthly.length / 6))} />
                <YAxis tick={{ fontSize: 10, fill: MUTED }} tickFormatter={(v) => `GHS ${(v / 100).toFixed(0)}`} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(10,36,114,0.15)" }}
                  formatter={(value: number) => [formatCedi(value), "Collected"]}
                  labelFormatter={(l) => `Month: ${l}`} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {monthly.map((_, i) => (
                    <Cell key={i} fill={i === monthly.length - 1 ? "#6366F1" : COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Payment Status Breakdown */}
        <ChartCard title="Payment Status Breakdown" subtitle={paymentBreakdown.length > 0 ? `${paymentBreakdown.length} status(es)` : "No data"}>
          {paymentBreakdown.length === 0 ? (
            <EmptyState icon={CreditCard} title="No payment data" desc="Record payments to see breakdown" />
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={paymentBreakdown} dataKey="amount" nameKey="status" cx="50%" cy="50%" outerRadius={70}
                    label={({ status, percent }) => `${status} (${(percent * 100).toFixed(0)}%)`}>
                    {paymentBreakdown.map((item, i) => {
                      const colorMap: Record<string, string> = {
                        completed: "#16A34A",
                        failed: "#EF4444",
                        pending: "#F59E0B",
                        refunded: "#8B5CF6",
                      };
                      return <Cell key={i} fill={colorMap[item.status] || COLORS[i % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(value: number, name: string) => [formatCedi(value), name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {paymentBreakdown.map(item => (
                  <div key={item.status} className="flex items-center justify-between p-2 rounded-lg"
                    style={{ background: "rgba(10,36,114,0.03)" }}>
                    <span style={{ color: MUTED }}>{item.status}</span>
                    <span className="font-medium" style={{ color: NAVY }}>{formatCedi(item.amount)} ({item.count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {/* ── Failed Payments Table ── */}
      <ChartCard title="Failed Payments" subtitle={failedCount > 0 ? `${failedCount} failed transaction(s)` : "No failures"}
        action={failedCount > 0 ? <StatusBadge status="failed" /> : <StatusBadge status="completed" />}>
        {failedCount === 0 ? (
          <EmptyState icon={Check} title="All payments successful" desc="No failed payment transactions" />
        ) : (
          <div className="max-h-64 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedP.map(p => (
                  <TableRow key={p.id}>
                    <TableCell style={{ color: MUTED, fontSize: 12 }}>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell style={{ color: NAVY, fontSize: 13 }}>{p.student?.name || "—"}</TableCell>
                    <TableCell style={{ color: MUTED, fontSize: 12 }}>{p.invoice?.invoice_number || "—"}</TableCell>
                    <TableCell style={{ fontSize: 13 }}>{formatCedi(p.amount)}</TableCell>
                    <TableCell><Badge variant="outline" className="bg-red-50 text-red-700 text-xs">{p.payment_method}</Badge></TableCell>
                    <TableCell style={{ color: MUTED, fontSize: 11 }}>{p.reference || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ChartCard>

      {/* ── Fee Defaulters Table ── */}
      <ChartCard title="Fee Defaulters" subtitle={defaulterCount > 0 ? `${defaulterCount} student(s) overdue by ${defThreshold}+ days` : "All students current"}
        action={defaulterCount > 0 ? <StatusBadge status="overdue" /> : <StatusBadge status="paid" />}>
        {defaulterCount === 0 ? (
          <EmptyState icon={Users} title="No defaulters" desc={`No students overdue by ${defThreshold}+ days`} />
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Total Balance</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Oldest Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {defaulters.slice(0, 25).map(d => (
                  <TableRow key={d.student?.admission_no || Math.random()}>
                    <TableCell style={{ color: NAVY, fontSize: 13 }}>{d.student?.name || "Unknown"}</TableCell>
                    <TableCell style={{ color: MUTED, fontSize: 12 }}>{d.class?.name || "—"}</TableCell>
                    <TableCell className="font-medium" style={{ color: "#EF4444" }}>{formatCedi(d.totalBalance)}</TableCell>
                    <TableCell style={{ color: MUTED, fontSize: 12 }}>{d.invoiceCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={d.daysSinceFirstDue > 60 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}>
                        {d.daysSinceFirstDue}d
                      </Badge>
                    </TableCell>
                    <TableCell style={{ color: MUTED, fontSize: 12 }}>
                      {new Date(d.invoices[0]?.due_date || "").toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

// ─── Fee Structures Tab ─────────────────────────────────────────
function FeeStructuresTab() {
  const [fees, setFees] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<FeeStructure | null>(null);
  const [form, setForm] = useState({ name: "", category: "tuition", amount: "", class_id: "", term_id: "", is_optional: false, description: "" });

  const load = useCallback(async () => {
    try {
      const [feeRes, clsRes, termRes] = await Promise.all([
        api.get<{ feeStructures: FeeStructure[] }>("/api/school/fee-structures"),
        api.get<{ classes: ClassOption[] }>("/api/school/classes"),
        api.get<{ terms: TermOption[] }>("/api/school/terms"),
      ]);
      setFees(feeRes.data?.feeStructures || []);
      setClasses(clsRes.data?.classes || []);
      setTerms(termRes.data?.terms || []);
    } catch {
      setError("Failed to load fee structures");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => setForm({ name: "", category: "tuition", amount: "", class_id: "", term_id: "", is_optional: false, description: "" });

  const openCreate = () => { setEditItem(null); resetForm(); setDialogOpen(true); };
  const openEdit = (item: FeeStructure) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, amount: String(item.amount), class_id: item.class_id || "", term_id: item.term_id || "", is_optional: item.is_optional, description: item.description || "" });
    setDialogOpen(true);
  };

  const save = async () => {
    const payload = { name: form.name, category: form.category, amount: Number(form.amount) * 100, class_id: form.class_id || null, term_id: form.term_id || null, is_optional: form.is_optional, description: form.description || null };
    try {
      if (editItem) {
        await api.put(`/api/school/fee-structures/${editItem.id}`, payload);
      } else {
        await api.post("/api/school/fee-structures", payload);
      }
      setDialogOpen(false);
      load();
    } catch {
      setError("Failed to save fee structure");
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/api/school/fee-structures/${id}`);
      load();
    } catch {
      setError("Failed to delete fee structure");
    }
  };

  if (loading) return <LoadingSpinner height={400} />;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <div className="flex justify-end mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} style={{ background: NAVY, color: CREAM }} className="rounded-full">
              <Plus size={15} className="mr-1" /> Add Fee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" style={{ borderRadius: 20 }}>
            <DialogHeader>
              <DialogTitle style={{ color: NAVY }}>{editItem ? "Edit Fee Structure" : "New Fee Structure"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Fee name (e.g. Tuition)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    {["tuition", "boarding", "transport", "books", "uniform", "exam", "other"].map(c => (
                      <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Amount (GHS)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.class_id} onValueChange={v => setForm({ ...form, class_id: v })}>
                  <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All classes</SelectItem>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={form.term_id} onValueChange={v => setForm({ ...form, term_id: v })}>
                  <SelectTrigger><SelectValue placeholder="All terms" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All terms</SelectItem>
                    {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Description (optional)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <label className="flex items-center gap-2 text-sm" style={{ color: NAVY }}>
                <input type="checkbox" checked={form.is_optional} onChange={e => setForm({ ...form, is_optional: e.target.checked })} />
                Optional fee
              </label>
              <Button onClick={save} className="w-full rounded-full" style={{ background: NAVY, color: CREAM }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {fees.length === 0 ? (
        <EmptyState icon={FileText} title="No fee structures" desc="Add fee items like tuition, boarding, and transport" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.map(f => (
              <TableRow key={f.id}>
                <TableCell className="font-medium" style={{ color: NAVY }}>{f.name}</TableCell>
                <TableCell style={{ color: MUTED }}>{f.category}</TableCell>
                <TableCell>{formatCedi(f.amount)}</TableCell>
                <TableCell style={{ color: MUTED }}>{f.class?.name || "All"}</TableCell>
                <TableCell style={{ color: MUTED }}>{f.term?.name || "All"}</TableCell>
                <TableCell><StatusBadge status={f.is_active ? "active" : "inactive"} /></TableCell>
                <TableCell className="text-right">
                  <button onClick={() => openEdit(f)} className="text-xs mr-2" style={{ color: NAVY }}>Edit</button>
                  <button onClick={() => remove(f.id)} className="text-xs" style={{ color: "#EF4444" }}>Delete</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ─── Invoices Tab ───────────────────────────────────────────────
function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [genForm, setGenForm] = useState({ student_id: "", class_id: "", term_id: "", session_id: "", due_date: "" });

  const limit = 20;

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter) params.set("status", statusFilter);
      const [invRes, stuRes, clsRes, termRes] = await Promise.all([
        api.get<{ invoices: Invoice[]; total: number }>(`/api/school/invoices?${params}`),
        api.get<{ students: Student[]; total: number }>("/api/school/students?limit=500"),
        api.get<{ classes: ClassOption[] }>("/api/school/classes"),
        api.get<{ terms: TermOption[] }>("/api/school/terms"),
      ]);
      setInvoices(invRes.data?.invoices || []);
      setTotal(invRes.data?.total || 0);
      setStudents(stuRes.data?.students || []);
      setClasses(clsRes.data?.classes || []);
      setTerms(termRes.data?.terms || []);
    } catch {
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const generate = async () => {
    try {
      await api.post("/api/school/invoices/generate", {
        student_id: genForm.student_id,
        class_id: genForm.class_id,
        term_id: genForm.term_id,
        session_id: genForm.session_id || null,
        due_date: genForm.due_date,
      });
      setDialogOpen(false);
      setGenForm({ student_id: "", class_id: "", term_id: "", session_id: "", due_date: "" });
      load();
    } catch {
      setError("Failed to generate invoice");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/api/school/invoices/${id}/status`, { status });
      load();
    } catch {
      setError("Failed to update invoice status");
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) return <LoadingSpinner height={400} />;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="All status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">All status</SelectItem>
              {["draft", "issued", "paid", "overdue", "cancelled"].map(s => (
                <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs" style={{ color: MUTED }}>{total} invoice(s)</span>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ background: NAVY, color: CREAM }} className="rounded-full">
              <Plus size={15} className="mr-1" /> Generate Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]" style={{ borderRadius: 20 }}>
            <DialogHeader>
              <DialogTitle style={{ color: NAVY }}>Generate Invoice</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Select value={genForm.student_id} onValueChange={v => setGenForm({ ...genForm, student_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>
                  {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.class_name})</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Select value={genForm.class_id} onValueChange={v => setGenForm({ ...genForm, class_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Class" /></SelectTrigger>
                  <SelectContent>
                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={genForm.term_id} onValueChange={v => setGenForm({ ...genForm, term_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Term" /></SelectTrigger>
                  <SelectContent>
                    {terms.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Input type="date" value={genForm.due_date} onChange={e => setGenForm({ ...genForm, due_date: e.target.value })} />
              <Button onClick={generate} className="w-full rounded-full" style={{ background: NAVY, color: CREAM }}
                disabled={!genForm.student_id || !genForm.class_id || !genForm.term_id || !genForm.due_date}>Generate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="No invoices" desc="Generate invoices from fee structures" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map(inv => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium" style={{ color: NAVY }}>{inv.invoice_number}</TableCell>
                  <TableCell style={{ color: MUTED }}>{inv.student?.name || "—"}</TableCell>
                  <TableCell style={{ color: MUTED }}>{inv.class?.name || "—"}</TableCell>
                  <TableCell style={{ color: MUTED }}>{new Date(inv.due_date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatCedi(inv.total_amount)}</TableCell>
                  <TableCell>{formatCedi(inv.paid_amount)}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell className="text-right">
                    {inv.status === "draft" && <button onClick={() => updateStatus(inv.id, "issued")} className="text-xs mr-2" style={{ color: "#6366F1" }}>Issue</button>}
                    {inv.status !== "cancelled" && <button onClick={() => updateStatus(inv.id, "cancelled")} className="text-xs" style={{ color: "#EF4444" }}>Cancel</button>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: page <= 1 ? "#f0f0f0" : NAVY, color: page <= 1 ? MUTED : CREAM }}>Prev</button>
              <span className="text-xs" style={{ color: MUTED }}>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: page >= totalPages ? "#f0f0f0" : NAVY, color: page >= totalPages ? MUTED : CREAM }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Payments Tab ───────────────────────────────────────────────
function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [payForm, setPayForm] = useState({ invoice_id: "", amount: "", payment_method: "cash", reference: "", payment_date: "", notes: "" });

  const limit = 20;

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      const res = await api.get<{ payments: Payment[]; total: number }>(`/api/school/payments?${params}`);
      setPayments(res.data?.payments || []);
      setTotal(res.data?.total || 0);
    } catch {
      setError("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const record = async () => {
    try {
      await api.post("/api/school/payments", {
        invoice_id: payForm.invoice_id,
        amount: Number(payForm.amount) * 100,
        payment_method: payForm.payment_method,
        reference: payForm.reference || null,
        payment_date: payForm.payment_date || undefined,
        notes: payForm.notes || null,
      });
      setDialogOpen(false);
      setPayForm({ invoice_id: "", amount: "", payment_method: "cash", reference: "", payment_date: "", notes: "" });
      load();
    } catch {
      setError("Failed to record payment");
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) return <LoadingSpinner height={400} />;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      <div className="flex justify-end mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ background: NAVY, color: CREAM }} className="rounded-full">
              <Plus size={15} className="mr-1" /> Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]" style={{ borderRadius: 20 }}>
            <DialogHeader>
              <DialogTitle style={{ color: NAVY }}>Record Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Invoice ID" value={payForm.invoice_id} onChange={e => setPayForm({ ...payForm, invoice_id: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Amount (GHS)" type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} />
                <Select value={payForm.payment_method} onValueChange={v => setPayForm({ ...payForm, payment_method: v })}>
                  <SelectTrigger><SelectValue placeholder="Method" /></SelectTrigger>
                  <SelectContent>
                    {["cash", "mobile_money", "bank_transfer", "card", "cheque"].map(m => (
                      <SelectItem key={m} value={m}>{m.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Reference (optional)" value={payForm.reference} onChange={e => setPayForm({ ...payForm, reference: e.target.value })} />
              <Input type="date" value={payForm.payment_date} onChange={e => setPayForm({ ...payForm, payment_date: e.target.value })} />
              <Textarea placeholder="Notes (optional)" value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} />
              <Button onClick={record} className="w-full rounded-full" style={{ background: NAVY, color: CREAM }}
                disabled={!payForm.invoice_id || !payForm.amount}>Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments" desc="Record payments against invoices" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map(p => (
                <TableRow key={p.id}>
                  <TableCell style={{ color: MUTED }}>{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                  <TableCell style={{ color: NAVY }}>{p.student?.name || "—"}</TableCell>
                  <TableCell style={{ color: MUTED }}>{p.invoice?.invoice_number || "—"}</TableCell>
                  <TableCell className="font-medium">{formatCedi(p.amount)}</TableCell>
                  <TableCell><Badge variant="outline" className="bg-gray-50">{p.payment_method.replace("_", " ")}</Badge></TableCell>
                  <TableCell style={{ color: MUTED, fontSize: 12 }}>{p.reference || "—"}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: page <= 1 ? "#f0f0f0" : NAVY, color: page <= 1 ? MUTED : CREAM }}>Prev</button>
              <span className="text-xs" style={{ color: MUTED }}>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: page >= totalPages ? "#f0f0f0" : NAVY, color: page >= totalPages ? MUTED : CREAM }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Waivers Tab ────────────────────────────────────────────────
function WaiversTab() {
  const [waivers, setWaivers] = useState<Waiver[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ student_id: "", reason: "", amount: "" });

  const limit = 20;

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (statusFilter) params.set("status", statusFilter);
      const res = await api.get<{ waivers: Waiver[]; total: number }>(`/api/school/waivers?${params}`);
      setWaivers(res.data?.waivers || []);
      setTotal(res.data?.total || 0);
    } catch {
      setError("Failed to load waivers");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    try {
      await api.post("/api/school/waivers", {
        student_id: form.student_id,
        reason: form.reason,
        amount: Number(form.amount) * 100,
      });
      setDialogOpen(false);
      setForm({ student_id: "", reason: "", amount: "" });
      load();
    } catch {
      setError("Failed to create waiver");
    }
  };

  const approve = async (id: string) => {
    try {
      await api.put(`/api/school/waivers/${id}/approve`);
      load();
    } catch {
      setError("Failed to approve waiver");
    }
  };

  const reject = async (id: string) => {
    try {
      await api.put(`/api/school/waivers/${id}/reject`);
      load();
    } catch {
      setError("Failed to reject waiver");
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) return <LoadingSpinner height={400} />;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="All status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All status</SelectItem>
            {["pending", "approved", "rejected"].map(s => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button style={{ background: NAVY, color: CREAM }} className="rounded-full">
              <Plus size={15} className="mr-1" /> New Waiver
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]" style={{ borderRadius: 20 }}>
            <DialogHeader>
              <DialogTitle style={{ color: NAVY }}>Create Waiver</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Student ID" value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })} />
              <Input placeholder="Amount (GHS)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              <Textarea placeholder="Reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
              <Button onClick={create} className="w-full rounded-full" style={{ background: NAVY, color: CREAM }}
                disabled={!form.student_id || !form.reason || !form.amount}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {waivers.length === 0 ? (
        <EmptyState icon={Gift} title="No waivers" desc="Create fee waivers for students who qualify" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waivers.map(w => (
                <TableRow key={w.id}>
                  <TableCell style={{ color: NAVY }}>{w.student?.name || "—"}</TableCell>
                  <TableCell>{formatCedi(w.amount)}</TableCell>
                  <TableCell style={{ color: MUTED, fontSize: 13 }}>{w.reason}</TableCell>
                  <TableCell><StatusBadge status={w.status} /></TableCell>
                  <TableCell style={{ color: MUTED }}>{w.approver?.name || "—"}</TableCell>
                  <TableCell className="text-right">
                    {w.status === "pending" && <>
                      <button onClick={() => approve(w.id)} className="text-xs mr-2" style={{ color: "#065F46" }}>Approve</button>
                      <button onClick={() => reject(w.id)} className="text-xs" style={{ color: "#EF4444" }}>Reject</button>
                    </>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: page <= 1 ? "#f0f0f0" : NAVY, color: page <= 1 ? MUTED : CREAM }}>Prev</button>
              <span className="text-xs" style={{ color: MUTED }}>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg text-xs" style={{ background: page >= totalPages ? "#f0f0f0" : NAVY, color: page >= totalPages ? MUTED : CREAM }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Discounts Tab ──────────────────────────────────────────────
function DiscountsTab() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Discount | null>(null);
  const [form, setForm] = useState({ name: "", type: "percentage", value: "", applicable_to: "all", applicable_id: "" });

  const load = useCallback(async () => {
    try {
      const res = await api.get<{ discounts: Discount[] }>("/api/school/discounts");
      setDiscounts(res.data?.discounts || []);
    } catch {
      setError("Failed to load discounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resetForm = () => setForm({ name: "", type: "percentage", value: "", applicable_to: "all", applicable_id: "" });

  const openCreate = () => { setEditItem(null); resetForm(); setDialogOpen(true); };
  const openEdit = (item: Discount) => {
    setEditItem(item);
    setForm({ name: item.name, type: item.type, value: String(item.value), applicable_to: item.applicable_to, applicable_id: item.applicable_id || "" });
    setDialogOpen(true);
  };

  const save = async () => {
    const payload = { name: form.name, type: form.type, value: Number(form.value), applicable_to: form.applicable_to, applicable_id: form.applicable_id || null, is_active: true };
    try {
      if (editItem) {
        await api.put(`/api/school/discounts/${editItem.id}`, payload);
      } else {
        await api.post("/api/school/discounts", payload);
      }
      setDialogOpen(false);
      load();
    } catch {
      setError("Failed to save discount");
    }
  };

  const remove = async (id: string) => {
    try {
      await api.delete(`/api/school/discounts/${id}`);
      load();
    } catch {
      setError("Failed to delete discount");
    }
  };

  if (loading) return <LoadingSpinner height={400} />;

  return (
    <div>
      {error && <AlertBanner type="error" message={error} onClose={() => setError("")} />}
      <div className="flex justify-end mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} style={{ background: NAVY, color: CREAM }} className="rounded-full">
              <Plus size={15} className="mr-1" /> Add Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px]" style={{ borderRadius: 20 }}>
            <DialogHeader>
              <DialogTitle style={{ color: NAVY }}>{editItem ? "Edit Discount" : "New Discount"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <Input placeholder="Discount name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed (GHS)</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder={form.type === "percentage" ? "Percent" : "Amount"} type="number" value={form.value}
                  onChange={e => setForm({ ...form, value: e.target.value })} />
              </div>
              <Select value={form.applicable_to} onValueChange={v => setForm({ ...form, applicable_to: v })}>
                <SelectTrigger><SelectValue placeholder="Applies to" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All fees</SelectItem>
                  <SelectItem value="specific_fee">Specific fee</SelectItem>
                  <SelectItem value="specific_class">Specific class</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={save} className="w-full rounded-full" style={{ background: NAVY, color: CREAM }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {discounts.length === 0 ? (
        <EmptyState icon={Percent} title="No discount rules" desc="Set up discounts like early payment or sibling discounts" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Applies To</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discounts.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium" style={{ color: NAVY }}>{d.name}</TableCell>
                <TableCell style={{ color: MUTED }}>{d.type === "percentage" ? "%" : "GHS"}</TableCell>
                <TableCell>{d.type === "percentage" ? `${d.value}%` : formatCedi(d.value * 100)}</TableCell>
                <TableCell style={{ color: MUTED }}>{d.applicable_to.replace("_", " ")}</TableCell>
                <TableCell><StatusBadge status={d.is_active ? "active" : "inactive"} /></TableCell>
                <TableCell className="text-right">
                  <button onClick={() => openEdit(d)} className="text-xs mr-2" style={{ color: NAVY }}>Edit</button>
                  <button onClick={() => remove(d.id)} className="text-xs" style={{ color: "#EF4444" }}>Delete</button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

// ─── Main Finance Component ─────────────────────────────────────
export function Finance() {
  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: NAVY }}>Finance</h1>
        <p style={{ color: MUTED, fontSize: "0.85rem" }}>Fee structures, invoices, payments, waivers, and discounts</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList style={{ background: "rgba(10,36,114,0.05)", borderRadius: 12 }} className="flex-wrap h-auto p-1">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Overview</TabsTrigger>
          <TabsTrigger value="fee-structures" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Fee Structures</TabsTrigger>
          <TabsTrigger value="invoices" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Invoices</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Payments</TabsTrigger>
          <TabsTrigger value="waivers" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Waivers</TabsTrigger>
          <TabsTrigger value="discounts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Discounts</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="fee-structures"><FeeStructuresTab /></TabsContent>
          <TabsContent value="invoices"><InvoicesTab /></TabsContent>
          <TabsContent value="payments"><PaymentsTab /></TabsContent>
          <TabsContent value="waivers"><WaiversTab /></TabsContent>
          <TabsContent value="discounts"><DiscountsTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
