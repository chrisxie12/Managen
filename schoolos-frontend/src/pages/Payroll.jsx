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
import { useAuth } from '../contexts/AuthContext';
import { buildUrl, getHeaders, handleApiError } from '../services/api';

const Payroll = () => {
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();
  const { authSession } = useAuth();
  
  const [payroll, setPayroll] = useState([]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch(buildUrl('/api/school/payroll'), {
        headers: getHeaders(authSession?.token),
        credentials: 'include'
      });
      const json = await res.json();
      if (res.ok) {
        setPayroll(json.data.payroll || []);
      } else {
        throw new Error(json.error || 'Failed to load payroll');
      }
    } catch (err) {
      showToast({ title: 'Sync Error', message: err.message, type: 'error' });
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleRunPayroll = async () => {
    try {
      const res = await fetch(buildUrl('/api/school/payroll/run'), {
        method: 'POST',
        headers: getHeaders(authSession?.token),
        credentials: 'include'
      });
      if (res.ok) {
        fetchPayroll();
        showToast({
          title: 'Payroll Processed',
          message: 'Salary disbursements have been initiated for all staff.',
          type: 'success'
        });
      } else {
        const error = await handleApiError(res);
        throw new Error(error);
      }
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    }
  };

  const stats = [
    { label: 'Total Volume', value: 124500, icon: Banknote, color: '#6366F1', prefix: '₵' },
    { label: 'Staff Paid', value: 42, icon: CheckCircle2, color: '#10B981' },
    { label: 'Processing', value: 8, icon: History, color: '#F59E0B' },
    { label: 'Statutory Dues', value: 18200, icon: Activity, color: '#EC4899', prefix: '₵' },
  ];

  const filteredPayroll = payroll.filter(p => 
    (p.staff_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="mb-2">
         <h1 style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-primary)", fontSize: "1.8rem", fontWeight: 800 }}>Faculty Payroll</h1>
         <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 600 }}>Institutional salary disbursement and statutory contribution tracking</p>
      </div>

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
         <button 
           onClick={handleRunPayroll}
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
                     <th className="px-8 py-5 text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Staff Member</th>
                     <th className="px-6 py-5 text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Gross</th>
                     <th className="px-6 py-5 text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Deductions</th>
                     <th className="px-6 py-5 text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Net Payable</th>
                     <th className="px-6 py-5 text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Status</th>
                     <th className="px-8 py-5 text-right text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Actions</th>
                  </tr>
               </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                   {filteredPayroll.map((p) => (
                      <tr key={p.id} className="hover:bg-black/[0.02] transition-colors">
                         <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                               <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs bg-plum text-milk">{(p.staff_name || 'S').substring(0, 2).toUpperCase()}</div>
                               <div>
                                  <div style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 800 }}>{p.staff_name}</div>
                                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontWeight: 600 }}>{p.role || 'Staff'}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-5 text-sm font-black" style={{ color: "var(--text-primary)" }}>₵{(p.base_salary + p.allowances).toLocaleString()}</td>
                         <td className="px-6 py-5 text-sm font-bold text-rose-500">-₵{p.deductions.toLocaleString()}</td>
                         <td className="px-6 py-5 text-sm font-black" style={{ color: "var(--text-primary)" }}>₵{p.net_salary.toLocaleString()}</td>
                         <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest ${p.status === 'Paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                               {p.status}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                            <button 
                              onClick={() => {
                                showToast({
                                  title: 'Record Access',
                                  message: `Opening digital ledger for ${p.staff_name}.`,
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
                   {filteredPayroll.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-8 py-12 text-center text-xs font-bold" style={{ color: "var(--text-muted)" }}>No payroll records found.</td>
                      </tr>
                   )}
                </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default Payroll;
