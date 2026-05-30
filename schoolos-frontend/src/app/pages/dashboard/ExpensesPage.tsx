import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Download, Filter } from "lucide-react";
import { PageTemplate } from "../../components/layout/PageTemplate";

const NAVY = "#031B4E";
const MUTED = "#6B7280";
const SUCCESS = "#16A34A";
const WARNING = "#F59E0B";
const DANGER = "#EF4444";
const PRIMARY = "#031B4E";

type ExpenseCategory =
  | "Salaries"
  | "Utilities"
  | "Maintenance"
  | "Supplies"
  | "Transport"
  | "Events";

type ExpenseStatus = "approved" | "pending" | "rejected";

interface Expense {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  paidBy: string;
  status: ExpenseStatus;
}

const CATEGORIES: ExpenseCategory[] = [
  "Salaries",
  "Utilities",
  "Maintenance",
  "Supplies",
  "Transport",
  "Events",
];

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Salaries: "#3B82F6",
  Utilities: "#8B5CF6",
  Maintenance: "#F59E0B",
  Supplies: "#10B981",
  Transport: "#EF4444",
  Events: "#EC4899",
};

const mockExpenses: Expense[] = [
  {
    id: "1",
    date: "2025-05-02",
    description: "May staff salaries",
    category: "Salaries",
    amount: 48500,
    paidBy: "Akosua Amponsah",
    status: "approved",
  },
  {
    id: "2",
    date: "2025-05-05",
    description: "ECG electricity bill",
    category: "Utilities",
    amount: 1250,
    paidBy: "Yaw Darko",
    status: "approved",
  },
  {
    id: "3",
    date: "2025-05-07",
    description: "Water tank repair",
    category: "Maintenance",
    amount: 850,
    paidBy: "Kweku Asante",
    status: "pending",
  },
  {
    id: "4",
    date: "2025-05-09",
    description: "Exercise books & pencils",
    category: "Supplies",
    amount: 630,
    paidBy: "Ama Boateng",
    status: "approved",
  },
  {
    id: "5",
    date: "2025-05-11",
    description: "School bus diesel refill",
    category: "Transport",
    amount: 980,
    paidBy: "Kofi Agyei",
    status: "approved",
  },
  {
    id: "6",
    date: "2025-05-14",
    description: "Parents' speech day decoration",
    category: "Events",
    amount: 1400,
    paidBy: "Abena Mensah",
    status: "pending",
  },
  {
    id: "7",
    date: "2025-05-16",
    description: "Ghana Water Company bill",
    category: "Utilities",
    amount: 420,
    paidBy: "Yaw Darko",
    status: "approved",
  },
  {
    id: "8",
    date: "2025-05-18",
    description: "Classroom door hinge replacement",
    category: "Maintenance",
    amount: 310,
    paidBy: "Kweku Asante",
    status: "rejected",
  },
  {
    id: "9",
    date: "2025-05-21",
    description: "Science lab chemicals",
    category: "Supplies",
    amount: 750,
    paidBy: "Efua Quansah",
    status: "pending",
  },
  {
    id: "10",
    date: "2025-05-24",
    description: "Inter-schools sports transport",
    category: "Transport",
    amount: 560,
    paidBy: "Kofi Agyei",
    status: "approved",
  },
];

const MONTHLY_BUDGET = 60000;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const monthlyBreakdown: Record<ExpenseCategory, number> = {
  Salaries: 48500,
  Utilities: 1670,
  Maintenance: 1160,
  Supplies: 1380,
  Transport: 1540,
  Events: 1400,
};

const maxMonthlyValue = Math.max(...Object.values(monthlyBreakdown));

interface NewExpenseForm {
  amount: string;
  description: string;
  category: ExpenseCategory;
  date: string;
}

const emptyForm: NewExpenseForm = {
  amount: "",
  description: "",
  category: "Supplies",
  date: new Date().toISOString().split("T")[0],
};

