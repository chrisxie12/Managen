import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Smartphone,
  ChevronRight,
  MoreHorizontal,
  DollarSign
} from 'lucide-react';
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
  Cell,
  PieChart,
  Pie
} from "recharts";
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { buildUrl, handleApiError } from '../services/api';
import { Button } from '../components/ui/Button';

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

const FeeManagement = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('fees');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("fees");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await fetch(buildUrl('/api/school/fees'), { credentials: 'include' });
        const json = await res.json();
        if (json.data) {
          const mapped = (json.data.fees || []).map(f => ({
            ...f,
            status: (f.amount - f.paid_amount) === 0 ? 'paid' : (f.paid_amount > 0 ? 'partial' : 'overdue'),
            id: f.id.toString().padStart(4, '0'),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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
    return (fees.length > 0 ? fees : []).filter((r) => {
      const matchSearch =
        (r.student_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.admission_no || '').toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "All" || r.status === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [fees, search, statusFilter]);

  const totalCollected = fees.reduce((acc, r) => acc + (r.paid_amount || 0), 0) || 312000;
  const totalOwed = fees.reduce((acc, r) => acc + (r.amount - r.paid_amount || 0), 0) || 138000;
  const totalPayroll = payrollData.reduce((acc, p) => acc + p.salary, 0);
  const paidPayroll = payrollData.filter((p) => p.paid).reduce((acc, p) => acc + p.salary, 0);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-body">
      <Sidebar 
        activeItem={activeItem} 
        onNavigate={(item) => {
          setActiveItem(item);
          onNavigate(item);
        }} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <DashboardNavbar 
        activeItem={activeItem} 
        onMenuClick={() => setSidebarOpen(true)} 
      />

      <main className="lg:ml-64 pt-16 p-6 sm:p-8 flex flex-col gap-6">
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
                background: "white",
                borderColor: "rgba(56,25,50,0.07)",
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
                  fontSize: "clamp(1rem, 2vw, 1.3rem)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                {card.value}
              </div>
              <div style={{ color: MUTED, fontSize: "0.72rem", marginTop: "0.2rem", fontWeight: 600 }}>
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
              style={{ background: "white", borderColor: "rgba(56,25,50,0.08)" }}
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
                    background: activeTab === tab.id ? PLUM : "transparent",
                    color: activeTab === tab.id ? MILK : MUTED,
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
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border transition-all focus-within:border-plum/20"
                style={{ background: "white", borderColor: "rgba(56,25,50,0.08)", width: 240 }}
              >
                <Search size={14} color={MUTED} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search students..."
                  className="bg-transparent outline-none text-xs flex-1 font-medium"
                  style={{ color: PLUM }}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest active:scale-95 transition-transform"
            style={{
              background: `linear-gradient(135deg, ${PLUM}, ${PLUM_LIGHT})`,
              color: MILK,
              boxShadow: "0 4px 14px rgba(56,25,50,0.25)",
            }}
          >
            <Plus size={16} />
            {activeTab === "payroll" ? "Run Payroll" : "Record Payment"}
          </button>
        </div>

        {/* ── Fees Tab ── */}
        {activeTab === "fees" && (
          <div
            className="rounded-[24px] overflow-hidden border flex flex-col"
            style={{
              background: "white",
              borderColor: "rgba(56,25,50,0.07)",
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: `1px solid rgba(56,25,50,0.06)` }}>
                    {["Student", "Admission", "Amount", "Paid", "Balance", "Date", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[10px] font-black uppercase tracking-widest"
                        style={{ color: MUTED }}
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
                      className="hover:bg-[#FFF3E6]/40 transition-colors border-b last:border-0"
                      style={{ borderColor: "rgba(56,25,50,0.04)" }}
                    >
                      <td className="px-6 py-4">
                        <span style={{ color: PLUM, fontSize: "0.85rem", fontWeight: 700 }}>{r.student_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: MUTED, fontSize: "0.72rem", fontWeight: 600 }}>{r.admission_no}</span>
                      </td>
                      {[r.amount, r.paid_amount, (r.amount - r.paid_amount)].map((v, i) => (
                        <td key={i} className="px-6 py-4">
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              color: i === 2 && v > 0 ? "#EF4444" : PLUM,
                              fontSize: "0.8rem",
                              fontWeight: i === 2 && v > 0 ? 800 : 600,
                            }}
                          >
                            ₵{v.toLocaleString()}
                          </span>
                        </td>
                      ))}
                      <td className="px-6 py-4">
                        <span style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>{r.date}</span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "rgba(56,25,50,0.06)" }}>
              <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>Showing {filtered.length} transactions</p>
              <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" style={{ color: PLUM_LIGHT }}>
                <Download size={13} /> Export CSV
              </button>
            </div>
          </div>
        )}

        {/* ── Payroll Tab ── */}
        {activeTab === "payroll" && (
          <div
            className="rounded-[24px] overflow-hidden border flex flex-col"
            style={{
              background: "white",
              borderColor: "rgba(56,25,50,0.07)",
              boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: `1px solid rgba(56,25,50,0.06)` }}>
                    {["Staff Member", "Role", "Salary", "Status", "Action"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-[10px] font-black uppercase tracking-widest"
                        style={{ color: MUTED }}
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
                      className="hover:bg-[#FFF3E6]/40 transition-colors border-b last:border-0"
                      style={{ borderColor: "rgba(56,25,50,0.04)" }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px]"
                            style={{ background: `rgba(56,25,50,0.08)`, color: PLUM }}
                          >
                            {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                          <span style={{ color: PLUM, fontSize: "0.85rem", fontWeight: 700 }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>{p.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", color: PLUM, fontSize: "0.8rem", fontWeight: 800 }}>₵{p.salary.toLocaleString()}</span>
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
                          className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-transform"
                          style={{
                            background: p.paid ? `rgba(56,25,50,0.06)` : PLUM,
                            color: p.paid ? MUTED : MILK,
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

        {/* ── Analytics Tab ── */}
        {activeTab === "analytics" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div
              className="p-6 rounded-[24px] border"
              style={{
                background: "white",
                borderColor: "rgba(56,25,50,0.07)",
                boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
              }}
            >
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1.05rem", marginBottom: "1.5rem" }}>
                Revenue vs Target
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(56,25,50,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: MUTED, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: MUTED, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ background: "white", border: `1px solid rgba(56,25,50,0.1)`, borderRadius: 12, fontSize: 11, fontWeight: 600 }}
                    formatter={(v) => [`₵${v.toLocaleString()}`]}
                  />
                  <Bar dataKey="target" fill="rgba(56,25,50,0.08)" radius={[4, 4, 0, 0]} barSize={16} name="Target" />
                  <Bar dataKey="collected" fill={PLUM} radius={[4, 4, 0, 0]} barSize={16} name="Collected" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div
              className="p-6 rounded-[24px] border"
              style={{
                background: "white",
                borderColor: "rgba(56,25,50,0.07)",
                boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
              }}
            >
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: PLUM, fontWeight: 800, fontSize: "1.05rem", marginBottom: "1.5rem" }}>
                Fee Status
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "white", border: `1px solid rgba(56,25,50,0.1)`, borderRadius: 12, fontSize: 11, fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                    <span style={{ color: MUTED, fontSize: "0.7rem", fontWeight: 700 }}>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md bg-white rounded-[40px] shadow-2xl relative z-10 overflow-hidden border">
              <div className="p-8 pb-4 flex justify-between items-center">
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 800, color: PLUM }}>Record Payment</h2>
                  <p style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>Financial Ledger Entry</p>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center"><X size={20} color={MUTED} /></button>
              </div>
              <div className="p-8 pt-4 space-y-4">
                {[
                  { label: "Student Name / ID", placeholder: "e.g. Ama Owusu" },
                  { label: "Amount Received (₵)", placeholder: "e.g. 1800" },
                  { label: "Reference", placeholder: "e.g. TXN-8219" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: MUTED }}>{f.label}</label>
                    <input placeholder={f.placeholder} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-plum/30 transition-all" style={{ color: PLUM }} />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest mb-1.5 block ml-1" style={{ color: MUTED }}>Method</label>
                  <select className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-plum/30 transition-all" style={{ color: PLUM }}>
                    {["Cash", "Bank Transfer", "Paystack", "Flutterwave"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-8 bg-slate-50 flex gap-3">
                <Button className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest" onClick={() => setShowModal(false)}>Post Transaction</Button>
                <Button variant="secondary" className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-slate-200" onClick={() => setShowModal(false)}>Discard</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeeManagement;
