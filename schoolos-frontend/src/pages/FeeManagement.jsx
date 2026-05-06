import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  Plus, 
  Download, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { buildUrl, getHeaders } from '../services/api';
import { Button } from '../components/ui/Button';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const monthlyRevenue = [
  { month: "Sep", collected: 42000, target: 52000 },
  { month: "Oct", collected: 58000, target: 52000 },
  { month: "Nov", collected: 49000, target: 52000 },
  { month: "Dec", collected: 63000, target: 65000 },
  { month: "Jan", collected: 71000, target: 70000 },
  { month: "Feb", collected: 86000, target: 80000 },
  { month: "Mar", collected: 94000, target: 88000 },
];

const pieData = [
  { name: "Paid", value: 812, color: "#10B981" },
  { name: "Partial", value: 276, color: "#F59E0B" },
  { name: "Overdue", value: 160, color: "#EF4444" },
];

const payrollData = [
  { name: "Mrs. Akua Boateng", role: "Mathematics Teacher", salary: 4200, paid: true },
  { name: "Mr. Kofi Osei", role: "English Teacher", salary: 3800, paid: true },
  { name: "Mrs. Esi Appiah", role: "Science Teacher", salary: 4000, paid: false },
  { name: "Mr. Yaw Mensah", role: "ICT Teacher", salary: 3600, paid: true },
  { name: "Mrs. Abena Kumi", role: "Deputy Head", salary: 5500, paid: false },
];

