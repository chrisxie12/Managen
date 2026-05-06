import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  Search, 
  Download, 
  Smartphone,
  ChevronRight,
  TrendingDown,
  CreditCard
} from 'lucide-react';

const AccountantDashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Total Revenue', value: 'USD 482,500', icon: Wallet, color: '#6366F1', sub: '+12.4%' },
    { label: 'Collections', value: 'USD 312,400', icon: TrendingUp, color: '#10B981', sub: '+8.2%' },
    { label: 'Outstanding', value: 'USD 170,100', icon: AlertCircle, color: '#EF4444', sub: '-2.1%' },
    { label: 'Operational', value: 'USD 89,400', icon: TrendingDown, color: '#F59E0B', sub: '+4.2%' },
  ];

  const recentTransactions = [
    { id: 1, student: 'Ama Mensah', type: 'Tuition Fee', amount: 2400, date: '10 mins ago', status: 'Success', method: 'MTN MoMo' },
    { id: 2, student: 'Kofi Asante', type: 'Bus Fee', amount: 450, date: '25 mins ago', status: 'Success', method: 'Cash' },
    { id: 3, student: 'Adwoa Boateng', type: 'Tuition Fee', amount: 1800, date: '1 hour ago', status: 'Pending', method: 'Bank' },
    { id: 4, student: 'Kwame Osei', type: 'Library Fine', amount: 25, date: '3 hours ago', status: 'Success', method: 'Cash' },
  ];

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6">
      <div className="mb-2">
         <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800 }}>Financial Command</h1>
         <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Institutional revenue auditing and ledger management node</p>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="p-5 rounded-[24px] border"
            style={{
              background: "var(--card-bg)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ background: `${s.color}15` }}
            >
              <s.icon size={16} color={s.color} />
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--text-primary)",
                fontSize: "1.4rem",
                fontWeight: 700,
              }}
            >
              {s.value}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: "0.75rem", marginTop: "0.25rem", fontWeight: 700 }}>{s.sub} vs last month</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Analytics Hub */}
        <div
          className="lg:col-span-2 rounded-[32px] p-8 border flex flex-col gap-6"
          style={{
            background: "var(--card-bg)",
            borderColor: "var(--border)",
            boxShadow: "var(--shadow-card)",
          }}
        >
           <div className="flex justify-between items-center">
              <div>
                 <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.1rem" }}>Financial Pulse</h3>
                 <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>Real-time Revenue Collection Tracker</p>
              </div>
              <div className="flex gap-2">
                 <div className="px-3 py-1.5 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                    <div className="w-2 h-2 rounded-full bg-plum" /> Projection
                 </div>
                 <div className="px-3 py-1.5 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase" style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Actual
                 </div>
              </div>
           </div>

           <div className="flex-1 min-h-[300px] flex items-end justify-between gap-4 px-4 pb-4">
              {[45, 62, 58, 85, 72, 94, 78, 88].map((v, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group">
                    <div className="w-full flex items-end gap-1 h-full">
                       <div className="flex-1 bg-black/[0.02] rounded-t-lg group-hover:bg-black/[0.05] transition-colors" style={{ height: `${v}%` }} />
                       <div className="flex-1 rounded-t-lg transition-all shadow-sm bg-plum" style={{ height: `${v * 0.8}%` }} />
                    </div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 800, textTransform: "uppercase" }}>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}</span>
                 </div>
              ))}
           </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="flex flex-col gap-6">
           <div className="rounded-[32px] p-8 text-milk flex flex-col gap-6 shadow-xl shadow-plum/10 bg-plum">
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 800 }}>Cashier Portal</h3>
              <div className="space-y-3">
                 <button className="w-full py-4 rounded-2xl bg-milk text-plum text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                    <Smartphone size={16} /> Mobile Money API
                 </button>
                 <button className="w-full py-4 rounded-2xl border border-white/20 text-milk text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                    <Download size={16} /> Batch Receipts
                 </button>
              </div>
           </div>

           <div className="flex-1 rounded-[32px] p-8 border" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1rem", marginBottom: "1.2rem" }}>Recent Alerts</h3>
              <div className="space-y-4">
                 {[
                    { title: "Defaulter List", sub: "42 students flagged", color: "#EF4444" },
                    { title: "Bank Reconciliation", sub: "12 pending entries", color: "#10B981" },
                    { title: "Payroll Audit", sub: "Ready for review", color: "#F59E0B" },
                 ].map((a, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-black/5 transition-all cursor-pointer border border-transparent hover:border-plum/10" style={{ background: "var(--bg-secondary)" }}>
                       <div className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                       <div>
                          <p style={{ color: "var(--text-primary)", fontSize: "0.8rem", fontWeight: 700 }}>{a.title}</p>
                          <p style={{ color: "var(--text-muted)", fontSize: "0.65rem", fontWeight: 600 }}>{a.sub}</p>
                       </div>
                       <ChevronRight size={14} style={{ color: "var(--text-muted)" }} className="ml-auto" />
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Live Ledger Table */}
      <div
        className="rounded-[32px] overflow-hidden border flex flex-col"
        style={{
          background: "var(--card-bg)",
          borderColor: "var(--border)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
           <h3 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontWeight: 800, fontSize: "1.05rem" }}>Live Financial Ledger</h3>
           <div className="flex items-center gap-4">
              <div className="relative group">
                 <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:scale-110 transition-transform" style={{ color: "var(--text-muted)" }} />
                 <input placeholder="Receipt ID..." className="border rounded-xl py-2 pl-9 pr-4 text-[10px] font-black uppercase outline-none transition-all" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)", borderColor: "var(--border)" }} />
              </div>
              <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest hover:opacity-70" style={{ color: "var(--text-primary)" }}><Download size={13} /> Export Ledger</button>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ borderBottom: `1px solid var(--border)`, background: "var(--bg-secondary)" }}>
                {["Student / Entity", "Transaction", "Amount", "Method", "Date", "Status"].map((h) => (
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
              {recentTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-black/[0.02] transition-colors border-b last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="px-6 py-4">
                     <span style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 700 }}>{tx.student}</span>
                  </td>
                  <td className="px-6 py-4">
                     <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-plum/5 text-plum">{tx.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 800 }}>USD {tx.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <CreditCard size={12} style={{ color: "var(--text-muted)" }} />
                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>{tx.method}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>{tx.date}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest"
                      style={tx.status === 'Success' 
                        ? { background: "#D1FAE5", color: "#065F46" } 
                        : { background: "#FEF3C7", color: "#92400E" }}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;

