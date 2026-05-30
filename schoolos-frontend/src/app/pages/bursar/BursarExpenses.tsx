import { useState } from "react";
import { Plus, X } from "lucide-react";

const NAVY = "#031B4E";
const MUTED = "#6B7280";

interface Expense {
  id: string; date: string; description: string; category: string;
  amount: number; paidBy: string; method: string; status: "approved" | "pending" | "rejected";
}

const mockExpenses: Expense[] = [
  { id: "1", date: "2024-06-01", description: "PURC Electricity Bill", category: "Utilities", amount: 4200, paidBy: "Ama Mensah", method: "Bank", status: "approved" },
  { id: "2", date: "2024-05-30", description: "Stationery for exams", category: "Stationery", amount: 850, paidBy: "Kofi Boateng", method: "Cash", status: "approved" },
  { id: "3", date: "2024-05-28", description: "Generator fuel", category: "Maintenance", amount: 1500, paidBy: "Ama Mensah", method: "Cash", status: "approved" },
  { id: "4", date: "2024-05-25", description: "Prize giving day decoration", category: "Events", amount: 3200, paidBy: "Principal", method: "Cash", status: "pending" },
  { id: "5", date: "2024-05-22", description: "Ghana Water bill", category: "Utilities", amount: 980, paidBy: "Ama Mensah", method: "Bank", status: "approved" },
  { id: "6", date: "2024-05-20", description: "Sports equipment", category: "Equipment", amount: 2750, paidBy: "Mr. Quaye", method: "Bank", status: "pending" },
  { id: "7", date: "2024-05-18", description: "Canteen food supplies", category: "Food", amount: 5600, paidBy: "Cook", method: "Cash", status: "approved" },
];

const categories = ["Utilities", "Salaries", "Maintenance", "Stationery", "Transport", "Events", "Food", "Equipment"];

const budgets: Record<string, { budget: number; spent: number; color: string }> = {
  Utilities: { budget: 8000, spent: 5180, color: "#0080FF" },
  Salaries: { budget: 50000, spent: 50000, color: "#16A34A" },
  Maintenance: { budget: 5000, spent: 1500, color: "#8B5CF6" },
  Stationery: { budget: 2000, spent: 850, color: "#F59E0B" },
  Events: { budget: 5000, spent: 3200, color: "#EC4899" },
  Food: { budget: 20000, spent: 5600, color: "#6B7280" },
};

const fmt = (n: number) => `GHS ${n.toLocaleString()}`;

const statusColors = { approved: { bg: "#DCFCE7", text: "#16A34A" }, pending: { bg: "#FEF3C7", text: "#D97706" }, rejected: { bg: "#FEE2E2", text: "#DC2626" } };

export function BursarExpenses() {
  const [showForm, setShowForm] = useState(false);
  const [newExp, setNewExp] = useState({ description: "", amount: "", category: "Utilities", date: new Date().toISOString().split("T")[0], notes: "" });

  const totalSpent = mockExpenses.filter(e => e.status === "approved").reduce((s, e) => s + e.amount, 0);
  const pending = mockExpenses.filter(e => e.status === "pending").length;

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
          { label: "Largest Expense", value: fmt(5600), color: "#DC2626" },
          { label: "Transactions", value: mockExpenses.length.toString(), color: "#0080FF" },
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
            <button type="button" onClick={() => setShowForm(false)}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: NAVY }}>Save Expense</button>
          </div>
        </div>
      )}

      {/* Budget overview */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="text-sm font-semibold mb-4" style={{ color: NAVY }}>Budget vs. Actual</h3>
        <div className="space-y-3">
          {Object.entries(budgets).map(([cat, b]) => {
            const pct = Math.min(100, Math.round((b.spent / b.budget) * 100));
            return (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: NAVY }}>{cat}</span>
                  <span style={{ color: MUTED }}>{fmt(b.spent)} / {fmt(b.budget)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/30">
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, background: pct >= 100 ? "#DC2626" : pct >= 80 ? "#F59E0B" : b.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
            {mockExpenses.map(e => (
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