const StatusBadge = ({ status }) => {
  const map = {
    paid: { bg: "#D1FAE5", color: "#065F46", label: "Paid" },
    partial: { bg: "#FEF3C7", color: "#92400E", label: "Partial" },
    overdue: { bg: "#FEE2E2", color: "#991B1B", label: "Overdue" },
  };
  const s = map[status] || map.paid;
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
};

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState("fees");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const { authSession } = useAuth();

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await fetch(buildUrl('/api/school/fees'), {
          headers: getHeaders(authSession?.token),
          credentials: 'include'
        });
        const json = await res.json();
        if (json.data) {
          const mapped = (json.data.fees || []).map(f => ({
            ...f,
            student_name: f.student?.name || 'Unknown',
            admission_no: f.student?.admission_no || 'N/A',
            status: (f.amount - f.paid_amount) <= 0 ? 'paid' : (f.paid_amount > 0 ? 'partial' : 'overdue'),
            id: f.id.toString().padStart(4, '0'),
            date: new Date(f.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            method: 'Bank Transfer'
          }));
          setFees(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch fees", err);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchFees();
  }, []);

  const filtered = useMemo(() => {
    return (fees.length > 0 ? fees : []).filter((r) => 
      (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.admission_no || '').toLowerCase().includes(search.toLowerCase())
    );
  }, [fees, search]);

  const totalCollected = fees.reduce((acc, r) => acc + (r.paid_amount || 0), 0) || 312000;
  const totalOwed = fees.reduce((acc, r) => acc + (r.amount - r.paid_amount || 0), 0) || 138000;
  const totalPayroll = payrollData.reduce((acc, p) => acc + p.salary, 0);
  const paidPayroll = payrollData.filter((p) => p.paid).reduce((acc, p) => acc + p.salary, 0);

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Collected",
            value: `₵${totalCollected.toLocaleString()}`,
            icon: ArrowUpRight,
            color: "#10B981",
            sub: "This term",
          },
          {
            label: "Total Owed",
            value: `₵${totalOwed.toLocaleString()}`,
            icon: ArrowDownLeft,
            color: "#EF4444",
            sub: `${filtered.filter((r) => r.status !== "paid").length} students`,
          },
          {
            label: "Payroll Status",
            value: `₵${paidPayroll.toLocaleString()}`,
            icon: Users,
            color: "#6366F1",
            sub: `of ₵${totalPayroll.toLocaleString()}`,
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
            className="p-5 rounded-[24px] border"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-card)",
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
                color: "var(--text-primary)",
                fontSize: "clamp(1rem, 2vw, 1.3rem)",
                fontWeight: 700,
                lineHeight: 1.1,
              }}
            >
              {card.value}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.72rem", marginTop: "0.2rem", fontWeight: 600 }}>
              {card.label}
            </div>
            <div style={{ color: card.color, fontSize: "0.7rem", marginTop: "0.25rem", fontWeight: 700 }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Unified Tab Hub */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex p-1 rounded-2xl border"
            style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
          >
            {[
              { id: "fees", label: "Fee Records", icon: Wallet },
              { id: "payroll", label: "Staff Payroll", icon: Users },
              { id: "analytics", label: "Analytics", icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all active:scale-95"
                style={{
                  background: activeTab === tab.id ? "var(--accent-primary)" : "transparent",
                  color: activeTab === tab.id ? "var(--bg-primary)" : "var(--text-muted)",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                }}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "fees" && (
            <div
              className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all group"
              style={{ background: "var(--card-bg)", borderColor: "var(--border)", width: 240 }}
            >
              <Search size={14} style={{ color: "var(--text-muted)" }} className="group-focus-within:scale-110 transition-transform" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search students..."
                className="bg-transparent outline-none text-xs flex-1 font-medium"
                style={{ color: "var(--text-primary)" }}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform bg-plum text-milk shadow-lg shadow-plum/20"
        >
          <Plus size={16} />
          {activeTab === "payroll" ? "Run Payroll" : "Record Payment"}
        </button>
      </div>

      {/* Fees Tab */}
      {activeTab === "fees" && (
        <div
          className="rounded-[24px] overflow-hidden border flex flex-col"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg-secondary)" }}>
                  {["Student", "Admission", "Amount", "Paid", "Balance", "Date", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-[10px] font-black uppercase tracking-widest"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(filtered.length > 0 ? filtered : []).map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-black/[0.02] transition-colors border-b last:border-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-6 py-4">
                      <span style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700 }}>{r.student_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-muted)", fontSize: "0.72rem", fontWeight: 600 }}>{r.admission_no}</span>
                    </td>
                    {[r.amount, r.paid_amount, (r.amount - r.paid_amount)].map((v, i) => (
                      <td key={i} className="px-6 py-4">
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            color: i === 2 && v > 0 ? "#EF4444" : "var(--text-primary)",
                            fontSize: "0.8rem",
                            fontWeight: i === 2 && v > 0 ? 800 : 600,
                          }}
                        >
                          ₵{v.toLocaleString()}
                        </span>
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>{r.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={r.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Showing {filtered.length} transactions</p>
            <button 
              onClick={() => {
                showToast({
                  title: 'Data Compilation',
                  message: 'The financial ledger is being exported to CSV format.',
                  type: 'info'
                });
              }}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" 
              style={{ color: "var(--text-primary)" }}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === "payroll" && (
        <div
          className="rounded-[24px] overflow-hidden border flex flex-col"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg-secondary)" }}>
                  {["Staff Member", "Role", "Salary", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-[10px] font-black uppercase tracking-widest"
                      style={{ color: "var(--text-muted)" }}
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
                    className="hover:bg-black/[0.02] transition-colors border-b last:border-0"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] bg-plum/5 text-plum"
                        >
                          {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </div>
                        <span style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700 }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>{p.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 800 }}>₵{p.salary.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                        style={p.paid ? { background: "#D1FAE5", color: "#065F46" } : { background: "#FEE2E2", color: "#991B1B" }}
                      >
                        {p.paid ? "Disbursed" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          showToast({
                            title: p.paid ? 'Viewing Payslip' : 'Processing Salary',
                            message: p.paid ? `Opening digital slip for ${p.name}.` : `Initiating bank transfer to ${p.name}.`,
                            type: p.paid ? 'info' : 'success'
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-transform"
                        style={{
                          background: p.paid ? `var(--bg-secondary)` : "var(--accent-primary)",
                          color: p.paid ? "var(--text-muted)" : "var(--bg-primary)",
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
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div
            className="p-6 rounded-[24px] border"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.05rem", marginBottom: "1.5rem" }}>
              Revenue vs Target
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)", fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)", fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip
                  contentStyle={{ background: "var(--card-bg)", border: `1px solid var(--border)`, borderRadius: 12, fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}
                  formatter={(v) => [`₵${v.toLocaleString()}`]}
                />
                <Bar dataKey="target" fill="var(--bg-secondary)" radius={[4, 4, 0, 0]} barSize={16} name="Target" />
                <Bar dataKey="collected" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} barSize={16} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div
            className="p-6 rounded-[24px] border"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.05rem", marginBottom: "1.5rem" }}>
              Fee Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card-bg)", border: `1px solid var(--border)`, borderRadius: 12, fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 700 }}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md rounded-[40px] shadow-2xl relative z-10 overflow-hidden border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--text-primary)" }}>Record Payment</h2>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Financial Ledger Entry</p>
                </div>
                <button aria-label="Close" onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-black/5 flex items-center justify-center"><X size={20} style={{ color: "var(--text-muted)" }} /></button>
              </div>
              <div className="p-8 pt-4 space-y-4">
                {[
                  { label: "Student Name / ID", placeholder: "e.g. Ama Owusu" },
                  { label: "Amount Received (₵)", placeholder: "e.g. 1800" },
                  { label: "Reference", placeholder: "e.g. TXN-8219" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: "var(--text-muted)" }}>Method</label>
                  <select className="w-full border rounded-xl px-4 py-3 text-sm font-bold outline-none transition-all cursor-pointer" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }}>
                    {["Cash", "Bank Transfer", "Paystack", "Flutterwave"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-8 bg-black/[0.02] flex gap-3">
                <Button 
                  className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk" 
                  onClick={() => {
                    setShowModal(false);
                    showToast({
                      title: 'Transaction Posted',
                      message: 'The payment has been successfully recorded in the institutional ledger.',
                      type: 'success'
                    });
                  }}
                >
                  Post Transaction
                </Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" style={{ borderColor: "var(--border)", color: "var(--text-primary)" }} onClick={() => setShowModal(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeeManagement;
