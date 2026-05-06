import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Banknote, 
  Plus, 
  Search, 
  CheckCircle2, 
  History, 
  Activity,
  MoreVertical,
  Filter
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';

const PLUM = "#381932";
const PLUM_LIGHT = "#512b4a";
const MILK = "#FFF3E6";
const MUTED = "#7D6077";

const Payroll = ({ onNavigate }) => {
  const [activeItem, setActiveItem] = useState('payroll');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
        {/* Metric Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="p-5 rounded-[24px] border"
              style={{
                background: "white",
                borderColor: "rgba(56,25,50,0.07)",
                boxShadow: "0 4px 24px rgba(56,25,50,0.06)",
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
                  color: PLUM,
                  fontSize: "1.4rem",
                  fontWeight: 700,
                }}
              >
                {s.prefix}{s.value.toLocaleString()}
              </div>
              <div style={{ color: MUTED, fontSize: "0.75rem", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="flex-1 flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 shadow-sm max-w-md">
              <Search size={16} color={MUTED} />
              <input 
                placeholder="Search staff payroll..."
                className="bg-transparent border-none outline-none text-sm font-medium w-full"
                style={{ color: PLUM }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <button className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-plum text-milk shadow-lg shadow-plum/20">
              <Plus size={16} /> Run Payroll
           </button>
        </div>

        {/* Table Hub */}
        <div className="bg-white border rounded-[32px] overflow-hidden shadow-sm" style={{ borderColor: "rgba(56,25,50,0.07)" }}>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr style={{ background: "rgba(56,25,50,0.02)" }}>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED }}>Staff Member</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED }}>Gross</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED }}>Deductions</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED }}>Net Payable</th>
                       <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED }}>Status</th>
                       <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED }}>Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {payrollData.map((p) => (
                       <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px]" style={{ background: PLUM, color: MILK }}>{p.name.substring(0, 2).toUpperCase()}</div>
                                <div>
                                   <div style={{ color: PLUM, fontSize: "0.85rem", fontWeight: 800 }}>{p.name}</div>
                                   <div style={{ color: MUTED, fontSize: "0.7rem", fontWeight: 600 }}>{p.role}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-black" style={{ color: PLUM }}>₵{(p.base + p.allowance).toLocaleString()}</td>
                          <td className="px-6 py-5 text-sm font-bold text-rose-500">-₵{(p.base * 0.15).toFixed(0)}</td>
                          <td className="px-6 py-5 text-sm font-black" style={{ color: PLUM }}>₵{(p.base + p.allowance - p.base * 0.15).toLocaleString()}</td>
                          <td className="px-6 py-5">
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {p.status}
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button className="text-slate-300 hover:text-plum transition-colors"><MoreVertical size={18} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Payroll;