export function ExpensesPage() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "All">("All");
  const [filterMonth, setFilterMonth] = useState(4); // 0-indexed, May = 4
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewExpenseForm>(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const totalExpenses = expenses
    .filter((e) => e.status !== "rejected")
    .reduce((sum, e) => sum + e.amount, 0);

  const budgetUsed = Math.round((totalExpenses / MONTHLY_BUDGET) * 100);
  const pendingCount = expenses.filter((e) => e.status === "pending").length;
  const largestCategory = Object.entries(monthlyBreakdown).reduce(
    (a, b) => (b[1] > a[1] ? b : a)
  )[0] as ExpenseCategory;

  const filtered = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.paidBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddExpense = () => {
    if (!form.amount || !form.description) return;
    setSubmitting(true);
    setTimeout(() => {
      const newExpense: Expense = {
        id: String(Date.now()),
        date: form.date,
        description: form.description,
        category: form.category,
        amount: Number(form.amount),
        paidBy: "Current User",
        status: "pending",
      };
      setExpenses((prev) => [newExpense, ...prev]);
      setForm(emptyForm);
      setShowForm(false);
      setSubmitting(false);
    }, 600);
  };

  const statusStyle = (status: ExpenseStatus) => {
    if (status === "approved") return { bg: `${SUCCESS}20`, color: SUCCESS };
    if (status === "pending") return { bg: `${WARNING}20`, color: WARNING };
    return { bg: `${DANGER}20`, color: DANGER };
  };

  return (
    <PageTemplate
      title="Expenses"
      description="Manage and track school expenditure"
      breadcrumb={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Expenses" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowForm((v) => !v);
              setForm(emptyForm);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm text-white"
            style={{ background: PRIMARY }}
          >
            <Plus size={18} />
            Add Expense
          </button>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Total Expenses (May)
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: NAVY, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            ₵{totalExpenses.toLocaleString()}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Budget Used
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: budgetUsed > 90 ? DANGER : budgetUsed > 70 ? WARNING : SUCCESS, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {budgetUsed}%
          </div>
          <div className="mt-2 h-1.5 rounded-full" style={{ background: `${NAVY}15` }}>
            <div
              className="h-1.5 rounded-full transition-all"
              style={{
                width: `${Math.min(budgetUsed, 100)}%`,
                background: budgetUsed > 90 ? DANGER : budgetUsed > 70 ? WARNING : SUCCESS,
              }}
            />
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Pending Approvals
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", color: pendingCount > 0 ? WARNING : SUCCESS, fontSize: "1.5rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {pendingCount}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div style={{ color: MUTED, fontSize: "0.8rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Largest Category
          </div>
          <div style={{ color: NAVY, fontSize: "1.1rem", fontWeight: 700, marginTop: "0.5rem" }}>
            {largestCategory}
          </div>
          <div style={{ color: MUTED, fontSize: "0.8rem", marginTop: "0.2rem" }}>
            ₵{monthlyBreakdown[largestCategory].toLocaleString()}
          </div>
        </div>
      </div>

      {/* Inline Add Expense Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 style={{ color: NAVY, fontWeight: 600, marginBottom: "1rem" }}>New Expense</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Amount (GHS)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: `${NAVY}25`, color: NAVY }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: `${NAVY}25`, color: NAVY }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Description</label>
              <input
                type="text"
                placeholder="Brief description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: `${NAVY}25`, color: NAVY }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: MUTED }}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: `${NAVY}25`, color: NAVY }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => { setShowForm(false); setForm(emptyForm); }}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ color: MUTED, background: `${NAVY}08` }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddExpense}
              disabled={submitting || !form.amount || !form.description}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity"
              style={{ background: PRIMARY, opacity: submitting || !form.amount || !form.description ? 0.6 : 1 }}
            >
              {submitting ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </div>
      )}

      {/* Monthly Category Bar Chart */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 style={{ color: NAVY, fontWeight: 600 }}>Spending by Category — May 2025</h3>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: `${NAVY}25`, color: NAVY }}
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>{m}</option>
            ))}
          </select>
        </div>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const val = monthlyBreakdown[cat];
            const pct = Math.round((val / maxMonthlyValue) * 100);
            return (
              <div key={cat} className="flex items-center gap-3">
                <div style={{ width: 90, color: MUTED, fontSize: "0.8rem", flexShrink: 0 }}>{cat}</div>
                <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: `${NAVY}08` }}>
                  <div
                    className="h-full rounded-lg flex items-center px-2 transition-all"
                    style={{ width: `${pct}%`, background: CATEGORY_COLORS[cat], minWidth: 8 }}
                  >
                    {pct > 20 && (
                      <span className="text-white text-xs font-semibold">₵{val.toLocaleString()}</span>
                    )}
                  </div>
                </div>
                {pct <= 20 && (
                  <div style={{ color: MUTED, fontSize: "0.75rem", flexShrink: 0 }}>₵{val.toLocaleString()}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border min-w-0"
          style={{ borderColor: `${NAVY}20`, background: "white" }}
        >
          <Search size={16} style={{ color: MUTED, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search description or paid by..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm outline-none min-w-0"
            style={{ color: NAVY }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["All", ...CATEGORIES] as (ExpenseCategory | "All")[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filterCategory === cat ? `${PRIMARY}15` : `${NAVY}06`,
                color: filterCategory === cat ? PRIMARY : MUTED,
                border: filterCategory === cat ? `1px solid ${PRIMARY}30` : "1px solid transparent",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Export">
          <Download size={16} style={{ color: MUTED }} />
        </button>
      </div>

      {/* Expenses Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: `${NAVY}08`, borderBottom: `1px solid ${NAVY}20` }}>
                {["Date", "Description", "Category", "Amount (GHS)", "Paid By", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3 text-xs font-semibold ${h === "Amount (GHS)" ? "text-right" : "text-left"}`}
                    style={{ color: NAVY, textTransform: "uppercase", letterSpacing: "0.04em" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-sm" style={{ color: MUTED }}>
                    No expenses match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((expense) => {
                  const { bg, color } = statusStyle(expense.status);
                  return (
                    <tr
                      key={expense.id}
                      style={{ borderBottom: `1px solid ${NAVY}12` }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4 text-sm" style={{ color: MUTED, whiteSpace: "nowrap" }}>
                        {expense.date}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: NAVY, fontWeight: 500, maxWidth: 220 }}>
                        {expense.description}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-medium"
                          style={{
                            background: `${CATEGORY_COLORS[expense.category]}20`,
                            color: CATEGORY_COLORS[expense.category],
                          }}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-right font-mono" style={{ color: NAVY, fontWeight: 600 }}>
                        ₵{expense.amount.toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: MUTED }}>
                        {expense.paidBy}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                          style={{ background: bg, color }}
                        >
                          {expense.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          {expense.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  setExpenses((prev) =>
                                    prev.map((e) => e.id === expense.id ? { ...e, status: "approved" } : e)
                                  )
                                }
                                className="text-xs font-medium px-2 py-1 rounded"
                                style={{ color: SUCCESS, background: `${SUCCESS}15` }}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  setExpenses((prev) =>
                                    prev.map((e) => e.id === expense.id ? { ...e, status: "rejected" } : e)
                                  )
                                }
                                className="text-xs font-medium px-2 py-1 rounded"
                                style={{ color: DANGER, background: `${DANGER}15` }}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {expense.status !== "pending" && (
                            <span style={{ color: MUTED, fontSize: "0.75rem" }}>—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 rounded-xl" style={{ background: `${NAVY}06`, border: `1px solid ${NAVY}15` }}>
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>
          Showing <strong>{filtered.length}</strong> of <strong>{expenses.length}</strong> expenses &nbsp;·&nbsp;
          Budget remaining:{" "}
          <strong style={{ color: totalExpenses > MONTHLY_BUDGET ? DANGER : SUCCESS }}>
            ₵{Math.max(0, MONTHLY_BUDGET - totalExpenses).toLocaleString()}
          </strong>
        </p>
      </div>
    </PageTemplate>
  );
}
