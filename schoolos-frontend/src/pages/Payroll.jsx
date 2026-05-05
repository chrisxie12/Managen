import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { 
  Banknote, 
  Plus, 
  FileDown, 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  CreditCard,
  TrendingUp,
  Activity,
  History,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import { Button } from '../components/ui/Button';
import { SkeletonLoader } from '../components/ui/SkeletonLoader';
import { EmptyState } from '../components/ui/EmptyState';

// Count Up Component
const CountUp = ({ value, prefix = "", suffix = "" }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [springValue]);

  return (
    <span>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};

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
    { label: 'Total Payroll', value: 124500, icon: Banknote, color: 'text-accent-primary', bg: 'bg-accent-primary/10', prefix: '₵' },
    { label: 'Staff Paid', value: 42, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending Disbursement', value: 8, icon: History, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Statutory Dues', value: 18200, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10', prefix: '₵' },
  ];

  const payrollData = [
    { id: 1, name: 'Mrs. Abena Mensah', role: 'Head Teacher', base: 4500, allowance: 500, status: 'Paid', date: 'May 1, 2026' },
    { id: 2, name: 'Mr. Kofi Asante', role: 'Senior Teacher', base: 3800, allowance: 200, status: 'Paid', date: 'May 1, 2026' },
    { id: 3, name: 'Mrs. Akosua Boateng', role: 'Teacher', base: 3200, allowance: 150, status: 'Processing', date: 'May 2, 2026' },
    { id: 4, name: 'Mr. Kwame Osei', role: 'Accountant', base: 4000, allowance: 300, status: 'Pending', date: 'May 2, 2026' },
  ];

  return (
    <div className="min-h-screen bg-white">
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

      <main className="md:ml-[280px] pt-20 p-8 text-text-primary">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-accent-primary/10 rounded-xl flex items-center justify-center text-accent-primary">
                <Banknote size={24} />
              </div>
              <h1 className="text-3xl font-black tracking-tight font-headings">Payroll</h1>
            </div>
            <p className="text-text-muted text-sm font-medium tracking-tight">Staff compensation, statutory deductions, and disbursement management.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" className="px-5 border-slate-100">
              <FileDown size={18} className="mr-2" /> Payslips
            </Button>
            <Button className="px-5 shadow-lg shadow-accent-primary/15">
              <Plus size={18} className="mr-2" /> Run Payroll
            </Button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-50 rounded-[28px] p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:rotate-6 transition-transform`}>
                  <stat.icon size={26} />
                </div>
                <div>
                  <div className="text-2xl font-black text-text-primary tracking-tight leading-none mb-1">
                    <CountUp value={stat.value} prefix={stat.prefix} />
                  </div>
                  <div className="text-[10px] font-black text-text-muted uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Table */}
        <div className="bg-white border border-slate-50 rounded-[40px] shadow-sm overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-50/30">
              <div className="flex flex-1 max-w-md relative w-full">
                 <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                 <input 
                    placeholder="Search by staff name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold outline-none focus:border-accent-primary/20 shadow-sm"
                 />
              </div>

              <div className="flex items-center gap-3">
                 <select className="bg-white border border-slate-100 rounded-xl px-5 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest outline-none shadow-sm appearance-none min-w-[140px]">
                    <option>May 2026</option>
                    <option>April 2026</option>
                 </select>
                 <Button variant="secondary" className="h-11 px-5 border-slate-100 shadow-sm">
                    <Filter size={16} className="mr-2" /> Filter
                 </Button>
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-8 py-5">Staff Member</th>
                       <th className="px-6 py-5">Base Salary</th>
                       <th className="px-6 py-5">Allowances</th>
                       <th className="px-6 py-5">Deductions</th>
                       <th className="px-6 py-5">Net Payable</th>
                       <th className="px-6 py-5">Payment Status</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {loading ? (
                       Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i}>
                             <td className="px-8 py-6">
                                <div className="flex items-center gap-3">
                                   <SkeletonLoader width="36px" height="36px" borderRadius="999px" />
                                   <SkeletonLoader width="140px" height="14px" />
                                </div>
                             </td>
                             <td className="px-6 py-6"><SkeletonLoader width="80px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="70px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="70px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="80px" height="14px" /></td>
                             <td className="px-6 py-6"><SkeletonLoader width="90px" height="24px" borderRadius="99px" /></td>
                             <td className="px-8 py-6 text-right"><SkeletonLoader width="32px" height="32px" borderRadius="8px" className="ml-auto" /></td>
                          </tr>
                       ))
                    ) : (
                       payrollData.map((p, i) => {
                          const deductions = p.base * 0.15; // Mock 15% deductions
                          const net = p.base + p.allowance - deductions;
                          return (
                          <motion.tr 
                            key={p.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.03 }}
                            className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                          >
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-accent-primary border border-slate-100">
                                      {p.name.substring(0, 2).toUpperCase()}
                                   </div>
                                   <div>
                                      <div className="text-sm font-bold text-text-primary group-hover:text-accent-primary transition-colors">{p.name}</div>
                                      <div className="text-[10px] font-bold text-slate-400">{p.role}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-5 text-sm font-black text-text-primary tracking-tight">₵{p.base}</td>
                             <td className="px-6 py-5 text-sm font-bold text-emerald-500 tracking-tight">+₵{p.allowance}</td>
                             <td className="px-6 py-5 text-sm font-bold text-rose-500 tracking-tight">-₵{deductions.toFixed(0)}</td>
                             <td className="px-6 py-5 text-sm font-black text-text-primary tracking-tight">₵{net.toFixed(0)}</td>
                             <td className="px-6 py-5">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                   p.status === 'Paid' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                   p.status === 'Processing' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                                   'bg-rose-50 border-rose-100 text-rose-600'
                                }`}>
                                   {p.status}
                                </div>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-text-primary hover:bg-white hover:shadow-sm transition-all"><MoreVertical size={16} /></button>
                             </td>
                          </motion.tr>
                       )})
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
};

export default Payroll;
