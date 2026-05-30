import { useState } from "react";
import { Plus, X } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";

interface Expense {
  id: string; date: string; description: string; category: string;
  amount: number; paidBy: string; method: string; status: "approved" | "pending" | "rejected";
}

const categories = ["Utilities", "Salaries", "Maintenance", "Stationery", "Transport", "Events", "Food", "Equipment"];

const fmt = (n: number) => `GHS ${n.toLocaleString()}`;

const statusColors = { approved: { bg: "#DCFCE7", text: "#16A34A" }, pending: { bg: "#FEF3C7", text: "#D97706" }, rejected: { bg: "#FEE2E2", text: "#DC2626" } };

export function BursarExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newExp, setNewExp] = useState({ description: "", amount: "", category: "Utilities", date: new Date().toISOString().split("T")[0], notes: "" });

  const totalSpent = expenses.filter(e => e.status === "approved").reduce((s, e) => s + e.amount, 0);
  const pending = expenses.filter(e => e.status === "pending").length;
  const largestAmount = expenses.length > 0 ? Math.max(...expenses.map(e => e.amount)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Expenses</h1>
          <p className="text-sm mt-1" style={{ color: MUTED }}>School expenditure tracking</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: NAVY }}>
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "This Month", value: fmt(totalSpent), color: NAVY },
          { label: "Pending Approval", value: pending.toString(), color: "#D97706" },
          { label: "Largest Expense", value: largestAmount > 0 ? fmt(largestAmount) : "—", color: "#DC2626" },
          { label: "Transactions", value: expenses.length.toString(), color: "#0080FF" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-2xl p-4">
            <p className="text-xl font-bold" style={{ color: k.color }}>{k.value}</p>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Add expense form */}
      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold" style={{ color: NAVY }}>New Expense</h3>
            <button onClick={() => setShowForm(false)}><X size={16} style={{ color: MUTED }} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {[
              { key: "description", label: "Description", placeholder: "What was purchased" },
              { key: "amount", label: "Amount (GHS)", placeholder: "0.00" },
              { key: "date", label: "Date", type: "date" },
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>{label}</label>
                <input type={type || "text"} value={(newExp as any)[key]}
                  onChange={e => setNewExp(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full h-9 px-3 rounded-xl text-sm border border-border bg-background focus:outline-none"
                  placeholder={placeholder} />
              </div>
            ))}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: NAVY }}>Category</label>
              <select value={newExp.category} onChange={e => setNewExp(f => ({ ...f, category: e.target.value }))}
                className="w-full h-9 px-3 rounded-xl text-sm border border-border bg-background appearance-none focus:outline-none">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-sm border border-border" style={{ color: MUTED }}>Cancel</button>
            <button type="button" onClick={() => {
              if (!newExp.description || !newExp.amount) return;
              const e: Expense = { id: String(Date.now()), date: newExp.date, description: newExp.description, category: newExp.category, amount: Number(newExp.amount), paidBy: "Current User", method: "Cash", status: "pending" };
              setExpenses(prev => [e, ...prev]);
              setNewExp({ description: "", amount: "", category: "Utilities", date: new Date().toISOString().split("T")[0], notes: "" });
              setShowForm(false);
            }}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: NAVY }}>Save Expense</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {["Date", "Description", "Category", "Amount", "Status"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: MUTED }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: MUTED }}>
                  No expenses recorded yet. Use the form above to add one.
                </td>
              </tr>
            )}
            {expenses.map(e => (
              <tr key={e.id} className="border-b border-border last:border-0 hover:bg-muted/10">
                <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{e.date}</td>
                <td className="px-4 py-3 text-sm" style={{ color: NAVY }}>{e.description}</td>
                <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>{e.category}</td>
                <td className="px-4 py-3 text-xs font-mono font-semibold" style={{ color: NAVY }}>{fmt(e.amount)}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize"
                    style={{ background: statusColors[e.status].bg, color: statusColors[e.status].text }}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
