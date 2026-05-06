import React, { useState, useEffect } from 'react';
import { 
  Banknote, 
  Plus, 
  Search, 
  CheckCircle2, 
  History, 
  Activity,
  MoreVertical
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

const Payroll = () => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'Total Volume', value: 124500, icon: Banknote, color: '#6366F1', prefix: '₵' },
    { label: 'Staff Paid', value: 42, icon: CheckCircle2, color: '#10B981' },
    { label: 'Processing', value: 8, icon: History, color: '#F59E0B' },
    { label: 'Statutory Dues', value: 18200, icon: Activity, color: '#EC4899', prefix: '₵' },
  ];

  const payrollData = [
    { id: 1, name: 'Mrs. Abena Mensah', role: 'Head Teacher', base: 4500, allowance: 500, status: 'Paid', date: 'May 1, 2026' },
    { id: 2, name: 'Mr. Kofi Asante', role: 'Senior Teacher', base: 3800, allowance: 200, status: 'Paid', date: 'May 1, 2026' },
    { id: 3, name: 'Mrs. Akosua Boateng', role: 'Teacher', base: 3200, allowance: 150, status: 'Processing', date: 'May 2, 2026' },
    { id: 4, name: 'Mr. Kwame Osei', role: 'Accountant', base: 4000, allowance: 300, status: 'Pending', date: 'May 2, 2026' },
  ];

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6">
      {/* Metric Row */}
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
              {s.prefix}{s.value.toLocaleString()}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
         <div className="flex-1 flex items-center gap-3 border rounded-2xl px-4 py-3 shadow-sm max-w-md group" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
            <Search size={16} style={{ color: "var(--text-muted)" }} className="group-focus-within:scale-110 transition-transform" />
            <input 
              placeholder="Search staff payroll..."
              className="bg-transparent border-none outline-none text-sm font-medium w-full"
              style={{ color: "var(--text-primary)" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>
         <button 
           onClick={() => {
             showToast({
               title: 'Payroll Initiated',
               message: 'The institutional salary batch is being processed for disbursement.',
               type: 'info'
             });
           }}
           className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk shadow-lg shadow-plum/20"
         >
            <Plus size={16} /> Run Payroll
         </button>
      </div>

      {/* Table Hub */}
      <div className="border rounded-[32px] overflow-hidden shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr style={{ background: "var(--bg-secondary)" }}>
                     <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Staff Member</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Gross</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Deductions</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Net Payable</th>
                     <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Status</th>
                     <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {payrollData.map((p) => (
                     <tr key={p.id} className="hover:bg-black/[0.02] transition-colors">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] bg-plum text-milk">{p.name.substring(0, 2).toUpperCase()}</div>
                              <div>
                                 <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 800 }}>{p.name}</div>
                                 <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600 }}>{p.role}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-black" style={{ color: "var(--text-primary)" }}>₵{(p.base + p.allowance).toLocaleString()}</td>
                        <td className="px-6 py-5 text-sm font-bold text-rose-500">-₵{(p.base * 0.15).toFixed(0)}</td>
                        <td className="px-6 py-5 text-sm font-black" style={{ color: "var(--text-primary)" }}>₵{(p.base + p.allowance - p.base * 0.15).toLocaleString()}</td>
                        <td className="px-6 py-5">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                              {p.status}
                           </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button 
                             onClick={() => {
                               showToast({
                                 title: 'Record Access',
                                 message: `Opening digital ledger for ${p.name}.`,
                                 type: 'info'
                               });
                             }}
                             className="p-2 hover:bg-black/5 rounded-lg transition-colors"
                           >
                             <MoreVertical size={18} style={{ color: "var(--text-muted)" }} />
                           </button>
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

export default Payroll;
